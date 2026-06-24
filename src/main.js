import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'


// ── Loading screen ───────────────────────────────────
const loadingScreen = document.createElement('div')
loadingScreen.className = 'loading-screen'
loadingScreen.innerHTML = `
    <div class="loading-screen__inner">
        <div class="loading-screen__title">MY PORTFOLIO</div>
        <div class="loading-screen__sub">Loading Station...</div>
        <div class="loading-screen__bar"><div class="loading-screen__fill"></div></div>
    </div>`
document.body.appendChild(loadingScreen)

const loadingFill = loadingScreen.querySelector('.loading-screen__fill')
let loadedAssets = 0
const totalAssets = 3

function dismissLoading() {
    loadingScreen.classList.add('hidden')
    setTimeout(() => { if (loadingScreen.parentNode) loadingScreen.remove() }, 800)
}

function updateLoading() {
    loadedAssets++
    const pct = Math.min((loadedAssets / totalAssets) * 100, 100)
    loadingFill.style.width = pct + '%'
    if (loadedAssets >= totalAssets) setTimeout(dismissLoading, 500)
}

setTimeout(dismissLoading, 10000)

// les loaders, un pour les modeles 3d et un pour les textures
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()

// la scene principale + le brouillard exponentiel pour l'atmospere
const scene = new THREE.Scene()

// les etoiles, 10 000 c'est pas de trop pour remplir le ciel
const starGeometry = new THREE.BufferGeometry()
const starCount = 10000
const starPositions = new Float32Array(starCount * 3)
const starSizes = new Float32Array(starCount)
const starOpacities = new Float32Array(starCount)
const starTwinkleSpeed = new Float32Array(starCount)

for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    const radius = 500 + Math.random() * 1500
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    starPositions[i3 + 1] = radius * Math.cos(phi)
    starPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

    starSizes[i] = Math.random() * 3 + 0.5
    starOpacities[i] = Math.random()
    starTwinkleSpeed[i] = 0.5 + Math.random() * 2.0
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
starGeometry.setAttribute('opacity', new THREE.BufferAttribute(starOpacities, 1))
starGeometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(starTwinkleSpeed, 1))

// shader pour faire scintiller les etoiles, le sin() fait l'effet de clignotement
const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        starColor: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute float twinkleSpeed;
        uniform float time;
        varying float vOpacity;
        
        void main() {
            vOpacity = opacity * (0.5 + 0.5 * sin(time * twinkleSpeed));
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform vec3 starColor;
        varying float vOpacity;
        
        void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            if (dist > 0.5) discard;
            
            float alpha = (1.0 - dist * 2.0) * vOpacity;
            gl_FragColor = vec4(starColor, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})
const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

// petites particules qui bougent dans le fond, donne un effet de profondeur
const interstellarParticleCount = 500
const interstellarGeometry = new THREE.BufferGeometry()
const interstellarPositions = new Float32Array(interstellarParticleCount * 3)
const interstellarVelocities = []

for (let i = 0; i < interstellarParticleCount; i++) {
    const i3 = i * 3
    // position aléatoire dans un grand volume
    interstellarPositions[i3] = (Math.random() - 0.5) * 2000
    interstellarPositions[i3 + 1] = (Math.random() - 0.5) * 1000 + 200
    interstellarPositions[i3 + 2] = (Math.random() - 0.5) * 2000

    // vitesse tres faible — on veut un effet lent et contemplatif
    interstellarVelocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: (Math.random() - 0.5) * 0.08,
        z: (Math.random() - 0.5) * 0.15
    })
}

interstellarGeometry.setAttribute('position', new THREE.BufferAttribute(interstellarPositions, 3))

// shader pour les particules, le discard enleve les coins carres
const interstellarMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0xB8D4F0) }
    },
    vertexShader: `
        varying vec3 vColor;
        uniform vec3 color;
        
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 4.0 * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        
        void main() {
            // Créer une forme ronde avec gradient radial (effet étincelle)
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);
            
            // Forme ronde parfaite avec halo
            if (dist > 0.5) discard;
            
            // Gradient radial : brillant au centre, transparent aux bords
            float alpha = 1.0 - (dist * 2.0);
            alpha = pow(alpha, 1.5); // Plus brillant au centre
            
            gl_FragColor = vec4(vColor, alpha * 0.8);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})

const interstellarParticles = new THREE.Points(interstellarGeometry, interstellarMaterial)
scene.add(interstellarParticles)

// le dome du ciel, une sphere retournée avec un shader qui anime les nebuleuses
const skyGeometry = new THREE.SphereGeometry(1800, 32, 32)
const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 }
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec3 vWorldPosition;
        
        void main() {
            vec3 direction = normalize(vWorldPosition);
            
            // Dégradé bleu nuit profond avec animation
            float horizon = abs(direction.y);
            
            // Couleurs de base bleu nuit
            vec3 deepNightBlue = vec3(0.0, 0.001, 0.008);
            vec3 midnightBlue = vec3(0.001, 0.002, 0.012);
            
            // Animation subtile de la couleur
            float colorShift = sin(time * 0.1) * 0.02;
            vec3 skyColor = mix(
                deepNightBlue + vec3(colorShift, colorShift * 0.5, colorShift * 2.0),
                midnightBlue + vec3(colorShift * 0.5, colorShift, colorShift * 1.5),
                horizon
            );
            
            // Nébuleuses violettes animées
            float nebula = sin(direction.x * 2.0 + time * 0.08) * 
                          cos(direction.z * 1.5 + time * 0.06) * 0.3 + 0.7;
            nebula = pow(nebula, 3.0);
            
            vec3 nebulaColor = vec3(0.15, 0.08, 0.25) * nebula * 0.25;
            
            // Animation de pulsation globale
            float pulse = 0.95 + sin(time * 0.15) * 0.05;
            
            gl_FragColor = vec4((skyColor + nebulaColor) * pulse, 1.0);
        }
    `,
    side: THREE.BackSide
})
const skyDome = new THREE.Mesh(skyGeometry, skyMaterial)
scene.add(skyDome)

let flyingSaucer = null

gltfLoader.load('/models/flying_saucer.glb',
    (gltf) => {
        flyingSaucer = gltf.scene
        flyingSaucer.scale.set(3, 3, 3)
        flyingSaucer.position.set(0, 35, -120)
        flyingSaucer.userData = { orbit: true, orbitRadius: 80, orbitSpeed: 0.0004 }
        flyingSaucer.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        // lumiere attachée directement à la soucoupe — suit sa position automatiquement
        const saucerLight = new THREE.PointLight(0x88ccff, 20, 300)
        saucerLight.position.set(0, -2, 0)
        flyingSaucer.add(saucerLight)

        scene.add(flyingSaucer)
        console.log('flying saucer chargé')
        updateLoading()
    },
    undefined,
    (err) => { console.warn('flying_saucer.glb non trouvé', err); updateLoading() }
)

