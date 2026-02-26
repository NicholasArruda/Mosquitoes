const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos DOM
const startScreen = document.getElementById('start-screen');
const pauseScreen = document.getElementById('pause-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const pauseBtn = document.getElementById('pause-btn');

// Variáveis
let gameRunning = false;
let isPaused = false;
let score = 0;
let lives = 3;
let speedMultiplier = 1;
let animationId;

// dicas de prevenção que aparecerão na tela de fim de jogo
const preventionTips = [
    'Mantenha o ambiente limpo e livre de lixo para não atrair mosquitos.',
    'Use repelente regularmente ao sair de casa, principalmente ao anoitecer.',
    'Evite áreas com acúmulo de matéria orgânica e solo úmido.',
    'Proteja seu cão com produtos veterinários adequados.',
    'Drene a água parada em recipientes ao redor da casa para não criar criadouros.'
];
// bone image
let boneImage = new Image();
let boneImageLoaded = false;
boneImage.src = 'assets/osso.png';
boneImage.onload = () => { boneImageLoaded = true; };

// sidewalk image (try accented filename first, then fallback)
let sidewalkImage = new Image();
let sidewalkImageLoaded = false;
sidewalkImage.onload = () => { sidewalkImageLoaded = true; };
sidewalkImage.onerror = () => {
    // try unaccented fallback
    if (sidewalkImage.src.indexOf('calçada.png') !== -1 || sidewalkImage.src.indexOf('cal%C3%A7ada.png') !== -1) {
        sidewalkImage.src = 'assets/calcada.png';
    }
};
sidewalkImage.src = 'assets/calçada.png';

// repellent image
let repellentImage = new Image();
let repellentImageLoaded = false;
repellentImage.src = 'assets/repelente.png';
repellentImage.onload = () => { repellentImageLoaded = true; };
repellentImage.onerror = () => {
    // try unaccented fallback
    if (repellentImage.src.indexOf('repelente.png') !== -1) {
        repellentImage.src = 'assets/repellent.png';
    }
};

// Resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Classes
class Player {
    constructor() {
        this.width = 60;
        this.height = 60;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 120;
        this.targetX = this.x;
    }

    draw() {
        // Corpo
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();

        // Orelhas
        ctx.fillStyle = '#5D2906';
        ctx.beginPath();
        ctx.ellipse(this.x + 10, this.y + 10, 8, 15, -0.3, 0, Math.PI * 2);
        ctx.ellipse(this.x + this.width - 10, this.y + 10, 8, 15, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Focinho
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height - 10, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(this.x + 18, this.y + 25, 6, 0, Math.PI * 2);
        ctx.arc(this.x + this.width - 18, this.y + 25, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 18, this.y + 25, 3, 0, Math.PI * 2);
        ctx.arc(this.x + this.width - 18, this.y + 25, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    update(targetX) {
        // Suavização
        this.targetX = targetX - this.width / 2;
        this.targetX = Math.max(0, Math.min(this.targetX, canvas.width - this.width));
        this.x += (this.targetX - this.x) * 0.2;
    }
}

class Mosquito {
    constructor() {
        this.width = 30;
        this.height = 15;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -50;
        this.speed = (Math.random() * 3 + 2.5) * speedMultiplier;
        this.wingPhase = Math.random() * Math.PI * 2;
    }

    draw() {
        this.wingPhase += 0.5;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Asas vibrando
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for(let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.ellipse(i === 0 ? -8 : 8, -5, 15, 6, Math.sin(this.wingPhase) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Corpo
        ctx.fillStyle = '#D2B48C'; // Cor palha
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pernas
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1;
        for(let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 6, 5);
            ctx.lineTo(i * 10, 15);
            ctx.stroke();
        }

        // Probóscide (ferrão)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(25, 2);
        ctx.stroke();

        ctx.restore();
    }

    update() {
        this.y += this.speed;
        // Movimento em zigue-zague
        this.x += Math.sin(this.y * 0.02) * 1.5;
    }
}

class Repellent {
    constructor() {
        this.width = 70;
        this.height = 91;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -50;
        this.speed = 4 * speedMultiplier;
        this.rotation = 0;
    }

    draw() {
        this.rotation += 0.05;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        if (repellentImageLoaded) {
            // draw the repellent sprite centered
            ctx.drawImage(repellentImage, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // fallback: simple green bottle if image not loaded
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 15;

            // Garrafa
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.roundRect(-10, -15, 20, 30, 5);
            ctx.fill();

            // Tampa
            ctx.fillStyle = '#006400';
            ctx.beginPath();
            ctx.roundRect(-6, -22, 12, 8, 2);
            ctx.fill();

            // Label
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('R', -4, 5);
        }

        ctx.restore();
    }

    update() {
        this.y += this.speed;
    }
}

// gadget osso dá vida extra até máximo de 3
class Bone {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -50;
        this.speed = 3 * speedMultiplier;
        this.rotation = Math.random() * Math.PI * 2;
        this.spin = (Math.random() * 0.12 + 0.04) * (Math.random() < 0.5 ? -1 : 1);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        if (boneImageLoaded) {
            // draw the bone sprite centered
            ctx.drawImage(boneImage, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // fallback: simple shape if image not loaded
            ctx.fillStyle = '#F5DEB3';
            ctx.strokeStyle = '#DEB887';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -5);
            ctx.lineTo(10, -5);
            ctx.lineTo(10, 5);
            ctx.lineTo(-10, 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(-10, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(10, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        // continuous rotation while falling
        this.rotation += this.spin;
        // slight horizontal sway
        this.x += Math.sin(this.y * 0.02) * 0.5;
    }
}

// Variáveis de jogo
let player = new Player();
let enemies = [];
let items = [];
let bones = [];
let enemyTimer = 0;
let itemTimer = 0;
let boneTimer = 0;
let inputX = canvas.width / 2;

// Input
function handleInput(x) {
    inputX = x;
}

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handleInput(e.touches[0].clientX);
}, { passive: false });

window.addEventListener('touchstart', (e) => {
    handleInput(e.touches[0].clientX);
});

window.addEventListener('mousemove', (e) => {
    if(gameRunning && !isPaused) handleInput(e.clientX);
});

// Pause
pauseBtn.addEventListener('click', () => {
    if(gameRunning && !isPaused) {
        isPaused = true;
        pauseScreen.classList.remove('hidden');
        updatePauseIcon();
    }
});

// atualiza o ícone do botão de pausa/play conforme estado
function updatePauseIcon() {
    const icon = document.getElementById('pause-icon');
    const labelSpan = pauseBtn.querySelector('.btn-label');
    if (!icon) return;
    if (isPaused || !gameRunning) {
        icon.src = 'assets/play.png';
        icon.alt = 'Continuar';
        pauseBtn.title = 'Continuar o jogo';
        pauseBtn.setAttribute('aria-label', 'Continuar');
        if (labelSpan) labelSpan.textContent = 'Continuar';
    } else {
        icon.src = 'assets/pause.png';
        icon.alt = 'Pausar';
        pauseBtn.title = 'Pausar o jogo';
        pauseBtn.setAttribute('aria-label', 'Pausar');
        if (labelSpan) labelSpan.textContent = 'Pausar';
    }
}

function resumeGame() {
    isPaused = false;
    pauseScreen.classList.add('hidden');
    updatePauseIcon();
    lastTime = performance.now();
    gameLoop(performance.now());
}

function quitGame() {
    gameRunning = false;
    isPaused = false;
    pauseScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    updatePauseIcon();
}

// Loop
let lastTime = 0;

function gameLoop(timestamp) {
    if (!gameRunning || isPaused) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo
    drawBackground();

    // Spawn
    enemyTimer += deltaTime;
    itemTimer += deltaTime;
    speedMultiplier = 1 + (score / 300);

    if (enemyTimer > 800 / speedMultiplier) {
        enemies.push(new Mosquito());
        enemyTimer = 0;
    }

    if (itemTimer > 2500) {
        items.push(new Repellent());
        itemTimer = 0;
    }
    // spawn de osso esporádico (aprox uma vez a cada 15s)
    boneTimer += deltaTime;
    if (boneTimer > 15000) {
        if (Math.random() < 0.5) bones.push(new Bone());
        boneTimer = 0;
    }

    // Player
    player.update(inputX);
    player.draw();

    // Enemies
    enemies.forEach((e, i) => {
        e.update();
        e.draw();
        if (e.y > canvas.height) enemies.splice(i, 1);
    });

    // Items
    items.forEach((i, index) => {
        i.update();
        i.draw();
        if (i.y > canvas.height) items.splice(index, 1);
    });
    // Bones
    bones.forEach((b, idx) => {
        b.update();
        b.draw();
        if (b.y > canvas.height) bones.splice(idx, 1);
    });

    // Colisões
    checkCollisions();

    // efeitos visuais de colisão
    updateEffects();

    animationId = requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Chão / calçada
    const sidewalkY = canvas.height - 80;
    if (sidewalkImageLoaded) {
        // draw the sidewalk texture stretched to the sidewalk area
        ctx.drawImage(sidewalkImage, 0, sidewalkY, canvas.width, 80);
        // overlay lines to emphasize joints (no transparency)
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, sidewalkY);
            ctx.lineTo(x, sidewalkY + 80);
            ctx.stroke();
        }
        for (let y = sidewalkY; y <= sidewalkY + 80; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.restore();
    } else {
        // fallback: simple drawn sidewalk
        ctx.fillStyle = '#A9A9A9';
        ctx.fillRect(0, sidewalkY, canvas.width, 80);
        // juntas da calçada (linhas entre ladrilhos)
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, sidewalkY);
            ctx.lineTo(x, sidewalkY + 80);
            ctx.stroke();
        }
        for (let y = sidewalkY; y <= sidewalkY + 80; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // Nuvens
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const time = Date.now() * 0.0001;
    for(let i=0; i<3; i++) {
        let nx = ((i * 200) + time * 50) % (canvas.width + 100) - 50;
        ctx.beginPath();
        ctx.arc(nx, 80, 30, 0, Math.PI * 2);
        ctx.arc(nx + 25, 70, 35, 0, Math.PI * 2);
        ctx.arc(nx + 50, 80, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

// effects generated by collisions (particles, flashes, etc.)
let effects = [];

function checkCollisions() {
    // Mosquito
    enemies.forEach((e, i) => {
        if (rectIntersect(player.x, player.y, player.width, player.height,
                          e.x, e.y, e.width, e.height)) {
            lives--;
            enemies.splice(i, 1);
            updateHUD();
            screenShake();
            createEffect(player.x + player.width/2, player.y + player.height/2, 'hit');
            if (lives <= 0) gameOver();
        }
    });

    // Repelente
    items.forEach((item, i) => {
        if (rectIntersect(player.x, player.y, player.width, player.height,
                          item.x, item.y, item.width, item.height)) {
            score += 10;
            items.splice(i, 1);
            updateHUD();
            createEffect(item.x + item.width/2, item.y + item.height/2, 'collect');
        }
    });
    // Osso
    bones.forEach((b, i) => {
        if (rectIntersect(player.x, player.y, player.width, player.height,
                          b.x, b.y, b.width, b.height)) {
            bones.splice(i, 1);
            if (lives < 3) {
                lives++;
                updateHUD();
                createEffect(b.x + b.width/2, b.y + b.height/2, 'bone');
            }
        }
    });
}


function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

function screenShake() {
    canvas.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`;
    setTimeout(() => canvas.style.transform = 'none', 100);
}

// -----------------------------------
// Collision / particle effects
// -----------------------------------
class Effect {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'hit', 'collect' or 'bone'
        this.life = 30;
        this.maxLife = 30;
        this.radius = type === 'hit' ? 20 : 10;
        // for bone we will generate particles
        if (type === 'bone') {
            this.particles = [];
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 / 12) * i;
                const speed = Math.random() * 2 + 1;
                this.particles.push({
                    x: 0,
                    y: 0,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: `hsl(${Math.random()*60+30}, 100%, 50%)`
                });
            }
        }
    }

    update() {
        this.life--;
        if (this.type === 'hit') {
            this.radius += 1;
        } else if (this.type === 'collect') {
            this.radius += 0.5;
        } else if (this.type === 'bone') {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.98;
                p.vy *= 0.98;
            });
        }
    }

    draw() {
        const alpha = this.life / this.maxLife;
        if (this.type === 'hit') {
            ctx.strokeStyle = `rgba(255,0,0,${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'collect') {
            ctx.fillStyle = `rgba(0,255,0,${alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'bone') {
            this.particles.forEach(p => {
                ctx.fillStyle = `${p.color.replace(', 1)', `, ${alpha})`)}`;
                ctx.beginPath();
                ctx.arc(this.x + p.x, this.y + p.y, 4 * alpha, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
}

function createEffect(x, y, type) {
    effects.push(new Effect(x, y, type));
}

function updateEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        const ef = effects[i];
        ef.update();
        ef.draw();
        if (ef.life <= 0) effects.splice(i, 1);
    }
}

function updateHUD() {
    document.getElementById('scoreDisplay').textContent = `Pontos: ${score}`;
    document.getElementById('healthDisplay').textContent = '❤️'.repeat(lives);
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    score = 0;
    lives = 3;
    enemies = [];
    items = [];
    bones = [];
    enemyTimer = 0;
    itemTimer = 0;
    boneTimer = 0;
    speedMultiplier = 1;
    player = new Player();
    inputX = canvas.width / 2;
    
    updateHUD();
    gameRunning = true;
    isPaused = false;
    updatePauseIcon();
    lastTime = performance.now();
    gameLoop(performance.now());
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    document.getElementById('final-score').textContent = score;
    // mostrar dica aleatória numerada
    const titleEl = document.getElementById('game-over-tip-title');
    const textEl = document.getElementById('game-over-tip-text');
    if(titleEl && textEl) {
        const randomIndex = Math.floor(Math.random() * preventionTips.length);
        titleEl.textContent = `Dica #${randomIndex + 1}`;
        textEl.textContent = preventionTips[randomIndex];
    }
    gameOverScreen.classList.remove('hidden');
}

// Tecla Escape para pause (PC)
window.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && gameRunning && !isPaused) {
        isPaused = true;
        pauseScreen.classList.remove('hidden');
    }
});