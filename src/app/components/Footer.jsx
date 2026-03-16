import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#00003d] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-xl mb-2">DevOps Engineer</h3>
          </div>
          <div className="flex gap-6">
            <a
              href="https://github.com/ptd0409"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4c896] transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/d%C5%A9ng-ph%E1%BA%A1m-ti%E1%BA%BFn-46a72a225"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d4c896] transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="mailto:phamtiendungst49@gmail.com"
              className="hover:text-[#d4c896] transition-colors"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>
        {/*<div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {currentYear} DevOps Portfolio. All rights reserved.</p>
        </div> */}
      </div>
    </footer>
  );
}
