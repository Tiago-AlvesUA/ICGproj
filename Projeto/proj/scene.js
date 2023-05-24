"use strict";

import * as THREE from 'three';
import helper from "./helper.js";
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Water } from 'three/addons/objects/Water2.js';

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  
    renderer: null
};

//let hexagonGeometries = new THREE.BoxGeometry(0, 0, 0);
let dirtGeo = new THREE.BoxGeometry(0, 0, 0);
let snowGeo = new THREE.BoxGeometry(0, 0, 0);
let grassGeo = new THREE.BoxGeometry(0, 0, 0);

let water;
const params = {
    color: '#ffffff',
    scale: 4,
    flowX: 10,
    flowY: 10
};

let isDay = true;
// let lastCPressTime = 0; // Variable to store the timestamp of the last 'C' key press
// const CPressDelay = 200; // Delay in milliseconds
// let isCameraChanged = false;
helper.initEmptyScene(sceneElements);
helper.setupDayTime(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);

//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false, keyN = false, keyB = false, keyC = false;
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
        case 78: //n
            keyN = true;
            break;
        case 66: //b
            keyB = true;
            break;
        case 67:
            keyC = true;
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
        case 78:
            keyN = false;
            break;
        case 66:
            keyB = false;
            break;
        case 67:
            keyC = false;
            break;
    }
}


// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // Create a ground plane
    const grass_texture = new THREE.TextureLoader().load( "./textures/grass.jpg" );
    grass_texture.wrapS = THREE.RepeatWrapping;
    grass_texture.wrapT = THREE.RepeatWrapping;
    grass_texture.repeat.set( 50, 50 );

    const planeGeometry1 = new THREE.PlaneGeometry(100, 100);
    const planeMaterial1 = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide, map: grass_texture });
    const planeObject1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
    planeObject1.position.set(0, -0.02, 0);
    sceneGraph.add(planeObject1);

    const planeGeometry3 = new THREE.PlaneGeometry(100, 20);
    // const planeShape3 = new THREE.Shape();
    // planeShape3.moveTo(-50, -10);
    // planeShape3.lineTo(-50, 10);
    // planeShape3.bezierCurveTo(-50, 10, -25, 5, 0, 10);
    // planeShape3.bezierCurveTo(0, 10, 25, 15, 50, 10);
    // planeShape3.lineTo(50, -10);
    // planeShape3.bezierCurveTo(50, -10, 25, -5, 0, -10);
    // planeShape3.bezierCurveTo(0, -10, -25, -15, -50, -10);
    // const planeGeometry3 = new THREE.ShapeGeometry(planeShape3);

    const planeMaterial3 = new THREE.MeshPhongMaterial({ color: 'rgb(235, 255, 255)', side: THREE.DoubleSide});
    const planeObject3 = new THREE.Mesh(planeGeometry3, planeMaterial3);
    planeObject3.position.set(0, 0.001, 0);
    sceneGraph.add(planeObject3);

    // Change orientation of the plane using rotation
    planeObject1.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    //planeObject2.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    planeObject3.rotateOnAxis(new THREE.Vector3(1, 0, 0), 3*Math.PI / 2);
    // Set shadow property
    planeObject1.receiveShadow = true;
    //planeObject2.receiveShadow = true;

    const character = getCharacter();
    character.position.set(30,0,0);
    sceneGraph.add(character);
    
    // Create trees to the right of the tent
    // Create trees to the left of the house
    for (let i = 0; i < 10; i++) {
        let tree = createTree(1, new THREE.Vector3(Math.random() * 65 - 32, 0, Math.random() * 10 - 5));
        tree.translateX(-16).translateZ(17);
        sceneGraph.add(tree);
    }

    for (let i = 0; i < 5; i++) {
        let tree = createTree(1, new THREE.Vector3(Math.random() * 15-10, 0, Math.random() * 10 - 5));
        tree.translateX(42).translateZ(17);
        sceneGraph.add(tree);
    }

    for (let i = 0; i < 10; i++) {
        let tree = createTree(1, new THREE.Vector3(Math.random() * 65 - 32, 0, Math.random() * 10 - 5));
        tree.translateX(15).translateZ(-17);
        sceneGraph.add(tree);
    }

    for (let i = 0; i < 5; i++) {
        let tree = createTree(1, new THREE.Vector3(Math.random() * 20-10, 0, Math.random() * 10 - 5));
        tree.translateX(-40).translateZ(-17);
        sceneGraph.add(tree);
    }

    getRectangularMountains(sceneGraph, 1);
    getRectangularMountains(sceneGraph, 2);

    let cloud1 = createCloud(new THREE.Vector3(1,39,1));
    sceneGraph.add(cloud1);
    cloud1.name = "cloud1";
    let cloud2 = createCloud(new THREE.Vector3(5,37,15));
    sceneGraph.add(cloud2);
    cloud2.name = "cloud2";
    let cloud3 = createCloud(new THREE.Vector3(15,35,-20));
    sceneGraph.add(cloud3);
    cloud3.name = "cloud3";
    let cloud4 = createCloud(new THREE.Vector3(-10,32,-15));
    sceneGraph.add(cloud4);
    cloud4.name = "cloud4";
    let cloud5 = createCloud(new THREE.Vector3(-20,35,10));
    sceneGraph.add(cloud5);
    cloud5.name = "cloud5";

    getWater(sceneGraph);

    getTent(sceneGraph);

    loadCampfire(sceneGraph, new THREE.Vector2(23.45,13));
    getSmoke(sceneGraph);

    loadEagle(sceneGraph, new THREE.Vector2(0,0));

    loadHouse(sceneGraph, new THREE.Vector2(-25,-20));

    loadBridge(sceneGraph, new THREE.Vector2(0,0));

    loadCrystal(sceneGraph, new THREE.Vector2(-15,15), 1);
    loadCrystal(sceneGraph, new THREE.Vector2(-35,18), 2);
    loadCrystal(sceneGraph, new THREE.Vector2(5,20), 3);
    loadCrystal(sceneGraph, new THREE.Vector2(40,15), 2);
    loadCrystal(sceneGraph, new THREE.Vector2(30,-16), 2);
    loadCrystal(sceneGraph, new THREE.Vector2(-30,-13), 3);
    loadCrystal(sceneGraph, new THREE.Vector2(-40,-20), 1);
    loadCrystal(sceneGraph, new THREE.Vector2(45,-21), 2);
    loadCrystal(sceneGraph, new THREE.Vector2(0,-20), 2);

    getSun(sceneGraph, new THREE.Vector3(-100, 60, -20));
    getMoon(sceneGraph, new THREE.Vector3(-100, 60, -20));
    
    
    // add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsPosition = [];

    for (let i = 0; i < 10000; i++) {
        const star = new THREE.Vector3();
        star.x = getRandomPosition(-1000, 1000);
        star.y = getRandomPosition(-1000, 1000);
        star.z = getRandomPosition(-1000, 1000);
      
        if (
            star.x < -60 || star.x > 60 ||
            star.y < -10 || star.y > 70 ||
            star.z < -60 || star.z > 60
          ) {
            starsPosition.push(star.x, star.y, star.z);
          }
      }
      
      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsPosition, 3));
      const starsMaterial = new THREE.PointsMaterial({ color: 0x888888 });
      const starField = new THREE.Points(starsGeometry, starsMaterial);
      starField.name = "starField";
      sceneGraph.add(starField);
}

function getRandomPosition(min, max) {
    return Math.random() * (max - min) + min;
}

// getSun(sceneGraph, new THREE.Vector3(-100, 60, -20));
function getSun(sceneGraph, position){
    const texture = new THREE.TextureLoader().load( "textures/sun.jpg" )
    const geometry = new THREE.SphereGeometry(15, 50, 50);
    const SunMaterial = new THREE.MeshBasicMaterial( { map: texture , color: 0xffcc66});
    const sun = new THREE.Mesh( geometry, SunMaterial );
    sun.position.set(position.x, position.y, position.z);
    sun.name = "sun";
  
    sceneGraph.add(sun);
  }

