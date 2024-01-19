import * as THREE from 'three';
import {initializeGame} from "./game";

const btn = document.getElementById('play-button');

btn.addEventListener('click', () => {
  // 👇️ hide button
  btn.style.display = 'none';
  initializeGame()
});



