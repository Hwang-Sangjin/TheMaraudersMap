export default function Header({ onNavigate }) {
  return (
    <nav className="fixed top-0 right-0 z-50 px-8 py-6 animate-slide-up">
      <div className="flex gap-6 font-mono text-xl font-semibold">
        <button
          onClick={() => onNavigate("main")}
          className="text-gray-800 hover:text-black transition-colors duration-200"
        >
          Main
        </button>
        <button
          onClick={() => onNavigate("about")}
          className="text-gray-800 hover:text-black transition-colors duration-200"
        >
          About
        </button>
        <button
          onClick={() => onNavigate("contact")}
          className="text-gray-800 hover:text-black transition-colors duration-200"
        >
          Contact
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        
        .font-mono {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        @keyframes slideUp {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>
    </nav>
  );
}
