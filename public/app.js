/* ============================================================================
 *  البوابة الداخلية  |  Internal Portal
 *  app.js — واجهة المستخدم بالكامل (بلا مكتبات خارجية)
 *  ---------------------------------------------------------------------------
 *  الترتيب:
 *    1) الترجمة والأدوات        5) الصفحات
 *    2) الرسوم والإنفوغرافيك    6) التحرير (إضافة/تعديل/حذف)
 *    3) تحميل البيانات والدمج   7) المتحكم
 *    4) لافتة المصدر
 * ==========================================================================*/


/* ════════════════════════════════════════════════════════════════════════
 *  1) الترجمة والأدوات
 * ════════════════════════════════════════════════════════════════════════ */

/* حالة التشغيل تُمرَّر من index.php عبر window.BOOT */
const BOOT = window.BOOT || {user:"",csrf:"",canEdit:false,sources:{},db:{},server:{}};

/* ══════════════════ الترجمة ══════════════════ */
const L={
ar:{brand:"البوابة الداخلية",brandS:"Internal Portal",
 overview:"الإحصائيات",people:"الموظفون",leave:"الإجازات السنوية",hardware:"الأجهزة",apps:"الأنظمة",depts:"الأقسام",settings:"المصادر والمزامنة",
 pick:"اختيار موظف",pickT:"اختيار موظف",searchP:"ابحث بالاسم أو الرمز…",
 statsSub:"مؤشرات مجمّعة من المصادر الثلاثة — التفاصيل داخل كل صفحة.",
 employees:"موظفون",records:"سجلات",devices:"أجهزة",apps_n:"أنظمة",depts_n:"أقسام",
 annualTot:"إجمالي أيام الإجازة",annualAvg:"متوسط الرصيد",withPrinter:"لديهم طابعة",withScanner:"لديهم سكانر",
 wExpired:"ضمان منتهٍ",wExpiring:"ضمان يقارب الانتهاء",wActive:"ضمان ساري",matched:"مطابَقون عبر الأنظمة",
 byDept:"الموظفون حسب القسم",leaveByDept:"متوسط الإجازة حسب القسم",modelMix:"موديلات الأجهزة",
 warrantyMix:"حالة الضمان",appStatus:"حالة الأنظمة",accessMix:"مستويات الصلاحية",peripherals:"الملحقات",
 topLeave:"أعلى أرصدة الإجازات",soonest:"أقرب ضمان للانتهاء",
 name:"الاسم",code:"الرمز",dept:"القسم",title:"المسمى",email:"البريد",phone:"الهاتف",access:"الصلاحية",
 status:"الحالة",annual:"الإجازة السنوية",balance:"الرصيد",hire:"تاريخ التعيين",salary:"الراتب",
 model:"موديل الجهاز",warranty:"انتهاء الضمان",wstate:"حالة الضمان",printer:"طابعة",scanner:"سكانر",
 days:"يوم",yes:"نعم",no:"لا",actions:"إجراءات",all:"الكل",clear:"مسح",export:"تصدير CSV",print:"طباعة",back:"رجوع",
 noData:"لا توجد بيانات",notFound:"غير موجود في هذا المصدر",of:"من",source:"المصدر",
 srcDb:"قاعدة البيانات",srcLive:"مباشر",srcOff:"غير متاح",
 profile:"البيانات الأساسية",fromApps:"من نظام إدارة الأنظمة",fromLeave:"من نظام الإجازات",fromHw:"من نظام الأجهزة",
 roles:"الأدوار",devs:"المطوّرون",version:"الإصدار",type:"النوع",lastUpd:"آخر تحديث",created:"تاريخ الإنشاء",
 headcount:"عدد الموظفين",appsCount:"عدد الأنظمة",avgAnnual:"متوسط الإجازة",
 active:"نشط",expired:"منتهٍ",expiring:"يقارب الانتهاء",unknown:"غير محدد",
 admin:"مدير نظام",manager:"مدير",staff:"موظف",
 syncNow:"مزامنة الآن",install:"إنشاء الجداول",test:"اختبار الاتصال",
 dbConn:"متصلة",dbOff:"غير متصلة",lastSync:"آخر مزامنة",tables:"الجداول",rows:"صف",
 hint:"البوابة تعرض بيانات هذه المصادر فقط. لا توجد أي بيانات تجريبية أو مُولَّدة.",
 adminView:"عرض المدير — جميع الموظفين",empView:"عرض موظف",viewAll:"عرض الجميع",
 currency:"د.إ",unmatched:"سجلات بلا مطابقة",matchNote:"المطابقة تتم بالاسم بين الأنظمة الثلاثة."},
en:{brand:"Internal Portal",brandS:"Internal Portal",
 overview:"Statistics",people:"Employees",leave:"Annual leave",hardware:"Hardware",apps:"Systems",depts:"Departments",settings:"Sources & sync",
 pick:"Select employee",pickT:"Select employee",searchP:"Search by name or code…",
 statsSub:"Aggregates from the three sources — details live inside each page.",
 employees:"employees",records:"records",devices:"devices",apps_n:"systems",depts_n:"departments",
 annualTot:"Total leave days",annualAvg:"Average balance",withPrinter:"With printer",withScanner:"With scanner",
 wExpired:"Warranty expired",wExpiring:"Warranty expiring",wActive:"Warranty active",matched:"Matched across systems",
 byDept:"Headcount by department",leaveByDept:"Average leave by department",modelMix:"Computer models",
 warrantyMix:"Warranty status",appStatus:"System status",accessMix:"Access levels",peripherals:"Peripherals",
 topLeave:"Highest leave balances",soonest:"Warranties expiring soonest",
 name:"Name",code:"Code",dept:"Department",title:"Job title",email:"Email",phone:"Phone",access:"Access",
 status:"Status",annual:"Annual leave",balance:"Balance",hire:"Hire date",salary:"Salary",
 model:"Computer model",warranty:"Warranty expiry",wstate:"Warranty",printer:"Printer",scanner:"Scanner",
 days:"days",yes:"Yes",no:"No",actions:"Actions",all:"All",clear:"Clear",export:"Export CSV",print:"Print",back:"Back",
 noData:"No data",notFound:"Not present in this source",of:"of",source:"Source",
 srcDb:"Database",srcLive:"Live",srcOff:"Unavailable",
 profile:"Profile",fromApps:"From Applications system",fromLeave:"From Leave system",fromHw:"From Hardware system",
 roles:"Roles",devs:"Developers",version:"Version",type:"Type",lastUpd:"Last update",created:"Created",
 headcount:"Headcount",appsCount:"Systems",avgAnnual:"Avg leave",
 active:"Active",expired:"Expired",expiring:"Expiring soon",unknown:"Unknown",
 admin:"Admin",manager:"Manager",staff:"Staff",
 syncNow:"Sync now",install:"Create tables",test:"Test connection",
 dbConn:"Connected",dbOff:"Disconnected",lastSync:"Last sync",tables:"Tables",rows:"rows",
 hint:"The portal shows only data from these sources. Nothing is generated or mocked.",
 adminView:"Admin view — all employees",empView:"Employee view",viewAll:"View all",
 currency:"AED",unmatched:"Unmatched records",matchNote:"Records are matched by name across the three systems."}};
let LANG="ar";
const t=k=>L[LANG][k] ?? L.ar[k] ?? k;

/* ══════════════════ أدوات ══════════════════ */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PAL=["var(--k1)","var(--k2)","var(--k3)","var(--k4)","var(--k5)","var(--k6)"];
const HEX=["#0d7a5f","#1a5fb4","#a8620a","#6b3fa0","#a92b34","#0f6f7a"];
const hc=s=>HEX[Math.abs(String(s).split("").reduce((a,c)=>a+c.charCodeAt(0),0))%HEX.length];
const ini=n=>String(n||"?").trim().split(/\s+/).filter(w=>w.length>1).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"?";
const nf=n=>new Intl.NumberFormat("en-US").format(Math.round(Number(n)||0));
const nf1=n=>(Math.round(Number(n)*10)/10).toLocaleString("en-US");
const df=d=>{if(!d)return "—";const x=new Date(String(d).replace(" ","T"));return isNaN(x)?String(d):x.toLocaleDateString(LANG==="ar"?"ar-AE":"en-GB",{year:"numeric",month:"short",day:"numeric"})};
const money=n=>n==null?"—":nf(n)+" "+t("currency");
const nk=s=>String(s||"").normalize("NFKC")
  .replace(/[ـً-ْ]/g,"")
  .replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي")
  .toLowerCase().replace(/\b(al|el)[\s-]?/g,"").replace(/[^\p{L}\p{N}]+/gu,"");

const TAGS={active:["t-ok","نشط","Active"],"Active":["t-ok","نشط","Active"],
 "In development":["t-bl","قيد التطوير","In development"],"On hold":["t-am","متوقف","On hold"],
 expired:["t-rs","منتهٍ","Expired"],expiring:["t-am","يقارب الانتهاء","Expiring soon"],unknown:["t-mu","غير محدد","Unknown"],
 admin:["t-vi","مدير نظام","Admin"],manager:["t-bl","مدير","Manager"],staff:["t-mu","موظف","Staff"]};
const tag=v=>{const m=TAGS[v]||["t-mu",v,v];return `<span class="tag ${m[0]}">${esc(LANG==="ar"?m[1]:m[2])}</span>`};
const yn=v=>v?`<span class="tag t-ok">${esc(t("yes"))}</span>`:`<span class="tag t-mu">${esc(t("no"))}</span>`;

function toast(m){const e=$("#toast");e.textContent=m;e.classList.add("on");clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove("on"),2200)}

