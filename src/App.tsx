import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Heart, Search, Menu, X, ArrowRight, CheckCircle, 
  MapPin, Clock, Phone, Mail, Award, Sparkles, Sliders, ChevronRight, 
  User, ShieldCheck, HeartCrack, HelpCircle, Star, Printer, QrCode
} from 'lucide-react';

import { Product, CartItem, Coupon, Order, ClientProfile, ReservationDetails, Review } from './types';
import { LANGUAGES, TRANSLATIONS, FAQS, DELIVERY_ZONES, PRODUCTS } from './data';

import ProductModal from './components/ProductModal';
import ReserveCheckout from './components/ReserveCheckout';
import AdminPanel from './components/AdminPanel';
import Chatbot from './components/Chatbot';
import DeliveryMap from './components/DeliveryMap';
import QRCodeModal from './components/QRCodeModal';
import brandLogo from './assets/images/brand_logo_brunch_1784813575319.jpg';

const receiptTranslations: { [key: string]: { [lang: string]: string } } = {
  receiptTitle: {
    pt: 'Recibo de Encomenda',
    en: 'Order Receipt',
    es: 'Recibo de Pedido',
    fr: 'Reçu de Commande',
    de: 'Bestellbestätigung',
    it: 'Ricevuta d\'Ordine'
  },
  companyName: {
    pt: 'Breakfast in Bed Lisboa',
    en: 'Breakfast in Bed Lisboa',
    es: 'Breakfast in Bed Lisboa',
    fr: 'Breakfast in Bed Lisboa',
    de: 'Breakfast in Bed Lisboa',
    it: 'Breakfast in Bed Lisboa'
  },
  orderDate: {
    pt: 'Data do Pedido',
    en: 'Order Date',
    es: 'Fecha del Pedido',
    fr: 'Date de Commande',
    de: 'Bestelldatum',
    it: 'Data dell\'Ordine'
  },
  deliverOn: {
    pt: 'Data de Entrega',
    en: 'Delivery Date',
    es: 'Fecha de Entrega',
    fr: 'Date de Livraison',
    de: 'Lieferdatum',
    it: 'Data di Consegna'
  },
  reservation: {
    pt: 'Reserva',
    en: 'Reservation',
    es: 'Reserva',
    fr: 'Réservation',
    de: 'Reservierung',
    it: 'Prenotazione'
  },
  client: {
    pt: 'Cliente',
    en: 'Client',
    es: 'Cliente',
    fr: 'Client',
    de: 'Kunde',
    it: 'Cliente'
  },
  deliveryAddress: {
    pt: 'Endereço de Entrega',
    en: 'Delivery Address',
    es: 'Dirección de Entrega',
    fr: 'Adresse de Livraison',
    de: 'Lieferadresse',
    it: 'Indirizzo di Consegna'
  },
  accommodation: {
    pt: 'Alojamento',
    en: 'Accommodation',
    es: 'Alojamiento',
    fr: 'Hébergement',
    de: 'Unterkunft',
    it: 'Alloggio'
  },
  room: {
    pt: 'Quarto',
    en: 'Room',
    es: 'Habitación',
    fr: 'Chambre',
    de: 'Zimmer',
    it: 'Camera'
  },
  notes: {
    pt: 'Notas',
    en: 'Notes',
    es: 'Notas',
    fr: 'Notes',
    de: 'Notizen',
    it: 'Note'
  },
  item: {
    pt: 'Artigo',
    en: 'Item',
    es: 'Artículo',
    fr: 'Article',
    de: 'Artikel',
    it: 'Articolo'
  },
  quantity: {
    pt: 'Qtd',
    en: 'Qty',
    es: 'Cant',
    fr: 'Qté',
    de: 'Menge',
    it: 'Qtà'
  },
  unitPrice: {
    pt: 'Preço Unit.',
    en: 'Unit Price',
    es: 'Precio Unit.',
    fr: 'Prix Unit.',
    de: 'Einzelpreis',
    it: 'Prezzo Unit.'
  },
  total: {
    pt: 'Total',
    en: 'Total',
    es: 'Total',
    fr: 'Total',
    de: 'Gesamt',
    it: 'Totale'
  },
  subtotal: {
    pt: 'Subtotal',
    en: 'Subtotal',
    es: 'Subtotal',
    fr: 'Sous-total',
    de: 'Zwischensumme',
    it: 'Subtotale'
  },
  deliveryFee: {
    pt: 'Taxa de Entrega',
    en: 'Delivery Fee',
    es: 'Tarifa de Envío',
    fr: 'Frais de Livraison',
    de: 'Liefergebühr',
    it: 'Spese di Spedizione'
  },
  discount: {
    pt: 'Desconto',
    en: 'Discount',
    es: 'Descuento',
    fr: 'Remise',
    de: 'Rabatt',
    it: 'Sconto'
  },
  paymentMethod: {
    pt: 'Método de Pagamento',
    en: 'Payment Method',
    es: 'Método de Pago',
    fr: 'Moyen de Paiement',
    de: 'Zahlungsart',
    it: 'Metodo di Pagamento'
  },
  paymentStatus: {
    pt: 'Estado do Pagamento',
    en: 'Payment Status',
    es: 'Estado del Pago',
    fr: 'Statut du Paiement',
    de: 'Zahlungsstatus',
    it: 'Stato del Pagamento'
  },
  paid: {
    pt: 'Confirmado / Pago',
    en: 'Confirmed / Paid',
    es: 'Confirmado / Pagado',
    fr: 'Confirmé / Payé',
    de: 'Bestätigt / Bezahlt',
    it: 'Confermato / Pagato'
  },
  greeting: {
    pt: 'Obrigado por escolher o Breakfast in Bed Lisboa! Bom apetite!',
    en: 'Thank you for choosing Breakfast in Bed Lisboa! Enjoy your breakfast!',
    es: '¡Gracias por elegir Breakfast in Bed Lisboa! ¡Buen provecho!',
    fr: 'Merci d’avoir choisi Breakfast in Bed Lisboa! Bon appétit !',
    de: 'Vielen Dank, dass Sie sich für Breakfast in Bed Lisboa entschieden haben! Guten Appetit!',
    it: 'Grazie per aver scelto Breakfast in Bed Lisboa! Buon appetito!'
  }
};

