GLOB_DEBUG = false;
paused = false;
const UserScore = new HighScore();
const Stats = new StatDisplay();
let FPS = 0;
let Frames = 0;
let FrameSum = 0;
let Seconds = 0;
const SCORE_SOUND = 1109;
const FIRE_SOUND = 525.6;
const LOSE_SOUND = 700;

const calculateFPS = () => {
    FrameSum += Frames;
    Frames = 0;
    Seconds ++;
    FPS = FrameSum / Seconds;
}

class Asteroid extends GameObject {
    constructor(o){
        super(o);
        this.color = [Mathf.random(), Mathf.random(), Mathf.random()];
        for(var i =0;i<3;i++){
            if(this.color[i] < .5){
                this.color[i] += .35;
            }
        }
        this.radius = 10 + Mathf.random() * 10;
        this.awake = true;
        this.vel = {x:0, y:0};
        this.projectileSpeed = .5 + Math.random();
        this.rotation = 0;
    }

    Kill() {
        this.x = 0;
        this.y = 0;
        this.vel = { x: 0, y: 0 };
        this.awake = false;
    }

    Update() {
        this.x -= this.vel.x * this.projectileSpeed;
        this.y -= this.vel.y * this.projectileSpeed;
        this.rotation += this.vel.x * this.projectileSpeed;
        if(this.rotation > 360){
            this.rotation -= 360;
        }else if(this.rotation < 0){
            this.rotation += 360;
        }
        this.transformedPositions = [this.x - this.radius, this.y - this.radius, this.x + this.radius, this.y + this.radius];

        super.UpdateBoundingBox();
        if (this.x < 0) {
            this.x = ctx.canvas.width;
        } else if (this.x > ctx.canvas.width) {
            this.x = 0;
        }

        if (this.y < 0) {
            this.y = ctx.canvas.height;
        } else if (this.y > ctx.canvas.height) {
            this.y = 0;
        }
    }

    

    Draw(ctx) {
        let r = Math.floor(this.color[0] * 255);
        let g = Math.floor(this.color[1] * 255);
        let b = Math.floor(this.color[2] * 255);
        ctx.strokeStyle = `rgba(${r},${g},${b}, 1)`;
        ctx.shadowColor = `rgba(${Math.floor(r*.9)},${Math.floor(g*.9)},${Math.floor(b*.9)}, 1)`;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 16;
        drawStar(this.x, this.y, 10, this.radius*.8, this.radius, this.rotation);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 1;
        this.boundingBox.Draw(ctx);
    }
};

class Bullet extends GameObject {
    constructor(o){
        super(o);
        this.vel = o.vel ?? { x: 0, y: 0 };
        this.radius = o.radius || 3;
        this.awake = false;
        this.color = "white";
        this.projectileSpeed = 3;
    }

    Wake(x =0, y =0, vel = {x:0, y:0}, owner = false){
        this.x = x;
        this.y = y;
        this.vel = vel;
        this.awake = true;
        this.owner = owner;
    }

    Kill(){
        this.x = 0;
        this.y = 0;
        this.vel = {x:0, y:0};
        this.awake = false;
    }

    Update(){
        this.x -= this.vel.x * this.projectileSpeed;
        this.y -= this.vel.y * this.projectileSpeed;
        this.transformedPositions = [this.x - this.radius*2, this.y - this.radius*2, this.x + this.radius*2, this.y + this.radius*2];
        super.UpdateBoundingBox();
        if (this.x < 0 || this.x > ctx.canvas.width) {
            this.Kill();
        }
        if (this.y < 0 || this.y > ctx.canvas.height) {
            this.Kill();
        }
    }

    Draw(ctx){
        if(!this.awake){
            return;
        }
        ctx.fillStyle = this.color;
        ctx.strokeStyle = "rgba(255, 200, 25, 1)";
        ctx.shadowColor = "rgba(255, 200, 25, 1)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        this.boundingBox.Draw(ctx);
    }
}

class Player extends GameObject{ 
    constructor(o)
    {
        super(o);
        this.rotation = 0;
        this.dimension = o.dimension || 32;
        this.turnSpeed = 0;
        this.turnSpeed = 0;
        this.maxTurnSpeed = 2.5;
        this.moving = false;
        this.rotatingR = false;
        this.rotatingL = false;
        this.firing = false;
        this.direction = new Vec2(0, 1);
        this.speed = 2;
        this.fireRate = 100;
        this.lastFireTime = 0;
    }

    Reset(){
        this.x = 600;
        this.y = 400;
        this.direction = new Vec2(0, 1);
        this.rotation = 0;
        this.rotatingL = false;
        this.rotatingR = false;
        this.moving = false;
    }


