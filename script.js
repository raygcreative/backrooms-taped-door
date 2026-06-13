/* Backrooms: Taped Door
   Three.js rebuild. The game is still static and GitHub Pages friendly, but
   the world is now real 3D geometry instead of a canvas raycaster. */

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const canvas = document.querySelector("#gameCanvas");
const startScreen = document.querySelector("#startScreen");
const pauseScreen = document.querySelector("#pauseScreen");
const endScreen = document.querySelector("#endScreen");
const startButton = document.querySelector("#startButton");
const resumeButton = document.querySelector("#resumeButton");
const soundButton = document.querySelector("#soundButton");
const pauseButton = document.querySelector("#pauseButton");
const homeButton = document.querySelector("#homeButton");
const statusText = document.querySelector("#statusText");
const distanceText = document.querySelector("#distanceText");
const locationText = document.querySelector("#locationText");
const message = document.querySelector("#message");
const endEyebrow = document.querySelector("#endEyebrow");
const endTitle = document.querySelector("#endTitle");
const endCopy = document.querySelector("#endCopy");
const overlayButtons = {
  start: [startButton],
  paused: [resumeButton, ...pauseScreen.querySelectorAll("[data-restart], [data-home]")],
  won: [...endScreen.querySelectorAll("[data-restart], [data-home]")],
  lost: [...endScreen.querySelectorAll("[data-restart], [data-home]")]
};

const CELL = 4;
const WALL_H = 3.2;
const PLAYER_SPEED = 7.2;
const TURN_SPEED = 2.8;
const keys = new Set();

// 0 = walkable, 1 = wall, 2 = exit trigger.
const map = [
  "1111111111111111111111111111111",
  "1000000011111000000000100000001",
  "1000000011111000000000100000001",
  "1000000000000000000000000000001",
  "1000000000000000000000000000001",
  "1000000000000000000000100000001",
  "1111111100000111111111100000001",
  "1000000000000111111111111111111",
  "1000000001000000000100000000001",
  "1000000001000000000100000000001",
  "1000000000000000000000100001001",
  "1000000001000000000000000000001",
  "1000000001000000000000000100001",
  "1111111100000000000100000000001",
  "1111111100000111111100100001001",
  "1000000000001111111100000000001",
  "1000000000001000000000111101111",
  "1000000000000000000000100000001",
  "1000000000001000000000000000001",
  "1000000011111000000000000000001",
  "1000000011111000000000100000001",
  "1000000011111000000000100000021",
  "1111111111111111111111111111111"
].map((row) => row.split(""));

const mapH = map.length;
const mapW = map[0].length;

const zones = [
  { id: "lobby", name: "Reception: green carpet", rect: [1, 1, 7, 5], wall: 0xb9b05f, floor: 0x536f45, ceiling: 0x80783d, accent: 0x2f4c32, light: 1.2 },
  { id: "records", name: "Records office: blue cabinets", rect: [13, 1, 21, 5], wall: 0x91a29a, floor: 0x536b70, ceiling: 0x687371, accent: 0x263f48, light: 1.05 },
  { id: "utility", name: "Utility room: gray pipes", rect: [23, 1, 29, 6], wall: 0x81806d, floor: 0x50564f, ceiling: 0x5b5d51, accent: 0xb6aa69, light: 0.72 },
  { id: "break", name: "Break room: teal walls", rect: [1, 7, 7, 12], wall: 0x78a18a, floor: 0x6f744b, ceiling: 0x5d7566, accent: 0xc5b35f, light: 1.12 },
  { id: "conference", name: "Conference room: brown table", rect: [10, 8, 18, 13], wall: 0xa77f69, floor: 0x6f513d, ceiling: 0x745d4c, accent: 0xd0bd78, light: 0.86 },
  { id: "atrium", name: "Open interior court", rect: [20, 8, 29, 15], wall: 0xc1ae68, floor: 0x82723d, ceiling: 0x766735, accent: 0xf1e49a, tall: true, light: 1.28 },
  { id: "offices", name: "Office pool: cubicles", rect: [1, 15, 7, 21], wall: 0xb7b36b, floor: 0x696f45, ceiling: 0x7a743d, accent: 0x4f5c34, light: 1.04 },
  { id: "storage", name: "Furniture storage: stacked chairs", rect: [13, 16, 21, 21], wall: 0x8e755a, floor: 0x6d583b, ceiling: 0x66513a, accent: 0xc09c62, light: 0.68 },
  { id: "exit", name: "Exit wing: taped outline", rect: [23, 17, 29, 21], wall: 0xb8ad5f, floor: 0x6f6337, ceiling: 0x776d3c, accent: 0x3e8fd3, light: 0.9 },
  { id: "spine", name: "Main yellow hallway", rect: [8, 3, 12, 18], wall: 0xb7ad60, floor: 0x817640, ceiling: 0x8d7f3c, accent: 0xefe68a, light: 1.18 }
];

