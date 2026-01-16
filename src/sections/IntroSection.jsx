export default function IntroSection({ onEnter }) {
  return (
    <div className="fixed inset-0 z-40  flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center text-gray-800">
        Welcome to My Portfolio
      </h1>
      <button
        onClick={onEnter}
        className="bg-gray-800 text-white text-base md:text-lg px-6 py-3 rounded hover:bg-gray-700 transition duration-300"
      >
        Enter
      </button>
    </div>
  );
}
