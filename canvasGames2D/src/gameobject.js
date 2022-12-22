

class GameObject {
    constructor(o){
        this.x = o.x || 0;
        this.y = o.y || 0;
        this.boundingBox = new BoundingBox2D();
        this.positions = [];
        this.transformedPositions = [];
    }

    UpdateBoundingBox(){
        this.boundingBox.Update(this.transformedPositions);
    }

    Draw(ctx){
        if(!this.transformedPositions) return;
    }
}