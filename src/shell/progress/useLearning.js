import { useSyncExternalStore } from 'react';
import { getLearningSnapshot, subscribeLearning } from './learning.js';

/** The learner's readings in this browser: { store, error }. Updates on every write and across tabs. */
export function useLearning() {
  return useSyncExternalStore(subscribeLearning, getLearningSnapshot, getLearningSnapshot);
}
