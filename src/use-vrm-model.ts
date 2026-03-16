import { MToonMaterialLoaderPlugin, VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { MToonNodeMaterial } from "@pixiv/three-vrm/nodes";
import { useLoader, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { WebGPURenderer } from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

function isWebGPURenderer(gl: unknown): gl is WebGPURenderer {
  return (gl as WebGPURenderer)?.isWebGPURenderer === true;
}

export const useVRMModel = (url: string) => {
  const gl = useThree((state) => state.gl);
  const useNodeMaterial = isWebGPURenderer(gl);

  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => {
      if (useNodeMaterial) {
        const mtoonMaterialPlugin = new MToonMaterialLoaderPlugin(parser, {
          materialType: MToonNodeMaterial,
        });
        return new VRMLoaderPlugin(parser, { mtoonMaterialPlugin });
      }
      return new VRMLoaderPlugin(parser);
    });
  });

  const vrm = gltf.userData.vrm as VRM;

  useEffect(() => {
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.combineSkeletons(gltf.scene);
    VRMUtils.combineMorphs(vrm);
    vrm.scene.rotation.y = Math.PI;
    vrm.scene.traverse((obj) => {
      obj.frustumCulled = false;
    });
  }, [gltf.scene, vrm]);

  return [gltf, vrm] as const;
};
