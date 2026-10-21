import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const siteUrl = "https://tutornow.kr";

const regions = [
  { slug: "pohang", name: "포항", type: "시", areas: "북구, 남구, 양덕동, 효자동, 이동", focus: "학교별 시험 일정과 단원별 취약점을 반영한 내신 관리" },
  { slug: "gyeongju", name: "경주", type: "시", areas: "황성동, 용강동, 동천동, 현곡면, 외동읍", focus: "생활권과 통학 일정을 고려한 꾸준한 학습 루틴" },
  { slug: "gimcheon", name: "김천", type: "시", areas: "율곡동, 신음동, 부곡동, 평화동, 아포읍", focus: "혁신도시와 구도심 학교 진도에 맞춘 개인별 수업" },
  { slug: "andong", name: "안동", type: "시", areas: "옥동, 용상동, 정하동, 송현동, 풍산읍", focus: "개념 설명과 서술형 풀이를 연결하는 내신 대비" },
  { slug: "gumi", name: "구미", type: "시", areas: "인동, 옥계동, 산동읍, 형곡동, 도량동", focus: "다양한 학교 진도와 목표를 반영한 취약 단원 관리" },
  { slug: "yeongju", name: "영주", type: "시", areas: "가흥동, 휴천동, 영주동, 풍기읍, 안정면", focus: "기초 연산부터 응용 문제까지 이어지는 단계별 학습" },
  { slug: "yeongcheon", name: "영천", type: "시", areas: "망정동, 문외동, 야사동, 금호읍, 완산동", focus: "현재 진도와 학습 시간을 고려한 현실적인 계획" },
  { slug: "sangju", name: "상주", type: "시", areas: "무양동, 냉림동, 남성동, 함창읍, 낙양동", focus: "오답 원인을 찾고 풀이 과정을 설명하는 수업" },
  { slug: "mungyeong", name: "문경", type: "시", areas: "모전동, 점촌동, 흥덕동, 문경읍, 가은읍", focus: "학년 전환기 복습과 선행의 균형 있는 설계" },
  { slug: "gyeongsan", name: "경산", type: "시", areas: "중산동, 정평동, 옥산동, 하양읍, 진량읍", focus: "학교별 내신 흐름과 진학 목표를 잇는 학습 관리" },
  { slug: "uiseong", name: "의성", type: "군", areas: "의성읍, 안계면, 금성면, 봉양면, 다인면", focus: "개인 진도와 반복 학습으로 다지는 수학의 기초" },
  { slug: "cheongsong", name: "청송", type: "군", areas: "청송읍, 진보면, 현동면, 안덕면, 부남면", focus: "거리와 일정을 고려한 대면·온라인 맞춤 수업" },
  { slug: "yeongyang", name: "영양", type: "군", areas: "영양읍, 입암면, 석보면, 수비면, 일월면", focus: "학습 공백을 줄이는 핵심 개념 반복과 피드백" },
  { slug: "yeongdeok", name: "영덕", type: "군", areas: "영덕읍, 강구면, 영해면, 축산면, 남정면", focus: "학교 시험 범위에 맞춘 개념 확인과 실전 연습" },
  { slug: "cheongdo", name: "청도", type: "군", areas: "청도읍, 화양읍, 풍각면, 이서면, 금천면", focus: "학생의 속도에 맞춰 자신감을 회복하는 일대일 수업" },
  { slug: "goryeong", name: "고령", type: "군", areas: "대가야읍, 다산면, 성산면, 개진면, 쌍림면", focus: "기초 개념부터 학교 내신까지 이어지는 맞춤 진도" },
  { slug: "seongju", name: "성주", type: "군", areas: "성주읍, 선남면, 초전면, 벽진면, 가천면", focus: "취약 단원 진단과 반복 풀이로 만드는 안정적인 성적" },
  { slug: "chilgok", name: "칠곡", type: "군", areas: "왜관읍, 석적읍, 북삼읍, 동명면, 약목면", focus: "학교와 생활권별 학습 환경을 반영한 내신 관리" },
  { slug: "yecheon", name: "예천", type: "군", areas: "호명읍, 예천읍, 감천면, 용궁면, 지보면", focus: "신도시와 읍면 지역 학생의 일정에 맞춘 수업 설계" },
  { slug: "bonghwa", name: "봉화", type: "군", areas: "봉화읍, 춘양면, 소천면, 물야면, 명호면", focus: "통학 여건과 개인 진도를 고려한 안정적인 학습 관리" },
  { slug: "uljin", name: "울진", type: "군", areas: "울진읍, 후포면, 죽변면, 북면, 평해읍", focus: "개념 이해와 문제 적용을 연결하는 밀착형 수업" },
  { slug: "ulleung", name: "울릉", type: "군", areas: "울릉읍, 서면, 북면, 도동리, 저동리", focus: "온라인 수업과 세밀한 피드백으로 이어가는 학습" }
];

