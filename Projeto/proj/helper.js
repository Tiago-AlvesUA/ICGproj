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
        // Illumination
        // ************************** //
        // Set up day lights
        const ambientLightDay = new THREE.AmbientLight('rgb(255, 255, 255)', 0.1);
        ambientLightDay.name = "daylight1";
        sceneElements.sceneGraph.add(ambientLightDay);

        const spotLight = new THREE.SpotLight('rgb(255, 255, 255)', 0.7);
        // (-100, 60, -20)
        spotLight.position.set(-100,60,-20);
        spotLight.name = "daylight2";
        sceneElements.sceneGraph.add(spotLight);
        spotLight.castShadow = true;
        //spotLight.shadow.mapSize.width = 2048;
        //spotLight.shadow.mapSize.height = 2048;

        // Set up night lights
        const ambientLightNight = new THREE.AmbientLight('rgb(10, 10, 50)', 0.5);
        ambientLightNight.name = "nightlight1";
        sceneElements.sceneGraph.add(ambientLightNight);
        ambientLightNight.visible = false;

        const spotLightNight = new THREE.SpotLight('rgb(255, 255, 255)', 0.06);
        spotLightNight.position.set(0, 100, 0);
        spotLightNight.name = "nightlight2";
        sceneElements.sceneGraph.add(spotLightNight);
        spotLightNight.visible = false;

        const fireLight = new THREE.PointLight(0xff6600, 3, 10, 3);
        fireLight.position.set(23.45, 5, 13);
        sceneElements.sceneGraph.add(fireLight);
        fireLight.castShadow = true;

        // const crystalLight2 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight2.position.set(-35, 5, 18);
        // sceneElements.sceneGraph.add(crystalLight2);
        // crystalLight2.castShadow = true;
        // crystalLight2.shadow.mapSize.width = 25;
        // crystalLight2.shadow.mapSize.height = 25;
        // const crystalLight1 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight1.position.set(-15, 5, 15);
        // sceneElements.sceneGraph.add(crystalLight1);
        // crystalLight1.castShadow = true;
        // crystalLight1.shadow.mapSize.width = 25;
        // crystalLight1.shadow.mapSize.height = 25;
        // const crystalLight3 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight3.position.set(5, 5, 20);
        // sceneElements.sceneGraph.add(crystalLight3);
        // crystalLight3.castShadow = true;
        // crystalLight3.shadow.mapSize.width = 25;
        // crystalLight3.shadow.mapSize.height = 25;
        // const crystalLight4 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight4.position.set(40, 5, 15);
        // sceneElements.sceneGraph.add(crystalLight4);
        // crystalLight4.castShadow = true;
        // crystalLight4.shadow.mapSize.width = 25;
        // crystalLight4.shadow.mapSize.height = 25;
        // const crystalLight5 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight5.position.set(30, 5, -16);
        // sceneElements.sceneGraph.add(crystalLight5);
        // crystalLight5.castShadow = true;
        // crystalLight5.shadow.mapSize.width = 25;
        // crystalLight5.shadow.mapSize.height = 25;
        // const crystalLight6 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight6.position.set(-30, 5, -13);
        // sceneElements.sceneGraph.add(crystalLight6);
        // crystalLight6.castShadow = true;
        // crystalLight6.shadow.mapSize.width = 25;
        // crystalLight6.shadow.mapSize.height = 25;
        // const crystalLight7 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight7.position.set(-40, 5, -20);
        // sceneElements.sceneGraph.add(crystalLight7);
        // crystalLight7.castShadow = true;
        // crystalLight7.shadow.mapSize.width = 25;
        // crystalLight7.shadow.mapSize.height = 25;
        // const crystalLight8 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight8.position.set(45, 5, -21);
        // sceneElements.sceneGraph.add(crystalLight8);
        // crystalLight8.castShadow = true;
        // crystalLight8.shadow.mapSize.width = 25;
        // crystalLight8.shadow.mapSize.height = 25;
        // const crystalLight9 = new THREE.PointLight(0x92CFE3, 3, 10, 3);
        // crystalLight9.position.set(0, 5, -20);
        // sceneElements.sceneGraph.add(crystalLight9);
        // crystalLight9.castShadow = true;
        // crystalLight9.shadow.mapSize.width = 25;
        // crystalLight9.shadow.mapSize.height = 25;
        

        // ************************** //
        // Add camera
        // ************************** //
        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 2000);
        sceneElements.camera = camera;
        camera.position.set(130, 30, 50);

        // *********************************** //
        // Create renderer (with shadow map)
        // *********************************** //
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        sceneElements.renderer = renderer;
        renderer.setPixelRatio(window.devicePixelRatio);
        //renderer.setClearColor('rgb(255, 255, 150)', 1.0);
        renderer.setSize(width, height);

        // Setup shadowMap property
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;


        // ************************** //
        // NEW --- Control for the camera
        // ************************** //
        sceneElements.control = new OrbitControls(camera, sceneElements.renderer.domElement);
        sceneElements.control.screenSpacePanning = true;

        // **************************************** //
        // Add the rendered image in the HTML DOM
        // **************************************** //
        const htmlElement = document.querySelector("#mountains-map");
        htmlElement.appendChild(renderer.domElement);
    },

    setupDayTime: function (sceneElements) {
        // hide night light
        const nightLight1 = sceneElements.sceneGraph.getObjectByName("nightlight1");
        nightLight1.visible = false;
        const nightLight2 = sceneElements.sceneGraph.getObjectByName("nightlight2");
        nightLight2.visible = false;

        // show day light
        const dayLight1 = sceneElements.sceneGraph.getObjectByName("daylight1");
        dayLight1.visible = true;
        const dayLight2 = sceneElements.sceneGraph.getObjectByName("daylight2");
        dayLight2.visible = true;

        sceneElements.sceneGraph.background = new THREE.Color(0x3D85C6);
    },

    setupNightTime: function (sceneElements) {
        // hide day light
        const dayLight1 = sceneElements.sceneGraph.getObjectByName("daylight1");
        dayLight1.visible = false;
        const dayLight2 = sceneElements.sceneGraph.getObjectByName("daylight2");
        dayLight2.visible = false;

        // show night light
        const nightLight1 = sceneElements.sceneGraph.getObjectByName("nightlight1");
        nightLight1.visible = true;
        const nightLight2 = sceneElements.sceneGraph.getObjectByName("nightlight2");
        nightLight2.visible = true;

        sceneElements.sceneGraph.background = new THREE.Color(0x000033);
    },

    render: function render(sceneElements) {
        sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    },
};

export default helper;