function getMoon(sceneGraph, position){
    const texture = new THREE.TextureLoader().load( "textures/moon.jpg" )
    const geometry = new THREE.SphereGeometry(8, 50, 50 );
    const MoonMaterial = new THREE.MeshBasicMaterial( { map: texture , color: 0xe6e6e6});
    const moon = new THREE.Mesh( geometry, MoonMaterial );
    moon.position.set(position.x, position.y, position.z);
    moon.name = "moon";
    moon.scale.set(0,0,0);
    sceneGraph.add(moon);
  }

function getCharacter(){
    const body = new THREE.BoxGeometry(1, 1, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 'rgb(0,0,255)',
        shininess: 50,
        specular: 0xaaaaaa
    });
    const bodyObject = new THREE.Mesh(body, bodyMaterial);
    bodyObject.position.set(0,0.5,0);
    bodyObject.castShadow = true;
    bodyObject.receiveShadow = true;

    const head = new THREE.SphereGeometry(0.5, 32, 18);
    const headMaterial = new THREE.MeshPhongMaterial({
        color: 'rgb(0,0,255)',
        shininess: 50,
        specular: 0xaaaaaa
    });
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

function getTent(sceneGraph){
    // Define the first Bezier curve
    var curve1 = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1.2, 0.6, 0),
        new THREE.Vector3(2.4, 1.2, 0),
        new THREE.Vector3(3.6, 4.5, 0)
    );
    
    // Define the second Bezier curve
    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1.2, 0.6, 0),
        new THREE.Vector3(2.4, 1.2, 0),
        new THREE.Vector3(3.6, 4.5, 0)
    );

    // Define the geometry by extruding the shape along the curve
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 0.2);
    shape.lineTo(6, 0.2);
    shape.lineTo(6, 0);
    shape.lineTo(0, 0);
    var extrudeSettings = { steps: 50, extrudePath: curve1 };
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    var material = new THREE.MeshLambertMaterial({ color: 'rgb(185,203,159)' });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(20,0,22);
    sceneGraph.add(mesh);

    var extrudeSettings2 = { steps: 50, extrudePath: curve2 };
    var geometry2 = new THREE.ExtrudeGeometry(shape, extrudeSettings2);
    var material = new THREE.MeshLambertMaterial({ color: 'rgb(185,203,159)' });
    var mesh2 = new THREE.Mesh(geometry2, material);
    
    mesh2.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    mesh2.position.set(26.9,0,16);
    mesh2.castShadow = true;
    mesh2.receiveShadow = true;
    sceneGraph.add(mesh2);

    // create the tent poles
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 32);
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(136,101,78)' });
    const pole1 = new THREE.Mesh(poleGeometry, poleMaterial);
    pole1.position.set(23.45,2,21.8);
    pole1.castShadow = true;
    pole1.receiveShadow = true;
    sceneGraph.add(pole1);

    const pole2 = new THREE.Mesh(poleGeometry, poleMaterial);
    pole2.position.set(23.45,2,16.2);
    pole2.castShadow = true;
    pole2.receiveShadow = true;
    sceneGraph.add(pole2);
}

function getSmoke(sceneGraph){
    var logs = new THREE.Group();

    // Smoke
    var smokeGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    var smokeMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    var smoke1 = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke1.name = "smoke1";
    var smoke2 = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke2.name = "smoke2";
    var smoke3 = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke3.name = "smoke3";
    var smoke4 = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke4.name = "smoke4";
    var smoke5 = new THREE.Mesh(smokeGeometry, smokeMaterial);
    smoke5.name = "smoke5";

    // Position the smoke
    smoke1.position.set(0, 2.2, 0);
    smoke2.position.set(0, 2.2, 0);
    smoke3.position.set(0, 2.2, 0);
    smoke4.position.set(0, 2.2, 0);
    smoke5.position.set(0, 2.2, 0);

    // Add the smoke to the fire
    logs.add(smoke1);
    logs.add(smoke2);
    logs.add(smoke3);
    logs.add(smoke4);
    logs.add(smoke5);

    logs.position.set(23.45,0,13);

    sceneGraph.add(logs);

}