/* ── رسوم ── */
function bars(rows){
  const mx=Math.max(...rows.map(r=>r.v),1);
  return rows.map((r,i)=>`<div class="br"><span class="n" title="${esc(r.n)}">${esc(r.n)}</span>
    <span class="tr"><span class="fi" style="width:${(r.v/mx*100).toFixed(1)}%;background:${r.c||PAL[i%6]};animation-delay:${(i*.045).toFixed(2)}s"></span></span>
    <span class="v">${r.f??nf(r.v)}</span></div>`).join("");
}
function donut(parts,size=150){
  const tot=parts.reduce((a,p)=>a+p.v,0)||1, R=52, C=2*Math.PI*R; let off=0;
  const segs=parts.map(p=>{const len=p.v/tot*C;
    const s=`<circle class="seg" cx="60" cy="60" r="${R}" fill="none" stroke="${p.c}" stroke-width="14"
      stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"
      transform="rotate(-90 60 60)"><title>${esc(p.n)}: ${p.v}</title></circle>`;off+=len;return s}).join("");
  return `<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
   <svg class="donut" width="${size}" height="${size}" viewBox="0 0 120 120" style="flex:0 0 auto">
    <circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--panel-3)" stroke-width="14"/>${segs}
    <text x="60" y="58" text-anchor="middle" font-size="21" font-weight="600" fill="var(--ink)" font-family="var(--fm)">${nf(tot)}</text>
    <text x="60" y="72" text-anchor="middle" font-size="8" fill="var(--ink-3)">${esc(LANG==="ar"?"الإجمالي":"total")}</text></svg>
   <div class="lg" style="flex-direction:column;gap:7px">
    ${parts.map(p=>`<span><i style="background:${p.c}"></i>${esc(p.n)} · <b class="mono">${nf(p.v)}</b>
      <span style="color:var(--ink-3)">(${Math.round(p.v/tot*100)}%)</span></span>`).join("")}</div></div>`;
}
function vbars(pts,{h=160,color="var(--k1)"}={}){
  if(!pts.length) return `<div class="empty">${esc(t("noData"))}</div>`;
  const w=560,pad=24,mx=Math.max(...pts.map(p=>p.v))||1,step=(w-pad*2)/pts.length,bw=Math.min(step*.62,54);
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none">
   ${pts.map((p,i)=>{const x=pad+i*step+(step-bw)/2,bh=Math.max(p.v/mx*(h-46),1);
     return `<rect class="bar" x="${x.toFixed(1)}" y="${(h-26-bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3"
       fill="${p.c||color}" style="animation-delay:${(i*.05).toFixed(2)}s"><title>${esc(p.n)}: ${p.v}</title></rect>
     <text x="${(pad+i*step+step/2).toFixed(1)}" y="${(h-26-bh-5).toFixed(1)}" font-size="10" font-family="var(--fm)" fill="var(--ink-2)" text-anchor="middle">${p.f??nf(p.v)}</text>`}).join("")}
   ${pts.map((p,i)=>`<text x="${(pad+i*step+step/2).toFixed(1)}" y="${h-8}" font-size="9.5" fill="var(--ink-3)" text-anchor="middle">${esc(String(p.n).length>11?String(p.n).slice(0,10)+"…":String(p.n))}</text>`).join("")}
  </svg>`;
}
function cell({k,v,s,c,i}){
  return `<div class="cell" style="--ac:${c||"var(--acc)"}">${i&&typeof ill==="function"?ill(i,44):""}
   <div class="k">${c?`<i style="background:${c}"></i>`:""}${esc(k)}</div>
   <div class="v">${esc(String(v))}</div><div class="s">${esc(s||"")}</div></div>`;
}
function table(cols,rows,opt={}){
  if(!rows.length) return `<div class="empty">${esc(t("noData"))}</div>`;
  return `<div class="tw"><table class="t"><thead><tr>${cols.map(c=>`<th${c.num?' style="text-align:end"':""}>${esc(c.h)}</th>`).join("")}</tr></thead>
   <tbody class="stg-r">${rows.map((r,i)=>`<tr class="${opt.click?"clickable":""}" style="animation-delay:${Math.min(i*.02,.5)}s"
    ${opt.click?`onclick="${opt.click}('${esc(r.__id??"")}')"`:""}>${cols.map(c=>`<td class="${c.num?"num":""}">${c.f(r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function csv(name,cols,rows){
  const l=[cols.map(c=>`"${c.h}"`).join(",")].concat(rows.map(r=>cols.map(c=>`"${String(c.r?c.r(r):"").replace(/"/g,'""')}"`).join(",")));
  const b=new Blob(["﻿"+l.join("\n")],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name+".csv";a.click();
  toast(LANG==="ar"?"تم التنزيل":"Downloaded");
}

/* ════════════════════════════════════════════════════════════════════════
 *  2) الرسوم والإنفوغرافيك
 * ════════════════════════════════════════════════════════════════════════ */

/* ══════════════════ رسومات SVG أصلية (بلا مكتبات أو صور خارجية) ══════════════════ */
const ILL = {
  people:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="15" cy="14" r="6"/><path d="M4 40a11 11 0 0 1 22 0"/>
    <circle cx="32" cy="17" r="4.6"/><path d="M28.5 27.5A8.6 8.6 0 0 1 42 35"/></g>`,
  calendar:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <rect x="5" y="9" width="36" height="32" rx="4"/><path d="M14 4v9M32 4v9M5 19h36"/>
    <rect x="12" y="25" width="7" height="6" rx="1.5"/><rect x="24" y="25" width="7" height="6" rx="1.5"/></g>`,
  laptop:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <rect x="8" y="9" width="30" height="21" rx="2.5"/><path d="M3 34h40l-3 5H6z"/><path d="M13 14h20M13 19h13"/></g>`,
  printer:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <path d="M13 17V6h20v11"/><rect x="6" y="17" width="34" height="14" rx="3"/>
    <path d="M13 26h20v14H13z"/><circle cx="34" cy="22" r="1.6"/></g>`,
  scanner:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <rect x="5" y="22" width="36" height="15" rx="3"/><path d="M11 22V9h24v13"/>
    <path d="M11 29.5h24" stroke-dasharray="3 3"/></g>`,
  shield:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <path d="M23 4 7 10v12c0 9 7 16.5 16 20 9-3.5 16-11 16-20V10z"/><path d="m16 22 5 5 10-10"/></g>`,
  grid:`<g fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="6" y="6" width="14" height="14" rx="3"/><rect x="26" y="6" width="14" height="14" rx="3"/>
    <rect x="6" y="26" width="14" height="14" rx="3"/><rect x="26" y="26" width="14" height="14" rx="3"/></g>`,
  building:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
    <path d="M6 41h34M10 41V13l13-8 13 8v28"/><path d="M18 41v-9h10v9M17 20h4M25 20h4M17 26h4M25 26h4"/></g>`,
  clock:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <circle cx="23" cy="23" r="17"/><path d="M23 12v11l7 5"/></g>`,
  db:`<g fill="none" stroke="currentColor" stroke-width="1.6">
    <ellipse cx="23" cy="10" rx="14" ry="5.5"/><path d="M9 10v13c0 3 6.3 5.5 14 5.5s14-2.5 14-5.5V10"/>
    <path d="M9 23v13c0 3 6.3 5.5 14 5.5s14-2.5 14-5.5V23"/></g>`,
  chart:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M6 40V24M16 40V12M26 40V29M36 40V18"/><path d="M4 40h38"/></g>`,
  link:`<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M20 26a8 8 0 0 0 11.3 0l5.7-5.7a8 8 0 0 0-11.3-11.3L22.5 12"/>
    <path d="M26 20a8 8 0 0 0-11.3 0L9 25.7a8 8 0 0 0 11.3 11.3L23.5 34"/></g>`
};
const ill=(k,size=46)=>`<svg class="ill" width="${size}" height="${size}" viewBox="0 0 46 46" aria-hidden="true">${ILL[k]||""}</svg>`;
const aic=(k,size=17)=>`<svg class="aic" width="${size}" height="${size}" viewBox="0 0 46 46" style="--dash:160">${ILL[k]||""}</svg>`;

/* ── حلقة قياس ── */
function gauge({v,max,label,sub,color="var(--acc)",size=112}){
  const pct=max?Math.min(v/max,1):0, R=42, C=2*Math.PI*R;
  return `<div class="gauge">
    <svg width="${size}" height="${size}" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="${R}" fill="none" stroke="var(--panel-3)" stroke-width="9"/>
      <circle class="g" cx="50" cy="50" r="${R}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"
        stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pct)).toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="47" text-anchor="middle" font-size="21" font-weight="600" font-family="var(--fm)" fill="var(--ink)">${esc(String(label))}</text>
      <text x="50" y="62" text-anchor="middle" font-size="9" fill="var(--ink-3)">${esc(sub||"")}</text>
    </svg></div>`;
}

/* ── خط زمني للضمان ── */
function warrantyTimeline(devices){
  const ds=devices.filter(d=>d.warranty_expiry).map(d=>({...d,ts:new Date(d.warranty_expiry).getTime()})).sort((a,b)=>a.ts-b.ts);
  if(!ds.length) return `<div class="empty">${esc(t("noData"))}</div>`;
  const now=Date.now(), min=Math.min(ds[0].ts,now), max=Math.max(ds[ds.length-1].ts,now), span=(max-min)||1;
  const pos=ts=>((ts-min)/span*100);
  const col=s=>s==="expired"?"var(--k5)":s==="expiring"?"var(--k3)":"var(--k1)";
  return `<div class="timeline">
    <div style="position:relative;height:26px">
      ${ds.map((d,i)=>`<div class="pin" style="inset-inline-start:${pos(d.ts).toFixed(1)}%;top:${(i%3)*-13}px"
        title="${esc(d.employee_name)} · ${esc(d.computer_model||"")}">
        ${new Date(d.ts).getFullYear()}<i style="background:${col(d.warranty_state)}"></i></div>`).join("")}
    </div>
    <div class="axis">
      <span class="seg" style="inset-inline-start:0;width:${pos(now).toFixed(1)}%;background:linear-gradient(90deg,var(--k5),var(--k3))"></span>
      <span class="seg" style="inset-inline-start:${pos(now).toFixed(1)}%;width:${(100-pos(now)).toFixed(1)}%;background:var(--k1);animation-delay:.2s"></span>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--ink-3);margin-top:7px;font-family:var(--fm)">
      <span>${new Date(min).toLocaleDateString(LANG==="ar"?"ar-AE":"en-GB",{month:"short",year:"numeric"})}</span>
      <span style="color:var(--k3)">${esc(LANG==="ar"?"اليوم":"today")}</span>
      <span>${new Date(max).toLocaleDateString(LANG==="ar"?"ar-AE":"en-GB",{month:"short",year:"numeric"})}</span>
    </div></div>`;
}

/* ── شرائح الأجهزة مع رسم لكل نوع ── */
function deviceChips(devices){
  const kinds={};
  devices.forEach(d=>{const m=(d.computer_model||"").toLowerCase();
    const k=/macbook|thinkpad|latitude|elitebook|probook|laptop/.test(m)?"laptop":"desktop";
    kinds[k]=(kinds[k]||0)+1});
  const p=devices.filter(d=>d.printer).length, sc=devices.filter(d=>d.scanner).length;
  const dv=k=>`<span class="dv" style="color:var(--ink-3)"><svg width="26" height="20" viewBox="0 0 46 46">${ILL[k]}</svg></span>`;
  return `<div class="chips">
    <span class="chip">${dv("laptop")}${esc(LANG==="ar"?"محمول":"Laptops")} <b>${nf(kinds.laptop||0)}</b></span>
    <span class="chip">${dv("grid")}${esc(LANG==="ar"?"مكتبي":"Desktops")} <b>${nf(kinds.desktop||0)}</b></span>
    <span class="chip">${dv("printer")}${esc(t("printer"))} <b>${nf(p)}</b></span>
    <span class="chip">${dv("scanner")}${esc(t("scanner"))} <b>${nf(sc)}</b></span>
    <span class="chip">${dv("shield")}${esc(t("wActive"))} <b>${nf(devices.filter(d=>d.warranty_state==="active").length)}</b></span>
  </div>`;
}

/* ── خط شرارة صغير ── */
function spark(vals,color="var(--acc)"){
  if(!vals.length) return "";
  const w=120,h=26,mx=Math.max(...vals)||1,mn=Math.min(...vals);
  const X=i=>i*(w/Math.max(vals.length-1,1)), Y=v=>h-3-((v-mn)/((mx-mn)||1))*(h-8);
  const d=vals.map((v,i)=>`${i?"L":"M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  return `<svg class="spark" width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <path class="ln" d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="ar" d="${d} L${w},${h} L0,${h} Z" fill="${color}" opacity=".12"/></svg>`;
}

/* ════════════════════════════════════════════════════════════════════════
 *  3) تحميل البيانات · الدمج · لافتة المصدر · صفحة الإحصائيات
 * ════════════════════════════════════════════════════════════════════════ */

/* ══════════════════ البيانات ══════════════════ */
const SRC=["apps","leave","hardware"];
const S={raw:{},src:{},people:[],byKey:{},page:"overview",param:null,sel:null,f:{},loading:true};

async function load(fresh){
  const res=await Promise.all(SRC.map(async k=>{
    try{const r=await fetch(`?api=${k}${fresh?"&fresh=1":""}`,{headers:{Accept:"application/json"}});
      const j=await r.json();
      return j&&j.ok&&j.data?{src:j.source,data:j.data,at:j.fetched_at}:{src:"off",data:null,err:j&&j.error};
    }catch(e){return{src:"off",data:null,err:String(e)}}}));
  S.at=S.at||{};S.err=S.err||{};
  SRC.forEach((k,i)=>{
    const r=res[i];
    if(r.data){ S.src[k]=r.src; S.raw[k]=r.data; S.at[k]=r.at; S.err[k]=null; }
    else if(S.raw[k]){ S.src[k]=S.src[k]; S.err[k]=r.err; }   // فشل مؤقت: نُبقي آخر نسخة ناجحة
    else { S.src[k]="off"; S.raw[k]=null; S.err[k]=r.err; }
  });
  build();
  S.loading=false;
}

/* دمج الأنظمة الثلاثة في سجل شخص واحد — بالمطابقة على الاسم */
function build(){
  const emps=S.raw.apps?.employees||[], ppl=S.raw.leave?.people||[], dev=S.raw.hardware?.devices||[];
  const map=new Map();
  const get=(key,seed)=>{ if(!map.has(key)) map.set(key,{key,name:null,name_ar:null,emp_code:null,department:null,
      job_title:null,email:null,account_name:null,access_level:null,status:null,last_login:null,
      annual_leave:null,leave_balance:null,salary:null,hire_date:null,phone:null,address:null,
      devices:[],apps:[],inApps:false,inLeave:false,inHw:false,...seed});
    return map.get(key)};

  emps.forEach(e=>{const k=e.name_key||nk(e.full_name);const p=get(k);
    p.inApps=true;p.name=p.name||e.full_name;p.name_ar=e.name_ar;p.emp_code=e.emp_code;
    p.department=p.department||e.department;p.job_title=p.job_title||e.job_title;p.email=p.email||e.email;
    p.account_name=e.account_name;p.access_level=e.access_level;p.status=e.status;p.last_login=e.last_login});

  ppl.forEach(x=>{const k=x.name_key||nk(x.full_name);const p=get(k);
    p.inLeave=true;p.name=p.name||x.full_name;p.leave_name=x.full_name;
    p.department=p.department||x.department;p.job_title=p.job_title||x.job_title;p.email=p.email||x.email;
    p.phone=x.phone;p.salary=x.salary;p.hire_date=x.hire_date;p.address=x.address;
    p.annual_leave=x.annual_leave;p.leave_balance=x.leave_balance;p.leave_dept=x.department;p.leave_key=x.person_key});

  dev.forEach(d=>{const k=d.name_key||nk(d.employee_name);const p=get(k);
    p.inHw=true;p.name=p.name||d.employee_name;p.hw_name=d.employee_name;
    p.department=p.department||d.department;p.hw_dept=d.department;p.devices.push(d)});

  (S.raw.apps?.applications||[]).forEach(a=>{
    (a.roles||[]).forEach(r=>{const k=nk(r.emp_name);if(!k)return;const p=map.get(k);
      if(p) p.apps.push({app:a,role:r.role_name})});
    (a.developers||[]).forEach(n=>{const k=nk(n);const p=map.get(k);
      if(p&&!p.apps.some(z=>z.app.app_code===a.app_code)) p.apps.push({app:a,role:null})});
  });

  S.people=[...map.values()].filter(p=>p.name).sort((a,b)=>String(a.name).localeCompare(String(b.name),LANG==="ar"?"ar":"en"));
  S.byKey={};S.people.forEach(p=>S.byKey[p.key]=p);
  if(!S.sel||!S.byKey[S.sel]){
    const me=S.people.find(p=>p.account_name===BOOT.user);
    S.sel=null; S.me=me?me.key:null;
  }
}

/* توزيع الأرصدة على شرائح */
function leaveBuckets(rows){
  const B=[[0,10],[10,20],[20,30],[30,45],[45,60],[60,999]];
  const lab=b=>b[1]===999?`${b[0]}+`:`${b[0]}–${b[1]}`;
  const pts=B.map((b,i)=>({n:lab(b),v:rows.filter(r=>typeof r.annual_leave==="number"&&r.annual_leave>=b[0]&&r.annual_leave<b[1]).length,c:PAL[i%6]}));
  return vbars(pts,{h:170})+`<div style="font-size:11px;color:var(--ink-3);margin-top:6px">${esc(LANG==="ar"?"عدد الموظفين في كل شريحة (أيام الإجازة السنوية)":"employees per band (annual leave days)")}</div>`;
}

function byDept0(emps){const o={};emps.forEach(e=>{if(e.department)o[e.department]=(o[e.department]||0)+1});return o}

/* ── لافتة المصدر: تُعرض أسفل كل جدول/صفحة ── */
const SRC_META={
  apps:{ar:"نظام إدارة الأنظمة والتطبيقات",en:"Applications Management system",c:"var(--k4)",tag:"A"},
  leave:{ar:"نظام الإجازات",en:"Leave system",c:"var(--k2)",tag:"L"},
  hardware:{ar:"نظام الأجهزة",en:"Hardware system",c:"var(--k6)",tag:"H"}
};
function srcCount(k){
  return k==="apps"?(S.raw.apps?.employees||[]).length
       :k==="leave"?(S.raw.leave?.people||[]).length
       :(S.raw.hardware?.devices||[]).length;
}
/** keys: مصفوفة مفاتيح المصادر · note: سطر توضيحي اختياري */
function srcFoot(keys,note){
  const t0=k=>{const a=S.at?.[k];if(!a)return "—";
    const d=new Date(a);return isNaN(d)?String(a)
      :d.toLocaleString(LANG==="ar"?"ar-AE":"en-GB",{dateStyle:"medium",timeStyle:"short"})};
  return `<div class="srcfoot">
    <div class="sf-h">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>
      <span>${esc(LANG==="ar"?"مصدر البيانات في هذه الصفحة":"Data source for this page")}</span>
    </div>
    ${keys.map(k=>{const m=SRC_META[k],u=BOOT.sources[k]?.url,s=S.src[k];
      const badge=s==="db"?`<span class="tag t-ok">${esc(t("srcDb"))}</span>`
        :s==="live"?`<span class="tag t-bl">${esc(t("srcLive"))}</span>`
        :`<span class="tag t-rs">${esc(t("srcOff"))}</span>`;
      return `<div class="sf-row">
        <span class="sf-tag" style="background:${m.c}">${m.tag}</span>
        <div class="sf-main">
          <div class="sf-nm">${esc(LANG==="ar"?m.ar:m.en)} ${badge}
            <span class="tag t-mu">${nf(srcCount(k))} ${esc(t("records"))}</span></div>
          ${u?`<a class="sf-url" href="${esc(u)}" target="_blank" rel="noopener" title="${esc(u)}">${esc(u)}</a>`
             :`<span class="sf-url" style="color:var(--ink-3)">${esc(LANG==="ar"?"غير مربوط":"not configured")}</span>`}
        </div>
        <div class="sf-meta">
          <span>${esc(LANG==="ar"?"آخر قراءة":"Fetched")}</span>
          <b>${esc(t0(k))}</b>
          <span class="sf-via">${esc(s==="db"?(LANG==="ar"?"عبر قاعدة البيانات portal_*":"via portal_* tables")
            :s==="live"?(LANG==="ar"?"قراءة مباشرة من الرابط":"read directly from the URL"):"—")}</span>
        </div>
      </div>`}).join("")}
    ${note?`<div class="sf-note">${esc(note)}</div>`:""}
  </div>`;
}

const dSrc=k=>{const s=S.src[k];
  return s==="db"?`<span class="tag t-ok">${esc(t("srcDb"))}</span>`
    :s==="live"?`<span class="tag t-bl">${esc(t("srcLive"))}</span>`
    :`<span class="tag t-rs">${esc(t("srcOff"))}</span>`};

/* ══════════════════ تصفية ══════════════════ */
const uniq=(a,k)=>[...new Set(a.map(x=>x[k]).filter(v=>v!==null&&v!==""&&v!==undefined))].sort();
function filt(rows,keys){
  const q=(S.f.q||"").trim().toLowerCase();
  return rows.filter(r=>{
    for(const k in S.f){if(k==="q"||!S.f[k])continue;if(String(r[k]??"")!==S.f[k])return false}
    if(!q)return true;
    return keys.some(k=>String(r[k]??"").toLowerCase().includes(q));
  });
}
function fbar(fields,exp){
  return `<div class="fl">
    <input type="search" placeholder="${esc(t("searchP"))}" value="${esc(S.f.q||"")}" oninput="App.f('q',this.value)">
    ${fields.map(f=>`<select onchange="App.f('${f.k}',this.value)">
      <option value="">${esc(f.l)}: ${esc(t("all"))}</option>
      ${f.o.map(o=>`<option value="${esc(o)}" ${S.f[f.k]===String(o)?"selected":""}>${esc(f.fmt?f.fmt(o):o)}</option>`).join("")}</select>`).join("")}
    <button class="btn s" onclick="App.clearF()">${esc(t("clear"))}</button>
    ${exp?`<button class="btn s sp" onclick="App.exp()">${esc(t("export"))}</button>`:""}</div>`;
}
let EXP=null;

/* ══════════════════ الصفحات ══════════════════ */

/* ── 1. الإحصائيات ── */
function vOverview(){
  const P=S.people, emps=S.raw.apps?.employees||[], apps=S.raw.apps?.applications||[],
        deps=S.raw.apps?.departments||[], lv=S.raw.leave?.people||[], hw=S.raw.hardware?.devices||[];
  const lvVals=lv.map(x=>x.annual_leave).filter(v=>typeof v==="number");
  const totLeave=lvVals.reduce((a,b)=>a+b,0);
  const avgLeave=lvVals.length?totLeave/lvVals.length:0;
  const wCount=s=>hw.filter(d=>d.warranty_state===s).length;
  const matched=P.filter(p=>[p.inApps,p.inLeave,p.inHw].filter(Boolean).length>1).length;

  const byDept={}; emps.forEach(e=>{if(e.department)byDept[e.department]=(byDept[e.department]||0)+1});
  const lvByDept={}; lv.forEach(x=>{if(x.department&&typeof x.annual_leave==="number"){
    (lvByDept[x.department]=lvByDept[x.department]||[]).push(x.annual_leave)}});
  const lvDeptRows=Object.entries(lvByDept).map(([n,a],i)=>({n,v:a.reduce((x,y)=>x+y,0)/a.length,
    f:nf1(a.reduce((x,y)=>x+y,0)/a.length),c:PAL[i%6]})).sort((a,b)=>b.v-a.v);
  const models={}; hw.forEach(d=>{const m=(d.computer_model||"—").split(" ").slice(0,2).join(" ");models[m]=(models[m]||0)+1});
  const brands={}; hw.forEach(d=>{const b=(d.computer_model||"—").split(" ")[0];brands[b]=(brands[b]||0)+1});
  const appSt={}; apps.forEach(a=>{if(a.status)appSt[a.status]=(appSt[a.status]||0)+1});
  const acc={}; emps.forEach(e=>{if(e.access_level)acc[e.access_level]=(acc[e.access_level]||0)+1});
  const topLeave=lv.filter(x=>typeof x.annual_leave==="number").sort((a,b)=>b.annual_leave-a.annual_leave).slice(0,8);
  const soon=hw.filter(d=>d.warranty_expiry).sort((a,b)=>new Date(a.warranty_expiry)-new Date(b.warranty_expiry)).slice(0,6);

  const printers=hw.filter(d=>d.printer).length, scanners=hw.filter(d=>d.scanner).length;
  return `<div class="view">
  <div class="ph"><div>
    <div class="eyebrow">${esc(t("overview"))} · ${new Date().toLocaleDateString(LANG==="ar"?"ar-AE":"en-GB",{dateStyle:"long"})}</div>
    <h1>${esc(LANG==="ar"?"نظرة عامة على المؤسسة":"Organisation overview")}</h1>
    <p>${esc(t("statsSub"))}</p></div>
    <div class="actions">${dSrc("apps")}${dSrc("leave")}${dSrc("hardware")}</div></div>

  <div class="info-hero">
    <svg class="rings" width="260" height="260" viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="var(--acc)" stroke-width="1.1">
        <circle cx="100" cy="100" r="34" opacity=".55"><animate attributeName="r" values="34;40;34" dur="7s" repeatCount="indefinite"/></circle>
        <circle cx="100" cy="100" r="56" opacity=".4"><animate attributeName="r" values="56;62;56" dur="9s" repeatCount="indefinite"/></circle>
        <circle cx="100" cy="100" r="78" opacity=".25"><animate attributeName="r" values="78;84;78" dur="11s" repeatCount="indefinite"/></circle>
        <circle cx="100" cy="100" r="96" opacity=".15"/></g>
      <g fill="var(--k2)"><circle cx="100" cy="44" r="4"><animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="18s" repeatCount="indefinite"/></circle></g>
      <g fill="var(--k3)"><circle cx="178" cy="100" r="3.4"><animateTransform attributeName="transform" type="rotate" from="0 100 100" to="-360 100 100" dur="24s" repeatCount="indefinite"/></circle></g>
    </svg>
    <h2>${esc(LANG==="ar"?"ثلاثة أنظمة · صورة واحدة":"Three systems · one picture")}</h2>
    <p>${esc(LANG==="ar"
      ?"البوابة تقرأ من ثلاثة ملفات JSON، تُطابق الأشخاص بينها بالاسم، وتخزّن النتيجة في قاعدة البيانات — وكل تعديل تجريه يبقى فوقها."
      :"The portal reads three JSON feeds, matches people across them by name, and stores the result in the database — your edits layer on top.")}</p>
    <div class="flow">
      <div class="node"><div class="ttl">${aic("grid",16)} ${esc(LANG==="ar"?"نظام الأنظمة":"Applications")}</div>
        <div class="big">${nf(emps.length)}</div><div class="sub">${esc(t("employees"))} · ${nf(apps.length)} ${esc(t("apps_n"))}</div>
        <div class="spark">${spark(Object.values(byDept0(emps)),"var(--k4)")}</div></div>
      <div class="node"><div class="ttl">${aic("calendar",16)} ${esc(LANG==="ar"?"نظام الإجازات":"Leave")}</div>
        <div class="big">${nf(lv.length)}</div><div class="sub">${esc(t("records"))} · ${nf1(avgLeave)} ${esc(t("days"))} ${esc(LANG==="ar"?"متوسط":"avg")}</div>
        <div class="spark">${spark(lv.map(x=>x.annual_leave||0),"var(--k2)")}</div></div>
      <div class="node"><div class="ttl">${aic("laptop",16)} ${esc(LANG==="ar"?"نظام الأجهزة":"Hardware")}</div>
        <div class="big">${nf(hw.length)}</div><div class="sub">${nf(printers)} ${esc(t("printer"))} · ${nf(scanners)} ${esc(t("scanner"))}</div>
        <div class="spark">${spark(hw.map(d=>d.warranty_expiry?new Date(d.warranty_expiry).getFullYear()-2025:0),"var(--k6)")}</div></div>
      <div class="node"><div class="ttl">${aic("link",16)} ${esc(t("matched"))}</div>
        <div class="big">${nf(matched)}</div><div class="sub">${esc(LANG==="ar"?"شخص في أكثر من نظام":"people in 2+ systems")}</div>
        <div class="spark">${spark(P.slice(0,24).map(p=>[p.inApps,p.inLeave,p.inHw].filter(Boolean).length),"var(--k1)")}</div></div>
    </div>
  </div>

  <div class="strip" style="margin-bottom:14px">
    ${cell({k:t("employees"),v:nf(emps.length),s:`${nf(P.length)} ${LANG==="ar"?"شخص عبر الأنظمة":"people across systems"}`,c:"var(--k1)",i:"people"})}
    ${cell({k:t("annualTot"),v:nf(totLeave),s:`${nf(lvVals.length)} ${t("records")}`,c:"var(--k2)",i:"calendar"})}
    ${cell({k:t("annualAvg"),v:nf1(avgLeave),s:t("days"),c:"var(--k3)",i:"clock"})}
    ${cell({k:t("devices"),v:nf(hw.length),s:`${nf(Object.keys(brands).length)} ${LANG==="ar"?"علامة":"brands"}`,c:"var(--k4)",i:"laptop"})}
    ${cell({k:t("wExpired"),v:nf(wCount("expired")),s:`${nf(wCount("expiring"))} ${t("expiring")}`,c:"var(--k5)",i:"shield"})}
    ${cell({k:t("apps_n"),v:nf(apps.length),s:`${nf(deps.length)} ${t("depts_n")}`,c:"var(--k6)",i:"grid"})}
  </div>

  <div class="strip" style="margin-bottom:16px">
    ${cell({k:t("withPrinter"),v:nf(hw.filter(d=>d.printer).length),s:`${nf(hw.length)} ${t("of")} ${t("devices")}`})}
    ${cell({k:t("withScanner"),v:nf(hw.filter(d=>d.scanner).length),s:`${nf(hw.length)} ${t("of")} ${t("devices")}`})}
    ${cell({k:t("wActive"),v:nf(wCount("active")),s:t("warranty")})}
    ${cell({k:t("matched"),v:nf(matched),s:t("matchNote")})}
  </div>

  <div class="grid g2 stg">
    <div class="panel hv span2"><header><h3>${esc(t("leaveByDept"))}</h3><span class="lbl">${esc(t("fromLeave"))}</span>
      <span class="r">${dSrc("leave")}</span></header>
      <div class="pb">${vbars(lvDeptRows.slice(0,8).map((r,i)=>({...r,c:PAL[i%6]})),{color:"var(--k2)"})}</div></div>

    <div class="panel hv"><header><h3>${esc(t("byDept"))}</h3><span class="lbl">${esc(t("fromApps"))}</span></header>
      <div class="pb">${bars(Object.entries(byDept).sort((a,b)=>b[1]-a[1]).map(([n,v],i)=>({n,v,c:PAL[i%6]})))||`<div class="empty">${esc(t("noData"))}</div>`}</div></div>

    <div class="panel hv"><header><h3>${esc(t("warrantyMix"))}</h3><span class="lbl">${esc(t("fromHw"))}</span></header>
      <div class="pb">${donut([["active","var(--k1)"],["expiring","var(--k3)"],["expired","var(--k5)"],["unknown","var(--ink-3)"]]
        .map(([s,c])=>({n:t(s),v:wCount(s),c})).filter(x=>x.v))}
        <div style="margin-top:14px">${deviceChips(hw)}</div></div></div>

    <div class="panel hv span2"><header><h3>${esc(LANG==="ar"?"خط زمني لانتهاء الضمانات":"Warranty expiry timeline")}</h3>
      <span class="lbl">${esc(t("fromHw"))}</span></header>
      <div class="pb">${warrantyTimeline(hw)}</div></div>

    <div class="panel hv"><header><h3>${esc(LANG==="ar"?"مؤشرات التغطية":"Coverage")}</h3></header>
      <div class="pb"><div class="gauges">
        ${gauge({v:printers,max:hw.length||1,label:hw.length?Math.round(printers/hw.length*100)+"%":"—",sub:t("printer"),color:"var(--k2)"})}
        ${gauge({v:scanners,max:hw.length||1,label:hw.length?Math.round(scanners/hw.length*100)+"%":"—",sub:t("scanner"),color:"var(--k6)"})}
        ${gauge({v:wCount("active"),max:hw.length||1,label:hw.length?Math.round(wCount("active")/hw.length*100)+"%":"—",sub:t("wActive"),color:"var(--k1)"})}
        ${gauge({v:matched,max:P.length||1,label:P.length?Math.round(matched/P.length*100)+"%":"—",sub:t("matched"),color:"var(--k4)"})}
      </div></div></div>

    <div class="panel hv"><header><h3>${esc(t("modelMix"))}</h3><span class="lbl">${esc(t("fromHw"))}</span></header>
      <div class="pb">${bars(Object.entries(models).sort((a,b)=>b[1]-a[1]).map(([n,v],i)=>({n,v,c:PAL[i%6]})))||`<div class="empty">${esc(t("noData"))}</div>`}</div></div>

    <div class="panel hv"><header><h3>${esc(t("appStatus"))}</h3><span class="lbl">${esc(t("fromApps"))}</span></header>
      <div class="pb">${donut(Object.entries(appSt).map(([n,v],i)=>({n:(TAGS[n]?(LANG==="ar"?TAGS[n][1]:TAGS[n][2]):n),v,c:HEX[i%6]})))}</div></div>

    <div class="panel hv"><header><h3>${esc(t("accessMix"))}</h3><span class="lbl">${esc(t("fromApps"))}</span></header>
      <div class="pb">${donut(Object.entries(acc).map(([n,v],i)=>({n:t(n)||n,v,c:HEX[i%6]})))}</div></div>

    <div class="panel hv"><header><h3>${esc(t("topLeave"))}</h3>
      <span class="r"><button class="btn s" onclick="App.go('leave')">${esc(LANG==="ar"?"الكل":"All")}</button></span></header>
      ${table([
        {h:t("name"),f:r=>`<div class="pr"><span class="ava s" style="background:${hc(r.full_name)}">${esc(ini(r.full_name))}</span>
          <span><b>${esc(r.full_name)}</b><small>${esc(r.department||"—")}</small></span></div>`},
        {h:t("annual"),num:1,f:r=>`<b class="mono">${nf(r.annual_leave)}</b> <span style="color:var(--ink-3);font-size:11px">${esc(t("days"))}</span>`}],
        topLeave.map(r=>({...r,__id:nk(r.full_name)})),{click:"App.person"})}</div>

    <div class="panel hv"><header><h3>${esc(t("soonest"))}</h3>
      <span class="r"><button class="btn s" onclick="App.go('hardware')">${esc(LANG==="ar"?"الكل":"All")}</button></span></header>
      ${table([
        {h:t("name"),f:r=>`<div class="pr"><span class="ava s" style="background:${hc(r.employee_name)}">${esc(ini(r.employee_name))}</span>
          <span><b>${esc(r.employee_name)}</b><small>${esc(r.computer_model||"—")}</small></span></div>`},
        {h:t("warranty"),f:r=>`${df(r.warranty_expiry)}<br>${tag(r.warranty_state)}`}],
        soon.map(r=>({...r,__id:nk(r.employee_name)})),{click:"App.person"})}</div>
  </div>
  ${srcFoot(["apps","leave","hardware"], LANG==="ar"
    ?"كل مؤشر في هذه الصفحة محسوب من أحد هذه المصادر — واسم المصدر مكتوب أعلى كل بطاقة."
    :"Every figure on this page is computed from one of these sources — each card names its own.")}
  </div>`;
}

/* ════════════════════════════════════════════════════════════════════════
 *  4) الصفحات: الموظفون · الموظف · الإجازات · الأجهزة
 * ════════════════════════════════════════════════════════════════════════ */

/* ── 2. الموظفون (عرض المدير: الكل) ── */
function vPeople(){
  const rows=filt(S.people.map(p=>({...p,__id:p.key,
    _srcCount:[p.inApps,p.inLeave,p.inHw].filter(Boolean).length})),["name","name_ar","emp_code","email","job_title","department"]);
  const cols=[
    {h:t("name"),f:r=>`<div class="pr"><span class="ava" style="background:${hc(r.key)}">${esc(ini(r.name))}</span>
      <span><b>${esc(LANG==="ar"&&r.name_ar?r.name_ar:r.name)}</b><small>${esc(r.job_title||r.email||"—")}</small></span></div>`,r:r=>r.name},
    {h:t("code"),f:r=>r.emp_code?`<span class="mono-s">${esc(r.emp_code)}</span>`:"—",r:r=>r.emp_code},
    {h:t("dept"),f:r=>esc(r.department||"—"),r:r=>r.department},
    {h:t("annual"),num:1,f:r=>r.annual_leave!=null?`<b class="mono">${nf(r.annual_leave)}</b>`:'<span style="color:var(--ink-3)">—</span>',r:r=>r.annual_leave},
    {h:t("model"),f:r=>r.devices.length?esc(r.devices[0].computer_model||"—"):'<span style="color:var(--ink-3)">—</span>',r:r=>r.devices[0]?.computer_model},
    {h:t("wstate"),f:r=>r.devices.length?tag(r.devices[0].warranty_state):"—",r:r=>r.devices[0]?.warranty_state},
    {h:t("apps_n"),num:1,f:r=>r.apps.length?`<span class="mono">${r.apps.length}</span>`:'<span style="color:var(--ink-3)">0</span>',r:r=>r.apps.length},
    {h:t("source"),f:r=>`<span style="display:flex;gap:3px">
      <span class="tag ${r.inApps?"t-vi":"t-mu"}" title="Applications">A</span>
      <span class="tag ${r.inLeave?"t-bl":"t-mu"}" title="Leave">L</span>
      <span class="tag ${r.inHw?"t-te":"t-mu"}" title="Hardware">H</span></span>`,r:r=>[r.inApps?"A":"",r.inLeave?"L":"",r.inHw?"H":""].join("")},
    {h:t("actions"),f:r=>r.emp_code?editBtns("employees",r.emp_code,r):""}];
  EXP={n:"employees",cols,rows};
  return `<div class="view">
  <div class="ph"><div><div class="eyebrow">${esc(t("adminView"))}</div>
    <h1>${esc(t("people"))}</h1><p>${nf(rows.length)} ${t("of")} ${nf(S.people.length)} · ${esc(t("matchNote"))}</p></div>
    <div class="actions">${dSrc("apps")}${dSrc("leave")}${dSrc("hardware")}</div></div>
  ${editBar("employees")}
  ${fbar([{k:"department",l:t("dept"),o:uniq(S.people,"department")},
          {k:"access_level",l:t("access"),o:uniq(S.people,"access_level"),fmt:v=>t(v)||v}],1)}
  <div class="panel list">${table(cols,rows,{click:"App.person"})}</div>
  ${srcFoot(["apps","leave","hardware"], LANG==="ar"
    ?"هذا الجدول يدمج الأشخاص من المصادر الثلاثة بالمطابقة على الاسم. الأعمدة: الاسم والرمز والقسم من نظام الأنظمة · الإجازة السنوية من نظام الإجازات · الموديل والضمان من نظام الأجهزة."
    :"This table merges people from the three sources by name. Columns: name, code and department from the Applications system · annual leave from the Leave system · model and warranty from the Hardware system.")}
  </div>`;
}

/* ── 3. صفحة الموظف التفصيلية ── */
function vPerson(){
  const p=S.byKey[S.param];
  if(!p) return `<div class="view"><div class="panel"><div class="empty">${esc(t("noData"))}</div></div></div>`;
  const d=p.devices[0]||null;
  const lvPct=p.annual_leave!=null?Math.min(p.annual_leave/Math.max(...S.people.map(x=>x.annual_leave||0),1)*100,100):0;

  return `<div class="view">
  <div class="ph"><div>
    <div class="eyebrow"><span onclick="App.go('people')" style="cursor:pointer;color:var(--acc)">${esc(t("people"))}</span> › ${esc(p.emp_code||p.name)}</div>
    <div style="display:flex;align-items:center;gap:14px;margin-top:4px">
      <span class="ava l" style="background:${hc(p.key)}">${esc(ini(p.name))}</span>
      <span><h1>${esc(LANG==="ar"&&p.name_ar?p.name_ar:p.name)}</h1>
      <p>${esc(p.job_title||"—")}${p.department?" · "+esc(p.department):""}</p>
      <div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap">
        ${p.emp_code?`<span class="tag t-mu mono">${esc(p.emp_code)}</span>`:""}
        ${p.access_level?tag(p.access_level):""}${p.status?tag(p.status):""}
      </div></span></div></div>
    <div class="actions">
      ${p.email?`<a class="btn" href="mailto:${esc(p.email)}">${esc(t("email"))}</a>`:""}
      <button class="btn" onclick="window.print()">${esc(t("print"))}</button>
      <button class="btn p" onclick="App.openPicker()">${esc(t("pick"))}</button></div></div>

  <div class="strip" style="margin-bottom:16px">
    ${cell({k:t("annual"),v:p.annual_leave!=null?nf(p.annual_leave):"—",s:t("days"),c:"var(--k2)"})}
    ${cell({k:t("balance"),v:p.leave_balance!=null?nf(p.leave_balance):"—",s:t("days"),c:"var(--k1)"})}
    ${cell({k:t("devices"),v:nf(p.devices.length),s:d?(d.computer_model||"—"):t("notFound"),c:"var(--k4)"})}
    ${cell({k:t("wstate"),v:d?(LANG==="ar"?(TAGS[d.warranty_state]?.[1]||"—"):(TAGS[d.warranty_state]?.[2]||"—")):"—",s:d?df(d.warranty_expiry):"",c:"var(--k5)"})}
    ${cell({k:t("apps_n"),v:nf(p.apps.length),s:t("roles"),c:"var(--k6)"})}
  </div>

  <div class="grid g2 stg">
    <div class="panel"><header><h3>${esc(t("profile"))}</h3>
      <span class="r">${p.inApps?`<span class="tag t-vi">A</span>`:""}${p.inLeave?`<span class="tag t-bl">L</span>`:""}${p.inHw?`<span class="tag t-te">H</span>`:""}
      ${canEdit()&&p.emp_code?`<button class="btn s" onclick="App.edit('employees','${esc(p.emp_code)}')">${esc(LANG==="ar"?"تعديل":"Edit")}</button>`:""}</span></header>
      <div class="pb"><dl class="kv">
        <dt>${esc(t("name"))}</dt><dd>${esc(p.name)}${p.name_ar?` · ${esc(p.name_ar)}`:""}</dd>
        ${p.emp_code?`<dt>${esc(t("code"))}</dt><dd class="mono">${esc(p.emp_code)}</dd>`:""}
        <dt>${esc(t("dept"))}</dt><dd>${esc(p.department||"—")}</dd>
        <dt>${esc(t("title"))}</dt><dd>${esc(p.job_title||"—")}</dd>
        <dt>${esc(t("email"))}</dt><dd>${esc(p.email||"—")}</dd>
        ${p.phone?`<dt>${esc(t("phone"))}</dt><dd class="mono">${esc(p.phone)}</dd>`:""}
        ${p.hire_date?`<dt>${esc(t("hire"))}</dt><dd>${df(p.hire_date)}</dd>`:""}
        ${p.salary!=null?`<dt>${esc(t("salary"))}</dt><dd class="mono">${esc(money(p.salary))}</dd>`:""}
        ${p.address?`<dt>${esc(LANG==="ar"?"العنوان":"Address")}</dt><dd>${esc(p.address)}</dd>`:""}
        ${p.account_name?`<dt>${esc(LANG==="ar"?"الحساب":"Account")}</dt><dd class="mono">${esc(p.account_name)}</dd>`:""}
        ${p.access_level?`<dt>${esc(t("access"))}</dt><dd>${tag(p.access_level)}</dd>`:""}
        ${p.last_login?`<dt>${esc(LANG==="ar"?"آخر دخول":"Last login")}</dt><dd>${df(p.last_login)}</dd>`:""}
      </dl></div></div>

    <div class="panel"><header><h3>${esc(t("leave"))}</h3><span class="lbl">${esc(t("fromLeave"))}</span>
      <span class="r">${dSrc("leave")}${canEdit()?(p.inLeave&&p.leave_key
        ?`<button class="btn s" onclick="App.edit('leave','${esc(p.leave_key)}')">${esc(LANG==="ar"?"تعديل":"Edit")}</button>`
        :`<button class="btn s p" onclick="App.addFor('leave','${esc(p.key)}')">${esc(LANG==="ar"?"إضافة":"Add")}</button>`):""}</span></header>
      <div class="pb">${p.inLeave?`
        <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:12px">
          <span class="mono" style="font-size:38px;font-weight:600;letter-spacing:-.04em">${nf(p.annual_leave??0)}</span>
          <span style="color:var(--ink-3);font-size:13px">${esc(t("days"))} · ${esc(t("annual"))}</span></div>
        <div class="meter" style="margin-bottom:14px"><i style="width:${lvPct.toFixed(0)}%;background:var(--k2)"></i></div>
        <dl class="kv">
          <dt>${esc(t("balance"))}</dt><dd class="mono">${p.leave_balance!=null?nf(p.leave_balance)+" "+t("days"):"—"}</dd>
          <dt>${esc(t("dept"))}</dt><dd>${esc(p.leave_dept||"—")}</dd>
          ${p.hire_date?`<dt>${esc(t("hire"))}</dt><dd>${df(p.hire_date)}</dd>`:""}
        </dl>`:`<div class="empty">${esc(t("notFound"))}</div>`}</div></div>

    <div class="panel"><header><h3>${esc(t("hardware"))}</h3><span class="lbl">${esc(t("fromHw"))}</span>
      <span class="r">${dSrc("hardware")}${canEdit()?(d&&d.item_key
        ?`<button class="btn s" onclick="App.edit('hardware','${esc(d.item_key)}')">${esc(LANG==="ar"?"تعديل":"Edit")}</button>`
        :`<button class="btn s p" onclick="App.addFor('hardware','${esc(p.key)}')">${esc(LANG==="ar"?"إضافة":"Add")}</button>`):""}</span></header>
      ${p.devices.length?table([
        {h:t("model"),f:r=>`<b>${esc(r.computer_model||"—")}</b>`},
        {h:t("warranty"),f:r=>`${df(r.warranty_expiry)} ${tag(r.warranty_state)}`},
        {h:t("printer"),f:r=>yn(r.printer)},
        {h:t("scanner"),f:r=>yn(r.scanner)}],p.devices):`<div class="empty">${esc(t("notFound"))}</div>`}</div>

    <div class="panel"><header><h3>${esc(t("apps"))}</h3><span class="lbl">${esc(t("fromApps"))}</span></header>
      ${p.apps.length?table([
        {h:t("apps"),f:r=>`<div class="pr"><span class="ava s" style="background:${hc(r.app.app_code)}">${esc(ini(r.app.app_name))}</span>
          <span><b>${esc(r.app.app_name)}</b><small class="mono">${esc(r.app.app_code)} · v${esc(r.app.version||"—")}</small></span></div>`},
        {h:t("roles"),f:r=>r.role?`<span class="tag t-vi">${esc(r.role)}</span>`:`<span class="tag t-mu">${esc(t("devs"))}</span>`},
        {h:t("status"),f:r=>tag(r.app.status)}],
        p.apps.map(r=>({...r,__id:r.app.app_code})),{click:"App.app"}):`<div class="empty">${esc(t("notFound"))}</div>`}</div>
  </div>
  ${srcFoot(["apps","leave","hardware"], LANG==="ar"
    ?"كل بطاقة أعلاه مأخوذة من مصدرها المكتوب في عنوانها. ما لا يوجد في مصدره يظهر «غير موجود في هذا المصدر»."
    :"Each card above comes from the source named in its header. What a source does not hold shows as “Not present in this source”.")}
  </div>`;
}

/* ── 4. الإجازات السنوية ── */
function vLeave(){
  const ppl=S.raw.leave?.people||[];
  const rows=filt(ppl.map(x=>({...x,__id:x.name_key||nk(x.full_name)})),["full_name","email","department","job_title"]);
  const vals=rows.map(r=>r.annual_leave).filter(v=>typeof v==="number");
  const cols=[
    {h:t("name"),f:r=>`<div class="pr"><span class="ava" style="background:${hc(r.full_name)}">${esc(ini(r.full_name))}</span>
      <span><b>${esc(r.full_name)}</b><small>${esc(r.email||"—")}</small></span></div>`,r:r=>r.full_name},
    {h:t("dept"),f:r=>esc(r.department||"—"),r:r=>r.department},
    {h:t("title"),f:r=>esc(r.job_title||"—"),r:r=>r.job_title},
    {h:t("hire"),f:r=>df(r.hire_date),r:r=>r.hire_date},
    {h:t("annual"),num:1,f:r=>r.annual_leave!=null
      ?`<div style="display:flex;align-items:center;gap:9px;justify-content:flex-end">
         <span class="meter" style="width:56px"><i style="width:${Math.min(r.annual_leave/Math.max(...vals,1)*100,100).toFixed(0)}%;background:var(--k2)"></i></span>
         <b class="mono">${nf(r.annual_leave)}</b></div>`
      :'<span style="color:var(--ink-3)">—</span>',r:r=>r.annual_leave},
    {h:t("balance"),num:1,f:r=>r.leave_balance!=null?`<span class="mono">${nf(r.leave_balance)}</span>`:'<span style="color:var(--ink-3)">—</span>',r:r=>r.leave_balance},
    {h:t("actions"),f:r=>editBtns("leave",r.person_key,r)}];
  EXP={n:"annual_leave",cols,rows};
  const byDept={}; rows.forEach(r=>{if(r.department&&typeof r.annual_leave==="number")(byDept[r.department]=byDept[r.department]||[]).push(r.annual_leave)});
  return `<div class="view">
  <div class="ph"><div><div class="eyebrow">${esc(t("fromLeave"))}</div>
    <h1>${esc(t("leave"))}</h1><p>${nf(rows.length)} ${t("of")} ${nf(ppl.length)} ${t("records")}</p></div>
    <div class="actions">${dSrc("leave")}</div></div>

  <div class="strip" style="margin-bottom:14px">
    ${cell({k:t("records"),v:nf(ppl.length),s:t("employees"),c:"var(--k1)"})}
    ${cell({k:t("annualTot"),v:nf(vals.reduce((a,b)=>a+b,0)),s:t("days"),c:"var(--k2)"})}
    ${cell({k:t("annualAvg"),v:vals.length?nf1(vals.reduce((a,b)=>a+b,0)/vals.length):"—",s:t("days"),c:"var(--k3)"})}
    ${cell({k:LANG==="ar"?"أعلى رصيد":"Highest",v:vals.length?nf(Math.max(...vals)):"—",s:t("days"),c:"var(--k4)"})}
    ${cell({k:LANG==="ar"?"أقل رصيد":"Lowest",v:vals.length?nf(Math.min(...vals)):"—",s:t("days"),c:"var(--k5)"})}
  </div>

  <div class="grid g2" style="margin-bottom:16px">
    <div class="panel hv"><header><h3>${esc(LANG==="ar"?"توزيع الأرصدة":"Balance distribution")}</h3></header>
      <div class="pb">${leaveBuckets(rows)}</div></div>
    <div class="panel hv"><header><h3>${esc(LANG==="ar"?"مؤشرات":"Indicators")}</h3></header>
      <div class="pb"><div class="gauges">
        ${gauge({v:vals.filter(v=>v>=30).length,max:vals.length||1,label:nf(vals.filter(v=>v>=30).length),sub:LANG==="ar"?"٣٠ يوماً فأكثر":"30+ days",color:"var(--k1)"})}
        ${gauge({v:vals.filter(v=>v<15).length,max:vals.length||1,label:nf(vals.filter(v=>v<15).length),sub:LANG==="ar"?"أقل من ١٥":"under 15",color:"var(--k5)"})}
        ${gauge({v:vals.length,max:S.people.length||1,label:nf(vals.length),sub:LANG==="ar"?"سجلات برصيد":"with balance",color:"var(--k2)"})}
      </div></div></div>
  </div>
  <div class="panel hv" style="margin-bottom:16px"><header><h3>${esc(t("leaveByDept"))}</h3></header>
    <div class="pb">${bars(Object.entries(byDept).map(([n,a],i)=>({n,v:a.reduce((x,y)=>x+y,0)/a.length,
      f:nf1(a.reduce((x,y)=>x+y,0)/a.length),c:PAL[i%6]})).sort((a,b)=>b.v-a.v))||`<div class="empty">${esc(t("noData"))}</div>`}</div></div>

  ${editBar("leave")}
  ${fbar([{k:"department",l:t("dept"),o:uniq(ppl,"department")}],1)}
  <div class="panel list">${table(cols,rows,{click:"App.person"})}</div>
  ${srcFoot(["leave"], LANG==="ar"
    ?"الـ API يرجع سجلات مكرّرة لكل شخص؛ البوابة تُبقي سجلاً واحداً لكل بريد إلكتروني (الأحدث الذي يحمل رصيد إجازة)."
    :"The API returns duplicate rows per person; the portal keeps one record per email address (the newest one carrying a leave balance).")}
  </div>`;
}

/* ── 5. الأجهزة ── */
function vHardware(){
  const dev=S.raw.hardware?.devices||[];
  const rows=filt(dev.map(d=>({...d,__id:d.name_key||nk(d.employee_name),
    brand:(d.computer_model||"—").split(" ")[0],
    printer_s:d.printer?"1":"0",scanner_s:d.scanner?"1":"0"})),["employee_name","computer_model","department"]);
  const cols=[
    {h:t("name"),f:r=>`<div class="pr"><span class="ava" style="background:${hc(r.employee_name)}">${esc(ini(r.employee_name))}</span>
      <span><b>${esc(r.employee_name)}</b><small>${esc(r.department||"—")}</small></span></div>`,r:r=>r.employee_name},
    {h:t("model"),f:r=>`<b>${esc(r.computer_model||"—")}</b>`,r:r=>r.computer_model},
    {h:t("warranty"),f:r=>df(r.warranty_expiry),r:r=>r.warranty_expiry},
    {h:t("wstate"),f:r=>tag(r.warranty_state),r:r=>r.warranty_state},
    {h:t("printer"),f:r=>yn(r.printer),r:r=>r.printer?"Yes":"No"},
    {h:t("scanner"),f:r=>yn(r.scanner),r:r=>r.scanner?"Yes":"No"},
    {h:t("actions"),f:r=>editBtns("hardware",r.item_key,r)}];
  EXP={n:"hardware",cols,rows};
  const brands={};dev.forEach(d=>{const b=(d.computer_model||"—").split(" ")[0];brands[b]=(brands[b]||0)+1});
  const byDept={};dev.forEach(d=>{if(d.department)byDept[d.department]=(byDept[d.department]||0)+1});
  const wc=s=>dev.filter(d=>d.warranty_state===s).length;
  return `<div class="view">
  <div class="ph"><div><div class="eyebrow">${esc(t("fromHw"))}</div>
    <h1>${esc(t("hardware"))}</h1><p>${nf(rows.length)} ${t("of")} ${nf(dev.length)} ${t("devices")}</p></div>
    <div class="actions">${dSrc("hardware")}</div></div>

  <div class="strip" style="margin-bottom:14px">
    ${cell({k:t("devices"),v:nf(dev.length),s:`${Object.keys(brands).length} ${LANG==="ar"?"علامة":"brands"}`,c:"var(--k1)"})}
    ${cell({k:t("wActive"),v:nf(wc("active")),s:t("warranty"),c:"var(--k1)"})}
    ${cell({k:t("wExpiring"),v:nf(wc("expiring")),s:"≤ 90 "+t("days"),c:"var(--k3)"})}
    ${cell({k:t("wExpired"),v:nf(wc("expired")),s:t("warranty"),c:"var(--k5)"})}
    ${cell({k:t("withPrinter"),v:nf(dev.filter(d=>d.printer).length),s:t("printer"),c:"var(--k2)"})}
    ${cell({k:t("withScanner"),v:nf(dev.filter(d=>d.scanner).length),s:t("scanner"),c:"var(--k6)"})}
  </div>

  <div class="grid g2 stg" style="margin-bottom:16px">
    <div class="panel hv"><header><h3>${esc(LANG==="ar"?"العلامات التجارية":"Brands")}</h3></header>
      <div class="pb">${donut(Object.entries(brands).map(([n,v],i)=>({n,v,c:HEX[i%6]})))}</div></div>
    <div class="panel hv"><header><h3>${esc(LANG==="ar"?"الأجهزة حسب القسم":"Devices by department")}</h3></header>
      <div class="pb">${bars(Object.entries(byDept).sort((a,b)=>b[1]-a[1]).map(([n,v],i)=>({n,v,c:PAL[i%6]})))||`<div class="empty">${esc(t("noData"))}</div>`}</div></div>
    <div class="panel hv span2"><header><h3>${esc(LANG==="ar"?"خط زمني لانتهاء الضمانات":"Warranty expiry timeline")}</h3></header>
      <div class="pb">${warrantyTimeline(dev)}<div style="margin-top:16px">${deviceChips(dev)}</div></div></div>
  </div>

  ${editBar("hardware")}
  ${fbar([{k:"department",l:t("dept"),o:uniq(dev,"department")},
          {k:"warranty_state",l:t("wstate"),o:uniq(dev,"warranty_state"),fmt:v=>t(v)||v},
          {k:"brand",l:LANG==="ar"?"العلامة":"Brand",o:[...new Set(dev.map(d=>(d.computer_model||"—").split(" ")[0]))].sort()},
          {k:"printer_s",l:t("printer"),o:["1","0"],fmt:v=>v==="1"?t("yes"):t("no")},
          {k:"scanner_s",l:t("scanner"),o:["1","0"],fmt:v=>v==="1"?t("yes"):t("no")}],1)}
  <div class="panel list">${table(cols,rows,{click:"App.person"})}</div>
  ${srcFoot(["hardware"], LANG==="ar"
    ?"حالة الضمان محسوبة من تاريخ الانتهاء القادم من الـ API: منتهٍ · يقارب الانتهاء (٩٠ يوماً أو أقل) · ساري."
    :"Warranty status is derived from the expiry date returned by the API: expired · expiring (90 days or less) · active.")}
  </div>`;
}

/* ════════════════════════════════════════════════════════════════════════
 *  5) الصفحات: الأنظمة · الأقسام · المصادر والمزامنة
 * ════════════════════════════════════════════════════════════════════════ */

/* ── 6. الأنظمة ── */
function vApps(){
  const apps=S.raw.apps?.applications||[];
  const rows=filt(apps,["app_name","app_code","description","app_type"]);
  return `<div class="view">
  <div class="ph"><div><div class="eyebrow">${esc(t("fromApps"))}</div>
    <h1>${esc(t("apps"))}</h1><p>${nf(rows.length)} ${t("of")} ${nf(apps.length)} ${t("apps_n")}</p></div>
    <div class="actions">${dSrc("apps")}</div></div>
  ${editBar("applications")}
  ${fbar([{k:"status",l:t("status"),o:uniq(apps,"status")},{k:"app_type",l:t("type"),o:uniq(apps,"app_type")}])}
  <div class="grid g3 stg">
  ${rows.map(a=>`<div class="panel hv" style="cursor:pointer" onclick="App.app('${esc(a.app_code)}')">
    <div class="pb">
      <div style="display:flex;gap:11px;align-items:flex-start;margin-bottom:11px">
        <span class="ava" style="background:${hc(a.app_code)}">${esc(ini(a.app_name))}</span>
        <span style="flex:1;min-width:0"><b style="font-size:14px;display:block">${esc(a.app_name)}</b>
          <span class="mono-s">${esc(a.app_code)} · v${esc(a.version||"—")}</span></span>${tag(a.status)}</div>
      <p style="margin:0 0 12px;font-size:12.5px;color:var(--ink-2);min-height:34px">${esc(a.description||"—")}</p>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:11px">
        <span class="tag t-mu">${esc(a.app_type||"—")}</span>
        <span class="tag t-bl">${(a.roles||[]).length} ${esc(t("roles"))}</span>
        <span class="tag t-te">${(a.developers||[]).length} ${esc(t("devs"))}</span></div>
      <div style="display:flex;align-items:center">
        ${(a.developers||[]).slice(0,5).map((d,j)=>`<span class="ava s" title="${esc(d)}"
          style="background:${hc(d)};border:2px solid var(--panel);margin-inline-start:${j?"-7px":"0"}">${esc(ini(d))}</span>`).join("")}
        <span class="mono-s" style="margin-inline-start:auto">${esc(t("lastUpd"))} ${df(a.last_update)}</span>
        ${canEdit()?`<span class="rowact always" style="margin-inline-start:8px">${editBtns("applications",a.app_code,a).replace('<div class="rowact" onclick="event.stopPropagation()">','<span onclick="event.stopPropagation()" style="display:flex;gap:5px">').replace(/<\/div>$/,'</span>')}</span>`:""}</div>
    </div></div>`).join("")||`<div class="panel"><div class="empty">${esc(t("noData"))}</div></div>`}
  </div>
  ${srcFoot(["apps"], LANG==="ar"
    ?"الأنظمة وأدوارها ومطوّروها تُقرأ من مصفوفة applications في هذا الـ API."
    :"Systems, their roles and developers are read from the applications array in this API.")}
  </div>`;
}

/* ── 7. تفاصيل نظام ── */
function vApp(){
  const a=(S.raw.apps?.applications||[]).find(x=>x.app_code===S.param);
  if(!a) return `<div class="view"><div class="panel"><div class="empty">${esc(t("noData"))}</div></div></div>`;
  const devs=(a.developers||[]).map(n=>({name:n,key:nk(n),p:S.byKey[nk(n)]}));
  return `<div class="view">
  <div class="ph"><div>
    <div class="eyebrow"><span onclick="App.go('apps')" style="cursor:pointer;color:var(--acc)">${esc(t("apps"))}</span> › ${esc(a.app_code)}</div>
    <div style="display:flex;align-items:center;gap:14px;margin-top:4px">
      <span class="ava l" style="background:${hc(a.app_code)}">${esc(ini(a.app_name))}</span>
      <span><h1>${esc(a.app_name)}</h1><p>${esc(a.description||"—")}</p>
      <div style="display:flex;gap:6px;margin-top:7px;flex-wrap:wrap">${tag(a.status)}
        <span class="tag t-mu">v${esc(a.version||"—")}</span><span class="tag t-bl">${esc(a.app_type||"—")}</span></div></span></div></div>
    <div class="actions">${canEdit()?`<button class="btn" onclick="App.edit('applications','${esc(a.app_code)}')">${esc(LANG==="ar"?"تعديل":"Edit")}</button>`:""}
      ${a.app_url?`<a class="btn p" href="${esc(a.app_url)}" target="_blank" rel="noopener">${esc(LANG==="ar"?"فتح النظام":"Open system")}</a>`:""}</div></div>

  <div class="strip" style="margin-bottom:16px">
    ${cell({k:t("roles"),v:nf((a.roles||[]).length),s:"",c:"var(--k2)"})}
    ${cell({k:t("devs"),v:nf((a.developers||[]).length),s:"",c:"var(--k4)"})}
    ${cell({k:t("created"),v:df(a.date_created),s:""})}
    ${cell({k:t("lastUpd"),v:df(a.last_update),s:""})}
  </div>

  <div class="grid g2 stg">
    <div class="panel"><header><h3>${esc(t("roles"))}</h3></header>
    ${table([{h:t("roles"),f:r=>`<span class="tag t-vi">${esc(r.role_name)}</span>`},
      {h:t("name"),f:r=>`<div class="pr"><span class="ava s" style="background:${hc(r.emp_code||r.emp_name)}">${esc(ini(r.emp_name))}</span>
        <span><b>${esc(r.emp_name||"—")}</b><small class="mono">${esc(r.emp_code||"")}</small></span></div>`},
      {h:t("dept"),f:r=>esc(r.department||"—")}],
      (a.roles||[]).map(r=>({...r,__id:nk(r.emp_name)})),{click:"App.person"})}</div>

    <div class="panel"><header><h3>${esc(t("devs"))}</h3></header>
    ${devs.length?table([{h:t("name"),f:r=>`<div class="pr"><span class="ava s" style="background:${hc(r.name)}">${esc(ini(r.name))}</span>
        <span><b>${esc(r.name)}</b><small>${esc(r.p?.department||"—")}</small></span></div>`},
      {h:t("dept"),f:r=>esc(r.p?.department||"—")}],
      devs.map(r=>({...r,__id:r.key})),{click:"App.person"}):`<div class="empty">${esc(t("noData"))}</div>`}</div>
  </div>
  ${srcFoot(["apps"])}
  </div>`;
}

/* ── 8. الأقسام ── */
function vDepts(){
  const emps=S.raw.apps?.employees||[], lv=S.raw.leave?.people||[], hw=S.raw.hardware?.devices||[];
  const names=[...new Set([...(S.raw.apps?.departments||[]).map(d=>d.name),
    ...emps.map(e=>e.department),...lv.map(x=>x.department),...hw.map(d=>d.department)].filter(Boolean))].sort();
  const rows=names.map(n=>{
    const e=emps.filter(x=>x.department===n);
    const l=lv.filter(x=>x.department===n);
    const h=hw.filter(x=>x.department===n);
    const al=l.map(x=>x.annual_leave).filter(v=>typeof v==="number");
    return {name:n,__id:n,heads:e.length,leaveRecs:l.length,devices:h.length,
      avg:al.length?al.reduce((a,b)=>a+b,0)/al.length:null,
      expired:h.filter(x=>x.warranty_state==="expired").length};
  }).filter(r=>r.heads||r.leaveRecs||r.devices);
  const cols=[
    {h:t("dept"),f:r=>`<div class="pr"><span class="ava" style="background:${hc(r.name)}">${esc(ini(r.name))}</span><span><b>${esc(r.name)}</b></span></div>`,r:r=>r.name},
    {h:t("headcount"),num:1,f:r=>`<span class="mono">${nf(r.heads)}</span>`,r:r=>r.heads},
    {h:t("leave"),num:1,f:r=>`<span class="mono">${nf(r.leaveRecs)}</span>`,r:r=>r.leaveRecs},
    {h:t("avgAnnual"),num:1,f:r=>r.avg!=null?`<b class="mono">${nf1(r.avg)}</b>`:'<span style="color:var(--ink-3)">—</span>',r:r=>r.avg},
    {h:t("devices"),num:1,f:r=>`<span class="mono">${nf(r.devices)}</span>`,r:r=>r.devices},
    {h:t("wExpired"),num:1,f:r=>r.expired?`<span class="tag t-rs">${r.expired}</span>`:'<span style="color:var(--ink-3)">0</span>',r:r=>r.expired}];
  EXP={n:"departments",cols,rows};
  return `<div class="view">
  <div class="ph"><div><div class="eyebrow">${esc(LANG==="ar"?"مجمّع من المصادر الثلاثة":"Aggregated across the three sources")}</div>
    <h1>${esc(t("depts"))}</h1><p>${nf(rows.length)} ${t("depts_n")}</p></div>
    <div class="actions"><button class="btn s" onclick="App.exp()">${esc(t("export"))}</button></div></div>
  <div class="panel list">${table(cols,rows)}</div>
  ${srcFoot(["apps","leave","hardware"], LANG==="ar"
    ?"عدد الموظفين من نظام الأنظمة · سجلات ومتوسط الإجازة من نظام الإجازات · الأجهزة والضمان من نظام الأجهزة."
    :"Headcount from the Applications system · leave records and averages from the Leave system · devices and warranty from the Hardware system.")}
  </div>`;
}

/* ── 9. المصادر والمزامنة ── */
function vSettings(){
  const db=BOOT.db;
  const rows=SRC.map(k=>({k,bound:BOOT.sources[k]?.bound,url:BOOT.sources[k]?.url,src:S.src[k],
    n:k==="apps"?(S.raw.apps?.employees||[]).length
      :k==="leave"?(S.raw.leave?.people||[]).length
      :(S.raw.hardware?.devices||[]).length}));
  return `<div class="view">
  <div class="ph"><div><div class="eyebrow">${esc(t("settings"))}</div>
    <h1>${esc(LANG==="ar"?"مصادر البيانات وقاعدة البيانات":"Data sources and database")}</h1>
    <p>${esc(t("hint"))}</p></div></div>

  <div class="grid g2 stg" style="margin-bottom:16px">
    <div class="panel"><header><h3>${esc(LANG==="ar"?"قاعدة البيانات":"Database")}</h3>
      <span class="r"><span class="tag ${db.connected?"t-ok":"t-rs"}">${esc(db.connected?t("dbConn"):t("dbOff"))}</span></span></header>
      <div class="pb"><dl class="kv">
        <dt>Host</dt><dd class="mono-s">${esc(db.host)}</dd>
        <dt>Database</dt><dd class="mono-s">${esc(db.name)}</dd>
        <dt>${esc(t("tables"))}</dt><dd class="mono">${db.tables}</dd>
        <dt>${esc(t("lastSync"))}</dt><dd class="mono-s">${esc(db.last_sync||"—")}</dd>
        ${Object.entries(db.counts||{}).map(([k,v])=>`<dt class="mono-s">${esc(k)}</dt><dd class="mono">${nf(v)}</dd>`).join("")}
      </dl>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn" onclick="App.db('install')">${esc(t("install"))}</button>
        <button class="btn p" onclick="App.db('sync')">${esc(t("syncNow"))}</button>
        <button class="btn" onclick="App.db('dbtest')">${esc(t("test"))}</button></div>
      <div id="dbOut" style="margin-top:12px"></div></div></div>

    <div class="panel"><header><h3>${esc(LANG==="ar"?"الخادم":"Server")}</h3></header>
      <div class="pb"><dl class="kv">
        <dt>PHP</dt><dd class="mono-s">${esc(BOOT.server.php)}</dd>
        <dt>${esc(LANG==="ar"?"وقت الخادم":"Server time")}</dt><dd>${df(BOOT.server.time)}</dd>
        <dt>Cache TTL</dt><dd class="mono">${BOOT.server.cache_ttl}s</dd>
        <dt>${esc(LANG==="ar"?"المستخدم":"User")}</dt><dd class="mono-s">${esc(BOOT.user)}</dd>
      </dl></div></div>
  </div>

  <div class="panel"><header><h3>${esc(LANG==="ar"?"المصادر":"Sources")}</h3></header>
  ${table([
    {h:t("source"),f:r=>`<div class="pr"><span class="ava" style="background:${hc(r.k)}">${esc(r.k.slice(0,2).toUpperCase())}</span>
      <span><b>${esc(t(r.k==="apps"?"apps":r.k==="leave"?"leave":"hardware"))}</b><small class="mono">${esc(r.k)}</small></span></div>`},
    {h:LANG==="ar"?"الرابط":"Endpoint",f:r=>r.url?`<a class="sf-url" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.url)}</a>`:`<span class="tag t-mu">${LANG==="ar"?"غير مربوط":"Not set"}</span>`},
    {h:LANG==="ar"?"المعروض الآن":"Serving from",f:r=>dSrc(r.k)},
    {h:t("records"),num:1,f:r=>`<span class="mono">${nf(r.n)}</span>`},
    {h:"",f:r=>`<button class="btn s" onclick="event.stopPropagation();App.db('sync','${esc(r.k)}')">${esc(t("syncNow"))}</button>`}
  ],rows)}</div>

  ${Object.values(S.err||{}).some(Boolean)?`<div class="note" style="margin-top:14px">
    ${Object.entries(S.err).filter(([,v])=>v).map(([k,v])=>`<div><b>${esc(k)}</b>: ${esc(String(v))}</div>`).join("")}</div>`:""}
  ${srcFoot(["apps","leave","hardware"], LANG==="ar"
    ?"الروابط تُعدَّل من مصفوفة endpoints في أعلى ملف config.php."
    :"Endpoints are edited in the endpoints array at the top of config.php.")}
  </div>`;
}

/* ════════════════════════════════════════════════════════════════════════
 *  6) التحرير: إضافة · تعديل · حذف
 * ════════════════════════════════════════════════════════════════════════ */

/* ══════════════════ التحرير: إضافة · تعديل · حذف ══════════════════ */
const FORMS={
 employees:{
   icon:"people", key:"emp_code", label:{ar:"موظف",en:"Employee"},
   fields:[
    {k:"emp_code",   l:{ar:"رمز الموظف",en:"Employee code"}, req:1, keyField:1, hint:{ar:"مثال EMP-0016",en:"e.g. EMP-0016"}},
    {k:"full_name",  l:{ar:"الاسم بالإنجليزية",en:"Name (English)"}, req:1},
    {k:"name_ar",    l:{ar:"الاسم بالعربية",en:"Name (Arabic)"}},
    {k:"department", l:{ar:"القسم",en:"Department"}, list:"depts"},
    {k:"job_title",  l:{ar:"المسمى الوظيفي",en:"Job title"}},
    {k:"email",      l:{ar:"البريد الإلكتروني",en:"Email"}, type:"email"},
    {k:"account_name",l:{ar:"اسم الحساب",en:"Account name"}},
    {k:"access_level",l:{ar:"الصلاحية",en:"Access level"}, opts:["staff","manager","admin"]},
    {k:"status",     l:{ar:"الحالة",en:"Status"}, opts:["active","inactive"]}]},
 leave:{
   icon:"calendar", key:"person_key", label:{ar:"سجل إجازة",en:"Leave record"},
   fields:[
    {k:"full_name",   l:{ar:"الاسم",en:"Name"}, req:1},
    {k:"email",       l:{ar:"البريد الإلكتروني",en:"Email"}, type:"email", keyField:1,
     hint:{ar:"يُستخدم كمفتاح للسجل",en:"used as the record key"}},
    {k:"department",  l:{ar:"القسم",en:"Department"}, list:"depts"},
    {k:"job_title",   l:{ar:"المسمى الوظيفي",en:"Job title"}},
    {k:"annual_leave",l:{ar:"الإجازة السنوية (يوم)",en:"Annual leave (days)"}, type:"number", req:1},
    {k:"leave_balance",l:{ar:"الرصيد المتبقي (يوم)",en:"Remaining balance (days)"}, type:"number"},
    {k:"hire_date",   l:{ar:"تاريخ التعيين",en:"Hire date"}, type:"date"},
    {k:"phone",       l:{ar:"الهاتف",en:"Phone"}},
    {k:"salary",      l:{ar:"الراتب",en:"Salary"}, type:"number", step:"0.01"},
    {k:"address",     l:{ar:"العنوان",en:"Address"}}]},
 hardware:{
   icon:"laptop", key:"item_key", label:{ar:"جهاز",en:"Hardware record"},
   fields:[
    {k:"employee_name", l:{ar:"اسم الموظف",en:"Employee name"}, req:1},
    {k:"department",    l:{ar:"القسم",en:"Department"}, list:"depts"},
    {k:"computer_model",l:{ar:"موديل الجهاز",en:"Computer model"}, req:1,
     hint:{ar:"مثال Dell OptiPlex 7090",en:"e.g. Dell OptiPlex 7090"}},
    {k:"warranty_expiry",l:{ar:"تاريخ انتهاء الضمان",en:"Warranty expiry"}, type:"date"},
    {k:"printer",       l:{ar:"طابعة",en:"Printer"}, bool:1},
    {k:"scanner",       l:{ar:"سكانر",en:"Scanner"}, bool:1}]},
 applications:{
   icon:"grid", key:"app_code", label:{ar:"نظام",en:"System"},
   fields:[
    {k:"app_code",   l:{ar:"رمز النظام",en:"System code"}, req:1, keyField:1, hint:{ar:"مثال APP-0005",en:"e.g. APP-0005"}},
    {k:"app_name",   l:{ar:"اسم النظام",en:"System name"}, req:1},
    {k:"description",l:{ar:"الوصف",en:"Description"}, wide:1, area:1},
    {k:"version",    l:{ar:"الإصدار",en:"Version"}},
    {k:"app_type",   l:{ar:"النوع",en:"Type"}, opts:["Web","API / Backend","Mobile - Android","Mobile - iOS","Desktop"]},
    {k:"status",     l:{ar:"الحالة",en:"Status"}, opts:["Active","In development","On hold","Retired"]},
    {k:"app_url",    l:{ar:"الرابط",en:"URL"}, wide:1, type:"url"},
    {k:"date_created",l:{ar:"تاريخ الإنشاء",en:"Created"}, type:"date"},
    {k:"last_update",l:{ar:"آخر تحديث",en:"Last update"}, type:"date"}]}
};
const fl=o=>LANG==="ar"?o.ar:o.en;
let M={module:null,op:"update",key:null,row:null};

function canEdit(){return !!BOOT.canEdit}

function editBtns(module,key,row){
  if(!canEdit()) return "";
  const local=row?._origin==="local";
  return `<div class="rowact" onclick="event.stopPropagation()">
    <button class="iconbtn" title="${esc(LANG==="ar"?"تعديل":"Edit")}" onclick="App.edit('${module}','${esc(key)}')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg></button>
    <button class="iconbtn danger" title="${esc(LANG==="ar"?"حذف":"Delete")}" onclick="App.del('${module}','${esc(key)}')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/></svg></button>
    ${local?`<span class="local-dot" title="${esc(LANG==="ar"?"سجل مضاف يدوياً":"Added manually")}"></span>`:""}
  </div>`;
}
function addBtn(module){
  if(!canEdit()) return "";
  return `<button class="btn p s" onclick="App.add('${module}')">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
    ${esc(LANG==="ar"?"إضافة":"Add")}</button>`;
}
function editBar(module,count){
  if(!canEdit()) return `<div class="note" style="margin-bottom:13px">${esc(LANG==="ar"
    ?"التحرير معطّل: قاعدة البيانات غير متصلة. تحقّق من config.php ثم أنشئ الجداول من صفحة المصادر والمزامنة."
    :"Editing is disabled: the database is not connected. Check config.php, then create the tables from the Sources page.")}</div>`;
  return `<div class="editbar">
    ${aic("db",15)}
    <span>${esc(LANG==="ar"
      ?"التعديلات تُحفظ في جدول portal_edits وتُطبَّق فوق بيانات الـ API — فلا تُمحى عند المزامنة."
      :"Edits are stored in portal_edits and layered over the API data — a sync never erases them.")}</span>
    <span style="margin-inline-start:auto;display:flex;gap:7px">${addBtn(module)}</span></div>`;
}

/* ── نموذج ── */
function openForm(module,op,key,row){
  M={module,op,key,row:row||{}};
  const F=FORMS[module];
  $("#modalIcon").innerHTML=aic(F.icon,18);
  $("#modalTitle").textContent=(op==="insert"?(LANG==="ar"?"إضافة ":"New "):(LANG==="ar"?"تعديل ":"Edit "))+fl(F.label);
  $("#modalSub").textContent=op==="insert"
    ?(LANG==="ar"?"يُحفظ في قاعدة البيانات كسجل محلي":"Saved to the database as a local record")
    :(LANG==="ar"?`المفتاح: ${key}`:`Key: ${key}`);
  $("#modalSave").textContent=LANG==="ar"?"حفظ":"Save";
  $("#modalMsg").textContent="";
  const depts=[...new Set(S.people.map(p=>p.department).filter(Boolean))].sort();
  $("#modalFields").innerHTML=F.fields.map(f=>{
    const v=M.row[f.k]??"";
    const dis=(op!=="insert"&&f.keyField)?"disabled":"";
    let input;
    if(f.bool) input=`<select name="${f.k}" ${dis}><option value="0" ${!v?"selected":""}>${esc(t("no"))}</option>
        <option value="1" ${v?"selected":""}>${esc(t("yes"))}</option></select>`;
    else if(f.opts) input=`<select name="${f.k}" ${dis}><option value=""></option>
        ${f.opts.map(o=>`<option value="${esc(o)}" ${String(v)===o?"selected":""}>${esc(t(o)||o)}</option>`).join("")}</select>`;
    else if(f.area) input=`<textarea name="${f.k}" rows="2" ${dis}>${esc(v)}</textarea>`;
    else input=`<input name="${f.k}" type="${f.type||"text"}" ${f.step?`step="${f.step}"`:""} value="${esc(v)}"
        ${f.req?"required":""} ${dis} ${f.list?`list="dl-${f.list}"`:""}>`;
    return `<div class="fld ${f.wide?"wide":""}"><label>${esc(fl(f.l))}${f.req?' <span style="color:var(--rose)">*</span>':""}</label>
      ${input}${f.hint?`<span class="hint">${esc(fl(f.hint))}</span>`:""}</div>`;
  }).join("")+`<datalist id="dl-depts">${depts.map(d=>`<option value="${esc(d)}">`).join("")}</datalist>`;
  $("#modal").classList.add("on"); $("#modalBd").classList.add("on");
  setTimeout(()=>$("#modalFields").querySelector("input,select,textarea")?.focus(),140);
}

async function postSave(body){
  const r=await fetch("?action=save",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({...body,csrf:BOOT.csrf})});
  return r.json();
}

/* ════════════════════════════════════════════════════════════════════════
 *  7) المتحكم
 * ════════════════════════════════════════════════════════════════════════ */

/* ══════════════════ المتحكم ══════════════════ */
const PAGES={overview:vOverview,people:vPeople,leave:vLeave,hardware:vHardware,apps:vApps,depts:vDepts,settings:vSettings};
const TABBAR=[
 ["overview",'<path d="M3 12h7V3H3zM14 21h7v-9h-7zM14 8h7V3h-7zM3 21h7v-5H3z"/>'],
 ["people",'<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.6"/><path d="M16 15.4A5.5 5.5 0 0 1 21.5 20"/>'],
 ["leave",'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M9 15h6"/>'],
 ["hardware",'<rect x="2.5" y="4" width="19" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'],
 ["apps",'<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>'],
 ["depts",'<path d="M3 21h18M6 21V9l6-4 6 4v12M10 21v-5h4v5"/>'],
 ["settings",'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>']
];
const counts=k=>({people:S.people.length,leave:(S.raw.leave?.people||[]).length,
  hardware:(S.raw.hardware?.devices||[]).length,apps:(S.raw.apps?.applications||[]).length,
  depts:(S.raw.apps?.departments||[]).filter(d=>d.employees).length}[k]);

const App={
  async init(){
    skeleton();
    await load(false);
    const h=(location.hash||"").replace("#","").split("/");
    if(h[0]&&(PAGES[h[0]]||h[0]==="person"||h[0]==="app")){S.page=h[0];S.param=h[1]?decodeURIComponent(h[1]):null}
    this.render();
  },
  render(){
    document.documentElement.lang=LANG;
    document.documentElement.dir=LANG==="ar"?"rtl":"ltr";
    $("#brandT").textContent=t("brand"); $("#brandS").textContent=t("brandS");
    $("#langBtn").textContent=LANG==="ar"?"EN":"ع";
    $("#pickLbl").textContent=t("pick"); $("#sheetT").textContent=t("pickT");
    $("#pickQ").placeholder=t("searchP");
    const cur=S.sel?S.byKey[S.sel]:null;
    $("#whoNm").textContent=cur?(LANG==="ar"&&cur.name_ar?cur.name_ar:cur.name):t("adminView");
    $("#whoAv").textContent=cur?ini(cur.name):"ALL";
    $("#whoAv").style.background=cur?hc(cur.key):"#4d5259";
    $("#tabs").innerHTML=TABBAR.map(([k,ic])=>{const n=counts(k);
      return `<button class="${S.page===k?"on":""}" onclick="App.go('${k}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ic}</svg>
        <span>${esc(t(k))}</span>${n?`<span class="n">${nf(n)}</span>`:""}</button>`}).join("");
    const fn=S.page==="person"?vPerson:S.page==="app"?vApp:(PAGES[S.page]||vOverview);
    $("#view").innerHTML=fn();
    window.scrollTo({top:0,behavior:"smooth"});
    location.hash=S.page+(S.param?"/"+encodeURIComponent(S.param):"");
  },
  go(p,param){S.page=p;S.param=param||null;S.f={};this.closePicker();this.render()},
  person(key){if(!key)return;S.sel=key;S.page="person";S.param=key;S.f={};this.closePicker();this.render()},
  app(code){S.page="app";S.param=code;this.closePicker();this.render()},
  f(k,v){S.f[k]=v;this.render()},
  clearF(){S.f={};this.render()},
  exp(){if(EXP)csv(EXP.n,EXP.cols.filter(c=>c.r),EXP.rows)},
  theme(){const h=document.documentElement;h.dataset.theme=h.dataset.theme==="dark"?"light":"dark";this.render()},
  lang(){LANG=LANG==="ar"?"en":"ar";this.render()},
  async reload(){
    const b=$("#refBtn");b.innerHTML='<span class="spin"></span>';
    await load(true);
    b.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg>';
    this.render();toast(LANG==="ar"?"تم تحديث البيانات":"Data refreshed");
  },
  async db(action,key){
    const out=$("#dbOut");
    const tk=prompt(LANG==="ar"?"رمز المزامنة (sync_token من config.php):":"sync_token from config.php:","change-me-2026");
    if(tk===null)return;
    if(out)out.innerHTML='<span class="spin"></span>';
    try{
      const r=await fetch(`?action=${action}&token=${encodeURIComponent(tk)}${key?"&key="+key:""}`);
      const j=await r.json();
      if(out)out.innerHTML=`<pre style="margin:0;background:var(--panel-3);padding:11px;border-radius:8px;overflow-x:auto;font-size:11px;direction:ltr;text-align:left;font-family:var(--fm)">${esc(JSON.stringify(j,null,2))}</pre>`;
      if(j.ok){toast(LANG==="ar"?"تم بنجاح":"Done");if(action==="sync")await this.reload()}
      else toast(LANG==="ar"?"فشلت العملية":"Failed");
    }catch(e){if(out)out.textContent=String(e)}
  },
  openPicker(){$("#sheet").classList.add("on");$("#bd").classList.add("on");this.renderPicker();setTimeout(()=>$("#pickQ").focus(),120)},
  closePicker(){$("#sheet").classList.remove("on");$("#bd").classList.remove("on")},
  renderPicker(){
    const q=($("#pickQ").value||"").trim().toLowerCase();
    const list=S.people.filter(p=>!q||[p.name,p.name_ar,p.emp_code,p.email,p.department].some(v=>String(v??"").toLowerCase().includes(q)));
    $("#pickList").innerHTML=
      `<div class="pick ${S.sel?"":"on"}" onclick="App.selectAll()">
        <span class="ava s" style="background:#4d5259">ALL</span>
        <span style="min-width:0"><b style="font-size:13px">${esc(t("viewAll"))}</b>
        <small style="display:block;color:var(--ink-3);font-size:11.5px">${nf(S.people.length)} ${esc(t("employees"))}</small></span></div>
      <div style="height:1px;background:var(--line);margin:8px 2px"></div>`+
      (list.map(p=>`<div class="pick ${S.sel===p.key?"on":""}" onclick="App.person('${esc(p.key)}')">
        <span class="ava s" style="background:${hc(p.key)}">${esc(ini(p.name))}</span>
        <span style="min-width:0;flex:1">
          <b style="font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(LANG==="ar"&&p.name_ar?p.name_ar:p.name)}</b>
          <small style="display:block;color:var(--ink-3);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.emp_code||p.department||p.email||"—")}</small></span>
        <span style="display:flex;gap:2px">
          <span class="tag ${p.inApps?"t-vi":"t-mu"}" style="padding:0 4px">A</span>
          <span class="tag ${p.inLeave?"t-bl":"t-mu"}" style="padding:0 4px">L</span>
          <span class="tag ${p.inHw?"t-te":"t-mu"}" style="padding:0 4px">H</span></span>
      </div>`).join("")||`<div class="empty">${esc(t("noData"))}</div>`);
  },
  selectAll(){S.sel=null;this.closePicker();this.go("people")},

  /* ── التحرير ── */
  add(module){openForm(module,"insert",null,{})},
  addFor(module,key){
    const p=S.byKey[key]||{};
    const seed=module==="leave"?{full_name:p.name||"",email:p.email||"",department:p.department||"",job_title:p.job_title||""}
      :module==="hardware"?{employee_name:p.name||"",department:p.department||""}:{};
    openForm(module,"insert",null,seed);
  },
  edit(module,key){
    const F=FORMS[module];
    const src=module==="employees"?(S.raw.apps?.employees||[])
      :module==="leave"?(S.raw.leave?.people||[])
      :module==="hardware"?(S.raw.hardware?.devices||[])
      :(S.raw.apps?.applications||[]);
    const row=src.find(r=>String(r[F.key])===String(key))||{};
    openForm(module,"update",key,row);
  },
  async del(module,key){
    if(!confirm(LANG==="ar"?"إخفاء هذا السجل من البوابة؟ (لا يُحذف من الـ API، ويمكن التراجع من سجل التغييرات)":"Hide this record from the portal? (The API is untouched.)"))return;
    const j=await postSave({module,op:"delete",key});
    if(j.ok){toast(LANG==="ar"?"تم الحذف":"Deleted");await load(true);this.render()}
    else toast(j.error||"error");
  },
  closeModal(){$("#modal").classList.remove("on");$("#modalBd").classList.remove("on")},
  async submit(e){
    if(e&&e.preventDefault)e.preventDefault();
    const form=$("#modalForm");
    if(!form.reportValidity())return false;
    const F=FORMS[M.module], data={};
    new FormData(form).forEach((v,k)=>{data[k]=v});
    F.fields.forEach(f=>{if(f.keyField&&M.op!=="insert")delete data[f.k]});
    let key=M.key;
    if(M.op==="insert"){
      const kf=F.fields.find(f=>f.keyField);
      key=kf?String(data[kf.k]||"").trim():"";
    }
    const btn=$("#modalSave"), old=btn.textContent;
    btn.innerHTML='<span class="spin"></span>'; btn.disabled=true;
    const j=await postSave({module:M.module,op:M.op,key,data});
    btn.textContent=old; btn.disabled=false;
    if(j.ok){
      this.closeModal();
      toast(M.op==="insert"?(LANG==="ar"?"تمت الإضافة وحُفظت في قاعدة البيانات":"Added and saved to the database")
                           :(LANG==="ar"?"تم الحفظ في قاعدة البيانات":"Saved to the database"));
      await load(true); this.render();
    } else { $("#modalMsg").innerHTML=`<span style="color:var(--rose)">${esc(j.error||"error")}</span>`; }
    return false;
  }
};

function skeleton(){
  $("#view").innerHTML=`<div class="strip" style="margin-bottom:14px">
    ${Array.from({length:6},()=>`<div class="cell"><div class="skel" style="height:11px;width:62%"></div>
      <div class="skel" style="height:26px;width:44%;margin-top:9px"></div>
      <div class="skel" style="height:10px;width:52%;margin-top:8px"></div></div>`).join("")}</div>
    <div class="grid g2">${Array.from({length:4},()=>`<div class="panel"><div class="pb"><div class="skel" style="height:180px"></div></div></div>`).join("")}</div>`;
}

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){App.closePicker();App.closeModal()}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();App.openPicker()}
});
window.addEventListener("hashchange",()=>{
  const h=(location.hash||"").replace("#","").split("/");
  const pg=h[0],pr=h[1]?decodeURIComponent(h[1]):null;
  if(pg&&(PAGES[pg]||pg==="person"||pg==="app")&&(pg!==S.page||pr!==S.param)){S.page=pg;S.param=pr;App.render()}
});

App.init();
