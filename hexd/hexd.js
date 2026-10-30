/* ══ 사업가 유형 테스트 v2 엔진 (2026-09-11) — 원본: golden_block.txt + parts/*, 빌더 build_hexd.py ══ */
(function(){
/* ── 상수 ─────────────────────────────────────── */
const LIKERT_MAX = 7;
const LIKERT_LABELS = [
  {value:1,short:"전혀"},{value:2,short:"거의"},{value:3,short:"별로"},
  {value:4,short:"보통"},{value:5,short:"다소"},{value:6,short:"대체로"},{value:7,short:"매우"},
];
const TIE_BREAK_PRIORITY = {E:6,B:5,C:4,M:3,P:2,F:1,G:0,R:-1,S:-2};

/* ── AXES ──────────────────────────────────────── */
const AXES = [
  {id:"self",      code:"E", label:"자기관리", color:"#10B981"},
  {id:"production",code:"B", label:"생산관리", color:"#F59E0B"},
  {id:"goal",      code:"C", label:"목표관리", color:"#6366F1"},
  {id:"relation",  code:"M", label:"관계관리", color:"#EC4899"},
  {id:"marketing", code:"P", label:"판매관리", color:"#EF4444"},
  {id:"finance",   code:"F", label:"재무관리", color:"#1E3A8A"},
];

/* ── QUESTIONS (axisId-N ID 형식, 프로토타입 동일) ── */
function mk(axisId,n,text){ return {id:axisId+"-"+n, axisId, n, text}; }
const QUESTIONS = [
  mk("self",1,"내 몸 상태에 맞게 정해 둔 운동이나 활동을 지난 한 달 동안 꾸준히 했다."),
  mk("self",2,"일이 바빠도 잠자는 시간을 지키려고 일정을 조정한다."),
  mk("self",3,"스트레스가 쌓일 때 풀어내는 나만의 방법이 있다."),
  mk("self",4,"감정이 흔들리는 날은 중요한 결정을 미룰 줄 안다."),
  mk("self",5,"일과 사생활의 경계를 스스로 지키려고 노력한다."),
  mk("self",6,"몸에서 이상 신호가 오면 미루지 않고 병원이나 검진을 챙긴다."),
  mk("self",7,"매주 일정 시간 휴식·취미·재충전 시간을 확보한다."),
  mk("self",8,"내 에너지가 높은 시간대를 알고 그 시간에 중요한 일을 한다."),
  mk("self",9,"번아웃 신호(피로·무기력·짜증)를 스스로 알아챌 수 있다."),
  mk("self",10,"일이 감당할 범위를 넘으면 맡을 일을 줄이거나 도움을 요청한다."),
  mk("production",1,"주력 상품·서비스가 지켜야 할 품질 기준을 정해 두었다."),
  mk("production",2,"정해 둔 기준으로 결과물의 품질을 주기적으로 점검한다."),
  mk("production",3,"고객 불만·반품을 정리해두고 개선에 반영한다."),
  mk("production",4,"상품·서비스를 분기에 1번 이상 손보거나 업그레이드한다."),
  mk("production",5,"원가·제작 과정·운영 방식을 꾸준히 다듬고 있다."),
  mk("production",6,"반복 업무의 매뉴얼·체크리스트(일하는 순서 정리)가 문서로 있다."),
  mk("production",7,"주요 작업의 자료와 순서가 나 없이도 찾을 수 있게 정리돼 있다."),
  mk("production",8,"새 상품·서비스 아이디어를 메모·정리해두는 곳이 있다."),
  mk("production",9,"작은 실험·시제품(파일럿)을 정기적으로 돌려본다."),
  mk("production",10,"약속한 완료 시점과 실제 완료 시점의 차이를 확인한다."),
  mk("goal",1,"앞으로 1년 동안 사업에서 이루려는 가장 중요한 변화를 적어 두었다."),
  mk("goal",2,"올해 가장 중요한 목표 3가지를 지금 바로 말할 수 있다."),
  mk("goal",3,"매주 또는 매월 우선순위를 정하고 계획을 세운다."),
  mk("goal",4,"월말에 '이번 달 가장 중요했던 일·성과'를 돌아본다."),
  mk("goal",5,"목표를 숫자(매출·고객 수·완료 건수 등)로 정해 추적한다."),
  mk("goal",6,"목표를 향해 가는 중 '안 되는 것'을 빠르게 접고 방향을 바꿀 수 있다."),
  mk("goal",7,"중요한 목표를 다음에 할 작업 단위로 나눠 두었다."),
  mk("goal",8,"목표를 이루기 위한 주요 작업의 마감일을 정해 두었다."),
  mk("goal",9,"'중요하지만 급하지 않은 일'에 주당 일정 시간을 쓴다."),
  mk("goal",10,"최근 세 달 안에 시장 변화가 내 목표에 어떤 영향을 주는지 살펴봤다."),
  mk("relation",1,"함께 일하는 상대와 진행 상황을 확인할 시점을 정해 두었다."),
  mk("relation",2,"최근 한 달 안에 직원·협력자에게 구체적인 칭찬·감사를 표현한 적 있다."),
  mk("relation",3,"함께 일하다 의견이 갈리면 상대의 설명을 듣고 원인을 확인한다."),
  mk("relation",4,"일을 함께 시작하기 전에 각자 맡을 범위를 합의한다."),
  mk("relation",5,"함께 일하는 상대가 일을 잘할 수 있도록 필요한 정보와 자료를 준다."),
  mk("relation",6,"함께 일하던 상대가 빠지면 대신 도움을 청할 사람을 알고 있다."),
  mk("relation",7,"같은 업계 사업가 네트워크에서 정보를 정기적으로 주고받는다."),
  mk("relation",8,"혼자 판단하기 어려운 사업 문제를 의논할 외부 상대가 있다."),
  mk("relation",9,"협력사·벤더·외주와의 신뢰 관계를 장기적으로 관리한다."),
  mk("relation",10,"'혼자가 아니라 함께 일한다'는 느낌을 최근 3개월 안에 받은 적이 있다."),
  mk("marketing",1,"우리 브랜드의 한 줄 가치 제안(누구에게·무엇을·왜)을 말할 수 있다."),
  mk("marketing",2,"타겟 고객 1명을 구체적으로(나이·고민·습관) 묘사할 수 있다."),
  mk("marketing",3,"고객이 가장 많이 들어오는 경로의 성과를 확인하고 있다."),
  mk("marketing",4,"고객 한 명을 모시는 데 드는 비용을 계산하는 기준이 있다."),
  mk("marketing",5,"재구매율 또는 단골 고객 비중을 대략이라도 안다."),
  mk("marketing",6,"정기적으로 프로모션·캠페인·이벤트를 기획·실행한다."),
  mk("marketing",7,"고객이 구매를 결정할 때 보여 줄 설명 자료를 준비해 두었다."),
  mk("marketing",8,"고객 후기·피드백을 정기적으로 모아 본다."),
  mk("marketing",9,"경쟁사·유사 브랜드와의 차별점을 한 문장으로 말할 수 있다."),
  mk("marketing",10,"관심을 보인 고객에게 다음 단계를 안내하는 절차가 있다."),
  mk("finance",1,"사업가님 매출 구조(단건/구독/프로젝트/광고 중 무엇인지)를 명확히 답할 수 있다."),
  mk("finance",2,"지난달 이익을 장부나 정산 기록에서 바로 확인할 수 있다."),
  mk("finance",3,"매월 손익계산서·장부·정산 내역을 직접 확인한다."),
  mk("finance",4,"앞으로 세 달의 예상 입출금을 보고 돈이 부족해질 시점을 미리 확인한다."),
  mk("finance",5,"고정비(임대·인건비 등)와 변동비를 구분해 관리한다."),
  mk("finance",6,"세금 신고에 필요한 증빙·영수증을 체계적으로 보관한다."),
  mk("finance",7,"받아야 할 돈이 예정일에 들어왔는지 확인한다."),
  mk("finance",8,"앞으로 나갈 돈(지급·상환·세금)의 일정을 정리해 두었다."),
  mk("finance",9,"가격 결정 근거(원가·마진·경쟁가)가 명확하다."),
  mk("finance",10,"회계·세무에서 모르는 문제가 생기면 확인할 경로가 있다."),
];
const QUESTIONS_BY_AXIS = {
  self:       QUESTIONS.filter(q=>q.axisId==="self"),
  production: QUESTIONS.filter(q=>q.axisId==="production"),
  goal:       QUESTIONS.filter(q=>q.axisId==="goal"),
  relation:   QUESTIONS.filter(q=>q.axisId==="relation"),
  marketing:  QUESTIONS.filter(q=>q.axisId==="marketing"),
  finance:    QUESTIONS.filter(q=>q.axisId==="finance"),
};

/* ── 사전질문 옵션 (v2 · 2026-09-11 검수 문서 4절) ─────────────── */
const INDUSTRY_OPTIONS = [
  {id:"physical",icon:"📦",label:"제조·물리 상품",hint:"직접 만들어 파는 실물(식품·생활용품·의료기기 등)"},
  {id:"handmade",icon:"🔨",label:"수공예·핸드메이드·공방",hint:"1인·소규모 직접 제작"},
  {id:"service-offline",icon:"🛎️",label:"대면 서비스",hint:"미용·수리·청소·키즈카페·상담 등"},
  {id:"wellness",icon:"💆",label:"건강·미용·운동",hint:"필라테스·요가·피부·헬스"},
  {id:"fnb",icon:"🍽️",label:"음식점·카페",hint:"식당·카페·제과"},
  {id:"retail",icon:"🛒",label:"도소매·유통",hint:"남의 상품을 파는 사업"},
  {id:"brokerage",icon:"🏠",label:"중개·주선업",hint:"부동산·보험·차량·결혼중개 등"},
  {id:"digital",icon:"💻",label:"앱·소프트웨어",hint:"SaaS·온라인 도구·디지털 상품"},
  {id:"content-ip",icon:"🎬",label:"콘텐츠·IP·행사 기획",hint:"영상·음악·캐릭터·저술·행사 기획 등 기획·권리 활용"},
  {id:"edu-consult",icon:"🎓",label:"교육·컨설팅·코칭",hint:"강의·자문·1:1 코칭"},
  {id:"creative-production",icon:"🎨",label:"디자인·영상 제작 대행",hint:"의뢰받아 디자인·영상·사진을 만들어 납품"},
  {id:"other",icon:"✏️",label:"기타",hint:"위에 없는 사업"},
];
const CUSTOMER_OPTIONS = [
  {id:"b2c",icon:"👤",label:"일반 소비자",hint:"B2C"},
  {id:"b2b",icon:"🏢",label:"기업·소상공인·민간기관",hint:"B2B"},
  {id:"b2g",icon:"🏛️",label:"정부·공공기관",hint:"B2G"},
];
const CHANNEL_OPTIONS = [
  {id:"offline-store",icon:"🏪",label:"오프라인 매장·현장"},
  {id:"own-online",icon:"🌐",label:"자사몰·홈페이지"},
  {id:"marketplace",icon:"🛍️",label:"오픈마켓·플랫폼",hint:"쿠팡·스마트스토어·네이버"},
  {id:"sns",icon:"📱",label:"SNS",hint:"인스타·스레드·페북"},
  {id:"youtube",icon:"🎥",label:"유튜브"},
  {id:"learning-platform",icon:"📚",label:"지식·강의 플랫폼",hint:"크몽·탈잉·클래스101"},
  {id:"b2b-direct",icon:"🤝",label:"B2B 직거래·영업",hint:"견적·제안·방문"},
  {id:"overseas",icon:"🌍",label:"해외",hint:"아마존·이베이·쇼피"},
];
const YEAR_OPTIONS = [
  {id:"pre-launch",icon:"🌱",label:"준비 중",hint:"아직 첫 판매 전"},
  {id:"year-0-1",icon:"🌿",label:"1년 미만"},
  {id:"year-1-3",icon:"🌳",label:"1년 이상~4년 미만"},
  {id:"year-4-7",icon:"🌲",label:"4년 이상~8년 미만"},
  {id:"year-8-plus",icon:"🏛️",label:"8년 이상"},
];
const REVENUE_OPTIONS = [
  {id:"single",icon:"🧾",label:"한 번 팔면 끝나는 단건"},
  {id:"repeat",icon:"🔁",label:"같은 고객이 반복 구매"},
  {id:"project",icon:"📁",label:"프로젝트·계약 단위"},
  {id:"subscription",icon:"📆",label:"구독·멤버십·정기 결제"},
  {id:"licensing",icon:"💡",label:"라이선스·로열티"},
];
const HEADCOUNT_OPTIONS = [
  {id:"solo",icon:"🧍",label:"혼자"},
  {id:"small",icon:"👫",label:"2~4명"},
  {id:"medium",icon:"👥",label:"5~20명"},
  {id:"large",icon:"🏢",label:"21명 이상"},
];
const OUTSOURCE_OPTIONS = [
  {id:"yes",icon:"🤝",label:"있음",hint:"정기적으로 맡기는 외부 사람·업체"},
  {id:"no",icon:"🙋",label:"없음",hint:"거의 혼자 다 합니다"},
];
const HIREPLAN_OPTIONS = [
  {id:"stay",icon:"🧍",label:"지금 인원 유지"},
  {id:"maybe-hire",icon:"🤔",label:"필요하면 채용"},
  {id:"hiring-soon",icon:"📅",label:"채용할 계획"},
  {id:"hiring-active",icon:"✅",label:"이미 채용 중"},
  {id:"downsize",icon:"➖",label:"줄일 계획"},
];
const DEBT_OPTIONS = [
  {id:"yes",icon:"🏦",label:"있음"},
  {id:"no",icon:"✨",label:"없음"},
  {id:"skip",icon:"🤐",label:"말하고 싶지 않음"},
];
const CONCERN_OPTIONS = [
  {id:"self",icon:"🧘",label:"자기관리",hint:"체력·멘탈·시간"},
  {id:"production",icon:"🛠",label:"생산관리",hint:"제품·서비스"},
  {id:"goal",icon:"🎯",label:"목표관리",hint:"목표·추진"},
  {id:"relation",icon:"🤝",label:"관계관리",hint:"직원·외주·인맥"},
  {id:"marketing",icon:"📢",label:"판매관리",hint:"마케팅·브랜딩·영업"},
  {id:"finance",icon:"💰",label:"재무관리",hint:"회계·세무·현금"},
];
/* 화면 순서. showIf 가 false 면 건너뛴다(채용 계획은 혼자·2~4명에게만). sub 는 특정 답에 붙는 추가 질문(혼자 → 외주 유무). */
const PRE_QUESTIONS = [
  {id:"industry",title:"이번 진단의 기준이 될 <b>주력 상품·서비스</b>는 무엇인가요?",subtitle:"하나만 골라 주세요. 보조로 하는 것이 있으면 아래에서 1개 더.<br>아직 판매 전이면 계획 기준으로 답해 주세요.",type:"single",options:INDUSTRY_OPTIONS,field:"industry",
   extra:{title:"보조로 하는 것이 있다면 (선택)",field:"industry2",options:INDUSTRY_OPTIONS,optional:true}},
  {id:"customer",title:"주로 <b>돈을 내거나 계약하는 상대</b>는 누구인가요?",subtitle:"섞여 있으면 최근 3개월 매출이 가장 큰 쪽 하나",type:"single",options:CUSTOMER_OPTIONS,field:"primaryCustomer"},
  {id:"channel",title:"주로 <b>어디서</b> 파시나요?",subtitle:"해당하는 곳 모두",type:"multi",options:CHANNEL_OPTIONS,field:"channels"},
  {id:"year",title:"사업하신 지 얼마나 되셨나요?",subtitle:"첫 판매일 기준",type:"single",options:YEAR_OPTIONS,field:"yearsInBiz"},
  {id:"revenue",title:"돈은 주로 <b>어떤 방식</b>으로 들어오나요?",subtitle:"가장 큰 것 하나",type:"single",options:REVENUE_OPTIONS,field:"revenueModel"},
  {id:"headcount",title:"지금 <b>몇 명</b>이 함께 일하세요?",subtitle:"대표님 포함 · 공동대표·함께 일하는 가족·정기 아르바이트까지 셉니다(외부 업체 제외)",type:"single",options:HEADCOUNT_OPTIONS,field:"headcount",
   sub:{when:"solo",title:"일부 업무를 정기적으로 맡기는 외부 사람·업체가 있나요?",field:"hasOutsourcing",options:OUTSOURCE_OPTIONS}},
  {id:"hireplan",title:"<b>앞으로 1년간</b> 인원 계획은요?",type:"single",options:HIREPLAN_OPTIONS,field:"hirePlan",showIf:(a)=>!a.headcount||a.headcount==="solo"||a.headcount==="small"},
  {id:"debt",title:"사업 관련 <b>대출·빚</b>이 있나요?",subtitle:"문항을 맞추는 데만 쓰고, 서버에는 보내지 않아요",type:"single",options:DEBT_OPTIONS,field:"debt"},
];
/* 본 진단이 끝난 뒤 한 번 더: 점수·유형에는 영향 없음, 과제 우선순위와 안내에만 사용 */
const CONCERN_QUESTION = {id:"concern",title:"마지막으로, 지금 <b>먼저 해결하고 싶은 영역</b>은 어디인가요?",subtitle:"최대 2개 · 결과의 '먼저 살펴볼 곳'을 고르는 데 참고합니다",type:"multi",maxSelect:2,options:CONCERN_OPTIONS,field:"concerns"};
function emptyPreSurvey(){
  return {industry:undefined,industry2:undefined,primaryCustomer:undefined,channels:[],yearsInBiz:undefined,revenueModel:undefined,
          headcount:undefined,hasOutsourcing:undefined,hirePlan:undefined,debt:undefined,concerns:[],
          /* 규칙 호환용 파생값 (normalizePre 가 채움) */ industries:[],customers:[]};
}
function normalizePre(a){
  a.industries=[a.industry,a.industry2].filter(Boolean);
  a.customers=a.primaryCustomer?[a.primaryCustomer]:[];
  if(a.headcount!=="solo") a.hasOutsourcing=undefined;
  if(!(a.headcount==="solo"||a.headcount==="small")) a.hirePlan=undefined;
  return a;
}

/* ── 교체 규칙 v2 ───────────────────────────────────────────────────
   처리 순서(우선순위 숫자가 클수록 먼저): ① 준비 중(100) ② 협업 구조(90) ③ 거래 방식·빚·채널·고객(80·78·72·70) ④ 주력 업종 표현(60).
   같은 문항에 두 규칙이 걸리면 높은 쪽만 적용. 업종 규칙은 주력 업종(industries[0])만 본다. */
const anyOf = (arr,...ids)=>!!arr&&ids.some(i=>arr.includes(i));
const primaryIs = (a,...ids)=>!!a.industries&&ids.includes(a.industries[0]);
const isPreLaunch = (a)=>a.yearsInBiz==="pre-launch";
const isSoloAlone = (a)=>a.headcount==="solo"&&a.hasOutsourcing!=="yes";
const isSoloWithOut = (a)=>a.headcount==="solo"&&a.hasOutsourcing==="yes";
const isB2B = (a)=>a.primaryCustomer==="b2b";
const isB2G = (a)=>a.primaryCustomer==="b2g";

const preLaunchRules = [
  {key:"finance-pre-launch",axisId:"finance",when:isPreLaunch,priority:100,replacements:[
    {targetId:"finance-2",text:"예상 월 매출과 손익분기점을 계산해 두었다."},
    {targetId:"finance-3",text:"쓸 회계·세무 도구나 서비스를 정해 두었다."},
    {targetId:"finance-4",text:"초기 운영을 버틸 자금이 몇 달치인지 계산해 두었다."},
    {targetId:"finance-7",text:"첫 매출이 들어오는 시점과 방식을 정해 두었다."},
  ]},
  {key:"marketing-pre-launch-b2b",axisId:"marketing",when:(a)=>isPreLaunch(a)&&(isB2B(a)||isB2G(a)),priority:101,replacements:[
    {targetId:"marketing-3",text:"계획한 영업 경로에서 잠재 고객에게 어떻게 다가갈지 정리했다."},
    {targetId:"marketing-6",text:"첫 제안·미팅을 위한 자료와 순서를 준비해 두었다."},
    {targetId:"marketing-10",text:"첫 고객사 확보 후 다음 단계로 이어갈 절차를 생각해 두었다."},
  ]},
  {key:"marketing-pre-launch",axisId:"marketing",when:isPreLaunch,priority:100,replacements:[
    {targetId:"marketing-3",text:"고객이 처음 들어올 경로 하나를 정하고 예상 성과를 그려 두었다."},
    {targetId:"marketing-5",text:"첫 고객이 다시 오게 할 방법을 계획해 두었다."},
    {targetId:"marketing-6",text:"출시 때 진행할 알림·프로모션 아이디어가 있다."},
    {targetId:"marketing-10",text:"관심을 보인 사람에게 다음 단계를 안내할 방법을 정해 두었다."},
  ]},
  {key:"relation-pre-launch",axisId:"relation",when:(a)=>isPreLaunch(a)&&!isSoloAlone(a),priority:100,replacements:[
    {targetId:"relation-1",text:"함께할 직원·외주·파트너와 어떻게 소통할지 계획이 있다."},
    {targetId:"relation-3",text:"함께 일할 사람과 의견이 갈릴 때 어떻게 풀지 원칙을 정해 두었다."},
    {targetId:"relation-4",text:"함께 일할 사람과 맡을 범위를 어떻게 나눌지 그림이 있다."},
  ]},
  {key:"goal-year-0-1",axisId:"goal",when:(a)=>a.yearsInBiz==="year-0-1",priority:90,replacements:[
    {targetId:"goal-4",text:"최근 몇 달 동안 가장 중요했던 일을 되돌아본 적 있다."},
  ]},
];
const collabRules = [
  {key:"relation-solo-alone",axisId:"relation",when:isSoloAlone,priority:90,replacements:[
    {targetId:"relation-1",text:"혼자 하는 일이라도 진행 상황을 스스로 점검할 시점을 정해 두었다."},
    {targetId:"relation-2",text:"최근 한 달 안에 나를 도와준 사람(고객·거래처·지인)에게 고맙다는 말을 전한 적이 있다."},
    {targetId:"relation-4",text:"거래처·고객과 일을 시작하기 전에 범위와 조건을 문서나 메시지로 남긴다."},
    {targetId:"relation-5",text:"내 일에 필요한 배움에 한 달에 일정 시간을 쓴다."},
    {targetId:"relation-6",text:"급할 때 일을 맡길 수 있는 사람이나 업체를 알고 있다."},
  ]},
  {key:"relation-solo-out",axisId:"relation",when:isSoloWithOut,priority:90,replacements:[
    {targetId:"relation-1",text:"외주·협력자와 진행 상황을 확인할 시점을 정해 둔다."},
    {targetId:"relation-4",text:"외주를 맡기기 전에 범위와 기준을 문서로 전한다."},
    {targetId:"relation-5",text:"협력자가 일하기 좋게 필요한 자료를 미리 준다."},
  ]},
  {key:"relation-hiring-soon",axisId:"relation",when:(a)=>a.headcount==="solo"&&(a.hirePlan==="hiring-soon"||a.hirePlan==="hiring-active"),priority:91,replacements:[
    {targetId:"relation-3",text:"첫 직원이 맡을 일과 기대하는 결과를 적어 두었다."},
  ]},
  {key:"relation-org",axisId:"relation",when:(a)=>a.headcount==="medium"||a.headcount==="large",priority:88,replacements:[
    {targetId:"relation-3",text:"직원이 그만두는 이유를 파악하고 있다."},
    {targetId:"relation-4",text:"평가와 보상 기준이 문서로 정리돼 있고 직원이 알고 있다."},
    {targetId:"relation-5",text:"직원의 역량 개발에 연간 교육 시간이나 예산을 배정한다."},
  ]},
  {key:"relation-downsize",axisId:"relation",when:(a)=>a.hirePlan==="downsize",priority:89,replacements:[
    {targetId:"relation-3",text:"인력 조정이 필요한 이유를 감정이 아닌 숫자로 정리해 두었다."},
  ]},
];
const revenueRules = [
  {key:"rev-single",axisId:"marketing",when:(a)=>a.revenueModel==="single",priority:80,replacements:[
    {targetId:"marketing-5",text:"거래를 마친 고객에게 후기나 소개를 부탁하는 절차가 있다."},
  ]},
  {key:"rev-repeat",axisId:"marketing",when:(a)=>a.revenueModel==="repeat",priority:80,replacements:[
    {targetId:"marketing-5",text:"기존 고객이 다시 구매했는지 확인할 기록이 있다."},
  ]},
  {key:"rev-project-m",axisId:"marketing",when:(a)=>a.revenueModel==="project",priority:80,replacements:[
    {targetId:"marketing-5",text:"끝난 프로젝트 고객에게 다음 일을 제안하는 절차가 있다."},
  ]},
  {key:"rev-project-f",axisId:"finance",when:(a)=>a.revenueModel==="project",priority:80,replacements:[
    {targetId:"finance-7",text:"계약 단계별 입금 일정을 관리하고 예정일에 확인한다."},
  ]},
  {key:"rev-subscription-m",axisId:"marketing",when:(a)=>a.revenueModel==="subscription",priority:80,replacements:[
    {targetId:"marketing-5",text:"월 이탈과 갱신을 확인할 기록이 있다."},
  ]},
  {key:"rev-subscription-f",axisId:"finance",when:(a)=>a.revenueModel==="subscription",priority:80,replacements:[
    {targetId:"finance-1",text:"정기 매출의 갱신·이탈 흐름을 숫자로 알고 있다."},
  ]},
  {key:"rev-licensing-f",axisId:"finance",when:(a)=>a.revenueModel==="licensing",priority:80,replacements:[
    {targetId:"finance-1",text:"로열티·계약 기간 등 라이선스 매출 구조를 알고 있다."},
    {targetId:"finance-7",text:"로열티 정산이 예정대로 들어오는지 확인한다."},
  ]},
  {key:"debt-yes",axisId:"finance",when:(a)=>a.debt==="yes",priority:80,replacements:[
    {targetId:"finance-8",text:"대출·빚의 금리와 상환 일정을 정확히 알고 있다."},
  ]},
];
const customerRules = [
  {key:"marketing-b2b",axisId:"marketing",when:isB2B,priority:72,replacements:[
    {targetId:"marketing-3",text:"주력 영업 경로(소개·콜드콜·전시회 등)의 성과를 확인하고 있다."},
    {targetId:"marketing-4",text:"고객사 한 곳을 수주하는 데 드는 비용을 계산하는 기준이 있다."},
    {targetId:"marketing-7",text:"영업 미팅과 제안에 쓸 자료가 체계화돼 있다."},
    {targetId:"marketing-10",text:"제안 후 후속 연락을 하는 절차가 있다."},
  ]},
  {key:"marketing-b2g",axisId:"marketing",when:isB2G,priority:72,replacements:[
    {targetId:"marketing-3",text:"주력 수주 경로(나라장터·MOU·공모 등)의 성과를 확인하고 있다."},
    {targetId:"marketing-6",text:"공공기관 사업 공고를 정기적으로 확인한다."},
    {targetId:"marketing-7",text:"입찰·제안서 작성 절차와 자료가 체계화돼 있다."},
  ]},
];
const channelRules = [
  {key:"ch-offline",axisId:"marketing",when:(a)=>anyOf(a.channels,"offline-store"),priority:70,replacements:[
    {targetId:"marketing-3",text:"매장 방문과 재방문 흐름을 확인하고 있다."},
    {targetId:"marketing-10",text:"방문 고객이 다시 오게 하는 안내(적립·알림 등)가 있다."},
  ]},
  {key:"ch-sns",axisId:"marketing",when:(a)=>anyOf(a.channels,"sns"),priority:69,replacements:[
    {targetId:"marketing-3",text:"SNS에서 들어온 문의·구매 수를 확인한다."},
    {targetId:"marketing-8",text:"댓글·DM 반응을 정기적으로 모아 본다."},
  ]},
  {key:"ch-own-online",axisId:"marketing",when:(a)=>anyOf(a.channels,"own-online"),priority:68,replacements:[
    {targetId:"marketing-3",text:"자사몰 방문 대비 구매 비율을 확인한다."},
    {targetId:"marketing-10",text:"장바구니·문의 고객에게 다음 안내가 자동으로 나간다."},
  ]},
  {key:"ch-youtube",axisId:"marketing",when:(a)=>anyOf(a.channels,"youtube"),priority:67,replacements:[
    {targetId:"marketing-3",text:"유튜브 채널의 조회·구독·전환을 확인한다."},
  ]},
  {key:"ch-marketplace",axisId:"marketing",when:(a)=>anyOf(a.channels,"marketplace"),priority:66,replacements:[
    {targetId:"marketing-3",text:"스마트스토어·쿠팡 등 키워드 노출과 광고 성과를 확인한다."},
    {targetId:"marketing-8",text:"마켓플레이스 리뷰·평점을 정기적으로 살펴본다."},
  ]},
  {key:"ch-learning",axisId:"marketing",when:(a)=>anyOf(a.channels,"learning-platform"),priority:65,replacements:[
    {targetId:"marketing-3",text:"강의 플랫폼별 노출과 전환 성과를 확인한다."},
  ]},
  {key:"ch-overseas",axisId:"finance",when:(a)=>anyOf(a.channels,"overseas"),priority:65,replacements:[
    {targetId:"finance-6",text:"해외 매출의 외화·관세·플랫폼 수수료 증빙을 정리해 둔다."},
  ]},
];
const industryRules = [
  {key:"ind-physical",axisId:"production",when:(a)=>primaryIs(a,"physical"),priority:60,replacements:[
    {targetId:"production-2",text:"불량률·재작업을 기준으로 품질을 점검한다."},
    {targetId:"production-5",text:"원가와 공정 시간을 꾸준히 줄이고 있다."},
    {targetId:"production-6",text:"반복 공정의 작업 표준서가 문서로 있다."},
  ]},
  {key:"ind-digital",axisId:"production",when:(a)=>primaryIs(a,"digital","content-ip","creative-production"),priority:60,replacements:[
    {targetId:"production-1",text:"우리 콘텐츠·서비스가 지켜야 할 품질 기준을 정해 두었다."},
    {targetId:"production-2",text:"발행·릴리스 전에 정해 둔 기준으로 점검한다."},
    {targetId:"production-3",text:"사용자 피드백·버그·재작업 요청을 다음 작업에 반영한다."},
    {targetId:"production-9",text:"본격 적용 전에 소규모 사용자에게 먼저 시험한다."},
  ]},
  {key:"ind-fnb",axisId:"production",when:(a)=>primaryIs(a,"fnb"),priority:60,replacements:[
    {targetId:"production-1",text:"우리 메뉴·재료가 지켜야 할 품질 기준을 정해 두었다."},
    {targetId:"production-2",text:"위생·신선도·맛의 재현성을 기준으로 점검한다."},
  ]},
  {key:"ind-fnb-f",axisId:"finance",when:(a)=>primaryIs(a,"fnb"),priority:60,replacements:[
    {targetId:"finance-9",text:"주요 메뉴의 원가율과 마진율을 알고 가격을 정한다."},
  ]},
  {key:"ind-retail",axisId:"production",when:(a)=>primaryIs(a,"retail"),priority:60,replacements:[
    {targetId:"production-1",text:"주력 상품을 고를 때 지키는 기준(품질·마진·회전)을 정해 두었다."},
    {targetId:"production-2",text:"재고 회전율·결품률을 기준으로 점검한다."},
    {targetId:"production-5",text:"매입가·물류비를 꾸준히 다듬고 있다."},
  ]},
  {key:"ind-edu",axisId:"production",when:(a)=>primaryIs(a,"edu-consult"),priority:60,replacements:[
    {targetId:"production-2",text:"학습 효과·만족도를 기준으로 프로그램을 점검한다."},
    {targetId:"production-4",text:"강의·프로그램을 분기에 한 번 이상 개선한다."},
  ]},
  {key:"ind-edu-m",axisId:"marketing",when:(a)=>primaryIs(a,"edu-consult"),priority:60,replacements:[
    {targetId:"marketing-8",text:"수강 후기와 만족도를 정기적으로 모아 본다."},
  ]},
  {key:"ind-handmade",axisId:"production",when:(a)=>primaryIs(a,"handmade"),priority:60,replacements:[
    {targetId:"production-5",text:"제작 시간을 줄일 도구나 방법을 꾸준히 찾는다."},
    {targetId:"production-7",text:"내 제작 순서와 노하우가 매뉴얼이나 영상으로 남아 있다."},
    {targetId:"production-9",text:"신작·시제품을 정기적으로 만들어 본다."},
  ]},
  {key:"ind-wellness",axisId:"production",when:(a)=>primaryIs(a,"wellness"),priority:60,replacements:[
    {targetId:"production-2",text:"고객 만족도·재방문 의사를 기준으로 점검한다."},
    {targetId:"production-6",text:"시술·상담·운영 매뉴얼이 문서로 있다."},
  ]},
  {key:"ind-service",axisId:"production",when:(a)=>primaryIs(a,"service-offline"),priority:60,replacements:[
    {targetId:"production-2",text:"서비스 품질과 고객 만족을 기준으로 점검한다."},
    {targetId:"production-6",text:"서비스 절차가 문서나 체크리스트로 있다."},
  ]},
  {key:"ind-broker",axisId:"marketing",when:(a)=>primaryIs(a,"brokerage"),priority:60,replacements:[
    {targetId:"marketing-1",text:"공급자와 수요자 양쪽에게 주는 가치를 한 문장으로 말할 수 있다."},
    {targetId:"marketing-2",text:"양쪽 고객을 각각 구체적으로 묘사할 수 있다."},
    {targetId:"marketing-9",text:"다른 중개사·플랫폼과의 차별점을 한 문장으로 말할 수 있다."},
  ]},
];
const ALL_RULES = [...preLaunchRules,...collabRules,...revenueRules,...customerRules,...channelRules,...industryRules];

/* ── buildAxisQuestions: 프로토타입과 동일 로직 ── */
function buildAxisQuestions(axisId, pre){
  const baseline = QUESTIONS_BY_AXIS[axisId].slice(); // 원본 10개 복사
  const rules = ALL_RULES
    .filter(r=>r.axisId===axisId && r.when(pre))
    .sort((a,b)=>(b.priority||0)-(a.priority||0));
  const replacedIds = new Set();
  for(const rule of rules){
    for(const repl of rule.replacements){
      if(replacedIds.has(repl.targetId)) continue;
      const idx = baseline.findIndex(q=>q.id===repl.targetId);
      if(idx<0) continue;
      // 변형: 기존 문항 교체 (id를 변형키 포함으로 변경)
      baseline[idx] = {...baseline[idx], id:repl.targetId+":"+rule.key, text:repl.text, _varKey:rule.key};
      replacedIds.add(repl.targetId);
    }
  }
  return baseline; // 항상 10개, 변형된 것만 id/text 교체
}

/* ── TYPE_30 v2 (2026-09-11 확정 닉네임 30 · 한 줄 · 강점 2 · 주축 문구) ── */
const AXIS_LABEL = {E:"자기관리",B:"생산관리",C:"목표관리",M:"관계관리",P:"판매관리",F:"재무관리"};
/* 축 한 줄 설명 (진단 화면·결과) */
const AXIS_DESC = {
  self:"내 컨디션과 시간을 지켜 오래 일할 수 있게 하는 힘",
  production:"상품·서비스를 약속한 품질과 일정으로 내놓는 힘",
  goal:"가고 싶은 곳을 정하고 이번 주 할 일로 바꾸는 힘",
  relation:"함께 일하는 사람과 손발을 맞추고 도움을 연결하는 힘",
  marketing:"고객을 이해하고 알리고 구매로 잇는 힘",
  finance:"들어오고 나가는 돈을 확인하고 미리 보는 힘",
};
const TYPE_30 = (function(){
  /* [코드, 닉네임, 한 줄, 강점2] — 순서가 다른 쌍은 이름이 다르고 강점 순서가 바뀐다 */
  const raw = [
    ["E-B","작업복 입은 갓생러","내 컨디션을 지키면서, 손으로 직접 만드는 사장님.",["나를 소모하지 않는 일정","품질 기준을 지키는 손"]],
    ["B-E","체력 좋은 장인","내 컨디션을 지키면서, 손으로 직접 만드는 사장님.",["품질 기준을 지키는 손","나를 소모하지 않는 일정"]],
    ["E-C","계획표 든 갓생러","페이스를 지키며 정한 목표를 향해 꾸준히 가는 사장님.",["오래 가는 리듬","목표를 작업으로 나누는 힘"]],
    ["C-E","지치지 않는 설계자","페이스를 지키며 정한 목표를 향해 꾸준히 가는 사장님.",["목표를 작업으로 나누는 힘","오래 가는 리듬"]],
    ["E-M","함께 뛰는 갓생러","내 여유를 지키면서 함께 일하는 사람을 잘 챙기는 사장님.",["과부하 전에 조절하는 습관","역할과 시점을 합의하는 협업"]],
    ["M-E","에너지 넘치는 연결자","내 여유를 지키면서 함께 일하는 사람을 잘 챙기는 사장님.",["역할과 시점을 합의하는 협업","과부하 전에 조절하는 습관"]],
    ["E-P","잘 파는 갓생러","꾸준한 자기 리듬으로 고객 앞에 계속 나서는 사장님.",["지치지 않는 루틴","고객에게 가치를 알리는 활동"]],
    ["P-E","부지런한 상인","꾸준한 자기 리듬으로 고객 앞에 계속 나서는 사장님.",["고객에게 가치를 알리는 활동","지치지 않는 루틴"]],
    ["E-F","가계부 쓰는 갓생러","몸도 돈도 무리하지 않게 지키며 오래 가는 사장님.",["무리하지 않는 일정","입출금을 미리 보는 습관"]],
    ["F-E","부지런한 살림꾼","몸도 돈도 무리하지 않게 지키며 오래 가는 사장님.",["입출금을 미리 보는 습관","무리하지 않는 일정"]],
    ["B-C","달리는 장인","만들 것을 정하고, 정한 대로 만들어 내는 사장님.",["기준대로 점검하는 손","목표를 작업으로 쪼개는 힘"]],
    ["C-B","손수 만드는 설계자","만들 것을 정하고, 정한 대로 만들어 내는 사장님.",["목표를 작업으로 쪼개는 힘","기준대로 점검하는 손"]],
    ["B-M","친절한 장인","함께 일하는 사람과 손발을 맞춰 좋은 것을 만드는 사장님.",["순서가 정리된 작업","역할을 합의하고 정보를 나누는 협업"]],
    ["M-B","만들어 주는 연결자","함께 일하는 사람과 손발을 맞춰 좋은 것을 만드는 사장님.",["역할을 합의하고 정보를 나누는 협업","순서가 정리된 작업"]],
    ["B-P","시장에 나선 장인","만드는 손과 파는 눈을 함께 가진 사장님.",["품질을 점검하는 손","고객 반응을 확인하는 눈"]],
    ["P-B","직접 만드는 상인","만드는 손과 파는 눈을 함께 가진 사장님.",["고객 반응을 확인하는 눈","품질을 점검하는 손"]],
    ["B-F","원가 아는 장인","원가를 알고 만들고, 남는 돈을 확인하는 사장님.",["낭비 없는 작업 방식","가격과 이익을 계산하는 습관"]],
    ["F-B","손재주 있는 살림꾼","원가를 알고 만들고, 남는 돈을 확인하는 사장님.",["가격과 이익을 계산하는 습관","낭비 없는 작업 방식"]],
    ["C-M","함께 그리는 설계자","가고 싶은 곳을 정하고, 함께 가는 사람을 챙기는 사장님.",["목표와 마감을 정하는 힘","역할을 합의하는 협업"]],
    ["M-C","방향 있는 연결자","가고 싶은 곳을 정하고, 함께 가는 사람을 챙기는 사장님.",["역할을 합의하는 협업","목표와 마감을 정하는 힘"]],
    ["C-P","시장을 읽는 설계자","목표를 정하고, 그 이유를 고객에게 전하는 사장님.",["우선순위를 정하는 힘","고객에게 가치를 알리는 활동"]],
    ["P-C","성장하는 상인","목표를 정하고, 그 이유를 고객에게 전하는 사장님.",["고객에게 가치를 알리는 활동","우선순위를 정하는 힘"]],
    ["C-F","숫자로 그리는 설계자","목표와 돈의 흐름을 같이 보며 계획을 세우는 사장님.",["목표를 숫자로 추적하는 습관","입출금을 미리 보는 습관"]],
    ["F-C","앞을 보는 살림꾼","목표와 돈의 흐름을 같이 보며 계획을 세우는 사장님.",["입출금을 미리 보는 습관","목표를 숫자로 추적하는 습관"]],
    ["M-P","단골을 만드는 연결자","사람과의 관계가 곧 판매로 이어지는 사장님.",["고객·협력자와의 소통","고객이 선택한 이유를 아는 눈"]],
    ["P-M","단골 많은 상인","사람과의 관계가 곧 판매로 이어지는 사장님.",["고객이 선택한 이유를 아는 눈","고객·협력자와의 소통"]],
    ["M-F","셈 밝은 연결자","사람에게 믿음을 주고, 돈은 꼼꼼히 챙기는 사장님.",["약속을 지키는 협업","수입과 지출을 확인하는 습관"]],
    ["F-M","믿음직한 살림꾼","사람에게 믿음을 주고, 돈은 꼼꼼히 챙기는 사장님.",["수입과 지출을 확인하는 습관","약속을 지키는 협업"]],
    ["P-F","남길 줄 아는 상인","팔 줄 알고, 남는 돈도 아는 사장님.",["고객 유입을 확인하는 눈","이익을 확인하는 습관"]],
    ["F-P","돈도 잘 버는 살림꾼","팔 줄 알고, 남는 돈도 아는 사장님.",["이익을 확인하는 습관","고객 유입을 확인하는 눈"]],
  ];
  const map = {};
  raw.forEach(([key,nick,liner,strengths])=>{
    const [a,b]=key.split("-");
    map[key]={code:key,nickname:nick,oneLiner:liner,strengths,weaknesses:[],
      axisNote:AXIS_LABEL[a]+"가 조금 앞서고 "+AXIS_LABEL[b]+"가 뒤따릅니다."};
  });
  return map;
})();
const TYPE_MASTER   = {code:"MASTER",  nickname:"마스터",  oneLiner:"여섯 영역을 모두 높고 고르게 실천하고 있는, 이 진단에서 가장 드문 사장님.",strengths:["빈 곳 없는 실천","흔들리지 않는 균형"],weaknesses:[],axisNote:"여섯 영역이 모두 높고 차이가 작습니다. 축하드립니다."};
const TYPE_BALANCED = {code:"BALANCED",nickname:"균형 사업가",oneLiner:"여섯 영역 어느 하나 처지지 않게 챙기고 있다고 답한 사장님.",strengths:["고른 실천","안정감"],weaknesses:[],axisNote:"여섯 영역이 고르게 높습니다."};

/* ── 2주 과제 (축당 3개 · 검수 문서 3절). 가장 낮게 답한 문항 번호에 따라 하나를 고른다 ── */
const TASKS = {
  self:[
    {ids:[5,7,8],text:"이번 주엔 업무를 끝내는 시간을 하나 정해 두고, 딱 세 번만 지켜 보세요."},
    {ids:[1,2,3,4],text:"하루 중 집중이 잘되는 시간을 찾아 그 시간에 가장 중요한 일 하나를 넣어 보세요."},
    {ids:[6,9,10],text:"피곤이 몰리는 신호를 메모해 두고, 그 신호가 오면 일을 하나 줄여 보세요."},
  ],
  production:[
    {ids:[6,7,8],text:"가장 자주 반복하는 일 하나의 순서를 열 줄로 적어 두세요. 다음에 그대로 따라 해 보면 빠진 단계가 보입니다."},
    {ids:[1,2,3,4,5,9],text:"주력 상품·서비스가 지켜야 할 기준 세 가지를 적고, 이번 주 결과물을 그 기준으로 한 번 점검해 보세요."},
    {ids:[10],text:"이번 주 약속한 완료 시점과 실제 완료 시점을 적어 두세요. 차이가 나는 곳이 손볼 곳입니다."},
  ],
  goal:[
    {ids:[1,2,5,6,10],text:"이번 달 가장 중요한 목표 하나와 \"이렇게 되면 끝\"이라는 기준을 한 줄로 적어 보세요."},
    {ids:[3,7,8,9],text:"그 목표를 이번 주에 할 작업 세 개로 나눠 달력에 넣어 보세요."},
    {ids:[4],text:"월말에 딱 10분, 정한 목표와 실제 결과를 나란히 놓고 비교해 보세요."},
  ],
  relation:[
    {ids:[1,2,9,10],text:"함께 일하는 상대와 \"언제 진행 상황을 확인할지\"를 한 번 정해 두세요. 짧은 메시지면 충분합니다."},
    {ids:[3,4,5],text:"다음 일을 시작하기 전에 각자 맡을 범위를 한 줄씩 적어 상대에게 보내 보세요."},
    {ids:[6,7,8],text:"혼자 판단하기 어려운 문제 하나를 골라, 의논할 사람 한 명에게 물어보세요."},
  ],
  marketing:[
    {ids:[3,4,5,6,8],text:"고객이 가장 많이 들어오는 경로 하나를 정해, 이번 주 숫자를 적어 보세요."},
    {ids:[1,2,7,9],text:"고객이 결정할 때 보여 줄 설명 자료를 한 장으로 정리해 보세요."},
    {ids:[10],text:"관심을 보인 고객에게 다음 단계를 안내하는 문장 하나를 만들어 두세요."},
  ],
  finance:[
    {ids:[4,5,8],text:"앞으로 세 달의 들어올 돈과 나갈 돈을 한 장에 적어 보세요. 부족해지는 달이 보이면 성공입니다."},
    {ids:[1,2,3,9,10],text:"지난달 이익 숫자를 장부나 정산 기록에서 한 번 찾아 확인해 보세요."},
    {ids:[6,7],text:"앞으로 나갈 돈(지급·세금·상환)의 날짜를 한 줄씩 적어 달력에 넣어 보세요."},
  ],
};
const TASK_ALL_HIGH = "지금 방식이 잘 돌아가고 있네요. 이번 두 주는 그중 하나가 실제로 작동하는지 기록으로 확인해 보세요.";
function pickTask(axisId, lowestN){
  const list=TASKS[axisId]||[]; const hit=list.find(t=>t.ids.includes(lowestN)); return (hit||list[0]||{}).text||"";
}

/* ── 강점 풀어 쓰기 v3.5 (유형별 2개, 순서 = strengths 순서 = 1위 축 → 2위 축).
   문장 1 = 잰 것(답하신 내용) · 문장 2 = 칭찬(왜 드물고 귀한지) · 문장 3 = 사장님께 주는 의미. 결과 화면에서 문장마다 줄을 바꾼다. ── */
const STRENGTH_NOTES = {
  "E-B":["운동이나 활동을 정해 둔 대로 지키고, 일이 넘치면 맡을 일을 줄인다고 답하셨어요. 바쁠수록 자기 리듬을 먼저 지키는 사장님은 정말 드뭅니다. 오래 가는 사업의 첫 번째 조건을 이미 갖고 계십니다.","품질 기준을 정해 두고 결과물을 그 기준으로 다시 본다고 답하셨어요. 손이 빠른 사장님은 많아도 손이 정확한 사장님은 적습니다. 고객이 믿고 다시 오는 이유가 여기에 있습니다."],
  "B-E":["품질 기준과 반복 작업의 순서가 정리돼 있다고 답하셨어요. 같은 품질을 다시 낼 수 있다는 건 장인의 손입니다. 사장님이 없어도 흔들리지 않는 뿌리입니다.","잠자는 시간과 재충전 시간을 지키려 일정을 조정한다고 답하셨어요. 만드는 사람이 자기 몸을 챙기는 건 쉽지 않은 일입니다. 그래서 이 손이 오래 갑니다."],
  "E-C":["번아웃 신호를 알아채고, 감정이 흔들리는 날에는 결정을 미룬다고 답하셨어요. 자기 상태를 읽으며 달리는 사장님은 큰 실수를 피합니다. 판단의 질이 여기서 나옵니다.","목표를 작업으로 나누고 마감일을 붙인다고 답하셨어요. 가고 싶은 곳을 이번 주 할 일로 바꾸는 힘은 배워서 되는 게 아닙니다. 이미 몸에 붙어 있습니다."],
  "C-E":["1년 동안 이루려는 변화를 적어 두고 숫자로 추적한다고 답하셨어요. 방향을 종이에 적어 두는 사장님은 열에 하나입니다. 그 한 장이 사업의 나침반입니다.","에너지가 높은 시간대에 중요한 일을 놓고, 과부하가 오면 줄인다고 답하셨어요. 페이스를 아는 달리기입니다. 그래서 이 방향이 끝까지 갑니다."],
  "E-M":["일과 사생활의 경계를 지키고, 감당 범위를 넘으면 도움을 요청한다고 답하셨어요. 혼자 끌어안지 않는 건 약함이 아니라 성숙함입니다. 오래 함께 일할 수 있는 사장님입니다.","함께 일하는 상대와 확인 시점을 정하고 맡을 범위를 합의한다고 답하셨어요. 손발을 맞추는 방법을 아는 분은 사람을 잃지 않습니다. 팀이 커져도 흔들리지 않을 바탕입니다."],
  "M-E":["의견이 갈리면 상대의 설명을 듣고, 필요한 자료를 먼저 준다고 답하셨어요. 사람이 일하기 좋게 만드는 사장님 곁에는 사람이 남습니다. 그것이 가장 큰 자산입니다.","스트레스를 푸는 자기만의 방법이 있고 재충전 시간을 지킨다고 답하셨어요. 사람을 챙기면서 자기도 챙기는 분은 정말 드뭅니다. 그래서 이 따뜻함이 오래 갑니다."],
  "E-P":["운동·수면·재충전을 지키려 일정을 조정한다고 답하셨어요. 꾸준함이 의지가 아니라 몸에서 나오는 사장님입니다. 이런 분은 무너지지 않습니다.","고객이 들어오는 경로의 성과를 확인하고 다음 단계를 안내하는 절차가 있다고 답하셨어요. 고객 앞에 계속 서는 일은 용기와 체력이 함께 필요합니다. 두 가지를 다 갖고 계십니다."],
  "P-E":["고객이 결정할 때 보여 줄 자료가 있고 후기를 정기적으로 모은다고 답하셨어요. 파는 일을 습관으로 만든 분입니다. 매출이 운이 아니라 구조에서 나옵니다.","과부하가 오면 일을 줄이고, 잠을 지키려 일정을 바꾼다고 답하셨어요. 잘 파는 사장님이 자기 몸까지 챙기는 경우는 흔치 않습니다. 그래서 그 습관이 오래 갑니다."],
  "E-F":["몸의 이상 신호를 미루지 않고, 재충전 시간을 확보한다고 답하셨어요. 무리하지 않는 쪽을 고를 줄 아는 건 경험에서 나오는 지혜입니다. 오래 가는 사장님의 특징입니다.","앞으로 세 달의 입출금을 미리 보고 지급 일정을 정리해 둔다고 답하셨어요. 돈을 미리 보는 사장님은 밤에 잠을 잘 잡니다. 몸과 돈을 같은 방식으로 지키고 계십니다."],
  "F-E":["지난달 이익을 바로 확인할 수 있고, 고정비와 변동비를 구분한다고 답하셨어요. 통장을 감이 아니라 숫자로 보는 분입니다. 작은 사업에서 가장 귀한 습관입니다.","일이 넘치면 맡을 일을 줄이고 잠을 지킨다고 답하셨어요. 살림도 몸도 무리하지 않게 운영하는 사장님입니다. 그래서 이 사업은 길게 갑니다."],
  "B-C":["정해 둔 기준으로 품질을 점검하고 납기 차이를 확인한다고 답하셨어요. 약속한 대로 내놓는 손은 말보다 강한 신뢰를 만듭니다. 고객이 이 손을 믿습니다.","중요한 목표를 작업 단위로 나누고 마감일을 정한다고 답하셨어요. 만들 것이 먼저 정해져 있는 사장님입니다. 헤매는 시간이 적은 이유입니다."],
  "C-B":["정한 목표를 다음에 할 작업 단위로 나누고, 주요 작업에 마감일을 붙인다고 답하셨어요. 큰 그림을 책상 위의 이번 주 할 일로 내려놓는 힘은 정말 드뭅니다. 계획이 계획으로 끝나지 않는 사장님입니다.","주력 상품이 지켜야 할 품질 기준을 정해 두고, 결과물을 그 기준으로 주기적으로 다시 본다고 답하셨어요. 만든 것을 그냥 내보내지 않는 손입니다. 이 손 덕분에 고객이 다시 옵니다."],
  "B-M":["반복 업무의 순서가 정리돼 있고 자료를 나 없이도 찾을 수 있다고 답하셨어요. 함께 일하기 좋은 작업장을 만드는 건 배려이자 실력입니다. 사람이 이 작업장에 남는 이유입니다.","맡을 범위를 합의하고 필요한 정보를 먼저 준다고 답하셨어요. 좋은 것을 함께 만드는 방법을 아는 분입니다. 혼자 만들 때보다 더 좋은 것이 나옵니다."],
  "M-B":["함께 일하는 상대와 진행 확인 시점을 정하고, 빠질 때 대신 도움을 청할 사람을 안다고 답하셨어요. 협업이 끊기지 않게 잇는 손은 조직을 지키는 손입니다. 사람이 이 사장님을 믿습니다.","품질 기준을 정해 두고 그 기준으로 점검한다고 답하셨어요. 사람을 연결하면서 만든 것도 확실한 분은 정말 귀합니다. 두 가지가 함께 있으니 커질 준비가 된 사업입니다."],
  "B-P":["품질을 기준대로 점검하고 고객 불만을 개선에 반영한다고 답하셨어요. 손이 고객 쪽을 향해 있는 장인입니다. 만든 것이 시장에서 살아남는 이유입니다.","고객이 들어오는 경로의 성과와 재구매를 확인한다고 답하셨어요. 만드는 손에 파는 눈이 함께 있는 분은 열에 하나입니다. 사장님은 그 하나입니다."],
  "P-B":["고객이 선택한 이유를 설명할 자료가 있고 후기를 모은다고 답하셨어요. 고객의 반응을 읽는 눈이 먼저 움직이는 분입니다. 팔리는 것을 만드는 힘입니다.","불만을 개선에 반영하고 결과물을 기준으로 점검한다고 답하셨어요. 팔고 나서도 손을 놓지 않는 상인은 오래 갑니다. 단골이 생기는 이유입니다."],
  "B-F":["원가와 과정을 꾸준히 다듬고 납기 차이를 확인한다고 답하셨어요. 낭비가 적은 작업 방식은 하루아침에 만들어지지 않습니다. 오래 다듬어 온 손입니다.","가격의 근거를 갖고 지난달 이익을 바로 확인한다고 답하셨어요. 만든 만큼 남는지 계산하는 장인은 정말 드뭅니다. 이 사업이 흑자로 가는 이유입니다."],
  "F-B":["가격 근거가 명확하고 고정비·변동비를 구분한다고 답하셨어요. 살림의 숫자를 아는 사장님은 어떤 달에도 놀라지 않습니다. 든든한 뿌리입니다.","반복 작업의 순서가 정리돼 있고 원가를 계속 다듬는다고 답하셨어요. 손재주가 낭비 없이 쓰이는 분입니다. 같은 노력으로 더 남기는 구조를 이미 갖고 계십니다."],
  "C-M":["올해 목표를 바로 말할 수 있고 주요 작업에 마감이 있다고 답하셨어요. 가고 싶은 곳이 분명한 사장님입니다. 사람들이 따라올 수 있는 이유입니다.","맡을 범위를 합의하고 확인 시점을 정한다고 답하셨어요. 함께 가는 사람도 그 길을 알고 있습니다. 혼자 가는 것보다 멀리 갈 수 있는 팀입니다."],
  "M-C":["의견이 갈릴 때 원인을 확인하고 필요한 자료를 준다고 답하셨어요. 사람을 잇는 손이 먼저 움직이는 분입니다. 좋은 사람이 모이는 사장님입니다.","목표를 숫자로 추적하고 마감일을 정한다고 답하셨어요. 그 연결이 어디로 가는지도 정해져 있습니다. 관계가 성과로 이어지는 드문 조합입니다."],
  "C-P":["매주·매월 우선순위를 정하고 시장 변화를 목표에 반영한다고 답하셨어요. 가야 할 이유를 계속 다시 보는 사장님입니다. 방향이 낡지 않는 이유입니다.","가치 제안을 한 줄로 말하고 유입 경로 성과를 확인한다고 답하셨어요. 그 이유를 고객에게 전할 줄 아는 분입니다. 좋은 전략이 매출로 이어지는 힘입니다."],
  "P-C":["고객이 결정할 자료가 있고 다음 단계를 안내하는 절차가 있다고 답하셨어요. 파는 흐름이 몸에 붙어 있는 사장님입니다. 매출이 우연이 아닌 이유입니다.","올해 목표와 이번 주 우선순위가 정해져 있다고 답하셨어요. 그 흐름이 어디로 커질지도 정해 두셨습니다. 잘 파는 데서 멈추지 않고 자라는 상인입니다."],
  "C-F":["목표를 숫자로 정해 추적하고 월말에 돌아본다고 답하셨어요. 계획이 숫자로 적혀 있는 사장님은 열에 하나입니다. 그래서 계획이 실현됩니다.","세 달 입출금을 미리 보고 지급 일정을 정리한다고 답하셨어요. 그 계획에 연료 계산이 붙어 있습니다. 무리한 목표를 세우지 않는 이유입니다."],
  "F-C":["앞으로 나갈 돈의 일정을 정리하고 부족해질 시점을 미리 본다고 답하셨어요. 앞을 보고 살림하는 분은 위기를 미리 피합니다. 가장 든든한 종류의 사장님입니다.","1년의 변화를 적어 두고 작업 단위로 나눈다고 답하셨어요. 살림이 목표를 향해 움직이고 있습니다. 지키는 힘과 나아가는 힘을 함께 가진 분입니다."],
  "M-P":["함께 일하는 사람에게 감사를 표현하고 의논할 상대가 있다고 답하셨어요. 관계가 자산인 사장님입니다. 사람이 사람을 데려오는 사업입니다.","재구매와 후기를 확인하고 다음 단계를 안내한다고 답하셨어요. 그 관계가 단골로 이어지고 있습니다. 광고보다 강한 힘을 이미 갖고 계십니다."],
  "P-M":["고객이 선택한 이유를 말할 수 있고 후기를 정기적으로 모은다고 답하셨어요. 고객을 읽는 눈이 먼저 움직이는 분입니다. 잘 팔리는 데는 이유가 있습니다.","협력사와 장기 관계를 관리하고 도움 청할 사람을 안다고 답하셨어요. 그 눈이 사람에게도 향합니다. 단골과 협력자가 함께 남는 상인입니다."],
  "M-F":["맡을 범위를 합의하고 확인 시점을 정한다고 답하셨어요. 약속을 지키는 방식으로 믿음을 얻는 사장님입니다. 오래 함께할 사람이 모입니다.","수입과 지출을 확인하고 수금을 예정일에 점검한다고 답하셨어요. 사람에게 따뜻하면서 돈에는 밝은 분은 정말 드뭅니다. 두 가지를 다 갖고 계십니다."],
  "F-M":["지난달 이익을 바로 확인하고 지급 일정을 정리해 둔다고 답하셨어요. 돈을 꼼꼼히 챙기는 살림꾼입니다. 이 사업이 흔들리지 않는 이유입니다.","의견이 갈리면 원인을 확인하고 필요한 자료를 준다고 답하셨어요. 살림에 밝은 분이 사람에게도 믿음을 줍니다. 오래 가는 사업의 두 기둥입니다."],
  "P-F":["유입 경로의 성과와 고객 획득 비용의 기준이 있다고 답하셨어요. 파는 일을 숫자로 보는 사장님입니다. 감이 아니라 근거로 파는 분입니다.","가격 근거가 있고 이익을 바로 확인한다고 답하셨어요. 팔고 나서 남는 돈까지 아는 상인은 열에 하나입니다. 매출이 이익으로 이어지는 구조를 갖고 계십니다."],
  "F-P":["이익을 확인하고 세 달 입출금을 미리 본다고 답하셨어요. 살림이 먼저 서 있는 사장님입니다. 어떤 달에도 발 뻗고 잘 수 있는 구조입니다.","유입 경로 성과를 확인하고 다음 단계를 안내한다고 답하셨어요. 그 살림에 파는 힘이 붙어 있습니다. 지키면서 키우는 드문 조합입니다."],
  "MASTER":["여섯 영역 모두 높게, 그리고 고르게 답하셨어요. 60문항 중 어느 한 곳도 놓지 않았다는 뜻입니다. 이 진단에서 가장 드문 결과이고, 사장님이 지금까지 해 온 방식이 옳았다는 증거입니다.","가장 높은 영역과 가장 낮은 영역의 차이가 작았어요. 한 축이 무너져도 나머지가 받쳐 주는 구조입니다. 흔들려도 넘어지지 않는 사업을 이미 만드셨습니다."],
  "BALANCED":["여섯 영역 어느 하나 처지지 않게 답하셨어요. 고르게 실천한다는 건 매일 여섯 가지를 다 챙긴다는 뜻입니다. 쉽게 되는 일이 아닙니다.","높은 영역과 낮은 영역의 차이가 크지 않았어요. 안정감이 이 결과의 특징입니다. 어디를 밀어도 움직일 준비가 된 사업입니다."],
};
/* 닮은 사업가 한 줄 (공유 카드와 공유) */
const SIMILAR_ACH={"사티아 나델라":"MS를 클라우드·AI 강자로 되살린 경영자","지로 오노":"평생 스시 하나에 매진한 미슐랭 3스타 장인","이본 쉬나드":"환경을 지키는 기업 철학의 상징","라탄 타타":"인도 최대 그룹을 세계로 이끈 경영자","인드라 누이":"펩시코를 이끈 '목적 있는 성장'의 리더","빌 캠벨":"실리콘밸리 경영자들의 스승이 된 코치","하워드 슐츠":"스타벅스를 세계적 브랜드로 키운 경영자","오프라 윈프리":"토크쇼로 미디어 제국을 세운 방송인","사라 블레이클리":"맨손으로 스팽스를 일군 자수성가 창업가","워런 버핏":"가치투자를 대표하는 세계적 투자가","존 보글":"저비용 인덱스 투자를 창시한 혁신가","월트 디즈니":"애니메이션과 테마파크를 창조한 몽상가","빌 게이츠":"PC를 대중화한 마이크로소프트 창업자","에드 캣멀":"픽사의 창의적 조직문화를 만든 리더","마쓰시타 고노스케":"'경영의 신'으로 불린 파나소닉 창업자","스티브 잡스":"혁신의 아이콘, 애플의 창업자","레이 크록":"맥도날드를 세계 프랜차이즈로 키운 경영자","팀 쿡":"애플을 시총 최고로 이끈 운영의 달인","샘 월튼":"세계 최대 유통 월마트를 세운 창업자","리드 헤이스팅스":"스트리밍 혁명을 이끈 넷플릭스 창업자","제프 베조스":"'고객 집착'으로 아마존을 세운 창업자","필 나이트":"나이키를 브랜드 신화로 만든 창업자","찰리 멍거":"버핏의 파트너, 다각적 사고의 투자가","레이 달리오":"세계 최대 헤지펀드를 세운 투자가","메리 케이 애시":"여성 방문판매 제국을 세운 창업가","에스티 로더":"화장품 제국을 일군 뷰티 창업가","제임스 시네갈":"회원제 유통 코스트코를 키운 경영자","이나모리 가즈오":"교세라를 세운 '아메바 경영'의 대가","베르나르 아르노":"명품 제국 LVMH를 이끄는 경영자","젠슨 황":"AI 반도체 시대를 연 엔비디아 창업자","일론 머스크":"전기차·우주로 도전하는 테슬라 창업자","김영모":"대한민국을 대표하는 제과 명장","신춘호":"신라면 신화를 쓴 농심 창업자","정문술":"벤처 1세대, 통 큰 기부로 존경받는 경영자","권오현":"반도체 신화를 이끈 삼성전자 경영자","신창재":"독서·정도경영의 교보생명 경영자","김미경":"자기계발 교육으로 성장한 대표 강사","박신후":"자기 분야를 꾸준히 키워온 사업가","구인회":"화학·전자의 기틀을 놓은 LG 창업자","윤동한":"화장품 ODM을 개척한 한국콜마 창업자","정주영":"'해봤어?'의 도전, 현대 창업자","이원영":"워라밸 기업문화의 제니퍼소프트 창업자","임영진":"디지털 금융을 이끈 신한카드 경영자","김정수":"삼립을 성장시킨 제빵 경영자","정태영":"디자인·브랜딩 경영의 현대카드 대표","박정부":"균일가 유통 다이소를 세운 창업자","이부진":"호텔·면세 사업을 이끈 호텔신라 경영자","최태원":"사회적 가치를 앞세운 SK 회장","권혁빈":"글로벌 게임 신화를 쓴 스마일게이트 창업자","김홍국":"닭고기 수직계열화를 이룬 하림 창업자","최종현":"인재경영으로 SK를 키운 경영자","박현주":"자산운용을 개척한 미래에셋 창업자","우미령":"윤리적 뷰티를 이끈 러쉬코리아 대표","서경배":"K뷰티를 세계로 넓힌 아모레퍼시픽 회장","함영준":"'갓뚜기' 상생경영의 오뚜기 회장","조정호":"성과주의로 성장한 메리츠금융 회장","윤윤수":"휠라를 인수해 부활시킨 경영자","이건희":"'신경영'으로 삼성을 세계로 이끈 회장","구광모":"선택과 집중의 LG 회장"};
window.__sbaHexdAch = SIMILAR_ACH;

/* ── 닮은 사업가 맵 (블록 코드 기준 · 캐릭터카드 한 줄 요약표) ──
   해외 1명 + 국내 1명(최대 2), 카드에서 안전 확인된 인물만. */
const SIMILAR = {
  "E-B":{g:{n:"지로 오노",c:"스키야바시 지로",dom:"",mono:"JI"},d:{n:"김영모",c:"김영모과자점",dom:"kimyoungmo.com",mono:"YM"}},
  "B-E":{g:{n:"이본 쉬나드",c:"파타고니아",dom:"patagonia.com",mono:"PT"},d:{n:"신춘호",c:"농심",dom:"nongshim.com",mono:"NS"}},
  "E-C":{g:{n:"라탄 타타",c:"타타그룹",dom:"tata.com",mono:"TT"},d:{n:"정문술",c:"미래산업",dom:"",mono:"MI"}},
  "C-E":{g:{n:"인드라 누이",c:"PepsiCo",dom:"pepsico.com",mono:"PC"},d:{n:"정문술",c:"미래산업",dom:"",mono:"MI"}},
  "E-M":{g:{n:"빌 캠벨",c:"Intuit",dom:"intuit.com",mono:"BC"},d:{n:"권오현",c:"삼성전자",dom:"samsung.com",mono:"SE"}},
  "M-E":{g:{n:"하워드 슐츠",c:"스타벅스",dom:"starbucks.com",mono:"SB"},d:{n:"신창재",c:"교보생명",dom:"kyobo.co.kr",mono:"KB"}},
  "E-P":{g:{n:"오프라 윈프리",c:"Harpo Productions",dom:"oprah.com",mono:"OP"},d:{n:"김미경",c:"MKYU",dom:"mkyu.com",mono:"MK"}},
  "P-E":{g:{n:"사라 블레이클리",c:"Spanx",dom:"spanx.com",mono:"SX"},d:{n:"박신후",c:"",dom:"",mono:"SH"}},
  "E-F":{g:{n:"워런 버핏",c:"버크셔 해서웨이",dom:"berkshirehathaway.com",mono:"BH"},d:{n:"구인회",c:"LG그룹",dom:"lg.com",mono:"LG"}},
  "F-E":{g:{n:"존 보글",c:"Vanguard",dom:"vanguard.com",mono:"VG"},d:{n:"구인회",c:"LG그룹",dom:"lg.com",mono:"LG"}},
  "B-C":{g:{n:"월트 디즈니",c:"Disney",dom:"disney.com",mono:"DS"},d:{n:"윤동한",c:"한국콜마",dom:"kolmar.co.kr",mono:"KM"}},
  "C-B":{g:{n:"빌 게이츠",c:"Microsoft",dom:"microsoft.com",mono:"MS"},d:{n:"정주영",c:"현대그룹",dom:"hyundai.com",mono:"HY"}},
  "B-M":{g:{n:"에드 캣멀",c:"Pixar",dom:"pixar.com",mono:"PX"},d:{n:"이원영",c:"제니퍼소프트",dom:"jennifersoft.com",mono:"JS"}},
  "M-B":{g:{n:"마쓰시타 고노스케",c:"Panasonic",dom:"panasonic.com",mono:"PS"},d:{n:"임영진",c:"신한카드",dom:"shinhancard.com",mono:"SC"}},
  "B-P":{g:{n:"스티브 잡스",c:"Apple",dom:"apple.com",mono:"AP"},d:{n:"김정수",c:"삼립식품",dom:"",mono:"SL"}},
  "P-B":{g:{n:"레이 크록",c:"McDonald's",dom:"mcdonalds.com",mono:"MC"},d:{n:"정태영",c:"현대카드",dom:"hyundaicard.com",mono:"HC"}},
  "B-F":{g:{n:"팀 쿡",c:"Apple",dom:"apple.com",mono:"AP"},d:{n:"박정부",c:"아성다이소",dom:"daiso.co.kr",mono:"DS"}},
  "F-B":{g:{n:"샘 월튼",c:"Walmart",dom:"walmart.com",mono:"WM"},d:{n:"이부진",c:"호텔신라",dom:"hotelshilla.net",mono:"HS"}},
  "C-M":{g:{n:"인드라 누이",c:"PepsiCo",dom:"pepsico.com",mono:"PC"},d:{n:"권오현",c:"삼성전자",dom:"samsung.com",mono:"SE"}},
  "M-C":{g:{n:"리드 헤이스팅스",c:"Netflix",dom:"netflix.com",mono:"NF"},d:{n:"최태원",c:"SK그룹",dom:"sk.com",mono:"SK"}},
  "C-P":{g:{n:"제프 베조스",c:"Amazon",dom:"amazon.com",mono:"AZ"},d:{n:"권혁빈",c:"스마일게이트",dom:"smilegate.com",mono:"SG"}},
  "P-C":{g:{n:"필 나이트",c:"Nike",dom:"nike.com",mono:"NK"},d:{n:"김홍국",c:"하림그룹",dom:"harim.com",mono:"HR"}},
  "C-F":{g:{n:"찰리 멍거",c:"버크셔 해서웨이",dom:"berkshirehathaway.com",mono:"BH"},d:{n:"최종현",c:"SK그룹",dom:"sk.com",mono:"SK"}},
  "F-C":{g:{n:"레이 달리오",c:"Bridgewater",dom:"bwater.com",mono:"BW"},d:{n:"박현주",c:"미래에셋",dom:"miraeasset.com",mono:"MA"}},
  "M-P":{g:{n:"메리 케이 애시",c:"Mary Kay",dom:"marykay.com",mono:"MK"},d:{n:"우미령",c:"러쉬코리아",dom:"lush.com",mono:"LK"}},
  "P-M":{g:{n:"에스티 로더",c:"Estée Lauder",dom:"elcompanies.com",mono:"EL"},d:{n:"서경배",c:"아모레퍼시픽",dom:"amorepacific.com",mono:"AP"}},
  "M-F":{g:{n:"제임스 시네갈",c:"Costco",dom:"costco.com",mono:"CO"},d:{n:"함영준",c:"오뚜기",dom:"ottogi.com",mono:"OT"}},
  "F-M":{g:{n:"이나모리 가즈오",c:"교세라",dom:"kyocera.com",mono:"KC"},d:{n:"조정호",c:"메리츠금융",dom:"meritz.co.kr",mono:"MZ"}},
  "P-F":{g:{n:"베르나르 아르노",c:"LVMH",dom:"lvmh.com",mono:"LV"},d:{n:"윤윤수",c:"휠라코리아",dom:"fila.com",mono:"FL"}},
  "F-P":{g:{n:"베르나르 아르노",c:"LVMH",dom:"lvmh.com",mono:"LV"},d:{n:"정태영",c:"현대카드",dom:"hyundaicard.com",mono:"HC"}},
  "MASTER":{g:[{n:"젠슨 황",c:"NVIDIA",dom:"nvidia.com",mono:"NV"},{n:"일론 머스크",c:"Tesla",dom:"tesla.com",mono:"TS"}],d:[{n:"이건희",c:"삼성전자",dom:"samsung.com",mono:"SE"},{n:"정주영",c:"현대그룹",dom:"hyundai.com",mono:"HY"}]},
  "BALANCED":{g:{n:"사티아 나델라",c:"Microsoft",dom:"microsoft.com",mono:"MS"},d:{n:"구광모",c:"LG그룹",dom:"lg.com",mono:"LG"}},
};

/* ── 유형별 캐릭터 이미지 (결과 화면 상단 · 공개 CDN) ── */
const _CB="https://fastly.jsdelivr.net/gh/kjgqppr9-cmyk/sba-site@s1029a/chars/";
const _CI="https://fastly.jsdelivr.net/gh/kjgqppr9-cmyk/sba-site@s1029a/chars/";
const CHAR_IMG={
  "E-B":_CI+"S-P.webp","E-C":_CI+"S-G.webp","E-M":_CI+"S-R.webp","E-P":_CI+"S-M.webp","E-F":_CI+"S-F.webp",
  "B-E":_CI+"P-S.webp","B-C":_CI+"P-G.webp","B-M":_CI+"P-R.webp","B-P":_CI+"P-M.webp","B-F":_CI+"P-F.webp",
  "C-E":_CI+"G-S.webp","C-B":_CI+"G-P.webp","C-M":_CI+"G-R.webp","C-P":_CI+"G-M.webp","C-F":_CI+"G-F.webp",
  "M-E":_CI+"R-S.webp","M-B":_CI+"R-P.webp","M-C":_CI+"R-G.webp","M-P":_CI+"R-M.webp","M-F":_CI+"R-F.webp",
  "P-E":_CI+"M-S.webp","P-B":_CI+"M-P.webp","P-C":_CI+"M-G.webp","P-M":_CI+"M-R.webp","P-F":_CI+"M-F.webp",
  "F-E":_CI+"F-S.webp","F-B":_CI+"F-P.webp","F-C":_CI+"F-G.webp","F-M":_CI+"F-R.webp","F-P":_CI+"F-M.webp",
  "BALANCED":_CI+"BALANCED.webp","MASTER":_CI+"MASTER.webp"
};

/* ── 엔진 함수 ─────────────────────────────────── */
function likertToScore(avg){ if(avg<=0) return 0; return Math.round(((avg-1)/(LIKERT_MAX-1))*100); }
/* ── 점수·동률·유형 판정 v2 ─────────────────────────────────────────
   점수: 축 평균 → 0~100. 동률: 두 축 차이가 TIE_PT(1.67점 = 한 문항 한 단계) 미만이면 후보.
   후보끼리는 ① 6~7점 응답 수 ② 응답 편차(작을수록) ③ 최저 응답(높을수록) ④ 고정 순서(E>B>C>M>P>F).
   고민 영역은 판정에 쓰지 않는다. 마스터 = 최저≥85 & 폭≤15, 균형 = 최저≥70 & 폭≤20. */
const TIE_PT = 1.67;
function axisStats(answers, qs){
  const vals = qs.map(q=>answers[q.id]).filter(v=>v!=null);
  const n = vals.length; if(!n) return {n:0,mean:0,sd:0,high:0,min:0,low:0};
  const mean = vals.reduce((a,b)=>a+b,0)/n;
  const sd = Math.sqrt(vals.reduce((a,b)=>a+(b-mean)*(b-mean),0)/n);
  return {n, mean, sd, high:vals.filter(v=>v>=6).length, low:vals.filter(v=>v<=3).length, min:Math.min.apply(null,vals)};
}
/* a 가 b 보다 앞서면 음수. 결정 단계를 out.step 에 남긴다 */
function cmpAxes(a,b,out){
  const d=b.score-a.score;
  if(Math.abs(d)>=TIE_PT){ if(out) out.step=0; return d; }
  const sa=a.stats||{}, sb=b.stats||{};
  if((sb.high||0)!==(sa.high||0)){ if(out) out.step=1; return (sb.high||0)-(sa.high||0); }
  if(Math.abs((sa.sd||0)-(sb.sd||0))>1e-9){ if(out) out.step=2; return (sa.sd||0)-(sb.sd||0); }
  if((sb.min||0)!==(sa.min||0)){ if(out) out.step=3; return (sb.min||0)-(sa.min||0); }
  if(out) out.step=4; return TIE_BREAK_PRIORITY[b.code]-TIE_BREAK_PRIORITY[a.code];
}
function rankAxes(scores){
  const arr=scores.slice();
  arr.sort((a,b)=>cmpAxes(a,b));
  const notes=[];
  function noteFor(pos){ /* pos 번째와 그 다음이 동률 후보였는지 */
    const a=arr[pos], b=arr[pos+1]; if(!a||!b) return;
    if(Math.abs(a.score-b.score)>=TIE_PT) return;
    const o={}; cmpAxes(a,b,o); const la=labelOf(a.axisId), lb=labelOf(b.axisId);
    const msg = o.step===1 ? la+"와 "+lb+"가 비슷했지만, "+la+"를 더 자주 '매우 그렇다'고 답하셨어요."
             : o.step===2 ? la+"와 "+lb+"가 비슷했지만, "+la+"를 더 고르게 실천하고 계셨어요."
             : o.step===3 ? la+"와 "+lb+"가 비슷했지만, "+la+"에는 낮게 답한 문항이 없었어요."
             : la+"와 "+lb+"가 거의 같았어요. 두 영역 모두 강점으로 보셔도 됩니다.";
    notes.push({pos, step:o.step, msg});
  }
  noteFor(0); noteFor(1);
  return {ordered:arr, notes};
}
function isTied(a,b){ return Math.abs(a.score-b.score)<TIE_PT; }
function matchType(scores){
  const vals=scores.map(s=>s.score); const mn=Math.min.apply(null,vals), mx=Math.max.apply(null,vals);
  let type;
  if(mn>=85 && (mx-mn)<=15) type=TYPE_MASTER;
  else if(mn>=70 && (mx-mn)<=20) type=TYPE_BALANCED;
  const r=rankAxes(scores);
  if(!type){
    const key=r.ordered[0].code+"-"+r.ordered[1].code;
    type=TYPE_30[key]||{code:key,nickname:"특수 유형",oneLiner:"1:1 컨설팅으로 알아보세요.",strengths:[],weaknesses:[],axisNote:""};
  }
  return Object.assign({}, type, {_rank:r.ordered, _tieNotes:r.notes});
}
/* 가장 낮은 축: 점수 최저, 같으면 낮은 응답(≤3)이 많은 축 → 편차 큰 축 → 고정 순서 역순 */
function lowestAxis(scores){
  return scores.slice().sort((a,b)=>{
    if(a.score!==b.score) return a.score-b.score;
    const sa=a.stats||{}, sb=b.stats||{};
    if((sa.low||0)!==(sb.low||0)) return (sb.low||0)-(sa.low||0);
    if(Math.abs((sa.sd||0)-(sb.sd||0))>1e-9) return (sb.sd||0)-(sa.sd||0);
    return TIE_BREAK_PRIORITY[a.code]-TIE_BREAK_PRIORITY[b.code];
  })[0];
}
/* 결과 코드: 헷갈리는 글자(0 O 1 I) 없는 6자리 */
const CODE_ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(seed){
  let h=2166136261>>>0; const s=String(seed||"")+"|"+Date.now()+"|"+Math.random();
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  let out=""; for(let k=0;k<6;k++){ out+=CODE_ALPHABET[h%CODE_ALPHABET.length]; h=Math.imul(h^(h>>>13),1274126177)>>>0; }
  return out;
}

function labelOf(axisId){
  const m={self:"자기관리",production:"생산관리",goal:"목표관리",relation:"관계관리",marketing:"판매관리",finance:"재무관리"};
  return m[axisId];
}

/* ── UI 상태 (모듈 변수) ───────────────────────── */
let _answers = {};
let _pre = emptyPreSurvey();
let _preIdx = 0;
let _detail = null;

/* ── 진행 저장·이어하기 (localStorage) ───────────── */
const SAVE_KEY = "sba_hexd_save_v2";
function saveProgress(stage){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify({v:2,stage:stage,code:_rcode,pre:_pre,preIdx:_preIdx,answers:_answers,t:Date.now()})); }catch(e){} }
function loadProgress(){ try{ const r=localStorage.getItem(SAVE_KEY); if(!r) return null; const d=JSON.parse(r); if(!d||d.v!==2) return null; return d; }catch(e){ return null; } }
function clearProgress(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
function hasMeaningfulSave(d){ return !!(d && ((d.preIdx||0)>0 || Object.keys(d.answers||{}).length>0 || (d.pre&&d.pre.industry))); }
function resumeProgress(root){
  const d=loadProgress(); if(!d) return;
  _pre=normalizePre(Object.assign(emptyPreSurvey(), d.pre||{})); _preIdx=Math.min(d.preIdx||0, PRE_QUESTIONS.length-1); _answers=d.answers||{}; _rcode=d.code||null;
  if(d.stage==='pre'||!d.stage){ renderPre(root); return; }
  enterMain(root);
  /* 저장된 답을 버튼 상태로 복원 (클릭 이벤트 없이 → 효과음·중복 저장 없음) */
  Object.keys(_answers).forEach(function(qid){ const b=root.querySelector('.hexd-scale-btn[data-q="'+qid+'"][data-v="'+_answers[qid]+'"]'); if(b) b.classList.add('sel'); });
  const screens=root.querySelectorAll('.hexd-screen[id^="s-ax-"]');
  screens.forEach(function(div,i){ updateAxisProgress(div,i,buildAxisQuestions(AXES[i].id,_pre)); });
  if(d.stage==='result'){ showResult(root,{replay:true}); return; }
  for(let i=0;i<screens.length;i++){
    const qs=buildAxisQuestions(AXES[i].id,_pre);
    if(!qs.every(q=>_answers[q.id]!=null)){ show(root,'s-ax-'+i); return; }
  }
  if(d.stage==='concern'){ renderConcern(root); return; }
  renderConcern(root);
}

/* ── MOUNT ─────────────────────────────────────── */
function mount(){
  const root = document.querySelector('.hexd');
  if(!root) return;
  if(root.querySelector('#s-pre')) return; // 이미 초기화됨
  initBlock(root);
}

var _lastShowKey='s-intro';
function show(root, id){
  if(typeof hexdCancelAuto==='function') hexdCancelAuto();
  root.querySelectorAll('.hexd-screen').forEach(s=>s.classList.remove('active'));
  const el = root.querySelector('#'+id);
  if(el) el.classList.add('active');
  /* v4.3: 다른 화면(또는 다른 사전질문)으로 넘어가면 그 화면 맨 위로 올린다. 같은 화면 다시 그리기(선택 클릭)는 그대로 */
  const key = id+(id==='s-pre'?':'+_preIdx:'');
  const prev=_lastShowKey; _lastShowKey=key;
  if(el && prev!==key){ const ty=el.getBoundingClientRect().top + (window.pageYOffset||document.documentElement.scrollTop||0) - hexdHeaderH() - 8;
    if(/^s-(ax-|pre|concern|result)/.test(id) && /^s-(ax-|pre|concern)/.test(prev)) hexdJump(Math.max(0,Math.round(ty))); else hexdScrollTo(ty); }
  if(/^s-ax-/.test(id)) refreshAxisBars(root);
  hexdSyncTop();
}
/* 사이트 머리 메뉴가 위에 붙어 따라오면(휴대폰 63px) 그 높이만큼 진행률 띠를 내린다 */
function hexdHeaderH(){
  const h=document.querySelector('section.global-top'); if(!h) return 0;
  const cs=getComputedStyle(h); if(cs.position!=='sticky'&&cs.position!=='fixed') return 0;
  const r=h.getBoundingClientRect(); return r.bottom>0 ? Math.round(Math.min(r.bottom, r.height)) : 0;
}
var _hxTopRaf=0;
function hexdSyncTop(){ _hxTopRaf=0; const root=document.querySelector('.hexd'); if(!root) return; const hh=hexdHeaderH(); root.style.setProperty('--hx-top', hh+'px');
  const scr=root.querySelector('.hexd-screen.active'); if(!scr) return; const sr=scr.getBoundingClientRect();
  const pb=scr.querySelector('.hexd-sticky-prog'); if(pb){ const d=hh-sr.top; pb.classList.toggle('is-stuck', pb.classList.contains('is-stuck') ? d>2 : d>8); }
  const nv=scr.querySelector('.hexd-sticky-nav'); if(nv){ const d=sr.bottom-window.innerHeight; nv.classList.toggle('is-stuck', nv.classList.contains('is-stuck') ? d>2 : d>8); } }
function hexdQueueTop(){ if(!_hxTopRaf) _hxTopRaf=requestAnimationFrame(hexdSyncTop); }
window.addEventListener('scroll', hexdQueueTop, {passive:true});
window.addEventListener('resize', hexdQueueTop);
function hexdReduce(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function hexdScrollTo(y){
  y=Math.max(0,Math.round(y)); const cur=window.pageYOffset||document.documentElement.scrollTop||0;
  if(Math.abs(y-cur)<4) return;
  hexdAnimScroll(y, Math.min(520, 260+Math.abs(y-cur)*0.15));
}
function hexdCenter(el){ if(!el) return; try{ el.scrollIntoView({block:'center', behavior:hexdReduce()?'auto':'smooth'}); }catch(e){ el.scrollIntoView(); } }

/* ── 초기화: 사전질문 화면 삽입 + 인트로 버튼 바인딩 ── */
function initBlock(root){
  // 사전질문 화면 컨테이너만 미리 삽입 (내용은 renderPre에서)
  const wrap = root.querySelector('.hexd-wrap');
  const resultEl = root.querySelector('#s-result');
  const preDiv = document.createElement('div');
  preDiv.className='hexd-screen'; preDiv.id='s-pre';
  wrap.insertBefore(preDiv, resultEl);

  // 인트로 시작 버튼
  const startBtn = root.querySelector('#startBtn');
  if(startBtn) startBtn.addEventListener('click',()=>{
    clearProgress();
    const rb0=root.querySelector('#resumeBox'); if(rb0) rb0.remove();
    _answers={}; _pre=emptyPreSurvey(); _preIdx=0; _hxPreLast=-1;
    renderPre(root);
  });

  const lo=root.querySelector('#lastOpen');
  if(lo){ let lastCode=null; lo.addEventListener('click',()=>{ if(lastCode) openByCode(root, lastCode); });
    const arm=(p)=>{ if(p&&p.code){ lastCode=p.code; lo.hidden=false; } };
    arm(loadLastResult()); /* 이 기기 저장분 */
    fetchMyLastResult(function(p){ if(p) arm(loadLastResult()); }); /* 로그인 회원: 서버(본인 채널) 최근 결과를 이 기기 저장소에 합친 뒤 가장 최근 것으로 */
  }

  // 진행 중이던 테스트 → 이어하기 배너
  const sv=loadProgress();
  if(hasMeaningfulSave(sv) && startBtn && !root.querySelector('#resumeBox')){
    const rb=document.createElement('div');
    rb.className='hexd-resume'; rb.id='resumeBox';
    rb.innerHTML='<div class="hexd-resume-txt">진행 중인 테스트가 있어요. 이어서 할까요?</div>'
      +'<div class="hexd-resume-btns"><button class="hexd-resume-go" id="resumeBtn" type="button">이어서 하기</button>'
      +'<button class="hexd-resume-new" id="resumeNew" type="button">처음부터 다시</button></div>';
    startBtn.insertAdjacentElement('afterend', rb);
    rb.querySelector('#resumeBtn').addEventListener('click',()=>{ resumeProgress(root); });
    rb.querySelector('#resumeNew').addEventListener('click',()=>{ clearProgress(); rb.remove(); });
  }
}

/* ── 사전질문 렌더 v2 (단일·복수·보조 선택·하위 질문·건너뛰기) ─── */
function preVisible(q){ return !q.showIf || !!q.showIf(_pre); }
function preVisibleList(){ return PRE_QUESTIONS.filter(preVisible); }
function preStep(dir){ /* 현재 _preIdx 에서 보이는 다음/이전 질문 인덱스, 없으면 -1 */
  let i=_preIdx+dir;
  while(i>=0 && i<PRE_QUESTIONS.length){ if(preVisible(PRE_QUESTIONS[i])) return i; i+=dir; }
  return -1;
}
function optBtn(o, sel, attr){
  return '<button type="button" class="hexd-opt'+(sel?' sel':'')+'" '+attr+'>'
    +'<span class="ico">'+o.icon+'</span>'
    +'<span><div class="lbl">'+o.label+'</div>'+(o.hint?'<div class="hint">'+o.hint+'</div>':'')+'</span>'
    +'</button>';
}
function hexdKeepFocus(div){ const a=document.activeElement; if(!a||!div.contains(a)) return null; const k=['data-opt','data-extra','data-sub'].find(n=>a.hasAttribute&&a.hasAttribute(n)); return k?[k,a.getAttribute(k)]:(a.id?['id',a.id]:null); }
function hexdPopMark(div){ const p=window.__hxPop; window.__hxPop=null; if(!p) return; let el=null; try{ el=div.querySelector('['+p[0]+'="'+p[1]+'"]'); }catch(e){} if(el&&el.classList.contains('sel')) el.classList.add('hx-pop'); }
function hexdRestoreFocus(div, f){ if(!f) return; let el=null; try{ el=f[0]==='id'?div.querySelector('#'+f[1]):div.querySelector('['+f[0]+'="'+f[1]+'"]'); }catch(e){} if(el) try{ el.focus({preventScroll:true}); }catch(e){ el.focus(); } }
function renderPre(root){
  const div = root.querySelector('#s-pre');
  if(!div) return;
  if(!preVisible(PRE_QUESTIONS[_preIdx])){ const n=preStep(1); if(n>=0){ _preIdx=n; } }
  saveProgress('pre');
  const q = PRE_QUESTIONS[_preIdx];
  const vis = preVisibleList(); const pos = vis.indexOf(q)+1, total = vis.length;
  const isMulti = q.type==="multi";
  const selected = _pre[q.field];

  const optsClass = "hexd-opts"+(q.options.length>5?" cols":"");
  const optsHTML = q.options.map(o=>optBtn(o, isMulti?(selected||[]).includes(o.id):selected===o.id, 'data-opt="'+o.id+'"')).join('');

  let extraHTML='';
  if(q.extra && selected){
    const ex=q.extra; const cur=_pre[ex.field];
    extraHTML='<div class="hexd-primary-sub"><div class="sub-title">'+ex.title+'</div><div class="hexd-opts cols">'
      + optBtn({id:"__none",icon:"➖",label:"없음"}, !cur, 'data-extra="__none"')
      + ex.options.filter(o=>o.id!==selected).map(o=>optBtn(o, cur===o.id, 'data-extra="'+o.id+'"')).join('')
      +'</div></div>';
  }
  let subHTML='';
  const subOn = q.sub && selected===q.sub.when;
  if(subOn){
    const sb=q.sub; const cur=_pre[sb.field];
    subHTML='<div class="hexd-primary-sub"><div class="sub-title">'+sb.title+'</div><div class="hexd-opts cols">'
      + sb.options.map(o=>optBtn(o, cur===o.id, 'data-sub="'+o.id+'"')).join('')+'</div></div>';
  }
  const canNext = isMulti ? (selected||[]).length>0 : (!!selected && (!subOn || !!_pre[q.sub.field]));
  const selCount = isMulti&&q.maxSelect ? ' · '+(selected||[]).length+'/'+q.maxSelect : '';
  const isLast = preStep(1)<0;

  const _kf=hexdKeepFocus(div);
  div.innerHTML =
    '<div class="hexd-progress">'
    +'<div class="hexd-prog-label"><span>사전질문 '+pos+'/'+total+'</span><span></span></div>'
    +'<div class="hexd-prog-bar"><div class="hexd-prog-fill" style="width:'+Math.round(((pos-1)/total)*100)+'%"></div></div>'
    +'</div>'
    +'<div class="hexd-pre-card">'
    +'<div class="hexd-pre-q-num">Q'+pos+' / '+total+'</div>'
    +'<p class="hexd-pre-q-title">'+q.title+'</p>'
    +(q.subtitle?'<p class="hexd-pre-q-sub">'+q.subtitle+selCount+'</p>':'')
    +'<div class="'+optsClass+'">'+optsHTML+'</div>'
    +extraHTML+subHTML
    +'<div class="hexd-pre-nav">'
    +'<button type="button" class="hexd-pre-btn ghost" id="pre-prev">'+(preStep(-1)>=0?'← 이전':'← 인트로')+'</button>'
    +'<button type="button" class="hexd-pre-btn primary" id="pre-next"'+(canNext?'':' disabled')+'>'+(isLast?'본 진단 시작 →':'다음 →')+'</button>'
    +'</div></div>';

  if(_hxPreLast!==_preIdx){ const pc=div.querySelector('.hexd-pre-card'); if(pc&&_hxPreLast>=0) pc.classList.add('hx-qin'); _hxPreLast=_preIdx; window.__hxPop=null; } else { hexdRestoreFocus(div, _kf); hexdPopMark(div); }
  div.querySelectorAll('[data-opt]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const optId=btn.dataset.opt;
      if(isMulti){
        let arr=(_pre[q.field]||[]).slice();
        if(arr.includes(optId)){ arr=arr.filter(x=>x!==optId); }
        else { if(q.maxSelect&&arr.length>=q.maxSelect) arr.shift(); arr.push(optId); }
        _pre[q.field]=arr;
      } else {
        _pre[q.field]=optId;
        if(q.extra && _pre[q.extra.field]===optId) _pre[q.extra.field]=undefined;
        if(q.sub && optId!==q.sub.when) _pre[q.sub.field]=undefined;
      }
      normalizePre(_pre); renderPre(root);
    });
  });
  div.querySelectorAll('[data-extra]').forEach(btn=>{
    btn.addEventListener('click',()=>{ const v=btn.dataset.extra; _pre[q.extra.field]=(v==="__none")?undefined:v; normalizePre(_pre); renderPre(root); });
  });
  div.querySelectorAll('[data-sub]').forEach(btn=>{
    btn.addEventListener('click',()=>{ _pre[q.sub.field]=btn.dataset.sub; normalizePre(_pre); renderPre(root); });
  });
  div.querySelector('#pre-prev').addEventListener('click',()=>{
    const p=preStep(-1); if(p>=0){ _preIdx=p; renderPre(root); } else { show(root,'s-intro'); }
  });
  div.querySelector('#pre-next').addEventListener('click',()=>{
    if(!canNext) return;
    const n=preStep(1);
    if(n>=0){ _preIdx=n; renderPre(root); }
    else { normalizePre(_pre); enterMain(root); }
  });
  show(root,'s-pre');
}

