// 遊戲變量
let canvas, ctx, nextPieceCanvas, nextPieceCtx;
let gameBoard = [];
let currentPiece, nextPiece;
let score = 0;
let level = 1;
let gameLoop;
let currentUser = null;

// 方塊形狀
const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

// 顏色
const COLORS = [
    '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'
];

// 遊戲配置
const ROWS = 20;
const COLS = 12;
const BLOCK_SIZE = 20;

// 初始化遊戲
function initGame() {
    canvas = document.getElementById('tetris');
    ctx = canvas.getContext('2d');
    nextPieceCanvas = document.getElementById('next-piece');
    nextPieceCtx = nextPieceCanvas.getContext('2d');

    // 初始化遊戲板
    for (let row = 0; row < ROWS; row++) {
        gameBoard[row] = [];
        for (let col = 0; col < COLS; col++) {
            gameBoard[row][col] = 0;
        }
    }

    // 生成第一個方塊
    currentPiece = generatePiece();
    nextPiece = generatePiece();

    // 開始遊戲循環
    gameLoop = setInterval(update, 1000 / level);

    // 添加鍵盤事件監聽器
    document.addEventListener('keydown', handleKeyPress);
}


// 生成新方塊
function generatePiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    return {
        shape: SHAPES[shapeIndex],
        color: COLORS[colorIndex],
        row: 0,
        col: Math.floor(COLS / 2) - Math.ceil(SHAPES[shapeIndex][0].length / 2)
    };
}

// 更新遊戲狀態
function update() {
    if (canMove(currentPiece.shape, currentPiece.row + 1, currentPiece.col)) {
        currentPiece.row++;
    } else {
        placePiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = generatePiece();
        if (!canMove(currentPiece.shape, currentPiece.row, currentPiece.col)) {
            gameOver();
        }
    }
    draw();
}

// 檢查是否可以移動
function canMove(shape, newRow, newCol) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                if (newRow + row >= ROWS || newCol + col < 0 || newCol + col >= COLS || gameBoard[newRow + row][newCol + col]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// 放置方塊
function placePiece() {
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                gameBoard[currentPiece.row + row][currentPiece.col + col] = currentPiece.color;
            }
        }
    }
}

// 清除完整的行
function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (gameBoard[row].every(cell => cell !== 0)) {
            gameBoard.splice(row, 1);
            gameBoard.unshift(Array(COLS).fill(0));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        level = Math.floor(score / 1000) + 1;
        clearInterval(gameLoop);
        gameLoop = setInterval(update, 1000 / level);
        updateScore();
    }
}

// 更新分數顯示
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
}

// 繪製遊戲畫面
function draw() {
    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);

    // 繪製遊戲板
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (gameBoard[row][col]) {
                drawBlock(ctx, col, row, gameBoard[row][col]);
            }
        }
    }

    // 繪製當前方塊
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                drawBlock(ctx, currentPiece.col + col, currentPiece.row + row, currentPiece.color);
            }
        }
    }

    // 繪製下一個方塊
    for (let row = 0; row < nextPiece.shape.length; row++) {
        for (let col = 0; col < nextPiece.shape[row].length; col++) {
            if (nextPiece.shape[row][col]) {
                drawBlock(nextPieceCtx, col, row, nextPiece.color, 15);
            }
        }
    }
}

// 繪製方塊
function drawBlock(context, col, row, color, size = BLOCK_SIZE) {
    context.fillStyle = color;
    context.fillRect(col * size, row * size, size - 1, size - 1);
}

// 處理鍵盤事件
function handleKeyPress(event) {
    switch (event.keyCode) {
        case 37: // 左箭頭
            if (canMove(currentPiece.shape, currentPiece.row, currentPiece.col - 1)) {
                currentPiece.col--;
            }
            break;
        case 39: // 右箭頭
            if (canMove(currentPiece.shape, currentPiece.row, currentPiece.col + 1)) {
                currentPiece.col++;
            }
            break;
        case 40: // 下箭頭
            if (canMove(currentPiece.shape, currentPiece.row + 1, currentPiece.col)) {
                currentPiece.row++;
            }
            break;
        case 38: // 上箭頭 (旋轉)
            const rotated = rotate(currentPiece.shape);
            if (canMove(rotated, currentPiece.row, currentPiece.col)) {
                currentPiece.shape = rotated;
            }
            break;
    }
    draw();
}

// 旋轉方塊
function rotate(shape) {
    const newShape = [];
    for (let col = 0; col < shape[0].length; col++) {
        newShape.push([]);
        for (let row = shape.length - 1; row >= 0; row--) {
            newShape[col].push(shape[row][col]);
        }
    }
    return newShape;
}

// 遊戲結束
function gameOver() {
    clearInterval(gameLoop);
    alert(`遊戲結束！你的分數是: ${score}`);
    if (currentUser) {
        saveScore(currentUser, score);
    }
    resetGame();
}

// 重置遊戲
function resetGame() {
    gameBoard = [];
    score = 0;
    level = 1;
    updateScore();
    initGame();
}

// 保存分數
function saveScore(username, score) {
    let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push({ username, score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 10); // 只保留前10名
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

// 顯示高分榜
function showHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = '';
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score.username}: ${score.score}`;
        highScoresList.appendChild(li);
    });
    document.getElementById('high-scores').style.display = 'block';
}

// 事件監聽器
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-board').style.display = 'flex';
    initGame();
});

document.getElementById('register-btn').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

document.getElementById('login-btn').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

document.getElementById('high-scores-btn').addEventListener('click', showHighScores);

document.getElementById('close-high-scores').addEventListener('click', () => {
    document.getElementById('high-scores').style.display = 'none';
});