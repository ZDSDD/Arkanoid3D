import { Vector3 } from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { createBall, createBricks, createPaddle, handleMouseMove, handleKeyDown, checkCollision } from './gameObjects';
import * as THREE from "three";

export function initializeGame(scene) {
    // Set up pointer lock controls
    let ballRadius = 1;
    let ballVelocity = new Vector3(0, -15, 0);
    let ball = createBall(ballRadius,ballVelocity)
    
    let bricks = createBricks()
    let paddle = createPaddle()
    const controls = new PointerLockControls(ball.mesh, document.body);
    scene.add(controls.getObject());
    scene.add(ball.mesh);
    scene.add(paddle);
    for (const brick of bricks) {
        scene.add(brick)
    }

// Enable pointer lock on a user action (e.g., a button click)
    document.addEventListener('click', () => {
        controls.lock();
    });
    // Handle mouse movement to update paddle position
    document.addEventListener('mousemove', (event) => {
        handleMouseMove(controls, event);
    });

    // Handle keyboard input
    window.addEventListener("keydown", (event) => {
        handleKeyDown(event);
    });

    // ... (other initialization code)
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);



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
                console.log(`ball.mesh.position`)
                console.log(ball.mesh.position)
                console.log(`ball.velocity`)
                console.log(ball.velocity)
                break;
            case "w":
                console.log("W pressed, ball.mesh y velocity increased by 1")
                ball.velocity.setY(ball.velocity.y + 1);
                break;
        }
    };

    window.addEventListener("keydown", handleKeyDown);




    const wallRight = 28;
    const wallLeft = -14;
    const wallFront = 10;
    const wallBack = -10;
    const ceiling = 12;
    const clock = new THREE.Clock();

    function UpdateBallPosition() {
        let moveDirection = new Vector3(0, 0, 0);
        moveDirection.copy(ball.velocity)
        moveDirection.multiplyScalar(clock.getDelta());
        ball.mesh.position.add(moveDirection);
    }

    function CheckCollisionWithBricks() {
        for (let i = 0; i < bricks.length; i++) {
            if (checkCollision(ball.mesh, bricks[i])) {
                scene.remove(bricks.at(i));
                bricks.splice(i, 1);
                i--;
                ball.velocity.y = -ball.velocity.y;
            }
        }
    }

    function CheckCollisionWithPaddle() {
        if (checkCollision(ball.mesh, paddle)) {
            console.log("HITTED THE PADDLE!")
        }
    }



    function CheckCollisionWithCeiling() {
        if (ball.mesh.position.y + ball.radius > ceiling) {
            //assert the ball.mesh isn't stuck
            ball.mesh.position.y = ceiling - ball.radius - 1;
            ball.velocity.y = -ball.velocity.y;
        }
        if (ball.mesh.position.y - ball.radius < -ceiling) {
            ball.mesh.position.y = -ceiling + ball.radius + 1;
            ball.velocity.y = -ball.velocity.y;
        }
    }

    function CheckCollisionWithWalls() {
        if (ball.mesh.position.x + ball.radius > wallRight) {
            ball.mesh.position.x = wallRight - ball.radius - 1;
            ball.velocity.x = -ball.velocity.x;
        }
        if (ball.mesh.position.x - ball.radius < wallLeft) {
            ball.mesh.position.x = wallLeft + ball.radius + 1;
            ball.velocity.x = -ball.velocity.x;
        }
        if (ball.mesh.position.z + wallFront > wallRight) {
            ball.mesh.position.z = wallFront - ball.radius -1
            ball.velocity.z = -ball.velocity.z;
        }
        if (ball.mesh.position.z - ball.radius < wallBack) {
            ball.mesh.position.z = wallBack + ball.radius + 1
            ball.velocity.z = -ball.velocity.z;
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
}
