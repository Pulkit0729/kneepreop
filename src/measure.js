import { LineBasicMaterial } from "three";
import * as THREE from "three";
import { getPointsFromLine } from "./util";
export default class Measure {
  constructor(camera) {
    this.annotationDiv = null;
    this.line = null;
    this.plane = null;
    this.distance = null;
    this.camera = camera;
    this.point = null;
  }

  setFromPointAndPlane(point, plane) {
    this.plane = plane;
    this.point = point;
    const newPoint = new THREE.Vector3();
    this.plane.projectPoint(point, newPoint);
    this.distance = point.distanceTo(newPoint);
    const lineMaterial = new THREE.LineBasicMaterial({ color: "pink" });
    const geometry = new THREE.BufferGeometry().setFromPoints([
      point,
      newPoint,
    ]);
    this.line = new THREE.Line(geometry, lineMaterial);
    this.addAnnotation();
    this.updatePosition();
  }

  addAnnotation() {
    if (this.annotationDiv) {
      this.annotationDiv.innerHTML = this.distance;
      return;
    }
    this.annotationDiv = document.createElement("div");
    this.annotationDiv.className = "annotation";
    this.annotationDiv.innerHTML = this.distance;

    document.getElementById("canvas").appendChild(this.annotationDiv);
  }

  updateValue() {
    const newPoint = new THREE.Vector3();
    this.plane.projectPoint(this.point, newPoint);
    this.distance = this.point.distanceTo(newPoint);
    const positionAttribute = this.line.geometry.getAttribute("position");
    // Update the vertices of the line
    positionAttribute.setXYZ(0, this.point.x, this.point.y, this.point.z); // Update the start point
    positionAttribute.setXYZ(1, newPoint.x, newPoint.y, newPoint.z); // Update the end point
    positionAttribute.needsUpdate = true;
    this.addAnnotation();
    this.updatePosition();
  }

  // Update annotation position based on cube's position in the 3D scene
  updatePosition() {
    let renderWindow = document.getElementById("canvas");
    const rect = renderWindow.getBoundingClientRect();

    const linePosition = getPointsFromLine(this.line)[0];
    const vector = linePosition.project(this.camera);
    const x = ((vector.x + 1) / 2) * renderWindow.offsetWidth + rect.left;
    const y = (-(vector.y - 1) / 2) * renderWindow.offsetHeight + rect.top;
    this.annotationDiv.style.left = x + "px";
    this.annotationDiv.style.top = y + "px";
  }
}
