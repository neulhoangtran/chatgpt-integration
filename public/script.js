import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

let scene, camera, renderer, mixer, clock, character, actions = {};
let currentAction, idleAction;
let recognition;
let silenceTimeout;
let isAPICalling = false;
let selectedCharacter = 'nana';
let skybox;
const params = {
    height: 15,
    radius: 100,
    enabled: true,
};


init();

document.getElementById('recordButton').addEventListener('click', () => {
    recognition.start();
})

document.getElementById('startButton').addEventListener('click', async () => {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('loadingScreen').classList.add('active');

    await loadCharacter();

    document.getElementById('mainContent').style.display = 'block';
    animate();
    initializeSpeechRecognition();

    await loadAnimations();
    playAnimation('idle');

    setTimeout(() => {
        removeLoadingScreen();
    }, 50);
});

document.getElementById('nanaRadio').addEventListener('change', (event) => {
    if (event.target.checked) {
        selectedCharacter = 'nana';
    }
});

document.getElementById('shenRadio').addEventListener('change', (event) => {
    if (event.target.checked) {
        selectedCharacter = 'shen';
    }
});

async function sendPrompt() {
    if (isAPICalling) return;

    isAPICalling = true;
    const prompt = document.getElementById('prompt').value;
    const character = selectedCharacter;

    // Tắt nhận diện giọng nói trước khi gửi request
    recognition.stop();
    clearTimeout(silenceTimeout);

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, character }) // Truyền tên nhân vật vào yêu cầu
    });

    const data = await response.json();
    const reply = data.response;
    document.getElementById('response').innerText = reply;

    // Kiểm tra các trạng thái cụ thể trước
    if (isGreeting(reply)) {
        playAnimation('waving');
    } else if (isGoodbye(reply)) {
        playAnimation('goodbye');
    } else if (isHappy(reply)) {
        playAnimation('happy');
    } else if (isSad(reply)) {
        playAnimation('sad');
    } else if (isCrying(reply)) {
        playAnimation('cry');
    } else {
        // Nếu không có trạng thái nào khớp, chuyển sang trạng thái talking
        playAnimation('talking');
    }

    const audioContent = data.audioContent;
    const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audio.play();

    // Bật lại nhận diện giọng nói sau khi audio đã kết thúc
    audio.onended = () => {
        recognition.start();
        isAPICalling = false;
        playAnimation('idle');
        console.log('Speech recognition restarted.');
    };
}

document.getElementById('sendButton').addEventListener('click', sendPrompt);

function initializeSpeechRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.continuous = true;

    recognition.onresult = (event) => {
        if (isAPICalling) return;

        const transcript = event.results[0][0].transcript;
        console.log(transcript);
        document.getElementById('prompt').value = transcript;

        clearTimeout(silenceTimeout);
        silenceTimeout = setTimeout(() => {
            recognition.stop();
            sendPrompt();
            console.log('Stopped due to silence and sent prompt.');
        }, 2000);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error detected: ' + event.error);
    };

    recognition.onend = () => {
        if (!isAPICalling) {
            console.log('Speech recognition ended, restarting...');
            // recognition.start();
        }
    };

    recognition.start();
}

function removeLoadingScreen() {
    document.getElementById('loadingScreen').classList.remove('active');
}

