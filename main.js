import * as THREE from 'three';
import {initializeGame} from "./game";

// Set up scene
const scene = new THREE.Scene();
{
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
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