const props = [
  { x: 2.4, y: 2.2, type: "receptionDesk" },
  { x: 5.7, y: 4.4, type: "plant" },
  { x: 15.1, y: 2.4, type: "fileCabinet" },
  { x: 18.3, y: 4.3, type: "fileCabinet" },
  { x: 20.3, y: 2.1, type: "copier" },
  { x: 24.2, y: 2.5, type: "pipes" },
  { x: 27.3, y: 5.0, type: "utilityShelf" },
  { x: 2.3, y: 8.3, type: "vending" },
  { x: 5.4, y: 10.8, type: "table" },
  { x: 12.8, y: 10.7, type: "conferenceTable" },
  { x: 16.6, y: 10.2, type: "chair" },
  { x: 22.4, y: 10.0, type: "plant" },
  { x: 27.2, y: 10.0, type: "bench" },
  { x: 25.0, y: 13.8, type: "fountain" },
  { x: 2.5, y: 16.2, type: "cubicle" },
  { x: 5.5, y: 19.2, type: "desk" },
  { x: 15.4, y: 17.4, type: "stack" },
  { x: 19.4, y: 20.2, type: "stack" },
  { x: 25.4, y: 18.5, type: "blueTapeRoll" },
  { x: 27.4, y: 20.5, type: "fileCabinet" }
];

const playerStart = { x: 2.4, y: 3.4, angle: Math.PI / 2 };
const exitTile = findTile("2");

let renderer;
let scene;
let camera;
let player;
let character;
let presence;
let gameState = "start";
let noticeTimer = 0;
let lastTime = performance.now();
let playerAngle = playerStart.angle;
let stepBob = 0;
let menuChoiceIndex = 0;

const audio = { ctx: null, enabled: false, master: null, hum: null, drone: null, stepTimer: 0 };

const materials = {};

function init() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.92;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x302e1b);
  scene.fog = new THREE.FogExp2(0x302d18, 0.0145);

  camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 220);
  scene.add(camera);
  const cameraFill = new THREE.PointLight(0xf0e6a7, 1.68, 20, 2);
  cameraFill.position.set(0, 1.4, 0);
  camera.add(cameraFill);

  makeMaterials();
  buildOffice();
  character = makeCharacter();
  scene.add(character);

  presence = makePresence();
  scene.add(presence.mesh);

  player = new THREE.Vector3();
  resetPlayer();
  updateHud();
  updateMenuSelection();
}

function makeMaterials() {
  materials.black = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
  materials.blueTape = new THREE.MeshStandardMaterial({ color: 0x2f8fd8, roughness: 0.55 });
  materials.light = new THREE.MeshStandardMaterial({ color: 0xf8f2ce, emissive: 0xf8f2ce, emissiveIntensity: 1.45 });
  materials.darkWood = new THREE.MeshStandardMaterial({ color: 0x4e321d, roughness: 0.8 });
  materials.wood = new THREE.MeshStandardMaterial({ color: 0x7a5732, roughness: 0.78 });
  materials.metal = new THREE.MeshStandardMaterial({ color: 0x8f9284, roughness: 0.55, metalness: 0.12 });
  materials.glass = new THREE.MeshStandardMaterial({ color: 0x9ac2b2, roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.45 });
  materials.screen = new THREE.MeshStandardMaterial({ color: 0x151812, emissive: 0x1b261a, emissiveIntensity: 0.4 });

  for (const zone of zones) {
    materials[`${zone.id}Floor`] = new THREE.MeshStandardMaterial({
      color: zone.floor,
      roughness: 0.92,
      map: makeCarpetTexture(zone.floor)
    });
    materials[`${zone.id}Wall`] = new THREE.MeshStandardMaterial({
      color: zone.wall,
      roughness: 0.86,
      map: makeWallTexture(zone.wall, zone.id)
    });
    materials[`${zone.id}Ceiling`] = new THREE.MeshStandardMaterial({
      color: zone.ceiling,
      roughness: 0.96,
      map: makeCeilingTexture(zone.ceiling)
    });
  }
}

