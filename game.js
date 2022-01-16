import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { TrackballControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js'
import { LightShadow } from 'https://cdn.skypack.dev/three@0.132.2/src/lights/LightShadow.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
// import { Vector3 } from 'three';

let camera, scene, renderer, controls;
let i;
let box;
let position = 1;
let moveLeft = false;
let moveRight = false;
let canMove = true;
let hit = false;
let start = false;
let jump = false;
const obsPosition = [-200,  0, 200]
let obs = [];
let moveSpeed = 10;
let speed = 4;
let level = 1;
let FP = false;
let car;
let redCar;
let count = 0;

const scoreElement = document.getElementById("levell")

init();
// await loadGLTF();
animate();

function setFirstPerson() {
    // camera = scene.getObjectByName( currentCamera )
    camera.position.set(box.position.x , 120, box.position.z)
}

function setThridPerson() {
    // console.log('Change View')
    camera.position.set(0, 400, 1000);
}

async function loadGLTF(){
    const loader = new GLTFLoader();

    loader.load('./assets/car.glb', (gltf) => {
        car = gltf.scene;
        car.scale.set(50, 50, 50)
        // scene.add(car);
        // car.position.x = 30;
        // car.position.y = 20;
        // car.position.z = 600;
        
        // redCar = new THREE.Mesh(car, '');
        // scene.add(redCar);
        // redCar.position.x = 30;
        // redCar.position.y = 20;
        // redCar.position.z = 600;
        // console.log(redCar)
    })

    console.log('threr is a redCar', redCar);
}
function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    setThridPerson();
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    scene.fog = new THREE.Fog( 0xffffff, 0, 990 );

    const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
    light.position.set( 0.5, 1, 0.75 );
    scene.add( light );

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(30, 50, -20);
    directionalLight.castShadow = true;
    directionalLight.shadow = new LightShadow(new THREE.PerspectiveCamera(50, 1, 1, 5000))
    scene.add(directionalLight)

    if (scoreElement) scoreElement.innerText = level;

    
    // box = loadGLTF();
    
    addPlane(scene);
    box = addBox();
    // loadGLTF();
    // console.log(car)
    // box = car;
    // console.log(box)
    box.position.y = 30;
    box.position.x = 20;
    box.position.z = 600;
    scene.add(box);
    console.log('speed = ', speed)
    for (i = 0; i < 4 * speed; i++){
        const obstacal = addObstacal(300);
        obstacal.position.x = obsPosition[Math.floor(Math.random()*obsPosition.length)]
        obstacal.position.z = i * -200;
        obs.push(obstacal)
        scene.add(obstacal);   
    }

    const onKeyDown = function (event) {
        switch ( event.code ) {
            case 'ArrowRight':
                moveRight = true;
                break;
            case 'ArrowLeft' :
                moveLeft = true;
                break;
            case 'KeyT' :
                start = true;
                break;
            case 'Space':
                jump = true;
                break;
            case 'KeyV':
                FP = !FP;
                break;
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

    console.log(obs)

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp);

    const canvas = document.getElementById( "gl-canvas" );
    renderer = new THREE.WebGL1Renderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);
    renderer.shadowMap.enabled = true;
    
    document.body.appendChild(renderer.domElement);


    createControls( camera );
    controls.update();
    // onViewChange();

    window.addEventListener( 'resize', onWindowResize );

}

function addObstacal(height){
    const obsGeometry = new THREE.BoxGeometry( 140, height, 40);
    const obsMaterial = new THREE.MeshLambertMaterial( { color : 0xff0000 })
    const obstacal = new THREE.Mesh( obsGeometry, obsMaterial);

    return obstacal
}

function addPlane(scene){
    var planeGeometry1 = new THREE.PlaneGeometry( 500, innerHeight, 10, 10);
    var plane1 = new THREE.Mesh( planeGeometry1, new THREE.MeshPhongMaterial( ));
    plane1.position.y = 0;
    plane1.rotation.x = -Math.PI / 2;
    plane1.castShadow = true;
    plane1.receiveShadow = true;
    scene.add(plane1);
}

function addBox(){
    var boxGeometry = new THREE.BoxGeometry(40, 100, 40);
    var boxMaterial = new THREE.MeshLambertMaterial({color: 0x78b14b});
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    box.receiveShadow = false;
    return box
}

function createControls( camera ) {

    controls = new TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 2;
    controls.zoomSpeed = 0.2;
    controls.panSpeed = 0.8;

    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
    // console.log(controls)

}

function collisionCheck(obstacal) {
    const box_x = box.position.x;
    const box_z = box.position.z;
    const obs_x = obstacal.position.x;
    const obs_z = obstacal.position.z;
    // console.log(obs_z)
    if (box_z-20 < obs_z + 20 + speed && box_z-20 > obs_z + 20 - speed){
        // console.log(obs_z)
        // alert('wow')
        if(box_x-20 < obs_x + 70 + moveSpeed/2 && box_x+20 > obs_x - 70 - moveSpeed/2){
            // alert('You Lose');
            hit = true;
            
        }
        // console.log('Z and X equal')
    }
}

function collide(){
    obs.forEach(moveBackObs)
}

function moveObs(obstacals) {
    obstacals.position.z += speed;
}

function moveBackObs(obstacals){
    obstacals.position.z -= speed;
}

function deleteObs(obstacals){
    if (obstacals.position.z > 900){
        obs.shift()
    }
}

function getObs(obstacals){
    return obstacals;
}
function animate() {

    requestAnimationFrame( animate );

    const oldObjectPosition = new THREE.Vector3();
    box.getWorldPosition(oldObjectPosition)
    
    

    if (moveRight && canMove == true) {
        box.position.x += moveSpeed;
        if (Math.abs(box.position.x) >= (250) - 20) {
            canMove = false;
            box.position.x -= moveSpeed;
            canMove = true;
        }
    }
    if (moveLeft && canMove == true) {
        box.position.x -= moveSpeed;
        if (Math.abs(box.position.x) >= (250) - 20) {
            canMove = false;
            box.position.x += moveSpeed;
            canMove = true;
        }
    }

    if (start) {
        // for(let i = 0; i < obs.length; i++){
            //     // console.log(obs.length)
            //     collisionCheck(box, obs[i]);
            // }
        obs.forEach(collisionCheck)
        if (obs.length != 1){

            obs.forEach(deleteObs)
        }
        if (hit == true){
            collide();
            count ++
            if (count == 40){
                hit = false;
                count = 0
            }
        }
        else{
            obs.forEach(moveObs);
        }
        
        
        console.log(hit)
        if (obs[obs.length - 1].position.z > 1000){
            alert(`You Passed Level ${level}`)
            start = false
            speed += 2;
            obs = [];
            level += 1;
            if (scoreElement) scoreElement.innerText = level;
            if (level > 5) moveSpeed+=4;
            init()
        }
    }

    

    if (FP) {
        setFirstPerson();
    }
    if(FP == false){
        setThridPerson();
    }

    // const ObjectPosition = new THREE.Vector3();
    // box.getWorldPosition(ObjectPosition);

    // const delta = ObjectPosition.clone().sub(oldObjectPosition);

    // // console.log(delta)
    // camera.position.add(delta);
    // console.log(camera.position)

    controls.update();

    renderer.render( scene, camera );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}