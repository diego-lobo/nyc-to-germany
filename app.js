// Wegweiser (path finder): each answer adds points to one or more study-abroad paths.
const PATHS = {
  berlin: { name: 'NYU Berlin', href: '#path-berlin' },
  koeln: { name: 'Universität zu Köln', href: '#path-koeln' },
  daad: { name: 'DAAD / UAS7 route', href: '#path-daad' },
};

const QUESTIONS = window.QUIZ_QUESTIONS || [];

function renderQuiz() {
  const form = document.getElementById('quiz-form');
  if (!form) return;
  form.innerHTML = QUESTIONS.map((q, i) => `
    <fieldset class="q" style="border:0;padding:0;margin:0 0 22px">
      <legend class="q-title">${i + 1}. ${q.de} <span class="en">— ${q.en}</span></legend>
      <div class="opts">
        ${q.options.map((o, j) => `
          <label><input type="radio" name="q${i}" value="${j}" ${j === 0 ? 'required' : ''}><span>${o.label}</span></label>
        `).join('')}
      </div>
    </fieldset>`).join('') +
    '<button class="btn" type="submit">Meinen Weg finden · Find my path</button>';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const score = { berlin: 0, koeln: 0, daad: 0 };
    const reasons = { berlin: [], koeln: [], daad: [] };
    QUESTIONS.forEach((q, i) => {
      const picked = form.querySelector(`input[name="q${i}"]:checked`);
      if (!picked) return;
      const opt = q.options[Number(picked.value)];
      for (const [k, v] of Object.entries(opt.points || {})) {
        score[k] += v;
        if (v > 0 && opt.why) reasons[k].push(opt.why);
      }
    });
    showResult(score, reasons);
  });
}

function showResult(score, reasons) {
  const box = document.getElementById('quiz-result');
  const ranked = Object.keys(score).sort((a, b) => score[b] - score[a]);
  const top = ranked[0];
  const max = Math.max(1, ...Object.values(score));
  const why = reasons[top].length ? `<ul>${reasons[top].map((r) => `<li>${r}</li>`).join('')}</ul>` : '';
  box.innerHTML = `
    <div class="winner">
      <div class="eyebrow">Dein bester Weg · Your best match</div>
      <h3 style="margin:6px 0 8px;font-size:26px">${PATHS[top].name}</h3>
      ${why}
      <a href="${PATHS[top].href}">Details und nächste Schritte ansehen →</a>
    </div>
    <div class="bars">
      ${ranked.map((k) => `
        <div class="bar ${k === top ? 'top' : ''}">
          <span>${PATHS[k].name}</span>
          <div class="track"><div class="fill" style="width:${Math.max(4, (score[k] / max) * 100)}%"></div></div>
          <span>${score[k]}</span>
        </div>`).join('')}
    </div>`;
  box.classList.add('show');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Highlight the nav link for the section in view.
function trackNav() {
  const links = [...document.querySelectorAll('.links a')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      byId.get(en.target.id)?.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
}

renderQuiz();
trackNav();