/* ── 본 진단 뒤: 먼저 해결하고 싶은 영역 (점수·유형과 무관) ── */
function renderConcern(root){
  let div=root.querySelector('#s-concern');
  if(!div){ div=document.createElement('div'); div.className='hexd-screen'; div.id='s-concern'; root.querySelector('.hexd-wrap').insertBefore(div, root.querySelector('#s-result')); }
  const q=CONCERN_QUESTION; const sel=_pre.concerns||[];
  const _kf=hexdKeepFocus(div);
  div.innerHTML =
    '<div class="hexd-pre-card">'
    +'<div class="hexd-pre-q-num">거의 다 왔어요</div>'
    +'<p class="hexd-pre-q-title">'+q.title+'</p>'
    +'<p class="hexd-pre-q-sub">'+q.subtitle+' · '+sel.length+'/'+q.maxSelect+'</p>'
    +'<div class="hexd-opts cols">'+q.options.map(o=>optBtn(o, sel.includes(o.id), 'data-opt="'+o.id+'"')).join('')+'</div>'
    +'<div class="hexd-pre-nav">'
    +'<button type="button" class="hexd-pre-btn ghost" id="concern-skip">건너뛰기</button>'
    +'<button type="button" class="hexd-pre-btn primary" id="concern-next"'+(sel.length?'':' disabled')+'>결과 보기 →</button>'
    +'</div></div>';
  div.querySelectorAll('[data-opt]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      let arr=(_pre.concerns||[]).slice(); const id=btn.dataset.opt;
      if(arr.includes(id)) arr=arr.filter(x=>x!==id); else { if(arr.length>=q.maxSelect) arr.shift(); arr.push(id); }
      _pre.concerns=arr; saveProgress('main'); renderConcern(root);
    });
  });
  hexdRestoreFocus(div, _kf); hexdPopMark(div);
  div.querySelector('#concern-skip').addEventListener('click',()=>{ _pre.concerns=[]; showResult(root); });
  div.querySelector('#concern-next').addEventListener('click',()=>{ if((_pre.concerns||[]).length) showResult(root); });
  show(root,'s-concern');
}

