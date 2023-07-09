import './main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

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

gltfLoader.load(
    './assets/models/player.glb',
    (gltf) => {
        avatar = gltf.scene
        avatar.position.z = 30

        avatar.scale.set(1.4, 1.4, 1.4)

        avatar.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }

        })
    })
scene.add(avatar)


// Add our scene
const scene = new THREE.Scene()
scene.background = backgroundTexture
// scene.fog = new THREE.FogExp2('#b2c1cb', 0.002)

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
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height)
// camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Add a purple rect light
const rectAreaLight1 = new THREE.RectAreaLight(0x4e00ff, 20, 20, 20)
rectAreaLight1.position.x = 2
rectAreaLight1.position.y = -6.5
rectAreaLight1.position.z = -37
rectAreaLight1.lookAt(new THREE.Vector3())
scene.add(rectAreaLight1)

// add a grey directionnal light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.castShadow = true
directionalLight.position.x = - 1
directionalLight.position.y = 2
directionalLight.position.z = 3
scene.add(directionalLight)

// Add the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.outputEncoding = THREE.sRGBEncoding
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

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

}

// Render
renderer.render(scene, camera)

loop()
