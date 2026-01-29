import { useThree } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

const MapBackground2 = () => {
  const { viewport } = useThree();
  const materialRef = useRef();

  const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const pixelSize = 8; // 간격 (셀 크기)
  const fontSize = 12; // 텍스트 실제 크기

  // ASCII 텍스처 생성
  useEffect(() => {
    const CHAR_SIZE = fontSize; // pixelSize 대신 fontSize 사용
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
    }
  }, []);

  const shaderMaterial = useMemo(
    () => ({
      uniforms: {
        uResolution: { value: [window.innerWidth, window.innerHeight] },
        uPixelSize: { value: pixelSize },
        uColor1: { value: [0.878, 0.969, 0.98] }, // 배경색 (투명하게 될 부분)
        uColor2: { value: [0.431, 0.106, 0.082] }, // 알파벳 색상
        uAsciiTexture: { value: null },
        uCharCount: { value: ASCII_CHARS.length },
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
        varying vec2 vUv;
        
        // 랜덤 함수
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          // 1. 픽셀 크기를 정규화
          vec2 normalizedPixelSize = vec2(uPixelSize) / uResolution;
          
          // 2. UV를 픽셀 그리드로 스냅
          vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
          
          // 3. 각 셀 내부의 상대적 UV 좌표
          vec2 cellUV = fract(vUv / normalizedPixelSize);
          
          // 4. 셀 위치 계산
          vec2 cellPosition = floor(vUv / normalizedPixelSize);
          
          // 5. 각 셀마다 랜덤한 문자 선택
          float charIndex = floor(random(cellPosition) * uCharCount);
          
          // 6. ASCII 텍스처에서 문자 샘플링
          vec2 asciiUV = vec2(
            (charIndex + cellUV.x) / uCharCount,
            cellUV.y
          );
          
          float character = texture2D(uAsciiTexture, asciiUV).r;
          
          // 7. 알파벳이 있는 곳만 표시, 나머지는 투명
          vec3 color;
          float alpha;
          
          if (character > 0.5) {
            color = uColor2; // 알파벳 색상
            alpha = 1.0; // 불투명
          } else {
            color = uColor1; // 배경색
            alpha = 0.0; // 완전 투명 (기존 Background가 보임)
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

export default MapBackground2;
