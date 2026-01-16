import { useProgress } from "@react-three/drei";
import { useEffect } from "react";

export default function LoadingSection({ onComplete }) {
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      onComplete();
    }
  }, [progress, onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(); // 바로 intro로 전환
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0  z-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-800">
          Loading...
        </p>
        <p className="text-sm mt-2 text-gray-600">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}
