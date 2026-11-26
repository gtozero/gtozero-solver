/**
 * 「🔗 이 판 공유」의 변환 — 복기 판 → 본체 /api/hand-share 꼴(본체 MB-651 · 우리 회신 MB-650 S-189).
 * 화면·Vue·전역 상태를 쓰지 않는다(Node에서 바로 검사: 도구/hand-share-model-check.js).
 * ⚠ 두 앱에 같은 파일 — solver/src/hand-share-model.ts · study-app/src/hand-share-model.ts. 고치면 둘 다.
 *
 * 우리 쪽 약속(회신 MB-650):
 *   pre 스트리트 = 액션 없음 · pot = 플랍 시작 팟(bb) · stacks = 플랍 시작 유효 스택(bb, 두 자리 같은 값)
 *   금액 = 유저가 누른 실제 크기(bb) — 벳 = 그 스트리트에 낸 크기 · 레이즈 = «까지» · 콜 = 더 낸 만큼
 *   verdicts = 내 결정에만 · 참고만 = g:"ref" · 빈도 3.5% 규칙으로 «허용»에 올린 것 = mixed:1
 *   가까운 준비된 크기로 맞춰 계산한 결정 = approx:1 · spot = 화면 상황 id(자료 폴더 이름 아님)
 */

export type ShareActionKind = "Fold" | "Check" | "Call" | "Bet" | "Raise" | "AllIn";
export type ShareStreet = "flop" | "turn" | "river";
export type ShareVerdict = {
  grade: "best" | "good" | "bad" | null;
  rawGrade: "best" | "good" | "bad" | null;
  lossBb: number | null;
  referenceOnly: boolean;
  mixedAction: boolean;
  errorCode: string | null;
};
/** 복기 기록 한 줄 — 두 앱의 records에서 만든다(match.kind · match.actual · match.approximated) */
export type ShareStep = {
  street: ShareStreet;
  player: 0 | 1;
  kind: ShareActionKind;
  /** 칩 · 그 스트리트에 낸 총액(벳·레이즈·올인) · 체크·폴드·콜은 null */
  amount: number | null;
  approximated: boolean;
  verdict: ShareVerdict | null;
};
export type ShareHand = {
  /** 화면 상황 id(srp-btn-bb · limp-sb-bb …) */
  spotId: string;
  /** [OOP 자리, IP 자리] — player 0 = OOP */
  seats: [string, string];
  /** 칩 */
  startingPot: number;
  effectiveStack: number;
  /** 1bb = 몇 칩(SPOT_UNIT_SCALE) */
  unit: number;
  heroPlayer: 0 | 1;
  heroCards: number[];
  /** 실제 무늬 3~5장 */
  board: number[];
  steps: ShareStep[];
};

export type HandShareAct = [string, "f" | "x" | "c" | "b" | "r", number?, 1?];
export type HandSharePayload = {
  v: 1;
  n: 2;
  hero: string;
  cards: string[];
  stacks: Record<string, number>;
  spot?: string;
  streets: { s: "pre" | ShareStreet; cards: string[]; pot: number; acts: HandShareAct[] }[];
  verdicts: { s: ShareStreet; i: number; g: "best" | "good" | "bad" | "ref"; loss: number; mixed?: 1; approx?: 1 }[];
  open?: string;
};

/** 플랍까지 다시 여는 주소의 앞 — 다른 판 빌드는 이 주소를 그 판 주소로 바꿔 읽는다 */
export const SOLVER_STUDY_URL = "https://app.gtozero.com/study/";
export const HAND_SHARE_BODY_MAX = 8000;
const OPEN_MAX = 600;
const ACTS_PER_STREET = 30;
const VERDICTS_MAX = 40;
const SPOT_ID = /^[a-z0-9]+(?:-[a-z0-9+]+){0,5}$/;
const STREETS: ShareStreet[] = ["flop", "turn", "river"];
const EPS = 1e-9;

const isCard = (c: unknown): c is number => Number.isInteger(c) && (c as number) >= 0 && (c as number) < 52;
/** 카드 번호(rank*4+suit · ♣♦♥♠) → «As» */
export const cardCode = (c: number): string => "23456789TJQKA"[c >> 2] + "cdhs"[c & 3];
const cardNumber = (text: string): number | null => {
  const r = "23456789TJQKA".indexOf(text[0] ?? ""),
    s = "cdhs".indexOf(text[1] ?? "");
  return text.length === 2 && r >= 0 && s >= 0 ? r * 4 + s : null;
};
const r2 = (x: number) => Math.round(x * 100) / 100;

