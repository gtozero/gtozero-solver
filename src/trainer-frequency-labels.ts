// «빈도 입력» 연습 문구 — 20언어
// 설계 참고자료/빈도입력연습_설계안_2026-11-26.md · 허용 폭 숫자는 FREQUENCY_CLOSE_PP를 끼워 넣는다(문구에 박지 않는다)
import type { LocaleDict } from "./i18n";
import type { FrequencyVerdict } from "./trainer-frequency";

type FrequencyLabels = {
  mode: Record<"off" | "on", string>;
  modeHelp: string;
  prompt: string;
  resultPrompt: string;
  confirm: string;
  verdict: Record<FrequencyVerdict, string>;
  match: (value: string) => string;
  mine: string;
  solver: string;
  advice: { exact: string; close: string; short: (action: string, pp: string) => string };
  evLoss: (bb: string) => string;
  mixNote: string;
  basis: (pp: string) => string;
};

// shortBy는 1도 될 수 있다. 숫자를 받는 단위는 단수·복수와 de의 격을 함께 고른다.
const enPoints = (n: string) => `${n} percentage point${n === "1" ? "" : "s"}`;
const esPoints = (n: string) => `${n} ${n === "1" ? "punto porcentual" : "puntos porcentuales"}`;
const ptPoints = (n: string) => `${n} ${n === "1" ? "ponto percentual" : "pontos percentuais"}`;
const dePoints = (n: string, dative = false) =>
  `${n} ${n === "1" ? "Prozentpunkt" : dative ? "Prozentpunkten" : "Prozentpunkte"}`;
const frPoints = (n: string) => `${n} point${n === "1" ? "" : "s"} de pourcentage`;
const itPoints = (n: string) => `${n} ${n === "1" ? "punto percentuale" : "punti percentuali"}`;

