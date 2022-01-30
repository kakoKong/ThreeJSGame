import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js'
import { LightShadow } from 'https://cdn.skypack.dev/three@0.132.2/src/lights/LightShadow.js';

import { loadGLTF, loadAnimatedModel, loadBgSound, loadHitSound } from './loader.js'
import { addPlane, addPlayer } from './setup.js'

let camera, scene, renderer, controls;
let i;
let box;
let moveLeft, moveRight = false;
let canMove = true;
let hit = false;
let start = false;
const obsPosition = [-180,  0, 180]
let obs = [];
let moveSpeed, speed, level;
let FP = false;
let count = 0;
let pause = false;
let hitSound, listener;
let gameOver = false;
let scoreElement, scoreElement2;
let levelPassed = false;

controlsFunction();
await init();
animate();

async function init() {
    obs = [];
    moveSpeed = 10;
    speed = 4;
    level = 1;
    
    scoreElement = document.getElementById('level')
    scoreElement2 = document.getElementById('level2')
    // console.log(scoreElement)
    for (let i = 0; i < 3; i++){
        setHealth();
    }
    //Setup Camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    setThridPerson();
    camera.lookAt(0, 0, 0);

    //Add Audio (Background Music)
    listener = new THREE.AudioListener();
    camera.add( listener );
    
    //Create a Scene with fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 990 );

    //Create lights
    const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(30, 50, -20);
    directionalLight.castShadow = true;
    directionalLight.shadow = new LightShadow(new THREE.PerspectiveCamera(50, 1, 1, 5000))
    scene.add(directionalLight)
    
    //Add Plane
    addPlane(scene);
    
    //Add Player
    box = addPlayer();
    box.position.y = 30;
    box.position.x = 20;
    box.position.z = 600;
    scene.add(box);

    //Connect with HTML Canvas
    const canvas = document.getElementById( "gl-canvas" );
    renderer = new THREE.WebGL1Renderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);
    renderer.shadowMap.enabled = true;
    
    document.body.appendChild(renderer.domElement);

    setUp()
    //Update Controls
    createControls( camera );
    controls.update();

    window.addEventListener( 'resize', onWindowResize );

}

function setHealth(){
    var img = document.createElement("img");
    img.src = "./assets/health.png";
    var src = document.getElementById("Life");
    // for (i = 0; i < 3; i++){
    src.appendChild(img);
}
// }
function deleteScore(){
    var health = document.getElementById('Life');
    var img = health.getElementsByTagName('img');
    if (img.length > 1) img[0].remove();
    else{
        img[0].remove()
        levelPassed = false;
        gameOver = true;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('congrats').style.display = 'none';
        document.getElementById('start').style.display = 'none';
        document.getElementById('restart').style.display = 'block';
        start = false;
    }
}

async function restart(){
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('welcome').style.display = 'block';
    document.getElementById('start').style.display = 'block';
    document.getElementById('restart').style.display = 'none';
    
    gameOver = false;

    await init();
}
function controlsFunction() {
    const onKeyDown = function (event) {
        switch ( event.code ) {
            case 'ArrowRight':
                moveRight = true;
                break;
            case 'ArrowLeft' :
                moveLeft = true;
                break;
            case 'Space' :
                start = true;
                canMove = true;
                break; 
            case 'KeyV':
                FP = !FP;
                break;
            case 'KeyP':
                pause = true;
                
        }
    }

    const onKeyUp = function (event) {
        switch ( event.code ) {
            case 'ArrowRight':
                moveRight = false;
                break;
            case 'ArrowLeft':
                moveLeft = false;    
                break;        
        }
    }


    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp);
}

async function setUp(){
    if (scoreElement){
        scoreElement.innerText = level;
    }    
    if (levelPassed == true){
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('congrats').style.display = 'block';
        scoreElement2.innerText = level - 1;
    }
    console.log(box.children[5].rotation)
    //Add obstacles
    for (i = 0; i < 4 * speed; i++){
        const obstacle = await loadGLTF();
        obstacle.position.x = obsPosition[Math.floor(Math.random()*obsPosition.length)]
        obstacle.position.z = i * -200;
        obstacle.position.y = 20;
        obs.push(obstacle)
        scene.add(obstacle);   
    }
}
function setFirstPerson() {
    camera.position.set(box.position.x , 120, box.position.z)
}

function setThridPerson() {
    camera.position.set(0, 400, 1000);
}

function createControls( camera ) {
    controls = new TrackballControls( camera, renderer.domElement );

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
}

//Check for Collision
function collisionCheck(obstacle) {
    const box_x = box.position.x;
    const box_z = box.position.z;
    const obs_x = obstacle.position.x;
    const obs_z = obstacle.position.z;
    hitSound = new THREE.Audio( listener );
    if (box_z-20 < obs_z + 20 + speed && box_z-20 > obs_z + 20 - speed){
        if(box_x-20 < obs_x + 70 + moveSpeed/2 && box_x+20 > obs_x - 70 - moveSpeed/2){
            hit = true;
            //Add Hit Sound
            loadHitSound(hitSound)
            deleteScore();
        }
    }
}

//When Player Hit Obstacle
function collide(){
    obs.forEach(moveBackObs)
}

//Move Obstacle toward Player
function moveObs(obstacles) {
    obstacles.position.z += speed;
}

//Move obstacle back when player got hit
function moveBackObs(obstacles){
    obstacles.position.z -= speed;
}

//Delete obstacle when passed player
function deleteObs(obstacles){
    if (obstacles.position.z > 900){
        obs.shift()
    }
}

function animate() {

    requestAnimationFrame( animate );
    
    //Player Controls
    if (moveRight && canMove == true) {
        box.position.x += moveSpeed;
        if (Math.abs(box.position.x) >= (250) - 20) {
            canMove = false;
            box.position.x -= moveSpeed;
            canMove = true;
        }
        box.rotation.y = -70;
    }
    else if (moveLeft && canMove == true) {
        box.position.x -= moveSpeed;
        if (Math.abs(box.position.x) >= (250) - 20) {
            canMove = false;
            box.position.x += moveSpeed;
            canMove = true;
        }
        box.rotation.y = 70;
    }

    else{
        box.rotation.y = 0;
    }

    //View Changes
    if (FP) {
        setFirstPerson();
    }
    else if(FP == false){
        setThridPerson();
    }

    if (gameOver && start){
        restart();
    }

    //When game start
    if (start) {
        document.getElementById('blocker2').style.opacity = 0
        //Check for Collision
        obs.forEach(collisionCheck)
        
        if (pause){
            start = false;
            canMove = false;
            pause = false;
        }
        if (obs.length != 1){
            obs.forEach(deleteObs)
        }
        //If Hit
        if (hit == true){
            collide();
            count ++
            //Time for obstacle to fall back
            if (count == 40){
                hit = false;
                count = 0
            }
        }
        else{
            //Continue moving Obejct
            obs.forEach(moveObs);
        }
        
        //When Passed a Level
        if (obs[obs.length - 1].position.z > 1000){
            start = !start;
            speed += 2;
            obs = [];
            level += 1;
            
            if (level > 5) moveSpeed+=2;
            levelPassed = true;
            //restart
            setUp();
        }
    }
    else{
        document.getElementById('blocker2').style.opacity = 1
    }
    controls.update();
    renderer.render( scene, camera );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}