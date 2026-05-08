/*
  15 PUZZLE
  Solver otimizado com:

  - IDA*
  - Manhattan Distance
  - Linear Conflict
  - Move Ordering
  - Typed Arrays
  - Tabela de movimentos pré-computada
  - Sem explosão de memória
  - Muito mais rápido que a versão anterior
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

/* =========================================================
   CLOCK
========================================================= */

function startClock() {
  clearInterval(timerInterval);

  startTime = Date.now();

  timerInterval = setInterval(() => {
    const ms = Date.now() - startTime;

    const total = Math.floor(ms / 1000);

    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    const tenth = Math.floor((ms % 1000) / 100);

    document.getElementById('clock').textContent =
      `${mm}:${ss}.${tenth}`;
  }, 100);
}

function stopClock() {
  clearInterval(timerInterval);
}

/* =========================================================
   RENDER
========================================================= */

function render() {

  const boardEl = document.getElementById('board');

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

        if (num === idx + 1)
          tile.classList.add('correct');

        if (validMoves.includes(idx))
          tile.classList.add('movable');

        tile.onclick = () => playerMove(idx);
      }
    }

    boardEl.appendChild(tile);
  });
<<<<<<< HEAD

  document.getElementById('stat-h').textContent =
    manhattan(board);
=======
  document.getElementById('stat-h').textContent =
  manhattan(board) + linearConflictMain(board);
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
}

/* =========================================================
   MOVES
========================================================= */

function getEmptyIndex() {
  return board.indexOf(0);
}

function getValidMoves() {

  const e = getEmptyIndex();

  const row = e >> 2;
  const col = e & 3;

  const mv = [];

<<<<<<< HEAD
=======
  // cima
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
  if (row > 0) mv.push(e - 4);

  // baixo
  if (row < 3) mv.push(e + 4);
<<<<<<< HEAD
  if (col > 0) mv.push(e - 1);
=======

  // esquerda
  if (col > 0) mv.push(e - 1);

  // direita
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
  if (col < 3) mv.push(e + 1);

  return mv;
}

function linearConflictMain(board) {

  let c = 0;

  // linhas
  for (let row = 0; row < 4; row++) {

    for (let col1 = 0; col1 < 4; col1++) {

      const t1 = board[row * 4 + col1];

      if (!t1) continue;

      if (((t1 - 1) >> 2) !== row) continue;

      for (let col2 = col1 + 1; col2 < 4; col2++) {

        const t2 = board[row * 4 + col2];

        if (!t2) continue;

        if (((t2 - 1) >> 2) !== row) continue;

        if (((t1 - 1) & 3) > ((t2 - 1) & 3)) {
          c += 2;
        }
      }
    }
  }

  // colunas
  for (let col = 0; col < 4; col++) {

    for (let row1 = 0; row1 < 4; row1++) {

      const t1 = board[row1 * 4 + col];

      if (!t1) continue;

      if (((t1 - 1) & 3) !== col) continue;

      for (let row2 = row1 + 1; row2 < 4; row2++) {

        const t2 = board[row2 * 4 + col];

        if (!t2) continue;

        if (((t2 - 1) & 3) !== col) continue;

        if (((t1 - 1) >> 2) > ((t2 - 1) >> 2)) {
          c += 2;
        }
      }
    }
  }

  return c;
}

function playerMove(idx) {

  if (isSolving || isEditMode)
    return;

  if (!getValidMoves().includes(idx))
    return;

  swapWithEmpty(idx);

  moveCount++;

  updateStats();

  render();

  checkWin();
}

function swapWithEmpty(idx) {

  const e = getEmptyIndex();

  [board[e], board[idx]] =
    [board[idx], board[e]];
}

/* =========================================================
   WIN
========================================================= */

function checkWin() {

  for (let i = 0; i < 15; i++) {
    if (board[i] !== i + 1)
      return;
  }

  if (board[15] !== 0)
    return;

  stopClock();

  setMessage('✓ resolvido!', 'win');
}

/* =========================================================
   HEURISTIC
========================================================= */

function manhattan(b) {

  let d = 0;

  for (let i = 0; i < 16; i++) {

    const v = b[i];

    if (!v) continue;

    d +=
      Math.abs((i >> 2) - ((v - 1) >> 2)) +
      Math.abs((i & 3) - ((v - 1) & 3));
  }

  return d;
}

