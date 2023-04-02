"use strict";

import * as THREE from 'three';
import helper from "./helper.js";
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  
    renderer: null,
};


helper.initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);


// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // load a texture, set wrap mode to repeat
    const dirt_texture = new THREE.TextureLoader().load( "textures/dirt.png" );
    // dirt_texture.wrapS = THREE.RepeatWrapping;
    // dirt_texture.wrapT = THREE.RepeatWrapping;
    // dirt_texture.repeat.set( 4, 4 );

    const snow_texture = new THREE.TextureLoader().load( "textures/snow.jpg" );



    const simplex = new SimplexNoise();
    const MAX_HEIGHT = 4;

    for(let i = -15 ; i <= 15 ; i++){
        for(let j = -15 ; j <= 15 ; j++){
            let position = tileToPosition(i, j);

            if(position.length() > 16) continue;
            
            let noise = (simplex.noise(i * 0.1, j * 0.1) + 1) + 0.5;
            noise = Math.pow(noise, 1.5);
            let height = noise * MAX_HEIGHT;
            let text;
            hexGeometry(height, position);
        }
    }
    
    function hexGeometry(height,position){
        const cylinderGeometry = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
        let cylinderMaterial;
        if (height > 10){
            cylinderMaterial = new THREE.MeshPhongMaterial({ 
                color: 'rgb(255,255,255)',
                map: snow_texture,
                emissive: new THREE.Color(0.05, 0.05, 0.05)});
        }else{
            cylinderMaterial = new THREE.MeshPhongMaterial({ 
                color: 'rgb(255,255,255)',
                map: dirt_texture,
                emissive: new THREE.Color(0.05, 0.05, 0.05)});
        }
        const cylinderObject = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderObject.position.set(position.x,height*0.5,position.y);
        cylinderObject.castShadow = true;
        sceneGraph.add(cylinderObject);
    }

    function tileToPosition(tileX,tileY){
        return new THREE.Vector2((tileX + (tileY % 2) * 0.5) * 1.77,tileY * 1.535);
    }
   
    
}

// Displacement values

function computeFrame(time) {
    // Rendering
    helper.render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}

export { sceneElements };