function makeCanvasTexture(size, draw) {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = size;
  canvasTexture.height = size;
  const c = canvasTexture.getContext("2d");
  draw(c, size);
  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function makeWallTexture(color, zoneId) {
  return makeCanvasTexture(256, (c, size) => {
    const base = `#${color.toString(16).padStart(6, "0")}`;
    c.fillStyle = base;
    c.fillRect(0, 0, size, size);
    c.globalAlpha = zoneId === "spine" || zoneId === "lobby" ? 0.28 : 0.16;
    c.strokeStyle = "#eee58c";
    for (let x = 16; x < size; x += 36) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, size);
      c.stroke();
      c.beginPath();
      c.moveTo(x - 10, 26);
      c.lineTo(x + 6, 58);
      c.lineTo(x + 22, 26);
      c.stroke();
    }
    c.globalAlpha = 0.08;
    for (let i = 0; i < 900; i += 1) {
      c.fillStyle = Math.random() > 0.5 ? "#000" : "#fff";
      c.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }
  });
}

function makeCarpetTexture(color) {
  return makeCanvasTexture(256, (c, size) => {
    c.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    c.fillRect(0, 0, size, size);
    for (let i = 0; i < 1900; i += 1) {
      c.globalAlpha = 0.08 + Math.random() * 0.12;
      c.fillStyle = Math.random() > 0.5 ? "#211e13" : "#d3c36d";
      const x = Math.random() * size;
      const y = Math.random() * size;
      c.fillRect(x, y, 1 + Math.random() * 5, 1);
    }
  });
}

function makeCeilingTexture(color) {
  return makeCanvasTexture(256, (c, size) => {
    c.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    c.fillRect(0, 0, size, size);
    c.strokeStyle = "rgba(42,34,18,0.38)";
    c.lineWidth = 3;
    for (let x = 0; x <= size; x += 64) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, size);
      c.stroke();
    }
    for (let y = 0; y <= size; y += 64) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(size, y);
      c.stroke();
    }
    c.globalAlpha = 0.12;
    for (let i = 0; i < 700; i += 1) c.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  });
}

function buildOffice() {
  scene.add(new THREE.HemisphereLight(0xfff3bd, 0x38321c, 1.42));
  scene.add(new THREE.AmbientLight(0xbdb27d, 0.82));

  const wallGeo = new THREE.BoxGeometry(CELL, WALL_H, CELL);
  const floorGeo = new THREE.PlaneGeometry(CELL, CELL);
  const ceilingGeo = new THREE.PlaneGeometry(CELL, CELL);

  for (let y = 0; y < mapH; y += 1) {
    for (let x = 0; x < mapW; x += 1) {
      const cell = map[y][x];
      const pos = tileToWorld(x + 0.5, y + 0.5);
      const zone = zoneAtTile(x + 0.5, y + 0.5);
      if (cell === "1") {
        const wall = new THREE.Mesh(wallGeo, materials[`${zone.id}Wall`] || materials.spineWall);
        wall.position.set(pos.x, WALL_H / 2, pos.z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
      } else {
        const floor = new THREE.Mesh(floorGeo, materials[`${zone.id}Floor`]);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(pos.x, 0, pos.z);
        floor.receiveShadow = true;
        scene.add(floor);

        const ceilingHeight = zone.tall ? WALL_H * 2.05 : WALL_H;
        const ceiling = new THREE.Mesh(ceilingGeo, materials[`${zone.id}Ceiling`]);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(pos.x, ceilingHeight, pos.z);
        scene.add(ceiling);

        if ((x + y) % 5 === 0) addFluorescentLight(pos.x, ceilingHeight - 0.05, pos.z, zone);
      }
    }
  }

  addRoomLandmarks();
  props.forEach((prop) => scene.add(makeProp(prop)));
  addTapeExit();
}

function addFluorescentLight(x, y, z, zone) {
  const fixture = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.48), materials.light);
  fixture.position.set(x, y, z);
  scene.add(fixture);

  const roomLight = zone?.light ?? 1;
  const point = new THREE.PointLight(0xfff8ce, 1.62 * roomLight, 18, 2.0);
  point.position.set(x, y - 0.18, z);
  scene.add(point);
}

function addRoomLandmarks() {
  addAtriumRailings();
  addDoorLabel(8.2, 3.5, "MAIN HALL");
  addDoorLabel(13.1, 3.4, "RECORDS");
  addDoorLabel(23.2, 3.4, "UTILITY");
  addDoorLabel(7.1, 9.5, "BREAK");
  addDoorLabel(10.1, 10.5, "CONFERENCE");
  addDoorLabel(20.1, 11.4, "COURT");
  addDoorLabel(7.1, 17.2, "OFFICE POOL");
  addDoorLabel(13.1, 17.2, "STORAGE");
  addDoorLabel(23.1, 18.6, "EXIT WING");
}