/* ── enterMain: 변형 적용 후 axis 화면 동적 생성 ── */
function enterMain(root){
  // 기존 axis screens 제거 후 재생성 (재진단 대비)
  root.querySelectorAll('.hexd-screen[id^="s-ax-"]').forEach(el=>el.remove());

  const wrap = root.querySelector('.hexd-wrap');
  const resultEl = root.querySelector('#s-result');

  AXES.forEach((ax,i)=>{
    // ★ 사전답 확정 후 buildAxisQuestions 호출 → 변형 적용된 10개
    const qs = buildAxisQuestions(ax.id, _pre);

    const div = document.createElement('div');
    div.className='hexd-screen'; div.id='s-ax-'+i;

    div.innerHTML =
      '<div class="hexd-progress hexd-sticky-prog">'
      +'<div class="hexd-prog-label"><span class="hx-area">영역 '+(i+1)+'/6 &middot; <b>'+ax.label+'</b> <em id="prog-'+i+'">0/'+qs.length+'</em></span>'
      +'<span class="hx-total">전체 0/60 &middot; 0%</span></div>'
      +'<div class="hexd-segs">'+AXES.map(function(a,k){ return '<div class="hexd-seg'+(k===i?' cur':'')+'"><i><s style="width:0%"></s></i><span>'+String(a.label).replace('관리','')+'</span></div>'; }).join('')+'</div>'
      +'</div>'
      +'<div class="hexd-axis-title">'+ax.label+' 영역</div>'
      +'<div class="hexd-axis-desc">'+(AXIS_DESC[ax.id]||'')+'</div>'
      +'<div id="qs-'+i+'"></div>'
      +'<div class="hexd-nav hexd-sticky-nav">'
      +(i>0?'<button type="button" class="hexd-prev-btn" id="prev-'+i+'">&larr; 이전</button>':'<span class="hexd-prev-sp"></span>')
      +'<span class="hexd-left" id="left-'+i+'">'+qs.length+'문항 남았어요</span>'
      +'<button class="hexd-next-btn" id="next-'+i+'">'+(i<5?'다음 영역 &rarr;':'거의 다 왔어요 &rarr;')+'</button>'
      +'</div>';

    wrap.insertBefore(div, resultEl);
    const pv=div.querySelector('#prev-'+i); if(pv) pv.addEventListener('click',()=>show(root,'s-ax-'+(i-1)));

    // 문항 렌더
    const container = div.querySelector('#qs-'+i);
    qs.forEach((q,qi)=>{
      const block = document.createElement('div');
      block.className='hexd-q-block'+(qi===0?' current':'');
      block.setAttribute('data-qid', q.id);
      const isVariant = !!q._varKey;
      const scaleHTML = LIKERT_LABELS.map(L=>
        '<button class="hexd-scale-btn" data-q="'+q.id+'" data-v="'+L.value+'">'
        +'<span class="num">'+L.value+'</span>'
        +'<span class="txt">'+L.short+'</span>'
        +'</button>'
      ).join('');
      block.innerHTML =
        '<div class="hexd-q-top">'
        +'<span class="hexd-q-num">Q'+(qi+1)+'</span>'
        +(isVariant?'<span class="hexd-badge">맞춤 변형</span>':'')
        +'<span class="hexd-q-text">'+q.text+'</span>'
        +'</div>'
        +'<div class="hexd-scale">'+scaleHTML+'</div>'
        +'<div class="hexd-scale-labels"><span>← 전혀 아니다</span><span>매우 그렇다 →</span></div>';
      container.appendChild(block);
    });

    // 척도 버튼 클릭
    div.querySelectorAll('.hexd-scale-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const qid=btn.dataset.q; const v=+btn.dataset.v;
        const wasNew=_answers[qid]==null;
        _answers[qid]=v; div.__lastQ=qid;
        saveProgress('main');
        // 같은 문항의 다른 버튼 sel 해제
        div.querySelectorAll('.hexd-scale-btn[data-q="'+qid+'"]')
          .forEach(b=>b.classList.toggle('sel',+b.dataset.v===v));
        // ★ 진행 카운트: 이 axis screen에 렌더된 data-q 집합 기준
        updateAxisProgress(div, i, qs);
        /* v4.3: 처음 고른 답이면 다음 안 고른 문항으로 내려간다(고쳐 고를 때는 그대로) */
        if(wasNew) hexdQueueAuto(function(){ hexdFocusNext(div, i, qs, qid); }); else hexdCancelAuto();
      });
    });

    // 다음 버튼
    div.querySelector('#next-'+i).addEventListener('click',()=>{
      // ★ 완료 조건: 렌더된 qs의 모든 id가 _answers에 있어야 함
      const missing = qs.find(q=>_answers[q.id]==null);
      if(missing){ /* v4.3: 빠진 문항으로 데려가 테두리로 알린다 */
        const b=hexdBlock(div, missing.id);
        if(b){ b.classList.add('missing'); hexdEnsureVisible(b, true); }
        return;
      }
      if(i<5){ show(root,'s-ax-'+(i+1)); }
      else { saveProgress('concern'); renderConcern(root); }
    });
  });

  show(root,'s-ax-0');
}