/* =========================================================
   EDIT MODE
========================================================= */

function initSelector() {

  const sel = document.getElementById('selector');

  sel.innerHTML = '';

  for (let v = 1; v <= 15; v++) {

    const d = document.createElement('div');

    d.classList.add('selector-tile');

    d.textContent = v;

    d.onclick = () => selectValue(v, d);

    sel.appendChild(d);
  }

  const empty = document.createElement('div');

  empty.classList.add('selector-tile', 'zero');

  empty.textContent = '[ ]';

  empty.onclick = () => selectValue(0, empty);

  sel.appendChild(empty);
}

function selectValue(val, el) {

  selectedVal = val;

  document
    .querySelectorAll('.selector-tile')
    .forEach(d => d.classList.remove('active'));

  el.classList.add('active');
}

function place(idx) {

  if (selectedVal === null) {

    setMessage(
      'selecione um valor no painel acima',
      'info'
    );

    return;
  }

  const prev = board.indexOf(selectedVal);

  if (prev !== -1)
    board[prev] = 0;

  board[idx] = selectedVal;

  render();
}

function enterEditMode() {

  if (isSolving)
    return;

  stopClock();

  stopSolver();

  isEditMode = true;

  selectedVal = null;

  board = new Array(16).fill(0);

  initSelector();

  document
    .getElementById('selector-wrap')
    .classList.remove('hidden');

  document
    .getElementById('btn-clear')
    .classList.remove('hidden');

  document
    .getElementById('btn-confirm')
    .classList.remove('hidden');

  document
    .getElementById('btn-edit')
    .classList.add('hidden');

  document
    .getElementById('btn-solve')
    .classList.add('hidden');

  updateStats();

  render();
}

function exitEditMode() {

  isEditMode = false;

  selectedVal = null;

  document
    .getElementById('selector-wrap')
    .classList.add('hidden');

  document
    .getElementById('btn-clear')
    .classList.add('hidden');

  document
    .getElementById('btn-confirm')
    .classList.add('hidden');

  document
    .getElementById('btn-edit')
    .classList.remove('hidden');

  document
    .getElementById('btn-solve')
    .classList.remove('hidden');

  updateStats();
}

function confirmEdit() {

  const vals =
    [...board].sort((a, b) => a - b);

  const expected =
    [...Array(16).keys()];

  if (vals.join() !== expected.join()) {

    setMessage(
      'preencha corretamente 0-15',
      'warn'
    );

    return;
  }

  if (!isSolvable(board)) {

    setMessage(
      'este arranjo não possui solução',
      'warn'
    );

    return;
  }

  exitEditMode();

  moveCount = 0;

  startClock();

  render();
}

function clearBoard() {

  board = new Array(16).fill(0);

  selectedVal = null;

  render();
}

/* =========================================================
   SOLVABLE
========================================================= */

function isSolvable(b) {

  let inv = 0;

  for (let i = 0; i < 16; i++) {

    for (let j = i + 1; j < 16; j++) {

      if (
        b[i] &&
        b[j] &&
        b[i] > b[j]
      ) inv++;
    }
  }

  const rowFromBottom =
    4 - Math.floor(b.indexOf(0) / 4);

  return rowFromBottom % 2 === 0
    ? inv % 2 === 1
    : inv % 2 === 0;
}

/* =========================================================
   RANDOM
========================================================= */

function randomBoard() {

  stopSolver();

  exitEditMode();

  do {

    board =
      [...Array(15).keys()].map(x => x + 1);

    board.push(0);

    for (let i = board.length - 1; i > 0; i--) {

      const j =
        Math.floor(Math.random() * (i + 1));

      [board[i], board[j]] =
        [board[j], board[i]];
    }

  } while (!isSolvable(board));

  moveCount = 0;

  updateStats();

  startClock();

  render();
}

/* =========================================================
   WORKER
========================================================= */

/* =========================================================
   WORKER SOLVER ULTRA OTIMIZADO
   IDA* + Manhattan + Linear Conflict + Cache
========================================================= */


