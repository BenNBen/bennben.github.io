
let canvas = document.getElementById(`canvas`);
let ctx = canvas.getContext("2d");
var width = 1200;
var height = 800;
ctx.canvas.width = width;
ctx.canvas.height = height;
ctx.canvas.style.width = width * 2;
ctx.canvas.style.height = height * 2;

const roundedRect =(ctx, x, y, width, height, radius = 4, fill = false, stroke = true) => {
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

const drawCanvasGrid = (ctx, width, height) => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(100, 175, 235, .5)";
    ctx.shadowColor = `rgba(125, 195, 255, .75)`;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 16;
    var dimension = Math.floor(height/20);
    var segmentWidth = dimension;
    var numLines = Math.floor(width / segmentWidth);
    for (var i = 0; i < numLines; i++) {
        ctx.beginPath();
        ctx.moveTo(i * segmentWidth, 0);
        ctx.lineTo(i * segmentWidth, height);
        ctx.stroke();
        ctx.closePath();
    }
    var segmentHeight = dimension;
    numLines = Math.floor(height / segmentHeight);
    for (var i = 0; i < numLines; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * segmentHeight);
        ctx.lineTo(width, i * segmentHeight);
        ctx.stroke();
        ctx.closePath();
    }
}

const clearCanvas = (fillStyle = `rgba(25,25,55,1)`) => {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)
    return ctx;
}

const drawPaused = (ctx) => {
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,1)';
    ctx.shadowColor = "rgba(0, 200, 255, 1)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 16;
    roundedRect(ctx, canvas.width *.4, canvas.height *.3, canvas.width*.2, canvas.height*.4, 64);
    roundedRect(ctx, canvas.width * .435, canvas.height * .4, canvas.width * .05, canvas.height * .2, 32, true);
    roundedRect(ctx, canvas.width * .515, canvas.height * .4, canvas.width * .05, canvas.height * .2, 32, true);
}


function drawStar(cx, cy, spikes, outerRadius, innerRadius, angle = 0) {

    var rot = Math.PI / 2 * 3;
    var x = cx;
    var y = cy;
    var step = Math.PI / spikes;

    ctx.beginPath();
    [x, y] = Mathf.rotatePositions2D([cx, cy - outerRadius], angle, [cx, cy]);
    ctx.moveTo(x, y);
    for (i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        [x, y] = Mathf.rotatePositions2D([x, y], angle, [cx, cy]);
        ctx.lineTo(x, y)
        rot += step

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        [x, y] = Mathf.rotatePositions2D([x, y], angle, [cx, cy]);
        ctx.lineTo(x, y)
        rot += step
    }
    [x, y] = Mathf.rotatePositions2D([cx, cy - outerRadius], angle, [cx, cy]);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.lineWidth = 5;
}

