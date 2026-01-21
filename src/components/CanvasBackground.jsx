import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import StaticPaperBackground from "./StaticPaperBackground";
import MapBackground from "./MapBackground";

export default function CanvasBackground({ currentSection }) {
  useEffect(() => {
    console.log("Current Section in CanvasBackground:", currentSection);
  }, [currentSection]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Suspense fallback={null}>
        <Canvas
          style={{ pointerEvents: "none" }}
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ alpha: false }}
        >
          <StaticPaperBackground color="#f5ebd7" />

          {currentSection === "main" ||
          currentSection === "about" ||
          currentSection === "contact" ? (
            <MapBackground />
          ) : null}
        </Canvas>
      </Suspense>
    </div>
  );
}
