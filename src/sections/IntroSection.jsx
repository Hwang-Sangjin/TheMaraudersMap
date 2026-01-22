import { useState, useEffect } from "react";
import { useNameState } from "../store/nameState";

export default function IntroSection({ onEnter }) {
  const [inputValue, setInputValue] = useState("");
  const [visibleLetters, setVisibleLetters] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const setName = useNameState((state) => state.setName);

  const fullText = "I solemnly swear that I am up to no good";

  useEffect(() => {
    const letters = fullText.split("");
    letters.forEach((_, index) => {
      setTimeout(
        () => {
          setVisibleLetters((prev) => [...prev, index]);
        },
        2000 + index * 50,
      ); // 2초 대기 후 각 글자마다 50ms 간격
    });

    // 텍스트 애니메이션이 끝난 후 input과 button 표시
    const totalTextDuration = 2000 + letters.length * 50 + 500; // 여유 시간 500ms 추가
    setTimeout(() => {
      setShowInput(true);
    }, totalTextDuration);
  }, []);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setName(inputValue);
      onEnter(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6">
      <h1
        className="text-3xl md:text-4xl lg:text-5xl font-penta mb-6 text-center"
        style={{ color: "#6e1b15" }}
      >
        {fullText.split("").map((char, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-500 ${
              visibleLetters.includes(index)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter your name..."
        className={`w-80 max-w-full px-4 py-2 mb-4 border-2 rounded focus:outline-none transition-all duration-700 ${
          showInput ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ borderColor: "#6e1b15", color: "#6e1b15" }}
      />

      <button
        onClick={handleSubmit}
        className={`text-white text-base md:text-lg px-6 py-3 rounded transition-all duration-700 ${
          showInput ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ backgroundColor: "#6e1b15", transitionDelay: "100ms" }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#551410")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#6e1b15")}
      >
        Enter
      </button>
    </div>
  );
}
