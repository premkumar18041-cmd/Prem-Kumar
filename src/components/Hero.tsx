import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext.js';

interface HeroProps {
  onExplore: () => void;
  onNewArrivals: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onNewArrivals }) => {
  const { t } = useCurrency();

  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      {/* Background Subtle Gradient & Image Mesh */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity pointer-events-none">
        <img
          src="https://accessories.lt/wp-content/uploads/2026/09/pic-38.jpg"
          alt="IVER Accessories hero visual"
          className="w-full h-full object-cover filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autumn & Winter 2026 Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight uppercase">
            {t('heroTagline')}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-300 font-light leading-relaxed max-w-xl">
            {t('heroSubtitle')}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={onExplore}
              className="px-8 py-4 bg-amber-200 hover:bg-amber-300 text-zinc-950 text-sm font-semibold rounded-full shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>{t('shopNow')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onNewArrivals}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              {t('exploreNewArrivals')}
            </button>
          </div>

        </div>
      </div>

      {/* Trust Highlights Bar */}
      <div className="relative z-10 border-t border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-zinc-300">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>EU & Baltic Courier / Parcel Lockers</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>14-Day Statutory Returns</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Certified Safe Checkout</span>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Vilnius, Lithuania Hub &bull; accessories.lt</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