/* ── 축 진행 카운트 (렌더된 qs 기준) ─────────────── */
function updateAxisProgress(div, i, qs){
  const done = qs.filter(q=>_answers[q.id]!=null).length;
  const total = qs.length;
  const label = div.querySelector('#prog-'+i);
  if(label) label.textContent=done+'/'+total;
  const left = div.querySelector('#left-'+i);
  if(left){ left.textContent = done===total ? '모두 답했어요' : (total-done)+'문항 남았어요'; left.classList.toggle('ok', done===total); }
  const nextBtn = div.querySelector('#next-'+i);
  if(nextBtn) nextBtn.classList.toggle('ready', done===total);
  /* 카드 상태: 답한 카드는 흐리게, 지금 답할 카드(첫 빈 문항)는 테두리 */
  const tgt=hexdNextTarget(qs, div.__lastQ);
  qs.forEach(function(q){ const b=hexdBlock(div,q.id); if(!b) return; const has=_answers[q.id]!=null;
    b.classList.toggle('done', has); b.classList.toggle('current', q===tgt); if(has) b.classList.remove('missing'); });
  const root=div.closest('.hexd'); if(root) refreshAxisBars(root);
}
function hexdBlock(div, qid){ let s=String(qid); try{ if(window.CSS&&CSS.escape) s=CSS.escape(s); }catch(e){} return div.querySelector('.hexd-q-block[data-qid="'+s+'"]'); }
/* 위 고정 진행률: 6영역 칸(영역별 채움) + 전체 n/60 */
function refreshAxisBars(root){
  const per=AXES.map(function(ax){ const qs=buildAxisQuestions(ax.id,_pre); return [qs.filter(q=>_answers[q.id]!=null).length, qs.length]; });
  let d=0,t=0; per.forEach(function(p){ d+=p[0]; t+=p[1]; });
  const pct=t?Math.round(d/t*100):0;
  root.querySelectorAll('.hexd-screen[id^="s-ax-"]').forEach(function(div){
    const tt=div.querySelector('.hx-total'); if(tt) tt.textContent='전체 '+d+'/'+t+' · '+pct+'%';
    div.querySelectorAll('.hexd-seg').forEach(function(seg,k){ const p=per[k]||[0,1]; const s=seg.querySelector('s'); if(s) s.style.width=Math.round(p[0]/p[1]*100)+'%'; seg.classList.toggle('done', p[0]===p[1]); });
  });
}
/* 답한 뒤 다음 빈 문항으로. 영역을 다 채우면 아래 버튼을 한 번 반짝 */
function hexdFocusNext(div, i, qs, qid){
  if(!div.classList.contains('active')) return;
  const nx=hexdNextTarget(qs, qid);
  if(nx){ const nb=hexdBlock(div,nx.id); hexdEnsureVisible(nb);
    if(_hxKbd && nb){ const t=nb.querySelector('.hexd-q-text'); if(t){ t.setAttribute('tabindex','-1'); _hxFocusT=setTimeout(function(){ _hxFocusT=0; try{ t.focus({preventScroll:true}); }catch(e){} }, hexdReduce()?0:300); } }
    return; }
  const nb=div.querySelector('#next-'+i); if(nb){ nb.classList.remove('pulse'); void nb.offsetWidth; nb.classList.add('pulse'); }
}

/* ── 결과 레이더 = 메인 히어로 「설계 도면」 엔진(2D 캔버스, 그림자·그라데이션 없음 → 웨일 안전)을 실제 점수로 그린다.
   컴퍼스 점선 원 → 육각 여섯 변(펜 끝 반짝임) → 꼭짓점 십자 + 축 이름 → 중심축·안쪽 점선 → 점수 다각형 → 채움 → 치수 눈금 → 숨쉬기.
   한 번만 그리고 완성 뒤에는 숨쉬기와 가장 낮은 축 꼭짓점 반짝임만 남는다. 동작 줄이기 설정이면 완성 상태만 표시. */
function makeBlueprint(scores, lowestIdx){
  var GOLD='224,162,63', GOLD2='242,201,121', MINT='127,224,190', PAPER='255,246,220', SPEED=1.3;
  var highestIdx=-1, _hs=-1; for(var hi=0;hi<scores.length;hi++){ if(scores[hi].score>_hs){ _hs=scores[hi].score; highestIdx=hi; } }
  var motes=[]; for(var i=0;i<30;i++) motes.push({x:Math.random(), y:Math.random(), r:.6+Math.random()*1.5, s:.012+Math.random()*.02, ph:Math.random()*6.28});
  function ease(x){ return x<=0?0:x>=1?1:x*x*(3-2*x); }
  function seg(t,a,b){ return ease((t-a)/(b-a)); }
  function hexPt(cx,cy,R,rot,i){ var a=rot+i*Math.PI/3; return [cx+Math.cos(a)*R, cy+Math.sin(a)*R]; }
  function glow(ctx,col,w,a){ if(a<=0.01) return; ctx.save(); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=w+14; ctx.strokeStyle='rgba('+col+','+(a*0.07).toFixed(3)+')'; ctx.stroke(); ctx.lineWidth=w+6; ctx.strokeStyle='rgba('+col+','+(a*0.18).toFixed(3)+')'; ctx.stroke(); ctx.restore(); }
  function flare(ctx,x,y,r,rot,al,sh){ if(al<=0.02) return; if(sh==null) sh=rot*2.0; ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.min(1,al*ctx.globalAlpha); ctx.lineCap='round';
    for(var k=0;k<6;k++){ var L=r*(0.5+0.5*Math.abs(Math.sin(k*2.1+sh+x*0.01))), w=(k%2?0.9:1.7), N=7;
      for(var q=0;q<N;q++){ var f0=q/N, f1=(q+1)/N, a=0.95*Math.pow(1-f0,1.5), c=(q<2)?'255,242,205':'242,201,121';
        ctx.strokeStyle='rgba('+c+','+a.toFixed(3)+')'; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(L*f0,0); ctx.lineTo(L*f1,0); ctx.stroke(); }
      ctx.rotate(Math.PI/3); }
    var cr=r*.34, ring=[[1,'242,201,121',.10],[.72,'242,201,121',.18],[.48,'242,201,121',.32],[.26,'255,250,236',.6],[.12,'255,250,236',1]];
    for(var m=0;m<ring.length;m++){ ctx.fillStyle='rgba('+ring[m][1]+','+ring[m][2]+')'; ctx.beginPath(); ctx.arc(0,0,cr*ring[m][0],0,6.2832); ctx.fill(); }
    ctx.restore(); }
  /* tt: 초. W,H: CSS 픽셀. dpr 변환은 호출측이 setTransform 으로 건다 */
  function draw(ctx,W,H,tt,stat){
    var t=Math.min(tt*SPEED, 40), ta=tt*SPEED, i, x, y;
    var pHa=seg(t,11.0,12.0); /* 완성도(0→1): 완성 뒤에만 숨쉬기·글씨 맥동 */
    var br=stat?0.5:0.5+0.5*Math.sin(ta*1.6); /* 숨쉬기 0~1 */
    ctx.clearRect(0,0,W,H);
    var mobile=W<520;
    var cx=W*0.5, cy=H*0.52;
    var R=Math.min(H*0.36, W*0.30);
    var rot=-Math.PI/2;
    var fs=Math.max(11, Math.round(R*0.085));
    /* 격자 */
    var g=Math.max(22, Math.round(Math.min(W,H)/14)); ctx.lineWidth=1;
    ctx.strokeStyle='rgba('+GOLD+',0.075)'; ctx.beginPath(); for(x=cx%g; x<W; x+=g){ ctx.moveTo(x,0); ctx.lineTo(x,H); } for(y=cy%g; y<H; y+=g){ ctx.moveTo(0,y); ctx.lineTo(W,y); } ctx.stroke();
    ctx.strokeStyle='rgba('+GOLD+',0.12)'; ctx.beginPath(); for(x=cx%(g*5); x<W; x+=g*5){ ctx.moveTo(x,0); ctx.lineTo(x,H); } for(y=cy%(g*5); y<H; y+=g*5){ ctx.moveTo(0,y); ctx.lineTo(W,y); } ctx.stroke();
    /* 컴퍼스 원 */
    var pC=seg(t,0.2,2.4);
    if(pC>0){ ctx.setLineDash([4,6]); ctx.strokeStyle='rgba('+GOLD2+',0.38)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,R,rot,rot+pC*Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
      if(pC<1){ var pa=rot+pC*Math.PI*2, ex0=cx+Math.cos(pa)*R, ey0=cy+Math.sin(pa)*R; ctx.strokeStyle='rgba('+GOLD2+',0.55)'; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex0,ey0); ctx.stroke(); flare(ctx,ex0,ey0,22,t*2,0.9); }
      ctx.fillStyle='rgba('+PAPER+',0.9)'; ctx.beginPath(); ctx.arc(cx,cy,2.2,0,6.283); ctx.fill(); }
    /* 육각형 여섯 변 */
    var pts=[]; for(i=0;i<6;i++) pts.push(hexPt(cx,cy,R,rot,i));
    ctx.lineJoin='round'; ctx.lineCap='round';
    for(i=0;i<6;i++){ var p=seg(t,2.4+i*0.6,3.0+i*0.6); if(p<=0) break; var A=pts[i], B=pts[(i+1)%6], ex=A[0]+(B[0]-A[0])*p, ey=A[1]+(B[1]-A[1])*p;
      ctx.strokeStyle='rgba('+GOLD2+',0.95)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(A[0],A[1]); ctx.lineTo(ex,ey); glow(ctx,GOLD2,2,0.8); ctx.stroke();
      if(p<1) flare(ctx,ex,ey,26,t*3,1); }
    /* 꼭짓점 십자 표시 + 축 이름·점수 */
    ctx.textAlign='center'; ctx.textBaseline='middle';
    for(i=0;i<6;i++){ var pv=seg(t,3.0+i*0.6,3.4+i*0.6); if(pv<=0) continue; var sc=1+0.6*(1-pv), vx=pts[i][0], vy=pts[i][1]; ctx.strokeStyle='rgba('+PAPER+',0.85)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(vx,vy,5*sc,0,6.283); ctx.stroke(); var c=9*sc;
      ctx.beginPath(); ctx.moveTo(vx-c,vy); ctx.lineTo(vx-c*0.45,vy); ctx.moveTo(vx+c*0.45,vy); ctx.lineTo(vx+c,vy); ctx.moveTo(vx,vy-c); ctx.lineTo(vx,vy-c*0.45); ctx.moveTo(vx,vy+c*0.45); ctx.lineTo(vx,vy+c); ctx.stroke();
      var a=rot+i*Math.PI/3, off=fs*2.1, lx=cx+Math.cos(a)*(R+off), ly=cy+Math.sin(a)*(R+off);
      ctx.globalAlpha=pv;
      ctx.font='700 '+fs+'px Pretendard,"Apple SD Gothic Neo",sans-serif'; ctx.fillStyle='rgba('+PAPER+',0.9)'; ctx.fillText(scores[i].label, lx, ly-fs*0.62);
      var pul=1, isLow=(i===lowestIdx), isHigh=(i===highestIdx&&i!==lowestIdx);
      if(!stat&&pHa>0&&(isLow||isHigh)){ pul=1+0.08*pHa*(0.5-0.5*Math.cos(ta*1.15+(isLow?0:2.4))); }
      ctx.font='800 '+Math.round(fs*1.15)+'px Pretendard,"Apple SD Gothic Neo",sans-serif'; ctx.fillStyle=isLow?'#F5B08C':'#F2C979';
      ctx.save(); ctx.translate(lx, ly+fs*0.66); ctx.scale(pul,pul);
      if(isHigh&&pHa>0){ var hb0=stat?0.5:0.5+0.5*Math.sin(ta*1.15+1.2); ctx.shadowColor='rgba(242,201,121,0.95)'; ctx.shadowBlur=(6+10*hb0)*pHa; }
      ctx.fillText(String(scores[i].score), 0, 0); ctx.restore();
      ctx.globalAlpha=1; }
    /* 중심축 여섯 + 안쪽 점선 육각형 */
    for(i=0;i<6;i++){ var px=seg(t,6.0+i*0.18,6.7+i*0.18); if(px<=0) break; ctx.strokeStyle='rgba('+MINT+',0.35)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+(pts[i][0]-cx)*px, cy+(pts[i][1]-cy)*px); ctx.stroke(); }
    var pIn=seg(t,6.6,7.6); if(pIn>0){ ctx.setLineDash([3,5]); ctx.strokeStyle='rgba('+GOLD+','+(0.3*pIn)+')'; ctx.lineWidth=1; var fr=[0.667,0.333]; for(var f=0;f<2;f++){ ctx.beginPath(); for(i=0;i<6;i++){ var q=hexPt(cx,cy,R*fr[f],rot,i); if(i) ctx.lineTo(q[0],q[1]); else ctx.moveTo(q[0],q[1]); } ctx.closePath(); ctx.stroke(); } ctx.setLineDash([]); }
    /* 점수 다각형 (실제 6축 점수) */
    var sh=scores.map(function(s){ return Math.max(0.04, s.score/100); }), pD=seg(t,7.6,10.2), spts=[];
    for(i=0;i<6;i++) spts.push(hexPt(cx,cy,R*sh[i],rot,i));
    if(pD>0){ var total=6*pD, last=spts[0]; ctx.strokeStyle='rgba('+GOLD2+',1)'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(spts[0][0],spts[0][1]);
      for(i=1;i<=6;i++){ var ff=Math.min(1,Math.max(0,total-(i-1))); if(ff<=0) break; var qa=spts[(i-1)%6], qb=spts[i%6]; last=[qa[0]+(qb[0]-qa[0])*ff, qa[1]+(qb[1]-qa[1])*ff]; ctx.lineTo(last[0],last[1]); }
      glow(ctx,GOLD2,2.4,0.9); ctx.stroke(); if(pD<1) flare(ctx,last[0],last[1],30,t*3,1);
      var pF=seg(t,10.0,11.0); if(pF>0){ ctx.fillStyle='rgba('+GOLD+','+(0.16*pF)+')'; ctx.beginPath(); for(i=0;i<6;i++){ if(i) ctx.lineTo(spts[i][0],spts[i][1]); else ctx.moveTo(spts[i][0],spts[i][1]); } ctx.closePath(); ctx.fill();
        for(i=0;i<6;i++){ ctx.fillStyle='rgba('+PAPER+','+(0.95*pF)+')'; ctx.beginPath(); ctx.arc(spts[i][0],spts[i][1],3.2,0,6.283); ctx.fill(); } } }
    /* 치수 눈금 (한 변 바깥) */
    var pM=seg(t,10.6,11.8);
    if(pM>0){ var A2=pts[1], B2=pts[2], nx=(A2[0]+B2[0])/2-cx, ny=(A2[1]+B2[1])/2-cy, nl=Math.hypot(nx,ny)||1; nx/=nl; ny/=nl; var off2=fs*0.9, ax=A2[0]+nx*off2, ay=A2[1]+ny*off2, bx=B2[0]+nx*off2, by=B2[1]+ny*off2;
      ctx.strokeStyle='rgba('+PAPER+',0.7)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax+(bx-ax)*pM, ay+(by-ay)*pM); ctx.stroke();
      var tx=-ny, ty=nx; for(var k=0;k<=6;k++){ var fk=k/6; if(fk>pM) break; var kx=ax+(bx-ax)*fk, ky=ay+(by-ay)*fk, L=(k%6===0)?7:4; ctx.beginPath(); ctx.moveTo(kx-tx*L,ky-ty*L); ctx.lineTo(kx+tx*L,ky+ty*L); ctx.stroke(); } }
    /* 완성 후 숨쉬기 + 가장 낮은 축 꼭짓점 반짝임 */
    var pH=pHa;
    if(pH>0){ ctx.strokeStyle='rgba('+GOLD2+','+(0.32*pH*(0.5+0.5*br))+')'; ctx.lineWidth=6; ctx.beginPath(); for(i=0;i<6;i++){ if(i) ctx.lineTo(pts[i][0],pts[i][1]); else ctx.moveTo(pts[i][0],pts[i][1]); } ctx.closePath(); glow(ctx,GOLD2,6,0.6*pH*(0.5+0.5*br)); ctx.stroke();
      if(lowestIdx>=0){ var lp=spts[lowestIdx]; flare(ctx,lp[0],lp[1],22+10*br,stat?0.6:ta*0.45,(0.75+0.25*br)*pH,stat?1.2:ta*1.9); }
      if(highestIdx>=0&&highestIdx!==lowestIdx){ var hp=spts[highestIdx], hb=stat?0.5:0.5+0.5*Math.sin(ta*1.15+1.2), hr=24+10*hb;
        var hg=ctx.createRadialGradient(hp[0],hp[1],0,hp[0],hp[1],hr); hg.addColorStop(0,'rgba(255,238,190,'+(0.5*pH*(0.6+0.4*hb)).toFixed(3)+')'); hg.addColorStop(0.45,'rgba(242,201,121,'+(0.2*pH).toFixed(3)+')'); hg.addColorStop(1,'rgba(242,201,121,0)');
        ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(hp[0],hp[1],hr,0,6.2832); ctx.fill(); ctx.restore();
        flare(ctx,hp[0],hp[1],15+6*hb,stat?-0.4:-ta*0.3,(0.5+0.3*hb)*pH,stat?0.8:ta*1.3); } }
    /* 금가루 */
    for(var m=0;m<motes.length;m++){ var o=motes[m], yy=((o.y-tt*o.s)%1+1)%1, xx=o.x*W+Math.sin(tt*0.5+o.ph)*10, al=0.14+0.24*(0.5+0.5*Math.sin(tt*1.3+o.ph)); ctx.fillStyle='rgba('+GOLD2+','+al.toFixed(3)+')'; ctx.beginPath(); ctx.arc(xx,yy*H,o.r,0,6.283); ctx.fill(); }
  }
  /* 정지 화면(공유 카드용): 캔버스 픽셀 크기를 직접 정해 완성 상태만 그린다 */
  /* 공유 카드용 캔버스는 무대(CSS 배경)가 없으므로 어두운 초록 바닥을 먼저 깐다 (그라데이션 대신 동심원 겹칠) */
  function drawStatic(cv,W,H){ cv.width=W; cv.height=H; var ctx=cv.getContext('2d'); if(!ctx) return false; ctx.setTransform(1,0,0,1,0,0);
    draw(ctx,W,H,20,true); /* draw() 가 clearRect 로 시작하므로 바닥은 그린 뒤에 아래쪽으로 깐다 */
    ctx.globalCompositeOperation='destination-over';
    var cx=W*0.5, cy=H*0.52, R0=Math.max(W,H)*0.75, steps=[[.25,'20,58,46',1],[.4,'18,51,41',1],[.6,'16,45,36',1],[.8,'13,37,28',1]];
    for(var i=0;i<steps.length;i++){ ctx.fillStyle='rgb('+steps[i][1]+')'; ctx.beginPath(); ctx.arc(cx,cy,R0*steps[i][0],0,6.2832); ctx.fill(); }
    ctx.fillStyle='#07140F'; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='source-over'; return true; }
  /* 화면용: host 크기에 맞춰 dpr 반영, 보일 때만 그린다 */
  function mount(host,cv){
    var ctx=cv.getContext('2d'); if(!ctx) return false;
    var W=0,H=0,dpr=1,raf=null,alive=false,t0=null,dead=false,io=null;
    if(typeof window.__sbaHexdBpKill==='function'){ try{ window.__sbaHexdBpKill(); }catch(e){} }
    var still=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    function size(){ dpr=Math.min(2,window.devicePixelRatio||1); W=host.clientWidth; H=host.clientHeight; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); cv.style.width=W+'px'; cv.style.height=H+'px'; }
    function paint(tt,st){ ctx.setTransform(dpr,0,0,dpr,0,0); draw(ctx,W,H,tt,st); }
    function frame(now){ raf=null; if(!alive||dead) return; if(W!==host.clientWidth||H!==host.clientHeight) size(); if(t0===null) t0=now; paint((now-t0)/1000); raf=requestAnimationFrame(frame); }
    size();
    if(still){
      /* 정지 모드: 크기가 잡힐 때까지 기다렸다가 완성 상태를 한 번 그린다 (숨겨진 화면에서 붙은 경우 대비) */
      var tries=0, wr=0; (function once(){ wr=0; if(dead) return; if(host.clientWidth>0&&host.clientHeight>0){ size(); paint(20,true); } else if(++tries<60){ wr=requestAnimationFrame(once); } })();
      var onR=function(){ if(!dead){ size(); paint(20,true); } }; addEventListener('resize', onR);
      var ro=null; if(window.ResizeObserver){ ro=new ResizeObserver(function(){ if(!dead&&(host.clientWidth!==W||host.clientHeight!==H)){ size(); paint(20,true); } }); ro.observe(host); }
      window.__sbaHexdBpKill=function(){ dead=true; if(wr) cancelAnimationFrame(wr); removeEventListener('resize', onR); if(ro) ro.disconnect(); };
      return true;
    }
    if(window.IntersectionObserver){ io=new IntersectionObserver(function(es){ alive=!!(es[0]&&es[0].isIntersecting); if(alive&&!raf&&!dead) raf=requestAnimationFrame(frame); },{threshold:0}); io.observe(host); }
    else { alive=true; raf=requestAnimationFrame(frame); }
    function vis(){ if(document.visibilityState==='visible'&&alive&&!raf&&!dead) raf=requestAnimationFrame(frame); }
    document.addEventListener('visibilitychange',vis);
    window.__sbaHexdBpKill=function(){ dead=true; if(raf) cancelAnimationFrame(raf); raf=null; if(io) io.disconnect(); document.removeEventListener('visibilitychange',vis); };
    return true;
  }
  return {draw:draw, drawStatic:drawStatic, mount:mount};
}
var _bp=null; /* 현재 결과의 도면 (공유 카드에서 재사용) */
function mountResultRadar(root, scores, lowestIdx){
  var host=root.querySelector('#radarStage'), cv=root.querySelector('#radarChart'); if(!host||!cv) return;
  var fresh=cv.cloneNode(false); cv.parentNode.replaceChild(fresh,cv); /* 이전 rAF 루프와 분리 */
  window.__hxBpArgs=[root, scores, lowestIdx];
  _bp=makeBlueprint(scores.map(function(s){ return {label:labelOf(s.axisId), score:s.score}; }), lowestIdx);
  _bp.mount(host,fresh);
  window.__sbaHexdBlueprint=_bp;
}

