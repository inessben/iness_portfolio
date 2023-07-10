import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


// add loaders to gltf
const gltfLoader = new GLTFLoader()
// add textures to some mesh
const textureLoader = new THREE.TextureLoader()
// 
// add texture
// floor's texture
const floorTexture = textureLoader.load('./assets/textures/floor.jpg')
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set(5, 5)
// background's texture
const backgroundTexture = textureLoader.load('./assets/textures/background.jpeg')
// planet's texture
// rocky planet texture
const rockyPlanetTexture = textureLoader.load('./assets/textures/rocky_planet.jpg')
rockyPlanetTexture.wrapS = rockyPlanetTexture.wrapT = THREE.RepeatWrapping
rockyPlanetTexture.repeat.set(2, 2)
// white planet texture
const whitePlanetTexture = textureLoader.load('./assets/textures/white_planet.jpg')
whitePlanetTexture.wrapS = whitePlanetTexture.wrapT = THREE.RepeatWrapping
whitePlanetTexture.repeat.set(2, 2)
// metal planet texture
const pinkPlanetTexture = textureLoader.load('./assets/textures/pink_planet.jpg')
pinkPlanetTexture.wrapS = pinkPlanetTexture.wrapT = THREE.RepeatWrapping
pinkPlanetTexture.repeat.set(2, 2)


// add a GLB avatar
let avatar = null

const avatarAnimation = {}

avatarAnimation.play = (name) => {
    const newAction = avatarAnimation.actions[name]
    const oldAction = avatarAnimation.actions.current

    // Same
    if (newAction === oldAction) {
        return
    }

    newAction.reset()
    newAction.play()
    newAction.crossFadeFrom(oldAction, 0.2)

    avatarAnimation.actions.current = newAction
}

gltfLoader.load(
    './assets/models/player.glb',
    (gltf) => {
        avatar = gltf.scene
        avatar.position.x = 10
        avatar.position.y = -11
        avatar.rotation.y = -0.8

        avatar.scale.set(1.4, 1.4, 1.4)

        avatar.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        scene.add(avatar)

        // Animation
        avatarAnimation.mixer = new THREE.AnimationMixer(avatar)

        avatarAnimation.actions = {}

        avatarAnimation.actions.running = avatarAnimation.mixer.clipAction(gltf.animations[0])
        avatarAnimation.actions.standing = avatarAnimation.mixer.clipAction(gltf.animations[1])
        avatarAnimation.actions.walking = avatarAnimation.mixer.clipAction(gltf.animations[2])

        avatarAnimation.actions.current = avatarAnimation.actions.standing
        avatarAnimation.actions.current.play()
    }
)

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

            bubbleSpeech.scale.set(0.8, 0.8, 0.8)
            bubbleSpeech.position.x = -0.6
            bubbleSpeech.position.y = -7.7
            bubbleSpeech.position.z = -0.5
            bubbleSpeech.rotation.y = -0.5
            scene.add(bubbleSpeech)
        }
    )

// Add our scene
const scene = new THREE.Scene()
scene.background = backgroundTexture
scene.fog = new THREE.FogExp2('#b2c1cb', 0.01)

// Defines inner window's sizes
const sizes = {}
sizes.width = window.innerWidth
sizes.height = window.innerHeight


// Resize the viewport
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
const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 600)
camera.position.x = 100
camera.position.y = 1000
camera.position.z = 50
scene.add(camera)

// Add a white rect light
const rectAreaLight = new THREE.RectAreaLight(0xFFFFFF, 2, 1, 2)
rectAreaLight.position.x = 2
rectAreaLight.position.y = -0.5
rectAreaLight.position.z = -6.5
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

// Add a purple ambient light
const ambientLight = new THREE.AmbientLight(0xAD41FF, 1.2)
scene.add(ambientLight)

// Add a white ambient light
const whiteAmbientLight = new THREE.AmbientLight(0xFFFFFF, 0.3)
scene.add(whiteAmbientLight)

// // add a grey directionnal light
const directionalLight = new THREE.DirectionalLight(0xED8FB6, 1)
directionalLight.castShadow = true
directionalLight.position.x = 1
directionalLight.position.y = 2
directionalLight.position.z = 3
scene.add(directionalLight)
// 
// Add the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.outputEncoding = THREE.sRGBEncoding
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

const loader = new FontLoader();

loader.load('./assets/fonts/press_start2_regular.json',
    (font) => {
        const geometry = new TextGeometry('THREE.JS.JOURNEY.corp', {
            font: font,
            size: 0.04,
            height: 0.02,
            curveSegments: 1,
            bevelEnabled: false,
        })
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.x = -1.5
        mesh.position.y = -7.8
        mesh.position.z = -0.3
        mesh.rotation.y = -0.5
        scene.add(mesh)
    })