const grades = [
  ["예비중1", "초등 계산 습관을 점검하고 문자와 식, 기본 도형으로 이어지는 중학 수학의 첫 틀을 만듭니다."],
  ["예비중2", "일차방정식과 함수의 기초를 다시 확인한 뒤 식의 계산과 연립방정식을 안정적으로 연결합니다."],
  ["예비중3", "고등 수학과 이어지는 함수·방정식·도형의 핵심을 복습하고 학교 시험의 난도에 대비합니다."],
  ["예비고1", "중학 전 범위의 빈틈을 진단하고 공통수학의 다항식, 방정식, 경우의 수를 체계적으로 시작합니다."],
  ["예비고2", "공통수학을 보완하면서 학교 선택 과목과 진로에 맞춰 대수·미적분Ⅰ·확률과 통계의 순서를 설계합니다."],
  ["예비고3", "수능 출제 단원별 개념과 기출을 연결하고 제한 시간 안에 점수를 만드는 실전 루틴을 완성합니다."]
];

const gradeInfo = {
  초1: "수 세기와 가르기·모으기, 한 자리 수 덧셈·뺄셈으로 수 감각과 바른 숫자 쓰기 습관을 만듭니다.",
  초2: "받아올림·받아내림이 있는 계산, 곱셈구구, 길이 재기를 반복 연습해 계산 실수를 줄입니다.",
  초3: "곱셈과 나눗셈, 분수의 첫 개념, 평면도형을 그림과 구체물로 이해하도록 지도합니다.",
  초4: "큰 수, 분수·소수의 덧셈과 뺄셈, 각도와 삼각형을 다루며 문장제 해석력을 기릅니다.",
  초5: "약수와 배수, 약분과 통분, 다각형의 넓이 등 중학 수학으로 이어지는 핵심 단원을 꼼꼼히 다집니다.",
  초6: "분수·소수의 나눗셈, 비와 비율, 입체도형을 정리하고 예비중1 과정으로 자연스럽게 연결합니다.",
  중1: "소인수분해, 정수와 유리수, 일차방정식, 좌표평면과 그래프 등 중학교 첫 내신을 안정적으로 준비합니다.",
  중2: "유리수와 순환소수, 식의 계산, 연립방정식, 일차함수, 도형의 성질과 닮음을 학교 시험에 맞춰 대비합니다.",
  중3: "제곱근과 실수, 인수분해, 이차방정식, 이차함수, 삼각비를 정리하며 고등 수학의 기초를 만듭니다.",
  고1: "공통수학1·2의 다항식, 방정식과 부등식, 경우의 수, 도형의 방정식, 집합과 명제, 함수를 내신 중심으로 관리합니다.",
  고2: "대수, 미적분Ⅰ, 확률과 통계 등 학교 선택 과목의 내신과 모의고사를 함께 준비합니다.",
  고3: "수능 범위 전 단원의 기출 분석과 실전 모의고사로 남은 기간의 점수 상승 전략을 세웁니다.",
  ...Object.fromEntries(grades)
};

