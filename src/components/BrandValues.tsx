import React from 'react';
import { Truck, RefreshCw, ShieldCheck, HeartHandshake } from 'lucide-react';

export const BrandValues: React.FC = () => {
  return (
    <section className="py-14 bg-zinc-100/70 border-y border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white shadow-xs text-zinc-900 shrink-0">
              <Truck className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Fast EU Dispatch</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Stocked in Vilnius. Sent directly via Omniva, DPD, or LP Express parcel lockers and courier.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white shadow-xs text-zinc-900 shrink-0">
              <RefreshCw className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">14-Day Hassle-Free Returns</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Full refund or easy exchange. Try your accessories in the comfort of your home.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white shadow-xs text-zinc-900 shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Secure Payments</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Lithuanian SEPA Banklinks (Swedbank, SEB, Luminor), Visa, Mastercard, Apple Pay, & COD.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white shadow-xs text-zinc-900 shrink-0">
              <HeartHandshake className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Dedicated Support</h3>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Need sizing advice or styling ideas? Reach out anytime at support@accessories.lt.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