function getWater(sceneGraph){
    // const riverShape = new THREE.Shape();
    // riverShape.moveTo(-50, -10);
    // riverShape.lineTo(-50, 10);
    // riverShape.bezierCurveTo(-50, 10, -25, 5, 0, 10);
    // riverShape.bezierCurveTo(0, 10, 25, 15, 50, 10);
    // riverShape.lineTo(50, -10);
    // riverShape.bezierCurveTo(50, -10, 25, -5, 0, -10);
    // riverShape.bezierCurveTo(0, -10, -25, -15, -50, -10);

    // const riverGeometry = new THREE.ShapeGeometry(riverShape);

    const riverGeometry = new THREE.PlaneGeometry(100, 20);

    const water = new Water(
        riverGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('./textures/waternormals.jpg', function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: sceneGraph.fog !== undefined,
        }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.01;

    sceneGraph.add(water);
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
    const geoMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(100,165,95)' });
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

    return tree;
}

function getGround(sceneGraph) {
    const grass_texture = new THREE.TextureLoader().load( "./textures/grass.jpg" );
    grass_texture.wrapS = THREE.RepeatWrapping;
    grass_texture.wrapT = THREE.RepeatWrapping;
    grass_texture.repeat.set( 1, 1 );

    for (let i = 0; i < 57; i++) {
        for (let j = 0; j < 50; j++) {
            // posição da montanha
            let position = tileToPosition(i, j);
            let height = 0.5;
            makeHexRec(height,position);
        }
    }
    let grassMesh = hexMesh(grassGeo, grass_texture);
    let translation = new THREE.Matrix4().makeTranslation(0, -0.5, 0);
    grassMesh.applyMatrix4(translation);
    sceneGraph.add(grassMesh);
}

function getRectangularMountains(sceneGraph,side){
    const snow_texture = new THREE.TextureLoader().load( "./textures/snow.jpg" );
    snow_texture.wrapS = THREE.RepeatWrapping;
    snow_texture.wrapT = THREE.RepeatWrapping;
    snow_texture.repeat.set( 7, 7 );
    const rock_texture = new THREE.TextureLoader().load( "./textures/rock.jpg" );
    rock_texture.wrapS = THREE.RepeatWrapping;
    rock_texture.wrapT = THREE.RepeatWrapping;
    rock_texture.repeat.set( 6, 6 );
    const grass_texture = new THREE.TextureLoader().load( "./textures/grass.jpg" );
    grass_texture.wrapS = THREE.RepeatWrapping;
    grass_texture.wrapT = THREE.RepeatWrapping;
    grass_texture.repeat.set( 1, 1 );
    // const snowColor = 0xffffff; 
    // const rockColor = 0x888888; 
    // const grassColor = 0x68A156; 

    const simplex = new SimplexNoise();
    const MAX_HEIGHT = 10;


    for (let i = 0; i < 57; i++) {
        for (let j = 0; j < 17; j++) {
            // posição da montanha
            let position = tileToPosition(i, j);
            let height = 0;
            let noise = (simplex.noise(i * 0.1, j * 0.1) + 1) + 0.5;
            noise = Math.pow(noise, 1.5);
            if(j < 6){
                height = noise * MAX_HEIGHT;
            }else if(j > 15){
                height = noise * MAX_HEIGHT/20;
            }else if(j > 13){
                height = noise * MAX_HEIGHT/7;
            }else if(j > 11){
                height = noise * MAX_HEIGHT/3;
            }else if(j > 8){
                height = noise * MAX_HEIGHT/1.5;
            }else if(j >= 6){
                height = noise * MAX_HEIGHT/1.2;
            }
            makeHexRec(height,position);
        }
    }

    let snowMesh = hexMesh(snowGeo, snow_texture, false);
    let dirtMesh = hexMesh(dirtGeo, rock_texture, true);
    let grassMesh = hexMesh(grassGeo, grass_texture, false);
    if (side == 1){
        let translation = new THREE.Matrix4().makeTranslation(-50, 0, -50);
        snowMesh.applyMatrix4(translation);
        dirtMesh.applyMatrix4(translation);
        grassMesh.applyMatrix4(translation);
    }else if(side == 2){
        let rotation = new THREE.Matrix4().makeRotationY(Math.PI);
        snowMesh.applyMatrix4(rotation);
        dirtMesh.applyMatrix4(rotation);
        grassMesh.applyMatrix4(rotation);
        let translation = new THREE.Matrix4().makeTranslation(50, 0, 50);
        snowMesh.applyMatrix4(translation);
        dirtMesh.applyMatrix4(translation);
        grassMesh.applyMatrix4(translation);
    }
    sceneGraph.add(snowMesh, dirtMesh, grassMesh);
}

function hexGeometry(height,position){
    let cylinderGeometry = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
    cylinderGeometry.translate(position.x, height*0.5, position.y);
    return cylinderGeometry;
}

function makeHexRec(height,position,distanceFromMountainCenter){
    let geo = hexGeometry(height,position);

    if(height > 22){
        snowGeo = mergeGeometries([geo, snowGeo]);
    }else if(height > 3){
        dirtGeo = mergeGeometries([geo, dirtGeo]);
    }else{
        grassGeo = mergeGeometries([geo, grassGeo]);
    }
}

function tileToPosition(tileX,tileY){
    return new THREE.Vector2((tileX + (tileY % 2) * 0.5) * 1.77,tileY * 1.535);
}

function hexMesh(geo, texture, isRock){
    // if rock texture
    let mesh;
    if(isRock){
        mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
            map: texture,
            color: 0xcccccc
        }));
    }else{
        mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
            map: texture,
        }));
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createCloud(position){
    const puff1 = new THREE.SphereGeometry(2, 7, 7);
    puff1.translate(0 , 0, 0)
    const puff1Material = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)' });
    const puff1Mesh = new THREE.Mesh(puff1, puff1Material);
    puff1Mesh.castShadow = true;
    puff1Mesh.receiveShadow = true;

    const puff2 = new THREE.SphereGeometry(1.6, 7, 7);
    puff2.translate(-2, 0, 0)
    const puff2Material = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)' });
    const puff2Mesh = new THREE.Mesh(puff2, puff2Material);
    puff2Mesh.castShadow = true;
    puff2Mesh.receiveShadow = true;

    const puff3 = new THREE.SphereGeometry(1.3, 7, 7);
    puff3.translate(2, 0, 0)
    const puff3Material = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)' });
    const puff3Mesh = new THREE.Mesh(puff3, puff3Material);
    puff3Mesh.castShadow = true;
    puff3Mesh.receiveShadow = true;

    var cloud = new THREE.Group();
    cloud.add(puff1Mesh); cloud.add(puff2Mesh); cloud.add(puff3Mesh);
    cloud.translateY(position.y);
    cloud.translateX(position.x);
    cloud.translateZ(position.z);


    return cloud;
}

