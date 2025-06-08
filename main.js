import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { loadModel, loadPlaneModel } from "./modelLoader.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

// 创建场景
const scene = new THREE.Scene();
// 设置深蓝色渐变背景
const canvas = document.createElement("canvas");
canvas.width = 32;
canvas.height = 512;
const ctx = canvas.getContext("2d");
const gradient = ctx.createLinearGradient(0, 0, 0, 512);
gradient.addColorStop(0, "#162447"); // 顶部深蓝
gradient.addColorStop(1, "#0a1833"); // 底部更深蓝
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 32, 512);
const bgTexture = new THREE.CanvasTexture(canvas);
scene.background = bgTexture;

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
// 设置设备像素比，提高渲染质量
renderer.setPixelRatio(window.devicePixelRatio);
// 启用更高质量的阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// 启用更高质量的纹理过滤
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

// 创建CSS2D渲染器
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
labelRenderer.domElement.style.pointerEvents = "none";
document.body.appendChild(labelRenderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 动画混合器变量
let mixer = null;

// ====== 创建CSS2D标签 ======
let leftLabel, rightLabel, leftAnchorRef, rightAnchorRef;

// 全局变量保存数据
let serviceName = "";
let protectorData = [];
let warmData = [];

// 顶部标题组件（支持动态serviceName）
function createTopTitle(name) {
  let div = document.getElementById("top-title-bar");
  if (!div) {
    div = document.createElement("div");
    div.id = "top-title-bar";
    div.style.position = "fixed";
    div.style.top = "32px";
    div.style.left = "50%";
    div.style.transform = "translateX(-50%)";
    div.style.zIndex = "9999";
    div.style.display = "flex";
    div.style.alignItems = "center";

    document.body.appendChild(div);
  } else {
    div.innerHTML = "";
  }
  // 绿色圆点
  const dot = document.createElement("span");
  dot.style.display = "inline-block";
  dot.style.width = "16px";
  dot.style.height = "16px";
  dot.style.borderRadius = "50%";
  dot.style.background = "#2FC060";
  dot.style.marginRight = "12px";
  dot.style.border = "2px solid #2fc06040;";
  dot.style.margin = "0 auto";
  const dot2 = document.createElement("span");

  dot2.style.flexShrink = 0;
  dot2.style.aspectRatio = "1/1";
  dot2.style.borderRadius = "20px";
  dot2.style.background = "#2fc06040";
  dot2.style.width = "24px";
  dot2.style.display = "flex";
  dot2.style.alignItems = "center";
  dot2.style.justifyContent = "center";
  dot2.style.marginRight = "4px";
  div.appendChild(dot2);
  dot2.appendChild(dot);
  // 标题文字
  const text = document.createElement("span");
  text.textContent = name || "电动机P0410";
  text.style.fontSize = "20px";
  text.style.color = "#fff";
  text.style.letterSpacing = "1px";
  text.style.marginRight = "16px";
  div.appendChild(text);
  // 右侧icon
}

// 生成表格HTML（支持传入数据）
function createLabel(title, dataArr) {
  const div = document.createElement("div");
  div.className = "label";
  div.style.position = "relative";
  div.style.background = "none";
  div.style.color = "#fff";
  div.style.padding = "0";
  div.style.borderRadius = "6px 6px 0 0";
  div.style.fontSize = "14px";
  div.style.fontWeight = "bold";
  div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  div.style.pointerEvents = "auto";
  div.style.minWidth = "278px";
  div.innerHTML = `
    <div style="display: flex; align-items: center;">
      <!-- 勾选框部分 -->
      <div style="
        width: 32px;
        height: 32px;
        border: 1px solid #2FDAFF;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 4px;
        box-sizing: border-box;
      ">
        <div style="
          width: 14px;
          height: 14px;
          background: #2FDAFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

        ">
          <!-- SVG对勾 -->
          <svg width="12" height="12" viewBox="0 0 16 16">
            <polyline points="3,9 7,13 13,5" style="fill:none;stroke:white;stroke-width:2"/>
          </svg>
        </div>
      </div>
      <!-- 标题部分 -->
      <div style="flex:1;display:flex;width: 237px;\nheight: 32px;\nline-height: 32px;\npadding-left: 12px;\nflex-shrink: 0;\nborder: 1px solid #2fdaff80;\nbackground: linear-gradient(90deg, #2fdaff00 0%, #2FDAFF 100%);">
        <span style="\n        color: #ffffff;\n        font-family: 'Source Han Sans CN';\n        font-size: 14px;\n        font-style: normal;\n        font-weight: 700;\n        line-height: 32px;\n        letter-spacing: 2px;\n        ">${title}</span>
      </div>
    </div>
    <table style=\"margin-top: 4px;width:100%;border-collapse:collapse;background:#232a32;border-radius:0 0 6px 6px;border:1px solid #3a4a5a;box-sizing:border-box;max-height:320px;overflow-y:auto;display:block;\">
      <style>
        .ellipsis {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          display: inline-block;
        }
      </style>
      <tbody style=\"display:block;max-height:320px;overflow-y:auto;\">
        ${
          dataArr && dataArr.length > 0
            ? dataArr
                .map(
                  (item, idx) => `
          <tr style=\"border-bottom:1px solid #3a4a5a;\">
            <td style=\"padding:8px 6px;color:#fff;font-size:12px;width:182px;min-width:182px;max-width:182px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\" title=\"${
              item.name || item.code
            }\">
              <span style=\"color:#1ecfff;\">▪</span> ${item.name || item.code}
            </td>
            <td style=\"text-align:right;padding:8px 6px;font-weight:bold;color:${
              item.color
            };font-size:12px;border-left:1px solid #3a4a5a;width:78px;min-width:78px;max-width:78px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\" title=\"${
                    item.value ?? ""
                  }\">
              ${item.value ?? ""}
            </td>
          </tr>
        `
                )
                .join("")
            : '<tr><td style="padding:8px 6px;color:#fff;font-size:12px;width:182px;min-width:182px;max-width:182px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">暂无数据</td><td style="text-align:right;padding:8px 6px;font-weight:bold;color:#fff;font-size:12px;border-left:1px solid #3a4a5a;width:78px;min-width:78px;max-width:78px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></td></tr>'
        }
      </tbody>
    </table>
  `;
  return div;
}

