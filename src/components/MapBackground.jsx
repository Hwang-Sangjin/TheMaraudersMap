import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

const MapBackground = () => {
  const { viewport } = useThree();

  const CHAR_SIZE = 8;
  const COLS = 200;
  const ROWS = 120;

  const createMaze = (cols, rows) => {
    // Initialize all as walls
    const maze = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill("wall"));

    // Recursive backtracking maze generation
    const carve = (x, y) => {
      maze[y][x] = "path";

      const directions = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ].sort(() => Math.random() - 0.5); // Shuffle

      for (const [dx, dy] of directions) {
        const nx = x + dx * 3; // Move 3 cells at a time
        const ny = y + dy * 3;

        if (
          nx > 0 &&
          nx < cols - 1 &&
          ny > 0 &&
          ny < rows - 1 &&
          maze[ny][nx] === "wall"
        ) {
          // Carve path between cells
          for (let i = 1; i <= 3; i++) {
            maze[y + dy * i][x + dx * i] = "path";
          }
          carve(nx, ny);
        }
      }
    };

    // Start carving from position (3, 3)
    carve(3, 3);

    return maze;
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
