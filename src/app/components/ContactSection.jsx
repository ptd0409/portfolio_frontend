import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your message! I will get back to you soon!");
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-[#00003d] mb-4">Get In Touch</h2>
        <div className="w-20 h-1 bg-[#d4c896] mb-12"></div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              Contact me to build infrastructure on AWS or Azure, deploy web
              apps and set up n8n workflows for automation.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#f5f3e8] rounded-lg">
                  <Mail className="w-6 h-6 text-[#00003d]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#00003d] mb-1">Email</h3>
                  <a
                    href="mailto:phamtiendungst49@gmail.com"
                    className="text-gray-700 hover:text-[#00003d] transition-colors"
                  >
                    phamtiendungst49@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#f5f3e8] rounded-lg">
                  <Phone className="w-6 h-6 text-[#00003d]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#00003d] mb-1">Phone</h3>
                  <a
                    href="tel:+84367770404"
                    className="text-gray-700 hover:text-[#00003d] transition-colors"
                  >
                    +84 367770404
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#f5f3e8] rounded-lg">
                  <MapPin className="w-6 h-6 text-[#00003d]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#00003d] mb-1">
                    Location
                  </h3>
                  <p className="text-gray-700">Ho Chi Minh, Vietnam</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#f5f3e8] rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-[#00003d] font-semibold mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896] focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-[#00003d] font-semibold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896] focus:border-transparent"
                  placeholder="Your email"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-[#00003d] font-semibold mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4c896] focus:border-transparent resize-none"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-8 py-3 bg-[#d4c896] text-[#00003d] font-semibold rounded-lg hover:bg-[#c4b886] transition-colors border-2 border-[#00003d]"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
