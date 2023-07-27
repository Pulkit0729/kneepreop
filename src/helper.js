import {
  createCocurrentPerpendicularLine,
  createPlane,
  crossProduct,
  getNormalFromPlane,
  getVectorFromLine,
} from "./util";
import * as THREE from "three";

export function createAnteriorLine(
  distance,
  projectTEA,
  femur_center,
  mechanicalAxis,
  color
) {
  const d1 = getVectorFromLine(mechanicalAxis);
  const d2 = getVectorFromLine(projectTEA);

  return createCocurrentPerpendicularLine(
    d1,
    d2,
    femur_center.position,
    distance,
    color
  );
}

export function createLateralLine(
  distance,
  anteriorLine,
  femur_center,
  mechanicalAxis,
  color
) {
  const d1 = getVectorFromLine(mechanicalAxis);
  const d2 = getVectorFromLine(anteriorLine);
  return createCocurrentPerpendicularLine(
    d1,
    d2,
    femur_center.position,
    distance,
    color
  );
}

export function createFlexionPlane(varusPlane, color) {
  const flexPlane = createPlane(10, color);
  flexPlane.geometry.copy(varusPlane.geometry);
  flexPlane.position.copy(varusPlane.position);
  return flexPlane;
}
export function createDistalPlane(flexionPlane, distal_medial, color) {
  const distalPlane = createPlane(10, color);
  distalPlane.geometry.copy(flexionPlane.geometry);
  distalPlane.position.copy(distal_medial.position);
  return distalPlane;
}
export function createDistalResctionPlane(distalPlane, distance, color) {
  const distalResectionPlane = createPlane(10, color);
  distalResectionPlane.geometry.copy(distalPlane.geometry);
  distalResectionPlane.position
    .copy(distalPlane.position)
    .add(new THREE.Vector3(0, 0, distance));
  const plane = new THREE.Plane();
  plane.setFromNormalAndCoplanarPoint(
    getNormalFromPlane(distalResectionPlane),
    distalResectionPlane.position
  );
  let planeHelper = new THREE.PlaneHelper(plane, 100, "gray");
  return [plane, distalResectionPlane, planeHelper];
}