/* ── 성장 방향 v3.1: 조합 생성 (전문가 6인 검토 반영 2026-09-11) ─────────────────────
   재료 = 여섯 축 점수(모양) · 1위 축 · 가장 낮은 축 · 낮게 답한 문항의 주제 · 사전 맥락 · 결과 코드(문장 변주 고정).
   원칙 = 잰 것만 말한다 / 점수와 축 이름은 본인 것만 / 한 번에 한 가지 움직임 / 사장님께 말하는 문장 / 숙제 목록이 아니라 순서와 이유.
   검토 반영 = ① "방식을 옮긴다"·"숫자를 나란히" 같은 추상 표현 → 조합마다 손으로 하는 행동(act)과 적을 것(unit)을 명시
             ② 불안 자극·성품 단정·결함 묘사 문장 삭제(통제권을 주는 문장으로) ③ "따라온다"류 근거 없는 인과 삭제
             ④ 맥락 문장은 가장 낮은 축과 이어질 때만 ⑤ 닫는 문장 풀 확대(반복 인상 완화) ⑥ 성공/실패 틀 대신 "그걸로 충분합니다".
   표기 = 축 이름은 받침이 없어(…관리) 가/는/를/와, 점수는 "N점"으로 써서 점 뒤에 이/은/을/과 를 붙인다. */
function gPick(arr, seed){ if(!arr||!arr.length) return ''; return arr[Math.abs(seed)%arr.length]; }
function gSeed(code){ let h=7; String(code||'').split('').forEach((c,i)=>{ h=(h*31+c.charCodeAt(0)*(i+1))>>>0; }); return h; }
function gFill(t, v){ return t.replace(/\{(\w+)\}/g, (m,k)=>(v[k]!=null?v[k]:m)); }
/* 받침 유무로 조사 고르기: gJosa('숫자','이','가') → '가' */
function gJosa(w, a, b){ const s=String(w||'').replace(/[^가-힣]+$/,''); const c=s.charCodeAt(s.length-1); if(!(c>=0xAC00&&c<=0xD7A3)) return b; return ((c-0xAC00)%28)?a:b; }
/* ① 관찰: 점수 모양별 */
const G_SHAPE = {
  master:["여섯 축이 모두 {lowS}점 이상입니다. 【이 진단에서 가장 드문 결과】입니다. 가장 높은 {top} {topS}점과 가장 낮은 {low} {lowS}점의 차이가 {gap}점뿐이라, 【어느 한 곳에 기대지 않고 굴러가는 사업】입니다.",
          "가장 낮은 축인 {low}조차 {lowS}점입니다. 대부분의 사장님은 가장 높은 축이 이 점수에 닿기 어렵습니다. 빈 곳을 찾는 결과가 아니라, 이 수준을 어떻게 지키고 어디로 넓힐지를 보는 결과입니다."],
  balanced:["여섯 축이 {lowS}점에서 {topS}점 사이에 고르게 있습니다. 어느 한 곳이 무너지지 않는 대신, 어디를 밀어야 성장이 보이는지가 덜 선명한 모양입니다.",
            "가장 높은 {top} {topS}점과 가장 낮은 {low} {lowS}점의 차이가 {gap}점입니다. 고른 실천이 이 결과의 특징이고, 다음 질문은 \"어디에 힘을 모을까\"입니다."],
  spike:["{top}가 {topS}점으로 다른 다섯 축보다 뚜렷하게 앞서 있습니다. 사업이 【이 한 축의 힘】으로 굴러가고 있고, 가장 낮은 {low} {lowS}점과의 간격 {gap}점이 그만큼 눈에 띕니다.",
         "여섯 축 중 {top}가 {topS}점으로 혼자 앞서 있습니다. 강한 축 하나가 있다는 건 좋은 소식이고, 【그 힘을 어디에 빌려줄지】가 이번 결과의 핵심입니다."],
  twin:["{top} {topS}점과 {top2} {top2S}점이 나란히 높고, 그 뒤로 간격이 벌어집니다. 【두 축이 사업을 끌고 가는 모양】이며, 가장 뒤처진 {low} {lowS}점이 그 속도를 따라오지 못하고 있습니다.",
        "앞서는 두 축 {top}·{top2}와 가장 낮은 {low} {lowS}점 사이가 {gap}점입니다. 끌고 가는 힘은 충분하니, 끌려오지 못하는 한 곳을 먼저 봅니다."],
  sink:["다른 다섯 축은 제 몫을 하고 있는데 {low} 하나가 {lowS}점으로 내려앉아 있습니다. 두 번째로 낮은 {low2}보다도 {sinkGap}점 아래라, 【이 한 축이 전체 모양을 정합니다.】",
        "{low}가 {lowS}점으로 혼자 낮습니다. 나머지 다섯 축이 받쳐 주고 있어서 지금은 티가 덜 나지만, 사업이 커질수록 【이 축이 먼저 신호를 보냅니다.】"],
  low:["여섯 축이 모두 {topS}점 아래에 있습니다. 어느 한 곳이 문제라기보다, 아직 습관이 자리 잡는 중이라고 읽는 편이 맞습니다. 그래서 【순서】가 중요합니다.",
       "가장 높은 {top}도 {topS}점으로 아직 여유가 있고, {low}는 {lowS}점으로 더 그렇습니다. 모든 걸 한꺼번에 올리려 하면 아무것도 안 올라갑니다. 【한 축부터】 갑니다."],
  mixed:["{top}가 {topS}점으로 앞서고 {low}가 {lowS}점으로 가장 뒤에 있습니다. 두 축의 차이 {gap}점이 지금 사업의 모양이고, 성장 방향은 【이 간격을 어떻게 쓰느냐】에 달려 있습니다.",
         "높은 축과 낮은 축이 분명하게 갈립니다. {top} {topS}점은 이미 습관이 되어 있고, {low} {lowS}점은 아직 손이 덜 간 상태입니다."],
};
/* 1위 축이 이미 적고 있는 것 (지렛대의 '옆자리') */
const G_TOPREC = {self:"쉬는 시간을 적어 둔 달력",production:"작업 순서표",goal:"이번 달 목표 칸",relation:"함께 일하는 사람과 확인하기로 한 날짜 메모",marketing:"고객이 들어온 수를 적는 칸",finance:"월말 정산표"};
/* ② 지렛대: 1위 축의 습관 → 가장 낮은 축 (30조합). t=문장, act=손으로 하는 한 가지, unit=2주 뒤 적혀 있어야 할 것 */
const G_PAIR = {
  "self>production":{t:"자기 리듬을 지키는 힘을 만드는 일에도 쓰세요. 잠자는 시간을 정해 두듯, 주력 상품이 지켜야 할 기준 세 줄을 종이에 적어 두면 품질도 리듬이 됩니다.",act:"주력 상품의 기준 세 줄을 적어 두는 것",unit:"기준 세 줄과 그 기준으로 점검한 횟수"},
  "self>goal":{t:"컨디션을 관리하듯 목표도 관리할 수 있습니다. 에너지가 높은 시간대에 '이번 달 가장 중요한 변화 한 가지'를 적는 것부터 시작하면 됩니다.",act:"이번 달 가장 중요한 변화 한 가지를 적어 두는 것",unit:"그 한 줄과 이번 주 할 일 세 개"},
  "self>relation":{t:"과부하가 오면 줄이고 도움을 요청하는 힘이 이미 있습니다. 그 요청을 조금 더 일찍, 상대가 맡을 범위를 한 줄로 적어서 하면 그것이 곧 협업의 시작입니다.",act:"함께 일하는 사람에게 맡길 범위를 한 줄로 적어 보내는 것",unit:"보낸 한 줄과 확인하기로 한 날짜"},
  "self>marketing":{t:"꾸준함이 몸에 붙은 사장님입니다. 고객 앞에 서는 일도 같은 방식으로 됩니다. 매주 같은 요일에 고객이 들어오는 경로 하나의 숫자를 적는 것부터입니다.",act:"매주 같은 요일에 고객이 들어온 수를 적는 것",unit:"경로 하나의 주간 숫자"},
  "self>finance":{t:"몸의 신호를 미루지 않는 힘을 돈에도 쓰면 됩니다. 잠을 지키듯 월말 30분을 지켜 지난달 이익 숫자를 확인하는 것, 그 한 번이 재무관리의 시작입니다.",act:"월말 30분에 지난달 이익 숫자를 확인하는 것",unit:"지난달 이익 숫자 하나"},
  "production>self":{t:"결과물을 지키는 기준이 있는 분입니다. 그 기준을 사장님 자신에게도 하나 두면 됩니다. 품질을 점검하듯 한 주에 '반드시 쉬는 시간' 하나를 정해 두는 것이 이 축을 올리는 가장 빠른 길입니다.",act:"한 주에 반드시 쉬는 시간 하나를 정해 두는 것",unit:"쉬기로 한 시간과 지킨 횟수"},
  "production>goal":{t:"만드는 순서는 정리돼 있으니, 그 앞에 '무엇을 위해 만드는지'를 한 줄 붙이면 됩니다. 이번 달 결과물 하나를 고르고, 그것이 어떤 변화로 이어질지 적어 보세요.",act:"이번 달 결과물 하나가 이어질 변화를 한 줄로 적는 것",unit:"그 한 줄과 마감일"},
  "production>relation":{t:"작업 순서를 문서로 남기는 손이 있습니다. 같은 손으로 함께 일하는 상대와 '언제 진행을 확인할지' 한 줄을 적어 두면 관계가 작업처럼 굴러갑니다.",act:"함께 일하는 사람과 확인할 날짜를 한 줄로 정해 두는 것",unit:"확인하기로 한 날짜"},
  "production>marketing":{t:"좋은 것을 만드는 손이 이미 있습니다. 고객이 결정할 때 보여 줄 자료 한 장을 만드는 일도 '제작'이라고 생각하고, 만들 때 쓰는 기준 그대로 만들어 보세요.",act:"고객이 결정할 때 보여 줄 자료 한 장을 만드는 것",unit:"자료 한 장과 그것을 보여 준 횟수"},
  "production>finance":{t:"원가와 과정을 다듬는 눈으로 통장을 보면 됩니다. 이번 달 주력 상품 하나의 원가와 판매가를 나란히 적는 것이 재무관리의 첫 장입니다.",act:"주력 상품 하나의 원가와 판매가를 나란히 적는 것",unit:"원가·판매가 두 숫자"},
  "goal>self":{t:"목표에 마감을 붙이는 사장님입니다. 이번 달 목표 옆에 '내가 쉬는 날'을 같은 무게로 적어 두세요. 목표를 지키는 힘이 몸도 지킵니다.",act:"이번 달 목표 옆에 쉬는 날을 적어 두는 것",unit:"쉬기로 한 날짜와 지킨 횟수"},
  "goal>production":{t:"목표를 작업으로 쪼개는 힘이 있으니, 그 작업 하나하나에 '어느 수준이면 끝'이라는 기준을 붙이면 됩니다. 기준이 붙는 순간 생산이 목표를 따라옵니다.",act:"이번 주 작업 세 개에 '어느 수준이면 끝'을 한 줄씩 붙이는 것",unit:"기준이 붙은 작업 세 개"},
  "goal>relation":{t:"방향은 분명한데 함께 가는 사람이 그 방향을 아직 못 들었을 수 있습니다. 이번 주 할 일을 정할 때 상대가 맡을 범위를 한 줄로 함께 적어 보내 보세요.",act:"이번 주 할 일과 함께 상대가 맡을 범위를 한 줄로 보내는 것",unit:"보낸 한 줄과 확인하기로 한 날짜"},
  "goal>marketing":{t:"목표를 숫자로 추적하는 습관을 고객 쪽으로 돌리면 됩니다. 이번 달 목표 하나를 '고객이 들어온 수'로 잡고 매주 그 숫자만 적어 보세요.",act:"이번 달 목표 하나를 고객이 들어온 수로 잡고 매주 적는 것",unit:"주간 고객 유입 수"},
  "goal>finance":{t:"목표는 숫자로 관리하고 계십니다. 같은 방식으로 돈도 보면 됩니다. 이번 달 목표 옆에 '들어올 돈·나갈 돈' 두 칸만 더 그리면 재무가 목표 안으로 들어옵니다.",act:"이번 달 목표 옆에 '들어올 돈·나갈 돈' 두 칸을 그리는 것",unit:"두 칸의 숫자"},
  "relation>self":{t:"함께 일하는 사람의 상태를 잘 읽으시는 분입니다. 그 눈을 사장님 자신에게도 한 번 돌려 보세요. 상대와 확인 시점을 정하듯, 내 컨디션을 확인하는 요일 하나를 정해 두면 됩니다.",act:"내 컨디션을 확인하는 요일 하나를 정해 두는 것",unit:"그 요일에 적은 컨디션 한 줄"},
  "relation>production":{t:"손발을 맞추는 힘이 있으니, 반복 작업의 순서를 함께 일하는 사람과 같이 적어 보세요. 혼자 만들면 미루게 되는 순서표가 둘이면 한 시간에 나옵니다.",act:"반복 작업 하나의 순서를 함께 일하는 사람과 열 줄로 적는 것",unit:"열 줄짜리 순서표"},
  "relation>goal":{t:"사람을 챙기는 데 쓰는 정성의 일부를 '어디로 가는지'에 쓰면 됩니다. 함께 일하는 사람에게 다음 달 가장 중요한 한 가지를 말로 정해 주는 것이 시작입니다.",act:"다음 달 가장 중요한 한 가지를 함께 일하는 사람에게 말로 정해 주는 것",unit:"그 한 가지와 마감일"},
  "relation>marketing":{t:"관계에서 나오는 신뢰가 이미 있습니다. 거래를 마친 고객 한 명에게 후기나 소개를 부탁하는 것, 그것이 사장님께 가장 자연스러운 판매입니다.",act:"거래를 마친 고객 한 명에게 후기나 소개를 부탁하는 것",unit:"부탁한 횟수와 받은 후기 수"},
  "relation>finance":{t:"사람을 믿고 맡기는 힘은 장점입니다. 다만 돈의 흐름만큼은 사장님 눈으로 직접 보셔야 합니다. 세무사가 있더라도 '통장 잔고와 나갈 돈' 한 장은 매달 직접 확인하고, 모르는 것이 나오면 그때 물어볼 상대를 정해 두면 됩니다.",act:"'통장 잔고와 나갈 돈' 한 장을 직접 적어 보는 것",unit:"잔고와 나갈 돈 두 숫자"},
  "marketing>self":{t:"고객의 반응을 매주 확인하는 눈이 있습니다. 그 눈을 한 줄만 사장님께 쓰세요. 고객 숫자를 적는 날에 내 에너지 상태도 한 줄 같이 적어 두면 됩니다.",act:"고객 숫자를 적는 날에 내 에너지 상태를 한 줄 적는 것",unit:"에너지 상태 한 줄"},
  "marketing>production":{t:"팔리는 것을 아는 눈이 있습니다. 그 눈으로 '고객이 실망하는 지점' 하나를 골라 품질 기준으로 바꾸면, 판매의 힘이 생산을 끌어올립니다.",act:"고객이 실망하는 지점 하나를 품질 기준 한 줄로 바꾸는 것",unit:"새 기준 한 줄과 그 기준으로 점검한 횟수"},
  "marketing>goal":{t:"고객을 읽는 눈이 있으니 방향을 정하는 일도 어렵지 않습니다. 가장 많이 들어오는 경로 하나를 정해 '이번 달 이 숫자를 얼마로'라고 적으면 그것이 목표입니다.",act:"가장 많이 들어오는 경로 하나에 이번 달 숫자 목표를 적는 것",unit:"그 목표 숫자와 매주 실제 숫자"},
  "marketing>relation":{t:"고객에게는 다음 단계를 잘 안내하시는 분입니다. 같은 안내를 함께 일하는 사람에게도 하면 됩니다. '다음에 언제 확인할지'를 먼저 말해 주는 것부터입니다.",act:"함께 일하는 사람에게 다음 확인 날짜를 먼저 말해 주는 것",unit:"확인하기로 한 날짜"},
  "marketing>finance":{t:"고객 한 명을 모시는 비용을 아시니, 그 옆에 '한 명이 남기는 이익'을 적으면 됩니다. 두 숫자가 나란히 놓이는 순간 재무가 보이기 시작합니다.",act:"고객 한 명당 비용 옆에 한 명이 남기는 이익을 적는 것",unit:"비용·이익 두 숫자"},
  "finance>self":{t:"들어오고 나가는 돈을 미리 보는 습관이 있습니다. 같은 습관을 몸에도 쓰면 됩니다. 월말 정산하듯 주말에 한 주의 피로를 한 줄로 정산해 보세요.",act:"주말에 한 주의 피로를 한 줄로 적는 것",unit:"주간 피로 한 줄"},
  "finance>production":{t:"원가를 아는 눈으로 작업을 보면 됩니다. 시간이 가장 많이 새는 작업 하나를 골라 순서를 열 줄로 적으면, 그것이 순서표이자 원가 절감입니다.",act:"시간이 가장 많이 새는 작업의 순서를 열 줄로 적는 것",unit:"열 줄짜리 순서표"},
  "finance>goal":{t:"숫자를 미리 보는 습관이 있으니, 그 숫자 중 하나를 '목표'라고 부르기만 하면 됩니다. 앞으로 세 달의 예상 매출 중 한 달을 골라 이유를 적어 보세요.",act:"세 달 예상 매출 중 한 달을 골라 목표로 적는 것",unit:"목표 숫자와 그 이유 한 줄"},
  "finance>relation":{t:"지급 일정을 적어 두는 꼼꼼함이 있습니다. 같은 방식으로 사람과의 약속도 적어 두면 됩니다. 함께 일하는 사람과 확인할 날짜를 정산표 옆에 적어 두면 관계도 관리가 됩니다.",act:"함께 일하는 사람과 확인할 날짜를 정산표 옆에 적어 두는 것",unit:"확인하기로 한 날짜"},
  "finance>marketing":{t:"이익은 정확히 보고 계십니다. 그 장부에 '이 고객이 어떤 경로로 왔는지' 한 칸만 더하면 판매관리가 재무 안에서 시작됩니다.",act:"장부에 고객이 들어온 경로 칸 하나를 더하는 것",unit:"경로별 고객 수"},
};
/* ② 낮은 문항 주제: 왜 중요한지. 위협·결함 묘사 대신 "지금 상태 + 무엇이 생기는지"로 말한다 */
const G_LOW = {
  self:[{ids:[5,7,8],why:"낮게 답하신 문항이 '일의 경계'와 '쉬는 시간'에 몰려 있습니다. 체력의 문제가 아니라 일정에 자리가 없었던 것뿐이라, 자리 하나를 만들면 바로 달라지는 축입니다."},
        {ids:[1,2,3,4],why:"잠·운동·스트레스처럼 몸의 기본을 묻는 문항에 낮게 답하셨어요. 이 축은 의지가 아니라 회복의 문제라서, 지키는 시간 하나를 정하는 것으로 시작합니다."},
        {ids:[6,9,10],why:"지치는 신호를 알아채고 대응하는 문항이 낮았습니다. 신호를 적어 두기 시작하면 무너지기 전에 줄일 수 있는 힘이 생깁니다."}],
  production:[{ids:[6,7,8],why:"작업이 머릿속에 있고 문서로는 아직 남아 있지 않다고 답하셨어요. 순서 하나를 적어 두는 순간, 사장님이 자리를 비워도 이어지는 부분이 생깁니다."},
        {ids:[1,2,3,4,5,9],why:"품질 기준을 정하고 그 기준으로 점검하는 문항이 낮았습니다. 기준 세 줄이 생기면 좋은 날의 품질을 매일의 품질로 만들 수 있습니다."},
        {ids:[10],why:"약속한 완료 시점과 실제 시점의 차이를 아직 적어 보지 않으셨어요. 그 차이를 적기 시작하면 고객이 가장 먼저 느끼는 부분이 사장님 손에 들어옵니다."}],
  goal:[{ids:[1,2,5,6,10],why:"어디로 가는지를 적어 두고 숫자로 보는 문항이 낮았습니다. 바쁘게 일하는데 나아가는 느낌이 없었다면, 방향을 한 줄 적는 것만으로 그 느낌이 달라집니다."},
        {ids:[3,7,8,9],why:"목표를 이번 주 할 일로 바꾸는 문항이 낮았습니다. 방향은 있으니, 책상 위로 내려오게 하는 작업 세 개만 있으면 됩니다."},
        {ids:[4],why:"월말에 돌아보는 시간이 아직 없다고 답하셨어요. 10분의 회고가 생기면 같은 실수가 반복되는 고리를 끊을 수 있습니다."}],
  relation:[{ids:[1,2,9,10],why:"함께 일하는 사람과 언제 확인하고 어떻게 고마움을 전하는지 묻는 문항이 낮았습니다. 관계가 없는 게 아니라 리듬이 아직 없는 것이라, 날짜 하나를 정하면 생깁니다."},
        {ids:[3,4,5],why:"맡을 범위를 합의하고 필요한 정보를 주는 문항이 낮았습니다. 시작 전에 한 줄만 적어 두면 갈등이 생기는 자리가 대부분 사라집니다."},
        {ids:[6,7,8],why:"급할 때 손 내밀 곳과 의논할 상대를 묻는 문항이 낮았습니다. 상대 한 명을 미리 정해 두면 혼자 판단하는 시간이 짧아지고 결정이 빨라집니다."}],
  marketing:[{ids:[3,4,5,6,8],why:"고객이 어디서 오고 다시 오는지를 숫자로 보는 문항이 낮았습니다. 이미 팔리고 있으니, 어디서 팔리는지 한 칸만 적으면 다음 수가 보입니다."},
        {ids:[1,2,7,9],why:"무엇을 누구에게 왜 파는지 설명하는 문항이 낮았습니다. 좋은 상품은 이미 있으니, 설명 한 장이 붙는 순간 고객이 결정하기 쉬워집니다."},
        {ids:[10],why:"관심을 보인 고객에게 다음 단계를 안내하는 절차가 아직 없다고 답하셨어요. 안내 문장 하나가 생기면 들어온 고객을 사장님이 붙잡을 수 있습니다."}],
  finance:[{ids:[4,5,8],why:"앞으로 들어오고 나갈 돈을 미리 보는 문항이 낮았습니다. 세 달치를 한 장에 적어 두면 돈에 대한 막연함이 통제할 수 있는 날짜로 바뀝니다."},
        {ids:[1,2,3,9,10],why:"지난달 이익과 가격의 근거를 확인하는 문항이 낮았습니다. 이익 숫자 하나를 찾아보는 순간, 열심히 판 것이 얼마나 남았는지가 사장님 손에 들어옵니다."},
        {ids:[6,7],why:"증빙과 수금처럼 돈이 지나가는 자리를 확인하는 문항이 낮았습니다. 받을 돈의 예정일 하나만 적어도 새는 자리가 보이기 시작합니다."}],
};
/* ③ 맥락 한 줄 — 가장 낮은 축과 이어질 때만 붙인다 (axes 비어 있으면 어느 축이든) */
const G_CTX = [
  {when:a=>a.yearsInBiz==='pre-launch',text:"아직 첫 판매 전이라 이 점수는 '해 본 것'보다 '준비해 둔 것'을 잰 값입니다. 첫 고객이 생기면 다시 한 번 재 보세요. 그때의 차이가 진짜 결과입니다."},
  {when:a=>a.debt==='yes',axes:['finance'],text:"대출이 있는 사업이라 '나갈 돈의 날짜'가 먼저 보여야 마음이 흔들리지 않습니다. 이번 달 상환일을 그 한 장의 첫 줄에 적어 두세요."},
  {when:a=>a.hirePlan==='hiring-soon'||a.hirePlan==='hiring-active',axes:['relation','production'],text:"채용을 앞두고 계시니 지금이 정리할 때입니다. 새 사람이 오기 전에 사장님 머릿속에 있는 순서를 문서로 꺼내 두면 채용의 절반은 끝납니다."},
  {when:a=>a.hirePlan==='downsize',axes:['relation','finance','goal'],text:"인원을 줄일 계획이라면 감정보다 숫자가 먼저 정리돼야 합니다. 어떤 일이 남고 어떤 일이 없어지는지 한 장에 적어 두세요."},
  {when:a=>a.yearsInBiz==='year-0-1',text:"첫 판매 후 1년이 안 된 시기라 모든 축이 함께 흔들리는 게 자연스럽습니다. 지금은 한 축만 고르는 것이 여섯 축을 다 챙기는 것보다 빠릅니다."},
  {when:a=>a.headcount==='solo'&&a.hasOutsourcing!=='yes',text:"혼자 하는 사업이라 사장님의 시간이 곧 사업의 전부입니다. 위의 한 가지도 '30분 안에 끝나는 크기'로 줄여서 시작하세요."},
  {when:a=>a.headcount==='solo'&&a.hasOutsourcing==='yes',axes:['relation','production','marketing'],text:"외주·협력자와 함께 일하고 계시니, 위의 한 가지를 혼자 하지 말고 그분과 나눠 보세요. 범위를 한 줄로 적어 주는 것부터입니다."},
  {when:a=>a.headcount==='medium'||a.headcount==='large',text:"함께 일하는 사람이 여럿이라 사장님이 바뀌는 것만으로는 부족합니다. 위의 한 가지를 팀의 규칙 한 줄로 바꿔 적어 두세요."},
  {when:a=>a.primaryCustomer==='b2b',axes:['marketing'],text:"기업 고객을 상대하시니 판매는 '경로'보다 '제안 뒤 후속'에서 갈립니다. 제안 후 연락하는 날짜를 정해 두는 것이 이 축의 절반입니다."},
  {when:a=>a.primaryCustomer==='b2g',axes:['marketing','goal'],text:"공공기관이 주 고객이라 공고와 제안서의 리듬이 곧 판매의 리듬입니다. 공고 확인 요일을 하나 정해 두세요."},
  {when:a=>a.revenueModel==='subscription',axes:['marketing','finance'],text:"정기 결제 모델이라 새 고객보다 '떠난 고객 수'가 먼저 보여야 합니다. 이번 달 이탈 수 하나만 적어도 방향이 잡힙니다."},
  {when:a=>a.revenueModel==='project',axes:['marketing','finance'],text:"프로젝트 단위로 돈이 들어오는 사업이라 다음 일이 언제 들어올지가 재무의 전부입니다. 끝난 고객에게 다음 일을 제안하는 절차가 곧 매출 관리입니다."},
  {when:a=>a.revenueModel==='licensing',axes:['finance'],text:"라이선스·로열티 매출은 정산이 예정대로 오는지가 핵심입니다. 정산 예정일과 실제 입금일을 한 장에 적어 두세요."},
  {when:a=>a.yearsInBiz==='year-8-plus',text:"8년 넘게 이어 온 사업이라 습관은 이미 굳어 있습니다. 새 습관을 더하기보다 오래된 습관 하나를 바꾸는 쪽이 효과가 큽니다."},
  {when:a=>anyOf(a.channels,'offline-store'),axes:['marketing'],text:"매장이 있는 사업이라 '다시 오는 손님'이 숫자로 보여야 합니다. 이번 주 재방문 고객 수를 세어 보는 것부터입니다."},
];
/* ③ 다음 한 달의 순서 — 조합별 행동(act)·적을 것(unit)·1위 축의 옆자리(topRec)를 넣어 손에 잡히게 */
const G_ORDER = [
  "순서는 이렇습니다. 첫 두 주는 {act}, 【이것 하나만】 합니다. {top}는 이미 몸에 익어 있으니 당분간 지금 수준만 유지합니다. 셋째 주부터 {unit}{u_eul} {topRec} 옆에 같이 적어 보세요. 그때부터 두 축이 한 장에서 관리됩니다.",
  "한 달만 이렇게 해 보세요. 【새로운 일을 더하지 않습니다.】 {act}, 이것뿐입니다. 2주 뒤에 {unit}{u_ig} 하나라도 적혀 있으면 【그걸로 충분합니다.】 눈금이 움직인 겁니다.",
  "우선순위는 분명합니다. {low2}({low2S}점)도 낮지만 지금은 건드리지 않습니다. 【한 번에 한 축】입니다. {unit}{u_ig} 적히기 시작하면 그때 {low2}를 봅니다. 한 달 뒤에 다시 재 보세요.",
];
const G_ORDER_HIGH = [
  "이제 과제는 올리는 것이 아니라 【굳히는 것】입니다. 여섯 축 중 사장님이 자리를 비워도 이어지는 축이 몇 개인지 세어 보세요. 사장님이 빠지면 멈추는 축이 다음 달의 목표입니다.",
  "이번 한 달은 이렇게 써 보세요. {low}에서 사장님이 직접 하는 일 하나를 골라 다른 사람 손에 넘겨 봅니다. 그대로 굴러가면 사장님의 방식이 이미 글로 남았다는 뜻이고, 삐걱이면 거기가 다음 과제입니다.",
];
/* 마스터 전용 2문단: 칭찬을 먼저, 꼭 알아야 할 약점 하나를 분명히 */
const G_MASTER_P2 = [
  "가장 낮은 {low}도 {lowS}점이라 여기서 더 올릴 것은 많지 않습니다. 대신 꼭 알아 두실 것이 하나 있습니다. 여섯 축을 다 잘하는 사장님의 사업은 【사장님이 곧 시스템】이 됩니다. 사장님이 자리를 비우는 순간 어느 축이 먼저 멈추는지, 그것이 이 결과의 진짜 빈 곳입니다.",
  "{low} {lowS}점은 다른 사장님이라면 강점이라고 부를 점수입니다. 그래서 【마스터의 약점은 점수표에 없습니다.】 모든 걸 직접 잘하는 사람은 맡기는 시점을 놓치기 쉽고, 그 사이 사업은 사장님 한 사람의 크기에 머뭅니다. 이것 하나만 기억하시면 됩니다.",
];
/* ④ 닫는 한 줄 — 연차·모양 풀 + 가장 낮은 축 풀 + 한 걸음 더 풀을 섞어 반복 인상을 줄인다 */
const G_CLOSE = {
  master:["지금의 여섯 축을 사장님 없이도 굴러가는 판으로 옮기는 것, 그것이 마스터의 다음 성장입니다.","이 결과는 축하드려야 할 결과입니다. 다음 목표는 점수가 아니라 사장님의 방식을 물려줄 사람입니다.","여섯 축이 모두 높다는 건 다음 사람을 키울 준비가 됐다는 뜻입니다. 사장님의 방식을 글로 남기는 것이 다음 단계입니다."],
  balanced:["고른 사업은 오래 갑니다. 이제 한 축을 골라 뾰족하게 만들 차례입니다.","여섯 축이 고르다는 건 어디를 밀어도 움직인다는 뜻입니다. 하나만 고르세요.","균형은 지키는 것이 아니라 쓰는 것입니다. {low}부터 밀어 보세요."],
  early:["지금은 잘하는 것보다 '재 보는 것'이 먼저입니다. 한 달 뒤 같은 진단을 다시 하면 그때 성장 방향이 선명해집니다.","첫해의 점수는 성적이 아니라 출발선입니다. 한 축만 움직여 보고 다시 재 보세요.","첫해에 여섯 축이 다 높은 사장님은 없습니다. {act}, 이것 하나가 첫해의 성장 방향입니다."],
  mid:["작은 사업의 성장은 여섯 축을 다 올리는 게 아니라, 가장 낮은 축 하나가 사업을 끌어내리지 않게 하는 것에서 시작합니다.","{top}가 만든 지금까지의 성과에 {low} 하나가 더해지면, 같은 노력으로 다른 결과가 납니다.","{topS}점짜리 습관을 이미 갖고 계십니다. 그 습관이 {low}에도 붙는 데 필요한 건 재능이 아니라 한 장의 종이입니다."],
  late:["오래 한 사업일수록 바꾸는 건 하나면 됩니다. {low} 하나가 바뀌면 나머지 다섯 축이 쓰이는 방식도 달라집니다.","지금까지의 방식이 사업을 여기까지 데려왔습니다. 다음 구간은 {low} 하나를 더한 방식이 데려갑니다.","오래된 사업의 성장은 새로운 것을 배우는 데서가 아니라, {topS}점짜리 습관을 {low}에 옮기는 데서 옵니다."],
  step:["오늘 이 글에서 떠오른 한 가지를 함께 일하는 사람이나 가까운 사람에게 '이번 주 안에 한다'고 말해 두세요. 말해 둔 일은 대개 됩니다.","오늘 밤 {act}부터 시작해 보세요. 첫 줄만 적어 두고 주무셔도 됩니다. 나머지는 내일의 사장님이 이어서 합니다."],
};
function buildGrowth(scores, type, gap, pre, code){
  const seed=gSeed(code);
  const ranked=(type&&type._rank)||scores.slice().sort((a,b)=>b.score-a.score);
  const top=ranked[0], top2=ranked[1], low=ranked[5], low2=ranked[4];
  const mx=top.score, mn=low.score, range=mx-mn;
  const pair=G_PAIR[top.axisId+'>'+low.axisId]||{t:'',act:'위의 한 가지',unit:'그 숫자'};
  const v={top:labelOf(top.axisId),topS:top.score,top2:labelOf(top2.axisId),top2S:top2.score,low:labelOf(low.axisId),lowS:low.score,low2:labelOf(low2.axisId),low2S:low2.score,gap:range,sinkGap:low2.score-low.score,act:pair.act,unit:pair.unit,topRec:G_TOPREC[top.axisId]||'늘 적는 표'};
  v.u_ig=gJosa(pair.unit,'이','가'); v.u_eul=gJosa(pair.unit,'을','를'); v.u_eun=gJosa(pair.unit,'은','는');
  let shape='mixed';
  if(type&&type.code==='MASTER') shape='master';
  else if(type&&type.code==='BALANCED') shape='balanced';
  else if(mx<70) shape='low';
  else if(low2.score-low.score>=12 && mn<=60) shape='sink';
  else if(top.score-top2.score>=12) shape='spike';
  else if(top.score>=80 && top2.score>=80 && top2.score-ranked[2].score>=10) shape='twin';
  const high=(shape==='master'||shape==='balanced');
  const p1=gFill(gPick(G_SHAPE[shape], seed), v);
  const lowN=(gap&&gap.items&&gap.items.length)?gap.items[0].n:1;
  const theme=(G_LOW[low.axisId]||[]).find(t=>t.ids.includes(lowN))||(G_LOW[low.axisId]||[])[0];
  const allHigh=!!(gap&&gap.allHigh);
  let p2=(shape==='master')?gFill(gPick(G_MASTER_P2, seed>>2), v):pair.t;
  if(shape==='master'){}
  else if(allHigh) p2+=' 다만 이 축도 대체로 높게 답하셔서, 빈 곳을 메우기보다 지금 방식이 실제로 작동하는지 기록으로 확인하는 것이 과제입니다.';
  else if(theme) p2+=' '+theme.why;
  const ctx=G_CTX.filter(c=>{ try{ return !!c.when(pre||{}) && (!c.axes || c.axes.includes(low.axisId)); }catch(e){ return false; } }).slice(0,1).map(c=>c.text);
  const recKey=(v.topRec||'').slice(-3); const orderPool=high?G_ORDER_HIGH:(pair.act.indexOf(recKey)>=0?G_ORDER.slice(1):G_ORDER);
  const p3=[gFill(gPick(orderPool, seed>>3), v)].concat(ctx).join(' ');
  let closeKey='mid';
  if(shape==='master') closeKey='master'; else if(shape==='balanced') closeKey='balanced';
  else if(pre&&(pre.yearsInBiz==='pre-launch'||pre.yearsInBiz==='year-0-1')) closeKey='early';
  else if(pre&&pre.yearsInBiz==='year-8-plus') closeKey='late';
  const closePool=(high?[]:G_CLOSE.step).concat(G_CLOSE[closeKey]);
  const p4=gFill(gPick(closePool, seed>>5), v);
  const emph=[pair.act,pair.unit].filter(Boolean);
  return {shape, paras:[p1,p2,p3,p4].filter(Boolean), pairKey:top.axisId+'>'+low.axisId, closeKey, emph};
}