function addDoorLabel(x, y, label) {
  const pos = tileToWorld(x, y);
  const group = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 0.1), new THREE.MeshStandardMaterial({ color: 0x3b2f1a, roughness: 0.8 }));
  frame.position.set(0, 1.3, 0);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.14), new THREE.MeshStandardMaterial({ color: 0xd8c56c, roughness: 0.5 }));
  sign.position.set(0, 2.15, -0.02);
  group.add(frame, sign);
  group.position.set(pos.x, 0, pos.z);
  group.rotation.y = Math.PI / 2;
  group.userData.label = label;
  scene.add(group);
}

function addAtriumRailings() {
  const railMat = new THREE.MeshStandardMaterial({ color: 0x2f2b1b, roughness: 0.65 });
  for (let level = 0; level < 3; level += 1) {
    const h = 4.1 + level * 1.15;
    const left = tileToWorld(20.5, 8.2 + level * 0.2);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(30, 0.08, 0.08), railMat);
    rail.position.set(left.x + 16, h, left.z);
    scene.add(rail);
  }
}

function addTapeExit() {
  const exitPos = tileToWorld(exitTile.x + 0.5, exitTile.y + 0.5);
  const group = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.9, 2.6), materials.exitWall);
  wall.position.set(0, 1.45, 0);
  group.add(wall);

  const tapeMat = materials.blueTape;
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.25, 0.08), tapeMat);
  const right = left.clone();
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.35), tapeMat);
  const bottom = top.clone();
  left.position.set(-0.11, 1.42, -0.68);
  right.position.set(-0.11, 1.42, 0.68);
  top.position.set(-0.11, 2.52, 0);
  bottom.position.set(-0.11, 0.32, 0);
  group.add(left, right, top, bottom);

  group.position.set(exitPos.x + CELL / 2 - 0.08, 0, exitPos.z);
  scene.add(group);
}

function makeProp(prop) {
  const group = new THREE.Group();
  const pos = tileToWorld(prop.x, prop.y);
  group.position.set(pos.x, 0, pos.z);

  const box = (sx, sy, sz, mat, px = 0, py = sy / 2, pz = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    mesh.position.set(px, py, pz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  const cyl = (r, h, mat, px = 0, py = h / 2, pz = 0) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), mat);
    mesh.position.set(px, py, pz);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };

  if (prop.type === "receptionDesk") {
    box(3.6, 1.05, 1.1, materials.wood);
    box(1.1, 0.48, 0.12, materials.screen, 0, 1.4, -0.25);
  } else if (prop.type === "fileCabinet") {
    box(1.0, 1.8, 0.8, materials.metal);
    box(0.72, 0.06, 0.04, materials.darkWood, 0, 1.25, -0.42);
    box(0.72, 0.06, 0.04, materials.darkWood, 0, 0.75, -0.42);
  } else if (prop.type === "copier") {
    box(1.45, 1.0, 1.2, materials.metal);
    box(1.2, 0.28, 0.9, materials.screen, 0, 1.12, 0);
  } else if (prop.type === "pipes") {
    for (let i = -1; i <= 1; i += 1) {
      const pipe = cyl(0.07, 2.5, materials.metal, i * 0.25, 1.25, 0);
      pipe.rotation.z = 0.08 * i;
    }
  } else if (prop.type === "utilityShelf") {
    box(1.8, 0.12, 0.65, materials.darkWood, 0, 0.5, 0);
    box(1.8, 0.12, 0.65, materials.darkWood, 0, 1.1, 0);
    box(1.8, 0.12, 0.65, materials.darkWood, 0, 1.7, 0);
    box(0.45, 0.38, 0.45, materials.metal, -0.4, 0.8, 0);
  } else if (prop.type === "vending") {
    box(1.25, 2.25, 0.75, new THREE.MeshStandardMaterial({ color: 0x395649, roughness: 0.55 }));
    box(0.55, 1.1, 0.05, materials.screen, -0.2, 1.25, -0.4);
  } else if (prop.type === "table") {
    box(1.9, 0.16, 1.1, materials.wood, 0, 0.82, 0);
    box(0.12, 0.8, 0.12, materials.darkWood, -0.75, 0.4, -0.4);
    box(0.12, 0.8, 0.12, materials.darkWood, 0.75, 0.4, 0.4);
  } else if (prop.type === "conferenceTable") {
    box(3.8, 0.2, 1.35, materials.darkWood, 0, 0.82, 0);
    box(0.25, 0.8, 0.5, materials.darkWood, -1.25, 0.4, 0);
    box(0.25, 0.8, 0.5, materials.darkWood, 1.25, 0.4, 0);
  } else if (prop.type === "chair") {
    box(0.75, 0.14, 0.7, materials.wood, 0, 0.58, 0);
    box(0.75, 0.9, 0.12, materials.wood, 0, 1.05, 0.33);
  } else if (prop.type === "plant") {
    cyl(0.32, 0.55, materials.darkWood);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 10), new THREE.MeshStandardMaterial({ color: 0x35502e, roughness: 0.9 }));
    leaves.scale.set(1, 0.65, 1);
    leaves.position.y = 1.1;
    leaves.castShadow = true;
    group.add(leaves);
  } else if (prop.type === "bench") {
    box(2.3, 0.18, 0.55, materials.wood, 0, 0.62, 0);
    box(2.3, 0.75, 0.14, materials.darkWood, 0, 1.0, 0.26);
  } else if (prop.type === "fountain") {
    cyl(1.0, 0.35, materials.metal, 0, 0.18, 0);
    cyl(0.55, 0.28, materials.glass, 0, 0.52, 0);
    const water = new THREE.PointLight(0x9ad7ff, 0.45, 7);
    water.position.set(0, 1.2, 0);
    group.add(water);
  } else if (prop.type === "cubicle") {
    box(2.2, 1.15, 0.12, new THREE.MeshStandardMaterial({ color: 0x677553, roughness: 0.9 }), 0, 0.75, -0.75);
    box(0.12, 1.15, 1.55, new THREE.MeshStandardMaterial({ color: 0x677553, roughness: 0.9 }), -1.05, 0.75, 0);
    box(1.1, 0.15, 0.65, materials.wood, 0.2, 0.72, 0.15);
  } else if (prop.type === "desk") {
    box(1.8, 0.18, 0.9, materials.wood, 0, 0.82, 0);
    box(0.22, 0.8, 0.22, materials.darkWood, -0.65, 0.4, -0.25);
    box(0.22, 0.8, 0.22, materials.darkWood, 0.65, 0.4, 0.25);
  } else if (prop.type === "stack") {
    box(1.6, 0.85, 1.25, materials.wood, 0, 0.45, 0);
    const chair = makeProp({ x: 0, y: 0, type: "chair" });
    chair.position.set(0.25, 1.0, 0);
    chair.rotation.z = -0.35;
    group.add(chair);
  } else if (prop.type === "blueTapeRoll") {
    const roll = cyl(0.35, 0.24, materials.blueTape, 0, 0.2, 0);
    roll.rotation.x = Math.PI / 2;
  }

  group.rotation.y = ((prop.x * 17 + prop.y * 11) % 8) * Math.PI / 8;
  return group;
}

