import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createProgressController } from './progress.js';

/**
 * Saved completion for the active cartridge.
 * failure is null or { operation: 'read' | 'save' | 'reset', message }.
 * revision changes after a local or cross-tab reset, so active check sessions can remount.
 */
export function useProgress(levelIds) {
  const idsKey = JSON.stringify(levelIds);
  const controller = useMemo(
    () => createProgressController(JSON.parse(idsKey)),
    [idsKey],
  );
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === null || event.key.startsWith('bugbound:progress:')) controller.reload();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [controller]);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return {
    ...state,
    markComplete: controller.markComplete,
    resetProgress: controller.resetProgress,
    retry: controller.retry,
  };
}
