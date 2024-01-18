import {Vector3} from 'three';
import {
    checkCollision,
    gameBoundaries, createFloor, createBall, createBricks, createPaddle
} from './gameObjects';
import * as THREE from "three";
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {randFloat} from "three/src/math/MathUtils";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


export function initializeGame(scene) {
    function CheckCollisionWithBricks(ball, bricks) {
        for (let i = 0; i < bricks.length; i++) {
            if (checkCollision(ball, bricks[i])) {
                return i;
            }
        }
        return -1;
    }



    let ballRadius = 1;
    let initialBallVelocity = new Vector3(0, 10, 0);
    let ball = createBall(ballRadius, initialBallVelocity);
    let bricks = createBricks(5, 5, 5);
    let paddle = createPaddle();
    let floor = createFloor();

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const stats = new Stats();
    document.body.appendChild( stats.dom );


    let gameOptions = {
        paddleMoveSpeed: 0.5,
        ballMoveSpeed:1
    }
    const gui = new GUI();

    gui.add(gameOptions,'paddleMoveSpeed',0.3,2.0,0.1);
    gui.add(gameOptions,'ballMoveSpeed',0.05,1,0.01);


    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    camera.rotateX(-.5)
    camera.position.y = 20;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(ball.mesh, paddle, floor, ...bricks);

    // Handle keyboard input
    window.addEventListener("keydown",handleKeyDown);

    // Handle window resize
    window.addEventListener("resize", () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    });

// Handle keyboard input
    function handleKeyDown(event) {

        switch (event.key) {
            case 'w':
                movePaddle('forward', gameOptions.paddleMoveSpeed);
                break;
            case 'a':
                movePaddle('left', gameOptions.paddleMoveSpeed);
                break;
            case 's':
                movePaddle('backward', gameOptions.paddleMoveSpeed);
                break;
            case 'd':
                movePaddle('right', gameOptions.paddleMoveSpeed);
                break;
            case " ":
                gamePaused = false;
                break;
            case'r':
                if (gameOver) {
                    restartGame();
                }
        }
        CheckCollisionWithBoundaries(paddle, 1)
    }

    const initialBallPosition = new THREE.Vector3(0,gameBoundaries.floor + 5,0);
    function restartGame() {
        // Remove the ball from the scene
        ball.mesh.position.copy(initialBallPosition);

        // Remove old bricks from the scene
        for (const brick of bricks) {
            scene.remove(brick);
        }
        bricks = []
        bricks = createBricks(5,5,5);
        gameOver = false;
        gamePaused = true;
        scene.add(...bricks);
    }


    function movePaddle(direction, speed) {

        switch (direction) {
            case 'forward':
                paddle.position.z -= speed;
                break;
            case 'backward':
                paddle.position.z += speed;
                break;
            case 'left':
                paddle.position.x -= speed;
                break;
            case 'right':
                paddle.position.x += speed;
                break;
        }
    }

    window.addEventListener("keydown", handleKeyDown);


    const clock = new THREE.Clock();

    function UpdateBallPosition() {
        let moveDirection = new Vector3(0, 0, 0);
        moveDirection.copy(ball.velocity)
        moveDirection.multiplyScalar(clock.getDelta() * (gameOptions.ballMoveSpeed));
        ball.mesh.position.add(moveDirection);
    }


    function CheckCollisionWithPaddle() {
        if (checkCollision(paddle, ball.mesh)) {
            ball.velocity.y = -ball.velocity.y;
            ball.mesh.position.y = paddle.position.y + 2.6;
            ball.velocity.x = ball.velocity.x + randFloat(-1,1);
            ball.velocity.z = ball.velocity.z + randFloat(-1,1);
        }
    }

    function CheckCollisionWithBoundaries(object, radius) {
        if (object.position.x + radius > gameBoundaries.rightWall) {
            object.position.x = gameBoundaries.rightWall - radius - 0.1;
            return "right";
        }
        if (object.position.x - radius < gameBoundaries.leftWall) {
            object.position.x = gameBoundaries.leftWall + radius + 0.1;
            return "left";
        }
        if (object.position.z + radius > gameBoundaries.frontWall) {
            object.position.z = gameBoundaries.frontWall - radius - 0.1
            return "front";
        }
        if (object.position.z - radius < gameBoundaries.backWall) {
            object.position.z = gameBoundaries.backWall + radius+ 0.1
            return "back";
        }
        if (object.position.y + radius > gameBoundaries.ceiling) {
            //assert the object isn't stuck
            object.position.y = gameBoundaries.ceiling - radius - 0.1;
            return "up";
        }
        if (object.position.y - radius < gameBoundaries.floor) {
            object.position.y = gameBoundaries.floor + radius + 0.1;
            return "down"
        }
        return "";
    }

    function removeBrick(hitBrickIndex) {
        scene.remove(bricks.at(hitBrickIndex));
        bricks.splice(hitBrickIndex, 1);
        ball.velocity.y = -ball.velocity.y;
    }

    let gameOver = false;

    function updateBall() {
        UpdateBallPosition();
        CheckCollisionWithPaddle();
        const hitWall = CheckCollisionWithBoundaries(ball.mesh, ball.radius);
        if (hitWall === "back" || hitWall === "front") {
            ball.velocity.z = -ball.velocity.z;
        } else if (hitWall === "left" || hitWall === "right") {
            ball.velocity.x = -ball.velocity.x;
        } else if (hitWall === "up") {
            ball.velocity.y = -ball.velocity.y;
        } else if (hitWall === "down") {
            restartGame();
            gamePaused = true;
            gameOver = true;
        } else {
            const hitBrickIndex = CheckCollisionWithBricks(ball.mesh, bricks);
            if (hitBrickIndex !== -1) {
                removeBrick(hitBrickIndex);
            }
        }
    }

    let gamePaused = true;
    // Game loop
    const animate = () => {
        requestAnimationFrame(animate);
        if (!gamePaused) {
            updateBall();
        }
        controls.update();
        stats.update();
        renderer.render(scene, camera);
    };

    animate();
}
