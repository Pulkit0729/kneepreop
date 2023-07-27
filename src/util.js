import * as THREE from "three";

export function createPlane(planeSize, color) {
  const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  return plane;
}

export function createLine(p1, p2, color) {
  const lineMaterial = new THREE.LineBasicMaterial({ color: color });
  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3().copy(p2).sub(new THREE.Vector3().copy(p1)));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, lineMaterial);
  line.position.copy(p1);
  return line;
}

export function projectLineOnPlane(line, plane) {
  const points = getPointsFromLine(line);
  const projectedLineStartPoint = new THREE.Vector3();
  const projectedLineEndPoint = new THREE.Vector3();
  const plane2 = new THREE.Plane();
  plane2.setFromNormalAndCoplanarPoint(
    getNormalFromPlane(plane),
    plane.position
  );
  plane2.projectPoint(points[0].add(line.position), projectedLineStartPoint);
  plane2.projectPoint(points[1].add(line.position), projectedLineEndPoint);

  console.log(points);
  const projectedLine = createLine(
    projectedLineStartPoint,
    projectedLineEndPoint,
    "green"
  );
  return projectedLine;
}

export function getPointsFromLine(line) {
  const positions = line.geometry.attributes.position.array;
  const points = [
    new THREE.Vector3(positions[0], positions[1], positions[2]),
    new THREE.Vector3(positions[3], positions[4], positions[5]),
  ];
  return points;
}

export function getVectorFromLine(line) {
  const points = getPointsFromLine(line);
  const vector = new THREE.Vector3()
    .subVectors(points[0], points[1])
    .normalize();
  return vector;
}

export function crossProduct(a, b) {
  let c = new THREE.Vector3();
  c.crossVectors(a, b).normalize();
  return c;
}

export function createPependicularPlane(p1, p2, color) {
  const plane = createPlane(100, color);
  plane.position.copy(p1);
  plane.lookAt(p2);
  return plane;
}

export function createCocurrentPerpendicularLine(l1, l2, p, length, color) {
  let lineDirection = crossProduct(l1, l2);
  const newPoint = p.clone().addScaledVector(lineDirection, length);
  let line = createLine(p, newPoint, color);
  return line;
}
export function getNormalFromPlane(mesh) {
  var normal = new THREE.Vector3();
  normal.set(0, 0, 1).applyQuaternion(mesh.quaternion);
  return normal;
}
