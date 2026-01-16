export default function Header({ onNavigate }) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 py-2 flex gap-4">
      <button onClick={() => onNavigate("main")}>Main</button>
      <button onClick={() => onNavigate("about")}>About</button>
      <button onClick={() => onNavigate("contact")}>Contact</button>
    </nav>
  );
}
