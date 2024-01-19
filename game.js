import { Vector3 } from 'three';
import {
    gameBoundaries, createFloor, createBall, createBricks, createPaddle
} from './gameObjects';
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { CheckCollisionWithBoundaries as checkCollisionWithBoundaries, CheckCollisionWithBricks, CheckCollisionWithPaddle } from "./CollisionHandler";
import { AudioContext } from 'three';


export function initializeGame() {

    let scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x01131e, 0.025);
    let light = new THREE.DirectionalLight(0xFFFFFF, 2.0);
    light.position.set(20, 100, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    scene.add(light);

    let ambientLight = new THREE.AmbientLight(0x101010, 5);
    scene.add(ambientLight);


    const loader = new THREE.TextureLoader();
    const texture = loader.load(
        'resources/jpegPIA15482.jpg',
        () => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = texture;
        });

    let ballRadius = 1;
    let initialBallVelocity = new Vector3(0, 10, 0);
    let ball = createBall(ballRadius, initialBallVelocity);
    let bricks = createBricks(5, 5, 5);
    let paddle = createPaddle();
    let floor = createFloor();
    floor.receiveShadow = true;
    paddle.receiveShadow = true;
    ball.mesh.receiveShadow = true;
    paddle.castShadow = true;
    ball.mesh.castShadow = true;

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const stats = new Stats();
    document.body.appendChild(stats.dom);


    let gameOptions = {
        paddleMoveSpeed: 0.5,
        ballMoveSpeed: 1
    }

    let lightOptions = {
        lightIntensity: 1,
        color_red: 1,
        color_green: 1,
        color_blue: 1

    }
    const gui = new GUI();

    const gameplay_options = gui.addFolder('gameplay_options')
    gameplay_options.add(gameOptions, 'paddleMoveSpeed', 0.3, 2.0, 0.1)
    gameplay_options.add(gameOptions, 'ballMoveSpeed', 0.05, 1, 0.01)

    const light_options = gui.addFolder('light_options')
    light_options.add(lightOptions, 'lightIntensity', 0.05, 50, 0.01).onChange(() => light.intensity = lightOptions.lightIntensity)
    light_options.add(lightOptions, 'color_red', 0x0, 1, 0.01).name("Red color").onChange(setUpLightColor)
    light_options.add(lightOptions, 'color_green', 0x0, 1, 0.01).onChange(setUpLightColor)
    light_options.add(lightOptions, 'color_blue', 0x0, 1, 0.01).onChange(setUpLightColor)


    function setUpLightColor() {
        light.color.set(lightOptions.color_red, lightOptions.color_green, lightOptions.color_blue)
    }

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    camera.rotateX(-.5)
    camera.position.y = 20;

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create the PositionalAudio object (passing in the listener)
    const ambientSound = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('resources/sci-fi-ambient-music-183269.mp3', function (buffer) {
        ambientSound.setBuffer(buffer);
        ambientSound.setLoop(true);
        ambientSound.setVolume(1)
        ambientSound.play();
    });

// Assuming this is triggered by a button click
document.getElementById('startButton').addEventListener('click', function() {
    // Your audio playback code here
    ambientSound.play();
});

    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(ball.mesh, paddle, floor, ...bricks);

    // Handle keyboard input
    window.addEventListener("keydown", handleKeyDown);

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
            case 'w'||'W':
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
                gamePaused ^= 1;
                break;
        }
        checkCollisionWithBoundaries(paddle, 1)
    }

    const initialBallPosition = new THREE.Vector3(0, gameBoundaries.floor + 5, 0);

    function restartGame() {
        // Remove the ball from the scene
        ball.mesh.position.copy(initialBallPosition);

        // Remove old bricks from the scene
        for (const brick of bricks) {
            scene.remove(brick);
        }
        bricks = []
        bricks = createBricks(5, 5, 5);
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

    function updateBallPosition(delta) {
        let moveDirection = new Vector3(0, 0, 0);
        moveDirection.copy(ball.velocity)
        moveDirection.multiplyScalar(delta * (gameOptions.ballMoveSpeed));
        ball.mesh.position.add(moveDirection);
    }


    function removeBrick(hitBrickIndex) {
        scene.remove(bricks.at(hitBrickIndex));
        bricks.splice(hitBrickIndex, 1);
        ball.velocity.y = -ball.velocity.y;
    }

    function updateBall(delta) {
        updateBallPosition(delta);
        handleCollision();
    }

    let gamePaused = true;
    // Game loop
    const animate = () => {
        let delta = clock.getDelta()
        requestAnimationFrame(animate);
        if (!gamePaused) {
            updateBall(delta);
        }
        controls.update();
        stats.update();
        renderer.render(scene, camera);
    };

    animate();

    function handleCollision(){

        if(1 === CheckCollisionWithPaddle(paddle, ball)){
            paddle.material.color.setHex(Math.random() * 0xFFFFFF)
            sound.play();
        }

        const hitWall = checkCollisionWithBoundaries(ball.mesh, ball.radius);
        if (hitWall === "back" || hitWall === "front") {
            ball.velocity.z = -ball.velocity.z;
        } else if (hitWall === "left" || hitWall === "right") {
            ball.velocity.x = -ball.velocity.x;
        } else if (hitWall === "up") {
            ball.velocity.y = -ball.velocity.y;
        } else if (hitWall === "down") {
            restartGame();
            gamePaused = true;
        } else {
            const hitBrickIndex = CheckCollisionWithBricks(ball.mesh, bricks);
            if (hitBrickIndex !== -1) {
                removeBrick(hitBrickIndex);
            }
        }
    }
}