// ── TEST modular-crate.glb ────────────────────────────
const crateConfigs = [
    { x: -60,  z:  -80,  ry: 0.4,  color: 0x7a8a9a },
    { x:  90,  z:  -50,  ry: 1.1,  color: 0x4a6a8a },
    { x: -110, z:   60,  ry: 2.3,  color: 0x5a7090 },
    { x:  70,  z:  120,  ry: 0.8,  color: 0x8a9aaa },
    { x: -30,  z: -140,  ry: 1.7,  color: 0x2a4a6a },
    { x:  140, z:   30,  ry: 0.2,  color: 0x6a8aaa },
    { x: -80,  z:  150,  ry: 2.8,  color: 0x3a5a7a },
    { x:  50,  z: -160,  ry: 1.4,  color: 0x9aaabb },
    { x: -220, z: -200,  ry: 0.9,  color: 0x5a6a80 },
    { x:  250, z:  180,  ry: 2.1,  color: 0x4a5a7a },
    { x: -180, z:  250,  ry: 1.5,  color: 0x6a7a90 },
    { x:  200, z: -240,  ry: 0.3,  color: 0x3a5a6a },
    { x: -280, z:  -40,  ry: 2.6,  color: 0x7a8a9a },
    { x:  160, z:  280,  ry: 1.8,  color: 0x5a7090 },
    { x:  20,  z:  -25,  ry: 0.6,  color: 0x6a7a8a },
    { x: -25,  z:   20,  ry: 1.9,  color: 0x5a6a7a },
    { x:  35,  z:   40,  ry: 0.3,  color: 0x7a8a9a },
]
let crateLoaded = false
crateConfigs.forEach(({ x, z, ry, color }) => {
    gltfLoader.load('/models/modular-crate.glb', (gltf) => {
        if (!crateLoaded) { crateLoaded = true; updateLoading() }
        const crate = gltf.scene
        crate.scale.setScalar(0.05)
        crate.position.set(x, -2, z)
        crate.rotation.y = ry
        crate.traverse((child) => {
            if (child.isMesh) {
                child.material = child.material.clone()
                child.material.color.set(color)
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        scene.add(crate)
    }, undefined, (err) => { console.warn('modular-crate.glb ERREUR', err); if (!crateLoaded) { crateLoaded = true; updateLoading() } })
})

// ── Colliders (cercles simples x, z, rayon) ──────────
const colliders = []
crateConfigs.forEach(c => colliders.push({ x: c.x, z: c.z, r: 4 }))
colliders.push({ x: -40, z: -250, r: 15 })

// ── Space shuttle au sol ─────────────────────────────
gltfLoader.load('/models/orbiter_space_shuttle.glb', (gltf) => {
    const shuttle = gltf.scene
    shuttle.scale.set(3.5, 3.5, 3.5)
    shuttle.position.set(-40, 10, -250)
    shuttle.rotation.y = Math.PI * 0.15
    shuttle.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
        }
    })
    scene.add(shuttle)
    console.log('shuttle chargé')
}, undefined, (err) => console.warn('orbiter_space_shuttle.glb non trouvé', err))

// ── Barrières métalliques autour du périmètre ────────
const barrierPositions = [
    // derrière About (z=-60) → z=-95
    { x: -35, z: -95, ry: 0 },
    { x: -15, z: -95, ry: 0 },
    { x:   5, z: -95, ry: 0 },
    { x:  25, z: -95, ry: 0 },
    { x:  45, z: -95, ry: 0 },
    // derrière Projects (x=60) → x=95
    { x: 95, z: -35, ry: Math.PI / 2 },
    { x: 95, z: -15, ry: Math.PI / 2 },
    { x: 95, z:   5, ry: Math.PI / 2 },
    { x: 95, z:  25, ry: Math.PI / 2 },
    { x: 95, z:  45, ry: Math.PI / 2 },
    // derrière Skills (z=60) → z=95
    { x: -35, z: 95, ry: 0 },
    { x: -15, z: 95, ry: 0 },
    { x:   5, z: 95, ry: 0 },
    { x:  25, z: 95, ry: 0 },
    { x:  45, z: 95, ry: 0 },
    // derrière Contact (x=-60) → x=-95
    { x: -95, z: -35, ry: Math.PI / 2 },
    { x: -95, z: -15, ry: Math.PI / 2 },
    { x: -95, z:   5, ry: Math.PI / 2 },
    { x: -95, z:  25, ry: Math.PI / 2 },
    { x: -95, z:  45, ry: Math.PI / 2 },
    // coins
    { x: -95, z: -95, ry: Math.PI / 4 },
    { x:  95, z: -95, ry: -Math.PI / 4 },
    { x:  95, z:  95, ry: Math.PI / 4 },
    { x: -95, z:  95, ry: -Math.PI / 4 },
]

barrierPositions.forEach(({ x, z, ry }) => {
    gltfLoader.load('/models/metal_barrier.glb', (gltf) => {
        const barrier = gltf.scene
        barrier.scale.set(7, 7, 7)
        barrier.position.set(x, -9.5, z)
        barrier.rotation.y = ry
        barrier.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        scene.add(barrier)
    }, undefined, (err) => console.warn('metal_barrier.glb non trouvé', err))
})

// ── Shader backdrop : plan courbé violet / orange ─────
// large plan derriere la scene, vertex shader le courbe en arc
const backdropGeo = new THREE.PlaneGeometry(1400, 1400, 32, 32)
const backdropMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec3 pos = position;
            // courbure horizontale en parabole
            float t = pos.x / 700.0;
            pos.z += t * t * 120.0;
            // légère courbure verticale
            float tv = pos.y / 350.0;
            pos.z += tv * tv * 30.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec2 vUv;

        void main() {
            // ondes qui se croisent — meme logique que le ground fog
            float w1 = sin(vUv.x * 5.0  + time * 0.35) * 0.5 + 0.5;
            float w2 = cos(vUv.y * 3.5  - time * 0.28 + 1.1) * 0.5 + 0.5;
            float w3 = sin((vUv.x + vUv.y) * 4.5 + time * 0.55) * 0.5 + 0.5;
            float blend = w1 * 0.40 + w2 * 0.35 + w3 * 0.25;

            vec3 violet  = vec3(0.42, 0.08, 0.68);
            vec3 orange  = vec3(0.92, 0.38, 0.04);
            vec3 deepBlue = vec3(0.02, 0.03, 0.16);

            vec3 col = mix(deepBlue, mix(violet, orange, blend), blend * 0.55);

            // fade sur les bords et le bas pour s'intégrer au sol
            float fadeX = sin(vUv.x * 3.14159);
            float fadeY = smoothstep(0.0, 0.25, vUv.y);
            float alpha = fadeX * fadeY * 0.18;

            gl_FragColor = vec4(col, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
})
const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat)
backdropMesh.position.set(0, 55, -920)
backdropMesh.renderOrder = -2
scene.add(backdropMesh)

// ── Système de météorites ─────────────────────────────
const meteors = []
let nextMeteorIn = 4 + Math.random() * 4   // première météorite dans 4-8 s

