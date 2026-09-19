import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext.js';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useCurrency();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      
      {/* 1. Newsletter Ribbon */}
      <div className="border-b border-zinc-850 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
              {t('newsletterTitle')}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {t('newsletterSub')} Receive an instant 10% coupon code for your next order.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Thank you! Use coupon <strong>WELCOME10</strong> at checkout for 10% off.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-md w-full gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs text-white rounded-xl focus:outline-none focus:border-amber-400 placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-300 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded-xl transition-colors shrink-0"
                >
                  {t('subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-serif font-bold text-lg">
                I
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight uppercase">
                IVER
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Curated everyday fashion jewelry, structured totes, and modern lifestyle accessories. 
              Designed with precision to elevate your personal style.
            </p>

            <div className="text-xs text-zinc-400 space-y-1 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Accessories.lt &bull; Sec 110, Vilnius, Lithuania</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support@accessories.lt</span>
              </p>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                  All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=jewelry')} className="hover:text-white transition-colors">
                  Jewelry & Bangles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=bags')} className="hover:text-white transition-colors">
                  Bags & Totes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'category=wallets-belts')} className="hover:text-white transition-colors">
                  Wallets & Accessories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'sort=newest')} className="hover:text-white transition-colors">
                  New Arrivals
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('returns')} className="hover:text-white transition-colors">
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shipping-info')} className="hover:text-white transition-colors">
                  Shipping Rates & Timelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Operations */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Legal & Store
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy (GDPR)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Admin Portal
                </button>
              </li>
              <li>
                <a href="/api/openapi.json" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  OpenAPI Spec (JSON)
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. Bottom Row */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>&copy; 2026 IVER Accessories (Accessories.lt). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono">SEPA Banklink</span>
            <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono">Omniva</span>
            <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono">DPD</span>
            <span className="px-2 py-1 bg-zinc-900 rounded text-[11px] font-mono">Visa/Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