function makeCharacter() {
  const group = new THREE.Group();
  const jacket = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.15, 0.38), new THREE.MeshStandardMaterial({ color: 0x5b4f3d, roughness: 0.85 }));
  jacket.position.y = 1.05;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), new THREE.MeshStandardMaterial({ color: 0x15130f, roughness: 0.9 }));
  head.position.y = 1.82;
  const armGeo = new THREE.CapsuleGeometry(0.12, 0.8, 6, 12);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x26231b, roughness: 0.9 });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  const rightArm = leftArm.clone();
  leftArm.position.set(-0.55, 0.95, 0);
  rightArm.position.set(0.55, 0.95, 0);
  const legGeo = new THREE.CapsuleGeometry(0.13, 0.75, 6, 12);
  const leftLeg = new THREE.Mesh(legGeo, armMat);
  const rightLeg = leftLeg.clone();
  leftLeg.position.set(-0.22, 0.32, 0);
  rightLeg.position.set(0.22, 0.32, 0);
  group.add(jacket, head, leftArm, rightArm, leftLeg, rightLeg);
  group.traverse((child) => {
    if (child.isMesh) child.castShadow = true;
  });
  return group;
}

function makePresence() {
  const mesh = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x030201, roughness: 1 });
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0x161008, roughness: 1 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xf2e6a3, emissive: 0xf2e6a3, emissiveIntensity: 2.4, roughness: 0.3 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 2.25, 6, 12), mat);
  body.position.set(0, 1.8, 0);
  body.rotation.z = -0.18;

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.9, 0.18), tapeMat);
  chest.position.set(-0.04, 1.72, 0);
  chest.rotation.z = -0.2;
  chest.userData.baseRotation = chest.rotation.clone();

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 12), mat);
  head.scale.set(1.55, 0.46, 0.72);
  head.position.set(-0.17, 3.15, 0);
  head.rotation.z = 0.12;
  head.userData.baseRotation = head.rotation.clone();

  const eye = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.035, 0.035), eyeMat);
  eye.position.set(-0.18, 3.17, -0.27);
  const eye2 = eye.clone();
  eye2.position.x += 0.32;

  mesh.add(body, chest, head, eye, eye2);

  const twitchParts = [head, chest];
  const limb = (from, to, radius = 0.035) => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dir = end.clone().sub(start);
    const part = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.72, dir.length(), 8), mat);
    part.position.copy(mid);
    part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    part.userData.baseQuaternion = part.quaternion.clone();
    part.castShadow = true;
    mesh.add(part);
    twitchParts.push(part);
    return part;
  };

  // Uneven, too-long limbs: more like a torn shadow leaning out from a corner.
  limb([-0.22, 2.45, 0], [-1.0, 1.35, -0.12], 0.036);
  limb([-1.0, 1.35, -0.12], [-0.82, 0.16, -0.34], 0.024);
  limb([0.18, 2.32, 0], [0.86, 1.42, 0.12], 0.032);
  limb([0.86, 1.42, 0.12], [1.22, 0.34, -0.08], 0.022);
  limb([-0.1, 0.86, 0], [-0.64, 0.02, -0.22], 0.032);
  limb([0.18, 0.86, 0], [0.52, 0.02, 0.2], 0.03);
  limb([-0.08, 2.88, 0], [-0.72, 3.34, -0.06], 0.018);
  limb([0.1, 2.86, 0], [0.72, 3.25, 0.02], 0.016);
  limb([-0.03, 2.08, 0], [-0.95, 2.28, 0.04], 0.018);

  const eyeLight = new THREE.PointLight(0xf2e6a3, 0.7, 5, 2);
  eyeLight.position.set(0, 3.1, -0.35);
  mesh.add(eyeLight);

  mesh.visible = false;
  const start = tileToWorld(27.5, 19.5);
  mesh.position.set(start.x, 0, start.z);
  return { mesh, visible: false, stalking: false, blink: 4, chill: 18, speed: 2.05, twitchParts, eyeLight };
}

