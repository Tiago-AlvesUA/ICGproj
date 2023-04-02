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

    for(let i = -10 ; i <= 10 ; i++){
        for(let j = -10 ; j <= 10 ; j++){
            let position = tileToPosition(i, j);

            if(position.length() > 16) continue;
            

            // calculate the noise value for this tile's position
            // noise is not a function
            const noiseValue = new SimplexNoise();

            noiseValue.noise = (i * 0.1, j * 0.1);

            // get random height between 1 and 5 (using the noise value)

            const height = Math.floor(Math.random() * 5) + 1;

            hexGeometry(height, position);
        }
    }
    
    function hexGeometry(height,position){
        const cylinderGeometry = new THREE.CylinderGeometry(1, 1, height, 6, 1, false);
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(255,255,255)' });
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