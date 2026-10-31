/*
 * 이용 계측을 싣지 않는 빌드용 빈 모듈 — webpack이 src/usage-analytics.ts 대신 문다(build/variants.js).
 * 수집 코드가 번들에 하나도 담기지 않게 하는 이음새다. export 이름은 usage-analytics.ts와 짝을 이룬다.
 */
export const setupAnalytics = (): void => {};
export const trackFeatureOpen = (..._args: unknown[]): void => {};
export const trackCalcStart = (..._args: unknown[]): void => {};
export const trackCalcDone = (..._args: unknown[]): void => {};
export const trackCalcFail = (..._args: unknown[]): void => {};
export const trackShare = (..._args: unknown[]): void => {};
export const trackSave = (..._args: unknown[]): void => {};