const WORKER_SRC = `

<<<<<<< HEAD
/* =========================================================
   GOAL TABLES
========================================================= */

const GOAL_ROW = new Uint8Array(16);
const GOAL_COL = new Uint8Array(16);

for (let i = 1; i <= 15; i++) {
  GOAL_ROW[i] = (i - 1) >> 2;
  GOAL_COL[i] = (i - 1) & 3;
=======
const goalRow = new Array(16);
const goalCol = new Array(16);

for (let i = 1; i <= 15; i++) {

  goalRow[i] = (i - 1) >> 2;
  goalCol[i] = (i - 1) & 3;
}

const MOVE_TABLE = [];

for (let e = 0; e < 16; e++) {

  const row = e >> 2;
  const col = e & 3;

  const mv = [];

  if (row > 0) mv.push(e - 4);
  if (row < 3) mv.push(e + 4);
  if (col > 0) mv.push(e - 1);
  if (col < 3) mv.push(e + 1);

  MOVE_TABLE[e] = mv;
}

function manhattan(board) {

  let h = 0;

  for (let i = 0; i < 16; i++) {

    const v = board[i];

    if (!v) continue;

    h +=
      Math.abs((i >> 2) - goalRow[v]) +
      Math.abs((i & 3) - goalCol[v]);
  }

  return h;
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
}

/* =========================================================
   MOVE TABLE
========================================================= */

const MOVE_TABLE = [];

for (let e = 0; e < 16; e++) {

  const row = e >> 2;
  const col = e & 3;

  const mv = [];

  if (row > 0) mv.push(e - 4);
  if (row < 3) mv.push(e + 4);
  if (col > 0) mv.push(e - 1);
  if (col < 3) mv.push(e + 1);

  MOVE_TABLE[e] = mv;
}

/* =========================================================
   MANHATTAN
========================================================= */

function manhattan(board) {

  let h = 0;

  for (let i = 0; i < 16; i++) {

    const v = board[i];

    if (v === 0) continue;

    h +=
      Math.abs((i >> 2) - GOAL_ROW[v]) +
      Math.abs((i & 3) - GOAL_COL[v]);
  }

  return h;
}

/* =========================================================
   LINEAR CONFLICT
========================================================= */

function linearConflict(board) {

  let c = 0;

<<<<<<< HEAD
  // LINHAS
=======
  // linhas
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
  for (let row = 0; row < 4; row++) {

    for (let col1 = 0; col1 < 4; col1++) {

      const t1 = board[row * 4 + col1];

      if (!t1) continue;
<<<<<<< HEAD

      if (GOAL_ROW[t1] !== row)
        continue;
=======
      if (goalRow[t1] !== row) continue;
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb

      for (let col2 = col1 + 1; col2 < 4; col2++) {

        const t2 = board[row * 4 + col2];

        if (!t2) continue;
<<<<<<< HEAD

        if (GOAL_ROW[t2] !== row)
          continue;

        if (GOAL_COL[t1] > GOAL_COL[t2]) {
=======
        if (goalRow[t2] !== row) continue;

        if (goalCol[t1] > goalCol[t2]) {
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
          c += 2;
        }
      }
    }
  }

<<<<<<< HEAD
  // COLUNAS
=======
  // colunas
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
  for (let col = 0; col < 4; col++) {

    for (let row1 = 0; row1 < 4; row1++) {

      const t1 = board[row1 * 4 + col];

      if (!t1) continue;
<<<<<<< HEAD

      if (GOAL_COL[t1] !== col)
        continue;
=======
      if (goalCol[t1] !== col) continue;
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb

      for (let row2 = row1 + 1; row2 < 4; row2++) {

        const t2 = board[row2 * 4 + col];

        if (!t2) continue;
<<<<<<< HEAD

        if (GOAL_COL[t2] !== col)
          continue;

        if (GOAL_ROW[t1] > GOAL_ROW[t2]) {
=======
        if (goalCol[t2] !== col) continue;

        if (goalRow[t1] > goalRow[t2]) {
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
          c += 2;
        }
      }
    }
  }

  return c;
}

<<<<<<< HEAD
/* =========================================================
   HEURISTIC
========================================================= */

=======
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
function heuristic(board) {
  return manhattan(board) + linearConflict(board);
}

<<<<<<< HEAD
/* =========================================================
   IDA*
========================================================= */

=======
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
function idaStar(startBoard) {

  const board = Uint8Array.from(startBoard);

<<<<<<< HEAD
=======
  const emptyPos = board.indexOf(0);

>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
  let bound = heuristic(board);

  const path = [];

<<<<<<< HEAD
  let iterations = 0;

  while (true) {

    const t = search(
      board,
      board.indexOf(0),
      0,
      bound,
      path,
      -1
    );

    if (t === true)
      return [...path];

    if (t === Infinity)
      return null;

    bound = t;

    iterations++;

    if (iterations % 5 === 0) {

      self.postMessage({
        type: 'progress',
        bound
      });
    }
  }
}

/* =========================================================
   SEARCH
========================================================= */

=======
  for (;;) {

    const pathSet = new Set();

    const t = search(
      board,
      emptyPos,
      0,
      bound,
      path,
      -1,
      pathSet
    );

    if (t === true) {
      return path;
    }

    if (t === Infinity) {
      return null;
    }

    bound = t;

    self.postMessage({
      type: 'progress',
      bound
    });
  }
}

>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
function search(
  board,
  emptyPos,
  g,
  bound,
  path,
<<<<<<< HEAD
  prevEmpty
=======
  prevEmpty,
  pathSet
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
) {

  const h = heuristic(board);

  const f = g + h;

<<<<<<< HEAD
  if (f > bound)
    return f;

  if (h === 0)
    return true;
=======
  if (f > bound) return f;

  if (f > 80) return Infinity;

  if (h === 0) return true;
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb

  const key = board.toString();

  if (pathSet.has(key)) {
    return Infinity;
  }

  pathSet.add(key);

  let min = Infinity;

<<<<<<< HEAD
  let best1 = -1;
  let best2 = -1;
  let best3 = -1;
  let best4 = -1;

  let d1 = 999;
  let d2 = 999;
  let d3 = 999;
  let d4 = 999;

  // MOVE ORDERING
  for (const mv of MOVE_TABLE[emptyPos]) {

    if (mv === prevEmpty)
      continue;

    const tile = board[mv];

    const oldDist =
      Math.abs((mv >> 2) - GOAL_ROW[tile]) +
      Math.abs((mv & 3) - GOAL_COL[tile]);

    const newDist =
      Math.abs((emptyPos >> 2) - GOAL_ROW[tile]) +
      Math.abs((emptyPos & 3) - GOAL_COL[tile]);

    const delta = newDist - oldDist;

    if (delta < d1) {

      d4 = d3; best4 = best3;
      d3 = d2; best3 = best2;
      d2 = d1; best2 = best1;

      d1 = delta;
      best1 = mv;
    }
    else if (delta < d2) {

      d4 = d3; best4 = best3;
      d3 = d2; best3 = best2;

      d2 = delta;
      best2 = mv;
    }
    else if (delta < d3) {

      d4 = d3; best4 = best3;

      d3 = delta;
      best3 = mv;
    }
    else {

      d4 = delta;
      best4 = mv;
    }
  }

  const orderedMoves = [
    best1,
    best2,
    best3,
    best4
  ];

  for (const mv of orderedMoves) {

    if (mv === -1)
      continue;
=======
  const moves = MOVE_TABLE[emptyPos];

  const ordered = new Array(moves.length);

  let k = 0;

  for (const mv of moves) {

    if (mv === prevEmpty) continue;

    const tile = board[mv];

    const oldDist =
      Math.abs((mv >> 2) - goalRow[tile]) +
      Math.abs((mv & 3) - goalCol[tile]);

    const newDist =
      Math.abs((emptyPos >> 2) - goalRow[tile]) +
      Math.abs((emptyPos & 3) - goalCol[tile]);

    ordered[k++] = {
      mv,
      delta: newDist - oldDist
    };
  }

  ordered.length = k;

  ordered.sort((a, b) => a.delta - b.delta);

  for (let i = 0; i < ordered.length; i++) {

    const mv = ordered[i].mv;
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb

    // APPLY
    board[emptyPos] = board[mv];
    board[mv] = 0;

    path.push(mv);

    const t = search(
      board,
      mv,
      g + 1,
      bound,
      path,
<<<<<<< HEAD
      emptyPos
    );

    if (t === true)
      return true;

    if (t < min)
      min = t;
=======
      emptyPos,
      pathSet
    );

    if (t === true) {
      return true;
    }

    if (t < min) {
      min = t;
    }
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb

    // UNDO
    path.pop();

    board[mv] = board[emptyPos];
    board[emptyPos] = 0;
  }

  pathSet.delete(key);

  return min;
}

<<<<<<< HEAD
/* =========================================================
   WORKER
========================================================= */

self.onmessage = function(e) {

  try {
=======
self.onmessage = function(e) {

  const board = e.data.board;

  self.postMessage({
    type: 'phase',
    text: 'resolvendo com IDA*'
  });
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb

    const board = e.data.board;

<<<<<<< HEAD
    self.postMessage({
      type: 'phase',
      text: 'resolvendo ultra rápido...'
    });

    const solution = idaStar(board);

    if (solution) {

      self.postMessage({
        type: 'solution',
        moves: solution
      });

    } else {

      self.postMessage({
        type: 'error',
        message: 'Solução não encontrada'
      });
    }

  } catch (err) {

    self.postMessage({
      type: 'error',
      message: err.message
=======
  if (solution) {

    self.postMessage({
      type: 'solution',
      moves: solution
    });

  } else {

    self.postMessage({
      type: 'error',
      message: 'Solução não encontrada'
>>>>>>> 22727d4994f8eac174bda81baa2f92449edd88bb
    });
  }
};

`;