function renderLabels() {
  // 左侧标签
  if (leftLabel) {
    scene.remove(leftLabel);
    if (leftLabel.element && leftLabel.element.parentNode) {
      leftLabel.element.parentNode.removeChild(leftLabel.element);
    }
    leftLabel = null;
  }
  leftLabel = new CSS2DObject(createLabel("保护器终端数据", protectorData));
  leftLabel.position.set(-3.2, 2.8, 1);
  leftLabel.center.set(0.5, 1);
  scene.add(leftLabel);

  // 右侧标签
  if (rightLabel) {
    scene.remove(rightLabel);
    if (rightLabel.element && rightLabel.element.parentNode) {
      rightLabel.element.parentNode.removeChild(rightLabel.element);
    }
    rightLabel = null;
  }
  rightLabel = new CSS2DObject(createLabel("温振终端数据", warmData));
  rightLabel.position.set(1.68, 2.8, 0);
  rightLabel.center.set(0.5, 1);
  scene.add(rightLabel);
}

// 消息监听
window.addEventListener("message", (event) => {
  const { cmd, params } = event.data || {};
  if (cmd === "init" && params) {
    serviceName = params.serviceName || "";
    protectorData = params.protector || [];
    warmData = params.warm || [];
    createTopTitle(serviceName);
    renderLabels();
  }
});

// 页面初始化时渲染默认内容
createTopTitle("");
renderLabels();

// 加载模型并设置控制器
loadModel(scene)
  .then(
    ({
      model,
      boundingBox,
      center,
      size,
      radius,
      cameraPosition,
      mixer: loadedMixer,
      leftAnchor,
      rightAnchor,
    }) => {
      // 将中心点向上移动 4 个单位
      center.y += 2;
      controls.target.copy(center);

      // 将相机位置也相应上移
      cameraPosition.y += 2;
      camera.position.copy(cameraPosition);
      camera.lookAt(center);
      controls.minDistance = camera.position.distanceTo(center);
      controls.maxDistance = camera.position.distanceTo(center) + 1.2;
      controls.update();

      // 坐标轴辅助也相应上移
      const axesHelper = new THREE.AxesHelper(2);
      axesHelper.position.copy(center);
      scene.add(axesHelper);
      // 保存动画混合器
      mixer = loadedMixer;

      // 保存锚点引用
      leftAnchorRef = leftAnchor;
      rightAnchorRef = rightAnchor;

      // ====== 画线连接锚点和标签（折线+直线） ======
      function createPolyline(points) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x1ecfff,
          linewidth: 2,
        });
        return new THREE.Line(geometry, material);
      }

      // 圆圈标记
      function createCircleMarker(
        position,
        radius = 0.04,
        color = new THREE.Color(0.2, 0.6, 1),
        outline = true
      ) {
        const group = new THREE.Group();
        // 白色描边
        if (outline) {
          const outlineGeo = new THREE.CircleGeometry(radius * 1.4, 32);
          const outlineMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.85,
          });
          const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);
          outlineMesh.position.set(0, 0, 0.001); // 防止z冲突
          group.add(outlineMesh);
        }
        // 主体
        const geometry = new THREE.CircleGeometry(radius, 32);
        const material = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 1,
        });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        group.position.copy(position);
        return group;
      }

      // 左侧折线
      const start1 = new THREE.Vector3(-1.25, 1.478, 0.313);
      const bend1 = new THREE.Vector3(-3.2, 1.878, 1);
      const end1 = new THREE.Vector3(-3.2, 2.8, 1);
      scene.add(createPolyline([start1, bend1, end1]));
      scene.add(createCircleMarker(start1));
      scene.add(createCircleMarker(end1));

      // 右侧直线
      const start2 = new THREE.Vector3(1.649, 1.492, -0.142);
      const end2 = new THREE.Vector3(1.68, 2.8, 0);
      scene.add(createPolyline([start2, end2]));
      scene.add(createCircleMarker(start2));
      scene.add(createCircleMarker(end2));

      console.log("Model, labels and controls setup complete");
    }
  )
  .catch((error) => {
    console.error("Failed to setup model and controls:", error);
  });
loadPlaneModel(scene);

// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(ambientLight);
// 添加平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (mixer) {
    mixer.update(0.016);
  }
  // 让所有圆圈面向相机
  scene.traverse((obj) => {
    if (
      obj.type === "Group" &&
      obj.children.length > 0 &&
      obj.children[0].geometry &&
      obj.children[0].geometry.type === "CircleGeometry"
    ) {
      obj.lookAt(camera.position);
    }
  });
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
});

animate();
