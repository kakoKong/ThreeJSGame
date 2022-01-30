import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/FBXLoader.js';

import { setupModel } from './setModel.js';

async function loadGLTF(){
    const loader = new GLTFLoader();
    const cars = ['./assets/car.glb', './assets/greenCar.glb', './assets/purpleCar.glb']
    const carData = await loader.loadAsync(cars[Math.floor(Math.random()*3)])

    const car = setupModel(carData);

    car.scale.set(50, 55, 20)

    return car
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

export {loadGLTF, loadHitSound}