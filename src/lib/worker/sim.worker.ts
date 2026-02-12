// ──────────────────────────────────────────────
// Web Worker entry — runs simulation off main thread
// ──────────────────────────────────────────────

import { simulate, simulateWithCounterfactual } from '../engine/simulate';
import type { MainMessage, WorkerMessage, SimulationInput } from '../engine/types';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<MainMessage>) => {
  const msg = event.data;

  if (msg.type === 'run') {
    try {
      const result = simulate(msg.input, (day, totalDays) => {
        const progressMsg: WorkerMessage = { type: 'progress', day, totalDays };
        self.postMessage(progressMsg);
      });

      const resultMsg: WorkerMessage = { type: 'result', result };
      self.postMessage(resultMsg);
    } catch (err) {
      const errorMsg: WorkerMessage = {
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      };
      self.postMessage(errorMsg);
    }
  }

  if (msg.type === 'run-counterfactual') {
    try {
      const result = simulateWithCounterfactual(msg.input, (day, totalDays) => {
        const progressMsg: WorkerMessage = { type: 'progress', day, totalDays };
        self.postMessage(progressMsg);
      });

      const resultMsg: WorkerMessage = { type: 'counterfactual-result', result };
      self.postMessage(resultMsg);
    } catch (err) {
      const errorMsg: WorkerMessage = {
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
      };
      self.postMessage(errorMsg);
    }
  }
};