export const FREQ_M: LocaleDict<FrequencyLabels> = {
  ko: {
    mode: { off: "빈도 입력: 끔", on: "빈도 입력: 켬" },
    modeHelp:
      "액션 하나를 고르는 대신, 이 핸드로 각 액션을 몇 % 할지 막대를 나눠 답합니다. 오늘의 문제에는 쓰지 않습니다.",
    prompt: "이 핸드로 각 액션을 몇 % 하시겠어요? 막대를 끌어 나누세요.",
    resultPrompt: "내 답과 솔버",
    confirm: "확인",
    verdict: { close: "가까워요", mix: "비율이 달라요", losing: "손해 보는 액션이 섞였어요" },
    match: (value) => `빈도 일치도 ${value}`,
    mine: "내 답",
    solver: "솔버",
    advice: {
      exact: "정확해요.",
      close: "이 정도 차이는 같은 답으로 봅니다.",
      short: (action, pp) => `솔버의 «${action}» 빈도는 내 답보다 ${pp}%p 높습니다.`,
    },
    evLoss: (bb) => `내 답의 EV 손실 ${bb}bb`,
    mixNote: " — EV는 거의 같고 섞는 비율만 다릅니다",
    basis: (pp) =>
      `솔버를 다시 계산하면 빈도가 조금 달라질 수 있습니다. EV 손실이 허용 범위 안이고 전체 비율 차이가 ${pp}%p 이내면 맞은 답으로 봅니다.`,
  },
  en: {
    mode: { off: "Frequencies: Off", on: "Frequencies: On" },
    modeHelp:
      "Instead of picking one action, split the bar to say how often you take each action with this hand. Not used for the Daily Puzzle.",
    prompt: "How often do you take each action with this hand? Drag the bar to split it.",
    resultPrompt: "You vs. the solver",
    confirm: "Confirm",
    verdict: { close: "Close", mix: "Different mix", losing: "EV loss is too high" },
    match: (value) => `Frequency match ${value}`,
    mine: "You",
    solver: "Solver",
    advice: {
      exact: "Frequency match: 100.",
      close: "The frequency gap is within tolerance.",
      short: (action, pp) => `For “${action}”, the solver's frequency is ${enPoints(pp)} higher than yours.`,
    },
    evLoss: (bb) => `EV loss of your answer: ${bb}bb`,
    mixNote: " — about the same EV, only the mix differs",
    basis: (pp) =>
      `Solver frequencies can shift a little when you re-solve. With EV loss within the acceptable limit, an overall frequency gap of ${enPoints(pp)} or less counts as correct.`,
  },
  es: {
    mode: { off: "Frecuencias: No", on: "Frecuencias: Sí" },
    modeHelp:
      "En vez de elegir una sola acción, divide la barra para indicar con qué frecuencia elegirías cada acción con esta mano. No se usa en el Reto del día.",
    prompt:
      "¿Con qué frecuencia elegirías cada acción con esta mano? Arrastra los separadores de la barra.",
    resultPrompt: "Tu respuesta y el solver",
    confirm: "Confirmar",
    verdict: { close: "Muy cerca", mix: "Proporciones distintas", losing: "Pérdida de EV alta" },
    match: (value) => `Coincidencia de frecuencias ${value}`,
    mine: "Tu respuesta",
    solver: "Solver",
    advice: {
      exact: "Coincidencia de frecuencias: 100.",
      close: "La diferencia de frecuencias está dentro del margen.",
      short: (action, pp) =>
        `La frecuencia del solver para «${action}» supera la de tu respuesta en ${esPoints(pp)}.`,
    },
    evLoss: (bb) => `Pérdida de EV de tu respuesta: ${bb}bb`,
    mixNote: " — el EV es casi igual; solo cambian las proporciones",
    basis: (pp) =>
      `Las frecuencias del solver pueden variar un poco al recalcular. Si la pérdida de EV está dentro del límite aceptable, una diferencia global de hasta ${esPoints(pp)} cuenta como respuesta correcta.`,
  },
  pt: {
    mode: { off: "Frequências: Não", on: "Frequências: Sim" },
    modeHelp:
      "Em vez de escolher uma só ação, divida a barra para indicar com que frequência você escolheria cada ação com esta mão. Não é usado no Desafio do dia.",
    prompt:
      "Com que frequência você escolheria cada ação com esta mão? Arraste os divisores da barra.",
    resultPrompt: "Sua resposta e o solver",
    confirm: "Confirmar",
    verdict: { close: "Bem perto", mix: "Proporções diferentes", losing: "Perda de EV alta" },
    match: (value) => `Correspondência das frequências ${value}`,
    mine: "Sua resposta",
    solver: "Solver",
    advice: {
      exact: "Correspondência das frequências: 100.",
      close: "A diferença entre as frequências está dentro da margem.",
      short: (action, pp) =>
        `Para “${action}”, a frequência do solver é ${ptPoints(pp)} maior que a da sua resposta.`,
    },
    evLoss: (bb) => `Perda de EV da sua resposta: ${bb}bb`,
    mixNote: " — o EV é quase igual; só as proporções mudam",
    basis: (pp) =>
      `As frequências do solver podem variar um pouco a cada novo cálculo. Com a perda de EV dentro do limite aceitável, uma diferença global de até ${ptPoints(pp)} conta como resposta correta.`,
  },
  de: {
    mode: { off: "Frequenzen: Aus", on: "Frequenzen: An" },
    modeHelp:
      "Statt eine einzelne Aktion zu wählen, teilst du den Balken auf und gibst an, wie oft du jede Aktion mit dieser Hand spielst. Nicht für die Tagesaufgabe.",
    prompt:
      "Wie oft spielst du die einzelnen Aktionen mit dieser Hand? Zieh an den Trennlinien im Balken.",
    resultPrompt: "Deine Antwort und der Solver",
    confirm: "Bestätigen",
    verdict: { close: "Nah dran", mix: "Andere Anteile", losing: "Hoher EV-Verlust" },
    match: (value) => `Übereinstimmung der Frequenzen ${value}`,
    mine: "Deine Antwort",
    solver: "Solver",
    advice: {
      exact: "Übereinstimmung der Frequenzen: 100.",
      close: "Die Abweichung der Frequenzen liegt im Toleranzbereich.",
      short: (action, pp) =>
        `Bei „${action}“ liegt die Frequenz des Solvers um ${dePoints(pp)} über deiner Angabe.`,
    },
    evLoss: (bb) => `EV-Verlust deiner Antwort: ${bb}bb`,
    mixNote: " – fast gleicher EV, nur andere Anteile",
    basis: (pp) =>
      `Bei einer neuen Berechnung können sich die Solver-Frequenzen leicht ändern. Liegt der EV-Verlust im vertretbaren Bereich, gilt eine Gesamtabweichung von höchstens ${dePoints(pp, true)} als richtig.`,
  },
  fr: {
    mode: { off: "Fréquences : non", on: "Fréquences : oui" },
    modeHelp:
      "Au lieu de choisir une seule action, divise la barre pour indiquer à quelle fréquence tu choisis chaque action avec cette main. Non utilisé pour le Défi du jour.",
    prompt:
      "À quelle fréquence choisis-tu chaque action avec cette main ? Fais glisser les curseurs sur la barre.",
    resultPrompt: "Ta réponse et le solver",
    confirm: "Confirmer",
    verdict: { close: "C'est proche", mix: "Proportions différentes", losing: "Perte d'EV élevée" },
    match: (value) => `Correspondance des fréquences ${value}`,
    mine: "Ta réponse",
    solver: "Solver",
    advice: {
      exact: "Correspondance des fréquences : 100.",
      close: "L'écart entre les fréquences reste dans la marge.",
      short: (action, pp) =>
        `Pour « ${action} », la fréquence du solver dépasse celle de ta réponse de ${frPoints(pp)}.`,
    },
    evLoss: (bb) => `Perte d'EV de ta réponse : ${bb}bb`,
    mixNote: " — l'EV est presque identique, seules les proportions changent",
    basis: (pp) =>
      `Les fréquences du solver peuvent varier un peu à chaque nouveau calcul. Si la perte d'EV reste dans la limite acceptable, un écart global d'au plus ${frPoints(pp)} compte comme une bonne réponse.`,
  },
  it: {
    mode: { off: "Frequenze: No", on: "Frequenze: Sì" },
    modeHelp:
      "Invece di scegliere una sola azione, dividi la barra per indicare con quale frequenza scegli ogni azione con questa mano. Non si usa nella Sfida del giorno.",
    prompt:
      "Con quale frequenza scegli ogni azione con questa mano? Trascina i cursori sulla barra.",
    resultPrompt: "La tua risposta e il solver",
    confirm: "Conferma",
    verdict: { close: "Frequenze vicine", mix: "Proporzioni diverse", losing: "EV loss alta" },
    match: (value) => `Corrispondenza delle frequenze ${value}`,
    mine: "La tua risposta",
    solver: "Solver",
    advice: {
      exact: "Corrispondenza delle frequenze: 100.",
      close: "Lo scarto tra le frequenze rientra nel margine.",
      short: (action, pp) =>
        `Per «${action}», la frequenza del solver supera quella della tua risposta di ${itPoints(pp)}.`,
    },
    evLoss: (bb) => `EV loss della tua risposta: ${bb}bb`,
    mixNote: " — l’EV è quasi uguale, cambiano solo le proporzioni",
    basis: (pp) =>
      `Le frequenze del solver possono variare leggermente a ogni nuovo calcolo. Se l’EV loss resta entro il limite accettabile, uno scarto complessivo fino a ${itPoints(pp)} conta come risposta corretta.`,
  },
  ru: {
    mode: { off: "Частоты: Выкл", on: "Частоты: Вкл" },
    modeHelp:
      "Вместо одного действия задай частоты всех действий с этой рукой, разделив полосу. В режиме «Задача дня» не используется.",
    prompt: "Как часто выберешь каждое действие с этой рукой? Перетаскивай границы на полосе.",
    resultPrompt: "Твой ответ и солвер",
    confirm: "Подтвердить",
    verdict: { close: "Близко", mix: "Другие пропорции", losing: "Слишком большая потеря EV" },
    match: (value) => `Совпадение частот ${value}`,
    mine: "Твой ответ",
    solver: "Солвер",
    advice: {
      exact: "Совпадение частот: 100.",
      close: "Разница частот в пределах допуска.",
      short: (action, pp) =>
        `Для действия «${action}» частота у солвера на ${pp} п. п. выше, чем в твоём ответе.`,
    },
    evLoss: (bb) => `Потеря EV в твоём ответе: ${bb}bb`,
    mixNote: " — EV почти одинаковое, отличаются только пропорции действий",
    basis: (pp) =>
      `Частоты солвера могут немного меняться при повторном расчёте. Если потеря EV допустима, ответ с общим расхождением не более ${pp} п. п. считается верным.`,
  },
  uk: {
    mode: { off: "Частоти: Вимкнено", on: "Частоти: Увімкнено" },
    modeHelp:
      "Замість однієї дії вкажи частоту кожної дії з цією рукою, поділивши смужку. У режимі «Завдання дня» не використовується.",
    prompt: "Як часто ти обиратимеш кожну дію з цією рукою? Перетягуй межі на смужці.",
    resultPrompt: "Твоя відповідь і солвер",
    confirm: "Підтвердити",
    verdict: { close: "Близько", mix: "Інші пропорції", losing: "Завелика втрата EV" },
    match: (value) => `Збіг частот ${value}`,
    mine: "Твоя відповідь",
    solver: "Солвер",
    advice: {
      exact: "Збіг частот: 100.",
      close: "Різниця частот у межах допуску.",
      short: (action, pp) =>
        `Для дії «${action}» частота в солвера на ${pp} pp вища, ніж у твоїй відповіді.`,
    },
    // uk의 $n은 산문을 그대로 두므로 숫자 인자에서 소수점을 현지화한다.
    evLoss: (bb) => `Втрата EV у твоїй відповіді: ${bb.replace(".", ",")}bb`,
    mixNote: " — EV майже однакове, відрізняються лише пропорції дій",
    basis: (pp) =>
      `Частоти солвера можуть трохи змінюватися після повторного розрахунку. Тому за прийнятної втрати EV відповідь із загальною різницею не більш як ${pp} pp вважається правильною.`,
  },
  pl: {
    mode: { off: "Częstotliwości: wył.", on: "Częstotliwości: wł." },
    modeHelp:
      "Zamiast wybierać jedną akcję, podziel pasek i podaj, jak często zagrasz każdą akcję z tą ręką. Nie działa w trybie „Zadanie dnia”.",
    prompt: "Jak często zagrasz każdą akcję z tą ręką? Przeciągnij granice na pasku.",
    resultPrompt: "Twoja odpowiedź i solver",
    confirm: "Zatwierdź",
    verdict: { close: "Blisko", mix: "Inne proporcje", losing: "Zbyt duża strata EV" },
    match: (value) => `Zgodność częstotliwości ${value}`,
    mine: "Twoja odpowiedź",
    solver: "Solver",
    advice: {
      exact: "Zgodność częstotliwości: 100.",
      close: "Różnica częstotliwości jest dopuszczalna.",
      short: (action, pp) =>
        `Solver wybiera akcję „${action}” o ${pp} pp częściej niż w twojej odpowiedzi.`,
    },
    evLoss: (bb) => `Strata EV twojej odpowiedzi: ${bb}bb`,
    mixNote: " — EV jest niemal takie samo, różnią się tylko proporcje akcji",
    basis: (pp) =>
      `Częstotliwości solvera mogą się nieco zmieniać po ponownym obliczeniu. Przy dopuszczalnej stracie EV odpowiedź z łączną różnicą do ${pp} pp włącznie uznajemy za poprawną.`,
  },
  tr: {
    mode: { off: "Sıklık: Kapalı", on: "Sıklık: Açık" },
    modeHelp:
      "Tek bir aksiyon seçmek yerine çubuğu bölerek bu elle her aksiyonu ne sıklıkla oynayacağını belirtirsin. “Günün sorusu” modunda kullanılmaz.",
    prompt: "Bu elle her aksiyonu ne sıklıkla oynarsın? Çubuktaki sınırları sürükle.",
    resultPrompt: "Cevabın ve solver",
    confirm: "Onayla",
    verdict: { close: "Yakın", mix: "Oranlar farklı", losing: "EV kaybı fazla" },
    match: (value) => `Sıklık uyumu ${value}`,
    mine: "Cevabın",
    solver: "Solver",
    advice: {
      exact: "Sıklık uyumu: 100.",
      close: "Sıklık farkı kabul edilen aralıkta.",
      short: (action, pp) =>
        `“${action}” aksiyonu: solver bunu cevabına göre ${pp} yüzde puan daha sık oynuyor.`,
    },
    evLoss: (bb) => `Cevabının EV kaybı: ${bb}bb`,
    mixNote: " — EV neredeyse aynı, yalnızca aksiyon oranları farklı",
    basis: (pp) =>
      `Solver sıklıkları yeniden hesaplamada biraz değişebilir. EV kaybı kabul edilebilir düzeydeyse genel sıklık farkı ${pp} yüzde puanı aşmayan cevap doğru sayılır.`,
  },
  ar: {
    mode: { off: "التكرار: إيقاف", on: "التكرار: تشغيل" },
    modeHelp:
      "بدل اختيار قرار واحد، قسّم الشريط لتحدد تكرار كل قرار بهذه اليد. لا يُستخدم في وضع «سؤال اليوم».",
    prompt: "كم مرة تختار كل قرار بهذه اليد؟ اسحب الحدود على الشريط لتوزيع النسب.",
    resultPrompt: "إجابتك والسولفر",
    confirm: "تأكيد",
    verdict: { close: "قريب", mix: "النسب مختلفة", losing: "خسارة \u2066EV\u2069 تتجاوز المقبول" },
    match: (value) => `تطابق التكرار \u2066${value}\u2069`,
    mine: "إجابتك",
    solver: "السولفر",
    advice: {
      exact: "تطابق التكرار: \u2066100\u2069.",
      close: "فرق التكرار ضمن الحد المقبول.",
      short: (action, pp) =>
        `القرار «\u2068${action}\u2069»: تكراره لدى السولفر أعلى من إجابتك. الفرق بالنقاط المئوية: \u2066${pp}\u2069.`,
    },
    evLoss: (bb) => `خسارة \u2066EV\u2069 في إجابتك: \u2066${bb}bb\u2069`,
    mixNote: " — قيمة \u2066EV\u2069 متقاربة، والاختلاف في نسب القرارات فقط",
    basis: (pp) =>
      `قد يتغير تكرار قرارات السولفر قليلًا عند إعادة الحساب. إذا كانت خسارة \u2066EV\u2069 مقبولة، تُعد الإجابة صحيحة عندما لا يتجاوز فرق التكرار الإجمالي هذا الحد بالنقاط المئوية: \u2066${pp}\u2069.`,
  },
  hi: {
    mode: { off: "आवृत्ति: बंद", on: "आवृत्ति: चालू" },
    modeHelp:
      "एक एक्शन चुनने के बजाय बार बाँटकर बताएँ कि इस हैंड के साथ हर एक्शन कितनी बार चुनेंगे। यह आज की चुनौती में इस्तेमाल नहीं होता।",
    prompt: "इस हैंड के साथ हर एक्शन कितनी बार चुनेंगे? बार की सीमाएँ खींचकर प्रतिशत बाँटें।",
    resultPrompt: "आपका जवाब और सॉल्वर",
    confirm: "पुष्टि करें",
    verdict: { close: "करीब है", mix: "अनुपात अलग हैं", losing: "EV नुकसान ज़्यादा है" },
    match: (value) => `आवृत्ति का मिलान ${value}`,
    mine: "आपका जवाब",
    solver: "सॉल्वर",
    advice: {
      exact: "आवृत्ति का मिलान: 100.",
      close: "आवृत्ति का अंतर स्वीकार्य सीमा में है।",
      short: (action, pp) =>
        `एक्शन «${action}»: सॉल्वर की आवृत्ति आपके जवाब से ${pp} प्रतिशत अंक ज़्यादा है।`,
    },
    evLoss: (bb) => `आपके जवाब का EV नुकसान: ${bb}bb`,
    mixNote: " — EV लगभग बराबर है, सिर्फ़ एक्शन के अनुपात अलग हैं",
    basis: (pp) =>
      `दोबारा गणना करने पर सॉल्वर की आवृत्तियाँ थोड़ी बदल सकती हैं। इसलिए EV नुकसान स्वीकार्य सीमा में हो और आवृत्तियों में कुल अंतर ${pp} प्रतिशत अंक से ज़्यादा न हो, तो जवाब सही माना जाता है।`,
  },
  ja: {
    mode: { off: "頻度: オフ", on: "頻度: オン" },
    modeHelp:
      "アクションを1つ選ぶ代わりに、バーを分けて、このハンドで各アクションを使う頻度を入力します。今日のGTO問題では使いません。",
    prompt: "このハンドで各アクションを何%使いますか? バーをドラッグして割合を分けてください。",
    resultPrompt: "あなたの答えとソルバー",
    confirm: "確認",
    verdict: { close: "近いです", mix: "割合が違います", losing: "EVロスが大きいです" },
    match: (value) => `頻度一致度 ${value}`,
    mine: "あなたの答え",
    solver: "ソルバー",
    advice: {
      exact: "頻度一致度は100です。",
      close: "頻度の差は許容範囲内です。",
      short: (action, pp) =>
        `「${action}」の頻度は、ソルバーの方があなたの答えより${pp}%ポイント高くなっています。`,
    },
    evLoss: (bb) => `あなたの答えのEVロス ${bb}bb`,
    mixNote: " — EVはほぼ同じで、アクションを混ぜる割合だけが違います",
    basis: (pp) =>
      `ソルバーの頻度は再計算すると少し変わることがあります。そのため、EVロスが許容範囲内で、全体の比率の差が${pp}%ポイント以内なら正解とみなします。`,
  },
  zh: {
    mode: { off: "频率：关", on: "频率：开" },
    modeHelp:
      "不用只选一个动作，而是拖动条上的分界点，分配这手牌各个动作的使用频率。今日题目不使用。",
    prompt: "这手牌你会按什么频率使用各个动作？拖动条上的分界点来分配比例。",
    resultPrompt: "我的答案与求解器",
    confirm: "确认",
    verdict: { close: "很接近", mix: "比例不同", losing: "EV 损失较大" },
    match: (value) => `频率匹配度 ${value}`,
    mine: "我的答案",
    solver: "求解器",
    advice: {
      exact: "频率匹配度为100。",
      close: "频率差异在允许范围内。",
      short: (action, pp) =>
        `对于“${action}”，求解器的频率比你的答案高 ${pp} 个百分点。`,
    },
    evLoss: (bb) => `我的答案的 EV 损失：${bb}bb`,
    mixNote: " — EV 几乎相同，只是各个动作的比例不同",
    basis: (pp) =>
      `重新计算时，求解器的频率可能略有变化。因此，只要 EV 损失在允许范围内，整体比例差异不超过 ${pp} 个百分点，就算答对。`,
  },
  "zh-hant": {
    mode: { off: "頻率：關", on: "頻率：開" },
    modeHelp:
      "不用只選一個動作，而是拖曳長條，設定拿這手牌時採用各個動作的頻率。今日題目不使用。",
    prompt: "拿這手牌時，你會多常採用各個動作？拖曳長條來分配比例。",
    resultPrompt: "我的答案與解算器",
    confirm: "確認",
    verdict: { close: "很接近", mix: "比例不同", losing: "EV 損失較大" },
    match: (value) => `頻率吻合度 ${value}`,
    mine: "我的答案",
    solver: "解算器",
    advice: {
      exact: "頻率吻合度為100。",
      close: "頻率差異在可接受的範圍內。",
      short: (action, pp) =>
        `「${action}」的頻率，解算器比你的答案高 ${pp} 個百分點。`,
    },
    evLoss: (bb) => `我的答案的 EV 損失：${bb}bb`,
    mixNote: " — EV 幾乎一樣，只有各個動作的比例不同",
    basis: (pp) =>
      `重新計算時，解算器的頻率可能會有些變化。因此，EV 損失在可接受的範圍內，而且整體比例差異不超過 ${pp} 個百分點，就算答對。`,
  },
  id: {
    mode: { off: "Frekuensi: Mati", on: "Frekuensi: Aktif" },
    modeHelp:
      "Alih-alih memilih satu aksi, geser pembatas untuk mengatur seberapa sering Anda memakai setiap aksi dengan hand ini. Tidak dipakai untuk Tantangan Harian.",
    prompt: "Seberapa sering Anda memakai setiap aksi dengan hand ini? Geser pembatas untuk membagi persentasenya.",
    resultPrompt: "Jawaban Anda dan solver",
    confirm: "Konfirmasi",
    verdict: { close: "Sudah dekat", mix: "Proporsinya berbeda", losing: "Kerugian EV tinggi" },
    match: (value) => `Kecocokan frekuensi ${value}`,
    mine: "Jawaban Anda",
    solver: "Solver",
    advice: {
      exact: "Skor kecocokan frekuensi Anda 100.",
      close: "Selisih frekuensi masih dalam batas toleransi.",
      short: (action, pp) =>
        `Untuk “${action}”, frekuensi solver ${pp} poin persen lebih tinggi daripada jawaban Anda.`,
    },
    evLoss: (bb) => `Kerugian EV jawaban Anda: ${bb}bb`,
    mixNote: " — EV hampir sama, hanya proporsi aksinya yang berbeda",
    basis: (pp) =>
      `Frekuensi solver bisa sedikit berubah saat dihitung ulang. Jika kerugian EV masih dalam batas toleransi, selisih proporsi keseluruhan hingga ${pp} poin persen dihitung benar.`,
  },
  ms: {
    mode: { off: "Kekerapan: Tutup", on: "Kekerapan: Buka" },
    modeHelp:
      "Daripada memilih satu tindakan sahaja, seret pembahagi untuk menetapkan kekerapan setiap tindakan bagi tangan ini. Tidak digunakan untuk Cabaran Harian.",
    prompt: "Berapa kerap anda memilih setiap tindakan dengan tangan ini? Seret pembahagi untuk menetapkan peratusannya.",
    resultPrompt: "Jawapan anda dan solver",
    confirm: "Sahkan",
    verdict: { close: "Hampir sama", mix: "Nisbah berbeza", losing: "Kerugian EV tinggi" },
    match: (value) => `Padanan kekerapan ${value}`,
    mine: "Jawapan anda",
    solver: "Solver",
    advice: {
      exact: "Skor padanan kekerapan anda ialah 100.",
      close: "Perbezaan kekerapan masih dalam had yang diterima.",
      short: (action, pp) =>
        `Bagi “${action}”, kekerapan solver lebih tinggi sebanyak ${pp} mata peratusan berbanding jawapan anda.`,
    },
    evLoss: (bb) => `Kerugian EV jawapan anda: ${bb}bb`,
    mixNote: " — EV hampir sama, hanya nisbah antara tindakan berbeza",
    basis: (pp) =>
      `Kekerapan solver boleh berubah sedikit apabila dikira semula. Jika kerugian EV masih dalam had yang boleh diterima, jurang kekerapan keseluruhan sehingga ${pp} mata peratusan dikira betul.`,
  },
  vi: {
    mode: { off: "Tần suất: Tắt", on: "Tần suất: Bật" },
    modeHelp:
      "Thay vì chọn một hành động, kéo các vạch chia để phân bổ tần suất cho từng hành động với tay bài này. Không dùng cho Thử thách hôm nay.",
    prompt: "Với tay bài này, bạn chọn mỗi hành động bao nhiêu phần trăm? Kéo các vạch chia để phân bổ.",
    resultPrompt: "Câu trả lời của bạn và solver",
    confirm: "Xác nhận",
    verdict: { close: "Gần khớp", mix: "Khác tỷ lệ", losing: "Mất quá nhiều EV" },
    match: (value) => `Độ khớp tần suất ${value}`,
    mine: "Câu trả lời của bạn",
    solver: "Solver",
    advice: {
      exact: "Độ khớp tần suất đạt 100.",
      close: "Chênh lệch tần suất nằm trong mức cho phép.",
      short: (action, pp) =>
        `Với “${action}”, tần suất của solver cao hơn tần suất bạn chọn ${pp} điểm phần trăm.`,
    },
    evLoss: (bb) => `EV mất của câu trả lời: ${bb}bb`,
    mixNote: " — EV gần như bằng nhau, chỉ khác tỷ lệ giữa các hành động",
    basis: (pp) =>
      `Tần suất của solver có thể thay đổi đôi chút khi tính lại. Khi EV mất nằm trong mức chấp nhận được, chênh lệch tần suất tổng thể không quá ${pp} điểm phần trăm được tính là đúng.`,
  },
  th: {
    mode: { off: "ความถี่: ปิด", on: "ความถี่: เปิด" },
    modeHelp:
      "กำหนดความถี่ของแ⁠ต่⁠ล⁠ะแ⁠อ็⁠ก⁠ชั⁠นด้วยการแบ่งแถบ แทนการเลือกเพียงแ⁠อ็⁠ก⁠ชั⁠นเดียวสำหรับไพ่ในมือนี้ โหมดนี้ไม่ใช้กับ “โจทย์ประจำวัน”",
    prompt: "ไพ่ในมือนี้ คุณจะใช้แ⁠ต่⁠ล⁠ะแ⁠อ็⁠ก⁠ชั⁠นกี่เ⁠ป⁠อ⁠ร์⁠เ⁠ซ็⁠น⁠ต์? ลากเส้นแบ่งเพื่อกำหนดสัดส่วน",
    resultPrompt: "คำตอบของคุณเทียบกับ Solver",
    confirm: "ยืนยัน",
    verdict: { close: "ใกล้เคียง", mix: "สัดส่วนต่างกัน", losing: "เสีย EV มากเกินไป" },
    match: (value) => `ความตรงกันของความถี่ ${value}`,
    mine: "คำตอบของคุณ",
    solver: "Solver",
    advice: {
      exact: "คะแนนความตรงกันของความถี่คือ 100",
      close: "ความต่างของความถี่อยู่ในเกณฑ์ที่ยอมรับได้",
      short: (action, pp) =>
        `สำหรับ “${action}” ความถี่ของ Solver สูงกว่าที่คุณตอบ ${pp} pp`,
    },
    evLoss: (bb) => `EV loss ของคำตอบของคุณ: ${bb}bb`,
    mixNote: " — EV แทบเท่ากัน ต่างกันเพียงสัดส่วนของแ⁠ต่⁠ล⁠ะแ⁠อ็⁠ก⁠ชั⁠น",
    basis: (pp) =>
      `ความถี่ของ Solver อาจต่างกันเล็กน้อยเมื่อคำนวณใหม่ ห⁠า⁠ก EV loss อยู่ในเกณฑ์ที่ยอมรับได้ และความต่างโดยรวมของสัดส่วนไม่เกิน ${pp} pp (percentage points) จะถือว่าตอบถูก`,
  },
};
