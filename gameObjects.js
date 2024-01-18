import * as THREE from 'three';

export const gameBoundaries = {
        "rightWall" : 18,
        "leftWall" : -18,
        "frontWall" : 12,
        "backWall" : -2,
        "ceiling" : 12,
        "floor" : -12,
}


export function createBall(ballRadius,ballVelocity) {
    // Ball
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
    let ball = new THREE.Mesh(ballGeometry, ballMaterial);

    ball.position.y = gameBoundaries.floor + 5;
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
                brick.receiveShadow = true;
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

    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture,
        opacity:0.5,
        transparent:true,
        side: THREE.FrontSide });

    const floorMesh = new THREE.Mesh(planeGeometry, floorMaterial);

    floorMesh.rotation.x = (-Math.PI / 2); // Rotate the plane to be horizontal
    floorMesh.position.y = -13
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