    CheckFiring(){
        var now = window.performance.now();
        if(this.firing && now - this.lastFireTime >= this.fireRate){
            FireBullet();
            this.lastFireTime = now;
        }
    }

    ManageRotation(){
        if(this.rotation >= 360){
            this.rotation -= 360;
        }
        if(this.rotation <0){
            this.rotation += 360;
        }
    }

    Forward(){
        this.moving = true;
    }

    StopForward(){
        this.moving = false;
    }

    Update(){
        if (this.x < 0) {
            this.x = ctx.canvas.width;
        } else if (this.x > ctx.canvas.width) {
            this.x = 0;
        }

        if (this.y < 0) {
            this.y = ctx.canvas.height;
        } else if (this.y > ctx.canvas.height) {
            this.y = 0;
        }


        var positions = [
            this.x - this.dimension / 2,
            this.y + this.dimension / 2,
            this.x + this.dimension / 2,
            this.y + this.dimension / 2,
            this.x,
            this.y - this.dimension / 2,
        ];

        
        if(this.moving){
            var speed = this.speed;
            this.x -= this.direction.x * speed;
            this.y -= this.direction.y * speed;
        }
        if(!this.rotatingL && !this.rotatingR){
            this.turnSpeed = 0;
        }
        this.rotation += this.turnSpeed;
        this.ManageRotation();
        this.transformedPositions = Mathf.rotatePositions2D(positions, this.rotation, [this.x, this.y]);
        super.UpdateBoundingBox();

        this.direction = new Vec2(this.x*1, this.y *1);
        var rpos = this.transformedPositions;
        this.direction.FindDirection(new Vec2(rpos[4], rpos[5]));
        this.CheckFiring();
    }

    Draw(ctx){
        super.Draw(ctx);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 200, 25, 1)';
        ctx.shadowColor = "rgba(0, 200, 255, 1)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 32;

        ctx.beginPath();
        var rpos = this.transformedPositions;
        ctx.moveTo(rpos[0], rpos[1]);
        for(var i =2;i<rpos.length;i+=2){
            ctx.lineTo(rpos[i], rpos[i+1]);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rpos[4], rpos[5]);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.shadowBlur = 0; // integer
        this.boundingBox.Draw(ctx);
    }

    RotateRight(){
        if(this.turnSpeed < 0){
            this.turnSpeed *= -.4;
        }
        this.turnSpeed = this.maxTurnSpeed;
        this.rotatingR = true;
    }
    RotateLeft(){
        if (this.turnSpeed > 0) {
            this.turnSpeed *= -.4;
        }
        this.turnSpeed = - this.maxTurnSpeed;
       
        this.rotatingL = true;
    }

    StopRotateRight(){
        this.rotatingR = false;
    }

    StopRotateLeft() {
        this.rotatingL = false;
    }

    SingleFire(){
        console.debug("FIRE")
        FireBullet();
    }

    Firing(){
        this.firing = true;
    }

    StopFiring(){
        this.firing = false;
        this.lastFireTime = 0;
    }
}

const MAX_BULLETS = 100;
bullets = [];
for(var i =0; i < MAX_BULLETS ; i++){
    bullets.push(new Bullet({y: i *10}));
}

enemies = [];
particles = [];
const spawnAsteroid = () => {
    if(enemies.length > 150) return;
    let x = Math.random() > .5 ? 10 : ctx.canvas.width - 10;
    let y = Math.random() * ctx.canvas.height;
    let vx = x > 10 ? -1 : 1;
    let vy = Math.random() > .5 ? -1 : 1;
    vx *= Math.random() * 4;
    vy *= Math.random() * 4;
    let asteroid = new Asteroid({x: x, y:y});
    asteroid.vel = {x:vx, y:vy};
    enemies.push(asteroid);
}

PlayerShip = new Player({x: 600, y: 400});

nextBullet = 0;

const ResetBullets = () =>{
    for(var i =0;i<MAX_BULLETS;i++){
        bullets[i].awake = false;
        nextBullet = 0;
    }
}

const FireBullet = () => {
    nextBullet++;
    if(nextBullet >= MAX_BULLETS){
        nextBullet = 0;
    }
    playSound(FIRE_SOUND);
    var bullet = bullets[nextBullet];
    var ship = PlayerShip;
    var dir = ship.direction;
    var x = ship.transformedPositions[4];
    var y = ship.transformedPositions[5];
    bullet.Wake(x, y, dir, ship);
}

