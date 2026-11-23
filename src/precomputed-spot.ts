/*
 * 직접 계산하려는 상황이 플랍 조회(/study/ 앱 · 사전 계산 0.3%)에 이미 있는가 (MB-636 ④ · 2026-11-23)
 *
 * 맞다고 보는 조건 = 사전 계산 도구(precompute3 main.rs)가 푼 트리와 «같은 문제»일 때만:
 * - 레인지·팟·스택이 «자리로 채우기»(SpotPicker)의 SRP 상황과 같다 — 레인지는 RangeEditor와 같은
 *   RangeManager 정규화 글자로 비교한다(store.rangeText = RangeEditor의 to_string 미러).
 * - 그 상황이 플랍 조회에 있다(아래 목록 = study-app hand-review-data.ts readyScenarios의 SRP 9개 · 회원 전용 아님).
 * - 보드가 플랍 3장 · 레이크 0 · 동크 없음 · 편집한 줄 없음 · 벳 크기 12칸 = SPOT_BET_SIZES ·
 *   올인 기준 150/20/10(main.rs add_allin 1.5 · force 0.2 · merging 0.1).
 * 하나라도 다르면 결과가 달라지므로 안내하지 않는다.
 */
import { RangeManager } from "../pkg/range/range";
import { SRP_SPOTS, SPOT_BET_SIZES, SrpSpot } from "./preflop-spots";
import { buildFlopStudyLink } from "./flop-study-model";

export const FLOP_STUDY_SRP_IDS: readonly string[] = [
  "srp-btn-bb", "srp-sb-bb", "srp-co-bb", "srp-hj-bb", "srp-utg-bb",
  "srp-co-btn", "srp-hj-btn", "srp-utg-btn", "srp-hj-co",
];

const BET_FIELDS = [
  "oopFlopBet", "oopFlopRaise", "oopTurnBet", "oopTurnRaise", "oopRiverBet", "oopRiverRaise",
  "ipFlopBet", "ipFlopRaise", "ipTurnBet", "ipTurnRaise", "ipRiverBet", "ipRiverRaise",
] as const;

type BetField = typeof BET_FIELDS[number];

export type PrecomputedConfig = {
  [K in BetField]: string;
} & {
  board: number[];
  startingPot: number;
  effectiveStack: number;
  rakePercent: number;
  rakeCap: number;
  donkOption: boolean;
  oopTurnDonk: string;
  oopRiverDonk: string;
  addAllInThreshold: number;
  forceAllInThreshold: number;
  mergingThreshold: number;
  addedLines: string;
  removedLines: string;
};

const betDefault = (field: BetField) =>
  field.endsWith("Raise") ? SPOT_BET_SIZES.raise : field.includes("Flop") ? SPOT_BET_SIZES.flopBet : SPOT_BET_SIZES.laterBet;

const sameSizes = (value: string, expected: string) =>
  value.split(",").map((s) => s.trim()).filter(Boolean).join(",") === expected;

let normalized: Map<string, [string, string]> | null = null;
const normalizedRanges = () => {
  if (normalized) return normalized;
  normalized = new Map();
  const manager = RangeManager.new();
  const norm = (text: string) => (manager.from_string(text) ? null : manager.to_string());
  for (const spot of SRP_SPOTS) {
    if (!FLOP_STUDY_SRP_IDS.includes(spot.id)) continue;
    const oop = norm(spot.oopRange);
    const ip = norm(spot.ipRange);
    if (oop !== null && ip !== null) normalized.set(spot.id, [oop, ip]);
  }
  manager.free?.();
  return normalized;
};

/** 같은 문제면 그 SRP 상황, 아니면 null */
export const matchPrecomputedSpot = (config: PrecomputedConfig, rangeText: readonly [string, string] | string[]): SrpSpot | null => {
  if (config.board.length !== 3 || new Set(config.board).size !== 3) return null;
  if (config.rakePercent !== 0 || config.rakeCap !== 0 || config.donkOption) return null;
  if (config.oopTurnDonk.trim() !== "" || config.oopRiverDonk.trim() !== "") return null;
  if (config.addedLines !== "" || config.removedLines !== "") return null;
  if (config.addAllInThreshold !== 150 || config.forceAllInThreshold !== 20 || config.mergingThreshold !== 10) return null;
  if (!BET_FIELDS.every((field) => sameSizes(config[field], betDefault(field)))) return null;
  if (!rangeText[0] || !rangeText[1]) return null;
  const ranges = normalizedRanges();
  for (const spot of SRP_SPOTS) {
    const expected = ranges.get(spot.id);
    if (!expected) continue;
    if (
      config.startingPot === spot.startingPot &&
      config.effectiveStack === spot.effectiveStack &&
      rangeText[0] === expected[0] &&
      rangeText[1] === expected[1]
    ) {
      return spot;
    }
  }
  return null;
};

export const precomputedStudySearch = (spot: SrpSpot, board: readonly number[]) =>
  buildFlopStudyLink({ spot: spot.id, flop: board.slice(0, 3) });
