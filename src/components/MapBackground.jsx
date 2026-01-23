import { useThree } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

const MapBackground = () => {
  const { viewport } = useThree();
  const materialRef = useRef();

  const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const pixelSize = 15;
  const headerHeight = 80; // 헤더 높이 (픽셀 단위, 필요시 조정)

  // ASCII 텍스처 생성
  useEffect(() => {
    const CHAR_SIZE = pixelSize;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = CHAR_SIZE * ASCII_CHARS.length;
    canvas.height = CHAR_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = `${CHAR_SIZE - 2}px "Penta", "Courier New", monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    ASCII_CHARS.split("").forEach((char, i) => {
      ctx.fillText(char, (i + 0.5) * CHAR_SIZE, CHAR_SIZE / 2);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    if (materialRef.current) {
      materialRef.current.uniforms.uAsciiTexture.value = texture;
      materialRef.current.uniforms.uCharCount.value = ASCII_CHARS.length;
      materialRef.current.uniforms.uHeaderHeight.value = headerHeight;
    }
  }, []);

  const shaderMaterial = useMemo(
    () => ({
      uniforms: {
        uResolution: { value: [window.innerWidth, window.innerHeight] },
        uPixelSize: { value: pixelSize },
        uColor1: { value: [0.878, 0.969, 0.98] },
        uColor2: { value: [0.431, 0.106, 0.082] },
        uAsciiTexture: { value: null },
        uCharCount: { value: ASCII_CHARS.length },
        uHeaderHeight: { value: headerHeight },
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 uResolution;
        uniform float uPixelSize;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform sampler2D uAsciiTexture;
        uniform float uCharCount;
        uniform float uHeaderHeight;
        varying vec2 vUv;
        
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          // 헤더 영역 체크 (상단부터 uHeaderHeight만큼)
          float screenY = (1.0 - vUv.y) * uResolution.y;
          
          // 그라데이션: 맨 위(0) = 완전 투명(0.0), 헤더 끝(uHeaderHeight) = 반투명(0.5)
          float headerOpacity = 1.0;
          if (screenY < uHeaderHeight) {
            headerOpacity = smoothstep(0.0, uHeaderHeight, screenY) * 0.5;
          }
          
          vec2 normalizedPixelSize = vec2(uPixelSize) / uResolution;
          vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
          vec2 cellUV = fract(vUv / normalizedPixelSize);
          vec2 cellPosition = floor(vUv / normalizedPixelSize);
          
          float charIndex = floor(random(cellPosition) * uCharCount);
          
          vec2 asciiUV = vec2(
            (charIndex + cellUV.x) / uCharCount,
            cellUV.y
          );
          
          float character = texture2D(uAsciiTexture, asciiUV).r;
          
          vec3 color;
          float alpha;
          
          if (character > 0.5) {
            color = uColor2;
            alpha = 1.0 * headerOpacity; // 헤더 opacity 적용
          } else {
            color = uColor1;
            alpha = 0.0;
          }
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
    }),
    [],
  );

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        {...shaderMaterial}
        transparent={true}
      />
    </mesh>
  );
};

export default MapBackground;
