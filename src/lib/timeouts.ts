export function getAnalyzeTimeoutMs(): number {
  const raw = process.env.ANALYZE_TIMEOUT_MS;
  const n = raw ? Number(raw) : 45000;
  return Number.isFinite(n) && n > 0 ? n : 45000;
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = "operation",
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err: unknown) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
