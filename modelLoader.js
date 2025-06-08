import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export function loadModel(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    // 创建 DRACOLoader 实例
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );

    // 将 DRACOLoader 实例设置给 GLTFLoader
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "./service.glb", // 模型路径
      function (gltf) {
        const model = gltf.scene;

        // 计算模型的包围盒
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // 计算包围盒的半径（最大维度的一半）
        const radius = Math.max(size.x, size.y, size.z) / 2;

        // 计算相机位置（中心点 + 10米）
        const cameraOffset = new THREE.Vector3(1, 1, 1)
          .normalize()
          .multiplyScalar(10);
        const cameraPosition = center.clone().add(cameraOffset);

        // 自动播放动画
        let mixer = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }

        // 恢复原始材质，确保模型正常显示
        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = true;
          }
        });

        // 计算左右两端锚点
        const leftAnchor = center
          .clone()
          .add(new THREE.Vector3(-size.x / 2, 0, 0));
        const rightAnchor = center
          .clone()
          .add(new THREE.Vector3(size.x / 2, 0, 0));

        // 将模型添加到场景
        scene.add(model);

        // 返回模型信息
        resolve({
          model: model,
          boundingBox: box,
          center: center, // 包围盒中心
          size: size, // 包围盒大小
          radius: radius, // 包围盒半径
          cameraPosition: cameraPosition, // 建议的相机位置
          mixer: mixer, // 返回动画混合器
          leftAnchor: leftAnchor, // 左锚点
          rightAnchor: rightAnchor, // 右锚点
        });
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.error("加载模型时出错:", error);
        reject(error);
      }
    );
  });
}

export function loadPlaneModel(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    // 创建 DRACOLoader 实例
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );

    // 将 DRACOLoader 实例设置给 GLTFLoader
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "./plane.glb", // 飞机模型路径
      function (gltf) {
        const model = gltf.scene;

        // 计算模型的包围盒
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // 计算包围盒的半径（最大维度的一半）
        const radius = Math.max(size.x, size.y, size.z) / 2;

        // 计算相机位置（中心点 + 10米）
        const cameraOffset = new THREE.Vector3(1, 1, 1)
          .normalize()
          .multiplyScalar(10);
        const cameraPosition = center.clone().add(cameraOffset);

        // 自动播放动画
        let mixer = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }

        // 恢复原始材质，确保模型正常显示
        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = true;
          }
        });

        // 计算左右两端锚点
        const leftAnchor = center
          .clone()
          .add(new THREE.Vector3(-size.x / 2, 0, 0));
        const rightAnchor = center
          .clone()
          .add(new THREE.Vector3(size.x / 2, 0, 0));

        // 将模型添加到场景
        scene.add(model);

        // 返回模型信息
        resolve({
          model: model,
          boundingBox: box,
          center: center,
          size: size,
          radius: radius,
          cameraPosition: cameraPosition,
          mixer: mixer,
          leftAnchor: leftAnchor,
          rightAnchor: rightAnchor,
        });
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.error("加载飞机模型时出错:", error);
        reject(error);
      }
    );
  });
}
