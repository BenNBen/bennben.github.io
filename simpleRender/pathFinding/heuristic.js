function manhattanHeuristic(dx, dy){
    return dx + dy;
}

function euclidianHeuristic(dx, dy){
    return Math.sqrt(dx * dx + dy * dy);
}

function ocileHeuristic(dx, dy){
    var F = Math.SQRT2 - 1;
    return (dx < dy) ? F * dx + dy : F * dy + dx;
}

function chebyshevHeuristic(dy, dy){
    return Math.max(dx, dy);
}