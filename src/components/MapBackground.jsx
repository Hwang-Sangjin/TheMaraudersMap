import { useThree } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

const MapBackground = () => {
  const { viewport } = useThree();
  const materialRef = useRef();

  const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const pixelSize = 30;
  const headerHeight = 80;
  const mazeWidth = 100; // 미로의 너비 (셀 단위)
  const mazeHeight = 100; // 미로의 높이 (셀 단위)
  const wallThickness = 2; // 벽 두께
  const pathWidth = 2; // 통로 너비

  // 미로 생성 함수 (재귀적 백트래킹, 두꺼운 벽/통로)
  const generateMaze = (width, height, wallThick, pathWide) => {
    // 미로 초기화 (모두 벽으로)
    const maze = Array(height)
      .fill(null)
      .map(() => Array(width).fill(1));

    const cellSize = wallThick + pathWide; // 한 셀의 크기 (벽 + 통로)
    const gridWidth = Math.floor(width / cellSize);
    const gridHeight = Math.floor(height / cellSize);

    const directions = [
      [0, -1], // 위
      [1, 0], // 오른쪽
      [0, 1], // 아래
      [-1, 0], // 왼쪽
    ];

    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // 특정 그리드 위치에 통로 만들기 (pathWide x pathWide 크기)
    const carvePath = (gridX, gridY) => {
      const startX = gridX * cellSize + wallThick;
      const startY = gridY * cellSize + wallThick;

      for (let dy = 0; dy < pathWide; dy++) {
        for (let dx = 0; dx < pathWide; dx++) {
          const x = startX + dx;
          const y = startY + dy;
          if (x < width && y < height) {
            maze[y][x] = 0;
          }
        }
      }
    };

    // 두 셀 사이의 벽 제거 (연결 통로 만들기)
    const carveConnection = (gridX1, gridY1, gridX2, gridY2) => {
      if (gridX1 === gridX2) {
        // 세로 연결
        const x = gridX1 * cellSize + wallThick;
        const startY =
          Math.min(gridY1, gridY2) * cellSize + wallThick + pathWide;
        const endY = startY + wallThick;

        for (let y = startY; y < endY; y++) {
          for (let dx = 0; dx < pathWide; dx++) {
            if (x + dx < width && y < height) {
              maze[y][x + dx] = 0;
            }
          }
        }
      } else {
        // 가로 연결
        const y = gridY1 * cellSize + wallThick;
        const startX =
          Math.min(gridX1, gridX2) * cellSize + wallThick + pathWide;
        const endX = startX + wallThick;

        for (let x = startX; x < endX; x++) {
          for (let dy = 0; dy < pathWide; dy++) {
            if (x < width && y + dy < height) {
              maze[y + dy][x] = 0;
            }
          }
        }
      }
    };

    const carve = (gridX, gridY) => {
      carvePath(gridX, gridY);

      const shuffledDirs = shuffle([...directions]);

      for (const [dx, dy] of shuffledDirs) {
        const nx = gridX + dx;
        const ny = gridY + dy;

        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          const checkX = nx * cellSize + wallThick;
          const checkY = ny * cellSize + wallThick;

          if (checkX < width && checkY < height && maze[checkY][checkX] === 1) {
            carveConnection(gridX, gridY, nx, ny);
            carve(nx, ny);
          }
        }
      }
    };

    // 시작점
    if (gridWidth > 0 && gridHeight > 0) {
      carve(0, 0);
    }

    return maze;
  };

  // 미로 텍스처 생성
  useEffect(() => {
    const CHAR_SIZE = pixelSize;

    // 미로 생성
    const maze = generateMaze(mazeWidth, mazeHeight, wallThickness, pathWidth);

    // 캔버스 크기 설정
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = CHAR_SIZE * mazeWidth;
    canvas.height = CHAR_SIZE * mazeHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = `${CHAR_SIZE - 2}px "Penta", "Courier New", monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // 미로를 텍스트로 렌더링
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        if (maze[y][x] === 1) {
          // 벽인 경우
          // 랜덤한 ASCII 문자 선택
          const char =
            ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
          ctx.fillText(char, (x + 0.5) * CHAR_SIZE, (y + 0.5) * CHAR_SIZE);
        }
        // 빈 공간(0)은 그리지 않음 (투명)
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    if (materialRef.current) {
      materialRef.current.uniforms.uMazeTexture.value = texture;
      materialRef.current.uniforms.uMazeSize.value = [mazeWidth, mazeHeight];
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
        uColor1: { value: [0.878, 0.969, 0.98] }, // 배경색 (투명)
        uColor2: { value: [0.431, 0.106, 0.082] }, // 벽 색상
        uMazeTexture: { value: null },
        uMazeSize: { value: [mazeWidth, mazeHeight] },
        uHeaderHeight: { value: headerHeight },
        uTime: { value: 0 },
        uSpeed: { value: 0.02 },
        uTileScale: { value: 0.5 }, // 타일링 스케일 추가
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
        uniform sampler2D uMazeTexture;
        uniform vec2 uMazeSize;
        uniform float uHeaderHeight;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uTileScale;
        varying vec2 vUv;
        
        void main() {
          // 헤더 영역 체크
          float screenY = (1.0 - vUv.y) * uResolution.y;
          
          float headerOpacity = 1.0;
          if (screenY < uHeaderHeight) {
            headerOpacity = smoothstep(0.0, uHeaderHeight, screenY) * 0.5;
          }
          
          // UV를 시간에 따라 스크롤
          vec2 scrolledUV = vUv;
          scrolledUV.x += uTime * uSpeed;
          
          // 타일링 스케일 적용 (값이 클수록 작아짐)
          scrolledUV *= uTileScale;
          
          // UV를 반복(wrap)하여 무한 스크롤 효과
          scrolledUV = fract(scrolledUV);
          
          // 미로 텍스처 샘플링
          vec4 mazeColor = texture2D(uMazeTexture, scrolledUV);
          
          vec3 color;
          float alpha;
          
          if (mazeColor.r > 0.5) { // 벽 (텍스트가 있는 곳)
            color = uColor2;
            alpha = 1.0 * headerOpacity;
          } else { // 빈 공간
            color = uColor1;
            alpha = 0.0; // 완전히 투명
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