function spawnMeteor() {
    // corps principal
    const size = 0.4 + Math.random() * 1.0
    const geo  = new THREE.SphereGeometry(size, 7, 7)
    const mat  = new THREE.MeshStandardMaterial({
        color: 0xffaa44,
        emissive: new THREE.Color(0xff5500),
        emissiveIntensity: 3.0,
        roughness: 0.6
    })
    const mesh = new THREE.Mesh(geo, mat)

    // spawn en hauteur dans un large volume
    const startX = (Math.random() - 0.5) * 800
    const startY = 180 + Math.random() * 120
    const startZ = (Math.random() - 0.5) * 800
    mesh.position.set(startX, startY, startZ)

    // direction diagonale vers le bas + légère lueur
    const spd = 4 + Math.random() * 5
    const angle = Math.random() * Math.PI * 2
    mesh.userData = {
        vx: Math.cos(angle) * spd * 0.6,
        vy: -(1.5 + Math.random() * 2.5),
        vz: Math.sin(angle) * spd * 0.6,
        life: 0,
        maxLife: 2.5 + Math.random() * 2.0,
        // trainee : petits points derriere la meteorite
        trail: []
    }

    // lumiere ponctuelle attachée à la météorite
    const light = new THREE.PointLight(0xff6600, 4, 30)
    mesh.add(light)

    scene.add(mesh)
    meteors.push(mesh)
}

function updateMeteors(dt) {
    // timer de spawn
    nextMeteorIn -= dt
    if (nextMeteorIn <= 0) {
        spawnMeteor()
        nextMeteorIn = 3 + Math.random() * 6
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        const d = m.userData
        m.position.x += d.vx
        m.position.y += d.vy
        m.position.z += d.vz
        d.life += dt

        // tombe trop bas ou temps ecoule → retire
        if (d.life > d.maxLife || m.position.y < -30) {
            scene.remove(m)
            m.geometry.dispose()
            m.material.dispose()
            m.children.forEach(c => { if (c.isLight) c.dispose() })
            meteors.splice(i, 1)
        }
    }
}

// ── Player ───────────────────────────────────────────
let player   = null
let mixer    = null
let walkAction = null

const keys = { up: false, down: false, left: false, right: false }
const SPEED = 0.38

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp'    || e.key === 'z' || e.key === 'Z' || e.key === 'w' || e.key === 'W') keys.up    = true
    if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') keys.down  = true
    if (e.key === 'ArrowLeft'  || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') keys.left  = true
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true
})
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp'    || e.key === 'z' || e.key === 'Z' || e.key === 'w' || e.key === 'W') keys.up    = false
    if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') keys.down  = false
    if (e.key === 'ArrowLeft'  || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') keys.left  = false
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false
})

// si le glb marche pas on met un cube bleu en attendant
const createFallbackPlayer = () => {
    const geometry = new THREE.BoxGeometry(4, 8, 4)
    const material = new THREE.MeshStandardMaterial({
        color: 0x4A90E2,
        roughness: 0.7,
        metalness: 0.3
    })
    player = new THREE.Mesh(geometry, material)
    player.position.set(0, -5, 0)
    player.castShadow = true
    player.receiveShadow = true
    scene.add(player)
    console.log('Player de secours créé (cube bleu)')
}

// chargement du perso, le scale a 8 parce que le modele etait tout petit sinon
gltfLoader.load('/models/player.glb',
    (gltf) => {
        player = gltf.scene
        player.position.set(0, -9, 0)
        player.scale.set(9, 9, 9)
        player.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        scene.add(player)

        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(player)
            const clip = THREE.AnimationClip.findByName(gltf.animations, 'walk')
                      ?? THREE.AnimationClip.findByName(gltf.animations, 'Walk')
                      ?? gltf.animations[0]
            walkAction = mixer.clipAction(clip)
            walkAction.setLoop(THREE.LoopRepeat, Infinity)
            walkAction.play()
            mixer.update(0.5)
            walkAction.paused = true
        }
        console.log('player chargé — animations:', gltf.animations.map(a => a.name))
        updateLoading()
    },
    (progress) => {
        console.log('chargement:', (progress.loaded / progress.total * 100).toFixed(2) + '%')
    },
    (error) => {
        // le glb a pas marché, on met le cube de secours
        console.error('erreur player.glb:', error)
        createFallbackPlayer()
        updateLoading()
    }
)

// taille de la fenetre, se met a jour si on redimentionne
const sizes = { width: window.innerWidth, height: window.innerHeight }
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// la camera, fov 75 ca donne un bon champ de vision
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 2000)
camera.position.set(0, 3.5, 20)

// ── Audio spatial ─────────────────────────────────────
const audioListener = new THREE.AudioListener()
camera.add(audioListener)

// son ambiant global (loop) — declenché par le premier clic utilisateur
const ambientSound = new THREE.Audio(audioListener)
const audioLoader = new THREE.AudioLoader()
audioLoader.load('/sounds/ambient.mp3', (buffer) => {
    ambientSound.setBuffer(buffer)
    ambientSound.setLoop(true)
    ambientSound.setVolume(0.3)
    // on attend un geste utilisateur pour contourner la politique autoplay des nav
    document.addEventListener('click', () => {
        if (!ambientSound.isPlaying) ambientSound.play()
    }, { once: true })
}, undefined, () => console.warn('ambient.mp3 non trouvé — place le fichier dans /public/sounds/'))

// ── Bouton volume ────────────────────────────────────
let audioMuted = false
const toolbar = document.createElement('div')
toolbar.className = 'toolbar'
document.body.appendChild(toolbar)

const volumeBtn = document.createElement('div')
volumeBtn.className = 'volume-btn'
const svgOn = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'
const svgOff = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
volumeBtn.innerHTML = svgOn
toolbar.appendChild(volumeBtn)

volumeBtn.addEventListener('click', () => {
    audioMuted = !audioMuted
    audioListener.setMasterVolume(audioMuted ? 0 : 1)
    volumeBtn.innerHTML = audioMuted ? svgOff : svgOn
    volumeBtn.classList.toggle('muted', audioMuted)
})

// ── Bouton CV ────────────────────────────────────────
const cvBtn = document.createElement('a')
cvBtn.className = 'cv-btn'
cvBtn.href = '/cv.pdf'
cvBtn.download = 'Iness_Ben_Aissa_CV.pdf'
cvBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download CV'
toolbar.appendChild(cvBtn)

// lumiere ambiante unique (combinaison des deux instances précédentes)
const ambientLight = new THREE.AmbientLight(0x8090b0, 4.5)
scene.add(ambientLight)

// lumiere douce sur le joueur
const playerFillLight = new THREE.PointLight(0xffffff, 1.5, 50)
playerFillLight.position.set(0, 5, 10)
scene.add(playerFillLight)

// spots de station encastrés au sol — pointent vers le haut, pas de reflet
const stationSpots = [
    { x: 0,    z: -60,  color: 0x4488ff },
    { x: 60,   z: 0,    color: 0x44ffaa },
    { x: 0,    z: 60,   color: 0xaa44ff },
    { x: -60,  z: 0,    color: 0xff8844 },
    { x: -40,  z: -40,  color: 0x3366aa },
    { x: 40,   z: 40,   color: 0x3366aa },
    { x: 40,   z: -100, color: 0x224488 },
    { x: -40,  z: 100,  color: 0x224488 },
]
stationSpots.forEach(({ x, z, color }) => {
    const spot = new THREE.SpotLight(color, 3, 60, Math.PI * 0.4, 0.6, 2)
    spot.position.set(x, -8.5, z)
    spot.target.position.set(x, 20, z)
    scene.add(spot)
    scene.add(spot.target)
})