/* ── 결과 화면 v3.5 ─────────────────────────────────── */
const AXIS_EN={self:"SELF",production:"PRODUCTION",goal:"GOAL",relation:"RELATION",marketing:"MARKETING",finance:"FINANCE"};
const AXIS_RE=/(자기관리|생산관리|목표관리|관계관리|판매관리|재무관리)(\s?\(?\d{1,3}점\)?)/g;
function eyebrow(t, r){ return '<h3 class="hexd-eyebrow">'+t+(r?'<span class="r">'+r+'</span>':'')+'</h3>'; }
function fmtDate(t){ const d=new Date(t||Date.now()); const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate()); }
function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escRe(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
/* 중요한 말을 굵은 초록으로: 축 이름+점수, 따옴표 구절, 지정 구절(extra). 이미 굵게 된 부분은 건드리지 않는다 */
function emph(text, extra){
  let html=escHtml(text).replace(/【([^】]{1,40})】/g,'<b>$1</b>'); /* 글 안의 【핵심 구절】 표식 → 굵은 초록 */
  const terms=(extra||[]).filter(Boolean).sort((a,b)=>b.length-a.length);
  function outside(fn){ return html.split(/(<b>.*?<\/b>)/).map(seg=>seg.startsWith('<b>')?seg:fn(seg)).join(''); }
  terms.forEach(t=>{ const e=escHtml(t); html=outside(seg=>seg.split(e).join('<b>'+e+'</b>')); });
  html=outside(seg=>seg.replace(/'([^']{2,40})'/g,"<b>'$1'</b>"));
  html=outside(seg=>seg.replace(AXIS_RE,'<b>$1$2</b>'));
  return html;
}
/* 줄내림 규칙(절대 원칙): ① 문장마다 줄을 바꾼다 ② 한 줄이 MAX자를 넘으면 쉼표 뒤(없으면 가운데에 가까운 띄어쓰기)에서 한 번 더 끊는다.
   모바일 본문 한 줄이 22자 안팎이라 MAX=22 → 대부분의 줄이 화면에서 다시 접히지 않는다. 공유 카드도 같은 함수를 쓴다(window.__sbaHexdBreak). */
const LINE_MAX=44; /* 화면: 문장은 한 줄. 44자를 넘는 긴 문장만 자연스러운 자리에서 나눈다. 좁은 화면에서는 각 줄이 균형 있게(text-wrap:balance) 접힌다 */
const BR_END=/(고|면|서|니|라|데|만|도|은|는|이|가|을|를|에|로|의|와|과|께|에서|부터|까지|처럼|보다|이라|이고|이면|지만|라서|면서)$/;
const BR_COUNTER=/^(칸|장|개|명|번|줄|가지|달|주|시간|분|점|곳|사람|축|문항|글자|자)(?:$|[을를이가은는의에도만로와과께,.])/;
const BR_NUM=/^(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열|\d+)$/;
const BR_AUX=/^(있|없|않|싶|같|버리|드리)[가-힣]{0,4}[.,]?$/;
const BR_BOUND=/^(건|것|게|수|지|데|때|줄|뿐|만큼|대로|채|척|등|중|편|셈|탓|덕|때문|이)(?:$|[을를이가은는의에도만로와과께,.])/; /* 의존명사 앞에서는 끊지 않는다("있다는 / 건") */
function splitSentences(t){ return String(t||'').replace(/([.!?]['"”’】]?)\s+(?=\S)/g,'$1\n').split('\n').map(s=>s.trim()).filter(Boolean); }
/* 한 문장이 길면 자연스러운 자리에서 한 번 더 끊는다: 쉼표 뒤 > 어미·조사 뒤 > 가운데 띄어쓰기. 따옴표 안, 수사+단위 사이("두 칸")는 끊지 않는다.
   한 번 끊은 뒤 조각이 MAX+6 이하면 더 쪼개지 않는다(너무 잘게 부서지는 것 방지). */
function breakLine(s, max, depth, strict){
  depth=depth||0;
  const vis=s.replace(/[\u0001\u0002]/g,'').length; /* 굵게 표식은 글자 수에서 뺀다 */
  if(vis<=max) return [s];
  if(!strict && depth>0 && vis<=max+6) return [s];
  const mid=s.length/2; let best=-1, bestScore=-1e9, q=0;
  for(let i=0;i<s.length;i++){
    const ch=s[i]; if(ch==="'"||ch==='"'){ q^=1; continue; }
    if(ch!==' '||q) continue;
    const before=s.slice(0,i).trim(), after=s.slice(i+1).trim();
    if(before.length<6||after.length<5) continue;
    const pw=before.split(' ').pop(), nw=after.split(' ')[0];
    let sc=-Math.abs(i-mid);
    if(/[,،]$/.test(pw)) sc+=14; else if(BR_END.test(pw)) sc+=5;
    if(BR_NUM.test(pw)||BR_COUNTER.test(nw)||BR_BOUND.test(nw)) sc-=30;
    if(BR_AUX.test(nw)) sc-=18; /* 보조용언 앞("받쳐 주고 / 있어서")도 피한다 */
    if(sc>bestScore){ bestScore=sc; best=i; }
  }
  if(best<0) return [s];
  return breakLine(s.slice(0,best).trim(), max, depth+1, strict).concat(breakLine(s.slice(best+1).trim(), max, depth+1, strict));
}
function breakText(t, max, strict){ const out=[]; splitSentences(t).forEach(s=>{ breakLine(s, max||LINE_MAX, 0, strict).forEach(l=>out.push(l)); }); return out; }
window.__sbaHexdBreak=breakText;
/* 굵게(<b>) 표시가 섞인 HTML 조각을 같은 규칙으로 줄 바꿈 (공유 카드용) */
window.__sbaHexdLinesHtml=function(html,max){ const plain=String(html).replace(/<b>/g,'').replace(/<\/b>/g,'').replace(/<br\s*\/?>/g,' ').replace(/<[^>]+>/g,''); return breakText(plain,max||26,true).join('<br>').replace(//g,'<b>').replace(//g,'</b>'); };
/* 이미 HTML 이 된 문자열(따옴표 굵게 등) 전용: 문장 뒤에서만 끊는다 */
function lines(html){ return String(html).replace(/([.!?])\s+(?=\S)/g,'$1<br>'); }
function para(text, extra){ return '<p>'+breakText(text).map(l=>'<span class="ln">'+emph(l, extra)+'</span>').join('')+'</p>'; }
function linesOf(text, extra){ return breakText(text).map(l=>'<span class="ln">'+emph(l, extra)+'</span>').join(''); }
function likertWord(v){ const L=LIKERT_LABELS.find(x=>x.value===v); return L?L.short:String(v); }
/* 빈 곳 블록: 가장 낮은 축 + 낮게 답한 문항 2개(실제 보여 준 문장) + 과제 + 고민 영역 메모 */
function buildGap(scores, type){
  const low=lowestAxis(scores);
  const qs=buildAxisQuestions(low.axisId,_pre).map(q=>({q, v:_answers[q.id]})).filter(x=>x.v!=null);
  qs.sort((a,b)=>a.v-b.v || a.q.n-b.q.n);
  const items=qs.slice(0,2);
  const allHigh=qs.length>0 && qs[0].v>=6;
  const master=!!(type&&type.code==='MASTER');
  const task=master?"여섯 축 중 사장님이 직접 하는 일 하나를 골라, 이번 두 주 동안 다른 사람에게 맡겨 보세요. 맡긴 일이 그대로 굴러가는지 기록해 보는 것이 마스터의 과제입니다."
             :allHigh?TASK_ALL_HIGH:pickTask(low.axisId, items.length?items[0].q.n:1);
  let concernNote='';
  const cons=(_pre.concerns||[]);
  if(cons.length){
    const other=cons.filter(c=>c!==low.axisId);
    if(cons.includes(low.axisId)){ concernNote='먼저 해결하고 싶은 영역으로 고르신 '+labelOf(low.axisId)+'가 답변에서도 가장 낮게 나왔어요. 방향이 같으니, 위의 한 가지부터 시작해 보셔도 좋겠습니다.'; }
    else {
      const c0=other[0]; const cs=scores.find(s=>s.axisId===c0);
      if(cs && cs.score>=70){ concernNote='"먼저 해결하고 싶은 영역"으로 '+labelOf(c0)+'를 고르셨네요. '+labelOf(c0)+' 점수('+cs.score+'점)는 높은 편이라, 습관은 있는데 결과가 답답한 상황일 수 있어요. 상담에서 함께 볼 수 있는 부분입니다.'; }
      else if(cs){ concernNote='"먼저 해결하고 싶은 영역"으로 고르신 '+labelOf(c0)+'('+cs.score+'점)도 함께 살펴볼 곳이에요. 두 영역 중 하나부터 가볍게 시작해 보세요.'; }
    }
  }
  return {axisId:low.axisId, score:low.score, items:items.map(x=>({id:x.q.id, n:x.q.n, text:x.q.text, v:x.v})), task, allHigh, master, concernNote};
}
function renderGap(root, gap){
  const gw=root.querySelector('#gapWrap'); if(!gw) return;
  const ev=gap.items.map(x=>'<li>'+escHtml(x.text)+' <b>'+likertWord(x.v)+'</b></li>').join('');
  const head=gap.master?'그래도 한 곳을 고른다면':'먼저 살펴볼 곳';
  const evHead=gap.master?'가장 낮게 답하신 문항도 이 정도예요':gap.allHigh?'이 영역도 대체로 높게 답하셨어요':'이렇게 답하셨어요';
  const taskHead=gap.master?'마스터에게 드리는 두 주 과제':'이번 두 주에 해 볼 만한 것';
  const masterNote=gap.master?'<p class="hexd-foot">'+linesOf('꼭 알아 두실 것 하나. 여섯 축을 다 잘하는 사장님의 사업은 사장님이 곧 시스템이 됩니다. 사장님이 자리를 비우는 순간 어느 축이 먼저 멈추는지, 그것이 점수표에 없는 진짜 빈 곳입니다.')+'</p>':'';
  gw.innerHTML=eyebrow(head)
    +'<div class="hexd-gap-axis"><b class="nm">'+labelOf(gap.axisId)+'</b><span class="sc">'+gap.score+'</span></div>'
    +'<p class="hexd-gap-desc">'+(AXIS_DESC[gap.axisId]||'')+'</p>'
    +(ev?'<h4 class="hexd-gap-sub">'+evHead+'</h4><ul class="hexd-gap-ev">'+ev+'</ul>':'')
    +'<h4 class="hexd-gap-sub">'+taskHead+'</h4><div class="hexd-gap-task">'+linesOf(gap.task)+'</div>'
    +masterNote
    +(gap.concernNote?'<p class="hexd-foot">&#8251; '+linesOf(gap.concernNote)+'</p>':'')
    +'<p class="hexd-gap-cta">이 부분은 상담에서 함께 볼 수 있어요.<br><button type="button" data-consult>이 결과로 상담 신청 &rsaquo;</button></p>';
  const gb=gw.querySelector('[data-consult]'); if(gb) gb.onclick=goConsult;
  gw.style.display='block';
}
/* 상담 신청: 컨설팅 페이지의 상담 신청서로, 결과 코드를 붙여 이동(신청서가 숨은 칸에 자동 첨부) — 결과 화면의 두 버튼이 같이 쓴다 */
function goConsult(){ location.href='/cmpwyv9vbez2s01unagivd0pq?code='+encodeURIComponent(_rcode||''); }
/* 익명 저장: 이름·연락처 없음. 기본은 이 기기(localStorage)에 두고, 저장소 연결 함수(window.SBA_HEXD_SAVE)가 있으면 그쪽으로도 보낸다 */
const RESULTS_KEY="sba_hexd_results_v2";
/* 서버 저장: 식스샵 커스텀 DB `hexd-results` (public 채널은 생성만 열려 있음 → 방문자는 쓰기만, 읽기는 관리자·본인만) */
const CDB_URL="https://cdb.sixshop.io/public/hexd-results", CDB_MY_URL="https://cdb.sixshop.io/my/hexd-results", CDB_STORE="sba01";
/* 식스샵 회원 토큰: 블록 런타임(blockMaker)이 쓰는 것과 같은 자리(localStorage "sixshop-user-info".token) */
function customerToken(){ try{ const u=JSON.parse(localStorage.getItem('sixshop-user-info')||'null'); return (u&&u.token)?String(u.token):''; }catch(e){ return ''; } }
function cdbHeaders(tok){ const h={'Content-Type':'application/json','ss-store-id':CDB_STORE}; if(tok) h['Authorization']='Bearer '+tok; return h; }
/* 대출·빚 답은 서버에 보내지 않는다: pre.debt 를 지우고, 그 답으로 바뀐 문항(…:debt-yes)도 원래 문항 id·문구로 되돌린다 (답 값은 그대로) */
function withoutDebt(p){
  const DV=':debt-yes', fix=id=>(typeof id==='string'&&id.endsWith(DV))?id.slice(0,-DV.length):id;
  const baseText=id=>{ const q=QUESTIONS.find(x=>x.id===id); return q?q.text:''; };
  const pre=Object.assign({},p.pre||{}); delete pre.debt;
  const answers={}; Object.keys(p.answers||{}).forEach(k=>{ answers[fix(k)]=p.answers[k]; });
  let shown=p.shown; if(shown&&typeof shown==='object'){ shown={}; Object.keys(p.shown).forEach(ax=>{ shown[ax]=(p.shown[ax]||[]).map(q=>(q&&fix(q.id)!==q.id)?Object.assign({},q,{id:fix(q.id),text:baseText(fix(q.id))}):q); }); }
  const gItems=(p.gap&&p.gap.items)||[];
  const gap=p.gap?Object.assign({},p.gap,{items:gItems.map(fix)}):p.gap;
  const gapItems=(p.gapItems||[]).map((x,i)=>(gItems[i]&&fix(gItems[i])!==gItems[i])?Object.assign({},x,{text:baseText(fix(gItems[i]))}):x);
  return Object.assign({},p,{pre,answers,shown,gap,gapItems});
}
function serverDoc(p){
  p=withoutDebt(p);
  const sc={}; (p.scores||[]).forEach(s=>{ sc[s.axisId]=s.score; });
  const gapItems=(p.gapItems||[]).map(x=>'"'+x.text+'" — '+x.word).join('\n');
  const summary=['사전: '+JSON.stringify(p.pre||{}),'먼저 살펴볼 곳: '+(p.gapLabel||'')+' '+(p.gapScore!=null?p.gapScore+'점':''),'낮게 답한 문항:\n'+gapItems,'과제: '+(p.gap&&p.gap.task||''),'고민 영역: '+((p.concerns||[]).join(', ')||'없음'),'동률: '+JSON.stringify(p.tie||[])].join('\n\n');
  return {code:p.code, date:new Date(p.t||Date.now()).toISOString(), user:p.user||'', type:p.type, nickname:p.nickname||'',
    scoreSelf:sc.self, scoreProduction:sc.production, scoreGoal:sc.goal, scoreRelation:sc.relation, scoreMarketing:sc.marketing, scoreFinance:sc.finance,
    lowest:p.gapLabel||'', summary:summary, version:'v'+(p.v||2)+'.5',
    payload:JSON.stringify({pre:p.pre, answers:p.answers, shown:p.shown, gap:p.gap, tie:p.tie, concerns:p.concerns})};
}
function saveToServer(p){
  try{
    if(!window.fetch) return;
    const key='sba_hexd_sent_'+p.code; try{ if(sessionStorage.getItem(key)) return; }catch(e){}
    const body=JSON.stringify(serverDoc(p)), tok=customerToken();
    function ok(){ try{ sessionStorage.setItem(key,'1'); }catch(e){} }
    function toPublic(){ return fetch(CDB_URL,{method:'POST',mode:'cors',headers:cdbHeaders(''),body:body}).then(r=>{ if(r.ok) ok(); else console.warn('[sba-hexd] 저장 응답',r.status); }); }
    /* 로그인 회원 → 본인 채널(소유자 기록, 다른 기기에서 조회 가능). 실패하면 공개 채널로 */
    const first = tok ? fetch(CDB_MY_URL,{method:'POST',mode:'cors',headers:cdbHeaders(tok),body:body}).then(r=>{ if(r.ok){ ok(); return true; } return false; }).catch(()=>false) : Promise.resolve(false);
    first.then(done=>{ if(!done) return toPublic(); }).catch(e=>{ console.warn('[sba-hexd] 저장 실패',e); });
  }catch(e){}
}
function persistResult(p){
  try{ const all=JSON.parse(localStorage.getItem(RESULTS_KEY)||'{}'); all[p.code]=p; const keys=Object.keys(all).sort((a,b)=>(all[b].t||0)-(all[a].t||0)); keys.slice(20).forEach(k=>{ delete all[k]; }); localStorage.setItem(RESULTS_KEY, JSON.stringify(all)); }catch(e){}
  saveToServer(p);
  try{ if(typeof window.SBA_HEXD_SAVE==='function') window.SBA_HEXD_SAVE(withoutDebt(p)); }catch(e){}
}
function loadResultByCode(code){ try{ const all=JSON.parse(localStorage.getItem(RESULTS_KEY)||'{}'); return all[String(code||'').toUpperCase()]||null; }catch(e){ return null; } }
function fetchMyLastResult(cb){
  const tok=customerToken(); if(!tok||!window.fetch){ cb(null); return; }
  fetch(CDB_MY_URL+'?fields=code,date,type,nickname,user,payload&sort=date:desc&limit=1',{mode:'cors',headers:cdbHeaders(tok)})
    .then(r=>r.ok?r.json():null).then(rows=>{
      const row=Array.isArray(rows)?rows[0]:null; if(!row||!row.code){ cb(null); return; }
      let pl={}; try{ pl=JSON.parse(row.payload||'{}')||{}; }catch(e){}
      if(!pl.answers){ cb(null); return; }
      const p={code:String(row.code).toUpperCase(), t:Date.parse(row.date)||Date.now(), v:2, user:row.user||'', pre:pl.pre||{}, shown:pl.shown||null, answers:pl.answers||{}, gap:pl.gap||null, tie:pl.tie||[], concerns:pl.concerns||[], type:row.type||'', nickname:row.nickname||'', fromServer:true};
      try{ const all=JSON.parse(localStorage.getItem(RESULTS_KEY)||'{}'); if(!all[p.code]){ all[p.code]=p; localStorage.setItem(RESULTS_KEY, JSON.stringify(all)); } }catch(e){}
      try{ sessionStorage.setItem('sba_hexd_sent_'+p.code,'1'); }catch(e){} /* 다시 열 때 서버에 또 저장하지 않게 */
      cb(p);
    }).catch(()=>cb(null));
}
function loadLastResult(){ try{ const all=JSON.parse(localStorage.getItem(RESULTS_KEY)||'{}'); const k=Object.keys(all).sort((a,b)=>(all[b].t||0)-(all[a].t||0))[0]; return k?all[k]:null; }catch(e){ return null; } }
let _rcode=null;
function showResult(root, opts){
  opts=opts||{};
  const scores = AXES.map(ax=>{ const qs=buildAxisQuestions(ax.id,_pre); const st=axisStats(_answers,qs); return {axisId:ax.id, code:ax.code, color:ax.color, score:likertToScore(st.mean), rawAvg:st.mean, stats:st}; });
  const type = matchType(scores);
  const gap = buildGap(scores, type);
  const lowestIdx = scores.findIndex(s=>s.axisId===gap.axisId);
  if(!_rcode || opts.newCode) _rcode = opts.code || makeCode(type.code+JSON.stringify(_answers)); /* 내부 식별용(화면에는 안 보임) */
  saveProgress('result');
  const byCode={}; scores.forEach(s=>{ byCode[s.code]=s; });

  /* 표제란 */
  const _ci=root.querySelector('#charImg'); const _cu=CHAR_IMG[type.code];
  if(_ci){ _ci.onerror=function(){ this.style.display='none'; }; if(_cu){ _ci.src=_cu; _ci.alt=type.nickname; _ci.style.display='block'; } else { _ci.style.display='none'; } }
  root.querySelector('#r-code').textContent=type.code;
  root.querySelector('#r-name').textContent=type.nickname;
  root.querySelector('#r-liner').innerHTML=breakText(type.oneLiner, 20).map(escHtml).join('<br>');
  const an=root.querySelector('#r-axisnote'); if(an){ an.textContent=type.axisNote||''; an.style.display=type.axisNote?'block':'none'; }

  /* 치수 */
  const ranked=(type._rank||scores.slice().sort((a,b)=>b.score-a.score));
  const strongSet=new Set([ranked[0].axisId,ranked[1].axisId]);
  const weakSet=new Set([ranked[4].axisId,ranked[5].axisId]);
  const sd=root.querySelector('#scoresDate'); if(sd) sd.textContent=fmtDate(opts.t);
  const grid=root.querySelector('#scoresGrid'); grid.innerHTML='';
  scores.forEach((s)=>{
    const cls=type.code==='MASTER'?'top':strongSet.has(s.axisId)?'top':weakSet.has(s.axisId)?'low':'';
    const tag=type.code==='MASTER'?'':cls==='top'?'강점':cls==='low'?'보강':'';
    const row=document.createElement('div'); row.className='hexd-row'; row.title=AXIS_DESC[s.axisId]||'';
    row.innerHTML='<div class="lb"><span class="hexd-score-label">'+labelOf(s.axisId)+'</span><small>'+AXIS_EN[s.axisId]+'</small></div>'
      +'<div class="track"><div class="fill '+cls+'" style="width:0%"></div></div>'
      +'<div class="v"><span class="hexd-score-val">'+s.score+'</span>'+(tag?'<em class="'+cls+'">'+tag+'</em>':'')+'</div>';
    grid.appendChild(row);
    const f=row.querySelector('.fill'); requestAnimationFrame(function(){ requestAnimationFrame(function(){ f.style.width=s.score+'%'; }); });
  });
  const tn=root.querySelector('#tieNote');
  if(tn){ const notes=(type._tieNotes||[]).map(n=>n.msg); tn.innerHTML=notes.map(m=>'<div>&#8251; '+linesOf(m)+'</div>').join(''); tn.style.display=notes.length?'block':'none'; }

  /* 강점 풀어 쓰기 (칭찬 먼저) */
  const swWrap=root.querySelector('#swWrap');
  if(swWrap){
    const st=(type.strengths||[]).slice(0,2);
    const notes=(typeof STRENGTH_NOTES!=='undefined'&&STRENGTH_NOTES[type.code])||[];
    const parts=type.code.indexOf('-')>0?type.code.split('-'):null;
    const items=st.map((t,i)=>{
      const ax=parts?byCode[parts[i]]:null;
      const axTxt=ax?labelOf(ax.axisId)+' &middot; '+ax.score:'여섯 영역';
      return '<div class="hexd-st-it"><div class="ax"><b>'+(i+1)+'</b>'+axTxt+'</div><h5>'+escHtml(t)+'</h5>'+(notes[i]?para(notes[i]):'')+'</div>';
    }).join('');
    swWrap.innerHTML=items?eyebrow(type.code==='MASTER'?'마스터의 강점':'이 유형의 강점')+'<div class="hexd-st">'+items+'</div>':''; swWrap.style.display=items?'block':'none';
  }

  renderGap(root, gap);

  /* 닮은 사업가 */
  const simWrap=root.querySelector('#similarWrap');
  if(simWrap){
    const sim=SIMILAR[type.code];
    function personCard(p, region){
      if(!p||!p.n) return '';
      const logo = p.dom
        ? '<img src="https://www.google.com/s2/favicons?domain='+p.dom+'&sz=64" alt="" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'"><span class="lgm" style="display:none">'+(p.mono||'')+'</span>'
        : '<span class="lgm">'+(p.mono||(p.n||'').slice(0,2))+'</span>';
      const ach=(typeof SIMILAR_ACH!=='undefined'&&SIMILAR_ACH[p.n])||'';
      return '<div class="hexd-pp"><div class="lg">'+logo+'</div><div><div class="rg">'+region+'</div><div class="hexd-person-name">'+p.n+'</div><div class="hexd-person-co">'+(p.c||'')+'</div>'+(ach?'<div class="ach">'+ach+'</div>':'')+'</div></div>';
    }
    const cards=(x,region)=>!x?'':(Array.isArray(x)?x:[x]).map(p=>personCard(p,region)).join('');
    if(sim&&(sim.g||sim.d)){
      simWrap.innerHTML=eyebrow('당신과 닮은 사업가')+'<div class="hexd-people">'+cards(sim.g,'해외')+cards(sim.d,'국내')+'</div><p class="hexd-sim-note">\'강점이 닮았다\'는 참고용이에요. 약점을 단정하지 않습니다.</p>';
      simWrap.style.display='block';
    } else { simWrap.style.display='none'; }
  }

  /* 성장 방향: 조합 생성 (growth.js) — 문장마다 줄 바꿈, 흐름이 바뀌면 문단 간격, 중요한 말은 굵은 초록 */
  const gw=root.querySelector('#growthWrap');
  if(gw){
    const g=buildGrowth(scores, type, gap, _pre, _rcode);
    gw.innerHTML=eyebrow('성장 방향')+'<div class="hexd-growth-body" data-enh="1">'+g.paras.map(p=>para(p, g.emph)).join('')+'</div>';
    gw.style.display='block';
  }

  /* 다음 단계 */
  const shareUrl=location.origin+location.pathname;
  const shareMsg='나는 "'+type.nickname+'" 유형 사업가! 나의 유형도 알아보기 → '+shareUrl;
  const enc=encodeURIComponent(shareMsg);
  root.querySelector('#consultBtn').onclick=goConsult;
  root.querySelector('#reviewBtn').onclick=()=>show(root,'s-ax-0');
  /* 후기 남기기: 테마의 후기 글쓰기 스크립트(sbaResultChar)와 같은 형식으로 결과 캐릭터를 기억한 뒤 게시판 글쓰기로 이동 */
  const rw=root.querySelector('#reviewWrite'); if(rw) rw.onclick=()=>{
    try{ const src=(root.querySelector('#charImg')||{}).getAttribute?root.querySelector('#charImg').getAttribute('src')||'':''; const fn=src.split('/').pop().split('?')[0]; const cc=fn.split('.')[0];
      if(cc) localStorage.setItem('sbaResultChar', JSON.stringify({url:'https://fastly.jsdelivr.net/gh/kjgqppr9-cmyk/sba-site@s1029a/chars/thumb/'+cc+'.png', code:type.code, name:type.nickname, t:Date.now()})); }catch(e){}
    location.href='/boards/4786/write';
  };
  root.querySelector('#restartBtn').onclick=()=>{
    root.querySelectorAll('.hexd-screen[id^="s-ax-"], #s-concern').forEach(el=>el.remove());
    clearProgress(); _rcode=null;
    _answers={}; _pre=emptyPreSurvey(); _preIdx=0;
    show(root,'s-intro');
  };

  show(root,'s-result');
  mountResultRadar(root, scores, lowestIdx); /* 화면이 보인 뒤에 붙여야 크기가 잡힌다 */
  hexdArmReveal(root);

  /* 익명 저장 (결과 화면이 뜰 때 1회) */
  if(!opts.replay){
    const shown={}; AXES.forEach(ax=>{ shown[ax.id]=buildAxisQuestions(ax.id,_pre).map(q=>({id:q.id, n:q.n, text:q.text})); });
    persistResult({code:_rcode, t:Date.now(), v:2, user:(window.__sbaHexdUser||''), pre:JSON.parse(JSON.stringify(_pre)), shown, answers:Object.assign({},_answers),
      scores:scores.map(s=>({axisId:s.axisId, score:s.score})), type:type.code, nickname:type.nickname,
      tie:(type._tieNotes||[]).map(n=>({pos:n.pos, step:n.step})), gap:{axisId:gap.axisId, items:gap.items.map(x=>x.id), task:gap.task}, concerns:(_pre.concerns||[]).slice(),
      gapLabel:labelOf(gap.axisId), gapScore:gap.score, gapItems:gap.items.map(x=>({text:x.text, word:likertWord(x.v)}))});
  }
}
/* 저장된 결과 다시 보기 (이 기기) */
function openByCode(root, code){
  const p=loadResultByCode(code);
  const sb=root.querySelector('#snackbar');
  function toast(m){ if(sb){ sb.textContent=m; sb.classList.add('show'); setTimeout(()=>sb.classList.remove('show'),2800); } }
  if(!p){ toast('이 기기에 저장된 결과를 찾지 못했어요.'); return false; }
  _pre=normalizePre(Object.assign(emptyPreSurvey(), p.pre||{})); _answers=Object.assign({},p.answers||{}); _preIdx=0;
  root.querySelectorAll('.hexd-screen[id^="s-ax-"], #s-concern').forEach(el=>el.remove());
  enterMain(root);
  Object.keys(_answers).forEach(function(qid){ const b=root.querySelector('.hexd-scale-btn[data-q="'+qid+'"][data-v="'+_answers[qid]+'"]'); if(b) b.classList.add('sel'); });
  root.querySelectorAll('.hexd-screen[id^="s-ax-"]').forEach(function(div,i){ const qs=buildAxisQuestions(AXES[i].id,_pre); updateAxisProgress(div,i,qs); });
  showResult(root,{replay:true, code:p.code, newCode:true, t:p.t});
  return true;
}


/* ── 개발 확인용 훅 (하네스에서 8가지 시나리오 재현) ── */
window.__sbaHexdDev = {
  fetchMyLast: function(cb){ return fetchMyLastResult(cb||function(){}); }, loadLast: function(){ return loadLastResult(); },
  run: function(pre, answerFn, opts){
    opts=opts||{};
    const root=document.querySelector('.hexd'); if(!root) return null;
    _pre=normalizePre(Object.assign(emptyPreSurvey(), pre||{})); _answers={}; _preIdx=0; _rcode=null;
    root.querySelectorAll('.hexd-screen[id^="s-ax-"], #s-concern').forEach(el=>el.remove());
    enterMain(root);
    AXES.forEach((ax,ai)=>{ buildAxisQuestions(ax.id,_pre).forEach((q,qi)=>{ _answers[q.id]=Math.max(1,Math.min(7,Math.round(answerFn(ax.id,q,ai,qi)))); }); });
    Object.keys(_answers).forEach(function(qid){ const b=root.querySelector('.hexd-scale-btn[data-q="'+qid+'"][data-v="'+_answers[qid]+'"]'); if(b) b.classList.add('sel'); });
    if(opts.stopAt==='pre'){ renderPre(root); return {pre:_pre}; }
    if(opts.stopAt==='main'){ show(root,'s-ax-'+(opts.axis||0)); return {pre:_pre}; }
    if(opts.stopAt==='concern'){ renderConcern(root); return {pre:_pre}; }
    showResult(root,{replay:!!opts.replay});
    return this.state();
  },
  state: function(){
    const scores = AXES.map(ax=>{ const qs=buildAxisQuestions(ax.id,_pre); const st=axisStats(_answers,qs); return {axisId:ax.id, code:ax.code, score:likertToScore(st.mean), stats:st}; });
    const type=matchType(scores); const gap=buildGap(scores);
    return {code:_rcode, type:type.code, nickname:type.nickname, scores:scores.map(s=>s.axisId+':'+s.score), tie:type._tieNotes, gap:{axis:gap.axisId, score:gap.score, items:gap.items, task:gap.task, note:gap.concernNote},
            shown:AXES.map(ax=>buildAxisQuestions(ax.id,_pre).filter(q=>q._varKey).map(q=>q.id))};
  },
  questions: function(pre){ const p=normalizePre(Object.assign(emptyPreSurvey(), pre||{})); const o={}; AXES.forEach(ax=>{ o[ax.id]=buildAxisQuestions(ax.id,p).map(q=>(q._varKey?'*':'')+q.text); }); return o; },
  types: TYPE_30, tasks: TASKS,
  openByCode: function(c){ return openByCode(document.querySelector('.hexd'), c); }
};

/* 로그인한 회원 이름 → 저장 파일명에 쓴다 (블록 상단 <data value="$customer"> 로 bm.context.customer 가 채워진다) */
function pickUserName(bm){
  try{
    var c=bm&&bm.context&&(bm.context.customer||bm.context.member||bm.context.user); if(!c) return '';
    var cand=[c.nickname,c.nickName,c.name,c.userName,c.username,c.displayName,c.fullName];
    for(var i=0;i<cand.length;i++){ if(cand[i]&&String(cand[i]).trim()) return String(cand[i]).trim(); }
    if(c.email) return String(c.email).split('@')[0];
  }catch(e){}
  return '';
}
/* ── v4.4: 아래 '사업가 유형 테스트 후기' 목록 다듬기 — 진단유형 칩 분리 · 미리보기 정리 · 버튼 이름 '후기 남기기' ── */
const RV_BLOCK='6a3220721cfd844d4bfb8d5b';
function hexdReviewNicks(){
  const list=Object.keys(TYPE_30).map(k=>({code:k, nick:TYPE_30[k].nickname}));
  list.push({code:'MASTER', nick:TYPE_MASTER.nickname}, {code:'BALANCED', nick:TYPE_BALANCED.nickname});
  return list.sort((a,b)=>b.nick.length-a.nick.length);
}
function hexdEnhanceReviews(){
  const bb=document.querySelector('div.app-block[data-block-id="'+RV_BLOCK+'"]'); if(!bb) return false;
  const wb=bb.querySelector('button[data-action="write"]');
  if(wb && wb.textContent.trim()!=='후기 남기기') wb.textContent='후기 남기기';
  const nicks=hexdReviewNicks();
  bb.querySelectorAll('.board-item').forEach(function(it){
    if(it.getAttribute('data-hx')==='1') return;
    it.setAttribute('data-hx','1'); hexdObserveReveal(it);
    const ct=it.querySelector('.content'); const box=it.querySelector('.board-post-contents-wrapper');
    if(!ct||!box) return;
    let txt=(ct.textContent||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();
    const m=txt.match(/^\[진단유형\]\s*([A-Z]+(?:-[A-Z]+)?)\s*/);
    if(!m) return;
    let code=m[1], rest=txt.slice(m[0].length), nick='';
    const hit=nicks.find(n=>rest.indexOf(n.nick)===0);
    if(hit){ nick=hit.nick; rest=rest.slice(nick.length); }
    rest=rest.replace(/^[\s·:|,\-]+/,'').trim();
    const chip=document.createElement('div'); chip.className='hx-rv-type';
    const b=document.createElement('b'); b.textContent=code==='MASTER'?'M':code==='BALANCED'?'B':code; chip.appendChild(b);
    if(nick){ const s=document.createElement('span'); s.textContent=nick; chip.appendChild(s); }
    box.insertBefore(chip, box.firstChild);
    if(rest){ ct.textContent=rest; } else { ct.style.display='none'; }
  });
  return true;
}
function hexdReviewInit(){
  if(window.__hxRvInit) return; window.__hxRvInit=1;
  let tries=0;
  (function wait(){
    const bb=document.querySelector('div.app-block[data-block-id="'+RV_BLOCK+'"]');
    if(!bb){ if(++tries<60) setTimeout(wait,500); return; }
    hexdEnhanceReviews();
    try{ new MutationObserver(function(){ hexdEnhanceReviews(); }).observe(bb,{childList:true,subtree:true}); }catch(e){}
  })();
}
/* v4.5: 첫 화면 특징 상자 설명을 span 으로 감싸고 <br> 은 공백으로(좁은 화면 가로형 행) */
function hexdWrapPoints(){
  document.querySelectorAll('.hexd .hexd-point').forEach(function(pt){
    if(pt.querySelector('.hexd-point-desc')) return;
    const st=pt.querySelector('strong'); if(!st) return;
    const sp=document.createElement('span'); sp.className='hexd-point-desc';
    let n=st.nextSibling;
    while(n){ const nx=n.nextSibling; if(n.nodeName==='BR'){ sp.appendChild(document.createTextNode(' ')); sp.appendChild(n); } else sp.appendChild(n); n=nx; }
    sp.childNodes.forEach(function(c){ if(c.nodeType===3) c.nodeValue=c.nodeValue.replace(/\s+/g,' '); });
    pt.appendChild(sp);
  });
}
/* ── v5 모션(솔 5회 왕복 1회차): 자동 이동 예약·보이면 건너뜀·나타남·강조 밑줄·첫 화면 강조 ── */
var _hxAuto=0, _hxPreLast=-1, _hxIO=null;
var _hxScrollRaf=0;
function hexdStopScroll(){ if(_hxScrollRaf){ cancelAnimationFrame(_hxScrollRaf); _hxScrollRaf=0; } }
function hexdJump(y){ try{ window.scrollTo({top:y, behavior:'instant'}); }catch(e){ window.scrollTo(0,y); } }
/* 취소 가능한 부드러운 이동(사용자가 손대면 바로 멈춤) */
function hexdAnimScroll(y, dur){
  hexdStopScroll(); y=Math.max(0,Math.round(y));
  const y0=window.pageYOffset||document.documentElement.scrollTop||0, dy=y-y0; if(Math.abs(dy)<4) return;
  if(hexdReduce()||!dur){ hexdJump(y); return; }
  const t0=performance.now();
  (function step(now){ const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3); hexdJump(y0+dy*e); _hxScrollRaf=k<1?requestAnimationFrame(step):0; })(t0);
}
var _hxFocusT=0;
function hexdCancelAuto(){ if(_hxAuto){ clearTimeout(_hxAuto); _hxAuto=0; } if(_hxFocusT){ clearTimeout(_hxFocusT); _hxFocusT=0; } hexdStopScroll(); }
function hexdNextTarget(qs, lastQ){
  const at=lastQ?qs.findIndex(q=>q.id===lastQ):-1;
  for(let k=at+1;k<qs.length;k++){ if(_answers[qs[k].id]==null) return qs[k]; }
  return qs.find(q=>_answers[q.id]==null)||null;
}
function hexdQueueAuto(fn){ hexdCancelAuto(); _hxAuto=setTimeout(function(){ _hxAuto=0; fn(); },280); }
/* 위·아래 띠 사이(16px 여유)에 다 보이면 그대로, 아니면 그 사이 가운데로. 띠 사이보다 크면 위에 맞춘다 */
function hexdEnsureVisible(el, force){
  if(!el) return; const scr=el.closest('.hexd-screen');
  const pb=scr&&scr.querySelector('.hexd-sticky-prog'), nv=scr&&scr.querySelector('.hexd-sticky-nav');
  const T=(pb?pb.getBoundingClientRect().bottom:hexdHeaderH())+16, B=Math.min(window.innerHeight,(nv?nv.getBoundingClientRect().top:window.innerHeight))-16;
  const r=el.getBoundingClientRect(); if(!force && r.top>=T && r.bottom<=B) return;
  const cur=window.pageYOffset||document.documentElement.scrollTop||0;
  const y = r.height > (B-T) ? cur+r.top-T : cur+r.top+r.height/2-(T+B)/2;
  hexdAnimScroll(y, 260);
}
function hexdRevealIO(){
  if(_hxIO||!window.IntersectionObserver) return _hxIO;
  _hxIO=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ _hxIO.unobserve(e.target); hexdRevealNow(e.target); } }); },{rootMargin:'0px 0px -24px 0px', threshold:0.12});
  return _hxIO;
}
function hexdRevealNow(el){ if(el.classList.contains('hx-rv')) el.classList.replace('hx-rv','hx-in'); else el.classList.add('hx-in'); }
function hexdObserveReveal(el){
  if(!el||el.__hxRv) return; const r=el.getBoundingClientRect();
  let io=null; try{ io=hexdRevealIO(); }catch(e){ io=null; }
  el.__hxRv=1;
  if(!io || hexdReduce() || (r.top<window.innerHeight && r.bottom>0)){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('hx-in'); }); }); return; }
  try{ el.classList.add('hx-rv'); io.observe(el); }catch(e){ el.classList.remove('hx-rv'); el.classList.add('hx-in'); }
}
var _hxSeenRec={}, _hxLastScroll=0;
function hexdArmReveal(root){
  const revisit=(_hxIdle.code===_rcode && !!_rcode);
  root.querySelectorAll('#s-result .hexd-rcard').forEach(function(c){
    if(revisit){ c.__hxRv=1; c.classList.remove('hx-rv'); c.classList.add('hx-in'); c.querySelectorAll('.hexd-growth-body b, .hexd-gap-task b, .hexd-st p b').forEach(function(b,k){ if(k<2) b.classList.add('hx-hl'); }); return; }
    c.__hxRv=0; c.classList.remove('hx-in','hx-rv'); if(_hxIO) _hxIO.unobserve(c);
    c.querySelectorAll('.hexd-growth-body b, .hexd-gap-task b, .hexd-st p b').forEach(function(b,k){ if(k<2){ b.classList.add('hx-hl'); b.style.setProperty('--i', k); } });
    hexdObserveReveal(c);
  });
  const sh=root.querySelector('#s-result .hexd-sheet'); if(sh){ sh.__hxRv=0; sh.classList.remove('hx-in','hx-rv'); hexdObserveReveal(sh); }
  if(_hxIdle.code!==_rcode){ _hxIdle.runs={}; _hxIdle.code=_rcode; }
  const st=root.querySelector('#s-result .hexd-stamp'); if(st) hexdWhenSeen(st, 'stamp');
  const tk=root.querySelector('#s-result .hexd-gap-task'); if(tk) hexdWhenSeen(tk, 'task');
}
/* 대상이 절반 이상 보이고 0.5초 머물면 한 번 실행 */
function hexdWhenSeen(el, name){
  const key=(_rcode||'-')+':'+name; el.classList.remove('hx-glow');
  if(_hxSeenRec[key]||!window.IntersectionObserver||hexdReduce()) return;
  if(el.__hxIO) el.__hxIO.disconnect();
  let tm=0, ok=false;
  function fire(){ tm=0; if(!ok||!el.isConnected) return; if(Date.now()-_hxLastScroll<500||document.hidden){ tm=setTimeout(fire,200); return; }
    _hxSeenRec[key]=1; io.disconnect(); el.classList.add('hx-glow'); setTimeout(function(){ el.classList.remove('hx-glow'); },900); }
  const io=new IntersectionObserver(function(es){ const e=es[0]; ok=!!(e&&e.intersectionRatio>=.5); if(ok){ if(!tm) tm=setTimeout(fire,500); } else if(tm){ clearTimeout(tm); tm=0; } },{threshold:[0,.5,1]});
  el.__hxIO=io; io.observe(el);
}
/* 가만히 있을 때만 살짝: 화면당 한 곳, 기기별 간격·횟수 상한, 조작하면 그 자리에서 멈춤 */
var _hxIdle={last:Date.now(), lastRun:0, runs:{}};
var _hxKbd=false;
function hexdPoke(e){ _hxIdle.last=Date.now(); if(e&&e.type==='scroll') _hxLastScroll=_hxIdle.last; if(e&&e.type){ if(e.type==='keydown') _hxKbd=true; else if(e.type==='pointerdown'||e.type==='touchstart') _hxKbd=false; }
  document.querySelectorAll('.hx-sheen-go,.hx-again,.hx-nudge').forEach(function(el){ el.classList.remove('hx-sheen-go','hx-again','hx-nudge'); }); }
