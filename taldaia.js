let board = [];
let solverWorker = null;
let isSolving = false;

function init() {
  stopSolver();

  do {
    board = [...Array(15).keys()].map(x => x + 1);
    board.push(0);
    shuffle();
  } while (!isSolvable(board));

  render();
  document.getElementById("info").textContent = "";
  document.getElementById("path").textContent = "";
}

function shuffle() { //embaralha os numero - fazer o codigo para ver se é fazivel 14 15 não pode ser solucionado
  for (let i = board.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [board[i], board[j]] = [board[j], board[i]];
  }
}

function render() {
  const div = document.getElementById("board");
  div.innerHTML = "";

  board.forEach((num, i) => {
    let tile = document.createElement("div");
    tile.classList.add("tile");

    if (num === 0) {
      tile.classList.add("empty");
    } else {
      tile.textContent = num;
      tile.onclick = () => move(i);
    }

    div.appendChild(tile);
  });
}

function move(i) {
  if (isSolving) return;

  if (getMoves().includes(i)) {
    swap(i);
    render();
  }
}

function getMoves() {
  let e = board.indexOf(0);
  let moves = [];
  let r = Math.floor(e / 4);
  let c = e % 4;

  if (r > 0) moves.push(e - 4);
  if (r < 3) moves.push(e + 4);
  if (c > 0) moves.push(e - 1);
  if (c < 3) moves.push(e + 1);

  return moves;
}

function swap(i) { //sai peça e entra espaço vazio
  let e = board.indexOf(0);
  [board[e], board[i]] = [board[i], board[e]];
}

function isSolvable(b) {
  let inv = 0;
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (b[i] && b[j] && b[i] > b[j]) inv++;
    }
  }
  let row = 4 - Math.floor(b.indexOf(0) / 4);
  return row % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
}


//arruma o problema de travar o navegador, fazer ele rodar em paralelo com o navegador,

const workerCode = `
function h(b){ 
 let d=0;
 for(let i=0;i<16;i++){
  let v=b[i]; if(v===0) continue;
  let tr=(v-1)>>2, tc=(v-1)&3;
  let r=i>>2, c=i&3;
  d+=Math.abs(r-tr)+Math.abs(c-tc);
 }
 return d;
}

function moves(e){
 let m=[],r=e>>2,c=e&3;
 if(r>0)m.push(e-4);
 if(r<3)m.push(e+4);
 if(c>0)m.push(e-1);
 if(c<3)m.push(e+1);
 return m;
}

function ida(b){
 let bound=h(b), path=[];
 while(true){
  let t=search(b,0,bound,path,-1);
  if(t===true)return path;
  if(t===Infinity)return null;
  bound=t;
 }
}

//função que calcula o custo e testa as possibilidades

function search(b,g,bound,path,prev){
 let e=b.indexOf(0);
 let f=g+h(b);
 if(f>bound)return f;
 if(h(b)===0)return true;

 let min=Infinity;
 for(let m of moves(e)){
  if(m===prev)continue;

  [b[e],b[m]]=[b[m],b[e]];
  path.push(m);

  let t=search(b,g+1,bound,path,e);
  if(t===true)return true;
  if(t<min)min=t;

  path.pop();
  [b[e],b[m]]=[b[m],b[e]];
 }
 return min;
}

onmessage=e=>{
 let sol=ida([...e.data.board]);
 if(sol) postMessage({type:"solution",moves:sol});
 else postMessage({type:"error"});
}

//comunica, fazer uma resolução semelhante no codigo da tela bonita
`;

// rodar em paralelo ou tem que ver ele no processo de rodar?
// se rodar em paralelo não da pra ver o tempo que levou

function createWorker() {
  return new Worker(URL.createObjectURL(new Blob([workerCode])));
}

