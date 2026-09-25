/** Owns one visit's check sequence and its disposable execution lifetime. */
export function createCheckSession({ checks, runCheck, onStart, onProgress, onComplete }) {
  let active = true;
  let running = false;
  let controller = null;

  return {
    abandon() {
      active = false;
      controller?.abort();
    },

    async run() {
      if (!active || running) return null;
      running = true;
      controller = new AbortController();

      try {
        onStart?.();
        const results = [];

        for (const check of checks) {
          if (!active) return null;
          let result;
          try {
          result = await runCheck(check, { signal: controller.signal, index: results.length });
          } catch (error) {
            result = { name: check.name, pass: false, message: String(error?.message || error) };
          }
          if (!active) return null;
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
