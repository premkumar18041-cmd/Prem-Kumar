import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'INR' | 'EUR' | 'USD' | 'GBP' | 'PLN';
export type LanguageCode = 'en' | 'lt';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  formatPrice: (amountInEur: number) => string;
  t: (key: string) => string;
}

const rates: Record<CurrencyCode, { rate: number; symbol: string; prefix: boolean }> = {
  INR: { rate: 90.0, symbol: '₹', prefix: true },
  EUR: { rate: 1.0, symbol: '€', prefix: true },
  USD: { rate: 1.08, symbol: '$', prefix: true },
  GBP: { rate: 0.85, symbol: '£', prefix: true },
  PLN: { rate: 4.30, symbol: 'zł', prefix: false }
};

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    announcement: 'Free express shipping on all orders over ₹999 • 14-Day Hassle-Free Returns',
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    newArrivals: 'New Arrivals',
    deals: 'Deals',
    searchPlaceholder: 'Search accessories, jewelry, totes...',
    wishlist: 'Wishlist',
    account: 'Account',
    cart: 'Cart',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    reviews: 'Reviews',
    specifications: 'Specifications',
    delivery: 'Delivery',
    returns: 'Returns',
    subtotal: 'Subtotal',
    discount: 'Discount',
    shipping: 'Shipping',
    total: 'Total',
    checkout: 'Checkout',
    continueShopping: 'Continue Shopping',
    freeShippingNotice: 'You qualify for Free Shipping!',
    freeShippingRemaining: 'Add {amount} more for FREE shipping',
    heroTagline: 'ACCESSORIES THAT COMPLETE YOUR STYLE',
    heroSubtitle: 'Discover thoughtful jewelry, structured bags, and modern styling essentials selected for everyday life.',
    shopNow: 'Shop Now',
    exploreNewArrivals: 'Explore New Arrivals',
    featuredCategories: 'Featured Collections',
    bestSellers: 'Best Sellers',
    recommended: 'Curated For You',
    verifiedPurchase: 'Verified Purchase',
    customerReviews: 'Customer Testimonials',
    newsletterTitle: 'Stay in the Know',
    newsletterSub: 'Subscribe for styling guides, private releases, and exclusive seasonal previews.',
    subscribe: 'Subscribe',
    adminDashboard: 'Admin Panel',
    contactUs: 'Contact Us',
    privacyPolicy: 'Privacy Policy',
    terms: 'Terms & Conditions'
  },
  lt: {
    announcement: 'Nemokamas pristatymas Lietuvoje nuo 40 € • 14 dienų grąžinimo garantija',
    home: 'Pradžia',
    shop: 'Parduotuvė',
    categories: 'Kategorijos',
    newArrivals: 'Naujienos',
    deals: 'Akcijos',
    searchPlaceholder: 'Ieškoti papuošalų, rankinių, apyrankių...',
    wishlist: 'Norų sąrašas',
    account: 'Paskyra',
    cart: 'Krepšelis',
    addToCart: 'Į krepšelį',
    buyNow: 'Pirkti dabar',
    inStock: 'Turime sandėlyje',
    outOfStock: 'Išparduota',
    reviews: 'Atsiliepimai',
    specifications: 'Specifikacijos',
    delivery: 'Pristatymas',
    returns: 'Grąžinimas',
    subtotal: 'Tarpinė suma',
    discount: 'Nuolaida',
    shipping: 'Pristatymas',
    total: 'Mokėti iš viso',
    checkout: 'Apmokėti',
    continueShopping: 'Tęsti apsipirkimą',
    freeShippingNotice: 'Jums taikomas nemokamas pristatymas!',
    freeShippingRemaining: 'Iki nemokamo pristatymo trūksta {amount}',
    heroTagline: 'AKSESUARAI, UŽBAIGIANTYS JŪSŲ STILIŲ',
    heroSubtitle: 'Atraskite apgalvotus papuošalus, elegantiškas rankines ir stilingas kasdienes detales.',
    shopNow: 'Pirkti dabar',
    exploreNewArrivals: 'Žiūrėti naujienas',
    featuredCategories: 'Kategorijos',
    bestSellers: 'Populiariausi',
    recommended: 'Rekomenduojama Jums',
    verifiedPurchase: 'Patvirtintas pirkimas',
    customerReviews: 'Klientų atsiliepimai',
    newsletterTitle: 'Gaukite išskirtinius pasiūlymus',
    newsletterSub: 'Prenumeruokite naujienlaiškį ir sužinokite apie naujas kolekcijas bei akcijas pirmieji.',
    subscribe: 'Prenumeruoti',
    adminDashboard: 'Valdymo pultas',
    contactUs: 'Kontaktai',
    privacyPolicy: 'Privatumo politika',
    terms: 'Pirkimo taisyklės'
  }
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [language, setLanguage] = useState<LanguageCode>('en');

  const formatPrice = (amountInEur: number): string => {
    const config = rates[currency] || rates.INR;
    const converted = amountInEur * config.rate;

    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(Math.round(converted));
    }

    const formattedNum = converted.toFixed(2);
    return config.prefix ? `${config.symbol}${formattedNum}` : `${formattedNum} ${config.symbol}`;
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, language, setLanguage, formatPrice, t }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