function solve() {
  if (isSolving) return;

  if (!isSolvable(board)) {
    document.getElementById("info").textContent = "Sem solução";
    return;
  }

  isSolving = true;
  solverWorker = createWorker();

  solverWorker.onmessage = (e) => {
    let { type, moves } = e.data;

    if (type === "solution") {
      isSolving = false;

      document.getElementById("info").textContent =
        "Movimentos: " + moves.length;

      let temp = [...board];
      let path = [];

      for (let m of moves) {
        let e = temp.indexOf(0);
        path.push(dir(e, m));
        [temp[e], temp[m]] = [temp[m], temp[e]];
      }

      document.getElementById("path").textContent =
        path.join(" ");

      animate(moves);
    }
  };

  solverWorker.postMessage({ board });
}

function animate(moves) {
  let i = 0;
  let interval = setInterval(() => {
    if (i >= moves.length) return clearInterval(interval);
    swap(moves[i]);
    render();
    i++;
  }, 120);
}

function stopSolver() {
  if (solverWorker) solverWorker.terminate();
  isSolving = false;
}

function dir(e, m) {
  let d = m - e;
  if (d === -4) return "↑";
  if (d === 4) return "↓";
  if (d === -1) return "←";
  if (d === 1) return "→";
}
//mostra o caminho, esse não esta saindo na outra tela

document.getElementById("btn-new").onclick = init;
document.getElementById("btn-solve").onclick = solve;
document.getElementById("btn-stop").onclick = stopSolver;

init();


//codigo para interface bonita, com timer,

//arrumar a interface

//esse codigo aqui ele tem um leve problema de demorar mais, talvez pelas funçoes fazerem mais coisas
//ver pq isso acontece

