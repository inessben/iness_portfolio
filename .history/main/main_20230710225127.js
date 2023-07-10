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
        player.position.x = -10
        player.position.y = -10
        player.position.z = 4
        player.rotation.y = -0.8

        player.scale.set(2, 2, 2)

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
camera.position.x = 10
// camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// camera.position.set(0, 1, 1)
// player.add(camera)

// // Add the camera
// const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 600)
// camera.position.x = 100
// camera.position.y = 1000
// camera.position.z = 50
// scene.add(camera)

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
    new THREE.BoxGeometry(250, 1, 250),
    new THREE.MeshStandardMaterial({
        color: 0X222222,
        map: floorTexture
    })
)
floor.position.x = 1
floor.rotation.y = - Math.PI * 1
floor.position.y = -10
scene.add(floor)

// // White planet
// let whitePlanet = new THREE.Mesh(
//     new THREE.SphereGeometry(5.5, 50, 20),
//     new THREE.MeshStandardMaterial({
//         color: 0xffffff,
//         map: whitePlanetTexture
//     })
// )
// whitePlanet.position.x = 10
// whitePlanet.position.y = 10
// whitePlanet.position.z = -15
// whitePlanet.scale.set(1.7, 1.7, 1.7)
// scene.add(whitePlanet)

// // Rocky planet
// let rockyPlanet = new THREE.Mesh(
//     new THREE.SphereGeometry(5.5, 50, 20),
//     new THREE.MeshStandardMaterial({
//         map: rockyPlanetTexture
//     })
// )
// rockyPlanet.position.x = -21
// rockyPlanet.position.y = 9
// rockyPlanet.position.z = -4
// rockyPlanet.scale.set(0.7, 0.7, 0.7)
// scene.add(rockyPlanet)


// // Pink planet
// let pinkPlanet = new THREE.Mesh(
//     new THREE.SphereGeometry(5.5, 50, 20),
//     new THREE.MeshStandardMaterial({
//         color: 0Xff32a9,
//         map: pinkPlanetTexture
//     })
// )
// pinkPlanet.position.x = -5
// pinkPlanet.position.y = 5
// pinkPlanet.position.z = -4
// pinkPlanet.scale.set(0.3, 0.3, 0.3)
// scene.add(pinkPlanet)

// // Add some texts
const loader = new FontLoader();
loader.load('./assets/fonts/press_start2_regular.json',
    (font) => {
        const nameGeometry = new TextGeometry("Hello, my name is Iness", {
            font: font,
            size: 0.08,
            height: 0.01,
        })
        const nameMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const nameMesh = new THREE.Mesh(nameGeometry, nameMaterial)
        nameMesh.position.x = -1.5
        nameMesh.position.y = -8
        nameMesh.position.z = -0.4
        nameMesh.rotation.y = -0.5
        scene.add(nameMesh)
    })
// // 
// // text about my localisation
// const cityGeometry = new TextGeometry("I live in Paris where I'm studying digital, passionate about UI design and front-end development.", {
//     font: font,
//     size: 0.08,
//     height: 0.01,
// })
// const cityMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
// const cityMesh = new THREE.Mesh(geomecityGeometrytry, cityMaterial)
// cityMesh.position.x = -1.5
// cityMesh.position.y = -8
// cityMesh.position.z = -0.4
// cityMesh.rotation.y = -0.5
// scene.add(cityMesh)
// // 
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

// import './main.css';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


