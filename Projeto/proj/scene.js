"use strict";

import * as THREE from 'three';
import helper from "./helper.js";
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
    flowX: 1,
    flowY: 1
};

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

    const planeGeometry1 = new THREE.PlaneGeometry(100, 40);
    const planeMaterial1 = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide, map: grass_texture });
    const planeObject1 = new THREE.Mesh(planeGeometry1, planeMaterial1);
    planeObject1.position.set(0, 0, 30);
    sceneGraph.add(planeObject1);

    const planeGeometry2 = new THREE.PlaneGeometry(100, 40);
    const planeMaterial2 = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide, map: grass_texture });
    const planeObject2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
    planeObject2.position.set(0, 0, -30);
    sceneGraph.add(planeObject2);

    const planeGeometry3 = new THREE.PlaneGeometry(100, 20);
    const planeMaterial3 = new THREE.MeshPhongMaterial({ color: 'rgb(235, 255, 255)', side: THREE.DoubleSide});
    const planeObject3 = new THREE.Mesh(planeGeometry3, planeMaterial3);
    planeObject3.position.set(0, 0, 0);
    sceneGraph.add(planeObject3);
    //getGround(sceneGraph);


    // Change orientation of the plane using rotation
    planeObject1.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    planeObject2.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    planeObject3.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    planeObject1.receiveShadow = true;
    planeObject2.receiveShadow = true;

    const character = getCharacter();
    character.position.set(30,0,0);
    sceneGraph.add(character);
    
    for (let i = 0; i < 50; i++) {
        let tree = createTree(1, new THREE.Vector3(Math.random() * 100-50,0,Math.random() * 50-25));
        sceneGraph.add(tree);
    }

    //getRoundMountains(sceneGraph, new THREE.Vector2(0,0));

    // getSideMountains(sceneGraph, new THREE.Vector2(-28,-32), 1);
    // getSideMountains(sceneGraph, new THREE.Vector2(-28,-32), 2);
    // getSideMountains(sceneGraph, new THREE.Vector2(-28,-32), 3);
    // getSideMountains(sceneGraph, new THREE.Vector2(-28,-32), 4);

    //getRectangularMountains(sceneGraph, 1);
    getRectangularMountains(sceneGraph, 1);
    getRectangularMountains(sceneGraph, 2);

    let cloudPositions = [];
    for (let i = 0; i<3; i++){
        let cloudPosition = new THREE.Vector3(Math.random() * 50-25,30,Math.random() * 50-25);
        while (isTooClose(cloudPosition, cloudPositions)){
            cloudPosition = new THREE.Vector3(Math.random() * 50-25,30,Math.random() * 50-25);
        }
        cloudPositions.push(cloudPosition);
        let cloud = createCloud(cloudPosition);
        sceneGraph.add(cloud);
    }
    
   


    const closedSpline = new THREE.CatmullRomCurve3( [
        new THREE.Vector3( - 60, - 100, 60 ),
        new THREE.Vector3( - 60, 20, 60 ),
        new THREE.Vector3( - 60, 120, 60 ),
        new THREE.Vector3( 60, 20, - 60 ),
        new THREE.Vector3( 60, - 100, - 60 )
    ] );

    closedSpline.curveType = 'catmullrom';
    closedSpline.closed = true;

    const extrudeSettings1 = {
        steps: 100,
        bevelEnabled: false,
        extrudePath: closedSpline
    };

    const pts1 = [], count = 3;

    for ( let i = 0; i < count; i ++ ) {

        const l = 20;

        const a = 2 * i / count * Math.PI;

        pts1.push( new THREE.Vector2( Math.cos( a ) * l, Math.sin( a ) * l ) );

    }

    const shape1 = new THREE.Shape( pts1 );

    const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings1 );

    const material1 = new THREE.MeshLambertMaterial( { color: 0xb00000, wireframe: false } );

    const mesh1 = new THREE.Mesh( geometry1, material1 );

    sceneGraph.add( mesh1 );

    const waterGeometry = new THREE.PlaneGeometry( 100, 20 );

    // const riverForm = new THREE.CatmullRomCurve3( [
    //     new THREE.Vector3(-50, 0, 50),
    //     new THREE.Vector3(50, 0, 50),
    //     new THREE.Vector3(-50, 0, -50)
    // ] );

    const water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: sceneGraph.fog !== undefined
        }
    );

    water.rotation.x = - Math.PI / 2;
    water.position.y = 0.01;

    // Add the following code to modify the water's geometry based on the curve
    // const vertices = water.geometry.vertices;
    // const curvePoints = riverForm.getPoints(100); // get 100 points along the curve

    // for (let i = 0; i < vertices.length; i++) {
    //     const x = vertices[i].x;
    //     const z = vertices[i].z;
    //     const pointOnCurve = curvePoints.find(p => p.x === x && p.z === z);
    //     if (pointOnCurve) {
    //         vertices[i].y = pointOnCurve.y;
    //     }
    // }

    // water.geometry.verticesNeedUpdate = true;

    sceneGraph.add( water );

    loadHouse(sceneGraph, new THREE.Vector2(-25,-20));
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
    const grass_texture = new THREE.TextureLoader().load( "textures/grass.jpg" );
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

