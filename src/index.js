import * as THREE from "three";
import { Sidebar } from "./sidebar";
import Scene from "./scene";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  createAnteriorLine,
  createDistalPlane,
  createFlexionPlane,
  createDistalResctionPlane,
  createLateralLine,
} from "./helper";
import {
  createLine,
  createPependicularPlane,
  getNormalFromPlane,
  getVectorFromLine,
  projectLineOnPlane,
} from "./util";
import Measure from "./measure";

let currentMarker = null;
let selectedLandmark = null;
let renderWindow = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer();
renderer.setSize(renderWindow.offsetWidth, renderWindow.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.localClippingEnabled = true;
document.getElementById("canvas").appendChild(renderer.domElement);

const scene = new Scene();
addOrbitControls(renderer);
addTransformControls(renderer);

const sidebar = new Sidebar();
sidebar.init();
sidebar.addEventListener("landmark_clicked", onLandMarkClicked);

sidebar.addEventListener("submit", onSubmit);

sidebar.addEventListener("rotate", onRotate);

sidebar.addEventListener("distal", onDistalClicked);

function onSubmit({ type, data }) {
  let markers = sidebar.markers;
  let mechanicalAxis = createLine(
    markers["Femur_Center"].position,
    markers["Hip_Center"].position,
    "blue"
  );
  let anatomicalAxis = createLine(
    markers["Femur_Proximal_Canal"].position,
    markers["Femur_Distal_Canal"].position,
    "blue"
  );
  let teaAxis = createLine(
    markers["Medial_Epicondyle"].position,
    markers["Lateral_Epicondyle"].position,
    "blue"
  );
  let pcaAxis = createLine(
    markers["Posterior_Medial_Pt"].position,
    markers["Posterior_Lateral_Pt"].position,
    "blue"
  );
  let perpendicularPlane = createPependicularPlane(
    markers["Femur_Center"].position,
    markers["Hip_Center"].position,
    0xff0000
  );
  let projectTEA = projectLineOnPlane(
    teaAxis,
    perpendicularPlane,
    getVectorFromLine(mechanicalAxis)
  );

  let anteriorLine = createAnteriorLine(
    10,
    projectTEA,
    markers["Femur_Center"],
    mechanicalAxis,
    "yellow"
  );
  //duplicate of perpendicualr plane rotates arount anterior line
  let varusPlane = createPependicularPlane(
    markers["Femur_Center"].position,
    markers["Hip_Center"].position,
    0x00ff00
  );
  let lateralLine = createLateralLine(
    100,
    anteriorLine,
    sidebar.markers["Femur_Center"],
    mechanicalAxis,
    "yellow"
  );
  let flexionPlane = createFlexionPlane(varusPlane, 0x0000ff);

  let distalMedialPlane = createDistalPlane(
    flexionPlane,
    markers["Distal_Medial_Pt"],
    0xff0000
  );

  let [distalResectionPlane, distalResectionPlaneMesh, planeHelper] =
    createDistalResctionPlane(
      distalMedialPlane,
      sidebar.getDistalResectionValue(),
      0x00ff00
    );
  let distalMedialMeasure = new Measure(scene.camera);
  distalMedialMeasure.setFromPointAndPlane(
    markers["Distal_Medial_Pt"].position,
    distalResectionPlane
  );
  let distalLateralMeasure = new Measure(scene.camera);
  distalLateralMeasure.setFromPointAndPlane(
    markers["Distal_Lateral_Pt"].position,
    distalResectionPlane
  );

  scene.axises = [mechanicalAxis, anatomicalAxis, pcaAxis, teaAxis, projectTEA];

  scene.anteriorLine = anteriorLine;
  scene.lateralLine = lateralLine;

  scene.varusPlane = varusPlane;
  varusPlane.add(lateralLine);
  scene.flexionPlane = flexionPlane;
  scene.distalMedialPlane = distalMedialPlane;
  scene.distalResectionPlane = distalResectionPlane;
  scene.distalResectionPlaneMesh = distalResectionPlaneMesh;

  scene.rotateVarusPlane(sidebar.getVarusRotationValue());
  scene.rotateFlexionPlane(sidebar.getFlexionRotationValue());

  scene.measurements.push(distalMedialMeasure);
  scene.measurements.push(distalLateralMeasure);
  scene.scene.add(distalMedialMeasure.line);
  scene.scene.add(distalLateralMeasure.line);

  scene.scene.add(perpendicularPlane);
  scene.scene.add(varusPlane);
  scene.scene.add(flexionPlane);
  scene.scene.add(distalMedialPlane);
  scene.scene.add(distalResectionPlaneMesh);

  scene.scene.add(anteriorLine);
  // scene.scene.add(lateralLine);

  scene.femurModel.material.clippingPlanes = sidebar.isResect()
    ? [distalResectionPlane]
    : null;
  scene.femurModel.material.clippingPlanesNeedUpdate = true;
  scene.showAxises();
}

function onLandMarkClicked({ type, data }) {
  scene.transformControl.detach(currentMarker);

  if (selectedLandmark && currentMarker) {
    sidebar.addMarker(selectedLandmark, currentMarker);
    currentMarker = null;
  }
  selectedLandmark = data.selectedLandmark;
  if (data.selectedLandmark) {
    if (sidebar.markers[data.selectedLandmark]) {
      scene.transformControl.attach(sidebar.markers[data.selectedLandmark]);
      currentMarker = sidebar.markers[data.selectedLandmark];
      renderWindow.addEventListener("click", onWindowClick);

    } else {
      renderWindow.addEventListener("click", onWindowClick);
    }
  } else {
    scene.transformControl.detach(currentMarker);
    renderWindow.removeEventListener("click", onWindowClick);
  }
}

function onRotate({ type, data }) {
  if (data.plane === "varus") {
    if (data.value === "minus") {
      scene.rotateVarusPlane(-1);
    } else if (data.value === "plus") {
      scene.rotateVarusPlane(1);
    }
  } else if (data.plane === "flexion") {
    if (data.value === "minus") {
      scene.rotateFlexionPlane(-1);
    } else if (data.value === "plus") {
      scene.rotateFlexionPlane(1);
    }
  }
}

function onDistalClicked({ type, data }) {
  if (data.value === "plus") {
    scene.translateDistaResectionPlane(1);
  } else if (data.value === "minus") {
    scene.translateDistaResectionPlane(-1);
  } else if (data.value === "toggle") {
    if (sidebar.isResect() && scene.distalResectionPlane) {
      scene.femurModel.material.clippingPlanes = [scene.distalResectionPlane];
    } else {
      scene.femurModel.material.clippingPlanes = [];
    }
  }
}

function addMarkerToScene(e) {
  const rect = renderWindow.getBoundingClientRect();
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  mouse.x = ((e.clientX - rect.left) / renderWindow.offsetWidth) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / renderWindow.offsetHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, scene.camera);

  const intersects = raycaster.intersectObjects(scene.group.children, true);

  if (intersects.length > 0) {
    let intersectionPoint = intersects[0].point;
    if (currentMarker) {
      scene.group.remove(currentMarker);
    }
    const markerGeometry = new THREE.SphereGeometry(2, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    currentMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    currentMarker.position.copy(intersectionPoint);
    scene.transformControl.attach(currentMarker);
    scene.ma
    scene.group.add(currentMarker);
  }
}

const onWindowClick = (e) => {
  addMarkerToScene(e);
  sidebar.addMarker(selectedLandmark, currentMarker);
};

function addOrbitControls(renderer) {
  let orbitControl = new OrbitControls(scene.camera, renderer.domElement);
  orbitControl.enableDamping = true;
  orbitControl.target = new THREE.Vector3(5, 0, 750);
  scene.orbitControl = orbitControl;
  return orbitControl;
}

function addTransformControls(renderer) {
  let transformControl = new TransformControls(
    scene.camera,
    renderer.domElement
  );
  transformControl.addEventListener("change", render);
  transformControl.addEventListener("dragging-changed", function (event) {
    scene.orbitControl.enabled = !event.value;
  });
  scene.transformControl = transformControl;
  scene.group.add(transformControl);
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  scene.camera.aspect = renderWindow.offsetWidth / renderWindow.offsetHeight;
  scene.camera.updateProjectionMatrix();
  renderer.setSize(renderWindow.offsetWidth, renderWindow.offsetHeight);
}

function animate() {
  requestAnimationFrame(animate);
  scene.measurements.forEach((m) => {
    m.updatePosition();
  });
  scene.orbitControl.update();

  render();
}

function render() {
  renderer.render(scene.scene, scene.camera);
}

animate();
