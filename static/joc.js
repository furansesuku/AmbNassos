(function () {
  const DURATION = 40;     // segons de joc
  const SIZE = 16;         // graella 4 x 4
  const SPAWN_MS = 650;    // cada quant apareix una cara nova
  const LIFE_MS = 2200;    // quant de temps es queda una cara en pantalla

  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const timeEl = document.getElementById('time');
  const startBtn = document.getElementById('start');
  const overlay = document.getElementById('overlay');
  const finalScoreEl = document.getElementById('final-score');
  const restartBtn = document.getElementById('restart');
  const formNom = document.getElementById('form-nom');
  const nomInput = document.getElementById('nom');
  const guardarBtn = document.getElementById('guardar');
  const missatgeEl = document.getElementById('missatge');
  const resultatEl = document.getElementById('resultat');
  const topBody = document.getElementById('top-body');
  const overlayTopBody = document.getElementById('overlay-top-body');

  let cells = [];
  let score = 0;
  let timeLeft = DURATION;
  let running = false;
  let spawnInterval = null;
  let tickInterval = null;

  function buildBoard() {
    boardEl.innerHTML = '';
    cells = [];
    for (let i = 0; i < SIZE; i++) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cell';
      el.disabled = true;
      el.addEventListener('click', () => onCellClick(i));
      boardEl.appendChild(el);
      cells.push({ el: el, kind: null, timer: null });
    }
  }

  function clearCell(i) {
    const c = cells[i];
    clearTimeout(c.timer);
    c.timer = null;
    c.kind = null;
    c.el.innerHTML = '';
    c.el.classList.remove('pop', 'shake');
  }

  function showCell(i, kind) {
    const c = cells[i];
    c.kind = kind;
    // Il·lustracions de nen i nena (static/img/): contentes i tristes
    const who = c.variant === 1 ? 'nena' : 'nen';
    const mood = (kind === 'sad') ? 'trist' : 'content';
    c.el.innerHTML = '<img class="face-img" src="static/img/' + who + '_' + mood + '.png" alt="">';
    c.el.classList.remove('pop', 'shake');
  }

  function spawn() {
    const free = [];
    cells.forEach((c, i) => { if (c.kind === null) free.push(i); });
    if (free.length === 0) return;

    const i = free[Math.floor(Math.random() * free.length)];
    const kind = Math.random() < 0.55 ? 'sad' : 'happy';
    cells[i].variant = Math.random() < 0.5 ? 0 : 1;
    showCell(i, kind);

    // Si la cara no es clica, desapareix al cap de LIFE_MS
    cells[i].timer = setTimeout(() => {
      if (cells[i].kind === kind) clearCell(i);
    }, LIFE_MS);
  }

  function onCellClick(i) {
    const c = cells[i];
    if (!running || c.kind === null || c.kind === 'done') return;

    clearTimeout(c.timer);

    if (c.kind === 'sad') {
      score += 1;
      showCell(i, 'done');
      c.el.classList.add('pop');
      c.timer = setTimeout(() => clearCell(i), 400);
    } else {
      // Clic a una cara contenta: -1 punt, i la cara queda bloquejada fins que desaparegui
      score -= 1;
      c.kind = 'done';
      c.el.classList.add('shake');
      c.timer = setTimeout(() => clearCell(i), 300);
    }
    scoreEl.textContent = score;
  }

  function setPlaying(on) {
    cells.forEach(c => { c.el.disabled = !on; });
  }

  function start() {
    overlay.classList.add('hidden');
    buildBoard();
    score = 0;
    timeLeft = DURATION;
    running = true;
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;
    startBtn.classList.add('hidden');
    setPlaying(true);

    spawn();
    spawnInterval = setInterval(spawn, SPAWN_MS);
    tickInterval = setInterval(tick, 1000);
  }

  function tick() {
    timeLeft -= 1;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) end();
  }

  function end() {
    running = false;
    clearInterval(spawnInterval);
    clearInterval(tickInterval);
    cells.forEach((_, i) => clearCell(i));
    setPlaying(false);

    finalScoreEl.textContent = score;

    // Al final demanem el nom; el top 7 es mostra després de guardar
    nomInput.value = '';
    guardarBtn.disabled = false;
    missatgeEl.textContent = '';
    formNom.classList.remove('hidden');
    resultatEl.classList.add('hidden');
    restartBtn.classList.add('hidden');

    overlay.classList.remove('hidden');
    startBtn.classList.remove('hidden');
  }

  // ---------- Classificació (top 7) ----------

  // Pinta una taula de top 7. Usa textContent perquè els noms els escriu el públic.
  function pintaTaula(tbody, llista, posicio) {
    tbody.innerHTML = '';
    llista.forEach((entrada, idx) => {
      const tr = document.createElement('tr');
      if (posicio === idx + 1) tr.className = 'jo';

      const tdPos = document.createElement('td');
      tdPos.textContent = idx + 1;

      const tdNom = document.createElement('td');
      tdNom.textContent = entrada.nom;

      const tdPunts = document.createElement('td');
      tdPunts.className = 'num';
      tdPunts.textContent = entrada.punts;

      tr.append(tdPos, tdNom, tdPunts);
      tbody.appendChild(tr);
    });
    if (llista.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 3;
      td.className = 'buit';
      td.textContent = 'Encara no hi ha puntuacions';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  }

  function carregaTop() {
    fetch('api/top')
      .then(r => r.json())
      .then(llista => pintaTaula(topBody, llista, null))
      .catch(() => { /* si falla, la taula queda buida */ });
  }

  function guardaPuntuacio() {
    const nom = nomInput.value.trim();
    guardarBtn.disabled = true;
    missatgeEl.textContent = '';

    fetch('api/puntuacio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom: nom, punts: score })
    })
      .then(r => r.json().then(data => ({ ok: r.ok, data: data })))
      .then(res => {
        if (!res.ok) throw new Error(res.data.error || 'Error');
        formNom.classList.add('hidden');
        resultatEl.classList.remove('hidden');
        restartBtn.classList.remove('hidden');
        pintaTaula(overlayTopBody, res.data.top, res.data.posicio);
        pintaTaula(topBody, res.data.top, res.data.posicio);
      })
      .catch(() => {
        guardarBtn.disabled = false;
        missatgeEl.textContent = 'No s\'ha pogut guardar. Torna-ho a provar.';
      });
  }

  startBtn.addEventListener('click', start);
  restartBtn.addEventListener('click', start);
  guardarBtn.addEventListener('click', guardaPuntuacio);
  nomInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') guardaPuntuacio();
  });

  buildBoard();
  carregaTop();
})();
