export const exerciseFramePath = () => `${import.meta.env?.BASE_URL || '/'}exercise.html`;

export function frameAddress(path, levelId, channel, mode, base, index = 0, timeoutMs = 15000) {
  const url = new URL(path, base);
  url.search = new URLSearchParams({ id: levelId, channel, mode, check: String(index), timeout: String(timeoutMs) }).toString();
  return url.href;
}

/** One frame, one check, one result. A fresh realm prevents shared module state. */
export function runExerciseCheck(levelId, index, {
  signal, timeoutMs = 20000, name = 'Check', frameUrl = exerciseFramePath(),
  win = window, doc = document,
} = {}) {
  return new Promise((resolve) => {
    const frame = doc.createElement('iframe');
    const channel = crypto.randomUUID();
    let done = false;
    let timer;
    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', cancel);
      win.removeEventListener('message', receive);
      frame.remove();
      resolve({ name, ...result });
    };
    const cancel = () => finish({ pass: false, message: 'Check cancelled.' });
    const receive = (event) => {
      if (event.source !== frame.contentWindow || event.origin !== win.location.origin || event.data?.channel !== channel) return;
      if (event.data.type === 'error') finish({ pass: false, message: String(event.data.message || 'Exercise could not load.') });
      if (event.data.type === 'result' && typeof event.data.result?.pass === 'boolean') {
        const { pass, message } = event.data.result;
        finish(pass ? { pass } : { pass, message: String(message || 'Behavioral check failed.') });
      }
    };
    frame.title = 'Isolated behavioral check';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('inert', '');
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:900px;height:600px;border:0;';
    frame.src = frameAddress(frameUrl, levelId, channel, 'check', win.location.href, index, Math.min(15000, timeoutMs));
    win.addEventListener('message', receive);
    signal?.addEventListener('abort', cancel, { once: true });
    timer = setTimeout(() => finish({ pass: false, message: 'Check timed out while loading or running the exercise.' }), timeoutMs);
    if (signal?.aborted) { cancel(); return; }
    doc.body.appendChild(frame);
  });
}