const checkCollisions = (projectile, objectSet) =>{
    let len = objectSet.length;
    for(let i = 0;i<len;i++){
        let obj = objectSet[i];
        if(obj.awake){
            if (projectile.boundingBox.IsCollision(obj.boundingBox)) {
                return [Math.floor(10 * (obj.radius +(obj.vel.x + obj.vel.y))), obj];
            }
        }
    }
    return false;
}

const ResetGameState = () =>{
    UserScore.SetScore(0);
    PlayerShip.Reset();
    ResetBullets();
    enemies = [];
}

const drawParticles = (ctx) =>{
    let len = particles.length;
    let newParticles = [];
    for(var i =0;i<len;i++){
        let alive = particles[i].Draw(ctx);
        if(alive) newParticles.push(particles[i]);
    }
    particles = newParticles;
}

const GameLoop = () =>{
    if(paused){return;}
    Frames++;
    let bulletCount = 0;
    for (var i = 0; i < MAX_BULLETS; i++) {
        var bullet = bullets[i];
        if (bullet.awake) {
            bullet.Update();
            bulletCount++;
            let check = checkCollisions(bullet, enemies);
            if (check) {
                bullet.Kill();
                playSound(SCORE_SOUND, "square");
                window.setTimeout(playSound(SCORE_SOUND*1.5, "square"), 100);
                UserScore.UpdateScore((100+check[0]));
                let obj = check[1];
                let x = obj.x;
                let y = obj.y;
                obj.Kill();
                let randomNumParticles = Math.ceil(Math.random() *4);
                let limit = 10 + obj.radius;
                for(var j =0;j<randomNumParticles;j++){
                    let px = x - limit + (Math.random() * limit);
                    let py = y - limit + (Math.random() * limit);
                    particles.push(new SimpleExplosion({ x: px, y: py, radius:obj.radius, color: obj.color }));
                }
                bulletCount--;
            }
        }
    }
    let newAsteroids = [];
    for(var i =0;i<enemies.length;i++){
        let asteroid = enemies[i];
        if(asteroid.awake){
            asteroid.Update();
            newAsteroids.push(asteroid);
        }
    }
    enemies = newAsteroids;
    PlayerShip.Update();
    let check = checkCollisions(PlayerShip, enemies);
    if(check){
        ResetGameState();
        playSound(500, "sawtooth");
        window.setTimeout(playSound(450, "sawtooth"),100);
    }
    Stats.Clear();
    Stats.AddText(`Enemies: ${enemies.length}`);
    Stats.AddText(`Bullets: ${bulletCount}`);
    Stats.AddText(`FPS: ${FPS.toPrecision(5)}`);
}

onKeyDown = (e) => {
    let code = e.code;
    switch (code) {
        case 'KeyW':
            PlayerShip.Forward();
            break;
        case 'ArrowUp':
            PlayerShip.Forward();
            break;
        case 'KeyA':
            PlayerShip.RotateLeft();
            break;
        case 'ArrowLeft':
            PlayerShip.RotateLeft();
            break;
        case 'KeyD':
            PlayerShip.RotateRight();
            break;
        case 'ArrowRight':
            PlayerShip.RotateRight();
            break;
        case 'KeyP':
            paused = !paused;
            break;
        case 'Space':
            PlayerShip.Firing();
            break;
        case 'KeyT':
            GLOB_DEBUG = !GLOB_DEBUG;
            break;
    }
}

onKeyUp = (e) => {
    //if (e.repeat) return;
    let code = e.code;
    switch (code) {
        case 'KeyW':
            PlayerShip.StopForward();
            break;
        case 'KeyA':
            PlayerShip.StopRotateLeft();
            break;
        case 'KeyD':
            PlayerShip.StopRotateRight();
            break;
        case 'ArrowUp':
            PlayerShip.StopForward();
            break;
        case 'ArrowLeft':
            PlayerShip.StopRotateLeft();
            break;
        case 'ArrowRight':
            PlayerShip.StopRotateRight();
            break;
        case 'Space':
            PlayerShip.StopFiring();
            break;
    }
}

THUMB_PRESSED = false;
THUMB_OFFSETS = [0, 0];
FIRE_THUMB = [0, 0];
const drawControls = (ctx) =>{
    let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    if (!mobile) return;
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;
    ctx.fillStyle = "rgba(200, 200, 200, .5)";
    ctx.strokeStyle = "white";
    ctx.beginPath();
    let radius = 32;
    if(THUMB_PRESSED) radius *= 2;
    ctx.arc(w * .075 + THUMB_OFFSETS[0], h*.875 + THUMB_OFFSETS[1], radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    let fb = document.getElementById("fireButton");
    let fx = w * .925;
    let fy = h * .875;
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 0, 0, .8)";
    ctx.arc(fx, fy, 64, 0, 2 * Math.PI);
    ctx.fill();
    FIRE_THUMB = [fx, fy];
}

