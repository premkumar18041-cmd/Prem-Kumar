import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, ThumbsUp } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext.js';

interface ReviewItem {
  id: string;
  author: string;
  location: string;
  product: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

const mockReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Gabriele M.',
    location: 'Vilnius, Lithuania',
    product: 'Kashmiri Bangles for Women (16 Pcs Set)',
    rating: 5,
    date: '3 days ago',
    title: 'Exquisite glass craftsmanship, gorgeous colors!',
    comment: 'The sound and finish of these authentic Kashmiri ghangharoo bangles are breathtaking. Arrived safely packed in Omniva locker in just 2 days. Highly recommended!',
    verified: true
  },
  {
    id: 'rev-2',
    author: 'Justina V.',
    location: 'Kaunas, Lithuania',
    product: 'Miraggio Dakota Solid Structured Tote Bag',
    rating: 5,
    date: '1 week ago',
    title: 'Fits my 16" MacBook Pro perfectly with room to spare',
    comment: 'Top tier structured bag for work and office meetings. The faux leather feels luxurious, handles are durable, and it keeps its shape even when loaded with tech.',
    verified: true
  },
  {
    id: 'rev-3',
    author: 'Elena R.',
    location: 'Riga, Latvia',
    product: 'Sculpted Shine Drop Earrings',
    rating: 5,
    date: '2 weeks ago',
    title: 'Lightweight and gentle on sensitive ears',
    comment: 'I usually get irritated by non-fine jewelry, but these are hypoallergenic and comfortable for all-day wear at work. The gold polish catches the light subtly.',
    verified: true
  }
];

export const CustomerReviewsSection: React.FC = () => {
  const { t } = useCurrency();

  return (
    <section className="py-16 bg-white border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <h2 className="font-serif text-3xl font-bold text-zinc-950">
            {t('customerReviews')}
          </h2>
          <p className="text-sm text-zinc-500 mt-2">
            Rated 4.9/5 by over 1,200 verified customers across the Baltics and Europe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-400">{rev.date}</span>
                </div>

                <h4 className="font-serif font-bold text-base text-zinc-900 leading-snug">
                  "{rev.title}"
                </h4>

                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900">{rev.author}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-medium">
                        <CheckCircle className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-400 block">{rev.location}</span>
                </div>

                <span className="text-[10px] font-mono text-zinc-400 text-right max-w-[120px] truncate">
                  {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