// hemisphere light — ciel bleu froid en haut, sol chaud en bas
const hemiLight = new THREE.HemisphereLight(0x4466aa, 0x221100, 0.8)
scene.add(hemiLight)

// directionnelles blanches latérales — éclairent le joueur et les objets
const dirLightRight = new THREE.DirectionalLight(0xffffff, 2)
dirLightRight.position.set(60, 30, 0)
scene.add(dirLightRight)

const dirLightLeft = new THREE.DirectionalLight(0xffffff, 2)
dirLightLeft.position.set(-60, 30, 0)
scene.add(dirLightLeft)

// le renderer webgl, antialias pour que ce soit pas trop pixelisé
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor(0x000205, 1)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// ── Bloom (post-processing) ───────────────────────────
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.3,   // strength
    0.3,   // radius
    0.7    // threshold — seules les zones très lumineuses glowent
)
composer.addPass(bloomPass)

window.addEventListener('resize', () => {
    composer.setSize(sizes.width, sizes.height)
})

// ── TPS Camera ───────────────────────────────────────
let cameraTheta = 0      // angle horizontal autour du player
let cameraPhi   = 0.4    // angle vertical (elevation)
const CAM_DISTANCE = 26
const CAM_HEIGHT   = 4

let isDragging = false
let prevMouse  = { x: 0, y: 0 }

renderer.domElement.addEventListener('mousedown', (e) => {
    isDragging = true
    prevMouse  = { x: e.clientX, y: e.clientY }
})
window.addEventListener('mouseup',  () => isDragging = false)
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    cameraTheta -= (e.clientX - prevMouse.x) * 0.005
    cameraPhi    = Math.max(0.05, Math.min(1.1, cameraPhi - (e.clientY - prevMouse.y) * 0.005))
    prevMouse    = { x: e.clientX, y: e.clientY }
})

// zoom molette
window.addEventListener('wheel', (e) => {}, { passive: true })

// le sol lunaire, un grand plan avec une texture metallique
const lunarPlaneSize = 2000;

// j'utilise la meme texture pour les 3 maps, ca suffit pour l'effet voulu
const lunarColorMap = textureLoader.load('textures/metal.jpg');
const lunarNormalMap = textureLoader.load('textures/metal.jpg');
const lunarDisplacementMap = textureLoader.load('textures/metal.jpg');

// repeat a 20 pour que la texture soit pas trop grande sur le sol
[lunarColorMap, lunarNormalMap, lunarDisplacementMap].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
});

// 128 segments pour que le displacement map ait de la resolution
const lunarGeometry = new THREE.PlaneGeometry(lunarPlaneSize, lunarPlaneSize, 128, 128);

// effet vitre metallique, roughness bas = bien reflechissant
const lunarMaterial = new THREE.MeshStandardMaterial({
    map: lunarColorMap,
    normalMap: lunarNormalMap,
    displacementMap: lunarDisplacementMap,
    displacementScale: 0.5,
    roughness: 0.15,
    metalness: 0.85,
    envMapIntensity: 1.5,
    color: 0x777777,
});

const lunarSurface = new THREE.Mesh(lunarGeometry, lunarMaterial);
lunarSurface.rotation.x = -Math.PI / 2; // on le met a plat
lunarSurface.position.set(0, -9.5, 0);
lunarSurface.receiveShadow = true;

scene.add(lunarSurface);

// ── Pad d'atterrissage ───────────────────────────────
const padGroup = new THREE.Group()
padGroup.position.set(0, -9.4, -90)

// cercle extérieur
const ringGeo = new THREE.RingGeometry(14, 15, 64)
const ringMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 1.5, side: THREE.DoubleSide })
const ring = new THREE.Mesh(ringGeo, ringMat)
ring.rotation.x = -Math.PI / 2
padGroup.add(ring)

// cercle intérieur
const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(6, 7, 64),
    new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 1.5, side: THREE.DoubleSide })
)
innerRing.rotation.x = -Math.PI / 2
padGroup.add(innerRing)

// croix centrale (2 barres)
const barGeo = new THREE.PlaneGeometry(28, 1)
const barMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 1.2, side: THREE.DoubleSide })
const bar1 = new THREE.Mesh(barGeo, barMat)
bar1.rotation.x = -Math.PI / 2
padGroup.add(bar1)
const bar2 = new THREE.Mesh(barGeo, barMat)
bar2.rotation.x = -Math.PI / 2
bar2.rotation.z = Math.PI / 2
padGroup.add(bar2)


scene.add(padGroup)

// ── Écrans holographiques ─────────────────────────────
const holoMats = []
const holoScreens = {}

function createHoloScreen(zone) {
    const canvas = document.createElement('canvas')
    canvas.width  = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    const hex = '#ff8844'

    function drawScreen() {
        ctx.fillStyle = 'rgba(20, 8, 2, 0.15)'
        ctx.fillRect(0, 0, 512, 256)

        ctx.strokeStyle = hex
        ctx.lineWidth = 3
        ctx.strokeRect(12, 12, 488, 232)

        ctx.lineWidth = 4
        ;[[12,12],[500,12],[12,244],[500,244]].forEach(([x, y], i) => {
            ctx.beginPath()
            const sx = i % 2 === 0 ? 1 : -1
            const sy = i < 2 ? 1 : -1
            ctx.moveTo(x + sx * 20, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * 20)
            ctx.stroke()
        })

        ctx.strokeStyle = 'rgba(255,150,50,0.06)'
        ctx.lineWidth = 1
        for (let y = 0; y < 256; y += 4) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
        }

        ctx.fillStyle = hex
        ctx.shadowColor = hex
        ctx.shadowBlur = 25
        ctx.font = 'bold 64px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(zone.name.toUpperCase(), 256, 150)

        ctx.fillStyle = 'rgba(255,180,100,0.6)'
        ctx.shadowBlur = 0
        ctx.font = '20px monospace'
        ctx.fillText('[ ACCES ZONE ]', 256, 210)
    }

    drawScreen()
    const texture = new THREE.CanvasTexture(canvas)

    const mat = new THREE.ShaderMaterial({
        uniforms: { map: { value: texture }, time: { value: 0 } },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D map;
            uniform float time;
            varying vec2 vUv;
            float rand(float x) { return fract(sin(x * 127.1) * 43758.5); }
            void main() {
                vec2 uv = vUv;
                float trigger = step(0.55, sin(time * 6.0) * 0.5 + 0.5);
                float shift   = step(0.82, rand(floor(uv.y * 30.0 + time * 15.0)));
                uv.x += shift * (rand(time * 4.0) - 0.5) * 0.09 * trigger;
                vec4 col = texture2D(map, uv);
                col.r = texture2D(map, uv + vec2(0.005 * trigger, 0.0)).r;
                col.b = texture2D(map, uv - vec2(0.005 * trigger, 0.0)).b;
                gl_FragColor = vec4(col.rgb, col.a * 1.0);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
    })

    const screen = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 0.3), mat)
    const randOffX = (Math.random() - 0.5) * 40
    const randOffZ = (Math.random() - 0.5) * 40
    screen.position.set(
        zone.position.x * 1.1 + randOffX,
        -2,
        zone.position.z * 1.1 + randOffZ
    )
    screen.lookAt(0, -2, 0)

    const screenLight = new THREE.PointLight(0xff8844, 1.5, 20)
    screenLight.position.copy(screen.position)
    screenLight.position.y += 2
    scene.add(screenLight)
    scene.add(screen)
    holoMats.push(mat)
    holoScreens[zone.name] = { mesh: screen, light: screenLight, mat, baseScale: 1 }
}