const levels = [
  {
    slug: "elementary", label: "초등", student: "초등학생", eyebrow: "ELEMENTARY MATH",
    titleTail: "기초수학·수학공부 습관 1:1 수업",
    summary: "연산 정확도와 문장제 해석, 스스로 하는 수학공부 습관을 함께 잡는 초등 수학 1:1 수업",
    grades: ["초1", "초2", "초3", "초4", "초5", "초6"],
    topics: [
      { id: "lesson", keyword: "수학수업", text: r => `${r.short} 초등 수학수업은 교과서 개념을 학생이 직접 말로 설명하고 그림과 식으로 표현하는 과정으로 진행합니다. ${r.areas} 인근 학교의 단원 순서와 수행평가 일정을 확인해 진도를 맞춥니다.` },
      { id: "study", keyword: "수학공부", text: () => "하루 20~30분이라도 꾸준히 이어지는 수학공부 습관이 가장 중요합니다. 수업 후 복습 분량과 오답 정리 방법을 정해 과외가 없는 날에도 혼자 공부할 수 있게 돕습니다." },
      { id: "basic", keyword: "기초수학", text: () => "받아올림·받아내림, 곱셈구구, 분수와 소수처럼 학년이 올라갈수록 발목을 잡는 기초수학의 빈틈을 진단하고, 필요하면 이전 학년 단원까지 되돌아가 다시 다집니다." }
    ],
    faqs: r => [
      [`${r.short} 초등 수학과외는 몇 학년부터 가능한가요?`, "초등 1학년부터 6학년까지 모두 가능합니다. 저학년은 수 감각과 연산 습관, 고학년은 분수·비율과 문장제 해석, 예비중1 과정 준비를 중심으로 수업합니다."],
      ["수학학원과 1:1 수학과외는 어떻게 다른가요?", "학원은 정해진 반 진도를 따라가지만 1:1 수학과외는 학생이 막힌 지점부터 시작합니다. 초등 기초수학처럼 개인차가 큰 부분은 1:1 수업에서 더 빠르게 보완할 수 있습니다."]
    ]
  },
  {
    slug: "middle", label: "중등", student: "중학생", eyebrow: "MIDDLE SCHOOL MATH",
    titleTail: "수학내신·기초수학 1:1 수학수업",
    summary: "학교별 수학내신 대비와 기초수학 보완, 서술형 풀이까지 관리하는 중등 수학 1:1 수업",
    grades: ["예비중1", "중1", "예비중2", "중2", "예비중3", "중3"],
    topics: [
      { id: "lesson", keyword: "수학수업", text: r => `${r.short} 중등 수학수업은 최근 시험지와 오답을 먼저 분석한 뒤 개념 설명, 유형 연습, 서술형 풀이 점검 순서로 진행합니다. 특히 ${r.focus}에 초점을 둡니다.` },
      { id: "study", keyword: "수학공부", text: () => "중학교부터는 공부량보다 공부 방법이 성적을 가릅니다. 개념 노트, 오답 노트, 시험 2주 전 복습 계획을 함께 만들어 스스로 관리하는 수학공부를 연습합니다." },
      { id: "basic", keyword: "기초수학", text: () => "정수·유리수 계산, 문자와 식, 방정식처럼 중등 기초수학이 흔들리면 고등 수학에서 차이가 더 크게 벌어집니다. 진단 테스트로 막힌 단원을 찾아 필요하면 초등 과정까지 거슬러 보완합니다." },
      { id: "naesin", keyword: "수학내신", text: r => `${r.areas} 인근 중학교의 시험 범위, 출제 경향, 수행평가 비중을 확인해 학교별 수학내신을 대비합니다. 시험 4주 전부터 개념 정리, 교과서·학습지 반복, 실전 모의 시험 순서로 준비합니다.` }
    ],
    faqs: r => [
      [`${r.short} 중등 수학내신은 언제부터 준비하나요?`, "보통 시험 4주 전부터 학교별 범위에 맞춘 내신 대비를 시작합니다. 평소에는 현행 진도와 기초수학 보완을 함께 진행합니다."],
      ["중학 수학 기초가 부족해도 수업이 가능한가요?", "가능합니다. 진단 테스트로 막힌 단원을 찾은 뒤 필요하면 초등 과정부터 다시 다지고 현재 학년 진도로 연결합니다."]
    ]
  },
  {
    slug: "high", label: "고등", student: "고등학생", eyebrow: "HIGH SCHOOL MATH",
    titleTail: "내신·수능수학 대비 1:1 수학수업",
    summary: "고등 수학내신과 수능대비를 학년별 비중에 맞춰 설계하는 고등 수학 1:1 수업",
    grades: ["예비고1", "고1", "예비고2", "고2", "예비고3", "고3"],
    topics: [
      { id: "lesson", keyword: "수학수업", text: r => `${r.short} 고등 수학수업은 공통수학부터 대수·미적분Ⅰ·확률과 통계까지 학생의 학년과 목표에 맞춰 순서를 설계합니다. 특히 ${r.focus}에 초점을 둡니다.` },
      { id: "study", keyword: "수학공부", text: () => "고등 수학은 혼자 공부하는 시간이 성적을 결정합니다. 주간 학습 계획, 문제집 선택, 오답 재풀이 주기를 학생 일정에 맞춰 정하고 매 수업마다 실행 여부를 점검합니다." },
      { id: "basic", keyword: "기초수학", text: () => "고등 수학이 어렵게 느껴진다면 중학 과정의 인수분해, 이차함수, 방정식에 빈틈이 있는 경우가 많습니다. 필요한 중등 개념을 빠르게 복습한 뒤 현행 진도로 연결합니다." },
      { id: "naesin", keyword: "수학내신", text: r => `${r.areas} 인근 고등학교의 시험 범위와 기출 경향을 분석해 학교별 수학내신을 준비합니다. 교과서·부교재 변형 문제와 서술형 감점 요인을 집중 점검합니다.` },
      { id: "suneung", keyword: "수능대비", text: () => "고2 겨울부터는 수능대비 비중을 늘립니다. 모의고사 성적표로 단원별 취약 유형을 찾고, 시간 배분과 문항 선택 전략을 포함한 실전 훈련을 진행합니다." },
      { id: "suneung-math", keyword: "수능수학", text: () => "수능수학은 기출 속에서 반복되는 출제 원리를 읽어내는 시험입니다. 평가원 기출과 EBS 연계 교재를 단원별로 정리하고, 고난도 4점 문항의 접근법을 훈련합니다." }
    ],
    faqs: r => [
      [`${r.short} 고등 수학과외로 내신과 수능을 함께 준비할 수 있나요?`, "학년과 시기에 따라 비중을 조절합니다. 고1·고2는 수학내신 중심으로, 고2 겨울부터는 수능대비와 수능수학 기출 훈련 비중을 늘립니다."],
      ["고등 수학이 어려운데 기초부터 다시 할 수 있나요?", "가능합니다. 인수분해, 이차함수 등 필요한 중학 개념을 먼저 복습한 뒤 현행 진도를 따라갑니다."]
    ]
  }
];

