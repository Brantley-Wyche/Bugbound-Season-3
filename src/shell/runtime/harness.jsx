import { Component as ReactComponent, createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const cancel = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, ms);
    signal.addEventListener('abort', cancel, { once: true });
  });
}

/** Catches render-phase crashes in the component under test so a broken
 *  level produces a readable check failure instead of a blank page. */
class CheckBoundary extends ReactComponent {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    this.props.onError(error);
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}

function makeHelpers(host, getCrash, signal) {
  const settle = (ms) => pause(ms, signal);
  const crashMessage = () => {
    const crash = getCrash();
    return crash ? String(crash.message || crash) : null;
  };

  const resolve = (target) => {
    signal.throwIfAborted();
    if (typeof target !== 'string') return target;
    const el = host.querySelector(target);
    if (!el) {
      const crash = crashMessage();
      throw new Error(
        crash
          ? `Could not find ${target} — the component crashed while rendering: ${crash}`
          : `Expected to find ${target} in the rendered output, but it isn't there.`,
      );
    }
    return el;
  };

  const setNativeValue = (el, value) => {
    const proto = Object.getPrototypeOf(el);
    const descriptor =
      Object.getOwnPropertyDescriptor(proto, 'value') ||
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor.set.call(el, value);
  };

  return {
    pause: settle,

    async waitFor(assertion, { timeout = 3000, interval = 25 } = {}) {
      const deadline = Date.now() + timeout;
      let failure;
      do {
        signal.throwIfAborted();
        try {
          const value = await assertion();
          if (value !== false) return value;
          failure = new Error('Expected condition was not ready.');
        } catch (error) { failure = error; }
        if (Date.now() >= deadline) throw failure;
        await settle(interval);
      } while (!signal.aborted);
      signal.throwIfAborted();
    },

    ok(condition, message) {
      if (!condition) throw new Error(message);
    },

    ensureNoCrash() {
      const crash = crashMessage();
      if (crash) throw new Error(`The component crashed while rendering: ${crash}`);
    },

    get: resolve,
    query: (selector) => host.querySelector(selector),
    all: (selector) => [...host.querySelectorAll(selector)],
    text: (target) => resolve(target).textContent.trim(),
    value: (target) => resolve(target).value,
    attr: (target, name) => resolve(target).getAttribute(name),

    async click(target) {
      resolve(target).click();
      await settle(25);
    },

    /** Types character-by-character through the native value setter so
     *  React's synthetic onChange fires exactly like real user input. */
    async type(target, textToType) {
      const el = resolve(target);
      for (const ch of textToType) {
        setNativeValue(el, el.value + ch);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await settle(5);
      }
      await settle(25);
    },

    async selectOption(target, optionValue) {
      const el = resolve(target);
      setNativeValue(el, optionValue);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await settle(25);
    },
  };
}

function Ready({ onReady, children }) {
  useEffect(onReady, [onReady]);
  return children;
}

/** Runs inside a disposable exercise frame. Success includes rendering and teardown. */
export async function runCheck(Target, check, { signal, timeoutMs = 15000 } = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const controller = new AbortController();
  const cancel = () => controller.abort(signal.reason || new Error('Check cancelled.'));
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel();
  const deadline = setTimeout(() => controller.abort(new Error('Check timed out before it finished.')), timeoutMs);
  let crash = null;
  let failure = null;
  const capture = (error) => {
    crash ||= error instanceof Error ? error : new Error(String(error));
    controller.abort(crash);
  };
  const onError = (event) => capture(event.error || event.message);
  const onRejection = (event) => capture(event.reason);
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);
  const root = createRoot(host, { onUncaughtError: capture });
  let onAbort;
  const aborted = new Promise((_, reject) => {
    onAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener('abort', onAbort, { once: true });
  });
  // A signal already aborted before setup must also reject the race.
  if (controller.signal.aborted) onAbort();
  try {
    const ready = new Promise((resolve) => {
      root.render(createElement(CheckBoundary, { onError: capture },
        createElement(Ready, { onReady: () => { resolve(); } }, createElement(Target))));
    });
    await Promise.race([ready, aborted]);
    if (crash) throw crash;
    await Promise.race([Promise.resolve().then(() => check.run(makeHelpers(host, () => crash, controller.signal))), aborted]);
  } catch (err) {
    failure = err;
  } finally {
    try {
      root.unmount();
      // React may report an effect-cleanup failure through the root error callback.
      await new Promise((resolve) => setTimeout(resolve, 0));
    } catch (error) { failure ||= error; }
    finally {
      host.remove();
      clearTimeout(deadline);
      signal?.removeEventListener('abort', cancel);
      controller.signal.removeEventListener('abort', onAbort);
      controller.abort(new Error('Check disposed.'));
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    }
  }
  const error = failure || crash;
  return error
    ? { name: check.name, pass: false, message: String(error?.message || error) }
    : { name: check.name, pass: true };
}
