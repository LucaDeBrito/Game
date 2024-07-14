const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height; 

const player = {
    x: 5000,//-50 spwan
    y: -25,//-25 spwan
    width: 100,
    height: 50,
    baseSpeed: 5,
    speed: 12,
    dx: 0,
    dy: 0,
    jumpPower: 29,
    onGround: false,
    moving: 'none',
    jumpDuration: 0,
    jumpRelease: true,
    isJumping: false,
    inBoss: false,
};

const gravity = 1;

 
const platforms = [
    { x: -500, y: 0, width: 1500, height: 700, phantom: false, boss: false },//sol
    { x: 1000, y: 200, width: 3000, height: 500, phantom: false, boss: false },//sol2
    { x: 1200, y: -100, width: 300, height: 300, phantom: true, boss: false },//phantom
    { x: 1900, y: -300, width: 300, height: 75, phantom: false, boss: false },//p1
    { x: 1900, y: -700, width: 300, height: 75, phantom: false, boss: false },//p3
    { x: 2500, y: -450, width: 200, height: 200, phantom: false, boss: false },//p2
    { x: 4000, y: -1450, width: 1000, height: 2150, phantom: false, boss: false },//wall3
    { x: 1000, y: -900, width: 400, height: 400, phantom: false, boss: false },//p4
    { x: 1500, y: -1300, width: 300, height: 75, phantom: false, boss: false },//p5
    { x: 2375, y: -1300, width: 300, height: 75, phantom: false, boss: false },//p6
    { x: 3200, y: -1450, width: 800, height: 500, phantom: false, boss: false },//p7
    { x: 3000, y: -125, width: 400, height: 325, phantom: true, boss: false },//p8
    { x: -1500, y: -2700, width: 1000, height: 3200, phantom: false, boss: false },//mur de gauche (déb)
    { x: -500, y: -2700, width: 1500, height: 1500, phantom: true, boss: false },//trou
    { x: 500, y: -2700, width: 500, height: 2200, phantom: false, boss: false },//mur de droite (déb)
    { x: 1000, y: -2700, width: 5750, height: 700, phantom: false, boss: false },//plafond
    { x: 5000, y: 200, width: 1750, height: 500, phantom: false, boss: false },//sol boss
    { x: 5000, y: -2000, width: 1750, height: 2200, phantom: true, boss: true },// zone boss
];

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        if (platform.boss)
        {
            ctx.fillStyle = 'purple';
        }
        else if (platform.phantom)
        {
            ctx.fillStyle = 'blue';
        }
        else
        {
            ctx.fillStyle = 'green';
        }
        ctx.fillRect(platform.x - player.width / 2, platform.y - player.height / 2, platform.width, platform.height);
    });
}

function draw() {
    const cameraX = player.x - canvasWidth / 2;
    let cameraY = player.y - canvasHeight / 7 * 4;

    if (player.inBoss)
    {
        cameraY = player.y - canvasHeight / 7 * 6;//gérer pour boss pour caméra fixe
    }

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    drawPlatforms();
    drawPlayer();

    ctx.restore();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
    if (!player.onGround && player.dy < 0) {
        if (player.jumpRelease)
        {
            player.dy = 0;
        }
    }
    
    if (!player.onGround && player.dy < player.jumpPower * 1.5)
    {
        player.dy += gravity;
    }

    if (player.moving === 'left')
    {
        moveLeft()
    }

    if (player.moving === 'right')
    {
        moveRight()
    }

    if (player.moving === 'none' || player.moving === 'stop')
    {
        player.dx = 0;
    }

    player.onGround = false;
    platforms.forEach(platform => {
        // ROOF COLLISION
        if(
            !platform.phantom &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y >= platform.y + platform.height &&
            player.y + player.dy <= platform.y + platform.height
        ) {
            player.y = platform.y + platform.height;
            player.dy = 0;
        }

        // WALL + CORNER COLLISION
        if (
            !platform.phantom &&
            player.x + player.dx < platform.x + platform.width &&
            player.x + player.width + player.dx > platform.x &&
            player.y + player.dy < platform.y + platform.height &&
            player.y + player.height + player.dy > platform.y
        )
        {
            if(player.moving === 'left' && player.y + player.height > platform.y)
            {
                player.x = platform.x + platform.width;
                player.dx = 0;
            }
            if(player.moving === 'right' && player.y + player.height > platform.y)
            {
                player.x = platform.x - player.width;
                player.dx = 0;
            }
        }

        // FLOOR COLLISION
        if (
            !platform.phantom &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height < platform.y + platform.height &&
            player.y + player.height + player.dy >= platform.y
        ) {
            player.dy = 0;
            player.onGround = true;
            player.y = platform.y - player.height;
        }

        if (
            platform.phantom &&
            !platform.boss &&
            player.dy >= 0 &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height <= platform.y &&
            player.y + player.height + player.dy >= platform.y
        ) {
            player.dy = 0;
            player.onGround = true;
            player.y = platform.y - player.height;
        }

        if(
            platform.boss &&
            player.x >= platform.x &&
            player.x + player.width <= platform.x + platform.width &&
            player.y >= platform.y &&
            player.y + player.height <= platform.y + platform.height
        )
        {
            player.inBoss = true;
        }
        else
        {
            player.inBoss = false;
        }
    });

    player.x += player.dx;
    player.y += player.dy;
}

function update() {
    clear();
    newPos();
    draw();
    requestAnimationFrame(update);
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function jump() {
    player.dy = -player.jumpPower;
    player.jumpDuration++;
    player.jumpRelease = false;
}

function keyDown(e) {
    if (player.moving === 'none')
    {
        if (e.key === 'q' || e.key === 'Q') {
            player.moving = 'left';
        }
    
        if (e.key === 'd' || e.key === 'D') {
            player.moving = 'right';
        }
    }
    else
    {
        if (player.moving === 'left' && (e.key === 'd' || e.key === 'D'))
        {
            player.moving = 'stop';
        }

        if (player.moving === 'right' && (e.key === 'q' || e.key === 'Q'))
        {
            player.moving = 'stop';
        }
    }

    //jump
    if (e.key === ' ') {
        if (player.onGround && player.jumpRelease) {
            player.jumpDuration = 0;
            player.jumpRelease = false;
            jump();
            // player.jumpStartTime = Date.now();
            // player.dy = -player.jumpPower;
            // player.onGround = false;
            // player.jumpRelease = false;
            // player.isJumping = true;
        }
        else
        {
            player.jumpRelease = false;
        }
    }
}

function keyUp(e) {
    if (e.key === 'q' || e.key === 'Q')
    {
        if (player.moving === 'stop')
        {
            player.moving = 'right';
        }
        else
        {
            player.moving = 'none';
        }
    }

    if (e.key === 'd' || e.key === 'D')
        {
            if (player.moving === 'stop')
            {
                player.moving = 'left';
            }
            else
            {
                player.moving = 'none';
            }
        }
    //jump
    if (
        e.key === ' '
    ) {
        if (!player.jumpRelease) {
            // player.jumpDuration = Date.now() - player.jumpStartTime;
            // const jumpPower = Math.min(player.maxJumpPower, player.jumpPower + player.jumpDuration / player.maxJumpPower);
            // player.dy = -jumpPower;
            player.jumpDuration = 0;
            player.jumpRelease = true;
            // player.isJumping = false;
        }
    }
}

update();

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
