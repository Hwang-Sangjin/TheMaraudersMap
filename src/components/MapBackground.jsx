import { useThree } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

const MapBackground = () => {
  const { viewport } = useThree();
  const materialRef = useRef();

  const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const pixelSize = 15;
  const headerHeight = 80;

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

  // 애니메이션 루프
  useEffect(() => {
    let animationId;
    const startTime = Date.now();

    const animate = () => {
      if (materialRef.current) {
        const elapsed = (Date.now() - startTime) / 1000;
        materialRef.current.uniforms.uTime.value = elapsed;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
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
        uTime: { value: 0 },
        uSpeed: { value: 0.02 }, // 스크롤 속도 조절 (값이 클수록 빠름)
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
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          // 헤더 영역 체크
          float screenY = (1.0 - vUv.y) * uResolution.y;
          
          float headerOpacity = 1.0;
          if (screenY < uHeaderHeight) {
            headerOpacity = smoothstep(0.0, uHeaderHeight, screenY) * 0.5;
          }
          
          vec2 normalizedPixelSize = vec2(uPixelSize) / uResolution;
          
          // UV를 시간에 따라 왼쪽으로 이동 (오른쪽에서 왼쪽으로)
          vec2 scrolledUV = vUv;
          scrolledUV.x += uTime * uSpeed;
          
          // UV를 반복(wrap)하여 무한 스크롤 효과
          scrolledUV = fract(scrolledUV);
          
          vec2 uvPixel = normalizedPixelSize * floor(scrolledUV / normalizedPixelSize);
          vec2 cellUV = fract(scrolledUV / normalizedPixelSize);
          vec2 cellPosition = floor(scrolledUV / normalizedPixelSize);
          
          // 시간에 따라 변하는 랜덤 시드 추가 (더 다양한 패턴)
          float timeSeed = floor(uTime * uSpeed);
          float charIndex = floor(random(cellPosition + vec2(timeSeed, 0.0)) * uCharCount);
          
          vec2 asciiUV = vec2(
            (charIndex + cellUV.x) / uCharCount,
            cellUV.y
          );
          
          float character = texture2D(uAsciiTexture, asciiUV).r;
          
          vec3 color;
          float alpha;
          
          if (character > 0.5) {
            color = uColor2;
            alpha = 1.0 * headerOpacity;
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
