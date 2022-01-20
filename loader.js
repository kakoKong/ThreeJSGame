import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/FBXLoader.js';

import { setupModel } from './setModel.js';

async function loadGLTF(){
    const loader = new GLTFLoader();
    const cars = ['./assets/car.glb', './assets/greenCar.glb', './assets/purpleCar.glb']
    const carData = await loader.loadAsync(cars[Math.floor(Math.random()*3)])

    const car = setupModel(carData);

    car.scale.set(40, 50, 20)

    return car
}

async function loadAnimatedModel(){
    const loader = new FBXLoader();
    const player = await loader.loadAsync('./assets/player.fbx')
    player.scale.set(2, 2, 2)
    player.position.set(30, 20, 600)
    const anim = new FBXLoader();
    const animation = await anim.loadAsync('./assets/running.fbx');

    const mixer = new THREE.AnimationMixer(player);
    console.log(mixer)
    const idle = mixer.clipAction(animation.animations[0]);
    idle.play();

    scene.add(player);

}
async function loadBgSound(sound){
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( './assets/bg.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.5 );
        sound.play();
    });
}
async function loadHitSound(sound){
    const audioLoader2 = new THREE.AudioLoader();
    audioLoader2.load( './assets/hit.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setVolume( 1 );
        sound.play();
        console.log('music')
    });
}

export {loadGLTF, loadAnimatedModel, loadBgSound, loadHitSound}