const renderCanvas = () => {
    var ctx = clearCanvas();
    drawCanvasGrid(ctx, ctx.canvas.width, ctx.canvas.height);
    ctx.globalAlpha = paused ? .5 : 1;
    if(paused){
        ctx.filter = 'blur(1px)';
    }
    ctx.fillStyle = "white"
    for(var i=0;i<MAX_BULLETS;i++){
        bullets[i].Draw(ctx);
    }
    for(var i=0;i<enemies.length;i++){
        if(enemies[i].awake)
            enemies[i].Draw(ctx);
    }
    drawParticles(ctx);
    PlayerShip.Draw(ctx);
    UserScore.Draw(ctx);
    if(paused){
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
        drawPaused(ctx);
    }else{
        drawControls(ctx);
    }
    UserScore.Draw(ctx);
    if(GLOB_DEBUG){
        Stats.Draw(ctx);
    }
    window.requestAnimationFrame(renderCanvas);
}

const checkThumbOffsets = () =>{
    let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)
    if(!mobile) return;
    if(THUMB_OFFSETS[1] < 0){
        PlayerShip.Forward();
    }else{
        PlayerShip.StopForward();
    }
    if(THUMB_OFFSETS[0] > 16){
        PlayerShip.RotateRight();
        PlayerShip.StopRotateLeft();
    }else if(THUMB_OFFSETS[0] < -16){
        PlayerShip.RotateLeft();
        PlayerShip.StopRotateRight();
    }else if(Math.abs(THUMB_OFFSETS[0]) < 16){
        PlayerShip.StopRotateLeft();
        PlayerShip.StopRotateRight();
    }
}

window.setInterval(checkThumbOffsets, 100);

const touchMove = (event, id) =>{
    event.preventDefault();
    let touches = event.touches;
    var x = touches[0].pageX;
    var y = canvas.height - touches[0].pageY;
    let width = canvas.width;
    let height = canvas.height;
    if (window.orientation === 90) { //portrait
        height = canvas.width;
        width = canvas.height;
    }
    if (y <= Math.floor(height * .25) && x <= Math.floor(width * .25)) {
        let midX = Math.floor(width * .1);
        let midY = Math.floor(height * .1);
        let diffX = x - midX;
        let diffY = y - midY;
        THUMB_OFFSETS[0] = (diffX / midX) * 32;
        THUMB_OFFSETS[1] = -1 * (diffY / midY) * 32;
        THUMB_PRESSED = true;
        return;
    }else if (Math.abs(x - FIRE_THUMB[0]) < 200 && Math.abs(touches[0].pageY - FIRE_THUMB[1]) < 200) {
        PlayerShip.Firing();
        return;
    }
}

const touchStart = (event, id) =>{
    event.preventDefault();
    
    let touches = event.touches;
    var x = touches[0].pageX;
    var y = canvas.height - touches[0].pageY;
    let width = canvas.width;
    let height = canvas.height;
    if (window.orientation === 90) { //portrait
        height = canvas.width;
        width = canvas.height;
    }
    if (y <= Math.floor(height * .2) && x <= Math.floor(width*.2)) {
        let midX = Math.floor(width * .1);
        let midY = Math.floor(height *.1);
        let diffX = x - midX;
        let diffY = y - midY;
        THUMB_OFFSETS[0] = (diffX / midX) * 32;
        THUMB_OFFSETS[1] = -1 * (diffY / midY) * 32;
        THUMB_PRESSED = true;
        return;
    }else if(Math.abs(x-FIRE_THUMB[0]) < 200 && Math.abs(touches[0].pageY-FIRE_THUMB[1]) < 200) {
        PlayerShip.Firing();
        return;
    }
    THUMB_PRESSED = false;
}

const touchEnd = (event, id) =>{
    event.preventDefault();
    THUMB_PRESSED = false;
    THUMB_OFFSETS = [0, 0];
    PlayerShip.StopFiring();
}


window.setInterval(spawnAsteroid, 1000);
window.setInterval(GameLoop, 16); // 60fps update
window.setInterval(calculateFPS, 1000);
renderCanvas();

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
canvas.addEventListener("touchstart", touchStart, false);
canvas.addEventListener("touchend", touchEnd, false);
canvas.addEventListener("touchmove", touchMove, false);