// les 4 zones du portfolio, chacune avec une couleur et une position dans le monde

const ZONES = [
    { name: 'About',    color: 0x4488ff, position: new THREE.Vector3(0,   -8.5, -60) },
    { name: 'Projects', color: 0x44ffaa, position: new THREE.Vector3(60,  -8.5,   0) },
    { name: 'Skills',   color: 0xaa44ff, position: new THREE.Vector3(0,   -8.5,  60) },
    { name: 'Contact',  color: 0xff8844, position: new THREE.Vector3(-60, -8.5,   0) },
]

const zoneMarkers = []

ZONES.forEach((zone, i) => {
    const group = new THREE.Group()

    const light = new THREE.PointLight(zone.color, 2, 40)
    light.position.set(0, 5, 0)
    group.add(light)

    group.position.copy(zone.position)
    group.userData = { zone, light, phaseOffset: i * (Math.PI * 0.5) }
    scene.add(group)
    zoneMarkers.push(group)

    createHoloScreen(zone)
})

// ── Effet chaleur / miroir au sol ────────────────────
// plan leger juste au dessus du sol avec des ondes de chaleur montantes
const heatGeo = new THREE.PlaneGeometry(300, 300, 1, 1)
const heatMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
            float w1 = sin(vUv.x * 28.0 + time * 1.9) * 0.5 + 0.5;
            float w2 = sin(vUv.x * 45.0 - time * 1.3 + 1.57) * 0.5 + 0.5;
            float w3 = sin((vUv.x + vUv.y) * 18.0 + time * 0.8) * 0.5 + 0.5;
            float shimmer = w1 * 0.4 + w2 * 0.35 + w3 * 0.25;
            float edgeFade = sin(vUv.x * 3.14159) * sin(vUv.y * 3.14159);
            float topFade  = pow(1.0 - vUv.y, 1.5);
            float alpha = shimmer * edgeFade * topFade * 0.07;
            gl_FragColor = vec4(1.0, 0.92, 0.8, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})
const heatPlane = new THREE.Mesh(heatGeo, heatMat)
heatPlane.rotation.x = -Math.PI / 2
heatPlane.position.y = -8.0
heatPlane.renderOrder = 2
scene.add(heatPlane)













// ═══════════════════════════════════════════════
// 🗺️ MINIMAP
// ═══════════════════════════════════════════════

const MINIMAP_SIZE   = 148
const MINIMAP_SCALE  = 0.75       // 1 unité monde → px minimap
const MINIMAP_CENTER = MINIMAP_SIZE / 2
const MM_VIOLET      = '#aa77ff'  // couleur unique pour tous les éléments

const minimapCanvas = document.createElement('canvas')
minimapCanvas.width  = MINIMAP_SIZE
minimapCanvas.height = MINIMAP_SIZE
minimapCanvas.className = 'minimap'
document.body.appendChild(minimapCanvas)
const mmCtx = minimapCanvas.getContext('2d')

function drawMinimap() {
    mmCtx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE)

    // Fond circulaire
    mmCtx.save()
    mmCtx.beginPath()
    mmCtx.arc(MINIMAP_CENTER, MINIMAP_CENTER, MINIMAP_CENTER - 2, 0, Math.PI * 2)
    mmCtx.fillStyle   = 'rgba(2, 10, 30, 0.82)'
    mmCtx.fill()
    mmCtx.strokeStyle = 'rgba(255,255,255,0.12)'
    mmCtx.lineWidth   = 1.5
    mmCtx.stroke()
    mmCtx.clip()

    // Grille légère
    mmCtx.strokeStyle = 'rgba(255,255,255,0.04)'
    mmCtx.lineWidth   = 1
    for (let x = 0; x < MINIMAP_SIZE; x += 30) {
        mmCtx.beginPath(); mmCtx.moveTo(x, 0); mmCtx.lineTo(x, MINIMAP_SIZE); mmCtx.stroke()
    }
    for (let y = 0; y < MINIMAP_SIZE; y += 30) {
        mmCtx.beginPath(); mmCtx.moveTo(0, y); mmCtx.lineTo(MINIMAP_SIZE, y); mmCtx.stroke()
    }

    // Position joueur sur la minimap (X/Z → X/Y)
    const px = player ? MINIMAP_CENTER + player.position.x * MINIMAP_SCALE : MINIMAP_CENTER
    const py = player ? MINIMAP_CENTER + player.position.z * MINIMAP_SCALE : MINIMAP_CENTER

    // Zones + flèches directionnelles — tout en violet
    ZONES.forEach((zone) => {
        const zx = MINIMAP_CENTER + zone.position.x * MINIMAP_SCALE
        const zy = MINIMAP_CENTER + zone.position.z * MINIMAP_SCALE

        // Point de zone
        mmCtx.beginPath()
        mmCtx.arc(zx, zy, 4, 0, Math.PI * 2)
        mmCtx.fillStyle  = MM_VIOLET
        mmCtx.shadowColor = MM_VIOLET
        mmCtx.shadowBlur  = 7
        mmCtx.fill()
        mmCtx.shadowBlur  = 0

        // Nom de la zone
        mmCtx.font      = 'bold 8px "Montserrat", sans-serif'
        mmCtx.fillStyle = MM_VIOLET
        mmCtx.textAlign = 'center'
        mmCtx.fillText(zone.name.toUpperCase(), zx, zy - 7)

        // Flèche directionnelle depuis le joueur vers la zone
        const dx = zx - px
        const dy = zy - py
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 4) return

        const ux = dx / dist
        const uy = dy / dist
        const arrowStart = 9
        const arrowLen   = Math.min(dist - 12, 18)
        if (arrowLen < 6) return

        const ax = px + ux * arrowStart
        const ay = py + uy * arrowStart
        const bx = ax + ux * arrowLen
        const by = ay + uy * arrowLen

        // Ligne
        mmCtx.beginPath()
        mmCtx.moveTo(ax, ay)
        mmCtx.lineTo(bx, by)
        mmCtx.strokeStyle = MM_VIOLET
        mmCtx.lineWidth   = 1.2
        mmCtx.globalAlpha = 0.55
        mmCtx.stroke()
        mmCtx.globalAlpha = 1

        // Pointe de flèche
        const angle   = Math.atan2(uy, ux)
        const tipSize = 4
        mmCtx.beginPath()
        mmCtx.moveTo(bx, by)
        mmCtx.lineTo(bx - tipSize * Math.cos(angle - 0.4), by - tipSize * Math.sin(angle - 0.4))
        mmCtx.lineTo(bx - tipSize * Math.cos(angle + 0.4), by - tipSize * Math.sin(angle + 0.4))
        mmCtx.closePath()
        mmCtx.fillStyle = MM_VIOLET
        mmCtx.fill()
    })

    // Holo screens — petits losanges orange
    Object.keys(holoScreens).forEach(name => {
        const hs = holoScreens[name]
        const sx = MINIMAP_CENTER + hs.mesh.position.x * MINIMAP_SCALE
        const sy = MINIMAP_CENTER + hs.mesh.position.z * MINIMAP_SCALE
        mmCtx.save()
        mmCtx.translate(sx, sy)
        mmCtx.rotate(Math.PI / 4)
        mmCtx.fillStyle = 'rgba(255,136,68,0.5)'
        mmCtx.shadowColor = '#ff8844'
        mmCtx.shadowBlur = 4
        mmCtx.fillRect(-2.5, -2.5, 5, 5)
        mmCtx.shadowBlur = 0
        mmCtx.restore()
    })

    // Joueur — même violet, pulse discret
    const pulseR = 3.5 + Math.sin(performance.now() * 0.005) * 1.2
    mmCtx.beginPath()
    mmCtx.arc(px, py, pulseR, 0, Math.PI * 2)
    mmCtx.fillStyle = 'rgba(170,119,255,0.18)'
    mmCtx.fill()
    mmCtx.beginPath()
    mmCtx.arc(px, py, 2.5, 0, Math.PI * 2)
    mmCtx.fillStyle  = MM_VIOLET
    mmCtx.shadowColor = MM_VIOLET
    mmCtx.shadowBlur  = 5
    mmCtx.fill()
    mmCtx.shadowBlur  = 0

    // Boussole N
    mmCtx.font      = 'bold 9px "Montserrat", sans-serif'
    mmCtx.fillStyle = 'rgba(170,119,255,0.45)'
    mmCtx.textAlign = 'center'
    mmCtx.fillText('N', MINIMAP_CENTER, 10)

    mmCtx.restore()
}

