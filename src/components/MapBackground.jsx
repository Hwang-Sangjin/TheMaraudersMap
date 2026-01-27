import { useThree } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

const MapBackground = () => {
  const { viewport } = useThree();
  const materialRef = useRef();

  const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const pixelSize = 30;
  const headerHeight = 80;
  const mazeWidth = 100;
  const mazeHeight = 100;

  // 미로 생성 함수 (긴 직선 복도)
  const generateMaze = (width, height) => {
    // 랜덤 통로 너비 (3~5)
    const randomPathWidth = () => Math.floor(Math.random() * 3) + 3;

    const gridSize = 6;
    const gridWidth = Math.floor(width / gridSize);
    const gridHeight = Math.floor(height / gridSize);

    // 미로 초기화 (모두 벽으로)
    const maze = Array(height)
      .fill(null)
      .map(() => Array(width).fill(1));

    // 각 그리드 셀의 통로 너비 저장
    const cellData = Array(gridHeight)
      .fill(null)
      .map(() =>
        Array(gridWidth)
          .fill(null)
          .map(() => ({
            visited: false,
            pathWidth: randomPathWidth(),
          })),
      );

    const directions = [
      { dx: 0, dy: -1, name: "north" },
      { dx: 1, dy: 0, name: "east" },
      { dx: 0, dy: 1, name: "south" },
      { dx: -1, dy: 0, name: "west" },
    ];

    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // 통로만 파내기 (벽은 그대로)
    const carvePath = (x, y, pathWidth) => {
      const halfPath = Math.floor(pathWidth / 2);

      for (let dy = -halfPath; dy < pathWidth - halfPath; dy++) {
        for (let dx = -halfPath; dx < pathWidth - halfPath; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            maze[py][px] = 0;
          }
        }
      }
    };

    // 셀의 중심 좌표 계산
    const getCellCenter = (gridX, gridY) => {
      return {
        x: gridX * gridSize + Math.floor(gridSize / 2),
        y: gridY * gridSize + Math.floor(gridSize / 2),
      };
    };

    // 통로 그리기
    const drawPath = (gridX, gridY) => {
      const pathWidth = cellData[gridY][gridX].pathWidth;
      const center = getCellCenter(gridX, gridY);
      carvePath(center.x, center.y, pathWidth);
    };

    // 두 셀 사이의 복도 그리기
    const drawCorridor = (gridX1, gridY1, gridX2, gridY2) => {
      const pathWidth1 = cellData[gridY1][gridX1].pathWidth;
      const pathWidth2 = cellData[gridY2][gridX2].pathWidth;

      // 두 통로 중 작은 너비 사용 (일관성)
      const corridorWidth = Math.min(pathWidth1, pathWidth2);

      const center1 = getCellCenter(gridX1, gridY1);
      const center2 = getCellCenter(gridX2, gridY2);

      if (gridX1 === gridX2) {
        // 세로 복도
        const minY = Math.min(center1.y, center2.y);
        const maxY = Math.max(center1.y, center2.y);

        for (let y = minY; y <= maxY; y++) {
          carvePath(center1.x, y, corridorWidth);
        }
      } else {
        // 가로 복도
        const minX = Math.min(center1.x, center2.x);
        const maxX = Math.max(center1.x, center2.x);

        for (let x = minX; x <= maxX; x++) {
          carvePath(x, center1.y, corridorWidth);
        }
      }
    };

    // 같은 방향을 우선적으로 선택하는 함수
    const biasedDirectionShuffle = (dirs, lastDirection) => {
      if (!lastDirection) {
        return shuffle([...dirs]);
      }

      const biasStrength = 0.7; // 70% 확률로 같은 방향 유지

      if (Math.random() < biasStrength) {
        // 같은 방향을 맨 앞에 배치
        const sameDirIndex = dirs.findIndex(
          (d) => d.dx === lastDirection.dx && d.dy === lastDirection.dy,
        );

        if (sameDirIndex !== -1) {
          const sameDir = dirs[sameDirIndex];
          const otherDirs = dirs.filter((_, i) => i !== sameDirIndex);
          return [sameDir, ...shuffle(otherDirs)];
        }
      }

      return shuffle([...dirs]);
    };

    const carve = (gridX, gridY, lastDirection = null, straightCount = 0) => {
      cellData[gridY][gridX].visited = true;
      drawPath(gridX, gridY);

      const minStraightLength = 3; // 최소 직선 길이
      const shouldContinueStraight =
        straightCount < minStraightLength && lastDirection;

      let orderedDirs;
      if (shouldContinueStraight) {
        // 최소 직선 길이를 채우기 위해 같은 방향 강제
        orderedDirs = biasedDirectionShuffle(directions, lastDirection);
      } else {
        // 최소 길이를 채웠으면 방향 바이어스 적용
        orderedDirs = biasedDirectionShuffle(directions, lastDirection);
      }

      for (const dir of orderedDirs) {
        const nx = gridX + dir.dx;
        const ny = gridY + dir.dy;

        if (
          nx >= 0 &&
          nx < gridWidth &&
          ny >= 0 &&
          ny < gridHeight &&
          !cellData[ny][nx].visited
        ) {
          drawCorridor(gridX, gridY, nx, ny);

          // 같은 방향이면 카운트 증가, 다른 방향이면 리셋
          const isSameDirection =
            lastDirection &&
            dir.dx === lastDirection.dx &&
            dir.dy === lastDirection.dy;
          const newCount = isSameDirection ? straightCount + 1 : 1;

          carve(nx, ny, dir, newCount);
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
    const maze = generateMaze(mazeWidth, mazeHeight);

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
          const char =
            ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
          ctx.fillText(char, (x + 0.5) * CHAR_SIZE, (y + 0.5) * CHAR_SIZE);
        }
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
        uColor1: { value: [0.878, 0.969, 0.98] },
        uColor2: { value: [0.431, 0.106, 0.082] },
        uMazeTexture: { value: null },
        uMazeSize: { value: [mazeWidth, mazeHeight] },
        uHeaderHeight: { value: headerHeight },
        uTime: { value: 0 },
        uSpeed: { value: 0.02 },
        uTileScale: { value: 1.0 },
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
