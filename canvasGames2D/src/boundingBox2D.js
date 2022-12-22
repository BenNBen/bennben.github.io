class BoundingBox2D {
    constructor(o = {}){
        this.bounds = [0, 0, 0, 0];
    }

    Update(positions){
        var len = positions.length;
        var lx = 1e6;
        var ly = 1e6;
        var ux = -1e6;
        var uy = -1e6;
        for(var i =0;i<len;i+=2){
            var x = positions[i];
            var y = positions[i+1];
            lx = (x < lx) ? x : lx;
            ly = (y < ly) ? y : ly;
            ux = (x > ux) ? x : ux;
            uy = (y > uy) ? y : uy;
        }
        this.bounds = [lx, ly, ux, uy];
    }


    Draw(ctx){
        if(!GLOB_DEBUG){
            return;
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.strokeRect(this.bounds[0], this.bounds[1], 
            this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]);
    }

    ContainsPoint(point){
        if(point[0] >= this.bounds[0] && point[0] <= this.bounds[2]){
            if(point[1] >= this.bounds[1] && point[1] <= this.bounds[3]){
                return true;
            }
        }
        return false;
    }

    IsCollision(boundingBox){
        if(this.ContainsPoint([boundingBox.bounds[0], boundingBox.bounds[1]])){
            return true;
        }
        if (this.ContainsPoint([boundingBox.bounds[2], boundingBox.bounds[1]])) {
            return true;
        }
        if (this.ContainsPoint([boundingBox.bounds[0], boundingBox.bounds[3]])) {
            return true;
        }
        if (this.ContainsPoint([boundingBox.bounds[2], boundingBox.bounds[3]])) {
            return true;
        }
        return false;
    }
}