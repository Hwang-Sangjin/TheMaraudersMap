import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import StaticPaperBackground from "./StaticPaperBackground";

export default function CanvasBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Suspense fallback={null}>
        <Canvas
          style={{ pointerEvents: "none" }}
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ alpha: false }}
        >
          <StaticPaperBackground color="#f5ebd7" />
        </Canvas>
      </Suspense>
    </div>
  );
}
