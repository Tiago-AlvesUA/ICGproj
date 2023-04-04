"use strict";

import * as THREE from 'three';
import helper from "./helper.js";
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  
    renderer: null,
};

//let hexagonGeometries = new THREE.BoxGeometry(0, 0, 0);
let dirtGeo = new THREE.BoxGeometry(0, 0, 0);
let snowGeo = new THREE.BoxGeometry(0, 0, 0);
helper.initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);

//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false;
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 68: //d
            keyD = true;
            break;
        case 83: //s
            keyS = true;
            break;
        case 65: //a
            keyA = true;
            break;
        case 87: //w
            keyW = true;
            break;
    }
}
function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 68: //d
            keyD = false;
            break;
        case 83: //s
            keyS = false;
            break;
        case 65: //a
            keyA = false;
            break;
        case 87: //w
            keyW = false;
            break;
    }
}


// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // Create a ground plane
    const grass_texture = new THREE.TextureLoader().load( "textures/grass.jpg" );
    grass_texture.wrapS = THREE.RepeatWrapping;
    grass_texture.wrapT = THREE.RepeatWrapping;
    grass_texture.repeat.set( 50, 50 );

    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide, map: grass_texture });
    const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    sceneGraph.add(planeObject);

    // Change orientation of the plane using rotation
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    planeObject.receiveShadow = true;

    const character = getCharacter();
    character.position.set(30,0,0);
    sceneGraph.add(character);
    
    for (let i = 0; i < 10; i++) {
        let tree = createTree(1, new THREE.Vector3(Math.random() * 50 - 25,0,Math.random() * 50 - 25));
        sceneGraph.add(tree);
    }

    getMountains(sceneGraph);
}

function getCharacter(){
    const body = new THREE.BoxGeometry(1, 1, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(0,0,255)' });
    const bodyObject = new THREE.Mesh(body, bodyMaterial);
    bodyObject.position.set(0,0.5,0);
    bodyObject.castShadow = true;
    bodyObject.receiveShadow = true;

    const head = new THREE.SphereGeometry(0.5, 32, 18);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(0,0,255)' });
    const headObject = new THREE.Mesh(head, headMaterial);
    headObject.position.set(0,1.5,0);
    headObject.castShadow = true;
    headObject.receiveShadow = true;

    const character = new THREE.Group();
    character.add(bodyObject);
    character.add(headObject);
    character.name = "character";

    return character;   
}

function createTree(height, position){
    const treeHeight = Math.random() * 1 + 1.25;

    const log = new THREE.CylinderGeometry(0.33, 0.33, treeHeight, 32);
    log.translate(position.x, treeHeight / 2, position.z);
    const logMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(139,69,19)' });
    const logObject = new THREE.Mesh(log, logMaterial);
    logObject.castShadow = true;
    logObject.receiveShadow = true;

    const geo = new THREE.CylinderGeometry(0, 1.5, treeHeight, 3);
    geo.translate(position.x, treeHeight * 0.6 + treeHeight / 2, position.z);
    const geoMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(0,255,0)' });
    const leaf = new THREE.Mesh(geo, geoMaterial);
    leaf.castShadow = true;
    leaf.receiveShadow = true;

    const geo2 = new THREE.CylinderGeometry(0, 1.15, treeHeight, 3);
    geo2.translate(position.x, treeHeight * 1.25 + treeHeight / 2, position.z);
    const leaf2 = new THREE.Mesh(geo2, geoMaterial);
    leaf2.castShadow = true;
    leaf2.receiveShadow = true;

    const geo3 = new THREE.CylinderGeometry(0, 0.8, treeHeight, 3);
    geo3.translate(position.x, treeHeight * 1.9 + treeHeight / 2, position.z);
    const leaf3 = new THREE.Mesh(geo3, geoMaterial);
    leaf3.castShadow = true;
    leaf3.receiveShadow = true;

    var tree = new THREE.Group();
    tree.add(logObject); tree.add(leaf); tree.add(leaf2); tree.add(leaf3);
    tree.castShadow = true;
    tree.receiveShadow = true;

    return tree;
}

function getMountains(sceneGraph){
    const dirt_texture = new THREE.TextureLoader().load( "textures/dirt.png" );
    const snow_texture = new THREE.TextureLoader().load( "textures/snow.jpg" );

    const simplex = new SimplexNoise();
    const MAX_HEIGHT = 8;
    let dirt = '';

    for(let i = -15 ; i <= 15 ; i++){
        for(let j = -15 ; j <= 15 ; j++){
            let position = tileToPosition(i, j);
            let height = 0;
            if(position.length() < 14){
                let noise = (simplex.noise(i * 0.1, j * 0.1) + 1) + 0.5;
                noise = Math.pow(noise, 1.5);
                height = noise * MAX_HEIGHT;
            }else if(position.length() > 18){
                continue;
            }else if(position.length() > 16){
                let noise = (simplex.noise(i * 0.1, j * 0.1) + 1) + 0.5;
                noise = Math.pow(noise, 1.5);
                height = noise * MAX_HEIGHT/2;
                dirt = 'dirt';
            }else if(position.length() > 14){
                let noise = (simplex.noise(i * 0.1, j * 0.1) + 1) + 0.5;
                noise = Math.pow(noise, 1.5);
                height = noise * MAX_HEIGHT;
                dirt = 'dirt';
            } 
            
            makeHex(height, position, dirt);
            //hexGeometry(height, position,dirt);
            dirt = '';
        }
    }
    let snowMesh = hexMesh(snowGeo, snow_texture);
    let dirtMesh = hexMesh(dirtGeo, dirt_texture);
    sceneGraph.add(snowMesh, dirtMesh);
}

function hexGeometry(height,position){
    let cylinderGeometry = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
    cylinderGeometry.translate(position.x, height*0.5, position.y);
    return cylinderGeometry;
}

function makeHex(height,position){
    let geo = hexGeometry(height,position);

    if(height > 22 && position.length() < 14){
        snowGeo = mergeBufferGeometries([geo, snowGeo]);
    }else{
        dirtGeo = mergeBufferGeometries([geo, dirtGeo]);
    }
}

function tileToPosition(tileX,tileY){
    return new THREE.Vector2((tileX + (tileY % 2) * 0.5) * 1.77,tileY * 1.535);
}

function hexMesh(geo, texture){
    let mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
            color: 'rgb(255,255,255)',
            map: texture,
            emissive: new THREE.Color(0.05, 0.05, 0.05)}));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

var dispX = 0.1, dispZ = 0.1;
// Displacement values

function computeFrame(time) {

    const character = sceneElements.sceneGraph.getObjectByName("character");

    if (keyD && character.position.x < 48) {
        character.position.x += dispX;
    }else if (keyA && character.position.x > -48) {
        character.position.x -= dispX;
    }else if (keyS && character.position.z < 48) {
        character.position.z += dispZ;
    }else if (keyW && character.position.z > -48) {
        character.position.z -= dispZ;
    }

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}

export { sceneElements };