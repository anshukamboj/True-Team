
import { ArrowRight } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[#351017] px-6 py-10 text-center sm:py-12">
      <h2 className="mb-5 font-['Playfair_Display',serif] text-2xl font-semibold text-[#F8F1E6] sm:text-3xl">
        Build a better employee experience.
      </h2>

      <button
        onClick={() => alert('Welcome to EMPOWER HR!')}
        className="inline-flex items-center gap-2 rounded-lg bg-[#D9A1A0] px-5 py-2.5 text-sm font-semibold text-[#321719] hover:bg-[#CE8D8C]"
      >
        Get Started <ArrowRight size={16} />
      </button>
    </footer>
  );
}

export default Footer;

