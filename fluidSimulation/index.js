let lastRender = 0;
let ctx;
const width = 800;
const height = 800;
let stop = false;
let empty = true;
let balls = [];
let gravity = 10;

let test = false;

// HTML objects
let canvas;
let btnStart;
let btnStop;
let btnReset;
let sliderGravity;
let txtGravity;

function setup() {
    prepareFields();

    prepareCanvas();
    resetCanvas();

    balls.push(new Ball(200, 200, 20));
    balls.push(new Ball(210, 260, 20));

    canvas.addEventListener('click', handleCanvasClick);
    window.requestAnimationFrame(loop);
}

function prepareFields() {
    btnStart = document.getElementById('btnStart');
    btnStop = document.getElementById('btnStop');
    btnReset = document.getElementById('btnReset');
    sliderGravity = document.getElementById('sliderGravity');
    txtGravity = document.getElementById('txtGravity');
}

function prepareCanvas() {
    let topLevel = document.getElementById('canvas');
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style = 'border: 1px solid #404040';
    topLevel.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

function resetCanvas() {
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function loop(timestamp) {
    if (stop) return;
    let delta = timestamp - lastRender;
    lastRender = timestamp;
    resetCanvas();
    update(delta);
    draw();
    if (!stop)
        window.requestAnimationFrame(loop);
}

function update(delta) {
    for (let i = 0; i < balls.length; ++i) {
        let ball = balls[i];
        for (let j = i + 1; j < balls.length; ++j) {
            let b = balls[j];
            let distance = ball.dist(b);
            let desiredDistance = ball.r + b.r;
            if (distance < desiredDistance) {
                let dx = ball.x - b.x;
                let dy = ball.y - b.y;
                if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
                    dx = desiredDistance - 1;
                    dy = desiredDistance - 1;
                }
                let mtd = [dx * (desiredDistance - distance) / distance, dy * (desiredDistance - distance) / distance];
                
                ball.x += mtd[0] * ball.r / desiredDistance;
                ball.y += mtd[1] * ball.r / desiredDistance;
                b.x -= mtd[0] * b.r / desiredDistance;
                b.y -= mtd[1] * b.r / desiredDistance;

                let mtdf = Math.sqrt(mtd[0] ** 2 + mtd[1] ** 2);
                mtd = [mtd[0] / mtdf, mtd[1] / mtdf]
                let vn = (ball.vx - b.vx) * mtd[0] + (ball.vy - b.vy) * mtd[1];
                if (vn > 0) continue;

                let i = -vn / desiredDistance;
                let impulse = [mtd[0] * i, mtd[1] * i];
                ball.vx += impulse[0] * ball.r;
                ball.vy += impulse[1] * ball.r;
                b.vx -= impulse[0] * b.r;
                b.vy -= impulse[1] * b.r;
            }
        }
        ball.vy += gravity;
        ball.move(delta);
        if (ball.y > canvas.height - ball.r) {
            ball.y = canvas.height - ball.r;
            ball.vy = -ball.vy * .5;
        }
        if (ball.x < 0 + ball.r) {
            ball.x = ball.r;
            ball.vx = -ball.vx;
        }
        if (ball.x > canvas.width - ball.r) {
            ball.x = canvas.width - ball.r;
            ball.vx = -ball.vx;
        }
    }




    /* balls.forEach(ball => {
        
    }); */
}

function draw() {
    balls.forEach(b => {
        b.draw(ctx);
    });
}

function handleCanvasClick(e) {
    balls.push(new Ball(e.x, e.y, 25, `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`));
    balls.forEach(ball => ball.draw(ctx));
    empty = false;
}

function handleStart() {
    if (stop) {
        btnStart.disabled = true;
        btnStop.disabled = false;
        btnReset.disabled = false;
        stop = false;
        empty = false;
        window.requestAnimationFrame(loop);
    }
}

function handleStop() {
    stop = true;
    btnStop.disabled = true;
    btnStart.disabled = false;
    btnReset.disabled = false;
}

function handleReset() {
    resetCanvas();
    balls = [];
    empty = true;
}

function handleGravitySlide() {
    gravity = parseInt(sliderGravity.value);
    txtGravity.value = gravity;
}

function handleGravityText() {
    gravity = parseInt(txtGravity.value);
    sliderGravity.value = gravity;
}

window.onload = setup;