// Add the planets
// White planet
let whitePlanet = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 50, 20),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: whitePlanetTexture
    })
)
whitePlanet.position.x = 10
whitePlanet.position.y = 10
whitePlanet.position.z = -15
whitePlanet.scale.set(1.7, 1.7, 1.7)
scene.add(whitePlanet)

// Rocky planet
let rockyPlanet = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 50, 20),
    new THREE.MeshStandardMaterial({
        map: rockyPlanetTexture
    })
)
rockyPlanet.position.x = -21
rockyPlanet.position.y = 9
rockyPlanet.position.z = -4
rockyPlanet.scale.set(0.7, 0.7, 0.7)
scene.add(rockyPlanet)


// Pink planet
let pinkPlanet = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 50, 20),
    new THREE.MeshStandardMaterial({
        color: 0Xff32a9,
        map: pinkPlanetTexture
    })
)
pinkPlanet.position.x = -5
pinkPlanet.position.y = 5
pinkPlanet.position.z = -4
pinkPlanet.scale.set(0.3, 0.3, 0.3)
scene.add(pinkPlanet)


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
// floor.position.z = 90
scene.add(floor)

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

let up = false
let left = false
let bottom = false
let right = false
let sprint = false

window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyW' || event.code === 'ArrowUp') {
        up = true
    }
    if (event.code === 'KeyS' || event.code === 'ArrowDown') {
        bottom = true
    }
    if (event.code === 'KeyD' || event.code === 'ArrowRight') {
        right = true
    }
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
        left = true
    }
    if (event.code === 'ShiftLeft') {
        sprint = true
    }
})

window.addEventListener('keyup', (event) => {
    if (event.code === 'KeyW' || event.code === 'ArrowUp') {
        up = false
    }
    if (event.code === 'KeyS' || event.code === 'ArrowDown') {
        bottom = false
    }
    if (event.code === 'KeyD' || event.code === 'ArrowRight') {
        right = false
    }
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
        left = false
    }
    if (event.code === 'ShiftLeft') {
        sprint = false
    }
})

let previousTime = Date.now()

/**
* Camera & Avatar Moves
*/
const player = {}
player.position = new THREE.Vector3(0, -9.5, 0)
player.view = {
    theta: { value: -0.2 },
    phi: { value: Math.PI * 0.52, min: Math.PI * 0.2, max: Math.PI * 0.7 },
    elevation: 1.65,
    radius: 2.5
}

document.body.addEventListener('mousedown', () => {

    document.body.requestPointerLock();

});

document.body.addEventListener('mousemove', (event) => {

    if (document.pointerLockElement === document.body) {
        player.view.theta.value -= event.movementX / 1000
        player.view.phi.value -= event.movementY / 1000

        if (player.view.phi.value < player.view.phi.min)
            player.view.phi.value = player.view.phi.min

        if (player.view.phi.value > player.view.phi.max)
            player.view.phi.value = player.view.phi.max
    }
})


// Loop
const loop = () => {
    window.requestAnimationFrame(loop)

    // Update controls
    controls.update()

    // Update planets
    if (rockyPlanet != null) {
        rockyPlanet.rotation.y = Date.now() * 0.0007
    }
    whitePlanet.rotation.y = Date.now() * 0.0007
    pinkPlanet.rotation.y = Date.now() * 0.0007

    const currentTime = Date.now()
    const deltaTime = currentTime - previousTime
    previousTime = currentTime

    if (avatar) {
        // Player position
        const playerDirection = new THREE.Vector3()

        let speed = sprint ? 3 : 1
        speed *= deltaTime
        speed *= 0.002

        if (up) {
            playerDirection.z = -speed
        }
        if (bottom) {
            playerDirection.z = speed
        }
        if (right) {
            playerDirection.x = speed
        }
        if (left) {
            playerDirection.x = -speed
        }

        playerDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.view.theta.value)

        const oldPlayerPosition = player.position.clone()
        player.position.add(playerDirection)
        avatar.position.copy(player.position)

        // Player rotation
        if (up || bottom || right || left) {
            const playerDirection = player.position.clone().sub(oldPlayerPosition)
            const angle = Math.atan2(playerDirection.x, playerDirection.z)
            avatar.rotation.y = angle

            avatarAnimation.play(sprint ? 'running' : 'walking')
        } else {
            avatarAnimation.play('standing')
        }

        // Player view
        const cameraPosition = new THREE.Vector3()
        cameraPosition.setFromSphericalCoords(player.view.radius, player.view.phi.value, player.view.theta.value)
        cameraPosition.y += player.view.elevation
        cameraPosition.add(player.position)

        const cameraTarget = player.position.clone()
        cameraTarget.y += player.view.elevation

        camera.position.copy(cameraPosition)
        camera.lookAt(cameraTarget)

        // Animation
        avatarAnimation.mixer.update(deltaTime * 0.001)
    }

    // Render
    renderer.render(scene, camera)
}

loop()
