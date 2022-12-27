

const transformObject = (object, transform = {}) =>{
    if(!object) return;
    if(transform.scale){
        let scale = transform.scale;
        object.scale.x = scale[0];
        object.scale.y = scale[1];
        object.scale.z = scale[2];
    }
    if(transform.rotation){
        let rotation = transform.rotation;
        object.rotation.x = rotation[0];
        object.rotation.y = rotation[1];
        object.rotation.z = rotation[2];
    }
}

const incrementTransformObject = (object, transform) => {
    if (!object) return;
    if (transform.scale) {
        let scale = transform.scale;
        object.scale.x += scale[0];
        object.scale.y += scale[1];
        object.scale.z += scale[2];
    }
    if (transform.rotation) {
        let rotation = transform.rotation;
        object.rotation.x += rotation[0];
        object.rotation.y += rotation[1];
        object.rotation.z += rotation[2];
    }
}
