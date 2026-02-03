import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

const MapBackground = () => {
  const { viewport } = useThree();

  const CHAR_SIZE = 12;
  const COLS = 80;
  const ROWS = 48;

  const createMaze = (cols, rows) => {
    const zoomFactor = 10;
    const cellSpacing = 10; // 셀 간격 (미로 그리드 간격)
    const pathWidth = 6; // 통로 너비 (1~cellSpacing 사이 값)

    const fullCols = cols * zoomFactor;
    const fullRows = rows * zoomFactor;
    const fullMaze = Array(fullRows)
      .fill(null)
      .map(() => Array(fullCols).fill("wall"));

    const stack = [];
    const startX = cellSpacing;
    const startY = cellSpacing;

    // 시작점을 통로 너비만큼 넓게 설정
    for (let dy = 0; dy < pathWidth; dy++) {
      for (let dx = 0; dx < pathWidth; dx++) {
        if (startY + dy < fullRows && startX + dx < fullCols) {
          fullMaze[startY + dy][startX + dx] = "path";
        }
      }
    }

    stack.push([startX, startY]);

    while (stack.length > 0) {
      const [x, y] = stack[stack.length - 1];

      const directions = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ].sort(() => Math.random() - 0.5);

      let carved = false;

      for (const [dx, dy] of directions) {
        const nx = x + dx * cellSpacing;
        const ny = y + dy * cellSpacing;

        if (
          nx > 0 &&
          nx < fullCols - pathWidth &&
          ny > 0 &&
          ny < fullRows - pathWidth &&
          fullMaze[ny][nx] === "wall"
        ) {
          // 통로를 넓게 파기
          for (let i = 0; i <= cellSpacing; i++) {
            const currentX = x + dx * i;
            const currentY = y + dy * i;

            // pathWidth만큼 넓게 통로 생성
            for (let pw = 0; pw < pathWidth; pw++) {
              for (let ph = 0; ph < pathWidth; ph++) {
                if (currentY + ph < fullRows && currentX + pw < fullCols) {
                  fullMaze[currentY + ph][currentX + pw] = "path";
                }
              }
            }
          }

          stack.push([nx, ny]);
          carved = true;
          break;
        }
      }

      if (!carved) {
        stack.pop();
      }
    }

    // 중앙 부분만 추출
    const startCol = Math.floor((fullCols - cols) / 2);
    const startRow = Math.floor((fullRows - rows) / 2);

    const viewMaze = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill("wall"));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        viewMaze[row][col] = fullMaze[startRow + row][startCol + col];
      }
    }

    return viewMaze;
  };

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = COLS * CHAR_SIZE;
    canvas.height = ROWS * CHAR_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${CHAR_SIZE - 1}px "Penta", "Courier New", monospace`;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#6e1b15";

    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()";

    const maze = createMaze(COLS, ROWS);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (maze[row][col] === "wall") {
          const char = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(char, col * CHAR_SIZE, row * CHAR_SIZE);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <meshBasicMaterial map={texture} transparent={true} opacity={1.0} />
    </mesh>
  );
};

export default MapBackground;
