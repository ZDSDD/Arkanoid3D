import { Vector3 } from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import {
    checkCollision,
    CheckCollisionWithBricks,
    gameBoundaries, createFloor, ball, paddle, bricks,floor
} from './gameObjects';
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initializeGame(scene) {

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    camera.rotateX(-.5)
    camera.position.y = 20;

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;

    scene.add(ball.mesh, paddle, floor, ...bricks);

    // Handle keyboard input
    window.addEventListener("keydown", (event) => {
        handleKeyDown(event);
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
    function handleKeyDown(event) {
        const moveSpeed = 1;

        switch (event.key) {
            case 'd':
                movePaddle('forward', moveSpeed);
                break;
            case 'w':
                movePaddle('left', moveSpeed);
                break;
            case 'a':
                movePaddle('backward', moveSpeed);
                break;
            case 's':
                movePaddle('right', moveSpeed);
                break;
        }
        CheckCollisionWithBoundaries(paddle,2.5)
    }

    function movePaddle(direction, speed) {
        const target = controls.target;
        const angle = Math.atan2(target.z - camera.position.z, target.x - camera.position.x);


        switch (direction) {
            case 'forward':
                paddle.position.x -= speed * Math.sin(angle);
                paddle.position.z -= speed * Math.cos(angle);
                break;
            case 'backward':
                paddle.position.x += speed * Math.sin(angle);
                paddle.position.z += speed * Math.cos(angle);
                break;
            case 'left':
                paddle.position.x -= speed * Math.cos(angle);
                paddle.position.z += speed * Math.sin(angle);
                break;
            case 'right':
                paddle.position.x += speed * Math.cos(angle);
                paddle.position.z -= speed * Math.sin(angle);
                break;
        }
    }
    window.addEventListener("keydown", handleKeyDown);


    const clock = new THREE.Clock();

    function UpdateBallPosition() {
        let moveDirection = new Vector3(0, 0, 0);
        moveDirection.copy(ball.velocity)
        moveDirection.multiplyScalar(clock.getDelta());
        ball.mesh.position.add(moveDirection);
    }



    function CheckCollisionWithPaddle() {
        if(checkCollision(paddle,ball.mesh)){
            ball.velocity.y = - ball.velocity.y;
            ball.mesh.position.y = paddle.position.y + 2.6;
        }
    }


    function CheckCollisionWithBoundaries(object,radius) {
        if (object.position.x + radius > gameBoundaries.rightWall) {
            object.position.x = gameBoundaries.rightWall - radius - 1;
            return "right";
        }
        if (object.position.x - radius < gameBoundaries.leftWall) {
            object.position.x = gameBoundaries.leftWall + radius + 1;
            return "left";
        }
        if (object.position.z + radius > gameBoundaries.frontWall) {
            object.position.z = gameBoundaries.frontWall - radius -1
            return "front";
        }
        if (object.position.z - radius < gameBoundaries.backWall) {
            object.position.z = gameBoundaries.backWall + radius + 1
            return "back";
        }
        if (object.position.y + radius > gameBoundaries.ceiling) {
            //assert the object isn't stuck
            object.position.y = gameBoundaries.ceiling - radius - 1;
            return "up";
        }
        if (object.position.y - radius < gameBoundaries.floor) {
            object.position.y = gameBoundaries.floor + radius + 1;
            return "down"
        }
        return "";
    }
// Game loop
    const animate = () => {
        requestAnimationFrame(animate);
        UpdateBallPosition();
        CheckCollisionWithPaddle();
        const hitWall = CheckCollisionWithBoundaries(ball.mesh,ball.radius);
        if(hitWall === "back" || hitWall === "front"){
            ball.velocity.z = -ball.velocity.z;
        }else if(hitWall === "left" || hitWall ==="right"){
            ball.velocity.x = -ball.velocity.x;
        }else if (hitWall !== ""){
            ball.velocity.y = -ball.velocity.y;
        }
        
        const hitBrickIndex = CheckCollisionWithBricks(ball.mesh, bricks);
        if( hitBrickIndex !== -1){
            scene.remove(bricks.at(hitBrickIndex));
            bricks.splice(hitBrickIndex, 1);
            ball.velocity.y = -ball.velocity.y;

        }
        controls.update();
        renderer.render(scene, camera);
    };

    animate();
}