async function init() {
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xa0a0a0);

    

    // camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
    // camera.position.set(-1, 2, 5);

    camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set( 2.38, 5, 21.99 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();

    const hdrLoader = new RGBELoader();
    const envMap = await hdrLoader.loadAsync( 'background/equirectangular/blouberg_sunrise_2_1k.hdr' );
    envMap.mapping = THREE.EquirectangularReflectionMapping;

    skybox = new GroundedSkybox( envMap, params.height, params.radius );
    skybox.position.y = params.height - 0.01;
    scene.add( skybox );

    scene.environment = envMap;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/draco/gltf/' );

    const loader = new GLTFLoader();
    loader.setDRACOLoader( dracoLoader );

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    //

    const controls = new OrbitControls( camera, renderer.domElement );
    // controls.addEventListener( 'change', render );
    controls.target.set( 0, 5, 0 );
    // !important
    controls.maxPolarAngle = THREE.MathUtils.degToRad( 90 );
    controls.maxDistance = 40;
    controls.minDistance = 20;
    controls.enablePan = false;
    controls.update();

    

    

    document.body.appendChild( renderer.domElement );

    
    
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
    hemiLight.position.set(3, 7, 2);
    scene.add(hemiLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(0, 0, 3.3);
    dirLight.castShadow = true;
    scene.add(dirLight);
    
    // const grid = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    // scene.add(grid);
    
    

    // controls.addEventListener('change', () => {
    //     console.log(`Camera position: ${camera.position.x}, ${camera.position.y}, ${camera.position.z}`);
    //     console.log(`Camera zoom: ${camera.zoom}`);
    // });

    const gui = new GUI();
    // gui.add(camera.position, 'x', -10, 10).name('Camera X').onChange(() => console.log(`Camera X: ${camera.position.x}`));
    // gui.add(camera.position, 'y', -10, 10).name('Camera Y').onChange(() => console.log(`Camera Y: ${camera.position.y}`));
    // gui.add(camera.position, 'z', -10, 10).name('Camera Z').onChange(() => console.log(`Camera Z: ${camera.position.z}`));
    // gui.add(camera, 'zoom', 0.1, 10).name('Camera Zoom').onChange(() => {
    //     camera.updateProjectionMatrix();
    //     console.log(`Camera Zoom: ${camera.zoom}`);
    // });
    
    // const hemiLightFolder = gui.addFolder('Hemisphere Light');
    // hemiLightFolder.add(hemiLight.position, 'x', -50, 50).name('Position X');
    // hemiLightFolder.add(hemiLight.position, 'y', 0, 50).name('Position Y');
    // hemiLightFolder.add(hemiLight.position, 'z', -50, 50).name('Position Z');
    // hemiLightFolder.addColor(hemiLight, 'color').name('Sky Color');
    // hemiLightFolder.addColor(hemiLight, 'groundColor').name('Ground Color');
    // hemiLightFolder.open();

    // // DirectionalLight controls
    // const dirLightFolder = gui.addFolder('Directional Light');
    // dirLightFolder.add(dirLight.position, 'x', -50, 50).name('Position X');
    // dirLightFolder.add(dirLight.position, 'y', 0, 50).name('Position Y');
    // dirLightFolder.add(dirLight.position, 'z', -50, 50).name('Position Z');
    // dirLightFolder.add(dirLight, 'intensity', 0, 2).name('Intensity');
    // dirLightFolder.add(dirLight.shadow, 'bias', -0.05, 0.05).name('Shadow Bias');
    // dirLightFolder.add(dirLight.shadow.camera, 'left', -100, 100).name('Shadow Left');
    // dirLightFolder.add(dirLight.shadow.camera, 'right', -100, 100).name('Shadow Right');
    // dirLightFolder.add(dirLight.shadow.camera, 'top', -100, 100).name('Shadow Top');
    // dirLightFolder.add(dirLight.shadow.camera, 'bottom', -100, 100).name('Shadow Bottom');
    // dirLightFolder.open();
    

    window.addEventListener('resize', onWindowResize);
}

function loadCharacter() {
    return new Promise((resolve, reject) => {
        const loader = new FBXLoader();
        const characterPath = selectedCharacter === 'nana' ? 'nana.fbx' : 'shen.fbx';

        caches.open('character-cache').then(cache => {
            cache.match(characterPath).then(response => {
                if (response) {
                    response.blob().then(blob => {
                        const url = URL.createObjectURL(blob);
                        loader.load(url, (fbx) => {
                            character = fbx;
                            character.scale.set(0.05, 0.05, 0.05);
                            character.position.set(0, 0, 0);
                            mixer = new THREE.AnimationMixer(character);
                            scene.add(character);
                            resolve();
                        }, (xhr) => {
                            const progress = Math.round((xhr.loaded / xhr.total) * 100);
                            document.getElementById('progress').style.width = `${progress}%`;
                        }, (error) => {
                            console.error(error);
                            reject(error);
                        });
                    });
                } else {
                    fetchAndCacheCharacter(characterPath, cache, loader).then(() => {
                        resolve();
                    }).catch((error) => {
                        reject(error);
                    });
                }
            });
        });
    });
}

function fetchAndCacheCharacter(characterPath, cache, loader) {
    return new Promise((resolve, reject) => {
        loader.load(characterPath, (fbx) => {
            character = fbx;
            character.scale.set(0.05, 0.05, 0.05);
            character.position.set(0, 0, 0);
            mixer = new THREE.AnimationMixer(character);
            scene.add(character);

            fetch(characterPath)
                .then(res => res.blob())
                .then(blob => {
                    const response = new Response(blob);
                    cache.put(characterPath, response);
                    resolve();
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        }, (xhr) => {
            const progress = Math.round((xhr.loaded / xhr.total) * 100);
            document.getElementById('progress').style.width = `${progress}%`;
        }, (error) => {
            console.error(error);
            reject(error);
        });
    });
}

function loadAnimations() {
    return new Promise((resolve, reject) => {
        const loader = new FBXLoader();
        const animations = {
            waving: `${selectedCharacter}/waving.fbx`,
            idle: `${selectedCharacter}/idle.fbx`,
            talking: `${selectedCharacter}/stand-talking.fbx`
        };

        const animationPromises = Object.entries(animations).map(([name, path]) => {
            return new Promise((res, rej) => {
                loader.load(path, (anim) => {
                    const action = mixer.clipAction(anim.animations[0]);
                    actions[name] = action;
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                    res();
                }, null, (error) => {
                    console.error(error);
                    rej(error);
                });
            });
        });

        Promise.all(animationPromises).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

const playAnimation = (name) => {
    if (actions[name]) {
        for (const action of Object.values(actions)) {
            action.stop();
        }
        actions[name].reset().play();
    }
};

function isGreeting(text) {
    const greetings = ['hello', 'hi', 'hey', 'greetings', 'howdy', 'bonjour', 'hola', 'chào'];
    return greetings.some(greeting => text.toLowerCase().includes(greeting));
}

function isGoodbye(text) {
    const goodbyes = ['goodbye', 'bye', 'see you', 'farewell', 'later'];
    return goodbyes.some(goodbye => text.toLowerCase().includes(goodbye));
}

function isHappy(text) {
    const happyWords = ['happy', 'joy', 'glad', 'pleased', 'delighted'];
    return happyWords.some(happy => text.toLowerCase().includes(happy));
}

function isSad(text) {
    const sadWords = ['sad', 'unhappy', 'down', 'depressed', 'blue'];
    return sadWords.some(sad => text.toLowerCase().includes(sad));
}

function isCrying(text) {
    const cryingWords = ['cry', 'crying', 'tears', 'weep', 'weeping'];
    return cryingWords.some(crying => text.toLowerCase().includes(crying));
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
