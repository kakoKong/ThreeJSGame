import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js'
import { LightShadow } from 'https://cdn.skypack.dev/three@0.132.2/src/lights/LightShadow.js';

import { loadGLTF, loadAnimatedModel, loadBgSound, loadHitSound } from './loader.js'

// import { Vector3 } from 'three';

let camera, scene, renderer, controls;
let i;
let box;
let moveLeft, moveRight = false;
let canMove = true;
let hit = false;
let start = false;
const obsPosition = [-180,  0, 180]
let obs = [];
let moveSpeed = 10;
let speed = 4;
let level = 1;
let FP = false;
let count = 0;
let pause = false;
let hitSound, listener;
let gameOver = false;


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
        gameOver = true;
        document.getElementById('gameOver').style.display = 'block';
        start = false;
    }
}

for (let i = 0; i < 3; i++){
    setHealth();
}

var scoreElement = document.getElementById('level')
await init();
animate();

function setFirstPerson() {
    camera.position.set(box.position.x , 120, box.position.z)
}

function setThridPerson() {
    camera.position.set(0, 400, 1000);
}

function addPlane(scene){
    const textureLoader = new THREE.TextureLoader();
    const roadTexture = textureLoader.load('./assets/road.jpg')
    var planeGeometry1 = new THREE.PlaneGeometry( 500, innerHeight, 10, 10);
    var plane1 = new THREE.Mesh( planeGeometry1, new THREE.MeshPhongMaterial({
        map: roadTexture
    }));
    plane1.position.y = 0;
    plane1.rotation.x = -Math.PI / 2;
    plane1.castShadow = true;
    plane1.receiveShadow = true;
    scene.add(plane1);
}

function addSidePlane(scene){
    var planeGeometry1 = new THREE.PlaneGeometry( 500, innerHeight, 20, 20);
    var plane2 = new THREE.Mesh( planeGeometry1, new THREE.MeshPhongMaterial({
        color: 'green'
    }));
    plane2.position.y = 10;
    // plane2.postion.x = 100;
    plane2.position.z = 100;
    plane2.rotation.x = -Math.PI / 2;
    // plane2.castShadow = true;
    // plane2.receiveShadow = true;
    scene.add(plane2);
}

function addBox(){
    var boxGeometry = new THREE.BoxGeometry(10, 40, 10);
    var boxMaterial = new THREE.MeshLambertMaterial({color: 0xFFDABD});
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    box.receiveShadow = false;
    return box
}

function addSphere(size, color){
    const geometry = new THREE.SphereGeometry( size, size, size );
    const material = new THREE.MeshLambertMaterial( { color } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.castShadow = true;
    sphere.receiveShadow = false;
    return sphere
}

function addPlayer(){
    const group = new THREE.Group();
    const body = addSphere(30, 0x282828);
    const head = addSphere(12, 0xFFDABD);
    const leg = addBox();
    const leg2 = addBox();
    const arm = addBox();
    const arm2 = addBox();

    head.position.set(0, 60, 0)
    body.position.set(0, 20, 0);
    leg.position.set(10, -20, 0);
    leg2.position.set(-10, -20, 0);
    arm.position.set(30, 30, 0);
    arm2.position.set(-30, 30, 0)

    arm.rotation.set(40, 0, 30)
    arm2.rotation.set(40, 0, -30)


    group.add(head);
    group.add(body);
    group.add(leg);
    group.add(leg2);
    group.add(arm);
    group.add(arm2);

    return group
}

async function init() {
    //Setup Camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    setThridPerson();
    camera.lookAt(0, 0, 0);

    //Add Audio (Background Music)
    listener = new THREE.AudioListener();
    camera.add( listener );

    let sound = new THREE.Audio( listener );
    // loadBgSound(sound);
    
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
    // addSidePlane(scene);
    if (scoreElement) scoreElement.innerText = level;

    //Add Player
    box = addPlayer();
    box.position.y = 30;
    box.position.x = 20;
    box.position.z = 600;
    scene.add(box);

    console.log(box.children[5].rotation)
    //Add Obstacals
    for (i = 0; i < 4 * speed; i++){
        const obstacal = await loadGLTF();
        obstacal.position.x = obsPosition[Math.floor(Math.random()*obsPosition.length)]
        obstacal.position.z = i * -200;
        obstacal.position.y = 20;
        obs.push(obstacal)
        scene.add(obstacal);   
    }

    //Controls
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
                break; 
            case 'KeyV':
                FP = true;
                break;
            case 'KeyB':
                FP = false;
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

    //Connect with HTML Canvas
    const canvas = document.getElementById( "gl-canvas" );
    renderer = new THREE.WebGL1Renderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);
    renderer.shadowMap.enabled = true;
    
    document.body.appendChild(renderer.domElement);

    //Update Controls
    createControls( camera );
    controls.update();

    window.addEventListener( 'resize', onWindowResize );

}



function createControls( camera ) {
    controls = new TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 2;
    controls.zoomSpeed = 0.2;
    controls.panSpeed = 0.8;

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
}

//Check for Collision
function collisionCheck(obstacal) {
    const box_x = box.position.x;
    const box_z = box.position.z;
    const obs_x = obstacal.position.x;
    const obs_z = obstacal.position.z;
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

//When Player Hit Obstacal
function collide(){
    obs.forEach(moveBackObs)
}

//Move Obstacal toward Player
function moveObs(obstacals) {
    obstacals.position.z += speed;
}

//Move Obstacal back when player got hit
function moveBackObs(obstacals){
    obstacals.position.z -= speed;
}

//Delete Obstacal when passed player
function deleteObs(obstacals){
    if (obstacals.position.z > 900){
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

    //When game start
    if (start) {
        document.getElementById('blocker2').style.opacity = 0
        //Check for Collision
        obs.forEach(collisionCheck)
        // box.children[5].rotation.set(-box.children[5].rotation.x, 0, 30)
        // console.log(box.children[5].rotation)
        if (pause){
            start = false;
            pause = false;
        }
        if (obs.length != 1){
            obs.forEach(deleteObs)
        }
        //If Hit
        if (hit == true){
            collide();
            count ++
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
            alert(`You Passed Level ${level}`)
            start = !start;
            speed += 2;
            obs = [];
            level += 1;

            
            if (level > 5) moveSpeed+=2;

            //restart
            init()
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