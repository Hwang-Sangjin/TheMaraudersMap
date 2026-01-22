import React, { useEffect } from "react";
import image from "/image/image.png";

const ImageSection = ({ onComplete }) => {
  useEffect(() => {
    // 2초 후 자동으로 다음 섹션으로 이동
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative min-h-screen flex justify-center">
      <img
        src={image}
        alt="중앙 이미지"
        className="max-w-full max-h-screen object-contain absolute"
        style={{ top: "40%", transform: "translateY(-50%)" }}
      />
    </div>
  );
};

export default ImageSection;
