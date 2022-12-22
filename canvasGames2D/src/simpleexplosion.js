class SimpleExplosion{
    constructor(o){
        this.x = o.x;
        this.y = o.y;
        this.color = o.color;
        this.radius = o.radius ||  20 + Math.random() * 4;
        this.timeOfCreation = window.performance.now();
        this.maxRot = 90* Math.random();
        this.spikes = Math.ceil(Math.random() * 15);
        this.spikes = Mathf.clamp(this.spikes, 7, 15);
    }

    Draw(ctx){
        let now = window.performance.now();
        let percent = (now - this.timeOfCreation)/500;
        if(percent > 1) percent = 1;
        let rad = this.radius*percent;
        if(rad < 3) rad = 3;
        let r = Math.floor(this.color[0] * 255);
        let g = Math.floor(this.color[1] * 255);
        let b = Math.floor(this.color[2] * 255);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${1-percent})`;
        ctx.shadowColor = "white";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        drawStar(this.x, this.y, 8, rad * .8, rad, this.maxRot*percent);
        ctx.closePath();
        ctx.stroke();
        if(percent >= 1){
            return false;
        }
        return true;
    }
}