function hexdVisibleRatio(el){ if(!el) return 0; const r=el.getBoundingClientRect(); if(!r.height) return 0; const vis=Math.min(r.bottom,window.innerHeight)-Math.max(r.top,0); return Math.max(0,vis)/r.height; }
function hexdIdleTick(){
  if(document.hidden||hexdReduce()) return;
  const root=document.querySelector('.hexd'); if(!root) return;
  const act=root.querySelector('.hexd-screen.active'); if(!act) return;
  const now=Date.now(), w=window.innerWidth, gap=w<=520?9000:w<1024?8000:7000, max=w<=520?2:3;
  if(now-_hxIdle.lastRun<gap) return;
  let key=null, el=null, cls=null, need=4000, ratio=.6;
  if(act.id==='s-intro'){ key='intro'; const rb=root.querySelector('#resumeBtn'); el=rb||root.querySelector('#startBtn');
    cls=(rb||(_hxIdle.runs.intro||0)%2===1)?'hx-sheen-go':'hx-nudge'; }
  else if(act.id==='s-result'){
    const stage=root.querySelector('#radarStage'); if(hexdVisibleRatio(stage)>0) return; /* 도면이 보이면 도면이 한 자리를 차지 */
    key='again'; el=root.querySelector('#s-result .hexd-gr .hx-hl'); cls='hx-again'; need=3000; ratio=1;
  }
  if(!el||now-_hxIdle.last<need||(_hxIdle.runs[key]||0)>=max||hexdVisibleRatio(el)<ratio) return;
  _hxIdle.runs[key]=(_hxIdle.runs[key]||0)+1; _hxIdle.lastRun=now;
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  setTimeout(function(){ el.classList.remove(cls); }, 1000);
}
function hexdMotionInit(){
  const root=document.querySelector('.hexd'); if(!root||root.__hxMo) return; root.__hxMo=1;
  const sub=root.querySelector('.hexd-intro .hexd-sub'); if(sub && !sub.querySelector('.hx-mark')) sub.innerHTML=sub.innerHTML.replace('강점과 빈자리','<span class="hx-mark">강점과 빈자리</span>');
  const sb=root.querySelector('#startBtn'); if(sb && !sb.querySelector('.hx-arr')) sb.innerHTML=sb.innerHTML.replace('\u2192','<span class="hx-arr">\u2192</span>');
  ['wheel','touchstart','touchmove','pointercancel','pointerdown'].forEach(function(ev){ window.addEventListener(ev, hexdCancelAuto, {passive:true, capture:true}); });
  if(!(window.CSS&&CSS.registerProperty)) root.classList.add('hx-noprop');
  window.addEventListener('keydown', function(e){ if(/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Tab|Escape)$/.test(e.key)) hexdCancelAuto(); });
  document.addEventListener('visibilitychange', function(){ if(document.hidden) hexdCancelAuto(); });
  ['scroll','pointerdown','keydown','touchstart'].forEach(function(ev){ window.addEventListener(ev, hexdPoke, {passive:true}); });
  root.querySelectorAll('#startBtn').forEach(function(b){ if(!b.querySelector('.hx-sheen')){ const i=document.createElement('i'); i.className='hx-sheen'; i.setAttribute('aria-hidden','true'); b.appendChild(i); } });
  try{ new MutationObserver(function(){ const rb=root.querySelector('#resumeBtn'); if(rb&&!rb.querySelector('.hx-sheen')){ const i=document.createElement('i'); i.className='hx-sheen'; i.setAttribute('aria-hidden','true'); rb.appendChild(i); } }).observe(root,{childList:true,subtree:true}); }catch(e){}
  setInterval(hexdIdleTick, 1000);
  try{ window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(m){
    if(m.matches){ hexdCancelAuto(); hexdPoke(); document.querySelectorAll('.hx-rv').forEach(function(el){ el.classList.replace('hx-rv','hx-in'); }); }
    const a=window.__hxBpArgs; if(a && a[0].querySelector('#s-result.active')) mountResultRadar(a[0], a[1], a[2]); }); }catch(e){}
}
window.__sbaHexdRun = function(bm){ hexdReviewInit(); hexdWrapPoints(); hexdMotionInit(); window.__sbaHexdUser=pickUserName(bm); mount(); if(bm) bm.onContextChange = function(){ window.__sbaHexdUser=pickUserName(bm); mount(); }; };
})();

