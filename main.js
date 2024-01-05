import * as THREE from 'three';
import {Vector3} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js'

// Set up scene
const scene = new THREE.Scene();
{
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
}
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const loader = new THREE.TextureLoader();

const texture = loader.load(
    'resources/jpegPIA15482.jpg',
    () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });

// Ball
let ballRadius = 1;
const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
const ballMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
let ballVelocity = new Vector3(0, -15, 0);
ball.position.y = 5;
scene.add(ball);

// Bricks
const brickGeometry = new THREE.BoxGeometry(4, 1, 1);
const brickMaterial = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
});

let bricks = []

for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
        const brick = new THREE.Mesh(brickGeometry, brickMaterial);
        brick.position.set(i * 6 - 12, 10, j * 2);
        scene.add(brick);
        bricks.push(brick);
    }
}
console.log(bricks);

// Paddle
const paddleWidth = 5;
const paddleHeight = 1;
const paddleDepth = 5;
const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
const paddleMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
});

const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
paddle.position.y = -10;
scene.add(paddle);
// Set up pointer lock controls
const controls = new PointerLockControls(ball, document.body);
scene.add(controls.getObject());

// Enable pointer lock on a user action (e.g., a button click)
document.addEventListener('click', () => {
    controls.lock();
});

// Handle mouse movement to update paddle position
document.addEventListener('mousemove', (event) => {
    if (controls.isLocked) {
        const movementX = event.movementX
        const movementY = event.movementY

        // Update paddle position based on mouse movement
        paddle.position.x += movementX * 0.05; // Adjust the sensitivity as needed
        paddle.position.z += movementY * 0.05; // Adjust the sensitivity as needed

        if(paddle.position.x > wallRight){
            paddle.position.x = wallRight - 1;
        }
        if(paddle.position.x < wallLeft){
            paddle.position.x = wallLeft + 1;
        }
        if(paddle.position.z < wallBack){
            paddle.position.z = wallBack + 1;
        }
        if(paddle.position.z > wallFront){
            paddle.position.z = wallFront - 1;
        }
    }
});


camera.position.z = 30;

// // Set up OrbitControls
// const orbitControls = new OrbitControls(camera, renderer.domElement);
// orbitControls.enableDamping = true; // an animation loop is required when damping is enabled
// orbitControls.dampingFactor = 0.25; // non-smoothed damping
// orbitControls.screenSpacePanning = false;
// orbitControls.maxPolarAngle = Math.PI / 2;

// Handle window resize
window.addEventListener("resize", () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});

// Handle keyboard input
const handleKeyDown = (event) => {
    switch (event.key) {
        case "ArrowLeft":
            paddle.position.x -= 1;
            break;
        case "ArrowRight":
            paddle.position.x += 1;
            break;
        case "ArrowUp":
            paddle.position.z -= 1;
            break;
        case "ArrowDown":
            paddle.position.z += 1;
            break;
        case "Control":
            console.log(`ball.position`)
            console.log(ball.position)
            console.log(`ballVelocity`)
            console.log(ballVelocity)
            break;
        case "w":
            console.log("W pressed, ball y velocity increased by 1")
            ballVelocity.setY(ballVelocity.y + 1);
            break;
    }
};

function checkCollision(object1, object2) {
    const box1 = new THREE.Box3().setFromObject(object1);
    const box2 = new THREE.Box3().setFromObject(object2);

    // Adjust the scalar value as needed
    box1.expandByScalar(0.1);
    box2.expandByScalar(0.1);

    return box1.intersectsBox(box2);
}

window.addEventListener("keydown", handleKeyDown);

const clock = new THREE.Clock();

function UpdateBallPosition() {
    let moveDirection = new Vector3(0, 0, 0);
    moveDirection.copy(ballVelocity)
    moveDirection.multiplyScalar(clock.getDelta());
    ball.position.add(moveDirection);
}

function CheckCollisionWithBricks() {
    for (let i = 0; i < bricks.length; i++) {
        if (checkCollision(ball, bricks[i])) {
            scene.remove(bricks.at(i));
            bricks.splice(i, 1);
            i--;
            ballVelocity.y = -ballVelocity.y;
        }
    }
}

function CheckCollisionWithPaddle() {
    if (checkCollision(ball, paddle)) {
        console.log("HITTED THE PADDLE!")
    }
}

const wallRight = 28;
const wallLeft = -14;
const wallFront = 10;
const wallBack = -10;
const ceiling = 12;

function CheckCollisionWithCeiling() {
    if (ball.position.y + ballRadius > ceiling) {
        //assert the ball isn't stuck
        ball.position.y = ceiling - ballRadius - 1;
        ballVelocity.y = -ballVelocity.y;
    }
    if (ball.position.y - ballRadius < -ceiling) {
        ball.position.y = -ceiling + ballRadius + 1;
        ballVelocity.y = -ballVelocity.y;
    }
}

function CheckCollisionWithWalls() {
    if (ball.position.x + ballRadius > wallRight) {
        ball.position.x = wallRight - ballRadius - 1;
        ballVelocity.x = -ballVelocity.x;
    }
    if (ball.position.x - ballRadius < wallLeft) {
        ball.position.x = wallLeft + ballRadius + 1;
        ballVelocity.x = -ballVelocity.x;
    }
    if (ball.position.z + wallFront > wallRight) {
        ball.position.z = wallFront - ballRadius -1
        ballVelocity.z = -ballVelocity.z;
    }
    if (ball.position.z - ballRadius < wallBack) {
        ball.position.z = wallBack + ballRadius + 1
        ballVelocity.z = -ballVelocity.z;
    }
}

// Game loop
const animate = () => {
    requestAnimationFrame(animate);
    UpdateBallPosition();
    CheckCollisionWithCeiling();
    CheckCollisionWithPaddle();
    CheckCollisionWithWalls();
    CheckCollisionWithBricks();


    //orbitControls.update();
    renderer.render(scene, camera);
};

animate();
