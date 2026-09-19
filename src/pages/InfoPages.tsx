import React from 'react';
import { Truck, RotateCcw, HelpCircle, Shield, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext.js';

interface InfoPageProps {
  type: 'shipping-info' | 'returns' | 'faq' | 'privacy' | 'contact';
  onNavigateToShop: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ type, onNavigateToShop }) => {
  const { formatPrice } = useCurrency();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onNavigateToShop}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shop</span>
      </button>

      {type === 'shipping-info' && (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-900">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-950">Shipping Rates & Timelines</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Dispatched directly from our fulfillment hub</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-zinc-700 leading-relaxed">
            <h3 className="font-bold text-sm text-zinc-900">Standard Delivery</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Express Parcel Locker:</strong> {formatPrice(2.99)} (Free on orders above {formatPrice(40)}). Delivered in 1–2 business days.</li>
              <li><strong>Local Hub Locker:</strong> {formatPrice(2.49)} (Free on orders above {formatPrice(40)}). Delivered in 1–2 business days.</li>
              <li><strong>Direct Courier to Door:</strong> {formatPrice(4.99)} (Free on orders above {formatPrice(40)}). Direct courier delivery with SMS delivery window.</li>
            </ul>

            <h3 className="font-bold text-sm text-zinc-900 pt-4">International Priority Dispatch</h3>
            <p>
              Standard international priority courier dispatch for {formatPrice(8.99)} (Free on orders above {formatPrice(75)}). 
              Average delivery time is 3–6 business days depending on destination.
            </p>
          </div>
        </div>
      )}

      {type === 'returns' && (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-900">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-950">14-Day Statutory Returns</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Under EU consumer protection and Lithuanian e-commerce law</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-zinc-700 leading-relaxed">
            <p>
              You have the legal right to cancel your purchase within <strong>14 calendar days</strong> from the date of package collection without providing a reason.
            </p>
            <h3 className="font-bold text-sm text-zinc-900">How to Return:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to the <strong>Track Order</strong> page and click "Request Return", or email <strong>support@accessories.lt</strong>.</li>
              <li>You will receive an automated prepaid Omniva return locker barcode.</li>
              <li>Drop the securely packed accessory at any Omniva locker across Lithuania or the Baltics.</li>
              <li>Your refund is processed to the original payment method within 3 business days of package inspection.</li>
            </ol>
          </div>
        </div>
      )}

      {type === 'faq' && (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-900">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-950">Frequently Asked Questions</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Everything you need to know about shopping on Accessories.lt</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="border-b border-zinc-100 pb-4">
              <h4 className="font-bold text-zinc-900">Are the Kashmiri bangles authentic glass?</h4>
              <p className="text-zinc-600 mt-1">
                Yes! Every set of Kashmiri bangles is made of authentic blown glass with hand-painted gold filigree accents and delicate metallic ghangharoo bells that produce a soft, melodic chime.
              </p>
            </div>

            <div className="border-b border-zinc-100 pb-4">
              <h4 className="font-bold text-zinc-900">What size laptop fits inside the Miraggio Dakota tote bag?</h4>
              <p className="text-zinc-600 mt-1">
                The structured Dakota tote easily accommodates 13", 14", 15", and up to 16" laptops (such as Apple MacBook Pro 16" or Dell XPS 15), with dedicated compartments for chargers, notebooks, and a water bottle.
              </p>
            </div>

            <div className="border-b border-zinc-100 pb-4">
              <h4 className="font-bold text-zinc-900">Are the jewelry items safe for sensitive skin?</h4>
              <p className="text-zinc-600 mt-1">
                Yes, all earrings, necklaces, and bangles comply with strict EU REACH standards: 100% lead-free, cadmium-free, and hypoallergenic nickel-tested.
              </p>
            </div>
          </div>
        </div>
      )}

      {type === 'privacy' && (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-900">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-950">Privacy & GDPR Compliance</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Protecting your personal data under EU Regulation 2016/679</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-zinc-700 leading-relaxed">
            <p>
              IVER Accessories (Accessories.lt) is committed to safeguarding personal information collected during order fulfillment, customer inquiries, and session management.
            </p>
            <p>
              We never sell or rent your data. Contact and delivery addresses are transmitted securely exclusively to our contracted carriers (Omniva, DPD, LP Express) solely to execute delivery.
            </p>
          </div>
        </div>
      )}

      {type === 'contact' && (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-900">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-zinc-950">Contact Accessories.lt</h1>
              <p className="text-xs text-zinc-500 mt-0.5">We are here to help with sizing, orders, and delivery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-zinc-50 rounded-xl space-y-1 text-xs">
              <Mail className="w-4 h-4 text-amber-700" />
              <p className="font-bold text-zinc-900">Email Support</p>
              <p className="text-zinc-600">support@accessories.lt</p>
              <span className="text-[11px] text-zinc-400">Response within 2 hours</span>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl space-y-1 text-xs">
              <Phone className="w-4 h-4 text-amber-700" />
              <p className="font-bold text-zinc-900">Telephone</p>
              <p className="text-zinc-600">+370 600 12345</p>
              <span className="text-[11px] text-zinc-400">Mon-Fri 09:00 - 18:00 EET</span>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl space-y-1 text-xs">
              <MapPin className="w-4 h-4 text-amber-700" />
              <p className="font-bold text-zinc-900">Vilnius Showroom</p>
              <p className="text-zinc-600">Sec 110, Vilnius</p>
              <span className="text-[11px] text-zinc-400">Lithuania</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
