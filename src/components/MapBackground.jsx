import { useThree } from "@react-three/fiber";
import { useMemo } from "react";

const MapBackground = () => {
  const { viewport } = useThree();

  const shaderMaterial = useMemo(
    () => ({
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // 검정색
        }
      `,
    }),
    [],
  );

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial attach="material" {...shaderMaterial} />
    </mesh>
  );
};

export default MapBackground;
