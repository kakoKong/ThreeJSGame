import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';

function addPlane(scene){
    const textureLoader = new THREE.TextureLoader();
    const roadTexture = textureLoader.load('./assets/road.jpg')
    var planeGeometry1 = new THREE.PlaneGeometry( 500, 2000, 10, 10);
    var plane1 = new THREE.Mesh( planeGeometry1, new THREE.MeshPhongMaterial({
        map: roadTexture
    }));
    plane1.position.y = 0;
    plane1.rotation.x = -Math.PI / 2;
    plane1.position.z = 300;
    plane1.castShadow = true;
    plane1.receiveShadow = true;
    scene.add(plane1);
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

export {addPlane, addPlayer}