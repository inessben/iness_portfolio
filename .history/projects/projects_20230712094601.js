import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

// loaders
const textureLoader = new THREE.TextureLoader();
// planets
const planetTexture = textureLoader.load('textures/rocky_planet.jpg');
planetTexture.wrapS = planetTexture.wrapT = THREE.RepeatWrapping;
planetTexture.repeat.set(2, 2);

// ...

// Initialisation de la scène
function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // ...

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    glitchPass = new GlitchPass();
    glitchPass.goWild = 0.1;
    composer.addPass(glitchPass);

    // ...
}

// ...