function createWorker() {

  const blob = new Blob(
    [WORKER_SRC],
    { type: 'application/javascript' }
  );

  return new Worker(
    URL.createObjectURL(blob)
  );
}

/* =========================================================
   SOLVE
========================================================= */

function solve() {

  if (isSolving || isEditMode)
    return;

  if (!isSolvable(board)) {

    setMessage(
      'sem solução possível',
      'warn'
    );

    return;
  }

  isSolving = true;

  setSolverUI(true);

  showProgress(true);

  setMessage(
    'resolvendo...',
    'info'
  );

  solverWorker = createWorker();

  solverWorker.onmessage = function(ev) {

    const data = ev.data;

    if (data.type === 'progress') {

      document
        .getElementById('progress-label')
        .textContent =
        'bound ' + data.bound;
    }

    if (data.type === 'solution') {

      isSolving = false;

      setSolverUI(false);

      showProgress(false);

      document
        .getElementById('stat-ai')
        .textContent =
        data.moves.length;

      setMessage(
        '✓ solução encontrada',
        'win'
      );

      animateSolution(data.moves);
    }

    if (data.type === 'error') {

      isSolving = false;

      setSolverUI(false);

      showProgress(false);

      setMessage(
        'erro no solver',
        'warn'
      );
    }
  };

  solverWorker.postMessage({
    board: [...board]
  });

  
  solverWorker.onerror = function(err) {

    console.error(err);

    isSolving = false;

    setSolverUI(false);

    showProgress(false);

    setMessage(
      'erro interno no worker',
      'warn'
    );
  };

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

/* =========================================================
   ANIMATION
========================================================= */

function animateSolution(moves) {

  let i = 0;

  stopClock();

  animInterval = setInterval(() => {

    if (i >= moves.length) {

      clearInterval(animInterval);

      animInterval = null;

      render();

      setMessage(
        '✓ resolvido pela IA',
        'win'
      );

      return;
    }

    swapWithEmpty(moves[i]);

    render();

    i++;

  }, 80);
}

/* =========================================================
   UI
========================================================= */

function updateStats() {

  document
    .getElementById('stat-moves')
    .textContent = moveCount;

  document
    .getElementById('stat-mode')
    .textContent =
    isEditMode
      ? 'edição'
      : 'jogo';

  document
    .getElementById('stat-h')
    .textContent =
    isEditMode
      ? '—'
      : manhattan(board);
}

function setMessage(text, type='info') {

  const el =
    document.getElementById('message');

  el.textContent = text;

  el.className =
    'message ' + type;
}

function setSolverUI(solving) {

  document
    .getElementById('btn-solve')
    .disabled = solving;

  document
    .getElementById('btn-stop')
    .classList.toggle('hidden', !solving);
}

function showProgress(show) {

  document
    .getElementById('progress-track')
    .classList.toggle('active', show);
}

/* =========================================================
   EVENTS
========================================================= */

document.getElementById('btn-random').onclick =
  randomBoard;

document.getElementById('btn-edit').onclick =
  enterEditMode;

document.getElementById('btn-clear').onclick =
  clearBoard;

document.getElementById('btn-confirm').onclick =
  confirmEdit;

document.getElementById('btn-solve').onclick =
  solve;

document.getElementById('btn-stop').onclick =
  () => {
    stopSolver();
    setMessage('solver cancelado', 'info');
  };

/* =========================================================
   START
========================================================= */

randomBoard();