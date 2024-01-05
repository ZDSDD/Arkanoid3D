import { Vector3 } from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import {
    createBall,
    createBricks,
    createPaddle,
    checkCollision,
    CheckCollisionWithBricks,
    gameBoundaries
} from './gameObjects';
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

    // Enable pointer lock on a user action (e.g., a button click)
    document.addEventListener('mousedown', () => {
        controls.lock();
    });
    document.addEventListener('mouseup',(event)=> {
        console.log("mouseup, event button: " + event.button)
        controls.unlock();
    })
    // Handle keyboard input
    window.addEventListener("keydown", (event) => {
        handleKeyDown(event);
    });


    // Handle mouse movement to update paddle position
    document.addEventListener('mousemove', (event) => {
        if (controls.isLocked) {
            const movementX = event.movementX
            const movementY = event.movementY

            // Update paddle position based on mouse movement
            paddle.position.x += movementX * 0.05; // Adjust the sensitivity as needed
            paddle.position.z += movementY * 0.05; // Adjust the sensitivity as needed

            if(paddle.position.x > gameBoundaries.rightWall){
                paddle.position.x = gameBoundaries.rightWall - 1;
            }
            if(paddle.position.x < gameBoundaries.leftWall){
                paddle.position.x = gameBoundaries.leftWall + 1;
            }
            if(paddle.position.z < gameBoundaries.backWall){
                paddle.position.z = gameBoundaries.backWall + 1;
            }
            if(paddle.position.z > gameBoundaries.frontWall){
                paddle.position.z = gameBoundaries.frontWall - 1;
            }
        }
    });

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


    const clock = new THREE.Clock();

    function UpdateBallPosition() {
        let moveDirection = new Vector3(0, 0, 0);
        moveDirection.copy(ball.velocity)
        moveDirection.multiplyScalar(clock.getDelta());
        ball.mesh.position.add(moveDirection);
    }



    function CheckCollisionWithPaddle() {
        if (checkCollision(ball.mesh, paddle)) {
            console.log("HITTED THE PADDLE!")
        }
    }



    function CheckCollisionWithCeiling() {
        if (ball.mesh.position.y + ball.radius > gameBoundaries.ceiling) {
            //assert the ball.mesh isn't stuck
            ball.mesh.position.y = gameBoundaries.ceiling - ball.radius - 1;
            ball.velocity.y = -ball.velocity.y;
        }
        if (ball.mesh.position.y - ball.radius < gameBoundaries.floor) {
            ball.mesh.position.y = gameBoundaries.floor + ball.radius + 1;
            ball.velocity.y = -ball.velocity.y;
        }
    }

    function CheckCollisionWithWalls() {
        if (ball.mesh.position.x + ball.radius > gameBoundaries.rightWall) {
            ball.mesh.position.x = gameBoundaries.rightWall - ball.radius - 1;
            ball.velocity.x = -ball.velocity.x;
        }
        if (ball.mesh.position.x - ball.radius < gameBoundaries.leftWall) {
            ball.mesh.position.x = gameBoundaries.leftWall + ball.radius + 1;
            ball.velocity.x = -ball.velocity.x;
        }
        if (ball.mesh.position.z + gameBoundaries.frontWall > gameBoundaries.rightWall) {
            ball.mesh.position.z = gameBoundaries.frontWall - ball.radius -1
            ball.velocity.z = -ball.velocity.z;
        }
        if (ball.mesh.position.z - ball.radius < gameBoundaries.backWall) {
            ball.mesh.position.z = gameBoundaries.backWall + ball.radius + 1
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
        const hitBrickIndex = CheckCollisionWithBricks(ball.mesh, bricks);
        if( hitBrickIndex !== -1){
            scene.remove(bricks.at(hitBrickIndex));
            bricks.splice(hitBrickIndex, 1);
            ball.velocity.y = -ball.velocity.y;

        }
        //orbitControls.update();
        renderer.render(scene, camera);
    };

    animate();
}
