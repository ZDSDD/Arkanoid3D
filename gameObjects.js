import * as THREE from 'three';

export const gameBoundaries = {
        "rightWall" : 28,
        "leftWall" : -28,
        "frontWall" : 10,
        "backWall" : -10,
        "ceiling" : 12,
        "floor" : -12,
}


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

export function createBricks(xCount,yCount,zCount) {
    // Bricks
    const brickGeometry = new THREE.BoxGeometry(4, 1, 1);
    const brickMaterial = new THREE.MeshPhongMaterial({
        color: 0x0000ff,
    });

    let bricks = []
    for(let y = 0; y < yCount; y ++)
    {
        for (let i = 0; i < xCount; i++) {
            for (let j = 0; j < zCount; j++) {
                const brick = new THREE.Mesh(brickGeometry, brickMaterial);
                brick.position.set(i * 6 - 12, 2 * y, j * 2);
                bricks.push(brick);
            }
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

export function checkCollision(object1, object2) {
    const box1 = new THREE.Box3().setFromObject(object1);
    const box2 = new THREE.Box3().setFromObject(object2);

    // Adjust the scalar value as needed
    box1.expandByScalar(0.1);
    box2.expandByScalar(0.1);

    return box1.intersectsBox(box2);
}

export function CheckCollisionWithBricks(ball, bricks) {
    for (let i = 0; i < bricks.length; i++) {
        if (checkCollision(ball, bricks[i])) {
            return i;
        }
    }
    return -1;
}