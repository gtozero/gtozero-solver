/*
 * MB-636 «기다림·첫 화면» 새 문구 묶음 (2026-11-23 · 솔버 UX 진단)
 *
 * - glossary: 첫 화면 용어(OOP·IP·EV) 한 줄 풀이 — 교육 예제 안내 상자 · 트레이너 채점 칸
 * - estimate / minutes / underMinute: 계산 실행 화면의 실행 전 예상 시간
 * - precomputed: 직접 계산하려는 상황이 플랍 조회에 이미 있을 때 한 줄(버튼 글자 = 플랍 조회 메뉴 이름 + «→»)
 *
 * 용어는 각 언어 화면에 이미 있는 말을 따른다(флоп · ฟลอป · الفلوب · 翻牌 · フロップ · hi는 Latin «flop»).
 * minutes(n, text): n = 분(정수) · text = 그 언어 숫자 표기(localizeNumber). ar은 수 일치(1 دقيقة · 2 دقيقتين · 3–10 دقائق · 11+ دقيقة · MA-764).
 */
import type { Locale } from "./i18n";

export type UxHintLabels = {
  glossary: string;
  estimate: (time: string) => string;
  /** n = 분(정수) · text = 그 언어 숫자 표기 */
  minutes: (n: number, text: string) => string;
  underMinute: string;
  precomputed: string;
};