// ═══════════════════════════════════════════════
// 🃏 PROXIMITY CARDS
// ═══════════════════════════════════════════════

const ZONE_CONTENTS = {
    About: {
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        title: 'About Me',
        body: `Half developer, half project manager: I turn chaos into structured, high-impact digital experiences.<br><br>I bring ideas to life by combining development skills, creative direction, and strong organization. Building products that are both visually compelling and technically sound.<br><br>My focus: crafting seamless experiences, scalable systems, and polished digital solutions with purpose.`,

    },
    Projects: {
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
        title: 'Projects',
        projects: [
            { name: 'Prestige Car BNS', desc: 'VTC service platform', href: 'https://www.prestigecarbns.com/' },
            { name: 'NessCake', desc: 'Pastry recipes app', href: 'https://nesscake.fr/' },
            { name: 'Make It Art', desc: 'Art digital platform', href: 'https://makeitart.io/' },
        ],

    },
    Skills: {
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        title: 'Skills',
        skillGroups: [
            { label: 'Development', items: ['JavaScript (ES6+)', 'React.js', 'Three.js', 'Node.js', 'Express.js', 'Next.js'] },
            { label: 'Design', items: ['Canva','Figma', 'UX/UI Design', 'Design Systems'] },
            { label: 'Workflow', items: ['Git / GitHub', 'Agile / Scrum', 'Trello/Asana', 'Pitch Deck', 'Digital Strategy'] },
        ],

    },
    Contact: {
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
        title: 'Contact',
        links: [
            { label: 'Email',     href: 'mailto:ine.benss@gmail.com', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' },
            { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/iness-benaissa/', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>' },
            { label: 'Instagram', href: 'https://www.instagram.com/__nenou/', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' },
        ],

    },
}

const proximityCard = document.createElement('div')
proximityCard.className = 'proximity-card'
proximityCard.innerHTML = '<div class="proximity-card__inner"></div>'
document.body.appendChild(proximityCard)

let activeZone        = null
const PROXIMITY_ENTER = 22
const PROXIMITY_EXIT  = 28

// ── HUD ──────────────────────────────────────────────
const hud = document.createElement('div')
hud.className = 'hud'
hud.innerHTML = `
    <div class="hud__zone">—</div>
    <div class="hud__coords">0.0 · 0.0</div>
`
document.body.appendChild(hud)

function buildCardContent(zone) {
    const c     = ZONE_CONTENTS[zone.name]
    const color = '#ff8844'
    let html = `
        <div class="pc-header" style="--zone-color:${color}">
            <span class="pc-icon">${c.icon}</span>
            <div>
                <div class="pc-title">${c.title}</div>
            </div>
            <div class="pc-close" id="proximity-close">✕</div>
        </div>
        <div class="pc-body">`

    if (c.body) {
        html += `<p class="pc-text">${c.body}</p>`
    }
    if (c.projects) {
        html += `<div class="pc-projects">${c.projects.map((p, i) => `
            <a class="pc-project" href="${p.href}" target="_blank" style="--zone-color:${color};--i:${i}">
                <span class="pc-project__name">${p.name}</span>
                <span class="pc-project__desc">${p.desc}</span>
                <span class="pc-project__arrow">›</span>
            </a>`).join('')}</div>`
    }
    if (c.skillGroups) {
        html += c.skillGroups.map((group, g) => `
            <div class="pc-skill-group" style="--g:${g}">
                <div class="pc-skill-group__label" style="color:${color}">${group.label}</div>
                <div class="pc-skill-tags">${group.items.map(item =>
                    `<span class="pc-tag">${item}</span>`
                ).join('')}</div>
            </div>`).join('')
    }
    if (c.links) {
        html += `<div class="pc-links">${c.links.map((l, i) =>
            `<a class="pc-link" href="${l.href}" target="_blank" style="--i:${i}">
                <span class="pc-link__icon">${l.icon}</span>
                <span class="pc-link__label">${l.label}</span>
                <span class="pc-link__arrow">›</span>
             </a>`
        ).join('')}</div>`
    }

    html += `</div>`
    return html
}

function checkProximity() {
    if (!player) return
    const px = player.position.x
    const pz = player.position.z

    let nearest = null
    let nearestDist = Infinity

    ZONES.forEach((zone) => {
        const dx   = px - zone.position.x
        const dz   = pz - zone.position.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < nearestDist) { nearestDist = dist; nearest = zone }
    })

    if (nearestDist < PROXIMITY_ENTER && nearest !== activeZone) {
        activeZone = nearest
        proximityCard.style.setProperty('--zone-color', '#ff8844')
        proximityCard.querySelector('.proximity-card__inner').innerHTML = buildCardContent(nearest)
        proximityCard.classList.add('visible')

        // Bouton fermer
        const closeBtn = document.getElementById('proximity-close')
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                proximityCard.classList.add('closing')
                proximityCard.classList.remove('visible')
                setTimeout(() => proximityCard.classList.remove('closing'), 300)
                activeZone = null
            })
        }
    } else if (nearestDist > PROXIMITY_EXIT && activeZone !== null) {
        proximityCard.classList.add('closing')
        proximityCard.classList.remove('visible')
        setTimeout(() => proximityCard.classList.remove('closing'), 300)
        activeZone = null
    }
}

// ── Contrôles tablette (joystick + touch camera) ─────
const joystickEl = document.createElement('div')
joystickEl.className = 'mobile-joystick'
joystickEl.innerHTML = '<div class="mobile-joystick__knob"></div>'
document.body.appendChild(joystickEl)

