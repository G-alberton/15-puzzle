/*
  Bom, vamos ter que fazer a logica toda de novo,
  apos o teste com casoos mais dificeis deu tudo errado kkkkkkk, demorou mais de uma hora

  bom, vamos usar o pattern database que ja tavamos usando antes, a ideia é uma tabela
  pre-computada que guarda o mínimo exato para um subconjunto de peças chegar ás suas posições alvo,
  ignorando as outras peças. nunca superestima, melhor que o Manhattan sozinho.


  tive que usar dividindo em 3 grupos

  para cada grupo, pré-computamos via BFS reverso o custo mínimo de qualquer configração, a heurística final é a soma dos
  tres grupos

  grupos não se sobrepoem
*/

let board = new Array(16).fill(0);
let selectedVal = null;
let isEditMode = false;
let isSolving = false;
let solverWorker = null;
let animInterval = null;
let moveCount = 0;


let timerInterval = null;
let startTime = null;

function startClock() {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const ms = Date.now() - startTime;
    const total = Math.floor(ms/1000);
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    const tenth = Math.floor((ms % 1000) / 100);
    document.getElementById('clock').textContent = `${mm}:${ss}.${tenth}`;
  }, 100);
}

function stopClock() {clearInterval(timerInterval);}

function render() {
  const boardEl   = document.getElementById('board');
  boardEl.innerHTML = '';
  const validMoves = getValidMoves();

  board.forEach((num, idx) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');

    if (num === 0) {
      tile.classList.add('empty');
      if (isEditMode) {
        tile.classList.add('edit-target');
        tile.onclick = () => place(idx);
      }
    } else {
      tile.textContent = num;

      if (isSolving) {
        tile.classList.add('solving');

      } else if (isEditMode) {
        tile.classList.add('edit-target');
        tile.onclick = () => place(idx);

      } else {
        if (num === idx + 1) tile.classList.add('correct');
        if (validMoves.includes(idx)) tile.classList.add('movable');
        tile.onclick = () => playerMove(idx);
      }
    }

    boardEl.appendChild(tile);
  });
  document.getElementById('stat-h').textContent = manhattan(board);
}

function getEmptyIndex() { return board.indexOf(0); }

function getValidMoves() {
  const e = getEmptyIndex();
  const row = e >> 2, col = e & 3;
  const mv = [];
  if (row > 0) mv.push(e - 4);
  if (row < 3) mv.push(e + 4);
  if (row > 0) mv.push(e - 1);
  if (row < 3) mv.push(e + 1);
  return mv;
}

function playerMove(idx) {
  if (isSolving || isEditMode) return;
  if (!getValidMoves().includes(idx)) return;
  swapWithEmpty(idx);
  moveCount++;
  updateStats();
  render();
  checkWin();
}

function swapWithEmpty(idx) {
  const e = getEmptyIndex();
  [board[e], board[idx]] = [board[idx], board[e]];
}

function checkWin() {
  for (let i = 0; i < 15; i++) if (board[i] !== i + 1) return;
  if (board[15] !== 0) return;
  stopClock();
  setMessage('✓ resolvido!', 'win');
}

function manhattan(b) { //o manhattan auxilia pra exibir a distancia 
  let d = 0;
  for (let i = 0; i < 16; i++) {
    const v = b[i];
    if (!v) continue;
    d += Math.abs((i >> 2) - ((v-1) >> 2)) + Math.abs((i & 3) - ((v-1) & 3));
  }
  return d;
}

function initSelector() {
  const sel = document.getElementById('selector');
  sel.innerHTML = '';

  for (let v = 1; v <= 15; v++) {
    const d = document.createElement('div');
    d.classList.add('selector-tile');
    d.textContent = v;
    d.dataset.val = v;
    d.onclick = () => selectValue(v, d);
    sel.appendChild(d);
  }

  const empty = document.createElement('div');
  empty.classList.add('selector-tile', 'zero');
  empty.textContent = '[ ]';
  empty.dataset.val = 0;
  empty.onclick = () => selectValue(0, empty);
  sel.appendChild(empty);
}

function selectValue(val, el) {
  selectedVal = val;
  document.querySelectorAll('.selector-tile').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
}

function place(idx) {
  if (selectedVal === null) {
    setMessage('selecione um valor no painel acima', 'info');
    return;
  }
  const prev = board.indexOf(selectedVal);
  if (prev !== -1) board[prev] = 0;

  board[idx] = selectedVal;
  render();
}

