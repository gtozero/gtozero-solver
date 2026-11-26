/**
 * 「🔗 이 판 공유」 — 복기 결과를 본체 짧은 주소(/h/<id>)로 만든다(본체 MB-651 · 우리 회신 MB-650).
 * 보내는 꼴·변환 = hand-share-model.ts(순수 함수). 이 파일은 보내기·공유 시트·복사·화면 상태만.
 * ⚠ 두 앱에 같은 파일 — solver/src/hand-share.ts · study-app/src/hand-share.ts. 고치면 둘 다.
 * 받는 쪽 주소가 없는 사이트(MainSite.handShareApi = "")에서는 버튼이 나오지 않는다(CORS가 솔버 주소 하나뿐).
 *
 * 누르면: POST(3초 제한) → 성공 = 폰은 공유 시트 · PC는 주소 복사 + «복사됨»
 *        실패·3초 초과 = 한 줄 요약만 복사하고 실패 한 줄 + 그 요약을 보인다(«복사됨»은 복사에 성공했을 때만).
 * 기다린 뒤의 공유 시트·클립보드는 브라우저가 «사용자 동작 아님»으로 막을 수 있다(특히 iOS 사파리):
 *   ① 누른 그 순간에 클립보드 쓰기를 먼저 열어 둔다(ClipboardItem에 «나중에 채울 글»을 건다 — 사파리가 권하는 길).
 *      폰에서 공유 시트가 열리면 그 쓰기는 취소한다(클립보드를 건드리지 않는다).
 *   ② 그래도 막히면 writeText → execCommand("copy") 순서로 다시 해 본다.
 *   ③ 다 막히면 주소(또는 요약)를 고를 수 있는 칸에 보여 준다 — 조용히 끝나지 않는다.
 *   ④ 만든 주소는 같은 판이면 기억한다 — 다시 누르면 기다림 없이(사용자 동작 안에서) 바로 공유 시트·복사.
 * 공유 시트를 유저가 닫은 것(AbortError)은 실패가 아니다.
 */
import { reactive } from "vue";
import type { LocaleDict } from "./i18n";
import { MAIN_SITE_CONFIG } from "./main-site";
import { trackHandShare } from "./usage-analytics";
import { buildHandShare, HAND_SHARE_BODY_MAX } from "./hand-share-model";
import type { ShareHand } from "./hand-share-model";

/** 켬 11-26(본체 MB-654 · 검수장 MA-771) */
export const HAND_SHARE_LAUNCHED = true;

const TIMEOUT_MS = 3000;
const SHORT_PATH = /^\/h\/[A-Za-z0-9_-]{10}$/;

// 시험: 로컬 주소에서만 ?handShare=1
const testSwitch = (): boolean => {
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) &&
      new URLSearchParams(location.search).get("handShare") === "1";
  } catch {
    return false;
  }
};
const switchedOn = HAND_SHARE_LAUNCHED || testSwitch();

export const handShareOn = (): boolean => switchedOn && MAIN_SITE_CONFIG.handShareApi !== "";

export const HAND_SHARE_LABELS: LocaleDict<{ share: string; copied: string; failed: string }> = {
  ko: { share: "🔗 이 판 공유", copied: "복사됨", failed: "링크를 만들지 못했습니다." },
  en: { share: "🔗 Share this hand", copied: "Copied", failed: "Could not create a link." },
  ja: { share: "🔗 このハンドを共有", copied: "コピーしました", failed: "リンクを作成できませんでした。" },
  es: { share: "🔗 Compartir esta mano", copied: "Copiado", failed: "No se pudo crear el enlace." },
  pt: { share: "🔗 Compartilhar esta mão", copied: "Copiado", failed: "Não foi possível criar o link." },
  de: { share: "🔗 Diese Hand teilen", copied: "Kopiert", failed: "Der Link konnte nicht erstellt werden." },
  zh: { share: "🔗 分享这手牌", copied: "已复制", failed: "无法生成链接。" },
  "zh-hant": { share: "🔗 分享這手牌", copied: "已複製", failed: "無法產生連結。" },
  fr: { share: "🔗 Partager cette main", copied: "Copié", failed: "Impossible de créer le lien." },
  id: { share: "🔗 Bagikan hand ini", copied: "Tersalin", failed: "Tautan tidak dapat dibuat." },
  ms: { share: "🔗 Kongsi tangan ini", copied: "Disalin", failed: "Pautan gagal dibuat." },
  hi: { share: "🔗 यह हैंड शेयर करें", copied: "कॉपी हो गया", failed: "लिंक नहीं बन सका।" },
  tr: { share: "🔗 Bu elin bağlantısını paylaş", copied: "Kopyalandı", failed: "Bağlantı oluşturulamadı." },
  vi: { share: "🔗 Chia sẻ ván này", copied: "Đã sao chép", failed: "Không tạo được liên kết." },
  ru: { share: "🔗 Поделиться раздачей", copied: "Скопировано", failed: "Не удалось создать ссылку." },
  ar: { share: "🔗 شارك هذه اليد", copied: "تم النسخ", failed: "تعذّر إنشاء الرابط." },
  it: { share: "🔗 Condividi questa mano", copied: "Copiato", failed: "Impossibile creare il collegamento." },
  pl: { share: "🔗 Udostępnij to rozdanie", copied: "Skopiowano", failed: "Nie udało się utworzyć linku." },
  th: { share: "🔗 แชร์มือนี้", copied: "คัดลอกแล้ว", failed: "ไม่สามารถสร้างลิงก์ได้" },
  uk: { share: "🔗 Поширити роздачу", copied: "Скопійовано", failed: "Не вдалося створити посилання." },
};