/** 복기 판 → 본체가 받는 판 객체. 꼴을 못 맞추면 null(화면은 한 줄 요약만 복사한다) */
export function buildHandShare(hand: ShareHand): HandSharePayload | null {
  const { seats, unit, heroPlayer, heroCards, board, steps } = hand;
  if (!(unit > 0) || !(hand.effectiveStack > 0) || !(hand.startingPot >= 0)) return null;
  if (!Array.isArray(seats) || seats.length !== 2 || seats[0] === seats[1] || !seats.every((s) => typeof s === "string" && s)) return null;
  if (heroPlayer !== 0 && heroPlayer !== 1) return null;
  if (heroCards.length !== 2 || board.length < 3 || board.length > 5) return null;
  const all = [...heroCards, ...board];
  if (!all.every(isCard) || new Set(all).size !== all.length) return null;

  const stack = r2(hand.effectiveStack / unit);
  const hero = seats[heroPlayer];
  const names = STREETS.slice(0, board.length - 2);
  let potChips = hand.startingPot;
  const left: [number, number] = [hand.effectiveStack, hand.effectiveStack];
  const streets: HandSharePayload["streets"] = [{ s: "pre", cards: [], pot: r2(potChips / unit), acts: [] }];
  const verdicts: HandSharePayload["verdicts"] = [];
  let at = 0;
  for (let k = 0; k < names.length; k++) {
    const name = names[k];
    const acts: HandShareAct[] = [];
    const committed: [number, number] = [0, 0];
    const potAtStart = potChips;
    for (; at < steps.length && steps[at].street === name; at++) {
      const step = steps[at];
      const p = step.player,
        o = (p ^ 1) as 0 | 1,
        seat = seats[p];
      if (p !== 0 && p !== 1) return null;
      if (step.kind === "Fold") acts.push([seat, "f"]);
      else if (step.kind === "Check") acts.push([seat, "x"]);
      else if (step.kind === "Call") {
        const paid = committed[o] - committed[p];
        if (!(paid > EPS)) return null;
        committed[p] = committed[o];
        acts.push(committed[p] >= left[p] - EPS ? [seat, "c", r2(paid / unit), 1] : [seat, "c", r2(paid / unit)]);
      } else {
        const amount = step.amount;
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= Math.max(committed[0], committed[1]) + EPS) return null;
        // 레이즈 = «까지»(그 스트리트에 낸 총액) · 벳 = 낸 크기(앞에 낸 것이 없다)
        const code = committed[o] > committed[p] + EPS ? "r" : "b";
        committed[p] = amount;
        const allIn = step.kind === "AllIn" || amount >= left[p] - EPS;
        acts.push(allIn ? [seat, code, r2(amount / unit), 1] : [seat, code, r2(amount / unit)]);
      }
      const v = step.verdict;
      if (v && p === heroPlayer && !v.errorCode) {
        const g = v.referenceOnly ? "ref" : v.grade;
        if (g) {
          const out: HandSharePayload["verdicts"][number] = {
            s: name,
            i: acts.length - 1,
            g,
            loss: Math.min(stack, Math.max(0, r2(v.lossBb ?? 0))),
          };
          if (g === "good" && v.rawGrade === "bad" && v.mixedAction) out.mixed = 1;
          if (step.approximated) out.approx = 1;
          verdicts.push(out);
        }
      }
    }
    if (acts.length > ACTS_PER_STREET) return null;
    streets.push({ s: name, cards: board.slice(0, k + 3).map(cardCode), pot: r2(potAtStart / unit), acts });
    potChips += committed[0] + committed[1];
    left[0] -= committed[0];
    left[1] -= committed[1];
  }
  // 보드보다 뒤 스트리트의 기록 · 순서가 뒤섞인 기록 = 깨진 판
  if (at !== steps.length) return null;
  if (streets.slice(1).every((s) => s.acts.length === 0)) return null;
  if (verdicts.length > VERDICTS_MAX) return null;

  const payload: HandSharePayload = {
    v: 1,
    n: 2,
    hero,
    cards: heroCards.map(cardCode),
    stacks: { [seats[0]]: stack, [seats[1]]: stack },
    ...(SPOT_ID.test(hand.spotId) && hand.spotId.length <= 40 ? { spot: hand.spotId } : {}),
    streets,
    verdicts,
  };
  const open = reviewOpenUrl({
    spotId: hand.spotId,
    heroPlayer,
    heroCards,
    flop: board.slice(0, 3),
    actions: steps.filter((s) => s.street === "flop").map((s) => ({ kind: s.kind, amount: s.amount ?? undefined })),
  });
  if (open) payload.open = open;
  return payload;
}

