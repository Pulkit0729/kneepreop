import * as THREE from "three";

export class Sidebar extends THREE.EventDispatcher {
  constructor() {
    super();
    this.dom = document.getElementById("#sidebar_root");
    this.markers = {};
    this.axises = [];
    this.selectedLandmark = null;
    this.renderWindow = document.getElementById("canvas");
  }

  init() {
    this.initLandmarks();
    this.initVarus();
    this.initFlexion();
    this.initDistal();
  }

  initLandmarks() {
    let landmarks = [
      "Femur_Center",
      "Hip_Center",
      "Femur_Proximal_Canal",
      "Femur_Distal_Canal",
      "Medial_Epicondyle",
      "Lateral_Epicondyle",
      "Distal_Medial_Pt",
      "Distal_Lateral_Pt",
      "Posterior_Medial_Pt",
      "Posterior_Lateral_Pt",
    ];
    for (let i = 0; i < landmarks.length; i++) {
      let li = document.createElement("li");
      li.innerHTML = `<span>${landmarks[i]}</span>
      <button id=${landmarks[i]}>
        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M256 56c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m0-48C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 168c-44.183 0-80 35.817-80 80s35.817 80 80 80 80-35.817 80-80-35.817-80-80-80z" />
        </svg>
      </button>`;
      li.addEventListener("click", (e) => {
        if (this.selectedLandmark === landmarks[i]) {
          this.selectedLandmark = null;
          li.getElementsByTagName("button")[0].classList.remove("active");
        } else {
          if (this.selectedLandmark) {
            document
              .getElementById(this.selectedLandmark)
              .classList.remove("active");
          }

          this.selectedLandmark = landmarks[i];
          li.getElementsByTagName("button")[0].classList.add("active");
        }
        this.dispatchEvent({
          type: "landmark_clicked",
          data: { selectedLandmark: this.selectedLandmark },
        });
      });
      document.getElementById("landmark_list").append(li);
    }
    document.getElementById("submit").addEventListener("click", () => {
      if (Object.keys(this.markers).length === landmarks.length) {
        this.dispatchEvent({ type: "submit" });
      }
    });
  }

  initVarus() {
    let varusMinus = document.getElementById("varus-minus");
    let varusPlus = document.getElementById("varus-plus");
    let varusInput = document.getElementById("varus-input");
    varusInput.value = 3;

    varusMinus.addEventListener("click", () => {
      varusInput.value = parseInt(varusInput.value) - 1;

      this.dispatchEvent({
        type: "rotate",
        data: {
          plane: "varus",
          value: "minus",
        },
      });
    });
    varusPlus.addEventListener("click", () => {
      varusInput.value = parseInt(varusInput.value) + 1;

      this.dispatchEvent({
        type: "rotate",
        data: {
          plane: "varus",
          value: "plus",
        },
      });
    });
  }
  initFlexion() {
    let flexionMinus = document.getElementById("flexion-minus");
    let flexionPlus = document.getElementById("flexion-plus");
    let flexionInput = document.getElementById("flexion-input");
    flexionInput.value = 3;

    flexionMinus.addEventListener("click", () => {
      flexionInput.value = parseInt(flexionInput.value) - 1;

      this.dispatchEvent({
        type: "rotate",
        data: {
          plane: "flexion",
          value: "minus",
        },
      });
    });
    flexionPlus.addEventListener("click", () => {
      flexionInput.value = parseInt(flexionInput.value) + 1;

      this.dispatchEvent({
        type: "rotate",
        data: {
          plane: "flexion",
          value: "plus",
        },
      });
    });
  }
  initDistal() {
    let distalMinus = document.getElementById("distal-minus");
    let distalPlus = document.getElementById("distal-plus");
    let distalInput = document.getElementById("distal-input");
    distalInput.value = 10;

    distalMinus.addEventListener("click", () => {
      distalInput.value = parseInt(distalInput.value) - 1;

      this.dispatchEvent({
        type: "distal",
        data: {
          value: "minus",
        },
      });
    });
    distalPlus.addEventListener("click", () => {
      distalInput.value = parseInt(distalInput.value) + 1;

      this.dispatchEvent({
        type: "distal",
        data: {
          value: "plus",
        },
      });
    });
    let toggleResection = document.getElementById("toggle-resection");
    toggleResection.addEventListener("click", () => {
      this.dispatchEvent({
        type: "distal",
        data: {
          value: "toggle",
        },
      });
    });
  }
  addMarker(landmark, marker) {
    this.markers[landmark] = marker;
  }
  getVarusRotationValue() {
    let varusInput = document.getElementById("varus-input");
    return varusInput.value;
  }
  getFlexionRotationValue() {
    let flexionInput = document.getElementById("flexion-input");
    return flexionInput.value;
  }
  getDistalResectionValue() {
    let distalInput = document.getElementById("distal-input");
    return parseInt(distalInput.value);
  }
  isResect() {
    return document.getElementById("toggle-resection").checked;
  }
}
