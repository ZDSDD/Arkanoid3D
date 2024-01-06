import * as THREE from 'three';
import {initializeGame} from "./game";

// Set up scene
const scene = new THREE.Scene();
{
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.position.set(-1, 2, 4);
    light.castShadow = true;
    scene.add(light);
}


const loader = new THREE.TextureLoader();
const texture = loader.load(
    'resources/jpegPIA15482.jpg',
    () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });

initializeGame(scene)