// // add loaders to gltf
// const gltfLoader = new GLTFLoader()
// // add textures to some mesh
// const textureLoader = new THREE.TextureLoader()
// //
// // add texture
// // floor's texture
// const floorTexture = textureLoader.load('./assets/textures/floor.jpg')
// floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
// floorTexture.repeat.set(5, 5)
// // background's texture
// const backgroundTexture = textureLoader.load('./assets/textures/background.jpeg')
// // planet's texture
// // rocky planet texture
// const rockyPlanetTexture = textureLoader.load('./assets/textures/rocky_planet.jpg')
// rockyPlanetTexture.wrapS = rockyPlanetTexture.wrapT = THREE.RepeatWrapping
// rockyPlanetTexture.repeat.set(2, 2)
// // white planet texture
// const whitePlanetTexture = textureLoader.load('./assets/textures/white_planet.jpg')
// whitePlanetTexture.wrapS = whitePlanetTexture.wrapT = THREE.RepeatWrapping
// whitePlanetTexture.repeat.set(2, 2)
// // metal planet texture
// const pinkPlanetTexture = textureLoader.load('./assets/textures/pink_planet.jpg')
// pinkPlanetTexture.wrapS = pinkPlanetTexture.wrapT = THREE.RepeatWrapping
// pinkPlanetTexture.repeat.set(2, 2)


// // add a GLB avatar
// let avatar = null

// const avatarAnimation = {}

// avatarAnimation.play = (name) => {
//     const newAction = avatarAnimation.actions[name]
//     const oldAction = avatarAnimation.actions.current

//     // Same
//     if (newAction === oldAction) {
//         return
//     }

//     newAction.reset()
//     newAction.play()
//     newAction.crossFadeFrom(oldAction, 0.2)

//     avatarAnimation.actions.current = newAction
// }

// gltfLoader.load(
//     './assets/models/player.glb',
//     (gltf) => {
//         avatar = gltf.scene
//         avatar.position.x = 10
//         avatar.position.y = -11
//         avatar.rotation.y = -0.8

//         avatar.scale.set(1.4, 1.4, 1.4)

//         avatar.traverse((child) => {
//             if (child.isMesh) {
//                 child.frustumCulled = false
//                 child.castShadow = true
//                 child.receiveShadow = true
//             }
//         })

//         scene.add(avatar)

//         // Animation
//         avatarAnimation.mixer = new THREE.AnimationMixer(avatar)

//         avatarAnimation.actions = {}

//         avatarAnimation.actions.running = avatarAnimation.mixer.clipAction(gltf.animations[0])
//         avatarAnimation.actions.standing = avatarAnimation.mixer.clipAction(gltf.animations[1])
//         avatarAnimation.actions.walking = avatarAnimation.mixer.clipAction(gltf.animations[2])

//         avatarAnimation.actions.current = avatarAnimation.actions.standing
//         avatarAnimation.actions.current.play()
//     }
// )

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

// // Add our scene
// const scene = new THREE.Scene()
// scene.background = backgroundTexture
// scene.fog = new THREE.FogExp2('#b2c1cb', 0.01)

// // Defines inner window's sizes
// const sizes = {}
// sizes.width = window.innerWidth
// sizes.height = window.innerHeight


// // Resize the viewport
// window.addEventListener('resize', () => {
//     // Update sizes object
//     sizes.width = window.innerWidth
//     sizes.height = window.innerHeight

//     // Update camera
//     camera.aspect = sizes.width / sizes.height
//     camera.updateProjectionMatrix()

//     // Update renderer
//     renderer.setSize(sizes.width, sizes.height)
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// })

// // Add the camera
// const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 600)
// camera.position.x = 100
// camera.position.y = 1000
// camera.position.z = 50
// scene.add(camera)

// // Add a white rect light
// const rectAreaLight = new THREE.RectAreaLight(0xFFFFFF, 2, 1, 2)
// rectAreaLight.position.x = 2
// rectAreaLight.position.y = -0.5
// rectAreaLight.position.z = -6.5
// rectAreaLight.lookAt(new THREE.Vector3())
// scene.add(rectAreaLight)

// // Add a purple ambient light
// const ambientLight = new THREE.AmbientLight(0xAD41FF, 1.2)
// scene.add(ambientLight)

// // Add a white ambient light
// const whiteAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.3)
// scene.add(whiteAmbientLight)

