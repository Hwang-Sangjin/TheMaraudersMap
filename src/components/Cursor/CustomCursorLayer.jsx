import Footprint from "./Footprint";
import { useFootprintCursor } from "./useFootprintCursor";
import NameTag from "./NameTag";

export default function CustomCursorLayer({
  enabled = true,
  distanceThreshold = 60,
  fadeDelay = 100,
  fadeDuration = 1500,
}) {
  const { cursorPos, footprints, currentAngle, isLeftNext } =
    useFootprintCursor({
      enabled,
      distanceThreshold,
      fadeDelay,
      fadeDuration,
    });

  if (!enabled) return null;

  return (
    <>
      {/* Footprint trails */}
      {footprints.map((fp) => (
        <div
          key={fp.id}
          className={`fixed pointer-events-none z-40 transition-opacity duration-1000 ${
            fp.fadeOut ? "opacity-0" : "opacity-100"
          }`}
          style={{
            left: fp.x,
            top: fp.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Footprint isLeft={fp.isLeft} angle={fp.angle} />
        </div>
      ))}

      {/* Current cursor */}
      <div
        className="fixed pointer-events-none z-60"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* NameTag (zustand에서 name 읽음) */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "-80px",
            transform: "translateX(-50%)",
          }}
        >
          <NameTag />
        </div>

        {/* Current footprint cursor */}
        <Footprint
          isLeft={isLeftNext}
          angle={currentAngle}
          className="opacity-50"
        />
      </div>
    </>
  );
}
