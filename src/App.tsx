import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Heart, Search, Menu, X, ArrowRight, CheckCircle, 
  MapPin, Clock, Phone, Mail, Award, Sparkles, Sliders, ChevronRight, 
  User, ShieldCheck, HeartCrack, HelpCircle, Star
} from 'lucide-react';

import { Product, CartItem, Coupon, Order, ClientProfile, ReservationDetails } from './types';
import { LANGUAGES, TRANSLATIONS, FAQS, DELIVERY_ZONES } from './data';

import ProductModal from './components/ProductModal';
import ReserveCheckout from './components/ReserveCheckout';
import AdminPanel from './components/AdminPanel';
import Chatbot from './components/Chatbot';

export default function App() {
  // Locale State
  const [lang, setLang] = useState<'pt' | 'en' | 'es' | 'fr' | 'de' | 'it'>('pt');
  
  // API Synced States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  // UI Controls
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]); // product IDs
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'menu' | 'extra'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Modals & Panels Controls
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  
  // Client Authentication Session state
  const [currentClient, setCurrentClient] = useState<ClientProfile | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  
  // Coupon applied on cart
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [rulesPopover, setRulesPopover] = useState(false);

  // Load Initial API Data
  const fetchApiData = async () => {
    try {
      const [resProd, resOrd, resCli, resCoup] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/clients'),
        fetch('/api/coupons')
      ]);

      if (resProd.ok) setProducts(await resProd.json());
      if (resOrd.ok) setOrders(await resOrd.json());
      if (resCli.ok) setClients(await resCli.json());
      if (resCoup.ok) setCoupons(await resCoup.json());
    } catch (e) {
      console.error("Failed to load API data, falling back to local simulation", e);
    }
  };

  useEffect(() => {
    fetchApiData();
    
    // Load local client, cart & wishlist
    const localCart = localStorage.getItem('lx_cart');
    if (localCart) setCart(JSON.parse(localCart));

    const localWishlist = localStorage.getItem('lx_wishlist');
    if (localWishlist) setWishlist(JSON.parse(localWishlist));

    const localClient = localStorage.getItem('lx_client');
    if (localClient) {
      const clientObj = JSON.parse(localClient);
      setCurrentClient(clientObj);
      setLoginEmail(clientObj.email);
      setLoginName(clientObj.name);
      setLoginPhone(clientObj.phone);
    }
  }, []);

  // Sync state changes to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('lx_cart', JSON.stringify(newCart));
  };

  const saveWishlist = (newWishlist: string[]) => {
    setWishlist(newWishlist);
    localStorage.setItem('lx_wishlist', JSON.stringify(newWishlist));
  };

  // Business Rules for Extras: "Os extras só podem ser adquiridos juntamente com um menu principal."
  const hasMenuInCart = (items: CartItem[]) => {
    return items.some(item => item.product.category === 'menu');
  };

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    // If adding an extra, verify if at least one menu is already in the cart or is being added
    if (product.category === 'extra' && !hasMenuInCart(cart)) {
      setRulesPopover(true);
      setTimeout(() => setRulesPopover(false), 5000);
      return;
    }

    const existing = cart.find(item => item.product.id === product.id);
    let updated: CartItem[];
    if (existing) {
      updated = cart.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updated = [...cart, { product, quantity: 1 }];
    }
    saveCart(updated);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    let updated = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null);

    // If removing the last menu, we MUST clear all extras to satisfy business rules!
    if (!hasMenuInCart(updated)) {
      updated = updated.filter(item => item.product.category === 'menu');
      if (cart.some(i => i.product.category === 'extra')) {
        alert(
          lang === 'pt'
            ? 'Regra da Boutique: Os extras foram removidos pois é obrigatório ter um Menu Principal no carrinho.'
            : 'Boutique Rule: Extras were removed because having a Main Menu is mandatory.'
        );
      }
    }

    saveCart(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    let updated = cart.filter(item => item.product.id !== productId);
    
    // If no menus left, remove all extras
    if (!hasMenuInCart(updated)) {
      updated = [];
      alert(
        lang === 'pt'
          ? 'Regra da Boutique: Todos os extras foram removidos pois é obrigatório ter um Menu Principal.'
          : 'Boutique Rule: All extras were removed because having a Main Menu is mandatory.'
      );
    }
    saveCart(updated);
  };

  // Wishlist Handler
  const handleToggleWishlist = (product: Product) => {
    let updated: string[];
    if (wishlist.includes(product.id)) {
      updated = wishlist.filter(id => id !== product.id);
    } else {
      updated = [...wishlist, product.id];
    }
    saveWishlist(updated);
  };

  // Client Authentication Handler (register/login)
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          name: loginName,
          phone: loginPhone,
          favorites: wishlist
        }),
      });

      if (response.ok) {
        const profile = await response.json();
        setCurrentClient(profile);
        localStorage.setItem('lx_client', JSON.stringify(profile));
        setShowClientModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setCurrentClient(null);
    localStorage.removeItem('lx_client');
  };

  // Apply Coupon Handler
  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    const coup = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (coup) {
      if (coup.minSpend && subtotal < coup.minSpend) return false;
      setAppliedCoupon(coup);
      return true;
    }
    return false;
  };

  // Complete Checkout Handler
  const handleCompleteCheckout = async (reservation: ReservationDetails, paymentMethod: string, guestEmail?: string) => {
    const emailToUse = guestEmail || currentClient?.email || 'anon-tourist@breakfastinbedlx.com';
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            name: item.product.name[lang] || item.product.name['pt'],
            quantity: item.quantity,
            price: item.product.price
          })),
          reservation,
          deliveryFee: 3.90,
          subtotal,
          discount,
          total,
          clientEmail: emailToUse,
          paymentMethod
        })
      });

      if (response.ok) {
        // Clear cart
        saveCart([]);
        setAppliedCoupon(null);
        fetchApiData(); // reload dashboard stats
      } else {
        throw new Error('Failed to save order');
      }
    } catch (e) {
      console.error("Failed to complete checkout", e);
      throw e;
    }
  };

  // Admin Backoffice Handlers
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchApiData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProductStock = async (productId: string, popular: boolean) => {
    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popular })
      });
      fetchApiData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      fetchApiData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProduct = async (prod: Omit<Product, 'id'>) => {
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod)
      });
      fetchApiData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCoupon = async (coup: Coupon) => {
    try {
      await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coup)
      });
      fetchApiData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      await fetch(`/api/coupons/${code}`, { method: 'DELETE' });
      fetchApiData();
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations for Pricing
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 3.90 : 0;
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
  }
  const total = Math.max(0, subtotal + deliveryFee - discount);

  // Filter Products
  const filteredProducts = products.filter(prod => {
    const matchesSearch = 
      (prod.name[lang] || prod.name['pt'] || '').toLowerCase().includes(search.toLowerCase()) ||
      (prod.description[lang] || prod.description['pt'] || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = 
      activeCategory === 'all' || prod.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getT = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.[ 'pt' ] || '';

  return (
    <div className="min-h-screen bg-cream text-espresso font-sans antialiased selection:bg-gold-100 selection:text-espresso">
      
      {/* EXTRAS RULE DYNAMIC WARNING POPOVER */}
      <AnimatePresence>
        {rulesPopover && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 rounded-2xl bg-espresso p-5 text-white shadow-2xl border border-gold-500/20"
          >
            <div className="flex gap-3">
              <ShieldCheck className="text-gold-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-xs font-semibold text-gold-500 uppercase tracking-widest">Regra da Boutique</h4>
                <p className="text-[11px] text-stone-300 mt-1 leading-relaxed">
                  {getT('rulesWarning')}
                </p>
                <p className="text-[11px] text-gold-500 mt-1.5 font-medium">
                  {getT('ruleBlockText')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-espresso py-2.5 text-center text-[10px] font-medium tracking-widest text-gold-100 uppercase flex items-center justify-center gap-2 border-b border-gold-900/10">
        <Sparkles size={11} className="text-gold-500 animate-pulse" />
        <span>Lisboa Gourmet Delivery • Silent & Discrete Mornings</span>
      </div>

      {/* LUXURY NAVBAR */}
      <nav className="sticky top-0 z-30 border-b border-bege-dark bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="font-serif text-lg font-semibold tracking-tight text-espresso">
              Café da manhã na cama <span className="text-gold-600 font-bold font-sans text-xl">LX</span>
            </span>
          </div>

          {/* Controls: Lang Selector, Profile, Cart, Backoffice Trigger */}
          <div className="flex items-center gap-4">
            
            {/* Language Dropdown Selector */}
            <div className="relative group">
              <button 
                id="lang-dropdown-btn"
                className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-bege px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:border-gold-500 transition-all focus:outline-none"
              >
                <span>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === lang)?.name}</span>
              </button>
              <div className="absolute right-0 mt-1 hidden w-40 origin-top-right rounded-xl border border-stone-100 bg-white shadow-xl group-hover:block transition-all z-50">
                <div className="p-1 space-y-0.5">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      id={`lang-select-${l.code}`}
                      onClick={() => setLang(l.code as any)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                        lang === l.code ? 'bg-gold-50 text-gold-900' : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Session Profile Icon */}
            <button
              id="profile-toggle-btn"
              onClick={() => setShowClientModal(true)}
              className="rounded-full border border-stone-200 bg-bege p-2.5 text-stone-600 hover:border-gold-500 hover:text-espresso transition-all focus:outline-none"
            >
              <User size={15} />
            </button>

            {/* Cart Icon with notification bubble */}
            <button
              id="cart-drawer-toggle"
              onClick={() => setShowCartDrawer(true)}
              className="relative rounded-full border border-stone-200 bg-bege p-2.5 text-stone-600 hover:border-gold-500 hover:text-espresso transition-all focus:outline-none"
            >
              <ShoppingBag size={15} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-600 text-[9px] font-bold text-white shadow-md">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>

            {/* Hidden admin portal trigger inside upper navbar */}
            <button
              id="admin-portal-trigger"
              onClick={() => setShowAdmin(true)}
              className="rounded-full border border-stone-200 bg-espresso p-2.5 text-gold-500 hover:bg-espresso-light transition-all focus:outline-none"
              title="Hospitality Management Backoffice"
            >
              <Sliders size={13} />
            </button>
          </div>
        </div>
      </nav>

      {/* FULL-WIDTH HERO SECTION WITH CUSTOM GENERATED ASSET */}
      <header className="relative overflow-hidden bg-stone-900 py-24 sm:py-32">
        <img
          src="/src/assets/images/hero_breakfast_bed_1784378700762.jpg"
          alt="Gourmet Portuguese Breakfast Tray in Bed"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-xl text-left space-y-6">
            <span className="rounded-full bg-gold-500/20 border border-gold-500/30 backdrop-blur-md px-3.5 py-1 text-xs font-medium text-gold-100 uppercase tracking-widest">
              {lang === 'pt' ? 'Experiência 5 Estrelas' : '5-Star Hospitality Experience'}
            </span>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-5xl">
              {getT('heroTitle')}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-lg">
              {getT('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                id="hero-book-now-btn"
                onClick={() => {
                  const el = document.getElementById('store-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-xl bg-gold-600 px-6 py-3.5 text-xs font-semibold text-white shadow-lg shadow-gold-600/15 hover:bg-gold-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{getT('bookNow')}</span>
                <ArrowRight size={14} />
              </button>
              <button
                id="hero-view-menus-btn"
                onClick={() => {
                  const el = document.getElementById('store-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-xl border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3.5 text-xs font-semibold text-white hover:bg-white/25 transition-all cursor-pointer"
              >
                {getT('viewMenus')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* WHY US SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <div className="text-center space-y-3">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-espresso">
            {getT('whyUs')}
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {getT('whyUsSubtitle')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 'craft', pt: 'Produtos artesanais', en: 'Artisanal products', desc: 'Fabricados por padeiros e pasteleiros tradicionais de Lisboa.' },
            { id: 'fresh', pt: 'Ingredientes frescos diariamente', en: 'Fresh ingredients daily', desc: 'Laranjas espremidas na hora, ovos biológicos locais.' },
            { id: 'silent', pt: 'Entrega silenciosa', en: 'Silent delivery', desc: 'Os estafetas deixam o tabuleiro à porta sem perturbar o sono.' },
            { id: 'luxury', pt: 'Experiência premium', en: 'Premium experience', desc: 'Louça fina e talheres elegantes sobre tabuleiros de madeira.' },
            { id: 'tourist', pt: 'Ideal para turistas', en: 'Perfect for tourists', desc: 'Parceiro oficial de Airbnbs, hotéis e alojamentos turísticos.' },
            { id: 'time', pt: 'Poupe tempo durante a sua estadia', en: 'Save time during your stay', desc: 'Aproveite cada segundo em Lisboa sem filas para o pequeno-almoço.' },
          ].map((benefit) => (
            <div key={benefit.id} className="rounded-2xl border border-bege-dark bg-white p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="rounded-xl bg-gold-50 p-2.5 text-gold-600 shrink-0">
                <CheckCircle size={18} />
              </div>
              <div>
                <h4 className="font-sans text-xs font-semibold text-espresso uppercase tracking-wider">
                  {lang === 'pt' ? benefit.pt : benefit.en}
                </h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE STORE SECTION WITH CATEGORY FILTERS, SEARCH AND GOURMET CARDS */}
      <section id="store-section" className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
        
        {/* Search & Category Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-bege-dark pb-6 mb-10">
          <div>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-espresso">
              {getT('store')}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Todos os produtos são confecionados artesanalmente com ingredientes biológicos.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-stone-400" />
              <input
                id="search-store-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={getT('searchPlaceholder')}
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3.5 text-xs text-stone-800 placeholder-stone-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 sm:w-60"
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: getT('all') },
                { id: 'menu', label: getT('menus') },
                { id: 'extra', label: getT('extras') },
              ].map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-filter-btn-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all focus:outline-none ${
                    activeCategory === cat.id 
                      ? 'border-gold-500 bg-gold-50/40 text-espresso shadow-sm' 
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((prod) => {
            const isFav = wishlist.includes(prod.id);
            const localizedName = prod.name[lang] || prod.name['pt'];
            const localizedDesc = prod.description[lang] || prod.description['pt'];
            
            return (
              <div 
                key={prod.id} 
                className="group relative rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm hover:shadow-md hover:border-gold-500/40 transition-all flex flex-col justify-between"
              >
                {/* Heart wishlist overlay button */}
                <button
                  onClick={() => handleToggleWishlist(prod)}
                  className={`absolute top-6 right-6 z-10 rounded-full p-2 text-stone-500 backdrop-blur-md shadow-sm transition-colors focus:outline-none ${isFav ? 'bg-gold-50 text-gold-600' : 'bg-white/80 hover:bg-white hover:text-espresso'}`}
                >
                  <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
                </button>

                <div>
                  {/* Image Block */}
                  <div className="relative h-48 w-full overflow-hidden rounded-xl bg-stone-100 cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                    <img 
                      src={prod.image} 
                      alt={localizedName} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {prod.featured && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-gold-600 px-2.5 py-0.5 text-[9px] font-semibold text-white tracking-widest uppercase border border-gold-500/10">
                        Destacado
                      </span>
                    )}
                    {prod.popular && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-espresso px-2.5 py-0.5 text-[9px] font-semibold text-gold-100 tracking-widest uppercase border border-stone-800">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-sans text-xs font-semibold text-stone-900 group-hover:text-gold-600 transition-colors cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                        {localizedName}
                      </h3>
                      <span className="font-sans text-xs font-medium text-espresso bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-lg shrink-0">
                        {prod.price.toFixed(2)}€
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-stone-500 leading-relaxed line-clamp-2">
                      {localizedDesc}
                    </p>
                  </div>
                </div>

                {/* Card CTA Actions */}
                <div className="mt-4 pt-3.5 border-t border-stone-100 flex gap-2">
                  <button
                    id={`add-cart-btn-${prod.id}`}
                    onClick={() => handleAddToCart(prod)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-espresso py-2.5 text-xs font-semibold text-white hover:bg-gold-700 transition-colors focus:outline-none cursor-pointer"
                  >
                    <ShoppingBag size={13} />
                    <span>{lang === 'pt' ? 'Reservar' : 'Order'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="rounded-xl border border-stone-200 px-3 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 focus:outline-none cursor-pointer"
                  >
                    Info
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE DELIVERY MAP SECTION */}
      <section className="bg-bege/30 border-t border-b border-bege-dark py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-center">
            
            {/* Delivery zone info */}
            <div className="lg:col-span-1 space-y-4">
              <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-[9px] font-semibold text-gold-800 tracking-widest uppercase">
                {getT('deliveryZones')}
              </span>
              <h2 className="font-serif text-2xl font-medium tracking-tight text-espresso">
                {getT('deliveryZones')}
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                {getT('deliveryZonesSubtitle')}
              </p>
              <div className="divide-y divide-stone-200/80 border-t border-stone-200/40">
                {DELIVERY_ZONES.map((zone) => (
                  <div key={zone.name} className="flex justify-between items-center py-2.5 text-xs">
                    <span className="font-medium text-stone-800">{zone.name}</span>
                    <span className="font-mono text-stone-400">CP: {zone.zipPrefixes.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Luxury Interactive Map */}
            <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-md h-80 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 bg-[#FCFAF6] flex items-center justify-center opacity-65">
                {/* Elegant vectors simulating city plan */}
                <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
              </div>

              {/* Marker pin representations */}
              <div className="absolute top-1/4 left-1/3 flex flex-col items-center">
                <span className="animate-bounce bg-gold-600 text-white rounded-full p-1.5 shadow-lg"><MapPin size={14} /></span>
                <span className="bg-espresso text-white px-2 py-0.5 rounded-lg text-[9px] font-semibold shadow-md tracking-widest uppercase border border-gold-500/20 mt-1">Alfama</span>
              </div>

              <div className="absolute top-1/2 left-2/3 flex flex-col items-center">
                <span className="animate-bounce bg-gold-600 text-white rounded-full p-1.5 shadow-lg"><MapPin size={14} /></span>
                <span className="bg-espresso text-white px-2 py-0.5 rounded-lg text-[9px] font-semibold shadow-md tracking-widest uppercase border border-gold-500/20 mt-1">Graça</span>
              </div>

              <div className="absolute bottom-1/4 left-1/2 flex flex-col items-center">
                <span className="animate-bounce bg-gold-600 text-white rounded-full p-1.5 shadow-lg"><MapPin size={14} /></span>
                <span className="bg-espresso text-white px-2 py-0.5 rounded-lg text-[9px] font-semibold shadow-md tracking-widest uppercase border border-gold-500/20 mt-1">Arroios</span>
              </div>

              <div className="z-10 bg-white/95 rounded-xl border border-stone-100 p-4 w-72 shadow-lg backdrop-blur-sm self-start">
                <h4 className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                  <Star size={13} className="text-gold-500 fill-gold-500" />
                  <span>Raio de Entrega Silencioso</span>
                </h4>
                <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                  Os nossos estafetas elétricos silenciosos garantem entregas discretas nos principais alojamentos e hotéis boutique de Lisboa.
                </p>
              </div>

              <div className="z-10 font-mono text-[9px] text-stone-400 self-end">
                Latitude/Longitude: 38.7223° N, 9.1393° W • Lisboa, Portugal
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
        <h2 className="font-serif text-xl font-medium tracking-tight text-center text-espresso mb-10">
          {lang === 'pt' ? 'Perguntas Frequentes (FAQ)' : 'Frequently Asked Questions (FAQ)'}
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-2">
              <h4 className="font-sans text-xs font-semibold text-stone-900 flex items-center gap-2">
                <HelpCircle size={14} className="text-gold-600 shrink-0" />
                <span>{faq.q[lang] || faq.q['pt']}</span>
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed pl-6 border-l border-stone-100">
                {faq.a[lang] || faq.a['pt']}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BRAND FOOTER */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Col 1: Contacts */}
            <div className="space-y-3">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-100">Contactos Oficiais</h3>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-gold-500" />
                  <span>info@breakfastinbedlx.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-gold-500" />
                  <span>+351 964 423 221</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={13} className="text-gold-500" />
                  <span>Lisboa Centro, Portugal</span>
                </li>
              </ul>
            </div>

            {/* Col 2: Info & Rules */}
            <div className="space-y-3">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-100">Compromisso de Qualidade</h3>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                As encomendas encerram impreterivelmente às 23:00 para garantir a frescura absoluta de todos os pães, quiches e pastelaria fina na manhã seguinte.
              </p>
            </div>

            {/* Col 3: Integrations / Socials */}
            <div className="space-y-3">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-100">Redes Sociais</h3>
              <div className="flex gap-3 text-xs">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition-colors">Instagram</a>
                <span>•</span>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition-colors">Facebook</a>
                <span>•</span>
                <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition-colors">WhatsApp</a>
              </div>
              <p className="text-[10px] text-stone-600 mt-2">
                GA4 • Meta Pixel • Google My Business • Cloudflare Protected
              </p>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-600">
            <p>© 2026 Café da manhã na cama LX. Todos os direitos reservados. breakfastinbedlx.com</p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <a href="#store-section" className="hover:text-gold-500 transition-colors">Termos e Condições</a>
              <span>•</span>
              <a href="#store-section" className="hover:text-gold-500 transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </footer>

      {/* GEMINI CHATBOT FLOATING PANEL */}
      <Chatbot currentLanguage={lang} />

      {/* OVERLAY: PRODUCT MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            currentLanguage={lang}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            isFavorite={wishlist.includes(selectedProduct.id)}
            relatedProducts={products.filter(p => p.id !== selectedProduct.id && p.category === (selectedProduct.category === 'menu' ? 'extra' : 'menu')).slice(0, 3)}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}
      </AnimatePresence>

      {/* OVERLAY: CART DRAWER */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 z-40 flex bg-stone-950/45 backdrop-blur-sm justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-6 overflow-y-auto flex-1 pr-1">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-gold-600" />
                    <h3 className="font-sans text-sm font-semibold text-stone-950">{getT('cart')}</h3>
                  </div>
                  <button id="close-cart-drawer" onClick={() => setShowCartDrawer(false)} className="rounded-full p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-950">
                    <X size={18} />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <HeartCrack size={32} className="text-stone-300 mx-auto" />
                    <p className="text-xs text-stone-500">
                      {lang === 'pt' ? 'O seu carrinho está vazio. Adicione um menu principal para começar!' : 'Your cart is empty. Add a main menu to start!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-3 items-center justify-between border-b border-stone-100 pb-4">
                        <img src={item.product.image} alt={item.product.name[lang] || item.product.name['pt']} className="h-12 w-12 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-semibold text-stone-900 truncate">
                            {item.product.name[lang] || item.product.name['pt']}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{item.product.price.toFixed(2)}€</p>
                        </div>
                        
                        {/* Qty edit buttons */}
                        <div className="flex items-center gap-2 bg-stone-50 rounded-lg px-2 py-1 border border-stone-100 shrink-0">
                          <button id={`qty-dec-${item.product.id}`} onClick={() => handleUpdateQuantity(item.product.id, -1)} className="text-stone-500 hover:text-stone-900 font-bold text-xs">-</button>
                          <span className="text-xs font-bold px-1.5 text-stone-800">{item.quantity}</span>
                          <button id={`qty-inc-${item.product.id}`} onClick={() => handleUpdateQuantity(item.product.id, 1)} className="text-stone-500 hover:text-stone-900 font-bold text-xs">+</button>
                        </div>

                        <button id={`remove-item-${item.product.id}`} onClick={() => handleRemoveFromCart(item.product.id)} className="text-stone-400 hover:text-rose-600 p-1.5">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-stone-100 pt-5 space-y-4 shrink-0">
                  <div className="space-y-2 text-xs text-stone-500">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-900">{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'pt' ? 'Taxa de Entrega' : 'Delivery Fee'}</span>
                      <span className="font-semibold text-stone-900">{deliveryFee.toFixed(2)}€</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
                    <span className="text-xs font-semibold text-stone-800">Total</span>
                    <span className="font-sans text-lg font-bold text-stone-950">{total.toFixed(2)}€</span>
                  </div>

                  <button
                    id="checkout-trigger-btn"
                    onClick={() => {
                      setShowCartDrawer(false);
                      setShowCheckout(true);
                    }}
                    className="w-full rounded-xl bg-espresso py-3 text-center text-xs font-semibold text-white hover:bg-gold-700 transition-colors cursor-pointer"
                  >
                    {getT('bookNow')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY: CLIENT PROFILE / LOGIN MODAL */}
      <AnimatePresence>
        {showClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-100"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <h3 className="font-sans text-sm font-semibold text-stone-950">{getT('clientAccount')}</h3>
                <button id="close-profile-modal" onClick={() => setShowClientModal(false)} className="rounded-full p-1 text-stone-400 hover:bg-stone-50 hover:text-stone-950">
                  <X size={16} />
                </button>
              </div>

              {!currentClient ? (
                /* Login / Register */
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">E-mail *</label>
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      placeholder="EX: anaesteves@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Nome Completo</label>
                    <input
                      id="login-name-input"
                      type="text"
                      placeholder="EX: Ana Esteves"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">Telemóvel / WhatsApp</label>
                    <input
                      id="login-phone-input"
                      type="tel"
                      placeholder="EX: +351 964 423 221"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2 text-xs focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                  <button
                    id="login-submit-btn"
                    type="submit"
                    className="w-full rounded-xl bg-espresso py-3 text-xs font-semibold text-white hover:bg-gold-700 transition-colors cursor-pointer"
                  >
                    Confirmar Registo
                  </button>
                </form>
              ) : (
                /* Profile view and orders history */
                <div className="space-y-5">
                  <div className="rounded-2xl border border-stone-100 bg-stone-50 p-4">
                    <h4 className="font-sans text-xs font-bold text-stone-900">{currentClient.name}</h4>
                    <p className="text-[10px] text-stone-500 mt-1">E-mail: {currentClient.email}</p>
                    <p className="text-[10px] text-stone-500">Phone: {currentClient.phone}</p>
                    <button
                      id="logout-btn"
                      type="button"
                      onClick={handleLogout}
                      className="mt-3.5 text-[10px] font-bold text-rose-600 hover:text-rose-800"
                    >
                      Terminar Sessão
                    </button>
                  </div>

                  <div>
                    <h4 className="font-sans text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Histórico de Reservas</h4>
                    <div className="space-y-2.5 max-h-44 overflow-y-auto">
                      {orders.filter(o => o.clientEmail.toLowerCase() === currentClient.email.toLowerCase()).length === 0 ? (
                        <p className="text-[10px] text-stone-400">Nenhuma reserva registada.</p>
                      ) : (
                        orders
                          .filter(o => o.clientEmail.toLowerCase() === currentClient.email.toLowerCase())
                          .map((o) => (
                            <div key={o.id} className="rounded-xl border border-stone-100 p-2.5 flex justify-between items-center text-[11px] bg-white">
                              <div>
                                <p className="font-semibold text-stone-900">Reserva #{o.id.slice(-6).toUpperCase()}</p>
                                <p className="text-stone-400">{o.reservation.date} às {o.reservation.time}</p>
                              </div>
                              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600 uppercase font-medium">{o.status}</span>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY: ACTIVE RESERVATION & CHECKOUT PANEL */}
      <AnimatePresence>
        {showCheckout && (
          <ReserveCheckout
            cartItems={cart}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            coupon={appliedCoupon}
            discount={discount}
            total={total}
            currentLanguage={lang}
            clientEmail={currentClient?.email || 'anon-tourist@breakfastinbedlx.com'}
            clientName={currentClient?.name || ''}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={() => setAppliedCoupon(null)}
            onCompleteCheckout={handleCompleteCheckout}
            onClose={() => setShowCheckout(false)}
          />
        )}
      </AnimatePresence>

      {/* OVERLAY: HOSPITALITY CONCIERGE BACKOFFICE ADMIN PANEL */}
      <AnimatePresence>
        {showAdmin && (
          <AdminPanel
            products={products}
            orders={orders}
            clients={clients}
            coupons={coupons}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateProductStock={handleUpdateProductStock}
            onDeleteProduct={handleDeleteProduct}
            onAddProduct={handleAddProduct}
            onAddCoupon={handleAddCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
