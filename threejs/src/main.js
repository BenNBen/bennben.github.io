const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);



document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

const geometry2 = new THREE.TorusGeometry(10, 3, 16, 100);
const material2 = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const torus = new THREE.Mesh(geometry2, material2);
transformObject(torus, {scale: [.25,.25,.25]});

const spaceTexture = new THREE.TextureLoader().load('images/background.jpg');
scene.background = spaceTexture;

scene.add(torus, cube);

camera.position.z = 15;

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

function animate() {
    requestAnimationFrame(animate);

    incrementTransformObject(cube, {rotation: [.01, .01, 0]})
    renderer.render(scene, camera);
};

animate();

const keydown = (key) =>{
    let code = key.code;
    switch(code){
        case "KeyW":
            incrementTransformObject(torus, {scale: [.025,.025,.025]});
            break;
        default:
            break;
    }
}


document.addEventListener("keydown", keydown);