function resetPlayer() {
  const start = tileToWorld(playerStart.x, playerStart.y);
  player.set(start.x, 0, start.z);
  playerAngle = playerStart.angle;
  character.position.copy(player);
  character.rotation.y = playerAngle;
  const p = tileToWorld(27.5, 19.5);
  presence.mesh.position.set(p.x, 0, p.z);
  presence.visible = false;
  presence.stalking = false;
  presence.blink = 4;
  presence.chill = 18;
}

function resetGame() {
  keys.clear();
  resetPlayer();
  notice("The lights remember your footsteps.");
  setState("playing");
}

function setState(next) {
  gameState = next;
  startScreen.classList.toggle("hidden", next !== "start");
  pauseScreen.classList.toggle("hidden", next !== "paused");
  endScreen.classList.toggle("hidden", next !== "won" && next !== "lost");
  if (next === "playing") statusText.textContent = "Find the exit";
  menuChoiceIndex = 0;
  updateMenuSelection();
}

function goHome() {
  setState("start");
  keys.clear();
  statusText.textContent = "Find the exit";
  distanceText.textContent = "Exit: -- m";
  locationText.textContent = "Lobby threshold";
  message.classList.add("hidden");
}

function togglePause() {
  if (gameState === "playing") setState("paused");
  else if (gameState === "paused") setState("playing");
}

function notice(text) {
  message.textContent = text;
  message.classList.remove("hidden");
  noticeTimer = 3.2;
}

function update(dt) {
  if (gameState !== "playing") return;

  const turn = (keys.has("arrowleft") || keys.has("a") ? 1 : 0) + (keys.has("arrowright") || keys.has("d") ? -1 : 0);
  const forward = (keys.has("arrowup") || keys.has("w") ? 1 : 0) + (keys.has("arrowdown") || keys.has("s") ? -1 : 0);
  const strafe = (keys.has("e") ? 1 : 0) + (keys.has("q") ? -1 : 0);
  playerAngle += turn * TURN_SPEED * dt;

  const forwardVec = new THREE.Vector3(Math.sin(playerAngle), 0, Math.cos(playerAngle));
  const sideVec = new THREE.Vector3(Math.cos(playerAngle), 0, -Math.sin(playerAngle));
  const move = forwardVec.multiplyScalar(forward).add(sideVec.multiplyScalar(strafe));
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(PLAYER_SPEED * dt);
    tryMove(move.x, move.z);
    stepBob += dt * 9;
    playFootstep(dt);
  } else {
    stepBob += dt * 2;
  }

  character.position.copy(player);
  character.rotation.y = playerAngle;
  character.position.y = Math.sin(stepBob) * 0.035;

  updatePresence(dt);
  updateCamera(dt);
  updateHud();

  if (worldDistance(player, tileToWorld(exitTile.x + 0.5, exitTile.y + 0.5)) < 2.25) finish(true);
  if (worldDistance(player, presence.mesh.position) < 1.15) finish(false);

  if (noticeTimer > 0) {
    noticeTimer -= dt;
    if (noticeTimer <= 0) message.classList.add("hidden");
  }
}