function getSideMountains(sceneGraph, positionToGo, side){
    const snow_texture = new THREE.TextureLoader().load( "textures/snow.jpg" );
    snow_texture.wrapS = THREE.RepeatWrapping;
    snow_texture.wrapT = THREE.RepeatWrapping;
    snow_texture.repeat.set( 7, 7 );
    const rock_texture = new THREE.TextureLoader().load( "textures/rock.jpg" );
    rock_texture.wrapS = THREE.RepeatWrapping;
    rock_texture.wrapT = THREE.RepeatWrapping;
    rock_texture.repeat.set( 6, 6 );
    const grass_texture = new THREE.TextureLoader().load( "textures/grass.jpg" );
    grass_texture.wrapS = THREE.RepeatWrapping;
    grass_texture.wrapT = THREE.RepeatWrapping;
    grass_texture.repeat.set( 1, 1 );

    const simplex = new SimplexNoise();
    const MAX_HEIGHT = 10;

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            // posição da montanha
            let position = tileToPosition(i + positionToGo.x, j + positionToGo.y);
            let distanceFromMountainCenter = Math.abs(i) + Math.abs(j);
            let height = 0;
            let noise = (simplex.noise(i * 0.1, j * 0.1) + 1) + 0.5;
            noise = Math.pow(noise, 1.5);
            if(distanceFromMountainCenter < 14){
                height = noise * MAX_HEIGHT;
            }else if(distanceFromMountainCenter > 18){
                continue;
            }else if(distanceFromMountainCenter > 17){
                height = noise * MAX_HEIGHT/7;
            }else if(distanceFromMountainCenter > 16){
                height = noise * MAX_HEIGHT/3;
            }else if(distanceFromMountainCenter > 14){
                height = noise * MAX_HEIGHT/1.5;
            }else if(distanceFromMountainCenter > 12){
                height = noise * MAX_HEIGHT;
            } 
            makeHex(height,position, distanceFromMountainCenter);
        }
    }
        // rotate mountain
    // when doing rotations, mesh is duplicated, idk why
    if(side == 2){
        let rotation = new THREE.Matrix4().makeRotationY(Math.PI/2);
        snowGeo.applyMatrix4(rotation);
        dirtGeo.applyMatrix4(rotation);
        grassGeo.applyMatrix4(rotation);
    }else if(side == 3){
        let rotation = new THREE.Matrix4().makeRotationY(Math.PI);
        snowGeo.applyMatrix4(rotation);
        dirtGeo.applyMatrix4(rotation);
        grassGeo.applyMatrix4(rotation);
    }else if(side == 4){
        let rotation = new THREE.Matrix4().makeRotationY(Math.PI*3/2);
        snowGeo.applyMatrix4(rotation);
        dirtGeo.applyMatrix4(rotation);
        grassGeo.applyMatrix4(rotation);
    }

    let snowMesh = hexMesh(snowGeo, snow_texture);
    let dirtMesh = hexMesh(dirtGeo, rock_texture);
    let grassMesh = hexMesh(grassGeo, grass_texture);
    sceneGraph.add(snowMesh, dirtMesh, grassMesh);
}