// // // add a grey directionnal light
// const directionalLight = new THREE.DirectionalLight(0xED8FB6, 1)
// directionalLight.castShadow = true
// directionalLight.position.x = 1
// directionalLight.position.y = 2
// directionalLight.position.z = 3
// scene.add(directionalLight)
// //
// // Add the renderer
// const renderer = new THREE.WebGLRenderer({ antialias: true })
// renderer.outputEncoding = THREE.sRGBEncoding
// renderer.physicallyCorrectLights = true
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.setSize(sizes.width, sizes.height)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// document.body.appendChild(renderer.domElement)

// //Orbit Controls
// const controls = new OrbitControls(camera, renderer.domElement)
// controls.enableDamping = true

// // CAMERA CONTROLS //
// const cameraControls = new OrbitControls(camera, renderer.domElement)
// cameraControls.zoomSpeed = 0.3
// cameraControls.enableDamping = true
// cameraControls.update()
// renderer.render(scene, camera)

// // font
// const loader = new FontLoader();
// loader.load('./assets/fonts/press_start2_regular.json',
//     (font) => {
//         const geometry = new TextGeometry('Hello, my name is Iness', {
//             font: font,
//             size: 0.08,
//             height: 0.01,
//         })
//         const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
//         const mesh = new THREE.Mesh(geometry, material)
//         mesh.position.x = -1.5
//         mesh.position.y = -8
//         mesh.position.z = -0.4
//         mesh.rotation.y = -0.5
//         scene.add(mesh)
//     })


// // Add the planets
// // White planet
// let whitePlanet = new THREE.Mesh(
//     new THREE.SphereGeometry(5.5, 50, 20),
//     new THREE.MeshStandardMaterial({
//         color: 0xffffff,
//         map: whitePlanetTexture
//     })
// )
// whitePlanet.position.x = 10
// whitePlanet.position.y = 10
// whitePlanet.position.z = -15
// whitePlanet.scale.set(1.7, 1.7, 1.7)
// scene.add(whitePlanet)

// // Rocky planet
// let rockyPlanet = new THREE.Mesh(
//     new THREE.SphereGeometry(5.5, 50, 20),
//     new THREE.MeshStandardMaterial({
//         map: rockyPlanetTexture
//     })
// )
// rockyPlanet.position.x = -21
// rockyPlanet.position.y = 9
// rockyPlanet.position.z = -4
// rockyPlanet.scale.set(0.7, 0.7, 0.7)
// scene.add(rockyPlanet)


// // Pink planet
// let pinkPlanet = new THREE.Mesh(
//     new THREE.SphereGeometry(5.5, 50, 20),
//     new THREE.MeshStandardMaterial({
//         color: 0Xff32a9,
//         map: pinkPlanetTexture
//     })
// )
// pinkPlanet.position.x = -5
// pinkPlanet.position.y = 5
// pinkPlanet.position.z = -4
// pinkPlanet.scale.set(0.3, 0.3, 0.3)
// scene.add(pinkPlanet)


// // Floor
// let floor = new THREE.Mesh(
//     new THREE.BoxGeometry(250, 1, 250),
//     new THREE.MeshStandardMaterial({
//         color: 0X222222,
//         map: floorTexture
//     })
// )
// floor.position.x = 1
// floor.rotation.y = - Math.PI * 1
// floor.position.y = -10
// scene.add(floor)

// // Loop
// const loop = () => {
//     window.requestAnimationFrame(loop)

//     // Update controls
//     controls.update()

//     // Update planets
//     if (rockyPlanet != null) {
//         rockyPlanet.rotation.y = Date.now() * 0.0007
//     }
//     whitePlanet.rotation.y = Date.now() * 0.0007
//     pinkPlanet.rotation.y = Date.now() * 0.0007

//     // Render
//     renderer.render(scene, camera)
// }

// loop()
