import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { EventDispatcher } from "three";

import * as THREE from "three";
import { getNormalFromPlane, getVectorFromLine } from "./util";
import { GUI } from "dat.gui";

export default class Scene extends EventDispatcher {
  constructor() {
    super();
    this.scene = new THREE.Scene();
    this.renderWindow = document.getElementById("canvas");
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.renderWindow.offsetWidth / this.renderWindow.offsetHeight,
      0.1,
      1000
    );
    this.orbitControl = null;
    this.transformControl = null;
    this.axises = [];
    this.anteriorLine = null;
    this.femurModel = null;
    this.lateralLine = null;
    this.group = new THREE.Group();
    this.perpendicularPlane = null;
    this.varusPlane = null;
    this.flexionPlane = null;
    this.distalMedialPlane = null;
    this.distalResectionPlane = null;
    this.distalResectionPlaneMesh = null;
    this.measurements = [];
    this.initialize();
    this.initGui();
  }
  initialize() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    const directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(-1, -1, -1);
    directionalLight2.position.set(1, 1, 1);

    this.camera.position.set(0, -700, 800);
    const loader = new STLLoader();
    loader.load("models/Right_Tibia.stl", (geometry) => {
      const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x111111,
        shininess: 200,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    });
    loader.load("models/Right_Femur.stl", (geometry) => {
      const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x111111,
        shininess: 200,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.femurModel = mesh;
      this.group.add(mesh);
    });

    this.scene.add(new THREE.AxesHelper(50));
    this.scene.add(ambientLight);
    this.scene.add(directionalLight);
    this.scene.add(directionalLight2);
    this.scene.add(this.group);
  }

  initGui() {
    const gui = new GUI();

    const cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(this.camera.position, "z", 400, 1200);
    cameraFolder.open();
    this.gui = gui;
  }

  showAxises() {
    for (let axis of this.axises) {
      this.scene.add(axis);
    }
    this.scene.add(this.anteriorLine);
  }

  rotateVarusPlane(degrees) {
    const d = getVectorFromLine(this.anteriorLine);
    const r = THREE.MathUtils.degToRad(degrees);
    this.varusPlane.rotateOnAxis(d, r);
    // if (this.lateralLine) {
    //   this.lateralLine.rotateOnWorldAxis(d, r);
    // }
    if (this.flexionPlane) {
      this.flexionPlane.rotateOnWorldAxis(d, r);
    }
    if (this.distalMedialPlane) {
      this.distalMedialPlane.rotateOnWorldAxis(d, r);
    }
    if (this.distalResectionPlaneMesh) {
      this.distalResectionPlaneMesh.rotateOnWorldAxis(d, r);
    }
    if (this.distalResectionPlane) {
      this.distalResectionPlane.setFromNormalAndCoplanarPoint(
        getNormalFromPlane(this.distalResectionPlaneMesh),
        this.distalResectionPlaneMesh.position
      );
    }
    this.measurements.forEach((measurement) => {
      measurement.updateValue();
    });
  }

  rotateFlexionPlane(degrees) {
    const r = THREE.MathUtils.degToRad(degrees);
    const d = getVectorFromLine(this.lateralLine);
    this.flexionPlane.rotateOnWorldAxis(d, r);
    if (this.distalMedialPlane) {
      this.distalMedialPlane.rotateOnWorldAxis(d, r);
    }
    if (this.distalResectionPlaneMesh) {
      this.distalResectionPlaneMesh.rotateOnWorldAxis(d, r);
    }
    if (this.distalResectionPlane) {
      this.distalResectionPlane.setFromNormalAndCoplanarPoint(
        getNormalFromPlane(this.distalResectionPlaneMesh),
        this.distalResectionPlaneMesh.position
      );
    }
    this.measurements.forEach((measurement) => {
      measurement.updateValue();
    });
  }

  translateDistaResectionPlane(d) {
    this.distalResectionPlaneMesh.position.add(new THREE.Vector3(0, 0, d));
    if (this.distalResectionPlane) {
      this.distalResectionPlane.translate(new THREE.Vector3(0, 0, d));
    }
    this.measurements.forEach((measurement) => {
      measurement.updateValue();
    });
  }

  initPlaneGui() {
    const planeFolder = this.gui.addFolder("Planes");
    planeFolder
      .add(this.perpendicularPlane, "visible", false)
      .name("Show Perpendicular Plane");
    planeFolder.add(this.varusPlane, "visible", false).name("Show Varus Plane");
    planeFolder
      .add(this.flexionPlane, "visible", false)
      .name("Show Flexion Plane");
    planeFolder
      .add(this.distalMedialPlane, "visible", false)
      .name("Show Distal Medial Plane");
    planeFolder
      .add(this.distalResectionPlaneMesh, "visible", false)
      .name("Show Distal Resection Plane");
    planeFolder.open();
  }
}