const phone = "010-2928-3614";
const tel = `tel:${phone.replaceAll("-", "")}`;
const siteName = "경북 수학과외";
const ogImage = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=82";
const buildDate = new Date();

const ctx = region => ({ short: region.name, full: `${region.name}${region.type}`, areas: region.areas, focus: region.focus });
const regionUrl = region => `/regions/${region.slug}/`;
const levelUrl = (region, level) => `/regions/${region.slug}/${level.slug}/`;

const css = await readFile(path.join(root, "src", "style.css"), "utf8");
const regionSelectCards = regions.map(({ slug, name, type, areas }) => `<a class="region-select-card" href="/regions/${slug}/"><strong><span aria-hidden="true"></span>${name}${type}</strong><small>${areas.split(", ").map(area => `<span>${area}</span>`).join("")}</small></a>`).join("");

function layout({ title, description, canonical = siteUrl, body, schemas = [] }) {
  const organization = {
    "@context": "https://schema.org", "@type": "EducationalOrganization", name: siteName, url: siteUrl, telephone: "+82-10-2928-3614", description,
    areaServed: regions.map(({ name, type }) => ({ "@type": "AdministrativeArea", name: `경상북도 ${name}${type}` }))
  };
  const jsonLd = [organization, ...schemas].map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="naver-site-verification" content="da1ddc6d11fbaf9ca190d7ff71413f40b0220036"><meta name="google-site-verification" content="mgftAe9RcXTmkuF04LUcLRUBY-naUxZumX5YV-7Uu88"><title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow"><link rel="canonical" href="${canonical}"><link rel="alternate" type="application/rss+xml" title="${siteName}" href="${siteUrl}/rss.xml"><meta property="og:type" content="website"><meta property="og:site_name" content="${siteName}"><meta property="og:locale" content="ko_KR"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${ogImage}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${ogImage}"><link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/style.css">${jsonLd}</head><body><nav><div class="wrap nav-inner"><a class="brand" href="/">${siteName}</a><div class="nav-links"><a href="/#program">수업 방식</a><a href="/#levels">초등·중등·고등</a><a href="/#regions">지역 찾기</a><a href="${tel}">전화 상담</a></div></div></nav>${body}<div class="mobile-bar"><a href="${tel}">전화 상담</a><a href="/#regions">우리 지역 찾기</a></div></body></html>`;
}

function hero({ title, copy, eyebrow = "GYEONGBUK MATH TUTORING", crumbs = [], primary = ["#levels", "초등·중등·고등 수업 보기"], secondary = ["#regions", "22개 시군 찾기"] }) {
  const crumbNav = crumbs.length ? `<ol class="crumbs">${crumbs.map(([name, href], index) => index === crumbs.length - 1 ? `<li aria-current="page">${name}</li>` : `<li><a href="${href}">${name}</a></li>`).join("")}</ol>` : "";
  return `<header class="hero"><div class="wrap hero-inner">${crumbNav}<p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="hero-copy">${copy}</p><div class="hero-actions"><a class="button" href="${primary[0]}">${primary[1]}</a><a class="button phone-button" href="${tel}">${phone}</a><a class="text-link" href="${secondary[0]}">${secondary[1]} <span>→</span></a></div></div><p class="hero-note">경상북도 초등·중등·고등<br>개인별 수학 학습 설계</p></header>`;
}

const breadcrumbSchema = crumbs => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map(([name, href], index) => ({ "@type": "ListItem", position: index + 1, name, item: `${siteUrl}${href}` })) });
const faqSchema = faqs => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
const faqSection = (heading, faqs) => `<section class="faq" id="faq"><div class="wrap faq-grid"><div><p class="eyebrow dark">FAQ</p><h2>${heading}</h2></div><div>${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></section>`;
const cta = (heading, copy) => `<section class="cta"><div class="wrap cta-inner"><div><p class="eyebrow">CONTACT</p><h2>${heading}</h2><p>${copy}</p></div><a class="button" href="${tel}">전화 상담 ${phone}</a></div></section>`;
const areaFaq = r => [`${r.short} 어느 지역까지 수업하나요?`, `${r.areas} 등 ${r.full} 전역을 대상으로 상담합니다. 거리와 일정에 따라 방문 수업과 온라인 수업 중 맞는 방식을 안내합니다.`];
const contactFaq = label => [`${label} 상담은 어떻게 받나요?`, `${phone}로 전화 주시면 학년, 최근 성적, 원하는 수업 시간을 확인한 뒤 수업 방식과 일정을 안내해 드립니다.`];