function tryMove(dx, dz) {
  const nextX = player.x + dx;
  const nextZ = player.z + dz;
  if (!isWallWorld(nextX, player.z)) player.x = nextX;
  if (!isWallWorld(player.x, nextZ)) player.z = nextZ;
}

function updateCamera(dt) {
  const behind = new THREE.Vector3(-Math.sin(playerAngle) * 5.6, 3.0, -Math.cos(playerAngle) * 5.6);
  const desired = player.clone().add(behind);
  camera.position.lerp(desired, 1 - Math.pow(0.001, dt));
  const lookAt = player.clone().add(new THREE.Vector3(Math.sin(playerAngle) * 2.2, 1.25, Math.cos(playerAngle) * 2.2));
  camera.lookAt(lookAt);
}

function updatePresence(dt) {
  presence.chill -= dt;
  if (presence.chill <= 0) presence.stalking = true;
  presence.blink -= dt;
  if (presence.blink <= 0) {
    presence.visible = !presence.visible;
    presence.mesh.visible = presence.visible;
    presence.blink = presence.visible ? 1.6 + Math.random() * 1.3 : 3.5 + Math.random() * 4;
    if (presence.visible && worldDistance(player, presence.mesh.position) > 13) notice("Something is standing beyond the office glass.");
  }
  if (!presence.stalking) {
    animatePresence();
    return;
  }

  const direction = player.clone().sub(presence.mesh.position);
  direction.y = 0;
  if (direction.lengthSq() === 0) return;
  direction.normalize().multiplyScalar(presence.speed * dt);
  const next = presence.mesh.position.clone().add(direction);
  if (!isWallWorld(next.x, presence.mesh.position.z)) presence.mesh.position.x = next.x;
  if (!isWallWorld(presence.mesh.position.x, next.z)) presence.mesh.position.z = next.z;
  presence.mesh.lookAt(player.x, 0, player.z);
  presence.mesh.visible = presence.visible || worldDistance(player, presence.mesh.position) < 16;
  animatePresence();
}

function animatePresence() {
  if (!presence.mesh.visible) return;
  const t = performance.now() * 0.006;
  presence.twitchParts.forEach((part, index) => {
    if (part.userData.baseQuaternion) {
      part.quaternion.copy(part.userData.baseQuaternion);
      part.rotateX(Math.sin(t + index * 1.7) * 0.08);
      part.rotateZ(Math.cos(t * 1.3 + index) * 0.05);
    } else if (part.userData.baseRotation) {
      part.rotation.copy(part.userData.baseRotation);
      part.rotation.x += Math.sin(t + index * 1.7) * 0.06;
      part.rotation.z += Math.cos(t * 1.3 + index) * 0.05;
    }
  });
  presence.eyeLight.intensity = 0.45 + Math.sin(t * 3.5) * 0.2;
}

function updateHud() {
  const exitWorld = tileToWorld(exitTile.x + 0.5, exitTile.y + 0.5);
  distanceText.textContent = `Exit: ${Math.round(worldDistance(player, exitWorld))} m`;
  locationText.textContent = currentZone().name;
  if (presence.stalking) statusText.textContent = "It is following";
}

function finish(won) {
  keys.clear();
  setState(won ? "won" : "lost");
  endEyebrow.textContent = won ? "Tape outline found" : "Too late";
  endTitle.textContent = won ? "The wall opened." : "The office caught up.";
  endCopy.textContent = won ? "The blue tape peels away like it was never stuck there." : "There was no scream, only fluorescent buzzing.";
  updateMenuSelection();
}

function activeOverlayButtons() {
  return overlayButtons[gameState] || [];
}

function updateMenuSelection() {
  Object.values(overlayButtons).flat().forEach((button) => button.classList.remove("keyboard-selected"));
  const buttons = activeOverlayButtons().filter((button) => !button.closest(".hidden"));
  if (buttons.length === 0) return;
  menuChoiceIndex = (menuChoiceIndex + buttons.length) % buttons.length;
  buttons[menuChoiceIndex].classList.add("keyboard-selected");
  buttons[menuChoiceIndex].focus({ preventScroll: true });
}