/* ══ 결과 카드 저장·공유 (테마 body 에서 이동, v2 수정) ══ */
(function(){
  if(window.__hexdCap) return; window.__hexdCap=1;
  function loadH2C(cb){
    if(window.html2canvas) return cb();
    var s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.crossOrigin='anonymous';
    s.onload=function(){cb();};
    s.onerror=function(){cb(new Error('load-fail'));};
    document.head.appendChild(s);
  }
  function toast(msg){
    var sb=document.querySelector('.hexd .hexd-snackbar');
    if(sb){ sb.textContent=msg; sb.classList.add('show'); setTimeout(function(){sb.classList.remove('show');},2200); }
  }
  function testLink(){ return location.origin+'/cmq1zi2unbif901wmfd0hfumx'; }
  function downloadBlob(blob,fname){ var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },900); }
  // ===== 인스타 캐러셀 저장 (1080×1350 여러 장) =====
  function igStyle(){
    if(document.getElementById('igc-style')) return;
    var s=document.createElement('style'); s.id='igc-style';
    s.textContent=
      ".igc-card{width:1080px;height:1350px;position:relative;overflow:hidden;background:#F2F0EB;font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;color:#20241f}"
     +".igc-card *{box-sizing:border-box;margin:0;padding:0}"
     +".igc-pad{position:absolute;inset:0;padding:80px 84px}"
     +".igc-brand{display:flex;align-items:center;justify-content:space-between;font-size:25px;font-weight:700;color:#8a9089}.igc-brand b{color:#006241;font-weight:800}"
     +".igc-foot{position:absolute;left:84px;right:84px;bottom:64px;display:flex;align-items:center;justify-content:space-between;font-size:23px;color:#8a9089;font-weight:600}.igc-foot b{color:#006241;font-weight:800}"
     +".igc-hex{position:absolute;width:520px;height:520px;background:#D4E9E2;border-radius:44% 56% 52% 48%/50%;opacity:.55}"
     +".igc-title{font-size:60px;font-weight:800;margin-top:38px;letter-spacing:-2px}.igc-title .p{font-size:33px;color:#8a9089;font-weight:700;margin-left:12px}"
     +".igc-sub{font-size:31px;color:#4b5148;margin-top:12px;font-weight:600}"
     +".igc-kick{font-size:40px;font-weight:800;color:#006241;margin-top:48px}"
     +".igc-char{width:400px;height:400px;margin:34px auto 4px;border-radius:50%;background:#DFEDE7;display:flex;align-items:center;justify-content:center;overflow:hidden}.igc-char img{width:86%;height:86%;object-fit:contain}"
     +".igc-pill{display:inline-block;background:#006241;color:#fff;font-size:34px;font-weight:800;height:72px;line-height:72px;padding:0 46px;border-radius:999px;letter-spacing:1px;text-align:center}"
     +".igc-name{font-size:92px;font-weight:800;line-height:1.08;margin-top:22px;letter-spacing:-3px}"
     +".igc-liner{font-size:35px;color:#3d423a;margin-top:22px;font-weight:600;line-height:1.5;padding:0 22px}"
     +".igc-chips{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}.igc-chip{position:relative;background:#FBFAF6;border:2px solid #E7E2D6;border-radius:22px;padding:22px 18px 20px}.igc-tag{position:absolute;right:16px;top:16px;font-size:20px;font-weight:800;color:#006241;background:#E3EFE9;border-radius:999px;padding:4px 12px}.igc-tag.low{color:#A75A3F;background:#F3E4DC}"
     +".igc-dot{width:16px;height:16px;border-radius:50%;display:inline-block;vertical-align:middle}.igc-ck{font-size:23px;font-weight:700;color:#4b5148;margin-left:8px;vertical-align:middle}.igc-cv{font-size:44px;font-weight:800;margin-top:8px;line-height:1.1}"
     +".igc-mini{background:#FBFAF6;border:2px solid #E7E2D6;border-radius:26px;padding:28px 46px 38px 56px;margin-top:26px;position:relative}.igc-mini .mb{position:absolute;left:22px;top:22px;bottom:22px;width:12px;border-radius:999px}.igc-mtxt{font-size:43px;font-weight:700;line-height:1.35}"
     +".igc-growth{font-size:34px;line-height:1.56;color:#20241f;margin-top:28px;font-weight:500}.igc-gp+.igc-gp{margin-top:34px}.igc-growth.tight{font-size:31px;line-height:1.5}.igc-growth.tight .igc-gp+.igc-gp{margin-top:26px}.igc-growth b{font-weight:800;color:#006241}"
     +".igc-sim{display:flex;gap:26px;align-items:center;background:#FBFAF6;border:2px solid #E7E2D6;border-radius:26px;padding:36px 42px;margin-top:24px}.igc-flag{flex:none;width:88px;height:88px;border-radius:50%;background:#E3EFE9;color:#006241;font-size:26px;font-weight:800;display:flex;align-items:center;justify-content:center}.igc-simn{font-size:44px;font-weight:800;line-height:1.15}.igc-simt{font-size:26px;color:#8a9089;font-weight:600;margin-top:8px;line-height:1.42}.igc-simt b{color:#006241;font-weight:800}"
     +".igc-tbar{width:132px;height:12px;border-radius:999px;background:#006241;margin-top:18px}"
     +".igc-note{font-size:24px;color:#8a9089;margin-top:28px;font-weight:500}"
     +".igc-ev{font-size:33px!important;font-weight:600!important;line-height:1.42!important}.igc-ans{display:inline-block;margin:6px 0 0 2px;font-size:23px;font-weight:800;color:#a75a3f;background:#F6E8E1;border-radius:999px;padding:3px 14px;line-height:1.3;vertical-align:middle}.igc-gsub{font-size:29px;font-weight:800;color:#006241;margin-top:40px}.igc-gtask{font-size:36px;font-weight:700;line-height:1.5;margin-top:16px;background:#E3EFE9;border-radius:26px;padding:30px 36px;color:#20241f}.igc-mdesc{font-size:27px;color:#4b5148;line-height:1.5;margin-top:10px;font-weight:500}";
    document.head.appendChild(s);
  }
  function igBold(t){ var p=t.split("'"),o='',c=0,q; for(q=0;q<p.length;q++){ if(q%2===1&&c<8&&p[q].length>=2&&p[q].length<=42){ o+="'<b>"+p[q]+"</b>'"; c++; } else if(q%2===1){ o+="'"+p[q]+"'"; } else o+=p[q]; } return o; }
  function igLines(t){ var f=window.__sbaHexdLinesHtml; return f ? f(t,24) : t.replace(/([.!?])\s+(?=\S)/g,'$1<br>'); }
  function igSplit(t,max){ var re=/[.!?]\s+/g,parts=[],last=0,m,ch=[],cu='',i; while((m=re.exec(t))){ parts.push(t.slice(last,m.index+1)); last=m.index+m[0].length; } if(last<t.length)parts.push(t.slice(last)); for(i=0;i<parts.length;i++){ var s=(parts[i]||'').trim(); if(!s)continue; if(cu&&(cu.length+s.length)>max){ ch.push(cu.trim()); cu=s; } else cu+=(cu?' ':'')+s; } if(cu.trim())ch.push(cu.trim()); return ch; }
  function igText(el){ if(!el) return ''; var c=el.cloneNode(true); [].forEach.call(c.querySelectorAll('br'),function(x){ x.parentNode.replaceChild(document.createTextNode(' '),x); }); [].forEach.call(c.querySelectorAll('.ln,p,li,div,h5'),function(x){ x.appendChild(document.createTextNode(' ')); }); return (c.textContent||'').replace(/\s+/g,' ').trim(); }
  function igRead(){
    var q=function(s){ return document.querySelector('.hexd '+s); };
    var AXC={'자기관리':'#10B981','생산관리':'#F59E0B','목표관리':'#6366F1','관계관리':'#EC4899','판매관리':'#EF4444','재무관리':'#1E3A8A'};
    var scores=[]; document.querySelectorAll('.hexd .hexd-row').forEach(function(c){
      var f=c.querySelector('.hexd-score-fill'); var lb=igText(c.querySelector('.hexd-score-label'));
      var tg=c.querySelector('.v em'); scores.push({label:lb,v:parseInt(igText(c.querySelector('.hexd-score-val')),10)||0,color:AXC[lb]||(f&&(f.style.background||f.style.backgroundColor))||'#006241',tag:tg?igText(tg):'',tagCls:tg&&tg.className||''});
    });
    var st=[],wk=[]; document.querySelectorAll('.hexd #swWrap .hexd-st-it').forEach(function(it){ st.push({t:igText(it.querySelector('h5')),d:igText(it.querySelector('p'))}); });
    var sims=[]; document.querySelectorAll('.hexd #similarWrap .hexd-pp').forEach(function(p){ var fg=igText(p.querySelector('.flag')); var nm=igText(p.querySelector('.hexd-person-name'))||igText(p).replace(fg,'').trim(); var co=igText(p.querySelector('.hexd-person-co')); sims.push({flag:fg,name:nm,co:co}); });
    sims.forEach(function(o,ix){ o.kr = o.flag ? (o.flag.indexOf('🇰🇷')>-1) : (ix>=sims.length/2); });
    var img=q('#charImg');
    var gapEl=q('#gapWrap'), gap=null;
    if(gapEl && gapEl.style.display!=='none'){ var ev=[]; gapEl.querySelectorAll('.hexd-gap-ev li').forEach(function(li){ var bb=li.querySelector('b'); var a=bb?igText(bb):''; var c=li.cloneNode(true); var cb=c.querySelector('b'); if(cb) cb.remove(); ev.push({t:igText(c),a:a}); }); gap={axis:igText(gapEl.querySelector('.hexd-gap-axis .nm')),score:igText(gapEl.querySelector('.hexd-gap-axis .sc')),ev:ev,task:igText(gapEl.querySelector('.hexd-gap-task'))}; }
    var rcodeEl=q('#r-rcode b');
    var gEl=q('.hexd-growth-body'); var growthParas=gEl?[].map.call(gEl.querySelectorAll('p'),function(p){ return p.innerHTML.replace(/<br\s*\/?>/g,' ').replace(/<\/?span[^>]*>/g,' ').replace(/\s+/g,' ').trim(); }).filter(Boolean):[];
    return {growthParas:growthParas,rcode:rcodeEl?igText(rcodeEl):'',gap:gap,axisNote:igText(q('#r-axisnote')),code:igText(q('#r-code')),name:igText(q('#r-name')),liner:igText(q('#r-liner')),charSrc:img?img.src:'',scores:scores,st:st,wk:wk,sims:sims,growth:(function(){ var g=q('.hexd-growth-body'); if(!g) return ''; var ps=g.querySelectorAll('p'); var arr=ps.length?[].map.call(ps,function(p){ return (p.innerText||p.textContent||'').replace(/\s+/g,' ').trim(); }):[(g.innerText||g.textContent||'').replace(/\s+/g,' ').trim()]; return arr.join(' '); })()};
  }
  function igRadar(cv,scores){
    var ctx=cv.getContext('2d'),W=640,H=600,cx=W/2,cy=H/2,R=195,N=scores.length||6;
    function a(k){ return Math.PI*2*k/N-Math.PI/2; }
    [0.25,0.5,0.75,1].forEach(function(f){ ctx.beginPath(); scores.forEach(function(_,k){ var an=a(k),x=cx+R*f*Math.cos(an),y=cy+R*f*Math.sin(an); k?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.closePath(); ctx.strokeStyle='rgba(0,0,0,.10)'; ctx.lineWidth=2; ctx.stroke(); });
    scores.forEach(function(_,k){ var an=a(k); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+R*Math.cos(an),cy+R*Math.sin(an)); ctx.strokeStyle='rgba(0,0,0,.10)'; ctx.lineWidth=2; ctx.stroke(); });
    ctx.beginPath(); scores.forEach(function(o,k){ var f=o.v/100,an=a(k),x=cx+R*f*Math.cos(an),y=cy+R*f*Math.sin(an); k?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.closePath(); ctx.fillStyle='rgba(0,98,65,.20)'; ctx.fill(); ctx.strokeStyle='#006241'; ctx.lineWidth=5; ctx.stroke();
    scores.forEach(function(o,k){ var f=o.v/100,an=a(k); ctx.beginPath(); ctx.arc(cx+R*f*Math.cos(an),cy+R*f*Math.sin(an),9,0,7); ctx.fillStyle='#006241'; ctx.fill(); });
    ctx.font='800 30px Pretendard,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    scores.forEach(function(o,k){ var an=a(k),x=cx+(R+50)*Math.cos(an),y=cy+(R+50)*Math.sin(an); ctx.fillStyle='#374151'; ctx.fillText((o.label||'').slice(0,2),x,y-14); ctx.fillStyle=o.color; ctx.fillText(o.v,x,y+22); });
  }
  function igPill(cv,code){
    var f='800 34px Pretendard,"Apple SD Gothic Neo",sans-serif';
    var ctx=cv.getContext('2d'); ctx.font=f;
    var tw=Math.ceil(ctx.measureText(code).width);
    var h=76, w=Math.max(tw+96,150);
    cv.width=w; cv.height=h; cv.style.width=w+'px'; cv.style.height=h+'px'; cv.style.display='block'; cv.style.marginLeft='auto'; cv.style.marginRight='auto';
    ctx=cv.getContext('2d');
    ctx.fillStyle='#006241';
    ctx.beginPath();
    ctx.arc(h/2,h/2,h/2,Math.PI*0.5,Math.PI*1.5);
    ctx.lineTo(w-h/2,0);
    ctx.arc(w-h/2,h/2,h/2,Math.PI*1.5,Math.PI*0.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=f;
    ctx.fillText(code,w/2,h/2+2);
  }
  function igEl(html){ var d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }
  var IG_ACH=window.__sbaHexdAch||{};
  function igCards(d){
    var list=[{t:'cover'},{t:'radar'}];
    if(d.st.length) list.push({t:'sw',head:(d.code==='MASTER'?'마스터의 강점':'이 유형의 강점'),sub:'당신의 무기가 되는 강점',items:d.st,bar:'#006241'});
    if(d.gap&&d.gap.axis) list.push({t:'gap'});
    if(d.wk.length) list.push({t:'sw',head:'보완할 점',sub:'약점이 아니라, 다음 성장 포인트',items:d.wk,bar:'#C8A864'});
    if(d.sims.length) list.push({t:'sim'});
    if(d.growthParas&&d.growthParas.length){ var packs=[],cur=[],ln=0; function cntL(pk){ var n=0; pk.forEach(function(h,j){ n+=(h.match(/<br>/g)||[]).length+1+(j?0.65:0); }); return n; } d.growthParas.forEach(function(pg){ var h=igLines(igBold(pg)); var L=(h.match(/<br>/g)||[]).length+1+(cur.length?0.65:0); if(cur.length&&ln+L>16.5){ packs.push(cur); cur=[]; ln=L-0.65; } else { ln+=L; } cur.push(h); }); if(cur.length) packs.push(cur); var tightLast=false; if(packs.length>1){ var la=packs[packs.length-1], pv=packs[packs.length-2]; if(cntL(la)<=5 && cntL(pv)+cntL(la)+0.65<=19){ packs.pop(); packs[packs.length-1]=pv.concat(la); tightLast=true; } } packs.forEach(function(pk,i){ list.push({t:'growth',paras:pk,tight:(tightLast&&i===packs.length-1),part:packs.length>1?'('+(i+1)+'/'+packs.length+')':''}); }); }
    var TOTAL=list.length;
    function brand(p){ return '<div class="igc-brand"><span><b>사업가 유형 테스트</b></span><span>'+p+' / '+TOTAL+'</span></div>'; }
    function foot(){ return '<div class="igc-foot"><span><b>@스몰브랜드설계자</b></span><span>유형 : '+(d.name||'')+'</span></div>'; }
    return list.map(function(card,ix){
      var p=ix+1,h;
      if(card.t==='cover'){ var im=d.charSrc?'<img src="'+d.charSrc+'" crossorigin="anonymous" alt="">':'🧑‍💼'; h='<div class="igc-card"><div class="igc-hex" style="right:-160px;top:-140px"></div><div class="igc-hex" style="left:-180px;bottom:-160px;opacity:.32"></div><div class="igc-pad">'+brand(p)+'<div style="text-align:center"><div class="igc-kick">나의 사업가 유형은?</div><div class="igc-char">'+im+'</div>'+(d.code?'<canvas data-pill style="display:block;margin:14px auto 0"></canvas>':'')+'<div class="igc-name">'+d.name+'</div><div class="igc-liner">'+(d.liner||'').replace(/, /,',<br>')+'</div></div></div>'+foot()+'</div>'; }
      else if(card.t==='radar'){ var chips=d.scores.map(function(a){return '<div class="igc-chip"><span class="igc-dot" style="background:'+a.color+'"></span><span class="igc-ck">'+a.label+'</span>'+(a.tag?'<span class="igc-tag '+a.tagCls+'">'+a.tag+'</span>':'')+'<div class="igc-cv" style="color:'+a.color+'">'+a.v+'</div></div>';}).join(''); h='<div class="igc-card"><div class="igc-pad">'+brand(p)+'<div class="igc-title">나의 경영 육각형</div><div class="igc-tbar"></div><div class="igc-sub">6가지 사장 역량을 한눈에</div><canvas data-radar width="1000" height="548" style="display:block;width:912px;height:500px;margin:14px auto 16px;border-radius:28px"></canvas><div class="igc-chips">'+chips+'</div></div>'+foot()+'</div>'; }
      else if(card.t==='gap'){ var evs=d.gap.ev.map(function(t){ var o=(typeof t==='string')?{t:t,a:''}:t; return '<div class="igc-mini"><div class="mb" style="background:#cc785c"></div><div class="igc-mtxt igc-ev">'+igLines(o.t)+(o.a?'<span class="igc-ans">'+o.a+'</span>':'')+'</div></div>';}).join(''); h='<div class="igc-card"><div class="igc-hex" style="right:-160px;top:-140px;opacity:.5"></div><div class="igc-pad">'+brand(p)+'<div class="igc-title">'+(d.code==='MASTER'?'그래도 한 곳을 고른다면':'먼저 살펴볼 곳')+'</div><div class="igc-tbar" style="background:#cc785c"></div><div class="igc-sub"><b style="color:#20241f">'+d.gap.axis+'</b> · '+d.gap.score+' · 이렇게 답하셨어요</div>'+evs+'<div class="igc-gsub">이번 두 주에 해 볼 만한 것</div><div class="igc-gtask">'+igLines(d.gap.task)+'</div></div>'+foot()+'</div>'; }
      else if(card.t==='sw'){ var its=card.items.map(function(t){ var o=(typeof t==='string')?{t:t,d:''}:t; return '<div class="igc-mini"><div class="mb" style="background:'+card.bar+'"></div><div class="igc-mtxt">'+o.t+'</div>'+(o.d?'<div class="igc-mdesc">'+igLines(o.d)+'</div>':'')+'</div>';}).join(''); h='<div class="igc-card"><div class="igc-hex" style="right:-160px;top:-140px;opacity:.5"></div><div class="igc-hex" style="left:-180px;bottom:-160px;opacity:.32"></div><div class="igc-pad">'+brand(p)+'<div class="igc-title">'+card.head+'</div><div class="igc-tbar" style="background:'+card.bar+'"></div><div class="igc-sub">'+card.sub+'</div>'+its+'</div>'+foot()+'</div>'; }
      else if(card.t==='sim'){ var ppl=d.sims.map(function(s){var ach=IG_ACH[s.name]||'비슷한 강점을 가진 경영자';var co=s.co?('<b>'+s.co+'</b> · '):'';var rg=s.kr?'국내':'해외'; return '<div class="igc-sim"><div class="igc-flag">'+rg+'</div><div><div class="igc-simn">'+s.name+'</div><div class="igc-simt">'+co+ach+'</div></div></div>';}).join(''); h='<div class="igc-card"><div class="igc-pad">'+brand(p)+'<div class="igc-title">당신과 닮은 사업가</div><div class="igc-tbar"></div><div class="igc-sub">비슷한 강점을 가진 실존 사업가예요</div>'+ppl+'<div class="igc-note">* \'강점이 닮았다\'는 참고용이에요(약점을 단정하지 않습니다).</div></div>'+foot()+'</div>'; }
      else { h='<div class="igc-card"><div class="igc-pad">'+brand(p)+'<div class="igc-title">성장 방향<span class="p">'+card.part+'</span></div><div class="igc-tbar"></div><div class="igc-sub">지금부터 이렇게 해보세요</div><div class="igc-growth'+(card.tight?' tight':'')+'">'+card.paras.map(function(x){ return '<div class="igc-gp">'+x+'</div>'; }).join('')+'</div></div>'+foot()+'</div>'; }
      return igEl(h);
    });
  }
  function igDownAll(blobs,code,done){ var i=0; (function d(){ if(i>=blobs.length){ if(done){ done(); } else { toast(blobs.length+'장을 저장했어요!'); } return; } downloadBlob(blobs[i],igFileName(i+1,blobs.length)); i++; setTimeout(d,650); })(); }
  function igShare(blobs,code){
    var files=[],i; for(i=0;i<blobs.length;i++){ try{ files.push(new File([blobs[i]],igFileName(i+1,blobs.length),{type:'image/png'})); }catch(e){} }
    if(files.length&&navigator.canShare&&navigator.canShare({files:files})&&navigator.share){ navigator.share({files:files,title:'사업가 유형 테스트 결과'}).then(function(){toast('공유했어요!');}).catch(function(){ igDownAll(blobs,code); }); }
    else { igDownAll(blobs,code); }
  }
  // 결과 저장/공유/인스타 → 1080×1350 카드 여러 장 (mode: save | share | insta)
  function igMob(){ return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent||''); }
  function igIOS(){ return /iPhone|iPad|iPod/i.test(navigator.userAgent||'') || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1); }
  // 파일명: {로그인 이름 또는 '사장님'}_{날짜}_사장님 유형 진단_{n}of{총}.png
  function igSafeName(s){ return String(s||'').replace(/[\\\/:*?"<>|\r\n\t]+/g,' ').replace(/\s+/g,' ').trim().slice(0,30); }
  function igUserName(){ return igSafeName(window.__sbaHexdUser)||'사장님'; }
  function igDate(){ var d=new Date(); function p(n){ return (n<10?'0':'')+n; } return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }
  function igFileName(i,n){ return igUserName()+'_'+igDate()+'_사장님 유형 진단_'+i+'of'+n+'.png'; }
  // 저장: 아이폰·아이패드는 파일 다운로드가 사진 앱으로 가지 않으므로 공유 창(이미지 저장)으로, 그 외는 바로 내려받기
  function igSave(blobs,code){
    if(igIOS()){
      var files=[],i; for(i=0;i<blobs.length;i++){ try{ files.push(new File([blobs[i]],igFileName(i+1,blobs.length),{type:'image/png'})); }catch(e){} }
      if(files.length&&navigator.canShare&&navigator.canShare({files:files})&&navigator.share){
        toast('공유 창에서 「이미지 저장」을 눌러 주세요');
        navigator.share({files:files,title:'사장님 유형 진단'}).then(function(){ toast('저장했어요!'); }).catch(function(){ igDownAll(blobs,code); });
        return;
      }
    }
    igDownAll(blobs,code);
  }
  function igFonts(cb){ var done=0; function go(){ if(!done){ done=1; cb(); } } try{ if(document.fonts&&document.fonts.ready){ try{ document.fonts.load('800 43px Pretendard'); document.fonts.load('700 26px Pretendard'); }catch(e){} document.fonts.ready.then(go,go); setTimeout(go,1500); } else { go(); } }catch(e){ go(); } }
  function igCapture(mode){
    if(mode==='insta'&&!igMob()){ try{ window.open('https://www.instagram.com/','_blank'); }catch(e){} }
    igStyle(); toast(mode==='share'?'공유할 카드를 만들고 있어요…':mode==='insta'?'인스타 카드를 만들고 있어요…':'결과 카드를 만들고 있어요…');
    igFonts(function(){ loadH2C(function(err){
      if(err||!window.html2canvas){ toast('잠시 후 다시 시도해 주세요.'); return; }
      var d=igRead(); if(!d.name){ toast('결과를 먼저 확인해 주세요.'); return; }
      var cards=igCards(d);
      var stage=document.createElement('div'); stage.style.cssText='position:fixed;left:-99999px;top:0;z-index:-1';
      cards.forEach(function(c){ stage.appendChild(c); }); document.body.appendChild(stage);
      cards.forEach(function(c){ var rc=c.querySelector('canvas[data-radar]'); if(rc){ var bp=window.__sbaHexdBlueprint; if(!(bp&&bp.drawStatic(rc,1000,548))) igRadar(rc,d.scores); } var pc=c.querySelector('canvas[data-pill]'); if(pc) igPill(pc,d.code||''); });
      var blobs=[],i=0,code=d.code||'결과';
      function finish(){
        stage.remove();
        if(mode==='save'){ igSave(blobs,code); return; }
        if(mode==='insta'){
          if(igMob()){ toast('공유 창에서 Instagram을 선택해 주세요'); igShare(blobs,code); }
          else { igDownAll(blobs,code,function(){ toast('저장 완료! 인스타그램 탭에서 올려주세요.'); }); }
          return;
        }
        igShare(blobs,code);
      }
      (function next(){
        if(i>=cards.length){ finish(); return; }
        toast((mode==='share'?'공유할 카드':mode==='insta'?'인스타 카드':'결과 카드')+' '+(i+1)+'/'+cards.length+' 만드는 중…');
        window.html2canvas(cards[i],{width:1080,height:1350,scale:1,backgroundColor:null,useCORS:true,logging:false}).then(function(cv){
          cv.toBlob(function(b){ if(b) blobs.push(b); i++; next(); },'image/png');
        }).catch(function(){ stage.remove(); toast('잠시 후 다시 시도해 주세요.'); });
      })();
    }); });
  }
  // 링크 복사 → 사업가 유형 테스트 페이지 URL
  function copyTestLink(){
    var url=testLink();
    function ok(){ toast('사업가 유형 테스트 링크를 복사했어요!'); }
    function fb(){ try{ var ta=document.createElement('textarea'); ta.value=url; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); ta.remove(); ok(); }catch(e){ toast('복사에 실패했어요.'); } }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(url).then(ok).catch(fb); } else { fb(); }
  }
  document.addEventListener('click',function(e){
    var t=e.target; if(!t||!t.closest) return;
    if(t.closest('#shImg')){ e.preventDefault(); e.stopImmediatePropagation(); igCapture('save'); return; }
    if(t.closest('#shLink')){ e.preventDefault(); e.stopImmediatePropagation(); copyTestLink(); return; }
    if(t.closest('#shSys')){ e.preventDefault(); e.stopImmediatePropagation(); igCapture('share'); return; }
    if(t.closest('#shInsta')){ e.preventDefault(); e.stopImmediatePropagation(); igCapture('insta'); return; }
  },true);

  // 성장방향: 문장·단락 단위 줄내림(모바일/PC 적응) + 핵심 인용구 굵게(최대 5)
  function gIsMobile(){ return (window.innerWidth||document.documentElement.clientWidth||9999)<=600; }
  function gBalance(s,mob){
    if(!mob||s.length<=34) return s;
    if(s.indexOf("'")>-1||s.indexOf('"')>-1) return s;
    var idxs=[],p=s.indexOf(', ');
    while(p>-1){ idxs.push(p); p=s.indexOf(', ',p+1); }
    if(!idxs.length) return s;
    var mid=s.length/2,best=idxs[0],bd=Math.abs(idxs[0]-mid),k;
    for(k=1;k<idxs.length;k++){ var d=Math.abs(idxs[k]-mid); if(d<bd){ bd=d; best=idxs[k]; } }
    var left=s.slice(0,best+1),right=s.slice(best+2);
    if(left.length<12||right.length<12) return s;
    return left+'<br>'+right;
  }
  function enhanceGrowth(){
    var gb=document.querySelector('.hexd .hexd-growth-body');
    if(!gb||gb.getAttribute('data-enh')) return;
    var raw=(gb.textContent||'').trim();
    if(raw.length<20) return;
    while(raw.indexOf('  ')>-1){ raw=raw.split('  ').join(' '); }
    gb.setAttribute('data-enh','1');
    var mob=gIsMobile();
    var chunks=raw.split('. '),sents=[],ci;
    for(ci=0;ci<chunks.length;ci++){ var c=chunks[ci]; if(!c) continue; if(ci<chunks.length-1) c=c+'.'; sents.push(c); }
    var OPEN=['첫 번째','두 번째','세 번째','네 번째','다섯 번째','여섯 번째','일곱 번째','첫째','둘째','셋째','넷째','다섯째','여섯째','마지막으로','끝으로','먼저','우선','다음으로','또한','또 ','그리고'];
    function isOpen(s){ for(var k=0;k<OPEN.length;k++){ if(s.indexOf(OPEN[k])===0) return true; } return false; }
    var hasOpen=false,i;
    for(i=0;i<sents.length;i++){ if(isOpen(sents[i])){ hasOpen=true; break; } }
    var paras=[],cur=[];
    for(i=0;i<sents.length;i++){
      var s=sents[i],startNew=false;
      if(hasOpen){ if(isOpen(s)&&cur.length) startNew=true; }
      else { if(cur.length>=2) startNew=true; }
      if(startNew){ paras.push(cur); cur=[]; }
      cur.push(s);
    }
    if(cur.length) paras.push(cur);
    var pHtml=[],pi;
    for(pi=0;pi<paras.length;pi++){
      var arr=paras[pi],lines=[],j;
      for(j=0;j<arr.length;j++){ lines.push(gBalance(arr[j],mob)); }
      pHtml.push(lines.join('<br>'));
    }
    var html=pHtml.join('<br><br>');
    var parts=html.split("'"),out='',cc=0,q;
    for(q=0;q<parts.length;q++){
      if(q%2===1 && cc<5 && parts[q].length>=2 && parts[q].length<=42 && parts[q].indexOf('<br>')===-1){ out+="'<b>"+parts[q]+"</b>'"; cc++; }
      else if(q%2===1){ out+="'"+parts[q]+"'"; }
      else { out+=parts[q]; }
    }
    gb.innerHTML=out;
  }
  // 점수 카드: 한글 라벨 아래 영문(첫 글자 녹색·굵게)
  function enhanceScores(){
    var EN={'자기관리':'Self','생산관리':'Production','목표관리':'Goal','관계관리':'Relation','판매관리':'Marketing','재무관리':'Finance'};
    var ls=document.querySelectorAll('.hexd .hexd-score-label'),i;
    for(i=0;i<ls.length;i++){
      var el=ls[i]; if(el.getAttribute('data-en')) continue;
      var ko=(el.textContent||'').trim(),en=EN[ko];
      if(!en) continue;
      el.setAttribute('data-en','1');
      var d=document.createElement('div'); d.className='hexd-score-en';
      d.innerHTML='<b>'+en.charAt(0)+'</b>'+en.slice(1);
      el.parentNode.insertBefore(d,el.nextSibling);
    }
  }
  // 레이더: 고해상도(devicePixelRatio) 재렌더 — 모바일 흐릿함 해결
  // 문항: '맞춤 변형' 배지를 척도 라벨(전혀~매우) 가운데로 이동
  function enhanceQ(){
    var qbs=document.querySelectorAll('.hexd .hexd-q-block'),i;
    for(i=0;i<qbs.length;i++){
      var qb=qbs[i]; if(qb.getAttribute('data-enq')) continue;
      var sl=qb.querySelector('.hexd-scale-labels'); if(!sl) continue;
      qb.setAttribute('data-enq','1');
      var bg=qb.querySelector('.hexd-q-top .hexd-badge'); if(!bg) continue;
      bg.classList.add('in-scale');
      var sp=sl.children;
      if(sp.length>=2){ sl.insertBefore(bg,sp[1]); } else { sl.appendChild(bg); }
    }
  }
  // 공유바: Threads를 아래줄로 + 왼쪽에 인스타그램 추가
  function enhanceShare(){
    var sb=document.querySelector('.hexd .hexd-share-btns');
    if(!sb||sb.getAttribute('data-sh')) return;
    var th=document.getElementById('shThreads'); if(!th) return;
    sb.setAttribute('data-sh','1');
    var spacer=document.createElement('div'); spacer.style.cssText='flex-basis:100%;height:0';
    sb.insertBefore(spacer,th);
    if(!document.getElementById('shInsta')){
      var ig=document.createElement('button'); ig.id='shInsta'; ig.type='button'; ig.className='hexd-share-btn';
      ig.innerHTML='📷 인스타그램';
      ig.onclick=function(){ igCapture('insta'); };
      sb.insertBefore(ig,th);
    }
    var hint=document.querySelector('.hexd .hexd-share-hint');
    if(hint){ hint.innerHTML='결과 이미지 저장 = 내 기기에 바로 저장 · 공유하기 = 카카오톡 등으로 보내기<br>인스타그램 = 카드 준비 후 인스타그램으로 연결돼요.'; }
  }
  // 결과 캐릭터: 투명배경 PNG로 교체(@8cef259)  // 후기 게시판: 진단 전(s-intro)·후(s-result)만 노출, 진단 중(s-pre·s-ax-*)엔 숨김
  function enhanceReviewBoard(){
    var bb=document.querySelector('[data-block-id="6a3220721cfd844d4bfb8d5b"]');
    if(!bb) return;
    var sec=bb.closest('section'); if(!sec) return;
    var show=true;
    var hexd=document.querySelector('.hexd');
    if(hexd){
      var active=hexd.querySelector('.hexd-screen.active');
      if(active){ var id=active.id||''; show=(id==='s-intro'||id==='s-result'); }
    }
    var want=show?'':'none';
    if(sec.style.display!==want) sec.style.display=want;
    // 진단 화면 전환 감지용 스코프 옵저버(.hexd 한정, 1회 부착)
    if(hexd && !hexd.__rbw){ hexd.__rbw=1; try{ var bo=new MutationObserver(enhanceReviewBoard); bo.observe(hexd,{attributes:true,subtree:true,attributeFilter:['class']}); }catch(e){} }
  }
  // 진단을 끝까지 마친(stage='result') 사용자는 재방문 시 결과 화면 자동 표시(이어하기 배너 자동 클릭)
  function enhanceAutoResult(){
    if(window.__sbaAutoResult) return;
    var save=null; try{ save=JSON.parse(localStorage.getItem('sba_hexd_save_v2')||'null'); }catch(e){}
    if(!save || save.stage!=='result') return;
    var btn=document.querySelector('.hexd #resumeBtn');
    if(!btn) return;
    window.__sbaAutoResult=1;
    btn.click();
  }
  function runAll(){ enhanceQ(); enhanceReviewBoard(); enhanceAutoResult(); }
  var mo=new MutationObserver(runAll);
  try{ mo.observe(document.body,{childList:true,subtree:true}); }catch(e){}
  setTimeout(runAll,600);
  setTimeout(runAll,2000);
})();

/* ══ 효과음 (테마 body 에서 이동) ══ */
(function(){
  if(window.__hexdSfx) return; window.__hexdSfx=1;
  var BASE='https://fastly.jsdelivr.net/gh/kjgqppr9-cmyk/sba-site@s1029a/sfx/';
  var FILES=['01_do_C4.wav','02_re_D4.wav','03_mi_E4.wav','04_fa_F4.wav','05_sol_G4.wav','06_la_A4.wav','07_si_B4.wav'];
  var pool={};
  function mk(i){ var a=new Audio(BASE+FILES[i-1]); a.preload='auto'; a.volume=0.5; return a; }
  function play(i){ if(i<1||i>7) return; try{ var a=pool[i]; if(!a){ a=mk(i); pool[i]=a; } try{ a.currentTime=0; }catch(_){} var p=a.play(); if(p&&p.catch){ p.catch(function(){}); } }catch(e){} }
  function preload(){ for(var k=1;k<=7;k++){ if(!pool[k]) pool[k]=mk(k); } }
  if('requestIdleCallback' in window){ requestIdleCallback(preload); } else { setTimeout(preload,1500); }
  document.addEventListener('click',function(e){
    var t=e.target; if(!t||!t.closest) return;
    var sb=t.closest('.hexd-scale-btn');
    if(sb){ var ne=sb.querySelector('.num'); var n=ne?parseInt((ne.textContent||'').trim(),10):0; play(n); return; }
    var nx=t.closest('.hexd-next-btn, .hexd-pre-btn.primary');
    if(nx){ var blocked=nx.disabled||nx.getAttribute('aria-disabled')==='true'||(nx.classList.contains('hexd-next-btn')&&!nx.classList.contains('ready')); if(!blocked) play(4); return; }
    /* v5.1: 시작·이어하기 = 솔, 선택지 = 미, 이전·처음부터·건너뛰기 = 레, 결과 화면 버튼 = 파 */
    if(t.closest('.hexd #startBtn, .hexd #resumeBtn, .hexd .hexd-resume-go')){ play(5); return; }
    var op=t.closest('.hexd .hexd-opt');
    if(op){ var k=['data-opt','data-extra','data-sub'].find(function(n){ return op.hasAttribute(n); }); if(k) window.__hxPop=[k, op.getAttribute(k)]; play(3); return; }
    if(t.closest('.hexd .hexd-pre-btn.ghost, .hexd .hexd-prev-btn, .hexd .hexd-resume-new, .hexd #concern-skip')){ play(2); return; }
    if(t.closest('.hexd .hexd-cta, .hexd .hexd-cta2, .hexd .hexd-chipb')){ play(4); return; }
  },true);
})();