export const UX_HINT_LABELS: Record<Locale, UxHintLabels> = {
  ko: {
    glossary: "OOP = 플랍부터 먼저 행동하는 쪽 · IP = 나중에 행동하는 쪽 · EV = 그 선택으로 평균 가져가는 칩(bb)",
    estimate: (t) => `예상 계산 시간: ${t} (기기 성능에 따라 달라요)`,
    minutes: (_n, t) => `약 ${t}분`,
    underMinute: "1분 이내",
    precomputed: "같은 상황이 미리 계산돼 있어요 — 기다리지 않고 바로 볼 수 있어요.",
  },
  en: {
    glossary: "OOP = acts first from the flop on · IP = acts last · EV = the average amount a decision wins from the pot (bb)",
    estimate: (t) => `Estimated solve time: ${t} (varies by device)`,
    minutes: (_n, t) => `about ${t} min`,
    underMinute: "under 1 min",
    precomputed: "This exact spot is already solved — see it right away, no waiting.",
  },
  ja: {
    glossary: "OOP = フロップ以降に先に行動する側 · IP = 後に行動する側 · EV = その選択で平均して得られるチップ(bb)",
    estimate: (t) => `計算時間の目安: ${t}(端末の性能で変わります)`,
    minutes: (_n, t) => `約${t}分`,
    underMinute: "1分以内",
    precomputed: "同じ状況がすでに計算済みです。待たずにすぐ見られます。",
  },
  es: {
    glossary: "OOP = actúa primero desde el flop · IP = actúa último · EV = cuánto gana una decisión en promedio (bb)",
    estimate: (t) => `Tiempo estimado de cálculo: ${t} (depende del dispositivo)`,
    minutes: (_n, t) => `aprox. ${t} min`,
    underMinute: "menos de 1 min",
    precomputed: "Este spot ya está resuelto: puedes verlo al instante, sin esperar.",
  },
  pt: {
    glossary: "OOP = age primeiro a partir do flop · IP = age por último · EV = quanto uma decisão ganha em média (bb)",
    estimate: (t) => `Tempo estimado de cálculo: ${t} (varia conforme o aparelho)`,
    minutes: (_n, t) => `cerca de ${t} min`,
    underMinute: "menos de 1 min",
    precomputed: "Este spot já está resolvido — veja agora, sem esperar.",
  },
  de: {
    glossary: "OOP = handelt ab dem Flop zuerst · IP = handelt zuletzt · EV = wie viel eine Entscheidung im Schnitt einbringt (bb)",
    estimate: (t) => `Geschätzte Rechenzeit: ${t} (je nach Gerät)`,
    minutes: (_n, t) => `ca. ${t} Min.`,
    underMinute: "unter 1 Min.",
    precomputed: "Dieser Spot ist bereits berechnet – sofort ansehen, ohne Wartezeit.",
  },
  zh: {
    glossary: "OOP = 翻牌起先行动的一方 · IP = 后行动的一方 · EV = 该选择平均能赢多少（bb）",
    estimate: (t) => `预计计算时间：${t}（因设备性能而异）`,
    minutes: (_n, t) => `约 ${t} 分钟`,
    underMinute: "1 分钟内",
    precomputed: "相同的局面已预先算好——无需等待，立即查看。",
  },
  "zh-hant": {
    glossary: "OOP = 翻牌起先行動的一方 · IP = 後行動的一方 · EV = 該選擇平均能贏多少（bb）",
    estimate: (t) => `預計計算時間：${t}（依裝置效能而異）`,
    minutes: (_n, t) => `約 ${t} 分鐘`,
    underMinute: "1 分鐘內",
    precomputed: "相同的局面已預先算好——無需等待，立即查看。",
  },
  fr: {
    glossary: "OOP = parle en premier dès le flop · IP = parle en dernier · EV = ce qu'une décision rapporte en moyenne (bb)",
    estimate: (t) => `Temps de calcul estimé : ${t} (selon l'appareil)`,
    minutes: (_n, t) => `environ ${t} min`,
    underMinute: "moins d'une minute",
    precomputed: "Ce spot est déjà résolu : consulte-le tout de suite, sans attendre.",
  },
  id: {
    glossary: "OOP = bertindak lebih dulu sejak flop · IP = bertindak terakhir · EV = rata-rata hasil sebuah keputusan (bb)",
    estimate: (t) => `Perkiraan waktu hitung: ${t} (tergantung perangkat)`,
    minutes: (_n, t) => `sekitar ${t} menit`,
    underMinute: "kurang dari 1 menit",
    precomputed: "Spot ini sudah dihitung — lihat sekarang tanpa menunggu.",
  },
  ms: {
    glossary: "OOP = bertindak dahulu sejak flop · IP = bertindak terakhir · EV = purata hasil sesuatu keputusan (bb)",
    estimate: (t) => `Anggaran masa pengiraan: ${t} (bergantung pada peranti)`,
    minutes: (_n, t) => `kira-kira ${t} minit`,
    underMinute: "kurang daripada 1 minit",
    precomputed: "Spot ini sudah dikira — lihat sekarang tanpa menunggu.",
  },
  hi: {
    glossary: "OOP = flop से आगे पहले एक्शन करने वाला · IP = बाद में एक्शन करने वाला · EV = किसी फ़ैसले से औसतन मिलने वाला मूल्य (bb)",
    estimate: (t) => `अनुमानित गणना समय: ${t} (डिवाइस के अनुसार बदलता है)`,
    minutes: (_n, t) => `लगभग ${t} मिनट`,
    underMinute: "1 मिनट से कम",
    precomputed: "इस स्पॉट की गणना पहले ही हो चुकी है — बिना इंतज़ार किए अभी देखें।",
  },
  tr: {
    glossary: "OOP = flop'tan itibaren ilk hareket eden · IP = son hareket eden · EV = bir kararın ortalamada ne kadar kazandırdığı (bb)",
    estimate: (t) => `Tahmini hesaplama süresi: ${t} (cihaza göre değişir)`,
    minutes: (_n, t) => `yaklaşık ${t} dk`,
    underMinute: "1 dk'dan az",
    precomputed: "Bu spot zaten çözülmüş — beklemeden hemen gör.",
  },
  vi: {
    glossary: "OOP = hành động trước từ flop trở đi · IP = hành động sau · EV = trung bình một quyết định thắng được bao nhiêu (bb)",
    estimate: (t) => `Thời gian giải dự kiến: ${t} (tùy thiết bị)`,
    minutes: (_n, t) => `khoảng ${t} phút`,
    underMinute: "dưới 1 phút",
    precomputed: "Spot này đã được giải sẵn — xem ngay, không cần chờ.",
  },
  ru: {
    glossary: "OOP = ходит первым начиная с флопа · IP = ходит последним · EV = сколько в среднем приносит решение (bb)",
    estimate: (t) => `Примерное время расчёта: ${t} (зависит от устройства)`,
    minutes: (_n, t) => `около ${t} мин`,
    underMinute: "меньше 1 мин",
    precomputed: "Этот спот уже рассчитан — смотри сразу, без ожидания.",
  },
  ar: {
    glossary: "OOP = يلعب أولًا بدءًا من الفلوب · IP = يلعب أخيرًا · EV = متوسط ما يربحه القرار (bb)",
    estimate: (t) => `الوقت المتوقّع للحساب: ${t} (يختلف حسب الجهاز)`,
    minutes: (n, t) => (n === 1 ? "نحو دقيقة" : n === 2 ? "نحو دقيقتين" : n <= 10 ? `نحو ${t} دقائق` : `نحو ${t} دقيقة`),
    underMinute: "أقل من دقيقة",
    precomputed: "هذا الموقف محسوب مسبقًا — شاهده الآن دون انتظار.",
  },
  it: {
    glossary: "OOP = agisce per primo dal flop in poi · IP = agisce per ultimo · EV = quanto guadagni in media con una decisione (bb)",
    estimate: (t) => `Tempo di calcolo stimato: ${t} (varia in base al dispositivo)`,
    minutes: (_n, t) => `circa ${t} min`,
    underMinute: "meno di 1 min",
    precomputed: "Questo spot è già risolto: guardalo subito, senza attese.",
  },
  pl: {
    glossary: "OOP = działa jako pierwszy od flopa · IP = działa jako ostatni · EV = ile średnio zyskujesz daną decyzją (bb)",
    estimate: (t) => `Szacowany czas obliczeń: ${t} (zależy od urządzenia)`,
    minutes: (_n, t) => `ok. ${t} min`,
    underMinute: "poniżej 1 min",
    precomputed: "Ten spot jest już policzony — zobacz od razu, bez czekania.",
  },
  th: {
    glossary: "OOP = ฝ่ายที่ออกแ⁠อ็⁠ก⁠ชั⁠นก่อนตั้งแต่ฟลอป · IP = ฝ่ายที่ออกแ⁠อ็⁠ก⁠ชั⁠นทีหลัง · EV = ผลตอบแทนเฉลี่ยของการตัดสินใจ (bb)",
    estimate: (t) => `เวลาคำนวณ: ${t} (ขึ้นอยู่กับอุปกรณ์)`,
    minutes: (_n, t) => `ประมาณ ${t} นาที`,
    underMinute: "ไม่ถึง 1 นาที",
    precomputed: "สถานการณ์นี้คำนวณไว้แล้ว — ดูได้ทันทีโดยไม่ต้องรอ",
  },
  uk: {
    glossary: "OOP = діє першим, починаючи з флопа · IP = діє останнім · EV = скільки в середньому приносить рішення (bb)",
    estimate: (t) => `Орієнтовний час розрахунку: ${t} (залежить від пристрою)`,
    minutes: (_n, t) => `близько ${t} хв`,
    underMinute: "менше 1 хв",
    precomputed: "Цей спот уже розраховано — дивись одразу, без очікування.",
  },
};

export const uxHintLabels = (locale: Locale): UxHintLabels => UX_HINT_LABELS[locale];
