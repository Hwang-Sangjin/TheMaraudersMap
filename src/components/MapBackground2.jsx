import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { exp } from "three/tsl";

function MapBackground2() {
  const meshRef = useRef();

  // 업로드한 이미지를 텍스처로 사용
  const texture = useTexture("/image/preview.webp");

  // 텍스처 설정
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  useFrame((state) => {
    // 미묘한 애니메이션 효과
    if (meshRef.current) {
      meshRef.current.material.opacity =
        0.95 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[16, 24]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.95}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default MapBackground2;