const knob = joystickEl.querySelector('.mobile-joystick__knob')
let joystickActive = false
let joystickVec = { x: 0, y: 0 }

joystickEl.addEventListener('touchstart', (e) => {
    e.preventDefault()
    joystickActive = true
}, { passive: false })

joystickEl.addEventListener('touchmove', (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = joystickEl.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = touch.clientX - cx
    let dy = touch.clientY - cy
    const maxR = rect.width / 2 - 22
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > maxR) { dx = dx / dist * maxR; dy = dy / dist * maxR }
    knob.style.transform = `translate(${dx}px, ${dy}px)`
    joystickVec.x = dx / maxR
    joystickVec.y = dy / maxR
}, { passive: false })

joystickEl.addEventListener('touchend', () => {
    joystickActive = false
    joystickVec = { x: 0, y: 0 }
    knob.style.transform = ''
})

let touchCamId = null
let touchPrev = { x: 0, y: 0 }

renderer.domElement.addEventListener('touchstart', (e) => {
    if (touchCamId !== null) return
    const t = e.changedTouches[0]
    touchCamId = t.identifier
    touchPrev = { x: t.clientX, y: t.clientY }
}, { passive: true })

renderer.domElement.addEventListener('touchmove', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        if (t.identifier === touchCamId) {
            cameraTheta -= (t.clientX - touchPrev.x) * 0.004
            cameraPhi = Math.max(0.05, Math.min(1.1, cameraPhi - (t.clientY - touchPrev.y) * 0.004))
            touchPrev = { x: t.clientX, y: t.clientY }
        }
    }
}, { passive: true })

renderer.domElement.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchCamId) touchCamId = null
    }
})

// ── Tuto popup + Cinématique d'intro ─────────────────
let tutoDone = false
let introActive = false
let introTime = 0
const INTRO_DURATION = 5.0

const tutoPopup = document.createElement('div')
tutoPopup.className = 'tuto-popup'
tutoPopup.innerHTML = `
    <div class="tuto-popup__title">Controls Guide</div>
    <div class="tuto-popup__keys">
        <div class="tuto-popup__row">
            <div class="tuto-popup__arrow-hint">‹</div>
            <div class="tuto-popup__key">▲</div>
            <div class="tuto-popup__arrow-hint">›</div>
        </div>
        <div class="tuto-popup__row">
            <div class="tuto-popup__key">◄</div>
            <div class="tuto-popup__key">▼</div>
            <div class="tuto-popup__key">►</div>
        </div>
    </div>
    <div class="tuto-popup__actions">
        <div class="tuto-popup__action">
            <div class="tuto-popup__action-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="3" width="12" height="18" rx="6"/><line x1="12" y1="7" x2="12" y2="11"/></svg></div>
            <div class="tuto-popup__action-label">Look Around</div>
            <div class="tuto-popup__action-hint">Click + Drag</div>
        </div>
        <div class="tuto-popup__action tuto-popup__action--active">
            <div class="tuto-popup__action-keys"><span>▲</span><span>◄</span><span>▼</span><span>►</span></div>
            <div class="tuto-popup__action-label">Move</div>
            <div class="tuto-popup__action-hint">Move around</div>
        </div>
        <div class="tuto-popup__action">
            <div class="tuto-popup__action-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg></div>
            <div class="tuto-popup__action-label">Sprint</div>
            <div class="tuto-popup__action-hint">Shift</div>
        </div>
        <div class="tuto-popup__action">
            <div class="tuto-popup__action-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="4" rx="2"/></svg></div>
            <div class="tuto-popup__action-label">Jump</div>
            <div class="tuto-popup__action-hint">Space</div>
        </div>
    </div>
    <div class="tuto-popup__hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        Approach the holographic screens to explore my portfolio
    </div>
    <button class="tuto-popup__btn">Got It</button>
`
document.body.appendChild(tutoPopup)

const tutoBackdrop = document.createElement('div')
tutoBackdrop.className = 'tuto-backdrop'
document.body.appendChild(tutoBackdrop)

tutoPopup.querySelector('.tuto-popup__btn').addEventListener('click', () => {
    tutoPopup.classList.add('hidden')
    tutoBackdrop.classList.add('hidden')
    setTimeout(() => { tutoPopup.remove(); tutoBackdrop.remove() }, 500)
    tutoDone = true
    introActive = true
    introOverlay.style.opacity = '1'
}, { once: true })

const introOverlay = document.createElement('div')
introOverlay.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);transition:opacity 1s ease;pointer-events:none;opacity:0;'
introOverlay.innerHTML = '<div style="font-family:Bruno Ace SC,sans-serif;color:rgba(170,200,255,0.8);font-size:14px;letter-spacing:4px;text-transform:uppercase;text-align:center;text-shadow:0 0 20px rgba(100,150,255,0.5);white-space:nowrap;">Iness Ben Aissa<br><span style="font-size:9px;letter-spacing:3px;opacity:0.5;">Lunar Station · Sector 7</span></div>'
document.body.appendChild(introOverlay)

const introCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(120, 60, 120),
    new THREE.Vector3(80, 40, -60),
    new THREE.Vector3(-40, 25, -100),
    new THREE.Vector3(-20, 12, -30),
    new THREE.Vector3(0, CAM_HEIGHT + CAM_DISTANCE * Math.sin(0.4), CAM_DISTANCE * Math.cos(0.4)),
])

// ── Sprint + saut lunaire ────────────────────────────
let isSprinting = false
let jumpVelocity = 0
let isJumping = false
const GROUND_Y = -9
const GRAVITY = 0.008
const JUMP_FORCE = 0.22
const SPRINT_MULT = 1.8

document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') isSprinting = true
    if (e.key === ' ' && !isJumping && player) {
        isJumping = true
        jumpVelocity = JUMP_FORCE
    }
})
document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') isSprinting = false
})

