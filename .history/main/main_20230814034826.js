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
const floorTexture = textureLoader.load('textures/floor.jpg')
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set(5, 5)
// // background's texture
const backgroundTexture = textureLoader.load('textures/background.jpeg')
// particles
const star = textureLoader.load('particles/1.png')

// add a GLB player
let player = null
gltfLoader.load(
    'models/player.glb',
    (gltf) => {
        player = gltf.scene
        player.position.x = 10
        player.position.y = -9
        player.rotation.y = - Math.PI * 0.5


        player.scale.set(10, 10, 10)

        player.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = false
            }
        })

        scene.add(player)
    }
)

// add a GLB speech bubble
let bubbleSpeech
gltfLoader.load
    (
        'models/bubble-speech.glb',
        (gltf) => {
            bubbleSpeech = gltf.scene

            bubbleSpeech.traverse((child) => {
                if (child.isMesh)
                    child.castShadow = true
                child.receiveShadow = false
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
scene.fog = new THREE.FogExp2('#b2c1cb', 0.001)


// Geometry
const count = 100000
const positionArray = new Float32Array(count * 3)

for (let i = 0; i < count; i++) {
    // position
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 75
    positionArray[i * 3 + 1] = (Math.random() - 0.5) * 75
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 75
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute
    (
        'position',
        new THREE.BufferAttribute(positionArray, 3)
    )

// Material
const particlesMaterial = new THREE.PointsMaterial
    ({
        size: 0.07,
        sizeAttenuation: true,
        color: new THREE.Color(0xffffff),
        alphaMap: star,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

// Particles
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

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
const camera = new THREE.PerspectiveCamera(32, sizes.width / sizes.height, 1, 200)
camera.position.x = -24
camera.position.z = 10
scene.add(camera)

// Add some Lights
// Purple ambient light
const ambientLight = new THREE.AmbientLight(0xAD41FF, 1.4)
scene.add(ambientLight)

// Directionnal light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 3)
directionalLight.position.x = -5
directionalLight.position.y = 10
directionalLight.position.z = -15
directionalLight.castShadow = true
directionalLight.shadow.camera.top = 50
directionalLight.shadow.camera.right = 50
directionalLight.shadow.camera.bottom = - 50
directionalLight.shadow.camera.left = - 50
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

// Floor

let floor = new THREE.Mesh(
    new THREE.BoxGeometry(500, 1, 500),
    new THREE.MeshStandardMaterial({
        color: 0X000000,
        normalMap: floorTexture,

        normalScale: new THREE.Vector2(0.3, 0.3)
    })
)
floor.position.x = 1
floor.rotation.y = - Math.PI * 1
floor.position.y = -10
floor.receiveShadow = true

scene.add(floor)

// Add some texts
// Variable refers to the actual text
let currentTextMesh = null;
let isTransitioning = false;

// Array of texts
const texts = [
    "Hello, \n\nMy name is Iness, \nand I'm 19 Years \nold",
    "I live in Paris \nwhere I'm studying \ndigital: \nUI design, front-\nend dev and more.",
    "I love anything to \ndo with art, such \nas photography, \nfashion and \ndecoration. <3",
    "And I keep myself \nup to date with \nlatest trends, as \nthis stimulates my \ncuriosity.",
    "I'm a hard-worker \nwith a thirst for\nlearning and \nrigorous: for me \nevery detail counts"
];

// Index of text
let textIndex = 0;

// Function to show the specified text with a smooth transition
function showText(text, position) {
    const loader = new FontLoader();
    loader.load("fonts/press_start2_regular.json", (font) => {
        // Geometry and material of the text
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.33,
            height: 0.1
        });
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xe000000 });
        // Mesh of the text
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.copy(position);
        textMesh.rotation.y = -Math.PI * 0.5;

        if (isTransitioning) {
            // Add the new text to the scene, initially positioned to the right
            textMesh.position.x = 9;
            scene.add(textMesh);

            // Animate the transition
            new TWEEN.Tween(textMesh.position)
                .to({ x: 0 }, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onStart(() => {
                    isTransitioning = true;
                })
                .onComplete(() => {
                    isTransitioning = false;
                    // Remove the previous text from the scene
                    if (currentTextMesh) {
                        scene.remove(currentTextMesh);
                    }
                })
                .start();
        } else {
            // No transition on the first text
            if (currentTextMesh) {
                // Remove the previous text from the scene
                scene.remove(currentTextMesh);
            }
            scene.add(textMesh);
        }

        // Update the current text reference
        currentTextMesh = textMesh;
    });
}

// Function to handle the spacebar event
function handleSpacebar(event) {
    if (event.code === "Space") {
        // Prevent consecutive spacebar clicks during transition
        if (isTransitioning) {
            return;
        }

        textIndex++;

        if (textIndex >= texts.length) {
            textIndex = 0;
        }

        // Show the next text
        const text = texts[textIndex];
        const position = new THREE.Vector3(9, 6.5, -13);
        showText(text, position);
    }
}

// Add the event listener for the spacebar
window.addEventListener("keydown", handleSpacebar);

// Show the first text of the page
const initialText = texts[0];
const initialPosition = new THREE.Vector3(9, 6.5, -13);
showText(initialText, initialPosition);



// loop
const loop = () => {
    window.requestAnimationFrame(loop)

    // Update controls
    controls.update()

    // Update particles
    for (let i = 0; i < count; i++) {
        const iStride = i * 3

        const x = particlesGeometry.attributes.position.array[iStride + 0]
        const y = particlesGeometry.attributes.position.array[iStride + 1]
        const z = particlesGeometry.attributes.position.array[iStride + 2]

        const newY = y + Math.sin(Date.now() * 0.001 + x * 3 + z * 3) * 0.004
        particlesGeometry.attributes.position.array[iStride + 1] = newY
    }
    particlesGeometry.attributes.position.needsUpdate = true
    // Render
    renderer.render(scene, camera)
}

loop()