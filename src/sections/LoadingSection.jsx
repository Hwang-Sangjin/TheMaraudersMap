import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function LoadingSection({ onComplete }) {
  const { progress } = useProgress();
  const [isOpening, setIsOpening] = useState(false);
  const [fakeProgress, setFakeProgress] = useState(0);

  // 테스트용: 3초 동안 0 → 100% 진행
  useEffect(() => {
    const duration = 3000; // 3초
    const interval = 30; // 30ms마다 업데이트
    const steps = duration / interval;
    const increment = 100 / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        setFakeProgress(100);
        clearInterval(timer);
      } else {
        setFakeProgress(current);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // 테스트용: fakeProgress가 100이 되면 책 펼침
  useEffect(() => {
    if (fakeProgress === 100) {
      setIsOpening(true);
      setTimeout(() => {
        onComplete();
      }, 1200);
    }
  }, [fakeProgress, onComplete]);

  // 실제 사용시 코드 (주석 처리)
  // useEffect(() => {
  //   if (progress === 100) {
  //     setIsOpening(true);
  //     setTimeout(() => {
  //       onComplete();
  //     }, 1200);
  //   }
  // }, [progress, onComplete]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsOpening(true);
  //     setTimeout(() => {
  //       onComplete();
  //     }, 1200);
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ backgroundColor: "#ebd5af" }}
    >
      {/* 왼쪽 페이지 */}

      {/* 왼쪽 페이지 */}
      <div
        className={`absolute inset-0 transition-transform duration-1200 ease-out origin-right ${
          isOpening ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{
          left: 0,
          width: "50%",
          backgroundColor: "#ebd5af",
          boxShadow: isOpening ? "-20px 0 40px rgba(0,0,0,0.3)" : "none",
        }}
      />

      {/* 오른쪽 페이지 */}
      <div
        className={`absolute inset-0 transition-transform duration-1200 ease-out origin-left ${
          isOpening ? "translate-x-full" : "translate-x-0"
        }`}
        style={{
          left: "50%",
          width: "50%",
          backgroundColor: "#ebd5af",
          boxShadow: isOpening ? "20px 0 40px rgba(0,0,0,0.3)" : "none",
        }}
      />

      {/* 중앙 로딩 바 */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2 h-full overflow-hidden">
        <div
          className={`w-full transition-opacity duration-300 ${
            isOpening ? "opacity-0" : "opacity-100"
          }`}
          style={{
            height: `${fakeProgress}%`,
            background: "linear-gradient(to bottom, #6e1b15, #431d2c)",
            boxShadow:
              "0 0 10px rgba(110, 27, 21, 0.8), " +
              "0 0 20px rgba(110, 27, 21, 0.5), " +
              "0 0 30px rgba(67, 29, 44, 0.3)",
          }}
        />
      </div>
    </div>
  );
}
