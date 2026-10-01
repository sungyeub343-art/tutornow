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

const css = await readFile(path.join(root, "src", "style.css"), "utf8");
const regionLinks = regions.map(({ slug, name, type }) => `<a class="region-link" href="/regions/${slug}/"><strong>${name}${type}</strong><span>지역 수업 보기</span><b aria-hidden="true">→</b></a>`).join("");
const gradeCards = grades.map(([name, text], index) => `<article class="grade"><span>0${index + 1}</span><h3>${name} 수학과외</h3><p>${text}</p></article>`).join("");

function layout({ title, description, canonical = siteUrl, body }) {
  const schema = { "@context": "https://schema.org", "@type": "EducationalOrganization", name: "경북 수학과외", url: siteUrl, areaServed: "경상북도", description };
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="naver-site-verification" content="da1ddc6d11fbaf9ca190d7ff71413f40b0220036"><meta name="google-site-verification" content="mgftAe9RcXTmkuF04LUcLRUBY-naUxZumX5YV-7Uu88"><title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=82"><link rel="stylesheet" href="/assets/style.css"><script type="application/ld+json">${JSON.stringify(schema)}</script></head><body><nav><div class="wrap nav-inner"><a class="brand" href="/">경북 수학과외</a><div class="nav-links"><a href="/#program">수업 방식</a><a href="/#grade">학년별 준비</a><a href="/#regions">지역 찾기</a></div></div></nav>${body}<div class="mobile-bar"><a href="/#regions">우리 지역 수업 찾기</a></div></body></html>`;
}

function hero(title, copy, local = "GYEONGBUK MATH TUTORING") {
  return `<header class="hero"><div class="wrap hero-inner"><p class="eyebrow">${local}</p><h1>${title}</h1><p class="hero-copy">${copy}</p><div class="hero-actions"><a class="button" href="#grade">학년별 준비 보기</a><a class="button phone-button" href="tel:01029283614">010-2928-3614</a><a class="text-link" href="#regions">22개 시군 찾기 <span>→</span></a></div></div><p class="hero-note">경상북도 중등·고등<br>개인별 수학 학습 설계</p></header>`;
}

const proof = `<section class="proof"><div class="wrap proof-grid"><div><strong>01</strong><p><b>현재 위치부터</b>시험지와 학습 이력으로 개념, 연산, 문제 해석의 약점을 구분합니다.</p></div><div><strong>02</strong><p><b>학교 진도에 맞게</b>목표 성적과 가능한 학습 시간을 반영해 현실적인 계획을 세웁니다.</p></div><div><strong>03</strong><p><b>스스로 설명하도록</b>풀이 이유를 말하고 유사 문제에 적용할 때까지 확인합니다.</p></div></div></section>`;
const process = `<section class="process" id="program"><div class="wrap process-grid"><div class="section-title"><p class="eyebrow dark">PERSONAL CURRICULUM</p><h2>많이 푸는 것보다<br>먼저 필요한 일</h2></div><div class="process-copy"><p class="lead">수학 성적은 학생마다 막히는 지점이 다릅니다. 정해진 진도를 그대로 따라가기보다 현재 이해도를 확인하고, 학교 일정과 목표를 한 흐름으로 연결합니다.</p><ol><li><span>진단</span><p>최근 시험과 오답에서 반복되는 원인을 찾습니다.</p></li><li><span>설계</span><p>복습, 현행, 선행의 비중을 학생별로 조절합니다.</p></li><li><span>관리</span><p>수업 결과를 다음 계획에 반영해 학습 공백을 줄입니다.</p></li></ol></div></div></section>`;
const gradeSection = `<section class="grades" id="grade"><div class="wrap"><div class="section-head"><div><p class="eyebrow dark">GRADE TRANSITION</p><h2>다음 학년의 수학은<br>준비부터 달라야 합니다</h2></div><p>빠른 선행보다 중요한 것은 이전 과정의 빈틈을 찾아 다음 개념과 연결하는 일입니다. 학년 전환기에 꼭 필요한 내용을 학생의 속도에 맞춰 준비합니다.</p></div><div class="grade-grid">${gradeCards}</div></div></section>`;
const regionsSection = `<section class="regions" id="regions"><div class="wrap"><div class="section-head"><div><p class="eyebrow">22 CITIES & COUNTIES</p><h2>경북 지역별<br>수학과외 안내</h2></div><p>포항부터 울릉까지 경상북도 22개 시군별 수업 내용을 확인하세요. 거주지와 일정, 학습 목표에 따라 대면 또는 온라인 수업을 안내합니다.</p></div><div class="region-grid">${regionLinks}</div></div></section>`;
const philosophy = `<section class="philosophy"><div class="photo" role="img" aria-label="책상에서 수학을 공부하는 학생"></div><div class="philosophy-copy"><p class="eyebrow dark">STUDY WITH DIRECTION</p><h2>과외가 없는 날에도<br>혼자 풀 수 있도록</h2><p>문제를 읽고 조건을 표시하고 풀이를 검토하는 과정을 반복합니다. 정답만 맞히는 수업을 넘어, 새로운 문제 앞에서도 시작할 수 있는 자기만의 기준을 만듭니다.</p><ul><li>학교별 시험 범위와 일정 반영</li><li>매 수업 오답 원인 기록</li><li>학년과 목표에 맞춘 진도 조정</li></ul></div></section>`;
const footer = `<footer><div class="wrap footer-inner"><div><a class="brand" href="/">경북 수학과외</a><p>경상북도 중·고등 맞춤 수학 지도</p></div><div><a href="/#program">수업 방식</a><a href="/#grade">학년별 준비</a><a href="/#regions">지역별 안내</a></div><small>© 2026 경북 수학과외. All rights reserved.</small></div></footer>`;

