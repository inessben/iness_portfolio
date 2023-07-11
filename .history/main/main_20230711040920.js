// imports

import './main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

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
        player.position.y = -9
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

// add a GLB speech bubble
let bubbleSpeech
gltfLoader.load
    (
        './assets/models/bubble-speech.glb',
        (gltf) => {
            bubbleSpeech = gltf.scene

            bubbleSpeech.traverse((child) => {
                if (child.isMesh)
                    child.castShadow = true
                child.receiveShadow = true
            })

            bubbleSpeech.scale.set(5, 5, 5)
            bubbleSpeech.position.x = 10
            bubbleSpeech.position.y = 4
            bubbleSpeech.position.z = -6
            bubbleSpeech.rotation.y = - Math.PI * 0.5
            scene.add(bubbleSpeech)
        }
    )

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
const camera = new THREE.PerspectiveCamera(30, sizes.width / sizes.height)
camera.position.x = -24
camera.position.y = 2
camera.position.z = 10
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
const ambientLight = new THREE.AmbientLight(0xAD41FF, 1.4)
scene.add(ambientLight)

// // Add a white ambient light
const whiteAmbientLight = new THREE.AmbientLight(0xED8FB6, 0.3)
scene.add(whiteAmbientLight)

// // // add a grey directionnal light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.4)
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

// add some planets 
// generate a random color
function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
// generate a random size
function getRandomSize() {
    return Math.random() * 2 + 0.5;
}
// generate a random texture
function getRandomTexture() {
    var textures = [
        "./assets/textures/rocky_planet.jpg",
        "./assets/textures/pink_planet.jpg",
    ];
    return textures[Math.floor(Math.random() * textures.length)];
}

// create spheres
var sphereCount = 100;
var spheres = [];
for (var i = 0; i < sphereCount; i++) {
    var geometry = new THREE.SphereGeometry(getRandomSize(), 32, 32);
    var material = new THREE.MeshBasicMaterial({
        color: getRandomColor(),
        map: new THREE.TextureLoader().load(getRandomTexture()),
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = (Math.random() - 0.5) * 20;
    sphere.position.z = (Math.random() - 0.5) * 20;
    sphere.position.y = Math.random() * 50;
    spheres.push(sphere);
    scene.add(sphere);
}


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
let currentTextMesh = null

// array of texts 
const texts = [
    "Hello, \nmy name is Iness !",
    "I live in Paris \nwhere I'm studying \ndigital, more \nUI design and \nfront-end web dev.",
    "I love anything to \ndo with art, such \nas photography, \nfashion and \ndecoration. <3 ",
    "And I keep myself \nup to date with \nthe latest trends, \nas this stimulates \nmy curiosity.",
    "I'm a hard-worker \nwith a thirst for\nlearning. And I'm \nrigorous, for me \nevery detail counts."
]

// index of text 
let textIndex = 0

// Function to show the specify text 
function showText(text, position) {
    const loader = new FontLoader()
    loader.load('./assets/fonts/press_start2_regular.json', (font) => {
        // geometry and material of the text
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.33,
            height: 0.1,
        })
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 })
        //  mesh of the text
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        textMesh.position.copy(position)
        textMesh.rotation.y = -Math.PI * 0.5

        // delete the past text 
        if (currentTextMesh) {
            scene.remove(currentTextMesh)
        }

        // Add new text to the scene
        scene.add(textMesh)

        // Update to the refers text
        currentTextMesh = textMesh
    })
}

// Function with the spacebar
function handleSpacebar(event) {
    if (event.code === 'Space') {
        textIndex++

        if (textIndex >= texts.length) {
            textIndex = 0
        }

        // Show the next text
        const text = texts[textIndex]
        const position = new THREE.Vector3(9, 6.5, -13)
        showText(text, position)
    }
}

// Add the add event listener
window.addEventListener('keydown', handleSpacebar)

// show the first text of the page
const initialText = texts[0]
const initialPosition = new THREE.Vector3(9, 6.5, -13)
showText(initialText, initialPosition)


// loop
const loop = () => {
    window.requestAnimationFrame(loop)


    spheres.forEach(function (sphere) {
        sphere.rotation.x += 0.01
        sphere.rotation.y += 0.01
    })
    // Render
    renderer.render(scene, camera)
}

loop()