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
    overlay.classList.remove('hidden');
    startBtn.classList.remove('hidden');
  }

  startBtn.addEventListener('click', start);
  restartBtn.addEventListener('click', start);

  buildBoard();
})();
