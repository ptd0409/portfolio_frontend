import { Link, useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const scrollToSection = (id) => {
    if (!isHomePage) {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f5f3e8]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="font-bold text-xl text-[#00003d] hover:opacity-70 transition-opacity"
        >
          Phạm Tiến Dũng
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("home")}
            className="text-[#00003d] hover:opacity-70 transition-opacity"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-[#00003d] hover:opacity-70 transition-opacity"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("projects")}
            className="text-[#00003d] hover:opacity-70 transition-opacity"
          >
            Projects
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-[#00003d] hover:opacity-70 transition-opacity"
          >
            Contact
          </button>
        </nav>
      </div>
    </header>
  );
}
