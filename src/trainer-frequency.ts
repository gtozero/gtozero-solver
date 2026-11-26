// GTO 트레이너 «빈도 입력» 연습 — 입력 배분·채점 (설계 참고자료/빈도입력연습_설계안_2026-11-26.md)
// 액션 하나를 고르는 대신, 이 핸드로 각 액션을 몇 % 할지 답한다.
// 입력 = 색으로 나눈 막대 하나 + 경계 손잡이. 채점 = 빈도 일치도(비율 차이)와 EV 손실을 따로 본다.

/** 출시 스위치 — 20언어 문구 판정 뒤에 켠다. 꺼져 있어도 주소에 ?freq 를 붙이면 열린다 */
export const TRAINER_FREQUENCY_LAUNCHED = true;
export const trainerFrequencyEnabled = () => {
  try {
    return (
      TRAINER_FREQUENCY_LAUNCHED || new URLSearchParams(window.location.search).has("freq")
    );
  } catch {
    return TRAINER_FREQUENCY_LAUNCHED;
  }
};

/** 설정은 기기에 기억 (기본 끔) */
const FREQUENCY_MODE_KEY = "trainer-frequency-mode";
export const readFrequencyMode = (): boolean => {
  try {
    return localStorage.getItem(FREQUENCY_MODE_KEY) === "on";
  } catch {
    return false;
  }
};
export const writeFrequencyMode = (on: boolean) => {
  try {
    localStorage.setItem(FREQUENCY_MODE_KEY, on ? "on" : "off");
  } catch {
    /* 저장이 막힌 환경이면 이번 방문에만 적용 */
  }
};

/** 손잡이가 멈추는 간격(%) — 같은 플랍을 다시 풀어도 섞는 핸드의 비율은 8%p쯤 다르다. 더 잘게 받는 것은 거짓 정밀 */
export const FREQUENCY_STEP = 5;
/** 이 차이(%p) 안이면 같은 답으로 본다 — 두 풀이의 섞는 핸드 83%가 이 안에 든다 (실측 2026-11-26) */
export const FREQUENCY_CLOSE_PP = 15;

const snap = (value: number) => Math.round(value / FREQUENCY_STEP) * FREQUENCY_STEP;

/** 처음 경계: 액션 수대로 똑같이 나눈다. 경계는 누적 %이고 (액션 수 − 1)개 */
export const initialCuts = (actionCount: number): number[] => {
  const cuts: number[] = [];
  for (let k = 1; k < actionCount; k++) cuts.push(snap((k * 100) / actionCount));
  return cuts;
};

/** 경계 → 액션별 빈도(%, 합 100) */
export const cutsToFrequencies = (cuts: number[]): number[] => {
  const edges = [0, ...cuts, 100];
  return edges.slice(1).map((edge, index) => edge - edges[index]);
};

/** 손잡이 하나를 옮긴다. 이웃 손잡이를 넘지 못한다(다른 값은 그대로) */
export const moveCut = (cuts: number[], index: number, value: number): number[] => {
  if (index < 0 || index >= cuts.length) return cuts;
  const low = index > 0 ? cuts[index - 1] : 0;
  const high = index + 1 < cuts.length ? cuts[index + 1] : 100;
  const next = cuts.slice();
  next[index] = Math.max(low, Math.min(high, snap(value)));
  return next;
};

/**
 * 누른 자리에서 가장 가까운 손잡이. 손잡이가 겹쳐 있으면 누른 쪽으로 움직일 수 있는 것을 고른다
 * (오른쪽을 누르면 뒤 손잡이 · 왼쪽이면 앞 손잡이) — 안 그러면 겹친 손잡이가 한쪽으로 안 움직인다.
 */
export const nearestCut = (cuts: number[], value: number): number => {
  if (!cuts.length) return -1;
  const distance = Math.min(...cuts.map((cut) => Math.abs(cut - value)));
  const ties = cuts.map((_, k) => k).filter((k) => Math.abs(cuts[k] - value) === distance);
  return value > cuts[ties[0]] ? ties[ties.length - 1] : ties[0];
};

/**
 * 트레이너 액션({name, amount}) → 액션 색 표(action-colors.ts)가 읽는 문자열 «Bet(33)» 꼴.
 * 크기 없는 액션(폴드·체크·콜)은 이름만 — 그래야 색 표가 폴드·패시브로 알아본다.
 */
export const frequencyActionColorKey = (action: { name: string; amount: string }) => {
  const name = /^all-?in$/i.test(action.name) ? "AllIn" : action.name;
  return !action.amount || action.amount === "0" ? name : `${name}(${action.amount})`;
};

/** 키보드로 손잡이를 옮길 때 한 번에 움직이는 양(좌우 화살표) */
export const nudgeCut = (cuts: number[], index: number, direction: 1 | -1) =>
  moveCut(cuts, index, (cuts[index] ?? 0) + direction * FREQUENCY_STEP);

export type FrequencyVerdict = "close" | "mix" | "losing";

export type FrequencyResult = {
  verdict: FrequencyVerdict;
  /** 비율 차이(%p) = Σ|내 빈도 − 솔버 빈도| ÷ 2 */
  distance: number;
  /** 빈도 일치도 = 100 − distance (정수) */
  match: number;
  /** 내 답의 EV 손실(bb) = Σ 내 빈도 × 그 액션의 손실 */
  evLossBb: number;
  /** 솔버가 내 답보다 가장 많이 쓰는 액션과 그 차이(%p · 반올림). 차이가 없으면 -1 */
  shortAction: number;
  shortBy: number;
};

/**
 * 채점. mine = 내 빈도(%, 합 100) · solver = 솔버 빈도(0~1) · lossesBb = 액션별 EV 손실(bb · 최선 = 0)
 * · goodBb = 기존 «좋음» 한도(lossLimits).
 * 색은 세 가지: 손실이 한도를 넘으면 losing(빨강) > 차이 15%p 이내면 close(초록) > 그 밖은 mix(노랑).
 * 믹스 액션은 EV가 같으므로 비율 차이를 실수로 치지 않는다 — 빨강은 실제 손해에만 쓴다.
 */
export const classifyFrequencyAnswer = (input: {
  mine: number[];
  solver: number[];
  lossesBb: number[];
  goodBb: number;
}): FrequencyResult => {
  const total = input.solver.reduce((sum, f) => sum + Math.max(0, f), 0);
  const solverPct = input.solver.map((f) => (total > 0 ? (Math.max(0, f) / total) * 100 : 0));
  let sum = 0;
  let evLossBb = 0;
  let shortAction = -1;
  let shortGap = 0;
  input.mine.forEach((mine, index) => {
    const gap = solverPct[index] - mine;
    sum += Math.abs(gap);
    // 내가 안 쓴 액션의 손실은 세지 않는다(EV가 없는 액션은 손실이 무한대일 수 있다)
    if (mine > 0) evLossBb += (mine / 100) * (input.lossesBb[index] ?? 0);
    if (gap > shortGap) {
      shortGap = gap;
      shortAction = index;
    }
  });
  const distance = sum / 2;
  // 판정은 화면에 보이는 일치도(반올림)로 한다 — 같은 점수에 판정이 갈리지 않게 (MA-767 통지)
  const match = Math.round(100 - distance);
  const verdict: FrequencyVerdict =
    evLossBb > input.goodBb ? "losing" : match >= 100 - FREQUENCY_CLOSE_PP ? "close" : "mix";
  return {
    verdict,
    distance,
    match,
    evLossBb,
    shortAction: Math.round(shortGap) > 0 ? shortAction : -1,
    shortBy: Math.round(shortGap),
  };
};