/** 본체에 보내고 짧은 주소를 받는다. 실패·3초 초과·이상한 답 = null */
const postHandShare = async (body: string): Promise<string | null> => {
  const api = MAIN_SITE_CONFIG.handShareApi;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const origin = new URL(api).origin;
    const response = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
      body,
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || (result as { ok?: unknown }).ok !== true) return null;
    const { id, url } = result as { id?: unknown; url?: unknown };
    if (typeof url === "string") {
      const parsed = new URL(url);
      if (parsed.origin === origin && !parsed.username && !parsed.password && !parsed.search && !parsed.hash && SHORT_PATH.test(parsed.pathname)) return parsed.href;
    }
    if (typeof id === "string" && SHORT_PATH.test(`/h/${id}`)) return `${origin}/h/${id}`;
  } catch {
    // 꺼진 망·거절·시간 초과 — 공유를 막지 않는다(요약 한 줄로 넘어간다)
  } finally {
    clearTimeout(timer);
  }
  return null;
};

/** 누른 그 순간에 여는 클립보드 쓰기 — 글은 나중에 채운다. null을 넘기면 쓰지 않고 접는다 */
type PendingCopy = { settle: (text: string | null) => Promise<boolean> };
const openPendingCopy = (): PendingCopy | null => {
  try {
    if (typeof ClipboardItem === "undefined" || typeof navigator.clipboard?.write !== "function") return null;
    let fill: (blob: Blob) => void = () => undefined;
    let drop: (reason: unknown) => void = () => undefined;
    const later = new Promise<Blob>((resolve, reject) => {
      fill = resolve;
      drop = reject;
    });
    later.catch(() => undefined);
    const written = navigator.clipboard.write([new ClipboardItem({ "text/plain": later })]).then(
      () => true,
      () => false
    );
    return {
      settle: (text) => {
        if (text === null) drop(new Error("not needed"));
        else fill(new Blob([text], { type: "text/plain" }));
        return written;
      },
    };
  } catch {
    return null;
  }
};

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 아래 옛 방식으로
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
};

const isPhone = (): boolean => {
  try {
    return typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
};

export type HandShareState = {
  busy: boolean;
  /** 복사에 성공했다(주소 또는 요약) */
  copied: boolean;
  /** 주소를 못 만들었다 */
  failed: boolean;
  /** 고를 수 있게 보여 줄 글 — 실패면 요약 한 줄 · 복사가 막히면 그 주소 */
  text: string;
};

/** 화면 하나에 하나 — share(판, 한 줄 요약) · clear()는 판이 바뀔 때 */
export const createHandShare = () => {
  const state = reactive<HandShareState>({ busy: false, copied: false, failed: false, text: "" });
  let made: { body: string; url: string } | null = null;
  let token = 0;

  const clear = () => {
    token++;
    state.copied = false;
    state.failed = false;
    state.text = "";
  };

  /** 주소가 생겼다 — 폰 = 공유 시트(막히면 복사) · PC = 복사 */
  const deliver = async (url: string, phone: boolean, pending: PendingCopy | null, mine: number) => {
    if (phone) {
      try {
        await navigator.share({ url });
        void pending?.settle(null);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          void pending?.settle(null);
          return;
        }
        // 막힘(NotAllowedError 등) — 아래 복사로
      }
    }
    const copied = (pending ? await pending.settle(url) : false) || (await copyText(url));
    if (mine !== token) return;
    state.copied = copied;
    if (!copied) state.text = url;
  };

  const share = (hand: ShareHand | null, line: string) => {
    if (state.busy) return;
    clear();
    const mine = token;
    trackHandShare();
    let body = "";
    try {
      const payload = hand ? buildHandShare(hand) : null;
      body = payload ? JSON.stringify(payload) : "";
    } catch {
      body = "";
    }
    const phone = isPhone();
    // 같은 판을 다시 누름 — 기다림 없이 이 동작 안에서
    if (body && made?.body === body) {
      void deliver(made.url, phone, null, mine);
      return;
    }
    state.busy = true;
    const pending = openPendingCopy();
    void (async () => {
      try {
        const url = body && body.length <= HAND_SHARE_BODY_MAX ? await postHandShare(body) : null;
        if (url) {
          made = { body, url };
          await deliver(url, phone, pending, mine);
          return;
        }
        const copied = (pending ? await pending.settle(line) : false) || (await copyText(line));
        if (mine !== token) return;
        state.failed = true;
        state.copied = copied;
        state.text = line;
      } finally {
        state.busy = false;
      }
    })();
  };

  return { state, share, clear };
};
