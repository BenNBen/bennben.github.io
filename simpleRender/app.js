



class App{
    constructor(o){
        this.modelMatrix = Matrix4x4.IdentityMat();
        this.scratchMatrix = new Matrix4x4();
        this.projectionMatrix = new Matrix4x4();
        this.identityMatrix = Matrix4x4.IdentityMat();
        this.boundingBox = [-0, -0, -0, 0, 0, 0];
        this.upVector = Vector3.Up();
        this.camera = new Camera();
        this.viewFrustrum = new Frustrum();
        this.grid = false;
    }

    Init(translation = [0, -2, -10], rotation = [15, -45, 0]){
        this.camera.translation.SetTuple(translation);
        this.camera.rotation.SetTuple(rotation);
    }

    TranslateCamera(deltaVec = [0,0,0]){
        let angle = Mathf.Deg2Rad(this.camera.rotation.y);
        let x = deltaVec[0] * Math.cos(angle) + deltaVec[2] * Math.sin(angle);
        let z = deltaVec[0] * Math.sin(angle) - deltaVec[2] * Math.cos(angle);
        let nDelta = new Vector3(x * .01, deltaVec[1] * .01, z * .01);
        this.camera.translation = this.camera.translation.Add(nDelta);
    }

    SetView(width, height, eye){
        perspective(this.projectionMatrix.data, 55, width / height, 0.1, 1000);
        var camera = this.camera;
        var model = this.modelMatrix;
        var s = this.scratchMatrix;

        model.Set(this.identityMatrix);
        camera.temp.Set(camera.translation.x, camera.translation.y, camera.translation.z);
        s.TranslationMatrix(camera.temp);
        model = model.Mul(s);

        let r = camera.rotation;
        let q = new Quaternion();
        q.SetEuler(r.x, r.y, r.z);
        s.RotationMatrix(q);
        model = model.Mul(s);
        this.modelMatrix = model;
    }

    Draw(gl){
        if(!this.grid) this.grid = new Grid(gl);
        gl.disable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.cullFace(gl.FRONT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(28/255, 79/255, 110/255, 1.0);
        this.SetView(gl.drawingBufferWidth, gl.drawingBufferHeight, 0);
        this.viewFrustrum.frustrumFromMatrix(this.modelMatrix.data);
        this.grid.draw(gl, this.projectionMatrix, this.modelMatrix);
        drawGeometry(this.modelMatrix, this.projectionMatrix);
        spriteManager.Draw(gl, this.modelMatrix, this.projectionMatrix);
        gl.depthMask(true);
    }
}
