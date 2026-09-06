import { evidenceClasses, glossary, modules, getModuleBySlug, getModuleByLab, getModuleByQuiz } from './content.mjs';
import { loadProgress, saveProgress, markComplete, recordQuizAttempt, setLastVisited, setCodeDraft } from './progress.mjs';
import { scoreQuiz } from './quiz.mjs';

const app = document.querySelector('#app');
let progress = loadProgress(localStorage);
let mobileRoadmapOpen = false;
let quizSession = null;
let worker = null;
let workerUnavailable = false;
let pendingRuns = new Map();

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (ch) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
}
function attr(value = '') { return esc(value); }
function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  if (!parts.length) return { page: 'dashboard' };
  if (parts[0] === 'reference') return { page: 'reference' };
  if (['learn','lab','quiz'].includes(parts[0])) return { page: parts[0], id: parts[1] || '' };
  return { page: 'dashboard' };
}
function currentRecommended() {
  return modules.find((m) => !progress.completedModuleIds.includes(m.id)) || modules[modules.length - 1];
}
function navHref(kind) {
  const module = currentRecommended();
  if (kind === 'learn') return `#/learn/${module.slug}`;
  if (kind === 'lab') return `#/lab/${module.lab.id}`;
  if (kind === 'quiz') return `#/quiz/${module.quiz.id}`;
  return '#/';
}
function header(active) {
  return `<header class="site-header">
    <a class="brand" href="#/" aria-label="FormPath Prestudy dashboard"><span class="brand-mark">FP</span><span>FormPath Prestudy<small>Engineering learning track</small></span></a>
    <nav class="top-nav" aria-label="Primary navigation">
      ${[['dashboard','Dashboard','#/'],['learn','Learn',navHref('learn')],['lab','Lab',navHref('lab')],['quiz','Quiz',navHref('quiz')],['reference','Reference','#/reference']].map(([id,label,href]) => `<a href="${href}" ${active===id?'aria-current="page"':''}>${label}</a>`).join('')}
    </nav>
    <div class="header-boundary">교육용 companion · 실제 사용자 영상/Firestore/인증 없음</div>
  </header>`;
}
function roadmap(currentModule) {
  return `<nav class="roadmap" aria-label="Learning roadmap"><div class="roadmap-title">12-module roadmap</div>${modules.map((m, i) => {
    const done = progress.completedModuleIds.includes(m.id);
    const current = currentModule?.id === m.id;
    return `<a class="${done?'done':''}" href="#/learn/${m.slug}" ${current?'aria-current="page"':''}><span class="roadmap-index">${done?'✓':i+1}</span><span>${esc(m.title)}</span></a>`;
  }).join('')}</nav>`;
}
function contextPanel(module, mobile=false) {
  const c = module.formPathConnection;
  return `<aside class="${mobile?'mobile-context':'context-panel'}" aria-label="Why this matters to FormPath">
    <div class="context-label">Why this matters to FormPath</div>
    <h3>${esc(c.label)}</h3><span class="evidence-badge">${esc(c.evidenceClass)}</span>
    <p>${esc(c.explanation)}</p>
    <a class="code-path" target="_blank" rel="noreferrer" href="https://github.com/Rudwpahs/shooting-profile-coach-ios/blob/main/${attr(c.path)}">${esc(c.path)} ↗</a>
  </aside>`;
}
function mobileRoadmap(module) {
  return `<button class="btn roadmap-toggle" data-action="toggle-roadmap" aria-expanded="${mobileRoadmapOpen}" aria-controls="mobile-roadmap">Open learning roadmap</button>
    <div id="mobile-roadmap" class="mobile-roadmap ${mobileRoadmapOpen?'open':''}" ${mobileRoadmapOpen?'':'hidden'}><div class="mobile-roadmap-inner"><button class="btn" data-action="toggle-roadmap">Close roadmap</button>${roadmap(module)}</div></div>`;
}
function shell(module, active, mainHtml) {
  return `${header(active)}<div class="learning-shell">${roadmap(module)}<main class="lesson-main">${mobileRoadmap(module)}${mainHtml}${contextPanel(module,true)}</main>${contextPanel(module)}</div>`;
}
function sourceCards(sources) {
  return `<div class="source-list">${sources.map((s) => `<a class="source-card" target="_blank" rel="noreferrer" href="${attr(s.url)}"><div><strong>${esc(s.title)}</strong><br><span>${esc(s.publisher)}</span></div><span>${esc(s.sourceType)} ↗</span></a>`).join('')}</div>`;
}
function dashboard() {
  const done = progress.completedModuleIds.length;
  const next = currentRecommended();
  const percent = Math.round(done / modules.length * 100);
  return `${header('dashboard')}<main class="dashboard">
    <div class="eyebrow">FormPath Engineering Foundations</div>
    <h1>슛폼 AI를<br>숫자부터 이해한다.</h1>
    <p class="dashboard-intro">FormPath가 사용하는 좌표·각도·영상 sampling·pose landmark·두 시점 방향 추정·불확실성·농구 생체역학·ML 검증을 한 흐름으로 공부하는 독립 Prestudy다.</p>
    <div class="hero-actions"><a class="btn btn-primary" href="#/learn/${next.slug}">${done ? '계속 학습' : 'Module 1 시작'} →</a><a class="btn" href="#/reference">Formula & evidence reference</a></div>
    <section class="metric-row" aria-label="Learning progress">
      <div class="metric"><strong>${done} / 12</strong><span>modules complete</span><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div></div>
      <div class="metric"><strong>${percent}%</strong><span>roadmap progress</span></div>
      <div class="metric"><strong>${esc(next.id.toUpperCase())}</strong><span>recommended next · ${esc(next.title)}</span></div>
    </section>
    <aside class="truth-card"><strong>Truth boundary</strong><p>이 사이트는 “두 영상을 쓰면 진짜 3D가 된다”라고 가르치지 않는다. FormPath의 비동시 two-view reconstruction은 <b>calibrated triangulation도 ground-truth 3D도 아니다.</b> 각 결과가 math / implementation / synthetic / real-video / biomechanics / hypothesis 중 어디에 속하는지 구분한다.</p></aside>
    <section><div class="eyebrow">Roadmap</div><h2>12 modules</h2><div class="module-grid">${modules.map((m,i) => {
      const completed = progress.completedModuleIds.includes(m.id);
      return `<a class="module-card ${completed?'done':''}" href="#/learn/${m.slug}"><div class="module-number"><span>MODULE ${String(i+1).padStart(2,'0')} · ${m.estimatedMinutes} MIN</span><span class="status-dot">${completed?'✓':''}</span></div><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="card-footer">${completed?'Review module':'Open module'} →</div></a>`;
    }).join('')}</div></section>
  </main>`;
}
function learn(module) {
  progress = setLastVisited(progress, module.slug); saveProgress(localStorage, progress);
  const html = `<article><header class="lesson-header"><div class="lesson-kicker"><span>${module.id.toUpperCase()}</span><span>·</span><span>${module.estimatedMinutes} min</span></div><h1>${esc(module.title)}</h1><p class="lesson-summary">${esc(module.summary)}</p><div class="objectives"><strong>After this module</strong><ul>${module.objectives.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul></div></header>
    ${module.concepts.map((c,i)=>`<section class="lesson-section"><div class="eyebrow">Concept ${i+1}</div><h2>${esc(c.heading)}</h2><p>${esc(c.body)}</p>${c.formula?`<div class="formula">${esc(c.formula)}</div>`:''}</section>`).join('')}
    <section class="lesson-section"><div class="eyebrow">Primary sources</div><h2>근거를 직접 확인하기</h2><p>임베드가 막혀도 학습이 중단되지 않도록 모든 자료는 원 출처 링크를 남긴다.</p>${sourceCards(module.sources)}</section>
    <div class="learning-actions"><a class="btn btn-accent" href="#/lab/${module.lab.id}">Open Python lab →</a><a class="btn" href="#/quiz/${module.quiz.id}">Knowledge check</a></div></article>`;
  return shell(module, 'learn', html);
}
function lab(module) {
  const lab = module.lab;
  const draft = progress.codeDrafts[lab.id] ?? lab.starterCode;
  const unavailable = workerUnavailable ? `<div class="fallback"><strong>Python runtime unavailable</strong><br>강의와 코드는 그대로 사용할 수 있다. 아래 expected output을 읽고 Retry를 눌러 다시 시도할 수 있다.</div>` : '';
  const html = `<article class="lab-panel"><header class="lesson-header"><div class="lesson-kicker">${module.id.toUpperCase()} · PYTHON LAB</div><h1>${esc(lab.title)}</h1><p class="lesson-summary">${esc(lab.explanation)}</p></header>
    <section class="lesson-section"><label for="code-editor"><strong>Starter / working code</strong></label><textarea id="code-editor" class="code-editor" spellcheck="false" data-lab-id="${lab.id}">${esc(draft)}</textarea><div class="lab-toolbar"><button class="btn btn-accent" data-action="run-python" data-lab-id="${lab.id}">Run</button><button class="btn" data-action="reset-code" data-lab-id="${lab.id}">Reset</button><button class="btn btn-quiet" data-action="retry-python">Retry runtime</button></div><div id="runtime-status" class="runtime-status">Python은 Run을 누를 때 Web Worker에서 lazy-load된다.</div><pre id="python-output" class="output" data-testid="python-output" aria-live="polite">아직 실행하지 않았습니다.</pre>${unavailable}<div class="expected"><strong>Expected output / interpretation</strong><pre>${esc(lab.expectedOutput)}</pre></div></section>
    <div class="learning-actions"><a class="btn btn-primary" href="#/quiz/${module.quiz.id}">Knowledge check →</a><a class="btn" href="#/learn/${module.slug}">Back to concept</a></div></article>`;
  return shell(module, 'lab', html);
}
function quiz(module) {
  const attempt = progress.quizAttempts[module.quiz.id];
  const currentResult = quizSession?.quizId === module.quiz.id ? quizSession : null;
  const result = currentResult ? `<div class="quiz-result"><strong>${currentResult.score} / ${currentResult.total}</strong><div>Latest check</div><div class="explanations">${module.quiz.questions.map((x)=>`<p><b>${esc(x.prompt)}</b><br>${esc(x.explanation)}</p>`).join('')}</div></div>` : attempt ? `<div class="quiz-result"><strong>${attempt.score} / ${attempt.total}</strong><div>저장된 최근 점수 · 다시 풀 수 있습니다.</div></div>` : '';
  const html = `<article><header class="lesson-header"><div class="lesson-kicker">${module.id.toUpperCase()} · KNOWLEDGE CHECK</div><h1>${esc(module.title)}</h1><p class="lesson-summary">5문제로 핵심 개념과 FormPath truth boundary를 확인한다.</p></header>${result}<form id="quiz-form" class="quiz-form" data-quiz-id="${module.quiz.id}">${module.quiz.questions.map((question,idx)=>`<section class="question"><fieldset><legend>${idx+1}. ${esc(question.prompt)}</legend>${question.options.map((option)=>`<label class="option"><input type="radio" required name="${question.id}" value="${attr(option)}"><span>${esc(option)}</span></label>`).join('')}</fieldset></section>`).join('')}<div class="learning-actions"><button class="btn btn-accent" type="submit">Submit answers</button>${attempt||currentResult?`<button class="btn btn-primary" type="button" data-action="mark-complete" data-module-id="${module.id}">Mark module complete</button>`:''}<a class="btn" href="#/learn/${module.slug}">Review concept</a></div></form></article>`;
  return shell(module, 'quiz', html);
}
function referencePage() {
  const allSources = [...new Map(modules.flatMap(m=>m.sources).map(s=>[s.url,s])).values()];
  return `${header('reference')}<main class="reference-wrap"><div class="eyebrow">Reference</div><h1>공식·근거·경계를<br>한곳에서 확인한다.</h1><p class="dashboard-intro">수식, 용어, evidence class, 원 출처와 공개 FormPath 코드 경로를 모아 둔다.</p><div class="reference-grid">
    <section class="ref-card"><h2>Formula sheet</h2><dl><dt>Vector</dt><dd>v = B − A</dd><dt>Magnitude</dt><dd>‖v‖ = √Σvᵢ²</dd><dt>Angle</dt><dd>θ = acos((a·b)/(‖a‖‖b‖))</dd><dt>Frame interval</dt><dd>Δt = 1 / fps</dd><dt>Two-projection direction toy model</dt><dd>u ∝ (tan α, 1, tan β) — direction constraint, not calibrated triangulation.</dd></dl></section>
    <section class="ref-card"><h2>Evidence classes</h2><dl>${evidenceClasses.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>
    <section class="ref-card"><h2>Glossary</h2><dl>${glossary.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>
    <section class="ref-card"><h2>Primary sources</h2><ul class="ref-list">${allSources.map(s=>`<li><a target="_blank" rel="noreferrer" href="${attr(s.url)}">${esc(s.title)}</a> — ${esc(s.publisher)}</li>`).join('')}</ul></section>
    <section class="ref-card"><h2>FormPath architecture paths</h2><ul class="ref-list">${[...new Map(modules.map(m=>[m.formPathConnection.path,m.formPathConnection])).values()].map(c=>`<li><a target="_blank" rel="noreferrer" href="https://github.com/Rudwpahs/shooting-profile-coach-ios/blob/main/${attr(c.path)}">${esc(c.path)}</a><br>${esc(c.explanation)}</li>`).join('')}</ul></section>
    <section class="ref-card"><h2>Python runtime</h2><p>Pyodide는 브라우저의 Web Worker에서만 실행된다. 이 사이트는 서버로 코드를 보내지 않으며 실제 FormPath 영상·Firebase credential·private dataset에 접근하지 않는다.</p><a class="btn" target="_blank" rel="noreferrer" href="https://pyodide.org/en/latest/usage/webworker.html">Pyodide Web Worker docs ↗</a></section>
  </div></main>`;
}
function unavailable(kind) {
  return `${header(kind==='reference'?'reference':'dashboard')}<main class="empty-state"><h1>Module unavailable</h1><p>요청한 학습 항목을 찾을 수 없습니다.</p><a class="btn" href="#/">Dashboard</a></main>`;
}
function render() {
  const r = route();
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (r.page === 'dashboard') app.innerHTML = dashboard();
  else if (r.page === 'reference') app.innerHTML = referencePage();
  else if (r.page === 'learn') { const m=getModuleBySlug(r.id); app.innerHTML=m?learn(m):unavailable('learn'); }
  else if (r.page === 'lab') { const m=getModuleByLab(r.id); app.innerHTML=m?lab(m):unavailable('lab'); }
  else if (r.page === 'quiz') { const m=getModuleByQuiz(r.id); app.innerHTML=m?quiz(m):unavailable('quiz'); }
}
function createWorker() {
  if (worker) return worker;
  worker = new Worker('./pyodide-worker.mjs', { type: 'module' });
  worker.addEventListener('message', (event) => {
    const pending = pendingRuns.get(event.data.id);
    if (!pending) return;
    clearTimeout(pending.timer); pendingRuns.delete(event.data.id);
    if (event.data.type === 'result') pending.resolve(event.data);
    else pending.reject(new Error(event.data.message || 'Python execution failed'));
  });
  worker.addEventListener('error', (event) => {
    workerUnavailable = true;
    for (const pending of pendingRuns.values()) { clearTimeout(pending.timer); pending.reject(new Error(event.message || 'Worker failed')); }
    pendingRuns.clear(); worker?.terminate(); worker = null;
  });
  return worker;
}
function runPython(code, packages) {
  return new Promise((resolve,reject) => {
    const id = crypto.randomUUID();
    const w = createWorker();
    const timer = setTimeout(() => { pendingRuns.delete(id); workerUnavailable=true; worker?.terminate(); worker=null; reject(new Error('Python runtime timed out')); }, 20000);
    pendingRuns.set(id,{resolve,reject,timer});
    w.postMessage({ id, code, packages });
  });
}

