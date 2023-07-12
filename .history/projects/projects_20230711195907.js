import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';


// loaders
const textureLoader = new THREE.TextureLoader()
// background
const backgroundTexture = textureLoader.load('textures/background.jpeg')
// planets
const planetTexture = textureLoader.load('textures/rocky_planet.jpg')
planetTexture.wrapS = planetTexture.wrapT = THREE.RepeatWrapping
planetTexture.repeat.set(2, 2)

// Déclaration des variables globales
let camera, scene, renderer, composer;
let object, light;

let glitchPass;

// Fonction appelée lorsque le bouton de démarrage est cliqué
function startButtonClick() {
    const overlay = document.getElementById('overlay');
    overlay.remove();

    init(); // Initialisation de la scène
    animate(); // Démarrage de l'animation
}

// Fonction appelée lors de la modification de l'option wildGlitch
function updateOptions() {
    const wildGlitch = document.getElementById('wildGlitch');
    glitchPass.goWild = wildGlitch.checked;
}

// Initialisation de la scène
function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    scene = new THREE.Scene();

    object = new THREE.Object3D();
    scene.add(object);

    const geometry = new THREE.SphereGeometry(1, 32, 32);

    for (let i = 0; i < 100; i++) {
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random(), flatShading: true, map: planetTexture });

        const mesh = new THREE.Mesh(geometry, material);
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
        ).normalize();
        const scale = Math.random() * 50;
        const distance = Math.random() * 4000;
        position.multiplyScalar(distance);
        mesh.position.copy(position);
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        mesh.scale.set(scale, scale, scale);
        object.add(mesh);
    }


    light = new THREE.DirectionalLight(0x0a0a0a);
    light.position.set(1, 1, 1);
    scene.add(light);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    glitchPass = new GlitchPass();
    composer.addPass(glitchPass);

    const outputPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(outputPass);

    window.addEventListener('resize', onWindowResize);

    updateOptions();
}

// Fonction appelée lors du redimensionnement de la fenêtre
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Fonction d'animation
function animate() {
    requestAnimationFrame(animate);

    object.rotation.x += 0.001;
    object.rotation.y += 0.002;

    composer.render();
}

// Appel de la fonction de démarrage au chargement de la page
startButtonClick();
