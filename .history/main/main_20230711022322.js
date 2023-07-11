// imports

import './main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// // add loaders to gltf
const gltfLoader = new GLTFLoader()

// // add textures to some mesh
const textureLoader = new THREE.TextureLoader()

// // add some textures
// floor's texture
const floorTexture = textureLoader.load('./assets/textures/floor.jpg')
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set(5, 5)
// // background's texture
const backgroundTexture = textureLoader.load('./assets/textures/background.jpeg')
// // planet's texture
// // rocky planet texture
const rockyPlanetTexture = textureLoader.load('./assets/textures/rocky_planet.jpg')
rockyPlanetTexture.wrapS = rockyPlanetTexture.wrapT = THREE.RepeatWrapping
rockyPlanetTexture.repeat.set(2, 2)
// // white planet texture
const whitePlanetTexture = textureLoader.load('./assets/textures/white_planet.jpg')
whitePlanetTexture.wrapS = whitePlanetTexture.wrapT = THREE.RepeatWrapping
whitePlanetTexture.repeat.set(2, 2)
// // metal planet texture
const pinkPlanetTexture = textureLoader.load('./assets/textures/pink_planet.jpg')
pinkPlanetTexture.wrapS = pinkPlanetTexture.wrapT = THREE.RepeatWrapping
pinkPlanetTexture.repeat.set(2, 2)

// add a GLB player
let player = null
gltfLoader.load(
    './assets/models/player.glb',
    (gltf) => {
        player = gltf.scene
        player.position.x = 10
        player.position.y = -10
        player.rotation.y = - Math.PI * 0.5


        player.scale.set(10, 10, 10)

        player.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        scene.add(player)
    }
)


// // let bubbleSpeech
// // gltfLoader.load
// //     (
// //         './assets/models/bubble-speech.glb',
// //         (gltf) => {
// //             bubbleSpeech = gltf.scene

// //             bubbleSpeech.traverse((child) => {
// //                 if (child.isMesh)
// //                     child.castShadow = true
// //                 child.receiveShadow = true
// //             })

// //             bubbleSpeech.scale.set(0.65, 0.65, 0.65)
// //             bubbleSpeech.position.x = -0.65
// //             bubbleSpeech.position.y = -7.55
// //             bubbleSpeech.position.z = -0.08
// //             bubbleSpeech.rotation.y = -0.5
// //             scene.add(bubbleSpeech)
// //         }
// //     )

// // Add our webgl scene
const scene = new THREE.Scene()
scene.background = backgroundTexture
scene.fog = new THREE.FogExp2('#b2c1cb', 0.01)

// Sizes
const sizes = {}
sizes.width = window.innerWidth
sizes.height = window.innerHeight

// Resize
window.addEventListener('resize', () => {
    // Update sizes object
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Add the camera
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height)
camera.position.x = -22
camera.position.y = 1
scene.add(camera)

// Add some lights
// // Add a white rect light
const rectAreaLight = new THREE.RectAreaLight(0xFFFFFF, 2, 1, 2)
rectAreaLight.position.x = 2
rectAreaLight.position.y = -0.5
rectAreaLight.position.z = -6.5
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

// // Add a purple ambient light
const ambientLight = new THREE.AmbientLight(0xAD41FF, 1.2)
scene.add(ambientLight)

// // Add a white ambient light
const whiteAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.3)
scene.add(whiteAmbientLight)

// // // add a grey directionnal light
const directionalLight = new THREE.DirectionalLight(0xED8FB6, 1)
directionalLight.castShadow = true
directionalLight.position.x = 1
directionalLight.position.y = 2
directionalLight.position.z = 3
scene.add(directionalLight)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.outputEncoding = THREE.sRGBEncoding
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true


// Add the decor
// 
// Floor
let floor = new THREE.Mesh(
    new THREE.BoxGeometry(500, 1, 500),
    new THREE.MeshStandardMaterial({
        color: 0X222222,
        map: floorTexture
    })
)
floor.position.x = 1
floor.rotation.y = - Math.PI * 1
floor.position.y = -10
scene.add(floor)

// // // Add some texts
// Variable refers to the actually text
let currentTextMesh = null;

// array of texts 
const texts = [
    "Hello, my name is Iness !",
    "I live in Paris where I'm studying digital,\npassionate about UI design and front-end development.",
    "I love anything to do with art,\nsuch as fashion, photography and decoration.",
    "And I keep myself up to date with the latest trends,\nas this stimulates my curiosity.",
    "I'm a hard-working person with a thirst for learning,\norganized and rigorous, for me, every detail counts."
];

// index of text 
let textIndex = 0;

// Function to aff afficher le texte spécifié
function showText(text, position) {
    const loader = new FontLoader();
    loader.load('./assets/fonts/press_start2_regular.json', (font) => {
        // Création de la géométrie et du matériau du texte
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.5,
            height: 0.1,
        });
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        // Création du mesh du texte
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position);
        textMesh.rotation.y = -Math.PI * 0.5;

        // Suppression du texte précédent s'il existe
        if (currentTextMesh) {
            scene.remove(currentTextMesh);
        }

        // Ajout du nouveau texte à la scène
        scene.add(textMesh);

        // Mise à jour de la référence du texte actuel
        currentTextMesh = textMesh;
    });
}

// Fonction pour gérer l'événement de pression sur la barre d'espace
function handleSpacebar(event) {
    if (event.code === 'Space') {
        // Incrément de l'indice du texte
        textIndex++;

        // Vérification si l'indice dépasse la taille du tableau des textes
        if (textIndex >= texts.length) {
            // Réinitialisation de l'indice
            textIndex = 0;
        }

        // Affichage du texte suivant
        const text = texts[textIndex];
        const position = new THREE.Vector3(7, -8, -18); // Position de départ pour tous les textes
        showText(text, position);
    }
}

// Ajout de l'écouteur d'événement pour la barre d'espace
window.addEventListener('keydown', handleSpacebar);

// Affichage du premier texte au chargement de la page
const initialText = texts[0];
const initialPosition = new THREE.Vector3(7, -8, -18); // Position de départ pour tous les textes
showText(initialText, initialPosition);


// loop
const loop = () => {
    window.requestAnimationFrame(loop)

    // Render
    renderer.render(scene, camera)
}

loop()