function enterEditMode() {
  if (isSolving) return;
  stopClock();
  stopSolver();
  isEditMode  = true;
  selectedVal = null;
  board = new Array(16).fill(0);

  initSelector();
  document.getElementById('selector-wrap').classList.remove('hidden');
  document.getElementById('btn-clear').classList.remove('hidden');
  document.getElementById('btn-confirm').classList.remove('hidden');
  document.getElementById('btn-edit').classList.add('hidden');
  document.getElementById('btn-solve').classList.add('hidden');
  document.getElementById('path-wrap').classList.add('hidden');
  updateStats();
  setMessage('selecione valores e clique nas células do tabuleiro', 'info');
  render();
}

function exitEditMode() {
  isEditMode  = false;
  selectedVal = null;
  document.getElementById('selector-wrap').classList.add('hidden');
  document.getElementById('btn-clear').classList.add('hidden');
  document.getElementById('btn-confirm').classList.add('hidden');
  document.getElementById('btn-edit').classList.remove('hidden');
  document.getElementById('btn-solve').classList.remove('hidden');
  updateStats();
}

function confirmEdit() {
  const vals = [...board].sort((a, b) => a - b);
  const expected = [...Array(16).keys()]; 
  if (vals.join() !== expected.join()) {
    setMessage('preencha todas as 16 células com valores únicos (0-15)', 'warn');
    return;
  }

  if (!isSolvable(board)) {
    setMessage('este arranjo não tem solução — troque duas peças', 'warn');
    return;
  }

  exitEditMode();
  moveCount = 0;
  document.getElementById('stat-ai').textContent = '—';
  setMessage('');
  startClock();
  render();
}

function clearBoard() {
  board = new Array(16).fill(0);
  selectedVal = null;
  document.querySelectorAll('.selector-tile').forEach(d => d.classList.remove('active'));
  setMessage('tabuleiro limpo', 'info');
  render();
}

function isSolvable(b) {
  let inv = 0;
  for (let i = 0; i < 16; i++)
    for (let j = i + 1; j < 16; j++)
      if (b[i] && b[j] && b[i] > b[j]) inv++;

  const rowFromBottom = 4 - Math.floor(b.indexOf(0) / 4);
  return rowFromBottom % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
}

function randomBoard() {
  stopSolver();
  exitEditMode();

  do {
    board = [...Array(15).keys()].map(x => x + 1);
    board.push(0);
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
  } while (!isSolvable(board));

  moveCount = 0;
  document.getElementById('stat-ai').textContent = '—';
  document.getElementById('path-wrap').classList.add('hidden');
  setMessage('');
  updateStats();
  startClock();
  render();
}

const WORKER_SRC = `

/* ──────────────────────────────────────────────
   HEURÍSTICAS LEVES E EFICIENTES
   ────────────────────────────────────────────── */

function manhattan(board) {
  let d = 0;
  for (let i = 0; i < 16; i++) {
    const v = board[i];
    if (!v) continue;
    d += Math.abs((i>>2)-((v-1)>>2)) + Math.abs((i&3)-((v-1)&3));
  }
  return d;
}

function linearConflict(board) {
  let c = 0;

  // Linhas
  for (let row = 0; row < 4; row++) {
    const tiles = [];
    for (let col = 0; col < 4; col++) {
      const v = board[row*4 + col];
      if (v && ((v-1)>>2) === row) tiles.push({v, col});
    }
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i+1; j < tiles.length; j++) {
        if (tiles[i].col > tiles[j].col &&
            ((tiles[i].v-1)&3) < ((tiles[j].v-1)&3)) {
          c += 2;
        }
      }
    }
  }

  // Colunas
  for (let col = 0; col < 4; col++) {
    const tiles = [];
    for (let row = 0; row < 4; row++) {
      const v = board[row*4 + col];
      if (v && ((v-1)&3) === col) tiles.push({v, row});
    }
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i+1; j < tiles.length; j++) {
        if (tiles[i].row > tiles[j].row &&
            ((tiles[i].v-1)>>2) < ((tiles[j].v-1)>>2)) {
          c += 2;
        }
      }
    }
  }

  return c;
}

/* Heurística final */
function heuristic(board) {
  return manhattan(board) + linearConflict(board);
}

/* ──────────────────────────────────────────────
   IDA*
   ────────────────────────────────────────────── */

function getMoves(e) {
  const row = e>>2, col = e&3, mv = [];
  if (row>0) mv.push(e-4);
  if (row<3) mv.push(e+4);
  if (col>0) mv.push(e-1);
  if (col<3) mv.push(e+1);
  return mv;
}

function idaStar(startBoard) {
  let bound = heuristic(startBoard);
  const path = [];

  for (let iter = 0; iter < 200; iter++) {
    const t = search(startBoard, 0, bound, path, -1);
    if (t === true) return path;
    if (t === Infinity) return null;
    bound = t;

    self.postMessage({ type: 'progress', bound, iter });
  }

  return null;
}

function search(board, g, bound, path, prevEmpty) {
  const e = board.indexOf(0);
  const h = heuristic(board);
  const f = g + h;

  if (f > bound) return f;
  if (h === 0) return true;

  let min = Infinity;

  for (const mv of getMoves(e)) {
    if (mv === prevEmpty) continue;

    // aplica movimento
    board[e] = board[mv];
    board[mv] = 0;
    path.push(mv);

    const t = search(board, g+1, bound, path, e);

    if (t === true) return true;
    if (t < min) min = t;

    // desfaz movimento
    path.pop();
    board[mv] = board[e];
    board[e] = 0;
  }

  return min;
}

/* ──────────────────────────────────────────────
   WORKER MAIN
   ────────────────────────────────────────────── */

self.onmessage = function(e) {
  const board = [...e.data.board];

  self.postMessage({ type: 'phase', text: 'resolvendo com IDA* (rápido)…' });

  const solution = idaStar(board);

  if (solution) {
    self.postMessage({ type: 'solution', moves: solution });
  } else {
    self.postMessage({ type: 'error', message: 'Solução não encontrada.' });
  }
};
`;

