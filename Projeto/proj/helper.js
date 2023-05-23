"use strict";

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const helper = {

    initEmptyScene: function (sceneElements) {

        // ************************** //
        // Create the 3D scene
        // ************************** //
        sceneElements.sceneGraph = new THREE.Scene();


        // ************************** //
        // Add camera
        // ************************** //
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        sceneElements.camera = camera;
        camera.position.set(130, 40, 50);
        camera.lookAt(0, 0, 0);


        // *********************************** //
        // Create renderer (with shadow map)
        // *********************************** //
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        sceneElements.renderer = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor('rgb(255, 255, 150)', 1.0);
        renderer.setSize(width, height);

        // Setup shadowMap property
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;


        // ************************** //
        // NEW --- Control for the camera
        // ************************** //
        sceneElements.control = new OrbitControls(camera, sceneElements.renderer.domElement);
        sceneElements.control.screenSpacePanning = true;

        // ************************** //
        // Illumination
        // ************************** //

        // create both day 

        // ************************** //
        // Add ambient light
        // ************************** //
        // const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.2);
        // sceneElements.sceneGraph.add(ambientLight);

        //***************************** //
        //Add spotlight (with shadows)
        //***************************** //
        // const spotLight = new THREE.SpotLight('rgb(255, 255, 255)', 0.8);
        // spotLight.position.set(130,50,0);
        // sceneElements.sceneGraph.add(spotLight);

        //Setup shadow properties for the spotlight
        // spotLight.castShadow = true;
        // spotLight.shadow.mapSize.width = 2048;
        // spotLight.shadow.mapSize.height = 2048;

        // // Give a name to the spot light
        // spotLight.name = "light";

        const fireLight = new THREE.PointLight(0xff6600, 3, 10, 3);
        fireLight.position.set(23.45, 5, 13);
        sceneElements.sceneGraph.add(fireLight);

        // **************************************** //
        // Add the rendered image in the HTML DOM
        // **************************************** //
        const htmlElement = document.querySelector("#Tag3DScene");
        htmlElement.appendChild(renderer.domElement);
    },

    setupDayTime: function (sceneElements) {
        // remove night light
        const nightLight1 = sceneElements.sceneGraph.getObjectByName("nightlight1");
        sceneElements.sceneGraph.remove(nightLight1);
        const nightLight2 = sceneElements.sceneGraph.getObjectByName("nightlight2");
        sceneElements.sceneGraph.remove(nightLight2);

        // Set up day sky color
        sceneElements.sceneGraph.background = new THREE.Color(0x3D85C6);

        // Set up day lights
        const ambientLightDay = new THREE.AmbientLight('rgb(255, 255, 255)', 0.1);
        ambientLightDay.name = "daylight1";
        sceneElements.sceneGraph.add(ambientLightDay);


        const spotLight = new THREE.SpotLight('rgb(255, 255, 255)', 0.7);
        spotLight.position.set(130,50,0);
        spotLight.name = "daylight2";
        sceneElements.sceneGraph.add(spotLight);


        // Setup shadow properties for the spotlight
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;

        // const directionalLightDay = new THREE.DirectionalLight('rgb(255, 255, 255)', 0.8);
        // directionalLightDay.position.set(100, 50, -100);
        // sceneElements.sceneGraph.add(directionalLightDay);
    },

    setupNightTime: function (sceneElements) {
        // remove day light
        const dayLight1 = sceneElements.sceneGraph.getObjectByName("daylight1");
        sceneElements.sceneGraph.remove(dayLight1);
        const dayLight2 = sceneElements.sceneGraph.getObjectByName("daylight2");
        sceneElements.sceneGraph.remove(dayLight2);

        // Set up night sky color
        sceneElements.sceneGraph.background = new THREE.Color(0x000033);

        // Set up night lights
        const ambientLightNight = new THREE.AmbientLight('rgb(10, 10, 50)', 0.5);
        ambientLightNight.name = "nightlight1";
        sceneElements.sceneGraph.add(ambientLightNight);

        const spotLightNight = new THREE.SpotLight('rgb(255, 255, 255)', 0.06);
        //spotLightNight.position.set(-50, 100, 20);
        spotLightNight.position.set(0, 100, 0);
        spotLightNight.name = "nightlight2";
        sceneElements.sceneGraph.add(spotLightNight);
    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },
};

export default helper;