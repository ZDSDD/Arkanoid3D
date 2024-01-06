import * as THREE from 'three';
import {Vector3} from "three";

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
    paddle.position.y = gameBoundaries.floor;
    return paddle;
}
export function createFloor(){

    const planeSize = 100; // Adjust the size as needed
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 10, 10);
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load('resources/Glow-Galaxy-Texture-Space-wallpaper_1600x1200.jpg'); // Replace with the path to your texture

    const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture, side: THREE.DoubleSide });

    const floorMesh = new THREE.Mesh(planeGeometry, floorMaterial);

    floorMesh.rotation.x = (-Math.PI / 2); // Rotate the plane to be horizontal
    floorMesh.position.y = -13
    //floorMesh.material.fog = true;
    return floorMesh
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

let ballRadius = 1;
let ballVelocity = new Vector3(0, -15, 0);
export let ball = createBall(ballRadius,ballVelocity);
export let bricks = createBricks(5,5,5);
export let paddle = createPaddle();
export let floor = createFloor();