/*
let board = [];
let moveCount = 0;
let timerInterval = null;
let startTime = null;
let animationInterval = null;
let solverWorker = null;
let isSolving = false;

function init() {
  stopSolver();
  do {
    board = [...Array(15).keys()].map(x => x + 1);
    board.push(0);
    shuffle();
  } while (!isSolvable(board));

  moveCount = 0;
  updateMoves();
  document.getElementById('ai-moves').textContent = '—';
  setMessage('');
  startTimer();
  render();
}

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    document.getElementById('timer').textContent = elapsed.toFixed(1) + 's';
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateMoves() {
  document.getElementById('moves').textContent = moveCount;
}

function shuffle() {
  // Fisher-Yates
  for (let i = board.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [board[i], board[j]] = [board[j], board[i]];
  }
}

function render() {
  const boardDiv = document.getElementById('board');
  boardDiv.innerHTML = '';
  const validMoves = getValidMoves();

  board.forEach((num, index) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');

    if (num === 0) {
      tile.classList.add('empty');
    } else {
      tile.innerText = num;
      if (validMoves.includes(index)) tile.classList.add('movable');
      if (isSolving) tile.classList.add('solving');
      tile.onclick = () => playerMove(index);
    }

    boardDiv.appendChild(tile);
  });
}

function getEmptyIndex() {
  return board.indexOf(0);
}

function getValidMoves() {
  const empty = getEmptyIndex();
  const moves = [];
  const row = Math.floor(empty / 4);
  const col = empty % 4;

  if (row > 0) moves.push(empty - 4);
  if (row < 3) moves.push(empty + 4);
  if (col > 0) moves.push(empty - 1);
  if (col < 3) moves.push(empty + 1);

  return moves;
}

function playerMove(index) {
  if (isSolving) return;
  if (getValidMoves().includes(index)) {
    swap(index);
    moveCount++;
    updateMoves();
    render();
    checkWin();
  }
}

function swap(index) {
  const empty = getEmptyIndex();
  [board[empty], board[index]] = [board[index], board[empty]];
}

function checkWin() {
  for (let i = 0; i < 15; i++) {
    if (board[i] !== i + 1) return;
  }
  if (board[15] !== 0) return;
  stopTimer();
  setMessage('🎉 Você venceu!', 'win');
}

function isSolvable(b) {
  let inversions = 0;
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (b[i] && b[j] && b[i] > b[j]) inversions++;
    }
  }
  const emptyRow = Math.floor(b.indexOf(0) / 4);
  const rowFromBottom = 4 - emptyRow;

  return rowFromBottom % 2 === 0
    ? inversions % 2 === 1
    : inversions % 2 === 0;
}

const workerCode = `
// ── Heurística: Manhattan Distance + Linear Conflict ──
function heuristic(board) {
  let dist = manhattan(board);
  dist += linearConflict(board);
  return dist;
}

function manhattan(board) {
  let dist = 0;
  for (let i = 0; i < 16; i++) {
    const val = board[i];
    if (val === 0) continue;
    const targetRow = (val - 1) >> 2;   // Math.floor((val-1)/4)
    const targetCol = (val - 1) & 3;    // (val-1) % 4
    const row = i >> 2;
    const col = i & 3;
    dist += Math.abs(row - targetRow) + Math.abs(col - targetCol);
  }
  return dist;
}

// Linear Conflict: adiciona +2 para cada par de peças na mesma linha/coluna
// que estão invertidas em relação às suas posições alvo
function linearConflict(board) {
  let conflict = 0;

  // Linhas
  for (let row = 0; row < 4; row++) {
    const tiles = [];
    for (let col = 0; col < 4; col++) {
      const val = board[row * 4 + col];
      if (val !== 0 && (val - 1) >> 2 === row) {
        tiles.push({ val, col });
      }
    }
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const tColI = (tiles[i].val - 1) & 3;
        const tColJ = (tiles[j].val - 1) & 3;
        if (tiles[i].col > tiles[j].col && tColI < tColJ) conflict += 2;
      }
    }
  }

  // Colunas
  for (let col = 0; col < 4; col++) {
    const tiles = [];
    for (let row = 0; row < 4; row++) {
      const val = board[row * 4 + col];
      if (val !== 0 && (val - 1) & 3 === col) {
        tiles.push({ val, row });
      }
    }
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const tRowI = (tiles[i].val - 1) >> 2;
        const tRowJ = (tiles[j].val - 1) >> 2;
        if (tiles[i].row > tiles[j].row && tRowI < tRowJ) conflict += 2;
      }
    }
  }

  return conflict;
}

// ── Movimentos válidos a partir de um estado ──
function getMovesFromState(emptyIdx) {
  const moves = [];
  const row = emptyIdx >> 2;
  const col = emptyIdx & 3;
  if (row > 0) moves.push(emptyIdx - 4);
  if (row < 3) moves.push(emptyIdx + 4);
  if (col > 0) moves.push(emptyIdx - 1);
  if (col < 3) moves.push(emptyIdx + 1);
  return moves;
}

// ── IDA* ──
// CORREÇÃO: prevEmpty guarda o índice do empty ANTES do movimento
// para evitar desfazer o último movimento (move reverso)
function idaStar(startBoard) {
  let bound = heuristic(startBoard);
  const path = [];

  for (let iter = 0; iter < 200; iter++) {
    const t = search(startBoard, 0, bound, path, -1);
    if (t === true) return path;
    if (t === Infinity) return null;
    bound = t;
    // Reporta progresso a cada iteração
    self.postMessage({ type: 'progress', bound });
  }
  return null;
}

function search(board, g, bound, path, prevEmpty) {
  const emptyIdx = board.indexOf(0);
  const h = heuristic(board);
  const f = g + h;

  if (f > bound) return f;

  // Objetivo: 1..15 nas posições 0..14, 0 na posição 15
  if (h === 0) return true;

  let min = Infinity;
  const moves = getMovesFromState(emptyIdx);

  for (const move of moves) {
    // CORREÇÃO: evita desfazer o último movimento comparando
    // o índice do tile movido com onde estava o empty antes
    if (move === prevEmpty) continue;

    // Aplica movimento in-place (sem criar novo array) e desfaz depois
    board[emptyIdx] = board[move];
    board[move] = 0;

    path.push(move);

    // CORREÇÃO: passa emptyIdx (onde estava o zero) como prevEmpty
    const t = search(board, g + 1, bound, path, emptyIdx);

    if (t === true) return true;
    if (t < min) min = t;

    // Desfaz movimento
    path.pop();
    board[move] = board[emptyIdx];
    board[emptyIdx] = 0;
  }

  return min;
}

// ── Listener ──
self.onmessage = function(e) {
  const { board } = e.data;
  self.postMessage({ type: 'start' });

  const solution = idaStar([...board]);

  if (solution) {
    self.postMessage({ type: 'solution', moves: solution });
  } else {
    self.postMessage({ type: 'error', message: 'Solução não encontrada.' });
  }
};
`;

function createWorker() {
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

function solve() {
  if (isSolving) return;

  let solved = true;
  for (let i = 0; i < 15; i++) { if (board[i] !== i + 1) { solved = false; break; } }
  if (solved) { setMessage('O tabuleiro já está resolvido!', 'info'); return; }

  if (!isSolvable(board)) {
    setMessage('Este estado não tem solução.', 'warn');
    return;
  }

  isSolving = true;
  setSolverUI(true);
  setMessage('Calculando solução…', 'info');
  showProgress(true);

  solverWorker = createWorker();

  solverWorker.onmessage = function(e) {
    const { type, moves, bound, message } = e.data;

    if (type === 'progress') {
      const pct = Math.min(100, (30 / bound) * 100);
      document.getElementById('progress-fill').style.width = pct + '%';
    }

    if (type === 'solution') {
      isSolving = false;
      setSolverUI(false);
      showProgress(false);
      document.getElementById('ai-moves').textContent = moves.length;
      setMessage(`Solução com ${moves.length} movimentos!`, 'info');
      animateSolution(moves);
    }

    if (type === 'error') {
      isSolving = false;
      setSolverUI(false);
      showProgress(false);
      setMessage(message, 'warn');
    }
  };

  solverWorker.onerror = function() {
    isSolving = false;
    setSolverUI(false);
    showProgress(false);
    setMessage('Erro ao executar o solver.', 'warn');
  };

  solverWorker.postMessage({ board: [...board] });
}

function stopSolver() {
  if (solverWorker) {
    solverWorker.terminate();
    solverWorker = null;
  }
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  isSolving = false;
  setSolverUI(false);
  showProgress(false);
}

function animateSolution(moves) {
  let i = 0;
  stopTimer();

  animationInterval = setInterval(() => {
    if (i >= moves.length) {
      clearInterval(animationInterval);
      animationInterval = null;
      setMessage(`✓ Resolvido em ${moves.length} movimentos!`, 'win');
      render();
      return;
    }

    swap(moves[i]);
    render();
    i++;
  }, 120);
}

function setMessage(text, type = 'win') {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className = 'message ' + type;
}

function setSolverUI(solving) {
  document.getElementById('btn-solve').disabled = solving;
  document.getElementById('btn-stop').style.display = solving ? 'inline-block' : 'none';
}

function showProgress(show) {
  document.getElementById('progress-bar').classList.toggle('active', show);
  if (!show) document.getElementById('progress-fill').style.width = '0%';
}

document.getElementById('btn-new').addEventListener('click', init);
document.getElementById('btn-solve').addEventListener('click', solve);
document.getElementById('btn-stop').addEventListener('click', () => {
  stopSolver();
  setMessage('Solver interrompido.', 'info');
  render();
});

function getDirection(fromEmpty, toIndex) {
  const diff = toIndex - fromEmpty;

   if (d === -4) return "↑";
   if (d === 4) return "↓";
   if (d === -1) return "←";
   if (d === 1) return "→";

  return "?";
}

if (type === 'solution') {
  isSolving = false;
  setSolverUI(false);
  showProgress(false);

  document.getElementById('ai-moves').textContent = moves.length;

  let tempBoard = [...board];
  let pathText = [];

  for (let move of moves) {
    let empty = tempBoard.indexOf(0);
    pathText.push(getDirection(empty, move));

    [tempBoard[empty], tempBoard[move]] = [tempBoard[move], tempBoard[empty]];
  }

  document.getElementById('ai-path').textContent =
    pathText.join(" ");

  setMessage(`Solução com ${moves.length} movimentos!`, 'info');

  animateSolution(moves);
}

init();

*/ 