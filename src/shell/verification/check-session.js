/** Owns one visit's check sequence and its disposable execution lifetime. */
export function createCheckSession({ checks, runCheck, onStart, onProgress, onComplete, onCancel }) {
  let active = true;
  let running = false;
  let cancelled = false;
  let controller = null;

  return {
    abandon() {
      active = false;
      controller?.abort();
    },

    /** Stops the current run; the visit stays usable. Returns whether a run was cancelled. */
    cancel() {
      if (!active || !running || cancelled) return false;
      cancelled = true;
      controller?.abort();
      return true;
    },

    async run() {
      if (!active || running) return null;
      running = true;
      cancelled = false;
      controller = new AbortController();

      try {
        onStart?.();
        const results = [];

        for (const check of checks) {
          if (!active) return null;
          if (cancelled) {
            onCancel?.([...results]);
            return null;
          }
          let result;
          try {
            result = await runCheck(check, { signal: controller.signal, index: results.length });
          } catch (error) {
            result = { name: check.name, pass: false, message: String(error?.message || error) };
          }
          if (!active) return null;
          if (cancelled) {
            onCancel?.([...results]);
            return null;
          }
          results.push(result);
          onProgress?.([...results]);
        }

        if (!active) return null;
        const outcome = {
          results,
          passed: results.length > 0 && results.every((result) => result.pass),
        };
        onComplete?.(outcome);
        return outcome;
      } finally {
        running = false;
        controller = null;
      }
    },
  };
}
