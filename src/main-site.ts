/**
 * GTOZero판(app.gtozero.com)이 바깥과 이어지는 값 — 소개 사이트 gtozero.com 하나뿐이다.
 */
import type { MainSite } from "./main-site-type";

export type { MainSite };


// 공지는 두 주소가 같은 notice.json을 받는다 — 다른 사이트 이름이 든 공지는 이 주소에 띄우지 않는다.
// 낱말은 글자 코드로 둔다(빌드 때 이름 바꾸기가 이 목록까지 바꾸지 않게).
const otherSiteWords = [
  String.fromCharCode(104, 111, 108, 100, 101, 109, 109, 97, 115, 116, 101, 114),
  String.fromCharCode(0xd640, 0xb364, 0xb9c8, 0xc2a4, 0xd130),
];

export const MAIN_SITE_CONFIG: MainSite = {
  origin: "https://gtozero.com",
  localePaths: { es: "/es" },
  feedbackApi: "",
  shareApi: "",
  shareOrigin: "",
  reviewsSummaryApi: "",
  articleUrls: {},
  authCookie: "sb-gtozero-auth-token",
  sharedCookieDomain: "",
  noticeHrefHosts: ["gtozero.com", "app.gtozero.com"],
  noticeBlockedWords: otherSiteWords,
  community: false,
  languagePicker: true, // gtozero.com은 en·es뿐이라 페깅할 언어별 사이트가 없다
  homeOnlyLinks: true,
  utmSource: "app",
};