const proof = `<section class="proof"><div class="wrap proof-grid"><div><strong>01</strong><p><b>현재 위치부터</b>시험지와 학습 이력으로 개념, 연산, 문제 해석의 약점을 구분합니다.</p></div><div><strong>02</strong><p><b>학교 진도에 맞게</b>목표 성적과 가능한 학습 시간을 반영해 현실적인 계획을 세웁니다.</p></div><div><strong>03</strong><p><b>스스로 설명하도록</b>풀이 이유를 말하고 유사 문제에 적용할 때까지 확인합니다.</p></div></div></section>`;
const process = `<section class="process" id="program"><div class="wrap process-grid"><div class="section-title"><p class="eyebrow dark">PERSONAL CURRICULUM</p><h2>많이 푸는 것보다<br>먼저 필요한 일</h2></div><div class="process-copy"><p class="lead">수학 성적은 학생마다 막히는 지점이 다릅니다. 정해진 진도를 그대로 따라가기보다 현재 이해도를 확인하고, 학교 일정과 목표를 한 흐름으로 연결합니다.</p><ol><li><span>진단</span><p>최근 시험과 오답에서 반복되는 원인을 찾습니다.</p></li><li><span>설계</span><p>복습, 현행, 선행의 비중을 학생별로 조절합니다.</p></li><li><span>관리</span><p>수업 결과를 다음 계획에 반영해 학습 공백을 줄입니다.</p></li></ol></div></div></section>`;
const gradeCards = grades.map(([name, text], index) => `<article class="grade"><span>0${index + 1}</span><h3>${name} 수학과외</h3><p>${text}</p></article>`).join("");
const gradeSection = `<section class="grades" id="grade"><div class="wrap"><div class="section-head"><div><p class="eyebrow dark">GRADE TRANSITION</p><h2>다음 학년의 수학은<br>준비부터 달라야 합니다</h2></div><p>빠른 선행보다 중요한 것은 이전 과정의 빈틈을 찾아 다음 개념과 연결하는 일입니다. 학년 전환기에 꼭 필요한 내용을 학생의 속도에 맞춰 준비합니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>`;

function regionsSection(level) {
  const links = regions.map(region => level
    ? `<a class="region-link" href="${levelUrl(region, level)}"><strong>${region.name} ${level.label} 수학</strong><span>${region.name}${region.type} ${level.label} 수학과외</span><b aria-hidden="true">→</b></a>`
    : `<a class="region-link" href="${regionUrl(region)}"><strong>${region.name}${region.type}</strong><span>${region.name} 수학과외 보기</span><b aria-hidden="true">→</b></a>`).join("");
  const heading = level ? `경북 지역별<br>${level.label} 수학과외` : "경북 지역별<br>수학과외 안내";
  const copy = level ? `포항부터 울릉까지 경상북도 22개 시군의 ${level.label} 수학 수업을 지역별로 확인하세요.` : "포항부터 울릉까지 경상북도 22개 시군별 초등·중등·고등 수학 수업을 확인하세요. 거주지와 일정, 학습 목표에 따라 대면 또는 온라인 수업을 안내합니다.";
  return `<section class="regions" id="regions"><div class="wrap"><div class="section-head"><div><p class="eyebrow">22 CITIES & COUNTIES</p><h2>${heading}</h2></div><p>${copy}</p></div><div class="region-grid">${links}</div></div></section>`;
}

function levelCards(region) {
  const r = region ? ctx(region) : null;
  return levels.map(level => {
    const href = region ? levelUrl(region, level) : "#regions";
    const name = region ? `${r.short} ${level.label} 수학` : `경북 ${level.label} 수학`;
    const topicLinks = level.topics.map(topic => region ? `<li><a href="${href}#${topic.id}">${r.short} ${level.label} ${topic.keyword}</a></li>` : `<li>${level.label} ${topic.keyword}</li>`).join("");
    const gradeLinks = region ? `<p class="level-grades">${level.grades.map(grade => `<a href="${href}#grades">${r.short} ${grade} 수학과외</a>`).join("")}</p>` : "";
    return `<article class="level-card"><p class="eyebrow dark">${level.eyebrow}</p><h3><a href="${href}">${name}</a></h3><p>${level.summary}</p><ul>${topicLinks}</ul>${gradeLinks}<a class="level-more" href="${href}">${region ? `${name} 자세히 보기` : "지역 선택하기"} <span>→</span></a></article>`;
  }).join("");
}

const levelSection = region => {
  const label = region ? `${region.name} 수학과외` : "경북 수학과외";
  return `<section class="levels" id="levels"><div class="wrap"><div class="section-head"><div><p class="eyebrow dark">ELEMENTARY · MIDDLE · HIGH</p><h2>${label}<br>초등·중등·고등 수업</h2></div><p>학교급마다 필요한 수학은 다릅니다. 초등은 기초수학과 공부 습관, 중등은 수학내신과 서술형, 고등은 내신과 수능수학을 학생별 비중에 맞춰 설계합니다.</p></div><div class="level-grid">${levelCards(region)}</div></div></section>`;
};