function createWorker() {
  const blob = new Blob([WORKER_SRC], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

function solve() {
  if (isSolving || isEditMode) return;
  let ok = true;
  for (let i = 0; i < 15; i++) if (board[i] !== i+1) { ok = false; break; }
  if (ok && board[15] === 0) { setMessage('já está resolvido', 'info'); return; }

  if (!isSolvable(board)) { setMessage('sem solução possível', 'warn'); return; }

  isSolving = true;
  setSolverUI(true);
  showProgress(true);
  document.getElementById('path-wrap').classList.add('hidden');
  setMessage('pré-computando pattern database…', 'info');

  solverWorker = createWorker();

  solverWorker.onmessage = function(ev) {
    const { type, moves, bound, text } = ev.data;

    if (type === 'phase') {
      setMessage(text, 'info');
      const phases = ['A','B','C','IDA'];
      const pct = phases.findIndex(p => text.includes(p === 'IDA' ? 'IDA' : p));
      document.getElementById('progress-fill').style.width = (25 + pct * 25) + '%';
    }

    if (type === 'progress') {
      const pct = Math.min(98, 75 + Math.max(0, (40 - bound) * 0.6));
      document.getElementById('progress-fill').style.width = pct + '%';
      document.getElementById('progress-label').textContent = `bound ${bound}`;
    }

    if (type === 'solution') {
      isSolving = false;
      setSolverUI(false);
      showProgress(false);
      document.getElementById('stat-ai').textContent = moves.length;
      setMessage(`ótimo: ${moves.length} movimentos`, 'info');
      animateSolution(moves);
    }

    if (type === 'error') {
      isSolving = false;
      setSolverUI(false);
      showProgress(false);
      setMessage(ev.data.message, 'warn');
    }
  };

  solverWorker.onerror = function() {
    isSolving = false;
    setSolverUI(false);
    showProgress(false);
    setMessage('erro no solver', 'warn');
  };

  solverWorker.postMessage({ board: [...board] });
}

function stopSolver() {
  solverWorker?.terminate();
  solverWorker = null;
  clearInterval(animInterval);
  animInterval = null;
  isSolving = false;
  setSolverUI(false);
  showProgress(false);
}

// ANIMAÇÃO & PATH
function dir(e, mv) {
  const d = mv - e;
  if (d === -4) return '↑';
  if (d ===  4) return '↓';
  if (d === -1) return '←';
  if (d ===  1) return '→';
  return '?';
}

function animateSolution(moves) {
  let temp = [...board];
  const arrows = moves.map(mv => {
    const e = temp.indexOf(0);
    const arrow = dir(e, mv);
    [temp[e], temp[mv]] = [temp[mv], temp[e]];
    return arrow;
  });

  document.getElementById('path').textContent = arrows.join(' ');
  document.getElementById('path-wrap').classList.remove('hidden');

  let i = 0;
  stopClock();

  animInterval = setInterval(() => {
    if (i >= moves.length) {
      clearInterval(animInterval);
      animInterval = null;
      render();
      setMessage('✓ resolvido pela IA', 'win');
      return;
    }
    swapWithEmpty(moves[i]);
    render();
    i++;
  }, 120);
}