import { useState } from "react";
import { useNameState } from "../store/nameState"; // 경로는 실제 구조에 따라 조정해줘

export default function IntroSection({ onEnter }) {
  const [inputValue, setInputValue] = useState("");
  const setName = useNameState((state) => state.setName);

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
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-penta  mb-6 text-center text-gray-800">
        Welcome to My Portfolio
      </h1>

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Enter your name..."
        className="w-80 max-w-full px-4 py-2 mb-4 border-2 border-gray-800 rounded focus:outline-none"
      />

      <button
        onClick={handleSubmit}
        className="bg-gray-800 text-white text-base md:text-lg px-6 py-3 rounded hover:bg-gray-700 transition duration-300"
      >
        Enter
      </button>
    </div>
  );
}