const regionSelector = `<dialog class="region-select" aria-labelledby="region-select-title"><div class="region-select-head"><div><p class="eyebrow dark">REGION SELECT</p><h2 id="region-select-title">어느 지역의 수학과외를 찾으시나요?</h2><p>시·군을 선택하면 해당 지역 안내로 바로 이동합니다.</p></div><button class="region-select-close" type="button" aria-label="지역 선택 창 닫기">×</button></div><div class="region-select-grid">${regionSelectCards}</div></dialog><script>(() => { try { if (sessionStorage.getItem("regionSelectShown")) return; sessionStorage.setItem("regionSelectShown", "1"); } catch {} const dialog = document.querySelector(".region-select"); const closeButton = dialog.querySelector(".region-select-close"); dialog.showModal(); document.body.classList.add("modal-open"); const close = () => { dialog.close(); document.body.classList.remove("modal-open"); }; closeButton.addEventListener("click", close); dialog.addEventListener("cancel", () => document.body.classList.remove("modal-open")); dialog.addEventListener("click", event => { if (event.target === dialog) close(); }); })();</script>`;
const philosophy = `<section class="philosophy"><div class="photo" role="img" aria-label="책상에서 수학을 공부하는 학생"></div><div class="philosophy-copy"><p class="eyebrow dark">STUDY WITH DIRECTION</p><h2>과외가 없는 날에도<br>혼자 풀 수 있도록</h2><p>문제를 읽고 조건을 표시하고 풀이를 검토하는 과정을 반복합니다. 정답만 맞히는 수업을 넘어, 새로운 문제 앞에서도 시작할 수 있는 자기만의 기준을 만듭니다.</p><ul><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>학년과 목표에 맞춘 진도 조정</li></ul></div></section>`;
const footerRegions = regions.map(region => `<a href="${regionUrl(region)}">${region.name} 수학과외</a>`).join("");
const footer = `<footer><div class="wrap footer-inner"><div><a class="brand" href="/">${siteName}</a><p>경상북도 초등·중등·고등 1:1 맞춤 수학 지도 · 상담 <a href="${tel}">${phone}</a></p></div><div><a href="/#program">수업 방식</a><a href="/#levels">초등·중등·고등</a><a href="/#regions">지역별 안내</a></div><p class="footer-regions">${footerRegions}</p><small>© 2026 ${siteName}. All rights reserved.</small></div></footer>`;

function homePage() {
  const title = "경북 수학과외 | 초등·중등·고등 1:1 수학수업·내신·수능대비";
  const description = `경상북도 22개 시군 초등·중등·고등 1:1 수학과외. 기초수학, 수학공부 습관, 수학내신, 수능수학까지 학생별 맞춤 수업. 전화 상담 ${phone}.`;
  const faqs = [
    ["경북 어느 지역에서 수학과외를 받을 수 있나요?", "포항, 경주, 구미, 경산, 안동 등 경상북도 22개 시군 학생을 대상으로 상담합니다. 거리와 일정에 따라 방문 수업과 온라인 수업을 안내합니다."],
    ["초등학생도 수학과외가 가능한가요?", "초등 1학년부터 고등 3학년까지 모두 가능합니다. 초등은 기초수학과 수학공부 습관, 중등은 수학내신, 고등은 내신과 수능수학을 중심으로 수업합니다."],
    contactFaq("경북 수학과외")
  ];
  const body = `${hero({ title: "경북 수학과외", copy: "포항부터 울릉까지, 학생의 현재 실력과 학교 진도에 맞춘 초등·중등·고등 1:1 수학수업. 기초수학부터 수학내신, 수능수학까지 이어지는 공부의 기준을 함께 세웁니다." })}${proof}${process}${levelSection()}${gradeSection}${regionsSection()}${philosophy}${faqSection("경북 수학과외<br>자주 묻는 질문", faqs)}${cta("우리 아이 수학,<br>어디서부터 시작할까요?", "학년과 최근 시험 결과를 알려주시면 지금 필요한 수업 방향을 안내해 드립니다.")}${footer}${regionSelector}`;
  return layout({ title, description, body, schemas: [faqSchema(faqs)] });
}

