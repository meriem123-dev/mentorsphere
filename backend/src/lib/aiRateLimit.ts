export const AI_WINDOW_MS = 60 * 60 * 1000; // 1h

export function resolveWindow(windowStart: Date | null, attempts: number) {
  const windowActive = !!windowStart && Date.now() - windowStart.getTime() < AI_WINDOW_MS;
  return {
    attempts: windowActive ? attempts : 0,
    windowStart: windowActive ? windowStart : null,
  };
}

export function computeWindowResetAt(windowStart: Date | null): string | null {
  return windowStart ? new Date(windowStart.getTime() + AI_WINDOW_MS).toISOString() : null;
}