function loadEagle(sceneGraph, position){
    let loader = new GLTFLoader();
    loader.load('./Projeto/proj/models/Eagle.glb', (gltf) => {
        let eagle = gltf.scene;
        eagle.traverse(child => {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        eagle.scale.set(0.02,0.02,0.02);
        eagle.position.set(position.x, 25, position.y);
        eagle.rotateOnAxis(new THREE.Vector3(0,1,0), -Math.PI/2);
        eagle.name = "eagle";
        sceneGraph.add(eagle);
    });
}

function loadCampfire(sceneGraph, position){
    let loader = new GLTFLoader();
    loader.load('./Projeto/proj/models/Campfire.glb', (gltf) => {
        let campfire = gltf.scene;
        const emissiveColor = 0xff6600;
        const emissiveIntensity = 0.02;
        campfire.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive = new THREE.Color(emissiveColor);
                child.material.emissiveIntensity = emissiveIntensity;
            }
        });
        campfire.scale.set(1.5,1.5,1.5);
        campfire.position.set(position.x, 0.7, position.y);
        campfire.name = 'campfire';
        campfire.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI);
        sceneGraph.add(campfire);
    });
}

function loadHouse(sceneGraph, position){
    let loader = new GLTFLoader();
    loader.load('./Projeto/proj/models/house.gltf', (gltf) => {
        let house = gltf.scene;
        house.traverse(child => {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        house.scale.set(1.5,1.5,1.5);
        house.position.set(position.x, 0, position.y);
        house.name = 'house';
        house.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI);
        sceneGraph.add(house);
    });
}

function loadBridge(sceneGraph, position){
    let loader = new GLTFLoader();
    loader.load('./Projeto/proj/models/Bridge.glb', (gltf) => {
        let bridge = gltf.scene;
        bridge.traverse(child => {
            child.castShadow = true;
            child.receiveShadow = true;
        });
        bridge.scale.set(3.5,1.5,2);
        bridge.position.set(position.x, 0, position.y);
        // rotate
        bridge.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/2)
        bridge.name = 'bridge';
        sceneGraph.add(bridge);
    });
}

