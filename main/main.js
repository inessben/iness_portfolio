import './main.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
// import { FontLoader } from './assets/modules/FontLoader.js'
// import { TextGeometry } from './assets/modules/TextGeometry.js'

// add loaders to gltf
const gltfLoader = new GLTFLoader()

// add a GLB player
let player = null
gltfLoader.load(
    './assets/models/player.glb',
    (gltf) => {
        player = gltf.scene
        player.position.x = -0.5
        player.position.y = -1.3

        player.scale.set(1.6, 1.6, 1.6)

        player.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        scene.add(player)
    }
)


// ADD A SCENE
const scene = new THREE.Scene()

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

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height)
camera.position.z = 4
scene.add(camera)

// Lights
const ambientLight = new THREE.AmbientLight(0xEFEFEF, 0.4)
scene.add(ambientLight)

// add a directionnal light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
directionalLight.castShadow = true
directionalLight.position.x = - 1
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

// loop
const loop = () => {
    window.requestAnimationFrame(loop)

    // Render
    renderer.render(scene, camera)
}

loop()