function getRectangularMountains(sceneGraph,side){
    const snow_texture = new THREE.TextureLoader().load( "textures/snow.jpg" );
    snow_texture.wrapS = THREE.RepeatWrapping;
    snow_texture.wrapT = THREE.RepeatWrapping;
    snow_texture.repeat.set( 7, 7 );
    const rock_texture = new THREE.TextureLoader().load( "textures/rock.jpg" );
    rock_texture.wrapS = THREE.RepeatWrapping;
    rock_texture.wrapT = THREE.RepeatWrapping;
    rock_texture.repeat.set( 6, 6 );
    const grass_texture = new THREE.TextureLoader().load( "textures/grass.jpg" );
    grass_texture.wrapS = THREE.RepeatWrapping;
    grass_texture.wrapT = THREE.RepeatWrapping;
    grass_texture.repeat.set( 1, 1 );

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

    let snowMesh = hexMesh(snowGeo, snow_texture);
    let dirtMesh = hexMesh(dirtGeo, rock_texture);
    let grassMesh = hexMesh(grassGeo, grass_texture);
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


function getRoundMountains(sceneGraph, positionToGo){
    const snow_texture = new THREE.TextureLoader().load( "textures/snow.jpg" );
    snow_texture.wrapS = THREE.RepeatWrapping;
    snow_texture.wrapT = THREE.RepeatWrapping;
    snow_texture.repeat.set( 7, 7 );
    const rock_texture = new THREE.TextureLoader().load( "textures/rock.jpg" );
    rock_texture.wrapS = THREE.RepeatWrapping;
    rock_texture.wrapT = THREE.RepeatWrapping;
    rock_texture.repeat.set( 6, 6 );
    const grass_texture = new THREE.TextureLoader().load( "textures/grass.jpg" );
    grass_texture.wrapS = THREE.RepeatWrapping;
    grass_texture.wrapT = THREE.RepeatWrapping;
    grass_texture.repeat.set( 1, 1 );

    const simplex = new SimplexNoise();
    const MAX_HEIGHT = 9;

    for(let i = -15 ; i <= 15 ; i++){
        for(let j = -15 ; j <= 15 ; j++){
            // posição da montanha
            let position = tileToPosition(i + positionToGo.x, j + positionToGo.y);
            let distanceFromMountainCenter = position.clone().sub(positionToGo).length();
            let height = 0;
            let noise = (simplex.noise(i * 0.1, j * 0.1) + 1) + 0.5;
            noise = Math.pow(noise, 1.5);
            if(distanceFromMountainCenter < 12){
                height = noise * MAX_HEIGHT;
            }else if(distanceFromMountainCenter > 18){
                continue;
            }else if(distanceFromMountainCenter > 17){
                height = noise * MAX_HEIGHT/7;
            }else if(distanceFromMountainCenter > 16){
                height = noise * MAX_HEIGHT/3;
            }else if(distanceFromMountainCenter > 12){
                height = noise * MAX_HEIGHT/1.5;}
            makeHex(height, position, distanceFromMountainCenter);
        }
    }

    let snowMesh = hexMesh(snowGeo, snow_texture);
    let dirtMesh = hexMesh(dirtGeo, rock_texture);
    let grassMesh = hexMesh(grassGeo, grass_texture);
    sceneGraph.add(snowMesh, dirtMesh, grassMesh);
}

function hexGeometry(height,position){
    let cylinderGeometry = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
    cylinderGeometry.translate(position.x, height*0.5, position.y);
    return cylinderGeometry;
}

function makeHex(height,position,distanceFromMountainCenter){
    let geo = hexGeometry(height,position);

    if(height > 22 && distanceFromMountainCenter < 13){
        snowGeo = mergeBufferGeometries([geo, snowGeo]);
    }else if(height > 3 && distanceFromMountainCenter < 17){
        dirtGeo = mergeBufferGeometries([geo, dirtGeo]);
    }else{
        grassGeo = mergeBufferGeometries([geo, grassGeo]);
    }
}

function makeHexRec(height,position,distanceFromMountainCenter){
    let geo = hexGeometry(height,position);

    if(height > 22){
        snowGeo = mergeBufferGeometries([geo, snowGeo]);
    }else if(height > 3){
        dirtGeo = mergeBufferGeometries([geo, dirtGeo]);
    }else{
        grassGeo = mergeBufferGeometries([geo, grassGeo]);
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

function createCloud(position){
    const puff1 = new THREE.SphereGeometry(2, 7, 7);
    puff1.translate(position.x, position.y, position.z)
    const puff1Material = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)' });
    const puff1Mesh = new THREE.Mesh(puff1, puff1Material);
    puff1Mesh.castShadow = true;
    puff1Mesh.receiveShadow = true;

    const puff2 = new THREE.SphereGeometry(1.6, 7, 7);
    puff2.translate(position.x-2, position.y, position.z)
    const puff2Material = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)' });
    const puff2Mesh = new THREE.Mesh(puff2, puff2Material);
    puff2Mesh.castShadow = true;
    puff2Mesh.receiveShadow = true;

    const puff3 = new THREE.SphereGeometry(1.3, 7, 7);
    puff3.translate(position.x+2, position.y, position.z)
    const puff3Material = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)' });
    const puff3Mesh = new THREE.Mesh(puff3, puff3Material);
    puff3Mesh.castShadow = true;
    puff3Mesh.receiveShadow = true;

    var cloud = new THREE.Group();
    cloud.add(puff1Mesh); cloud.add(puff2Mesh); cloud.add(puff3Mesh);

    return cloud;
    // var tree = new THREE.Group();
    // tree.add(logObject); tree.add(leaf); tree.add(leaf2); tree.add(leaf3);  
}

function isTooClose(position, otherPositions){
    for (let i = 0; i < otherPositions.length; i++) {
        let distance = position.clone().setY(0).distanceTo(otherPositions[i].clone().setY(0));
        if(distance < 7.5){
            return true;
        }
    }
    return false;
}

function loadHouse(sceneGraph, position){
    let loader = new GLTFLoader();
    loader.load('models/house.gltf', (gltf) => {
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