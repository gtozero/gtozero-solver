/*
 * 계산 시간 어림 (MB-636 ① · 2026-11-23) — 화면 없는 순수 함수.
 *
 * 근거(실측):
 * - 1회 반복 시간 ≈ 2.0ms × 트리 메모리(MB, 32비트 기준) ÷ 스레드 효과.
 *   크롬 1스레드 319MB 608ms/회(1.9) · Node 벤치 도구/bench/results 1.65(0.3~0.6GB)~2.4(4~8GB, 16비트).
 * - 스레드 효과 = t ÷ (1 + 0.075(t−1)): 같은 트리 4스레드 156ms(3.9배) · 12스레드 92ms(6.6배) — 이 PC(논리 12).
 * - 목표 오차까지 반복 수 ≈ 95 × 목표%^(−2/3): 1% ≈ 95회(벤치 80~110) · 0.3% ≈ 212회
 *   (사전 계산 헤더 SRP 160~270 · 3벳 팟 80~180 — 깊은 팟 쪽으로 맞춘 어림).
 * - 폰은 같은 스레드 수에서 대략 2배 느리다고 본다(실측 없음 — 그래서 화면 문구에 «기기에 따라 다름»).
 * 계산 중 «남은 시간»은 뺐다(11-23 실측 · 오차 곡선이 뒤쪽에 정체해 크게 틀림 · RunSolver.vue 주석).
 */

const MS_PER_MB_ITERATION = 2.0;
const COMPRESSED_FACTOR = 1.15;
const MOBILE_FACTOR = 2;
const ITERATIONS_AT_1PCT = 95;

export const threadSpeedup = (threads: number) => {
  const t = Math.max(1, Math.floor(threads) || 1);
  return t / (1 + 0.075 * (t - 1));
};

export const expectedIterations = (targetPct: number, maxIterations: number) => {
  if (!(targetPct > 0)) return maxIterations;
  return Math.min(maxIterations, Math.ceil(ITERATIONS_AT_1PCT * Math.pow(targetPct, -2 / 3)));
};

export type SolveEstimateInput = {
  /** 32비트(비압축) 트리 메모리 바이트 — 16비트를 골라도 이 값으로 잰다 */
  uncompressedBytes: number;
  compressed: boolean;
  threads: number;
  targetPct: number;
  maxIterations: number;
  mobile: boolean;
};

/** 실행 전 어림(ms). 입력이 이상하면 null */
export const estimateSolveMs = (input: SolveEstimateInput): number | null => {
  const mb = input.uncompressedBytes / (1024 * 1024);
  if (!(mb > 0) || !(input.maxIterations >= 0)) return null;
  const perIteration =
    (MS_PER_MB_ITERATION * mb * (input.compressed ? COMPRESSED_FACTOR : 1) * (input.mobile ? MOBILE_FACTOR : 1)) /
    threadSpeedup(input.threads);
  return expectedIterations(input.targetPct, input.maxIterations) * perIteration;
};

/** 분 단위 글자 — 1분 안이면 null(«1분 이내»), 10분까지는 1분 단위, 그 위는 5분 단위 */
export const roundedMinutes = (ms: number): number | null => {
  const minutes = ms / 60000;
  if (minutes < 1) return null;
  return minutes < 10 ? Math.round(minutes) : Math.round(minutes / 5) * 5;
};

export const isMobileDevice = () => {
  try {
    const data = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
    if (data && typeof data.mobile === "boolean") return data.mobile;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  } catch {
    return false;
  }
};