/*
 * 플랍까지 다시 여는 재료(?view=hand-review&h=…) — /study/ 앱 restoreHand가 쓰는 것만:
 *   1_<상황 id>_<내 자리 0|1>_<내 카드 4글자>_<플랍 6글자>_<플랍 액션 ~로 이음>
 *   액션: f · x · c · b<칩> · r<칩> · a<칩>(올인) — 칩 = 그 스트리트에 낸 총액(엔진 단위)
 * 예: 1_srp-btn-bb_1_AsKd_Kh7d2c_x~b18~c
 */
export type ReviewMaterial = {
  spotId: string;
  heroPlayer: 0 | 1;
  heroCards: number[];
  flop: number[];
  actions: { kind: ShareActionKind; amount?: number }[];
};
const ACTION_CODE: Record<ShareActionKind, string> = { Fold: "f", Check: "x", Call: "c", Bet: "b", Raise: "r", AllIn: "a" };
const CODE_ACTION: Record<string, ShareActionKind> = { f: "Fold", x: "Check", c: "Call", b: "Bet", r: "Raise", a: "AllIn" };
const AMOUNT = /^(?:0|[1-9][0-9]{0,8})(?:\.[0-9]{1,4})?$/;

export function encodeReviewHand(m: ReviewMaterial): string | null {
  if (!SPOT_ID.test(m.spotId) || m.spotId.length > 40) return null;
  if (m.heroPlayer !== 0 && m.heroPlayer !== 1) return null;
  if (m.heroCards.length !== 2 || m.flop.length !== 3 || ![...m.heroCards, ...m.flop].every(isCard)) return null;
  if (m.actions.length > ACTS_PER_STREET) return null;
  const acts: string[] = [];
  for (const a of m.actions) {
    const code = ACTION_CODE[a.kind];
    if (!code) return null;
    if (a.kind === "Fold" || a.kind === "Check" || a.kind === "Call") {
      acts.push(code);
      continue;
    }
    if (typeof a.amount !== "number" || !Number.isFinite(a.amount) || a.amount <= 0) return null;
    const text = String(Math.round(a.amount * 10000) / 10000);
    if (!AMOUNT.test(text)) return null;
    acts.push(code + text);
  }
  return ["1", m.spotId, String(m.heroPlayer), m.heroCards.map(cardCode).join(""), m.flop.map(cardCode).join(""), acts.join("~")].join("_");
}

/** 주소의 값은 믿지 않는다 — 꼴이 하나라도 어긋나면 null(자리·카드 중복 같은 판 검사는 화면의 fillHand가 한 번 더 한다) */
export function decodeReviewHand(text: unknown): ReviewMaterial | null {
  if (typeof text !== "string" || text.length > OPEN_MAX) return null;
  const parts = text.split("_");
  if (parts.length !== 6 || parts[0] !== "1") return null;
  const [, spotId, hero, hand, flopText, actText] = parts;
  if (!SPOT_ID.test(spotId) || spotId.length > 40) return null;
  if (hero !== "0" && hero !== "1") return null;
  const cardsOf = (s: string, n: number) => {
    if (s.length !== n * 2) return null;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const c = cardNumber(s.slice(i * 2, i * 2 + 2));
      if (c === null) return null;
      out.push(c);
    }
    return out;
  };
  const heroCards = cardsOf(hand, 2),
    flop = cardsOf(flopText, 3);
  if (!heroCards || !flop || new Set([...heroCards, ...flop]).size !== 5) return null;
  const tokens = actText === "" ? [] : actText.split("~");
  if (tokens.length > ACTS_PER_STREET) return null;
  const actions: ReviewMaterial["actions"] = [];
  for (const t of tokens) {
    const kind = CODE_ACTION[t[0]];
    if (!kind) return null;
    if (kind === "Fold" || kind === "Check" || kind === "Call") {
      if (t.length !== 1) return null;
      actions.push({ kind });
      continue;
    }
    const n = t.slice(1);
    if (!AMOUNT.test(n) || !(Number(n) > 0)) return null;
    actions.push({ kind, amount: Number(n) });
  }
  return { spotId, heroPlayer: hero === "1" ? 1 : 0, heroCards, flop, actions };
}

/** 600자를 넘거나 재료를 못 만들면 null(본체 주소에서 «솔버에서 열기» 버튼이 빠질 뿐) */
export function reviewOpenUrl(m: ReviewMaterial): string | null {
  const material = encodeReviewHand(m);
  if (!material) return null;
  const url = `${SOLVER_STUDY_URL}?view=hand-review&h=${encodeURIComponent(material)}`;
  return url.length <= OPEN_MAX && !/[\s"'<>\\`]/.test(url) ? url : null;
}