export default function App() {
  // Locale State
  const [lang, setLang] = useState<'pt' | 'en' | 'es' | 'fr' | 'de' | 'it'>('pt');
  
  // API Synced States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
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
  const [showQrModal, setShowQrModal] = useState(false);
  
  // Client Authentication Session state
  const [currentClient, setCurrentClient] = useState<ClientProfile | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  
  // Coupon applied on cart
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [rulesPopover, setRulesPopover] = useState(false);

  // Load Initial API Data with client-side localStorage fallback for Cloudflare deployments
  const fetchApiData = async () => {
    let apiSuccess = false;
    try {
      const [resProd, resOrd, resCli, resCoup, resRev] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/clients'),
        fetch('/api/coupons'),
        fetch('/api/reviews')
      ]);

      if (resProd.ok && resOrd.ok && resCli.ok && resCoup.ok && resRev.ok) {
        setProducts(await resProd.json());
        setOrders(await resOrd.json());
        setClients(await resCli.json());
        setCoupons(await resCoup.json());
        setReviews(await resRev.json());
        apiSuccess = true;
      }
    } catch (e) {
      console.warn("API endpoints not reachable, falling back to local simulation mode:", e);
    }

    if (!apiSuccess) {
      // Load products
      const localProducts = localStorage.getItem('lx_products_db');
      if (localProducts) {
        setProducts(JSON.parse(localProducts));
      } else {
        setProducts(PRODUCTS);
        localStorage.setItem('lx_products_db', JSON.stringify(PRODUCTS));
      }

      // Load coupons
      const localCoupons = localStorage.getItem('lx_coupons_db');
      if (localCoupons) {
        setCoupons(JSON.parse(localCoupons));
      } else {
        const DEFAULT_COUPONS = [
          { code: 'EARLYBIRD', discountType: 'percentage', value: 10, minSpend: 15 },
          { code: '5PLUS1', discountType: 'fixed', value: 10, minSpend: 50 },
          { code: 'LUXURY', discountType: 'percentage', value: 15 }
        ];
        setCoupons(DEFAULT_COUPONS);
        localStorage.setItem('lx_coupons_db', JSON.stringify(DEFAULT_COUPONS));
      }

      // Load orders
      const localOrders = localStorage.getItem('lx_orders_db');
      if (localOrders) {
        setOrders(JSON.parse(localOrders));
      } else {
        const DEFAULT_ORDERS = [
          {
            id: 'ord-817263',
            items: [{ productId: 'menu-vitamin-c', name: 'Menu Vitamina C', quantity: 2, price: 10.90 }],
            reservation: {
              date: '2026-07-20',
              time: '08:30',
              address: 'Graça, Rua do Sol nº 12',
              postalCode: '1170-025',
              type: 'hotel',
              accommodationName: 'Albergaria Senhora do Monte',
              roomNumber: '104',
              notes: 'Por favor, entrega silenciosa à porta'
            },
            deliveryFee: 3.90,
            subtotal: 21.80,
            discount: 0,
            total: 25.70,
            status: 'pending',
            createdAt: new Date().toISOString(),
            clientEmail: 'anaestevesac@gmail.com',
            paymentMethod: 'mbway'
          }
        ];
        setOrders(DEFAULT_ORDERS);
        localStorage.setItem('lx_orders_db', JSON.stringify(DEFAULT_ORDERS));
      }

      // Load clients
      const localClients = localStorage.getItem('lx_clients_db');
      if (localClients) {
        setClients(JSON.parse(localClients));
      } else {
        const DEFAULT_CLIENTS = [
          {
            email: 'anaestevesac@gmail.com',
            name: 'Ana Esteves',
            phone: '+351 964 423 221',
            address: 'Penha de França, Rua da Penha',
            postalCode: '1170-120',
            accommodationName: 'Apartamento Turístico Penha',
            favorites: ['menu-vitamin-c', 'extra-pastel-nata']
          }
        ];
        setClients(DEFAULT_CLIENTS);
        localStorage.setItem('lx_clients_db', JSON.stringify(DEFAULT_CLIENTS));
      }

      // Load reviews
      const localReviews = localStorage.getItem('lx_reviews_db');
      if (localReviews) {
        setReviews(JSON.parse(localReviews));
      } else {
        const DEFAULT_REVIEWS = [
          {
            id: 'rev-1',
            productId: 'menu-vitamin-c',
            clientEmail: 'anaestevesac@gmail.com',
            clientName: 'Ana Esteves',
            rating: 5,
            text: 'O sumo de laranja é divinal e a torta de laranja é super fofa! Adorei tudo.',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'rev-2',
            productId: 'menu-portuguese',
            clientEmail: 'tourist-lisbon@example.com',
            clientName: 'John Doe',
            rating: 4,
            text: 'Traditional and yummy. The pastel de nata was still crispy when it arrived!',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
          }
        ];
        setReviews(DEFAULT_REVIEWS);
        localStorage.setItem('lx_reviews_db', JSON.stringify(DEFAULT_REVIEWS));
      }
    }
  };

  const handleAddReview = async (productId: string, rating: number, text: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentClient) return { success: false, error: lang === 'pt' ? 'Inicie sessão para deixar uma avaliação.' : 'Please sign in to leave a review.' };
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          clientEmail: currentClient.email,
          clientName: currentClient.name,
          rating,
          text
        })
      });

      const data = await response.json();
      if (response.ok) {
        const resRev = await fetch('/api/reviews');
        if (resRev.ok) setReviews(await resRev.json());
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (e) {
      console.warn("Failed to add review on backend, performing local save", e);
      const localOrders = JSON.parse(localStorage.getItem('lx_orders_db') || '[]');
      const userHasOrdered = localOrders.some((order: any) => 
        order.clientEmail.toLowerCase() === currentClient.email.toLowerCase() &&
        order.items.some((item: any) => item.productId === productId)
      );

      if (!userHasOrdered) {
        return {
          success: false,
          error: lang === 'pt' 
            ? "Para avaliar este produto, é necessário que já o tenha encomendado anteriormente." 
            : "To review this product, you must have ordered it previously."
        };
      }

      const localReviews = JSON.parse(localStorage.getItem('lx_reviews_db') || '[]');
      const filteredReviews = localReviews.filter((r: any) => 
        !(r.productId === productId && r.clientEmail.toLowerCase() === currentClient.email.toLowerCase())
      );

      const newReview = {
        id: `rev-${Date.now()}`,
        productId,
        clientEmail: currentClient.email.toLowerCase(),
        clientName: currentClient.name,
        rating: Number(rating),
        text: text.trim().slice(0, 500),
        createdAt: new Date().toISOString()
      };

      const updated = [...filteredReviews, newReview];
      localStorage.setItem('lx_reviews_db', JSON.stringify(updated));
      setReviews(updated);
      return { success: true };
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

    const clientData = {
      email: loginEmail,
      name: loginName,
      phone: loginPhone,
      favorites: wishlist
    };

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        const profile = await response.json();
        setCurrentClient(profile);
        localStorage.setItem('lx_client', JSON.stringify(profile));
        setShowClientModal(false);
      } else {
        throw new Error('Server registration failed');
      }
    } catch (err) {
      console.warn("Client submit server error, running local authentication", err);
      const localClients = JSON.parse(localStorage.getItem('lx_clients_db') || '[]');
      let client = localClients.find((c: any) => c.email.toLowerCase() === loginEmail.toLowerCase());

      if (!client) {
        client = {
          email: loginEmail.toLowerCase(),
          name: loginName || loginEmail.split('@')[0],
          phone: loginPhone || '',
          favorites: wishlist
        };
        localClients.push(client);
      } else {
        if (loginName) client.name = loginName;
        if (loginPhone) client.phone = loginPhone;
        client.favorites = wishlist;
      }

      localStorage.setItem('lx_clients_db', JSON.stringify(localClients));
      setClients(localClients);
      setCurrentClient(client);
      localStorage.setItem('lx_client', JSON.stringify(client));
      setShowClientModal(false);
    }
  };

  const handleLogout = () => {
    setCurrentClient(null);
    localStorage.removeItem('lx_client');
  };

  const handlePrintOrder = (order: Order) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const t = (key: string) => {
      return receiptTranslations[key]?.[lang] || receiptTranslations[key]?.['en'] || '';
    };

    const formattedDate = new Date(order.createdAt).toLocaleDateString(lang === 'pt' ? 'pt-PT' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f5f5f4; text-align: left; font-size: 13px;">
          <div style="font-weight: 600; color: #443c35;">${item.name}</div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f5f5f4; text-align: center; font-size: 13px; color: #57534e;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f5f5f4; text-align: right; font-size: 13px; color: #57534e;">
          ${item.price.toFixed(2)}€
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f5f5f4; text-align: right; font-weight: 600; font-size: 13px; color: #443c35;">
          ${(item.price * item.quantity).toFixed(2)}€
        </td>
      </tr>
    `).join('');

    const paymentMethodMap: { [key: string]: string } = {
      mbway: 'MB WAY',
      multibanco: 'Multibanco',
      card: 'Stripe',
      paypal: 'PayPal'
    };
    const paymentMethodLabel = paymentMethodMap[order.paymentMethod] || order.paymentMethod.toUpperCase();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${t('receiptTitle')} - #${order.id.slice(-6).toUpperCase()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: #1c1917;
            margin: 0;
            padding: 30px;
            line-height: 1.5;
            background: #fff;
          }
          .receipt-container {
            max-width: 700px;
            margin: 0 auto;
            border: 1px solid #e7e5e4;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f5f5f4;
            padding-bottom: 24px;
            margin-bottom: 28px;
          }
          .brand h1 {
            margin: 0 0 6px 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #443c35;
          }
          .brand p {
            margin: 0;
            font-size: 11px;
            color: #78716c;
          }
          .meta-info {
            text-align: right;
          }
          .meta-info h2 {
            margin: 0 0 8px 0;
            font-size: 15px;
            font-weight: 700;
            color: #b45309;
            letter-spacing: 0.05em;
          }
          .meta-info p {
            margin: 3px 0;
            font-size: 11px;
            color: #78716c;
          }
          .grid-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 28px;
          }
          .info-block {
            background-color: #fafaf9;
            border-radius: 12px;
            padding: 16px;
            border: 1px solid #f5f5f4;
          }
          .info-block h3 {
            margin: 0 0 8px 0;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #78716c;
            border-bottom: 1px solid #e7e5e4;
            padding-bottom: 4px;
          }
          .info-block p {
            margin: 4px 0;
            font-size: 12px;
            color: #443c35;
            line-height: 1.4;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
          }
          th {
            text-align: left;
            padding: 10px 16px;
            background-color: #fafaf9;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #78716c;
            border-bottom: 1px solid #e7e5e4;
          }
          .totals-table {
            width: 280px;
            margin-left: auto;
            margin-bottom: 32px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 12px;
            color: #57534e;
          }
          .totals-row.grand-total {
            border-top: 2px solid #e7e5e4;
            padding-top: 10px;
            font-size: 15px;
            font-weight: 700;
            color: #443c35;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            background-color: #d1fae5;
            color: #065f46;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            border-radius: 9999px;
            letter-spacing: 0.05em;
          }
          .footer {
            border-top: 1px dashed #e7e5e4;
            padding-top: 24px;
            text-align: center;
            font-size: 11px;
            color: #78716c;
          }
          @media print {
            body {
              padding: 0;
            }
            .receipt-container {
              border: none;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="brand">
              <h1>Breakfast in Bed</h1>
              <p>Lisboa, Portugal</p>
              <p>info@breakfastinbedlx.com | www.breakfastinbedlx.com</p>
            </div>
            <div class="meta-info">
              <h2>${t('receiptTitle').toUpperCase()}</h2>
              <p><strong>${t('reservation')}:</strong> #${order.id.slice(-6).toUpperCase()}</p>
              <p><strong>${t('orderDate')}:</strong> ${formattedDate}</p>
            </div>
          </div>

          <div class="grid-info">
            <div class="info-block">
              <h3>${t('client')}</h3>
              <p><strong>${currentClient?.name}</strong></p>
              <p>${currentClient?.email}</p>
              <p>${currentClient?.phone}</p>
            </div>
            <div class="info-block">
              <h3>${t('deliveryAddress')}</h3>
              <p><strong>${t('deliverOn')}:</strong> ${order.reservation.date} às ${order.reservation.time}</p>
              <p><strong>${t('accommodation')}:</strong> ${order.reservation.accommodationName} ${order.reservation.roomNumber ? `(Quarto ${order.reservation.roomNumber})` : ''}</p>
              <p>${order.reservation.address}, ${order.reservation.postalCode}</p>
              ${order.reservation.notes ? `<p style="font-style: italic; font-size: 11px; color: #78716c; margin-top: 6px;"><strong>${t('notes')}:</strong> "${order.reservation.notes}"</p>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left; padding: 10px 16px;">${t('item')}</th>
                <th style="text-align: center; width: 60px; padding: 10px 16px;">${t('quantity')}</th>
                <th style="text-align: right; width: 100px; padding: 10px 16px;">${t('unitPrice')}</th>
                <th style="text-align: right; width: 100px; padding: 10px 16px;">${t('total')}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-table">
            <div class="totals-row">
              <span>${t('subtotal')}</span>
              <span>${order.subtotal.toFixed(2)}€</span>
            </div>
            <div class="totals-row">
              <span>${t('deliveryFee')}</span>
              <span>${order.deliveryFee.toFixed(2)}€</span>
            </div>
            ${order.discount > 0 ? `
              <div class="totals-row" style="color: #b45309;">
                <span>${t('discount')}</span>
                <span>-${order.discount.toFixed(2)}€</span>
              </div>
            ` : ''}
            <div class="totals-row grand-total">
              <span>${t('total')}</span>
              <span>${order.total.toFixed(2)}€</span>
            </div>
            <div class="totals-row" style="margin-top: 12px; align-items: center;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #78716c;">${t('paymentMethod')}</span>
              <span style="font-size: 11px; font-weight: 600; color: #443c35;">${paymentMethodLabel}</span>
            </div>
            <div class="totals-row" style="align-items: center;">
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #78716c;">${t('paymentStatus')}</span>
              <span class="badge">${t('paid')}</span>
            </div>
          </div>

          <div class="footer">
            <p>${t('greeting')}</p>
            <p style="font-size: 9px; color: #a8a29e; margin-top: 16px;">© 2026 Breakfast in Bed Lisboa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
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
    const orderData = {
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
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
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
      console.warn("Failed to complete checkout on server, running local checkout", e);
      const localOrders = JSON.parse(localStorage.getItem('lx_orders_db') || '[]');
      const newOrder = {
        id: `ord-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString(),
        status: 'pending' as const,
        ...orderData
      };
      const updatedOrders = [newOrder, ...localOrders];
      localStorage.setItem('lx_orders_db', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);

      // Clear cart
      saveCart([]);
      setAppliedCoupon(null);
    }
  };

  // Admin Backoffice Handlers
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchApiData();
        return;
      }
      throw new Error('Status update failed');
    } catch (e) {
      console.warn("Order status update server error, running local update", e);
      const localOrders = JSON.parse(localStorage.getItem('lx_orders_db') || '[]');
      const updated = localOrders.map((o: any) => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('lx_orders_db', JSON.stringify(updated));
      setOrders(updated);
    }
  };

  const handleUpdateProductStock = async (productId: string, popular: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popular })
      });
      if (response.ok) {
        fetchApiData();
        return;
      }
      throw new Error('Stock update failed');
    } catch (e) {
      console.warn("Product stock update server error, running local update", e);
      const localProducts = JSON.parse(localStorage.getItem('lx_products_db') || '[]');
      const updated = localProducts.map((p: any) => p.id === productId ? { ...p, popular } : p);
      localStorage.setItem('lx_products_db', JSON.stringify(updated));
      setProducts(updated);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchApiData();
        return;
      }
      throw new Error('Delete failed');
    } catch (e) {
      console.warn("Product delete server error, running local delete", e);
      const localProducts = JSON.parse(localStorage.getItem('lx_products_db') || '[]');
      const updated = localProducts.filter((p: any) => p.id !== productId);
      localStorage.setItem('lx_products_db', JSON.stringify(updated));
      setProducts(updated);
    }
  };

  const handleAddProduct = async (prod: Omit<Product, 'id'>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prod)
      });
      if (response.ok) {
        fetchApiData();
        return;
      }
      throw new Error('Add failed');
    } catch (e) {
      console.warn("Product add server error, running local add", e);
      const localProducts = JSON.parse(localStorage.getItem('lx_products_db') || '[]');
      const newProduct = {
        id: `custom-${Date.now()}`,
        ...prod
      };
      const updated = [...localProducts, newProduct];
      localStorage.setItem('lx_products_db', JSON.stringify(updated));
      setProducts(updated);
    }
  };

  const handleAddCoupon = async (coup: Coupon) => {
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coup)
      });
      if (response.ok) {
        fetchApiData();
        return;
      }
      throw new Error('Add coupon failed');
    } catch (e) {
      console.warn("Coupon add server error, running local add", e);
      const localCoupons = JSON.parse(localStorage.getItem('lx_coupons_db') || '[]');
      const updated = [...localCoupons, coup];
      localStorage.setItem('lx_coupons_db', JSON.stringify(updated));
      setCoupons(updated);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const response = await fetch(`/api/coupons/${code}`, { method: 'DELETE' });
      if (response.ok) {
        fetchApiData();
        return;
      }
      throw new Error('Delete failed');
    } catch (e) {
      console.warn("Coupon delete server error, running local delete", e);
      const localCoupons = JSON.parse(localStorage.getItem('lx_coupons_db') || '[]');
      const updated = localCoupons.filter((c: any) => c.code.toUpperCase() !== code.toUpperCase());
      localStorage.setItem('lx_coupons_db', JSON.stringify(updated));
      setCoupons(updated);
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

      {/* ORDER DEADLINE NOTICE BAR */}
      <div className="bg-gold-50/90 border-b border-gold-200/60 py-2 px-4 text-center text-xs text-gold-950 font-medium flex items-center justify-center gap-2">
        <Clock size={13} className="text-gold-600 shrink-0 animate-pulse" />
        <span>
          <strong>{lang === 'pt' ? 'Nota Importante: ' : 'Important Note: '}</strong>
          {getT('orderDeadlineNotice')}
        </span>
      </div>

      {/* LUXURY NAVBAR */}
      <nav className="sticky top-0 z-30 border-b border-bege-dark bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src={brandLogo} 
              alt="BRUNCH BREAKFAST WELCOME - Café da manhã na cama LX" 
              className="h-11 sm:h-12 w-auto object-contain rounded-xl shadow-sm border border-stone-200/80 group-hover:scale-105 transition-transform" 
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="font-serif text-sm sm:text-base font-bold tracking-tight text-espresso leading-tight">
                BRUNCH BREAKFAST WELCOME
              </span>
              <span className="text-[10px] text-gold-700 font-sans font-semibold tracking-wider uppercase">
                Café da manhã na cama LX
              </span>
            </div>
          </div>

          {/* Controls: Lang Selector, QR Code, Profile, Cart, Backoffice Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* QR Code Button */}
            <button 
              id="qr-code-toggle-btn"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 rounded-full border border-gold-300/80 bg-gold-50/80 px-3 py-1.5 text-xs font-semibold text-gold-950 hover:bg-gold-100 hover:border-gold-400 transition-all focus:outline-none shadow-sm"
              title="Gerar / Baixar QR Code do Site"
            >
              <QrCode size={14} className="text-gold-700" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

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
            const prodReviews = reviews.filter(r => r.productId === prod.id);
            const avgRating = prodReviews.length > 0 
              ? (prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1)
              : null;
            
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
                    {avgRating && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-gold-600 font-bold">
                        <Star size={10} className="fill-gold-500 text-gold-500" />
                        <span>{avgRating}</span>
                        <span className="text-stone-400 font-normal">({prodReviews.length})</span>
                      </div>
                    )}
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
      <section id="delivery-map-section" className="bg-bege/30 border-t border-b border-bege-dark py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* Delivery zone info */}
            <div className="lg:col-span-4 space-y-4">
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

            {/* Interactive Live Google / Schematic Map */}
            <div className="lg:col-span-8 w-full">
              <DeliveryMap currentLanguage={lang} />
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
          
          {/* Footer Logo Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800/80">
            <div className="flex items-center gap-4">
              <img 
                src={brandLogo} 
                alt="BRUNCH BREAKFAST WELCOME Logo" 
                className="h-16 w-auto object-contain rounded-2xl bg-white/95 p-1.5 shadow-md border border-gold-500/30" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-100 tracking-tight">BRUNCH BREAKFAST WELCOME</h2>
                <p className="text-xs text-gold-400 font-sans font-medium">Café da Manhã na Cama • Lisboa Gourmet Delivery</p>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 self-start sm:self-auto rounded-xl bg-stone-900 border border-gold-500/40 px-4 py-2 text-xs font-semibold text-gold-300 hover:bg-gold-500/10 hover:border-gold-400 transition-all shadow-sm"
            >
              <QrCode size={16} className="text-gold-400" />
              <span>Ver & Baixar QR Code</span>
            </button>
          </div>

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
            reviews={reviews}
            currentClient={currentClient}
            hasOrderedProduct={
              currentClient 
                ? orders.some(o => o.clientEmail.toLowerCase() === currentClient.email.toLowerCase() && o.items.some(item => item.productId === selectedProduct.id))
                : false
            }
            onAddReview={handleAddReview}
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
                            <div key={o.id} className="rounded-xl border border-stone-100 p-2.5 flex flex-col text-[11px] bg-white gap-2">
                              <div className="flex justify-between items-center w-full">
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-stone-900">Reserva #{o.id.slice(-6).toUpperCase()}</p>
                                  <p className="text-stone-400 truncate">{o.reservation.date} às {o.reservation.time}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handlePrintOrder(o)}
                                    className="flex items-center gap-1 rounded-lg px-2 py-1 border border-stone-200 hover:border-gold-500 hover:bg-gold-50/40 text-[9px] font-medium text-stone-600 hover:text-gold-700 transition-all cursor-pointer shadow-sm"
                                    title={lang === 'pt' ? 'Descarregar Recibo / Imprimir' : 'Download Receipt / Print'}
                                  >
                                    <Printer size={11} className="text-stone-500" />
                                    <span>{lang === 'pt' ? 'Recibo' : 'Receipt'}</span>
                                  </button>
                                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600 uppercase font-medium">{o.status}</span>
                                </div>
                              </div>
                              <div className="border-t border-stone-50/80 pt-1.5 mt-0.5">
                                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                                  {lang === 'pt' ? 'Avaliar Artigos:' : 'Review Items:'}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {o.items.map((item) => {
                                    const targetProd = products.find(p => p.id === item.productId);
                                    return (
                                      <button
                                        key={item.productId}
                                        onClick={() => {
                                          if (targetProd) {
                                            setSelectedProduct(targetProd);
                                            setShowClientModal(false);
                                          }
                                        }}
                                        className="text-[9px] bg-stone-50 hover:bg-gold-50 hover:text-gold-700 text-stone-600 border border-stone-200/60 rounded-lg px-2 py-1 font-medium transition-colors cursor-pointer flex items-center gap-1 hover:border-gold-300"
                                        title={lang === 'pt' ? `Avaliar ${item.name}` : `Review ${item.name}`}
                                      >
                                        <Star size={8} className="text-gold-500 fill-gold-500" />
                                        <span>{item.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
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

      {/* OVERLAY: QR CODE GENERATOR & DOWNLOAD MODAL */}
      <QRCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        brandLogoUrl={brandLogo}
      />

    </div>
  );
}