function homePage() {
  const description = "경상북도 22개 시군 중등·고등 1:1 수학과외. 예비중1, 예비중2, 예비중3, 예비고1, 예비고2, 예비고3 맞춤 수업과 내신·선행·수능 관리.";
  const body = `${hero("경북 수학과외", "포항부터 울릉까지, 학생의 현재 실력과 학교 진도에 맞춘 중등·고등 수학 수업. 이해에서 성적까지 이어지는 공부의 기준을 함께 세웁니다.")}${proof}${process}${gradeSection}${regionsSection}${philosophy}${footer}`;
  return layout({ title: "경북 수학과외 | 중등·고등 맞춤 수업", description, body });
}

function regionPage(region) {
  const fullName = `${region.name}${region.type}`;
  const description = `${fullName} 수학과외. ${region.areas} 중등·고등 맞춤 수업. 예비중1·예비중2·예비중3·예비고1·예비고2·예비고3 내신, 선행, 수능 준비.`;
  const localIntro = `<section class="local"><div class="wrap local-grid"><div><p class="eyebrow dark">${fullName} LOCAL CLASS</p><h2>${fullName} 학생에게 맞는<br>현실적인 학습 계획</h2></div><div><p>${fullName} ${region.areas} 인근 학생의 중등·고등 수학 학습을 안내합니다. 지역과 학교에 따라 시험 일정과 진도가 다른 만큼 최근 시험 결과, 현재 교재, 목표 성적을 먼저 확인합니다.</p><p>${region.focus}을 중심으로 수업하며, 이동 거리나 일정에 따라 온라인 수업도 함께 고려합니다. 예비중1·예비중2·예비중3은 중학 개념과 내신의 기초를, 예비고1·예비고2·예비고3은 고등 과정과 수능 준비를 개인별 순서로 연결합니다.</p></div></div></section>`;
  const body = `${hero(`${fullName}<br>수학과외`, `${region.areas}에서 만나는 중등·고등 맞춤 수업. ${region.focus}으로 공부의 방향을 분명하게 잡습니다.`, `${fullName} · GYEONGBUK`)}${proof}${localIntro}${gradeSection}${regionsSection}${footer}`;
  return layout({ title: `${fullName} 수학과외 | 예비중·예비고 맞춤 수업`, description, canonical: `${siteUrl}/regions/${region.slug}/`, body });
}

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "assets"), { recursive: true });
await writeFile(path.join(dist, "assets", "style.css"), css);
await writeFile(path.join(dist, "index.html"), homePage());
for (const region of regions) {
  const directory = path.join(dist, "regions", region.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), regionPage(region));
}
const urls = [siteUrl, ...regions.map(({ slug }) => `${siteUrl}/regions/${slug}/`)];
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `\n  <url><loc>${url}</loc><changefreq>weekly</changefreq><priority>${url === siteUrl ? "1.0" : "0.8"}</priority></url>`).join("")}\n</urlset>\n`);
await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(dist, "CNAME"), "tutornow.kr\n");
await writeFile(path.join(dist, ".nojekyll"), "");
await writeFile(path.join(dist, "404.html"), layout({ title: "페이지를 찾을 수 없습니다 | 경북 수학과외", description: "요청하신 페이지를 찾을 수 없습니다.", body: `<main class="not-found"><div><p class="eyebrow dark">404 ERROR</p><h1>페이지를 찾을 수 없습니다</h1><p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p><a class="button" href="/">홈으로 돌아가기</a></div></main>${footer}` }));
console.log(`Built ${regions.length + 1} pages in ${dist}`);