import profileImage from "../../assets/portrait.jpg";

export function HeroSection() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section
      id="home"
      className="min-h-screen bg-[#f5f3e8] flex items-center pt-20"
    >
      <div className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <p className="text-[#00003d] text-lg">Hello, I'm Dũng,</p>
            <h1 className="text-[#00003d] font-bold text-6xl md:text-7xl leading-tight">
              DevOps
              <br />
              Engineer
            </h1>
            <p className="text-[#00003d] text-lg">based in Ho Chi Minh City.</p>
            <button
              onClick={() => scrollToSection("contact")}
              className="px-8 py-3 bg-[#d4c896] text-[#00003d] rounded-lg hover:bg-[#c4b886] transition-colors border-2 border-[#00003d]"
            >
              Get in touch
            </button>
          </div>

          {/* Right Content */}
          <div className="relative flex justify-center md:justify-end">
            <div className="relative">
              <div className="w-80 h-80 rounded-full overflow-hidden border-8 border-white shadow-xl">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Background circle */}
              <div className="absolute -z-10 top-4 left-4 w-80 h-80 rounded-full bg-[#e5e3d8]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