function regionPage(region) {
  const r = ctx(region);
  const url = regionUrl(region);
  const title = `${r.short} 수학과외 | 초등·중등·고등 1:1 수학수업·내신·수능`;
  const description = `${r.full} 수학과외. ${r.areas} 초등·중등·고등 1:1 수학수업. 기초수학, 수학내신, 수능대비까지 맞춤 관리. 전화 상담 ${phone}.`;
  const crumbs = [["홈", "/"], [`${r.short} 수학과외`, url]];
  const faqs = [[`${r.short} 수학과외는 어떤 학생이 받을 수 있나요?`, `${r.full} 초등 1학년부터 고등 3학년까지 수업합니다. 초등 기초수학, 중등 수학내신, 고등 내신·수능수학을 학년과 목표에 맞춰 안내합니다.`], areaFaq(r), contactFaq(`${r.short} 수학과외`)];
  const localIntro = `<section class="local"><div class="wrap local-grid"><div><p class="eyebrow dark">${r.full} LOCAL CLASS</p><h2>${r.short} 학생에게 맞는<br>현실적인 학습 계획</h2></div><div><p>${r.full} ${r.areas} 인근 초등·중등·고등 학생의 수학 학습을 안내합니다. 지역과 학교에 따라 시험 일정과 진도가 다른 만큼 최근 시험 결과, 현재 교재, 목표 성적을 먼저 확인합니다.</p><p>${r.focus}에 중심을 두고 수업하며, 이동 거리나 일정에 따라 온라인 수업도 함께 고려합니다. 초등은 기초수학과 공부 습관을, 중등은 학교별 수학내신을, 고등은 내신과 수능수학을 개인별 순서로 연결합니다.</p></div></div></section>`;
  const body = `${hero({ title: `${r.short}<br>수학과외`, copy: `${r.areas}에서 만나는 초등·중등·고등 1:1 수학수업. ${r.focus}에 집중해 공부의 방향을 분명하게 잡습니다.`, eyebrow: `${r.full} · GYEONGBUK`, crumbs })}${proof}${localIntro}${levelSection(region)}${faqSection(`${r.short} 수학과외<br>자주 묻는 질문`, faqs)}${cta(`${r.short} 수학과외<br>상담 안내`, `${r.full} 학생의 학년과 최근 시험 결과를 알려주시면 맞는 수업 방향을 안내해 드립니다.`)}${regionsSection()}${footer}`;
  return layout({ title, description, canonical: `${siteUrl}${url}`, body, schemas: [breadcrumbSchema(crumbs), faqSchema(faqs)] });
}

function levelPage(region, level) {
  const r = ctx(region);
  const url = levelUrl(region, level);
  const name = `${r.short} ${level.label} 수학`;
  const keywords = level.topics.map(topic => topic.keyword).join("·");
  const title = `${r.short} ${level.label} 수학과외 | ${level.titleTail}`;
  const description = `${r.full} ${level.label} 수학과외. ${level.grades.filter(grade => !grade.startsWith("예비")).join("·")} ${keywords} 1:1 맞춤 수업. ${r.areas} 인근 상담 ${phone}.`;
  const crumbs = [["홈", "/"], [`${r.short} 수학과외`, regionUrl(region)], [`${r.short} ${level.label} 수학`, url]];
  const faqs = [...level.faqs(r), areaFaq(r), contactFaq(`${r.short} ${level.label} 수학과외`)];
  const topicCards = level.topics.map((topic, index) => `<article class="grade" id="${topic.id}"><span>0${index + 1}</span><h3>${r.short} ${level.label} ${topic.keyword}</h3><p>${topic.text(r)}</p></article>`).join("");
  const topics = `<section class="topics" id="topics"><div class="wrap"><div class="section-head"><div><p class="eyebrow dark">${level.eyebrow}</p><h2>${name},<br>이렇게 수업합니다</h2></div><p>${r.full} ${level.student}의 현재 실력과 학교 진도를 먼저 확인하고 ${keywords}을 학생별 비중에 맞춰 설계합니다.</p></div><div class="grade-grid">${topicCards}</div></div></section>`;
  const gradeList = level.grades.map((grade, index) => `<article class="grade"><span>0${index + 1}</span><h3>${r.short} ${grade} 수학과외</h3><p>${gradeInfo[grade]}</p></article>`).join("");
  const gradesBlock = `<section class="grades" id="grades"><div class="wrap"><div class="section-head"><div><p class="eyebrow dark">BY GRADE</p><h2>${r.short} 학년별<br>${level.label} 수학과외</h2></div><p>같은 ${level.label} 과정이라도 학년마다 막히는 단원이 다릅니다. ${r.areas} 인근 학교 진도에 맞춰 학년별 핵심 단원을 준비합니다.</p></div><div class="grade-grid">${gradeList}</div></div></section>`;
  const siblings = levels.filter(other => other !== level).map(other => `<a href="${levelUrl(region, other)}">${r.short} ${other.label} 수학</a>`).join("");
  const localIntro = `<section class="local"><div class="wrap local-grid"><div><p class="eyebrow dark">${r.full} LOCAL CLASS</p><h2>${r.areas.split(", ").slice(0, 2).join("·")} 등<br>${r.short} ${level.label} 수학</h2></div><div><p>${r.full} ${r.areas} 인근 ${level.student}을 대상으로 1:1 수학수업을 진행합니다. ${r.focus}에 중심을 두고, 이동 거리나 일정에 따라 방문 수업과 온라인 수업 중 맞는 방식을 안내합니다.</p><p class="sibling-links">${siblings}<a href="${regionUrl(region)}">${r.short} 수학과외 전체</a></p></div></div></section>`;
  const body = `${hero({ title: `${r.short} ${level.label}<br>수학과외`, copy: `${r.areas} ${level.student}을 위한 ${level.summary}.`, eyebrow: `${r.full} · ${level.eyebrow}`, crumbs, primary: ["#topics", "수업 내용 보기"], secondary: ["#grades", "학년별 수업 보기"] })}${topics}${gradesBlock}${localIntro}${faqSection(`${name}<br>자주 묻는 질문`, faqs)}${cta(`${name},<br>지금 상담하세요`, `학년과 최근 시험 결과를 알려주시면 ${r.short} ${level.student}에게 맞는 수업 방향을 안내해 드립니다.`)}${regionsSection(level)}${footer}`;
  const service = { "@context": "https://schema.org", "@type": "Service", name: `${r.short} ${level.label} 수학과외`, serviceType: `${level.label} 수학과외`, description, provider: { "@type": "EducationalOrganization", name: siteName, url: siteUrl, telephone: "+82-10-2928-3614" }, areaServed: { "@type": "AdministrativeArea", name: `경상북도 ${r.full}` } };
  return { html: layout({ title, description, canonical: `${siteUrl}${url}`, body, schemas: [breadcrumbSchema(crumbs), faqSchema(faqs), service] }), title, description };
}

