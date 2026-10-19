import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardPreview from './DashboardPreview';
import LandingSections from './LandingSections';
import Navbar from './Navbar';
import Footer from './Footer';


function Main() {
  return (
    <>
      <Navbar />
      <section className="bg-[#F8F1E6] px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2">

          <div>
            <div className="mb-4 flex items-center gap-2 text-xs tracking-widest text-[#9C6268]">
              
              MODERN WORKFORCE MANAGEMENT
            </div>

            <h1 className="mb-5 font-['Playfair_Display',serif] text-4xl font-bold leading-tight text-[#4B101B] sm:text-5xl">
              Empower Your People.
              <br />
              Simplify Your HR.
            </h1>

            <p className="mb-6 max-w-lg text-sm leading-6 text-[#321719] sm:text-base">
              An intelligent HR management platform designed to simplify
              employee management, streamline workflows, and create a better
              workplace experience.
            </p>

            <div className="mb-10 flex flex-wrap items-center gap-4">
              <Link
                to="/create-account"
                className="flex items-center gap-2 rounded-lg bg-[#D9A1A0] px-5 py-3 text-sm font-semibold text-[#321719] hover:bg-[#CE8D8C]"
              >
                Get Started <ArrowRight size={16} />
              </Link>

              <button
                onClick={() =>
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="rounded-lg border border-[#4B101B]/20 px-5 py-3 text-sm font-semibold text-[#4B101B]"
              >
                Explore Platform
              </button>
            </div>

            <div className="flex flex-wrap gap-8 border-t border-[#4B101B]/10 pt-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#4B101B]">99.9%</h3>
                <p className="text-xs text-[#321719]">Platform Uptime</p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#4B101B]">15k+</h3>
                <p className="text-xs text-[#321719]">Teams Empowered</p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#4B101B]">4.9/5</h3>
                <p className="text-xs text-[#321719]">User Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-115">
             <DashboardPreview/>
            </div>
          </div>

        </div>
      </section>
      <LandingSections />

      <Footer />
    </>
  );
}

export default Main;