window.addEventListener('hashchange', () => { mobileRoadmapOpen=false; render(); });
app.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'toggle-roadmap') { mobileRoadmapOpen=!mobileRoadmapOpen; render(); return; }
  if (action === 'reset-code') {
    const m = getModuleByLab(target.dataset.labId); if (!m) return;
    progress = setCodeDraft(progress,m.lab.id,m.lab.starterCode); saveProgress(localStorage,progress); render(); return;
  }
  if (action === 'retry-python') { workerUnavailable=false; worker?.terminate(); worker=null; render(); return; }
  if (action === 'run-python') {
    const m = getModuleByLab(target.dataset.labId); if (!m) return;
    const editor=document.querySelector('#code-editor'); const output=document.querySelector('#python-output'); const status=document.querySelector('#runtime-status');
    status.textContent='Loading / running Python in a Web Worker…'; output.textContent=''; target.disabled=true;
    try { const result=await runPython(editor.value,m.lab.packages); workerUnavailable=false; output.textContent=[result.stdout,result.stderr].filter(Boolean).join('\n') || '(실행 완료 · 출력 없음)'; status.textContent='Run complete.'; }
    catch (error) { workerUnavailable=true; output.textContent=`Python runtime unavailable\n${error.message}\n\nExpected:\n${m.lab.expectedOutput}`; status.textContent='Runtime unavailable. Reading mode remains available.'; }
    finally { target.disabled=false; }
    return;
  }
  if (action === 'mark-complete') {
    progress=markComplete(progress,target.dataset.moduleId); saveProgress(localStorage,progress);
    const idx=modules.findIndex(m=>m.id===target.dataset.moduleId); const next=modules[idx+1];
    if (next) location.hash=`#/learn/${next.slug}`; else location.hash='#/';
  }
});
app.addEventListener('input', (event) => {
  if (event.target.matches('#code-editor')) { progress=setCodeDraft(progress,event.target.dataset.labId,event.target.value); saveProgress(localStorage,progress); }
});
app.addEventListener('submit', (event) => {
  if (!event.target.matches('#quiz-form')) return;
  event.preventDefault();
  const form=event.target; const m=getModuleByQuiz(form.dataset.quizId); if (!m) return;
  const answers=Object.fromEntries(new FormData(form).entries()); const result=scoreQuiz(m.quiz,answers);
  progress=recordQuizAttempt(progress,m.quiz.id,result.score,result.total); saveProgress(localStorage,progress);
  quizSession={quizId:m.quiz.id,...result}; render();
});

if (!location.hash) location.hash='#/'; else render();