function handleOverlayKey(key, event) {
  const buttons = activeOverlayButtons().filter((button) => !button.closest(".hidden"));
  if (buttons.length === 0) return false;

  if (key === "arrowright" || key === "arrowdown") {
    event.preventDefault();
    menuChoiceIndex = (menuChoiceIndex + 1) % buttons.length;
    updateMenuSelection();
    return true;
  }
  if (key === "arrowleft" || key === "arrowup") {
    event.preventDefault();
    menuChoiceIndex = (menuChoiceIndex - 1 + buttons.length) % buttons.length;
    updateMenuSelection();
    return true;
  }
  if (key === "enter" || key === " ") {
    event.preventDefault();
    buttons[menuChoiceIndex]?.click();
    return true;
  }
  if (key === "escape" && gameState === "paused") {
    event.preventDefault();
    setState("playing");
    return true;
  }
  return false;
}

function render(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function findTile(tile) {
  for (let y = 0; y < mapH; y += 1) {
    for (let x = 0; x < mapW; x += 1) {
      if (map[y][x] === tile) return { x, y };
    }
  }
  return { x: 1, y: 1 };
}

function tileToWorld(x, y) {
  return new THREE.Vector3((x - mapW / 2) * CELL, 0, (y - mapH / 2) * CELL);
}

function worldToTile(x, z) {
  return { x: Math.floor(x / CELL + mapW / 2), y: Math.floor(z / CELL + mapH / 2) };
}

function isWallWorld(x, z) {
  const tile = worldToTile(x, z);
  const cell = map[tile.y]?.[tile.x];
  return cell === undefined || cell === "1";
}

function zoneAtTile(x, y) {
  return zones.find((zone) => {
    const [x1, y1, x2, y2] = zone.rect;
    return x >= x1 && x <= x2 && y >= y1 && y <= y2;
  }) || zones.find((zone) => zone.id === "spine");
}

function currentZone() {
  const tile = worldToTile(player.x, player.z);
  return zoneAtTile(tile.x + 0.5, tile.y + 0.5);
}

function worldDistance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function ensureAudio() {
  if (audio.ctx) return;
  const AudioClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioClass) {
    notice("This browser does not support Web Audio.");
    return;
  }
  audio.ctx = new AudioClass();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = 0;
  audio.master.connect(audio.ctx.destination);
  audio.hum = audio.ctx.createOscillator();
  audio.drone = audio.ctx.createOscillator();
  const humGain = audio.ctx.createGain();
  const droneGain = audio.ctx.createGain();
  audio.hum.type = "sawtooth";
  audio.hum.frequency.value = 58;
  audio.drone.type = "sine";
  audio.drone.frequency.value = 116;
  humGain.gain.value = 0.34;
  droneGain.gain.value = 0.16;
  audio.hum.connect(humGain).connect(audio.master);
  audio.drone.connect(droneGain).connect(audio.master);
  audio.hum.start();
  audio.drone.start();
}

function toggleSound() {
  ensureAudio();
  if (!audio.ctx || !audio.master) return;
  audio.enabled = !audio.enabled;
  audio.ctx.resume();
  const now = audio.ctx.currentTime;
  audio.master.gain.cancelScheduledValues(now);
  audio.master.gain.setValueAtTime(audio.master.gain.value, now);
  audio.master.gain.linearRampToValueAtTime(audio.enabled ? 0.11 : 0, now + 0.12);
  soundButton.textContent = audio.enabled ? "Sound on" : "Sound off";
  soundButton.setAttribute("aria-pressed", String(audio.enabled));
  notice(audio.enabled ? "Sound on: fluorescent hum active." : "Sound off.");
}

function playFootstep(dt) {
  if (!audio.enabled || !audio.ctx) return;
  audio.stepTimer -= dt;
  if (audio.stepTimer > 0) return;
  audio.stepTimer = 0.38;
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 70 + Math.random() * 22;
  gain.gain.setValueAtTime(0.08, audio.ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.ctx.currentTime + 0.08);
  osc.connect(gain).connect(audio.master);
  osc.start();
  osc.stop(audio.ctx.currentTime + 0.09);
}

function onResize() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", onResize);
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (gameState !== "playing" && handleOverlayKey(key, event)) return;
  keys.add(key);
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
  if (key === "p" || key === "escape") togglePause();
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

startButton.addEventListener("click", resetGame);
resumeButton.addEventListener("click", () => setState("playing"));
pauseButton.addEventListener("click", togglePause);
homeButton.addEventListener("click", goHome);
soundButton.addEventListener("click", toggleSound);
document.querySelectorAll("[data-restart]").forEach((button) => button.addEventListener("click", resetGame));
document.querySelectorAll("[data-home]").forEach((button) => button.addEventListener("click", goHome));

init();
requestAnimationFrame(render);
