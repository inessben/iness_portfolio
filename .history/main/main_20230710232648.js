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

// // Add some texts
const loader = new FontLoader();
loader.load('./assets/fonts/press_start2_regular.json',
    (font) => {
        const nameGeometry = new TextGeometry("Hello, my name is Iness", {
            font: font,
            size: 0.6,
            height: 0.04,
        })
        const nameMaterial = new THREE.MeshBasicMaterial({ color: 0xe5e5e5 })
        const nameMesh = new THREE.Mesh(nameGeometry, nameMaterial)
        nameMesh.position.x = 7
        nameMesh.position.y = -8
        nameMesh.position.z = -18
        nameMesh.rotation.y = - Math.PI * 0.5
        scene.add(nameMesh)
    })
// 
// text about my localisation
loader.load('./assets/fonts/press_start2_regular.json',
    (font) => {
        const cityGeometry = new TextGeometry("I live in Paris where I'm studying digital passionate about UI design and front-end development.", {
            font: font,
            size: 0.27,
            height: 0.04,
        })
        const cityMaterial = new THREE.MeshPhongMaterial({ color: 0xe5e5e5 })
        const cityMesh = new THREE.Mesh(cityGeometry, cityMaterial)
        cityMesh.position.x = 4
        cityMesh.position.y = -7
        cityMesh.position.z = -18
        cityMesh.rotation.y = - Math.PI * 0.5
        scene.add(cityMesh)
    })

// 
// // text about my passions
// const passionGeometry = new TextGeometry("I love anything to do with art, such as fashion, photography and decoration.", {
//     font: font,
//     size: 0.08,
//     height: 0.01,
// })
// const passionMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
// const passionMesh = new THREE.Mesh(passionGeometry, passionMaterial)
// passionMesh.position.x = -1.5
// passionMesh.position.y = -8
// passionMesh.position.z = -0.4
// passionMesh.rotation.y = -0.5
// scene.add(passionMesh)
// // 
// // text more about me
// const moreGeometry = new TextGeometry("And I keep myself up to date with the latest trends and technologies, as this stimulates my curiosity.", {
//     font: font,
//     size: 0.08,
//     height: 0.01,
// })
// const moreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
// const moreMesh = new THREE.Mesh(moreGeometry, moreMaterial)
// moreMesh.position.x = -1.5
// moreMesh.position.y = -8
// moreMesh.position.z = -0.4
// moreMesh.rotation.y = -0.5
// scene.add(moreMesh)
// // 
// // text about my personnality
// const personalityGeometry = new TextGeometry("I'm a hard-working person with a thirst for learning, organized and rigorous, because for me, every details counts.", {
//     font: font,
//     size: 0.08,
//     height: 0.01,
// })
// const personalityMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
// const personalityMesh = new THREE.Mesh(personalityGeometry, personalityMaterial)
// personalityMesh.position.x = -1.5
// personalityMesh.position.y = -8
// personalityMesh.position.z = -0.4
// personalityMesh.rotation.y = -0.5
// scene.add(personalityMesh)


// loop
const loop = () => {
    window.requestAnimationFrame(loop)

    // Render
    renderer.render(scene, camera)
}

loop()