function faviconIco(size = 32) {
  const pixels = Buffer.alloc(size * size * 4);
  const center = (size - 1) / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const offset = ((size - 1 - y) * size + x) * 4;
      const corner = Math.max(Math.abs(x - center) - (center - 6), 0) ** 2 + Math.max(Math.abs(y - center) - (center - 6), 0) ** 2 > 36;
      const dot = (x - center) ** 2 + (y - center) ** 2 <= 49;
      const [r, g, b, a] = corner ? [0, 0, 0, 0] : dot ? [0xef, 0x76, 0x5f, 255] : [0x17, 0x4f, 0x3d, 255];
      pixels.set([b, g, r, a], offset);
    }
  }
  const mask = Buffer.alloc(size * Math.ceil(size / 32) * 4);
  const header = Buffer.alloc(6 + 16 + 40);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(40 + pixels.length + mask.length, 14);
  header.writeUInt32LE(22, 18);
  header.writeUInt32LE(40, 22);
  header.writeInt32LE(size, 26);
  header.writeInt32LE(size * 2, 30);
  header.writeUInt16LE(1, 34);
  header.writeUInt16LE(32, 36);
  header.writeUInt32LE(pixels.length + mask.length, 42);
  return Buffer.concat([header, pixels, mask]);
}
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#174f3d"/><circle cx="16" cy="16" r="7" fill="#ef765f"/></svg>\n`;

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets", "style.css"), css);
await writeFile(path.join(dist, "index.html"), homePage());
const pages = [{ url: `${siteUrl}/`, priority: "1.0", title: "경북 수학과외 | 초등·중등·고등 1:1 수학수업·내신·수능대비", description: "경상북도 22개 시군 초등·중등·고등 1:1 수학과외." }];
for (const region of regions) {
  const directory = path.join(dist, "regions", region.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), regionPage(region));
  pages.push({ url: `${siteUrl}${regionUrl(region)}`, priority: "0.9", title: `${region.name} 수학과외 | 초등·중등·고등 1:1 수학수업·내신·수능`, description: `${region.name}${region.type} 초등·중등·고등 1:1 수학과외.` });
  for (const level of levels) {
    const page = levelPage(region, level);
    await mkdir(path.join(directory, level.slug), { recursive: true });
    await writeFile(path.join(directory, level.slug, "index.html"), page.html);
    pages.push({ url: `${siteUrl}${levelUrl(region, level)}`, priority: "0.8", title: page.title, description: page.description });
  }
}
const lastmod = buildDate.toISOString().slice(0, 10);
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(({ url, priority }) => `\n  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`).join("")}\n</urlset>\n`);
await writeFile(path.join(dist, "rss.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${siteName}</title><link>${siteUrl}/</link><description>경상북도 22개 시군 초등·중등·고등 1:1 수학과외</description><language>ko</language><lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>${pages.map(({ url, title, description }) => `\n<item><title>${title}</title><link>${url}</link><guid>${url}</guid><description>${description}</description><pubDate>${buildDate.toUTCString()}</pubDate></item>`).join("")}\n</channel></rss>\n`);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist, "CNAME"), "tutornow.kr\n");
await writeFile(path.join(dist, ".nojekyll"), "");
await writeFile(path.join(dist, "favicon.ico"), faviconIco());
await writeFile(path.join(dist, "favicon.svg"), faviconSvg);
await writeFile(path.join(dist, "404.html"), layout({ title: `페이지를 찾을 수 없습니다 | ${siteName}`, description: "요청하신 페이지를 찾을 수 없습니다.", body: `<main class="not-found"><div><p class="eyebrow dark">404 ERROR</p><h1>페이지를 찾을 수 없습니다</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><a class="button" href="/">홈으로 돌아가기</a></div></main>${footer}` }));
console.log(`Built ${pages.length} pages in ${dist}`);