// Animation
const clock = new THREE.Clock()
const loop = () => {
    requestAnimationFrame(loop)
    const deltaTime    = clock.getDelta()
    const elapsedTime  = clock.getElapsedTime()


    // ── Tuto : on freeze tout en attendant le clic ─────
    if (!tutoDone) {
        composer.render()

        return
    }

    // ── Cinématique d'intro ───────────────────────────
    if (introActive) {
        introTime += deltaTime
        const t = Math.min(introTime / INTRO_DURATION, 1)
        const eased = t * t * (3 - 2 * t)
        const pos = introCurve.getPointAt(eased)
        camera.position.copy(pos)
        const lookTarget = player ? player.position.clone().add(new THREE.Vector3(0, 2, 0)) : new THREE.Vector3(0, -5, 0)
        camera.lookAt(lookTarget)

        if (t > 0.6) introOverlay.style.opacity = String(1 - ((t - 0.6) / 0.4))
        if (t >= 1) {
            introActive = false
            introOverlay.remove()
        }
        composer.render()

        return
    }

    // ── TPS Camera : toujours derrière le player ──────
    if (player) {
        const fovTarget = isSprinting && (keys.up || keys.down || keys.left || keys.right) ? 82 : 75
        camera.fov += (fovTarget - camera.fov) * 0.05
        camera.updateProjectionMatrix()

        const target = player.position.clone().add(new THREE.Vector3(0, CAM_HEIGHT, 0))
        const offset = new THREE.Vector3(
            Math.sin(cameraTheta) * CAM_DISTANCE * Math.cos(cameraPhi),
            CAM_DISTANCE * Math.sin(cameraPhi),
            Math.cos(cameraTheta) * CAM_DISTANCE * Math.cos(cameraPhi)
        )
        camera.position.lerp(target.clone().add(offset), 0.1)
        camera.lookAt(target)
    }

    // ── Mouvement + animation player ─────────────────
    if (player) {
        const joyMoving = joystickActive && (Math.abs(joystickVec.x) > 0.1 || Math.abs(joystickVec.y) > 0.1)
        const moving = keys.up || keys.down || keys.left || keys.right || joyMoving
        const speed = isSprinting ? SPEED * SPRINT_MULT : SPEED

        const forward = new THREE.Vector3(-Math.sin(cameraTheta), 0, -Math.cos(cameraTheta))
        const right   = new THREE.Vector3( Math.cos(cameraTheta), 0, -Math.sin(cameraTheta))

        if (moving) {
            const move = new THREE.Vector3()
            if (keys.up)    move.addScaledVector(forward,  speed)
            if (keys.down)  move.addScaledVector(forward, -speed)
            if (keys.left)  move.addScaledVector(right,   -speed)
            if (keys.right) move.addScaledVector(right,    speed)
            if (joyMoving) {
                move.addScaledVector(right,    joystickVec.x * speed)
                move.addScaledVector(forward, -joystickVec.y * speed)
            }

            player.position.add(move)
            player.position.x = Math.max(-88, Math.min(88, player.position.x))
            player.position.z = Math.max(-88, Math.min(88, player.position.z))

            for (const c of colliders) {
                const dx = player.position.x - c.x
                const dz = player.position.z - c.z
                const distSq = dx * dx + dz * dz
                if (distSq < c.r * c.r && distSq > 0) {
                    const dist = Math.sqrt(distSq)
                    const push = c.r - dist + 0.1
                    player.position.x += (dx / dist) * push
                    player.position.z += (dz / dist) * push
                }
            }
            player.rotation.y = Math.atan2(move.x, move.z)
        } else {
            player.rotation.y = cameraTheta + Math.PI
        }

        // saut lunaire
        if (isJumping) {
            player.position.y += jumpVelocity
            jumpVelocity -= GRAVITY
            if (player.position.y <= GROUND_Y) {
                player.position.y = GROUND_Y
                isJumping = false
                jumpVelocity = 0
            }
        }

        // animation walk on/off
        if (walkAction) {
            if (moving) {
                walkAction.paused = false
                walkAction.timeScale = isSprinting ? 1.6 : 1.0
                if (!walkAction.isRunning()) walkAction.play()
            } else {
                walkAction.paused = true
            }
        }

        if (mixer) mixer.update(deltaTime)
    }

    // Animation des étoiles scintillantes avec shader
    if (stars && stars.material && stars.material.uniforms) {
        stars.material.uniforms.time.value = elapsedTime
    }

    // ✨ Animation des particules interstellaires
    if (interstellarParticles) {
        const positions = interstellarParticles.geometry.attributes.position.array

        for (let i = 0; i < interstellarParticleCount; i++) {
            const i3 = i * 3

            // deplacement des particules
            positions[i3] += interstellarVelocities[i].x
            positions[i3 + 1] += interstellarVelocities[i].y
            positions[i3 + 2] += interstellarVelocities[i].z

            // si une particule sort des limites on la remet a une position aléatoire
            if (Math.abs(positions[i3]) > 1000) {
                positions[i3] = (Math.random() - 0.5) * 2000
            }
            if (Math.abs(positions[i3 + 2]) > 1000) {
                positions[i3 + 2] = (Math.random() - 0.5) * 2000
            }
            if (positions[i3 + 1] < -100 || positions[i3 + 1] > 1000) {
                positions[i3 + 1] = (Math.random() - 0.5) * 1000 + 200
            }
        }

        interstellarParticles.geometry.attributes.position.needsUpdate = true

        // tres légere rotation d'ensemble pour un effet cosmique
        interstellarParticles.rotation.y += 0.00003
    }

    // mise a jour du shader de chaleur
    if (heatPlane) heatPlane.material.uniforms.time.value = elapsedTime

    // le skydome suit la camera pour qu'on voie jamais son bord
    if (skyDome) {
        skyDome.position.copy(camera.position)
        if (skyDome.material.uniforms) {
            skyDome.material.uniforms.time.value = elapsedTime
        }
    }

    // mise a jour du shader backdrop violet/orange
    if (backdropMat.uniforms) backdropMat.uniforms.time.value = elapsedTime

    // meteors
    updateMeteors(deltaTime)

    // soucoupe : orbite douce au-dessus de la scene + bob vertical
    if (flyingSaucer) {
        const r = flyingSaucer.userData.orbitRadius
        flyingSaucer.position.x = Math.cos(elapsedTime * 0.08) * r
        flyingSaucer.position.z = -100 + Math.sin(elapsedTime * 0.08) * 40
        flyingSaucer.position.y = 35 + Math.sin(elapsedTime * 0.3) * 4
        flyingSaucer.rotation.y = elapsedTime * 0.15
    }

    // glitch uniquement sur les écrans holographiques
    holoMats.forEach(m => { m.uniforms.time.value = elapsedTime })

    // HUD — zone la plus proche + coordonnées
    if (player) {
        let closestZone = null
        let closestDist = Infinity
        ZONES.forEach(z => {
            const d = Math.sqrt(
                (player.position.x - z.position.x) ** 2 +
                (player.position.z - z.position.z) ** 2
            )
            if (d < closestDist) { closestDist = d; closestZone = z }
        })
        const hudZone = hud.querySelector('.hud__zone')
        const hudCoords = hud.querySelector('.hud__coords')
        if (closestDist < 50) {
            const col = '#' + closestZone.color.toString(16).padStart(6, '0')
            hudZone.textContent = closestZone.name.toUpperCase()
            hudZone.style.color = col
            hudZone.style.textShadow = `0 0 12px ${col}`
        } else {
            hudZone.textContent = '—'
            hudZone.style.color = ''
            hudZone.style.textShadow = ''
        }
        hudCoords.textContent = `${player.position.x.toFixed(1)} · ${player.position.z.toFixed(1)}`
    }

    // holo screens réagissent quand le panel est ouvert
    Object.keys(holoScreens).forEach(name => {
        const hs = holoScreens[name]
        const isActive = activeZone && activeZone.name === name
        const targetScale = isActive ? 1.15 : 1.0
        const targetIntensity = isActive ? 3.5 : 1.2
        hs.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05)
        hs.light.intensity += (targetIntensity - hs.light.intensity) * 0.05
    })

    // minimap et detection de proximité des zones
    drawMinimap()
    checkProximity()

    // les lumieres de zones pulsent avec un decalage de phase
    zoneMarkers.forEach((group) => {
        const { light, phaseOffset } = group.userData
        const pulse = 0.5 + Math.sin(elapsedTime * 1.5 + phaseOffset) * 0.5
        light.intensity = 1.2 + pulse * 2.5
    })

    composer.render()

}

loop()
