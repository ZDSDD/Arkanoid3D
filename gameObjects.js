import * as THREE from 'three';
import {Vector3} from "three";

export function createBall(ballRadius,ballVelocity) {
    // Ball
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.y = 5;

    return {"mesh": ball,
            "velocity":ballVelocity,
            "radius":ballRadius};
}

export function createBricks() {
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
            bricks.push(brick);
        }
    }
    return bricks;
}

export function createPaddle() {
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
    return paddle;
}

export function handleMouseMove(controls, event) {
    // ... (mouse move handling code)
}

export function handleKeyDown(event) {
    // ... (keyboard input handling code)
}

export function checkCollision(object1, object2) {
    const box1 = new THREE.Box3().setFromObject(object1);
    const box2 = new THREE.Box3().setFromObject(object2);

    // Adjust the scalar value as needed
    box1.expandByScalar(0.1);
    box2.expandByScalar(0.1);

    return box1.intersectsBox(box2);
}