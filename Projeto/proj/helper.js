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
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;

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
        const htmlElement = document.querySelector("#Tag3DScene");
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