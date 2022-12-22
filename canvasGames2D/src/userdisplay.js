class DisplayText{
    constructor(o){
        this.text = "";
    }

    SetText(text = "Test Test"){
        this.text = text;
    }
}

class StatDisplay extends DisplayText{
    constructor(o) {
        super(o);
        this.strings = [];
    }

    AddText(text = "Test Test"){
        this.strings.push(text);
    }

    Clear(){
        this.strings = [];
    }

    Draw(ctx) {
        ctx.fillStyle = "white";
        ctx.shadowColor = "green";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 16;
        ctx.font = "16px Verdana";
        let offset = ctx.canvas.height * .025;
        for(var i =0;i<this.strings.length;i++){
            ctx.fillText(this.strings[i], ctx.canvas.width * .85, offset * (i+1));
        }
    }
}

class HighScore extends DisplayText{
    constructor(o){
        super(o);
        this.highScore = 3000;
        this.score = 0;
        this.text = `Score: ${this.score}`;
        let memScore = localStorage.getItem('memScore');
        if(memScore && memScore > this.highScore){
            this.highScore = memScore;
        }
        this.highScoreText = `High Score: ${this.highScore}`;
    }

    SetScore(score){
        this.score = 0;
        this.text = `Score: ${this.score}`;
    }

    UpdateScore(increment = 0){
        this.score += increment;
        if(this.score > this.highScore){
            this.highScore = this.score;
            localStorage.setItem('memScore', this.highScore);
        }
        this.text = `Score: ${this.score}`;
        this.highScoreText = `High Score: ${this.highScore}`;
    }

    ScoreColor(score){
        return [255, 200, 25];
    }

    Draw(ctx){
        let color = this.ScoreColor(this.score);
        let r = color[0];
        let g = color[1];
        let b = color[2];
        ctx.fillStyle = `rgba(${r},${g},${b}, 1)`;
        ctx.shadowColor = `rgba(${Math.floor(r * .9)},${Math.floor(g * .9)},${Math.floor(b * .9)}, 1)`;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 16;
        ctx.font = "30px Verdana";
        let offset = ctx.canvas.height *.05;
        ctx.fillText(this.text, offset, offset * 2);
        ctx.fillText(this.highScoreText, offset, offset);
    }
}


