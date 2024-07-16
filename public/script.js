// async function sendPrompt() {
//     const prompt = document.getElementById('prompt').value;

//     const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ prompt })
//     });

//     const data = await response.json();
//     document.getElementById('response').innerText = data.response;

//     const audioContent = data.audioContent;
//     const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
//     const audioUrl = URL.createObjectURL(audioBlob);

//     const audio = new Audio(audioUrl);
//     audio.play();
// }

// document.getElementById('sendButton').addEventListener('click', sendPrompt);


// const recordButton = document.getElementById('recordButton');
// const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

// recognition.interimResults = false;
// recognition.lang = 'en-US';
// recognition.continuous = true;

// let lastResultTime = Date.now();
// let silenceTimeout;

// recognition.onresult = (event) => {
//     const transcript = event.results[0][0].transcript;
//     console.log(transcript)
//     document.getElementById('prompt').value = transcript;

//     lastResultTime = Date.now();
//     clearTimeout(silenceTimeout);
//     silenceTimeout = setTimeout(() => {
//         recognition.stop();
//         console.log('Stopped due to silence.');
//     }, 2000);
// };


// recognition.onerror = (event) => {
//     console.error('Speech recognition error detected: ' + event.error);
// };


// recordButton.addEventListener('click', () => {
//     recognition.start();
//     lastResultTime = Date.now();
//     silenceTimeout = setTimeout(() => {
//         recognition.stop();
//         console.log('Stopped due to silence.');
//     }, 2000);
// });
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.127.0/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, mixer, clock, character, actions = {};

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    // Giảm hoặc loại bỏ sương mù
    scene.fog = new THREE.Fog(0xa0a0a0, 20, 50); // Tăng khoảng cách sương mù

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(-1, 2, 5);

    clock = new THREE.Clock();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 10, 10);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    const loader = new FBXLoader();
    loader.load('neul.fbx', (fbx) => {
        character = fbx;
        character.scale.set(0.01, 0.01, 0.01); // Điều chỉnh kích thước nhân vật nếu cần
        mixer = new THREE.AnimationMixer(character);
        scene.add(character);

        // Tải và áp dụng hoạt hình nghỉ
        loader.load('idle.fbx', (anim) => {
            const idleAction = mixer.clipAction(anim.animations[0]);
            idleAction.play();
            actions['idle'] = idleAction;
        });

        loadAnimations();
    });

    window.addEventListener('resize', onWindowResize);
}

function loadAnimations() {
    const loader = new FBXLoader();
    const animations = {
        wave: 'waving.fbx',
        goodbye: 'path/to/goodbye.fbx',
        happy: 'path/to/happy.fbx',
        cry: 'crying.fbx',
        sad: 'path/to/sad.fbx'
    };

    for (const [name, path] of Object.entries(animations)) {
        loader.load(path, (anim) => {
            const action = mixer.clipAction(anim.animations[0]);
            actions[name] = action;
        });
    }

    window.playAnimation = (name) => {
        if (actions[name]) {
            for (const action of Object.values(actions)) {
                action.stop();
            }
            actions[name].reset().play();
        }
    };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}
