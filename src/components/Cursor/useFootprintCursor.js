import { useEffect, useRef, useState } from "react";

/**
 * 발자국 커서 로직 훅
 * - cursorPos: 현재 커서 위치
 * - footprints: 남아있는 발자국 트레일
 * - currentAngle: 이동 방향 각도(회전)
 * - isLeftNext: 다음 커서 발이 왼발인지(현재 커서용)
 */
export function useFootprintCursor({
  enabled = true,
  distanceThreshold = 60,
  fadeDelay = 100,
  fadeDuration = 1500,
} = {}) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [footprints, setFootprints] = useState([]);
  const [currentAngle, setCurrentAngle] = useState(0);

  const nextIdRef = useRef(0);
  const isLeftRef = useRef(true);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // enabled가 false가 되면 트레일 정리(원하면 유지하도록 옵션화 가능)
  useEffect(() => {
    if (!enabled) {
      setFootprints([]);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;

      setCursorPos({ x, y });

      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < distanceThreshold) return;

      const angle =
        Math.atan2(y - lastPosRef.current.y, x - lastPosRef.current.x) *
          (180 / Math.PI) +
        90;

      setCurrentAngle(angle);

      const id = nextIdRef.current++;
      const newFootprint = {
        id,
        x,
        y,
        isLeft: isLeftRef.current,
        angle,
        fadeOut: false,
      };

      setFootprints((prev) => [...prev, newFootprint]);

      // 다음 발(좌/우)로 토글
      isLeftRef.current = !isLeftRef.current;
      lastPosRef.current = { x, y };

      const fadeTimer = setTimeout(() => {
        setFootprints((prev) =>
          prev.map((fp) => (fp.id === id ? { ...fp, fadeOut: true } : fp))
        );
      }, fadeDelay);

      const removeTimer = setTimeout(() => {
        setFootprints((prev) => prev.filter((fp) => fp.id !== id));
      }, fadeDuration);

      // 포인터 이동마다 타이머를 만들기 때문에,
      // 혹시라도 리스너 해제 시점에 남아있는 타이머가 걱정되면
      // 타이머 관리 배열(ref)로 묶어서 정리하는 방식으로 확장 가능.
      // (지금은 기존 코드와 동일한 구조 유지)
      void fadeTimer;
      void removeTimer;
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [enabled, distanceThreshold, fadeDelay, fadeDuration]);

  return {
    cursorPos,
    footprints,
    currentAngle,
    isLeftNext: isLeftRef.current,
  };
}
