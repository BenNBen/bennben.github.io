class Transform{
    constructor(name){
        this.childCount = 0;
        this.hasChanged = false;
        this.children = [];
        this.parent = NULL;
        this.name = name || "Transform";
        this.indexAsChild = 0;
        this.position = new Vector3(0);
        this.scale = new Vector3(1);
        this.rotation = new Quaternion();

        this.forward = new Vector3(0);
        this.right = new Vector3(0);
        this.up = new Vector3(0);

        this.lmat = new Matrix4x4();
        this.gmat = new Matrix4x4();
    }

    Change(){
        this.hasChanged = true;
        for(var i =0;i<this.children.length;i++){
            this.children[i].Change();
        }
    }

    IsChild(){
        if(this.parent){
            return true;
        }
        return false;
    }

    GetChildCount(){
        return this.children.length;
    }

    SetIndexAsChild(index){
        this.indexAsChild = index;
    }

    GetIndexAsChild(){
        return this.indexAsChild;
    }

    RemoveChildAtIndex(index){
        if(index < this.children.length){
            this.children.splice(index, 1);
        }for(var i =index;i<this.children.length;i++){
            this.children[i].SetIndexAsChild(i);
        }
    }

    AddChild(child){
        this.children.push(child);
        if(child.IsChild()){
            child.parent.RemoveChildAtIndex(child.GetIndexAsChild());
        }
        child.SetParent(this);
        child.SetIndexAsChild(this.childen.length + 1);
    }

    SetParent(t){
        this.parent = t;
    }

    GetChild(index){
        if(index <= this.children.length){
            return this.children[index];
        }
    }

    Find(name){
        for(var i =0;i<this.children.length;i++){
            if(child.name == name){
                return child;
            }
        }
    }

    Unparent(){
        if(this.parent !== NULL){
            this.parent.RemoveChildAtIndex(this.GetIndexAsChild());
        }
        this.parent = NULL;
    }

    DetachChildren(){
        for(var i =0;i<this.children.length;i++){
            this.children[i].Unparent();
        }
        this.children = [];
    }

    SetPosition(npos){
        this.Change();
        this.position = npos;
    }

    CalcLocalMatrix(){
        let tm = new Matrix4x4();
        let rm = new Matrix4x4();
        let sm = new Matrix4x4();
        rm.RotationMatrix(this.rotation);
        sm.ScaleMatrix(this.scale);
        tm.TranslateMatrix(this.position);
        sm = sm.Mul(rm);
        sm = sm.Mul(tm);
        this.lmat = sm;
    }

    CalcGlobalMatrix(){
        let local = this.GetLocalMatrix();
        if(this.IsChild()){
            let global = this.parent.GetGlobalMatrix();
            global = global.Mul(local);
            this.gmat = global;
        }else{
            this.gmat = local;
        }
    }

    GetLocalMatrix(){
        if(this.hasChanged){
            this.hasChanged = false;
            this.CalcLocalMatrix();
            this.CalcGlobalMatrix();
        }
        return this.lmat;
    }

    GetGlobalMatrix(){
        if (this.hasChanged) {
            this.hasChanged = false;
            this.CalcLocalMatrix();
            this.CalcGlobalMatrix();
        }
        return this.gmat;
    }

    GetForward(){
        var mat = this.GetGlobalMatrix();
        var rot = mat.GetRotationFromMatrix();
        var fx = Mathf.cos(rot.x) * Mathf.sin(rot.y);
        var fy = -Mathf.sin(rot.x);
        var fz = Mathf.cos(rot.x) * Mathf.cos(rot.y);
        return new Vector3(fx, fy, fz);
    }

    GetRight(){
        var mat = this.GetGlobalMatrix();
        var rot = mat.GetRotationFromMatrix();
        var rx = Mathf.cos(rot.y);
        var ry = 0;
        var rz = -Mathf.sin(rot.y);
        return new Vector3(rx, ry, rz);
    }

    GetUp(){
        var forward = this.GetForward();
        var right = this.GetRight();
        return forward.Cross(Right);
    }

    GetPosition(){
        if(this.IsChild()){
            return this.position + this.parent.GetPosition();
        }
        return this.position;
    }

    SetScale(nscale){
        this.Change();
        this.scale = nscale;
    }

    GetScale(){
        return this.scale;
    }

    SetRotation(nrot){
        this.Change();
        this.rotation = nrot;
    }

    GetRotation(){
        return this.rotation;
    }
}