function loadCrystal(sceneGraph, position, crystalType) {
    let loader = new GLTFLoader();
    let crystalModelPath = '';
  
    switch (crystalType) {
        case 1:
            crystalModelPath = './Projeto/proj/models/crystal_1.glb';
            break;
        case 2:
            crystalModelPath = './Projeto/proj/models/crystal_2.glb';
            break;
        case 3:
            crystalModelPath = './Projeto/proj/models/crystal_3.glb';
            break;
        default:
            console.error(`Invalid crystal type: ${crystalType}`);
            return;
    }
  
    loader.load(crystalModelPath, (gltf) => {
        let crystal = gltf.scene;
        crystal.traverse(child => {
            if (child.isMesh) {
                child.material.color.set(0xfffff0);
                child.material.emissive.set(0x92CFE3);
                child.material.emissiveIntensity = 0.25;
            }
        });
  
        crystal.scale.set(0.3, 0.3, 0.3);
        crystal.position.set(position.x, 0, position.y);
        crystal.name = `crystal${crystalType}`;
        sceneGraph.add(crystal);
    });
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

    // only accept keyC every 100ms

    // if (keyC) {
    //     const currentTime = new Date().getTime(); // Get the current timestamp
    
    //     // Check if the required time has passed since the last 'C' key press
    //     if (currentTime - lastCPressTime > CPressDelay) {
    //         isCameraChanged = !isCameraChanged; // Toggle camera state
    
    //         if (isCameraChanged) { // If the camera is changed
    //             sceneElements.camera.position.copy(character.position); // Set the camera to the character's position
    //             sceneElements.camera.position.y += 25; // Offset the camera's height
    //         } else { // If the camera is in normal mode
    //             sceneElements.camera.position.set(130, 30, 50); // Set the camera to its initial position
    //         }
    
    //         lastCPressTime = currentTime; // Update the last 'C' key press timestamp
    //     }
    // }
    
    // if (isCameraChanged) { // If the camera is changed
    //     sceneElements.camera.lookAt(character.position);
    // } else { // If the camera is in normal mode
    //     sceneElements.camera.lookAt(new THREE.Vector3()); // Look at the center of the scene
    // }

    if (keyN) {
        isDay = false;
        helper.setupNightTime(sceneElements);
        // show stars
        const starField = sceneElements.sceneGraph.getObjectByName("starField");
        starField.visible = true;
    }
    if (keyB) {
        isDay = true;
        helper.setupDayTime(sceneElements);
        // hide stars
        const starField = sceneElements.sceneGraph.getObjectByName("starField");
        starField.visible = false;
    }   

    var smoke1 = sceneElements.sceneGraph.getObjectByName("smoke1");
    // make smoke1 go up
    smoke1.position.y += 0.04;

    if (smoke1.position.y < 4) {
        smoke1.scale.x += 0.15;
        smoke1.scale.y += 0.15;
        smoke1.scale.z += 0.15;
    }
    else if (smoke1.position.y > 9.5) {
        smoke1.scale.x -= 0.22;
        smoke1.scale.y -= 0.22;
        smoke1.scale.z -= 0.22;
    }
    // make smoke1 go down
    if (smoke1.position.y > 11) {
        smoke1.position.y = 2.2;
        smoke1.scale.x = 1;
        smoke1.scale.z = 1;
        smoke1.scale.y = 1;
    }

    var smoke2 = sceneElements.sceneGraph.getObjectByName("smoke2");
    // make smoke2 go up and a bit to the right
    smoke2.position.y += 0.04;
    smoke2.position.x += 0.01;

    if (smoke2.position.y < 4) {
        smoke2.scale.x += 0.15;
        smoke2.scale.y += 0.15;
        smoke2.scale.z += 0.15;
    }
    else if (smoke2.position.y > 7.5) {
        smoke2.scale.x -= 0.15;
        smoke2.scale.y -= 0.15;
        smoke2.scale.z -= 0.15;
    }
    // make smoke1 go down
    if (smoke2.position.y > 9) {
        smoke2.position.y = 2.2;
        smoke2.position.x = 0;
        smoke2.scale.x = 1;
        smoke2.scale.z = 1;
        smoke2.scale.y = 1;
    }

    var smoke3 = sceneElements.sceneGraph.getObjectByName("smoke3");
    // make smoke3 go up and a bit to the left
    smoke3.position.y += 0.04;
    smoke3.position.x -= 0.01;
    smoke3.position.z -= 0.005;
    if (smoke3.position.y < 4) {
        smoke3.scale.x += 0.15;
        smoke3.scale.y += 0.15;
        smoke3.scale.z += 0.15;
    }
    else if (smoke3.position.y > 8.5) {
        smoke3.scale.x -= 0.15;
        smoke3.scale.y -= 0.15;
        smoke3.scale.z -= 0.15;
    }
    // make smoke1 go down
    if (smoke3.position.y > 10) {
        smoke3.position.y = 2.2;
        smoke3.position.x = 0;
        smoke3.position.z = 0;
        smoke3.scale.x = 1;
        smoke3.scale.z = 1;
        smoke3.scale.y = 1;
    }

    var smoke4 = sceneElements.sceneGraph.getObjectByName("smoke4");
    // make smoke4 go up and a bit to the left
    smoke4.position.y += 0.04;
    smoke4.position.x -= 0.01;
    smoke4.position.z += 0.005;
    if (smoke4.position.y < 4) {
        smoke4.scale.x += 0.15;
        smoke4.scale.y += 0.15;
        smoke4.scale.z += 0.15;
    }
    else if (smoke4.position.y > 7) {
        smoke4.scale.x -= 0.15;
        smoke4.scale.y -= 0.15;
        smoke4.scale.z -= 0.15;
    }
    // make smoke1 go down
    if (smoke4.position.y > 8.5) {
        smoke4.position.y = 2.2;
        smoke4.position.x = 0;
        smoke4.position.z = 0;
        smoke4.scale.x = 1;
        smoke4.scale.z = 1;
        smoke4.scale.y = 1;
    }

    var smoke5 = sceneElements.sceneGraph.getObjectByName("smoke5");
    // make smoke5 go up and a bit to the left
    smoke5.position.y += 0.04;
    smoke5.position.x -= 0.01;
    smoke5.position.z += 0.005;
    if (smoke5.position.y < 4) {
        smoke5.scale.x += 0.15;
        smoke5.scale.y += 0.15;
        smoke5.scale.z += 0.15;
    }
    else if (smoke5.position.y > 6) {
        smoke5.scale.x -= 0.15;
        smoke5.scale.y -= 0.15;
        smoke5.scale.z -= 0.15;
    }
    // make smoke1 go down
    if (smoke5.position.y > 7.5) {
        smoke5.position.y = 2.2;
        smoke5.position.x = 0;
        smoke5.position.z = 0;
        smoke5.scale.x = 1;
        smoke5.scale.z = 1;
        smoke5.scale.y = 1;
    }

    var sun = sceneElements.sceneGraph.getObjectByName("sun");
    var moon = sceneElements.sceneGraph.getObjectByName("moon");
    var cloud1 = sceneElements.sceneGraph.getObjectByName("cloud1");
    var cloud2 = sceneElements.sceneGraph.getObjectByName("cloud2");
    var cloud3 = sceneElements.sceneGraph.getObjectByName("cloud3");
    var cloud4 = sceneElements.sceneGraph.getObjectByName("cloud4");
    var cloud5 = sceneElements.sceneGraph.getObjectByName("cloud5");
    // DAY and NIGHT animations
    if (!isDay){
        if (sun.scale.x > 0 && moon.scale.x < 1) {
            sun.scale.x -= 0.004;
            sun.scale.y -= 0.004;
            sun.scale.z -= 0.004;
            moon.scale.x += 0.004;
            moon.scale.y += 0.004;
            moon.scale.z += 0.004;
        }
        if(cloud1.scale.x > 0){
            cloud1.scale.x -= 0.004;
            cloud1.scale.y -= 0.004;
            cloud1.scale.z -= 0.004;
            
            cloud2.scale.x -= 0.004;
            cloud2.scale.y -= 0.004;
            cloud2.scale.z -= 0.004;

            cloud3.scale.x -= 0.004;
            cloud3.scale.y -= 0.004;
            cloud3.scale.z -= 0.004;

            cloud4.scale.x -= 0.004;
            cloud4.scale.y -= 0.004;
            cloud4.scale.z -= 0.004;

            cloud5.scale.x -= 0.004;
            cloud5.scale.y -= 0.004;
            cloud5.scale.z -= 0.004;
        }
    }else{
        if (sun.scale.x < 1 && moon.scale.x > 0) {
            sun.scale.x += 0.004;
            sun.scale.y += 0.004;
            sun.scale.z += 0.004;
            moon.scale.x -= 0.004;
            moon.scale.y -= 0.004;
            moon.scale.z -= 0.004;
        }

        if (cloud1.scale.x < 1) {
            cloud1.scale.x += 0.004;
            cloud1.scale.y += 0.004;
            cloud1.scale.z += 0.004;
            
            cloud2.scale.x += 0.004;
            cloud2.scale.y += 0.004;
            cloud2.scale.z += 0.004;

            cloud3.scale.x += 0.004;
            cloud3.scale.y += 0.004;
            cloud3.scale.z += 0.004;

            cloud4.scale.x += 0.004;
            cloud4.scale.y += 0.004;
            cloud4.scale.z += 0.004;

            cloud5.scale.x += 0.004;
            cloud5.scale.y += 0.004;
            cloud5.scale.z += 0.004;
        }
    }

    // make cloud1 go back and forth
    if (cloud1.position.x < 35) {
        cloud1.position.x += 0.024;
    }else{
        cloud1.position.x = -45;
    }

    if (cloud2.position.x < 35) {
        cloud2.position.x += 0.022;
    }else{
        cloud2.position.x = -49;
    }

    if (cloud3.position.x < 35) {
        cloud3.position.x += 0.015;
    }else{
        cloud3.position.x = -59;
    }

    if (cloud4.position.x < 35) {
        cloud4.position.x += 0.01;
    }else{
        cloud4.position.x = -35;
    }

    if (cloud5.position.x < 35) {
        cloud5.position.x += 0.02;
    }else{
        cloud5.position.x = -25;
    }

    // make the eagle fly in a circle
    var eagle = sceneElements.sceneGraph.getObjectByName("eagle");
    if (eagle) {
        eagle.position.x = - 35 * Math.cos(0.0002 * time);
        eagle.position.z = - 20 * Math.sin(0.0002 * time);
        eagle.rotation.y = - 0.0002 * time;
    }

    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}

export { sceneElements };