import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Product, Order, ClientProfile, Coupon, Review } from "./src/types";

dotenv.config();

const app = express();
const PORT = process.env.NODE_ENV === "production" ? parseInt(process.env.PORT || "3000", 10) : 3000;

app.use(express.json());

// Initialize DB file path
const dbPath = path.join(process.cwd(), "data", "db.json");

// Ensure data folder exists
if (!fs.existsSync(path.join(process.cwd(), "data"))) {
  fs.mkdirSync(path.join(process.cwd(), "data"));
}

// Default initial data matching the user requirements
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'menu-vitamin-c',
    name: {
      pt: 'Menu Vitamina C',
      en: 'Vitamin C Menu',
      es: 'Menú Vitamina C',
      fr: 'Menu Vitamine C',
      de: 'Vitamin C Menü',
      it: 'Menu Vitamina C',
    },
    category: 'menu',
    price: 10.90,
    contents: {
      pt: ['Sumo de laranja natural fresco', 'Torta de laranja caseira', 'Quiche de cogumelos selvagens', 'Croissants recheados com queijo cottage e kiwi'],
      en: ['Fresh squeezed orange juice', 'Homemade orange roll cake', 'Wild mushroom quiche', 'Croissants filled with cheese & kiwi'],
    },
    image: '/src/assets/images/vitamina_c_menu_1784378715670.jpg',
    description: {
      pt: 'Uma explosão refrescante de vitalidade e frescura para começar o seu dia em Lisboa. Uma combinação perfeita de doces e salgados.',
      en: 'A refreshing burst of vitality and freshness to start your day in Lisbon. A perfect combination of sweet and savory.',
    },
    ingredients: {
      pt: 'Laranjas do Algarve, ovos biológicos, queijo cottage cremoso, kiwis frescos, manteiga.',
      en: 'Algarve oranges, organic eggs, creamy cottage cheese, fresh kiwi, butter.',
    },
    nutrition: { calories: 580, protein: '16g', carbs: '72g', fat: '24g' },
    allergens: { pt: ['Glúten', 'Laticínios', 'Ovos'], en: ['Gluten', 'Dairy', 'Eggs'] },
    weight: '450g',
    deliveryTime: { pt: '30-40 minutos.', en: '30-40 minutes.' },
    featured: true,
  },
  {
    id: 'menu-portuguese',
    name: {
      pt: 'Menu Português',
      en: 'Portuguese Menu',
    },
    category: 'menu',
    price: 9.90,
    contents: {
      pt: ['Leite com chocolate tradicional', 'Pão de mistura com presunto ibérico', 'Pastel de bacalhau crocante', 'Pastel de nata artesanal'],
      en: ['Traditional chocolate milk', 'Mixed bread with Iberian ham', 'Crispy codfish cake', 'Artisanal Pastel de Nata'],
    },
    image: '/src/assets/images/portugues_menu_1784378730192.jpg',
    description: {
      pt: 'A essência da manhã lusitana. Desfrute dos sabores mais emblemáticos de Portugal.',
      en: 'The very essence of a Lusitanian morning. Enjoy the most iconic flavors of Portugal.',
    },
    ingredients: {
      pt: 'Leite biológico, presunto de porco preto, bacalhau, massa folhada crocante, creme de ovos.',
      en: 'Organic milk, black pork ham, cod, crispy puff pastry, egg custard.',
    },
    nutrition: { calories: 650, protein: '22g', carbs: '80g', fat: '26g' },
    allergens: { pt: ['Glúten', 'Laticínios', 'Ovos', 'Peixe'], en: ['Gluten', 'Dairy', 'Eggs', 'Fish'] },
    weight: '480g',
    deliveryTime: { pt: '30-40 minutos.', en: '30-40 minutes.' },
    popular: true,
  },
  {
    id: 'menu-brunch',
    name: {
      pt: 'Menu Brunch',
      en: 'Brunch Menu',
    },
    category: 'menu',
    price: 15.90,
    contents: {
      pt: ['Sumo de laranja natural fresco', 'Ovos mexidos com farinheira tradicional', 'Mini tostadas', 'Rissol de camarão', 'Rissol de leitão da Bairrada', 'Patê de sardinha', 'Tarte caseira de maçã'],
      en: ['Fresh squeezed orange juice', 'Scrambled eggs with farinheira', 'Mini toasts', 'Shrimp rissol', 'Suckling pig rissol', 'Sardine pâté', 'Homemade apple pie'],
    },
    image: '/src/assets/images/brunch_menu_1784378744904.jpg',
    description: {
      pt: 'O banquete definitivo. Um brunch completo que combina iguarias tradicionais portuguesas.',
      en: 'The ultimate feast. A complete brunch combining traditional Portuguese delicacies.',
    },
    ingredients: {
      pt: 'Ovos biológicos, farinheira, camarão, leitão da Bairrada, sardinhas, maçãs frescas.',
      en: 'Organic eggs, farinheira, shrimp, suckling pig, sardines, fresh apples.',
    },
    nutrition: { calories: 890, protein: '34g', carbs: '98g', fat: '38g' },
    allergens: { pt: ['Glúten', 'Laticínios', 'Ovos', 'Crustáceos', 'Peixe'], en: ['Gluten', 'Dairy', 'Eggs', 'Crustaceans', 'Fish'] },
    weight: '650g',
    deliveryTime: { pt: '30-40 minutos.', en: '30-40 minutes.' },
    featured: true,
  },
  {
    id: 'menu-summer',
    name: {
      pt: 'Cardápio de Verão',
      en: 'Summer Menu',
    },
    category: 'menu',
    price: 10.90,
    contents: {
      pt: ['Sumo de limão fresco e hortelã', 'Queijo fresco tradicional', 'Torrada rústica com pasta de atum e alface', 'Torta de limão'],
      en: ['Fresh lemon & mint juice', 'Traditional fresh soft cheese', 'Rustic toast with tuna spread', 'Lemon tart'],
    },
    image: '/src/assets/images/summer_menu_1784378759146.jpg',
    description: {
      pt: 'Fresco, leve e revigorante. Desenvolvido para os dias quentes de Lisboa.',
      en: 'Fresh, light, and invigorating. Perfect for hot Lisbon summer days.',
    },
    ingredients: {
      pt: 'Limão, hortelã, queijo fresco, trigo rústico, atum em azeite, maionese artesanal.',
      en: 'Lemon, mint, fresh cheese, rustic wheat, tuna in olive oil, homemade mayo.',
    },
    nutrition: { calories: 490, protein: '18g', carbs: '62g', fat: '18g' },
    allergens: { pt: ['Glúten', 'Laticínios', 'Peixe'], en: ['Gluten', 'Dairy', 'Fish'] },
    weight: '420g',
    deliveryTime: { pt: '30-40 minutos.', en: '30-40 minutes.' },
  },
  {
    id: 'extra-bifana',
    name: { pt: 'Bifana Portuguesa', en: 'Portuguese Bifana' },
    category: 'extra',
    price: 4.90,
    contents: { pt: ['Carne de porco marinado tradicional em pão rústico'], en: ['Traditional marinated pork in a rustic roll'] },
    image: '/src/assets/images/bifana_portuguesa_gourmet_1784382526853.jpg',
    description: { pt: 'A lendária sandes de porco portuguesa marinada com alho e vinho.', en: 'The legendary Portuguese pork sandwich marinated with garlic and wine.' },
    ingredients: { pt: 'Carne de porco, alho, vinho branco, louro, pão de água.', en: 'Pork, garlic, white wine, bay leaf, traditional bread.' },
    nutrition: { calories: 380, protein: '24g', carbs: '42g', fat: '14g' },
    allergens: { pt: ['Glúten'], en: ['Gluten'] },
    weight: '180g',
    deliveryTime: { pt: 'Entregue bem quente.', en: 'Delivered piping hot.' },
  },
  {
    id: 'extra-prego',
    name: { pt: 'Prego no pão com picles', en: 'Steak Sandwich (Prego) with Pickles' },
    category: 'extra',
    price: 4.90,
    contents: { pt: ['Bife do lombo de novilho em bolo do caco com manteiga de alho e picles'], en: ['Beef steak in garlic bolo do caco with pickles'] },
    image: '/src/assets/images/prego_no_pao_gourmet_1784382300174.jpg',
    description: { pt: 'Bife de novilho tenro em bolo do caco com manteiga de alho e picles.', en: 'Tender beef steak in warm sweet potato bolo do caco bread with pickles.' },
    ingredients: { pt: 'Carne de novilho, alho, manteiga biológica, pão bolo do caco.', en: 'Beef, garlic, butter, bolo do caco sweet potato bread.' },
    nutrition: { calories: 420, protein: '28g', carbs: '44g', fat: '16g' },
    allergens: { pt: ['Glúten', 'Laticínios'], en: ['Gluten', 'Dairy'] },
    weight: '190g',
    deliveryTime: { pt: 'Grelhado na hora.', en: 'Grilled fresh.' },
  },
  {
    id: 'extra-croquete',
    name: { pt: 'Croquete de vitela', en: 'Veal Croquette' },
    category: 'extra',
    price: 2.20,
    contents: { pt: ['Croquete gourmet de vitela frito na perfeição'], en: ['Gourmet veal croquette fried to perfection'] },
    image: '/src/assets/images/croquete_de_vitela_gourmet_1784381878100.jpg',
    description: { pt: 'Croquete super crocante por fora e cremoso por dentro.', en: 'Crispy veal croquette, creamy on the inside.' },
    ingredients: { pt: 'Vitela nacional, pão ralado panko, ovos.', en: 'Veal, panko breadcrumbs, organic eggs.' },
    nutrition: { calories: 150, protein: '8g', carbs: '12g', fat: '7g' },
    allergens: { pt: ['Glúten', 'Ovos', 'Laticínios'], en: ['Gluten', 'Eggs', 'Dairy'] },
    weight: '60g',
    deliveryTime: { pt: 'Bem estaladiço.', en: 'Extra crispy.' },
  },
  {
    id: 'extra-rissol-leitao',
    name: { pt: 'Rissol de Leitão', en: 'Suckling Pig Rissol' },
    category: 'extra',
    price: 3.90,
    contents: { pt: ['Rissol tradicional recheado com leitão da Bairrada assado'], en: ['Traditional rissol stuffed with roasted suckling pig'] },
    image: '/src/assets/images/rissol_de_leitao_gourmet_1784382021885.jpg',
    description: { pt: 'Delicado rissol recheado com leitão da Bairrada assado desfiado.', en: 'Delicate crispy pastry filled with shredded roasted Bairrada suckling pig.' },
    ingredients: { pt: 'Leitão assado, leite, farinha, pão ralado.', en: 'Roasted suckling pig, milk, flour, breadcrumbs.' },
    nutrition: { calories: 210, protein: '11g', carbs: '18g', fat: '10g' },
    allergens: { pt: ['Glúten', 'Laticínios', 'Ovos'], en: ['Gluten', 'Dairy', 'Eggs'] },
    weight: '80g',
    deliveryTime: { pt: 'Quente e crocante.', en: 'Warm and crispy.' },
  },
  {
    id: 'extra-pastel-nata',
    name: { pt: 'Pastel de nata', en: 'Pastel de Nata' },
    category: 'extra',
    price: 1.80,
    contents: { pt: ['Autêntico pastel de nata português com canela à parte'], en: ['Authentic Pastel de Nata with cinnamon on the side'] },
    image: 'https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=600&auto=format&fit=crop',
    description: { pt: 'O doce mais famoso de Portugal, com massa folhada crocante.', en: 'Portugal’s most iconic sweet custard pastry with crispy crust.' },
    ingredients: { pt: 'Trigo, açúcar, gemas de ovos, limão, canela, leite.', en: 'Wheat, sugar, egg yolks, lemon, cinnamon, milk.' },
    nutrition: { calories: 240, protein: '4g', carbs: '32g', fat: '10g' },
    allergens: { pt: ['Glúten', 'Laticínios', 'Ovos'], en: ['Gluten', 'Dairy', 'Eggs'] },
    weight: '75g',
    deliveryTime: { pt: 'Crocante e fresco.', en: 'Crispy and fresh.' },
  },
  {
    id: 'extra-pastel-bacalhau',
    name: { pt: 'Pastel de bacalhau', en: 'Codfish Cake' },
    category: 'extra',
    price: 1.90,
    contents: { pt: ['Bolinho tradicional de bacalhau frito'], en: ['Traditional fried codfish cake'] },
    image: '/src/assets/images/pastel_de_bacalhau_gourmet_1784382159500.jpg',
    description: { pt: 'Bolinho tradicional de bacalhau do Atlântico frito na hora.', en: 'Traditional Atlantic codfish cake fried golden and warm.' },
    ingredients: { pt: 'Bacalhau, batatas, cebola, salsa, ovos.', en: 'Codfish, potatoes, onion, parsley, eggs.' },
    nutrition: { calories: 120, protein: '9g', carbs: '11g', fat: '4g' },
    allergens: { pt: ['Peixe', 'Ovos'], en: ['Fish', 'Eggs'] },
    weight: '70g',
    deliveryTime: { pt: 'Morno.', en: 'Warm.' },
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  { code: 'EARLYBIRD', discountType: 'percentage', value: 10, minSpend: 15 },
  { code: '5PLUS1', discountType: 'fixed', value: 10, minSpend: 50 },
  { code: 'LUXURY', discountType: 'percentage', value: 15 }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-817263',
    items: [
      { productId: 'menu-vitamin-c', name: 'Menu Vitamina C', quantity: 2, price: 10.90 }
    ],
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
  },
  {
    id: 'ord-120938',
    items: [
      { productId: 'menu-portuguese', name: 'Menu Português', quantity: 1, price: 9.90 },
      { productId: 'extra-pastel-nata', name: 'Pastel de nata', quantity: 2, price: 1.80 }
    ],
    reservation: {
      date: '2026-07-18',
      time: '09:00',
      address: 'Alfama, Calçada de São Vicente nº 4',
      postalCode: '1100-012',
      type: 'airbnb',
      accommodationName: 'Traditional Alfama Flat',
      notes: 'Bater suavemente'
    },
    deliveryFee: 3.90,
    subtotal: 13.50,
    discount: 1.35,
    total: 16.05,
    status: 'delivered',
    createdAt: new Date().toISOString(),
    clientEmail: 'tourist-lisbon@example.com',
    paymentMethod: 'stripe'
  }
];

const DEFAULT_CLIENTS: ClientProfile[] = [
  {
    email: 'anaestevesac@gmail.com',
    name: 'Ana Esteves',
    phone: '+351 964 423 221',
    address: 'Penha de França, Rua da Penha',
    postalCode: '1170-120',
    accommodationName: 'Apartamento Turístico Penha',
    favorites: ['menu-vitamin-c', 'extra-pastel-nata']
  },
  {
    email: 'tourist-lisbon@example.com',
    name: 'John Doe',
    phone: '+1 555 123 4567',
    favorites: ['menu-portuguese']
  }
];

const DEFAULT_REVIEWS: Review[] = [
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

// Helper to read database
function readDB() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      clients: DEFAULT_CLIENTS,
      coupons: DEFAULT_COUPONS,
      reviews: DEFAULT_REVIEWS
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const raw = fs.readFileSync(dbPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.reviews) {
      parsed.reviews = DEFAULT_REVIEWS;
      fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (error) {
    console.error("Error reading db file, regenerating defaults", error);
    return {
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      clients: DEFAULT_CLIENTS,
      coupons: DEFAULT_COUPONS,
      reviews: DEFAULT_REVIEWS
    };
  }
}

// Helper to write database
function writeDB(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Initialize Gemini SDK with telemetry header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. Concierge chatbot will fall back to local answers.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// --- API ENDPOINTS ---

// GET products
app.get("/api/products", (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// POST product (Admin)
app.post("/api/products", (req, res) => {
  const db = readDB();
  const newProduct: Product = {
    id: `custom-${Date.now()}`,
    ...req.body
  };
  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

// DELETE product (Admin)
app.delete("/api/products/:id", (req, res) => {
  const db = readDB();
  db.products = db.products.filter((p: Product) => p.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// PUT product popular stock (Admin toggle highlight)
app.put("/api/products/:id/stock", (req, res) => {
  const db = readDB();
  const { popular } = req.body;
  const prod = db.products.find((p: Product) => p.id === req.params.id);
  if (prod) {
    prod.popular = popular;
    writeDB(db);
    return res.json(prod);
  }
  res.status(404).json({ error: "Product not found" });
});

// GET orders
app.get("/api/orders", (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// POST order (Create order)
app.post("/api/orders", (req, res) => {
  const db = readDB();
  const newOrder: Order = {
    id: `ord-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    ...req.body
  };
  db.orders.unshift(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

// PUT order status (Admin update)
app.put("/api/orders/:id/status", (req, res) => {
  const db = readDB();
  const { status } = req.body;
  const order = db.orders.find((o: Order) => o.id === req.params.id);
  if (order) {
    order.status = status;
    writeDB(db);
    return res.json(order);
  }
  res.status(404).json({ error: "Order not found" });
});

// GET clients
app.get("/api/clients", (req, res) => {
  const db = readDB();
  res.json(db.clients);
});

// POST client (Register or Login / sync favorites)
app.post("/api/clients", (req, res) => {
  const db = readDB();
  const { email, name, phone, favorites, address, postalCode, accommodationName } = req.body;
  let client = db.clients.find((c: ClientProfile) => c.email.toLowerCase() === email.toLowerCase());
  
  if (!client) {
    client = {
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      phone: phone || '',
      favorites: favorites || [],
      address,
      postalCode,
      accommodationName
    };
    db.clients.push(client);
  } else {
    if (name) client.name = name;
    if (phone) client.phone = phone;
    if (favorites) client.favorites = favorites;
    if (address) client.address = address;
    if (postalCode) client.postalCode = postalCode;
    if (accommodationName) client.accommodationName = accommodationName;
  }
  
  writeDB(db);
  res.json(client);
});

// GET coupons
app.get("/api/coupons", (req, res) => {
  const db = readDB();
  res.json(db.coupons);
});

// POST coupon (Admin create)
app.post("/api/coupons", (req, res) => {
  const db = readDB();
  const newCoupon: Coupon = req.body;
  db.coupons.push(newCoupon);
  writeDB(db);
  res.status(201).json(newCoupon);
});

// DELETE coupon (Admin)
app.delete("/api/coupons/:code", (req, res) => {
  const db = readDB();
  db.coupons = db.coupons.filter((c: Coupon) => c.code.toUpperCase() !== req.params.code.toUpperCase());
  writeDB(db);
  res.json({ success: true });
});

// GET reviews
app.get("/api/reviews", (req, res) => {
  const db = readDB();
  res.json(db.reviews || []);
});

// POST review
app.post("/api/reviews", (req, res) => {
  const db = readDB();
  const { productId, clientEmail, clientName, rating, text } = req.body;

  if (!productId || !clientEmail || !rating || !text) {
    return res.status(400).json({ error: "Missing required fields: productId, clientEmail, rating, and text are required." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  // Verify that the user has ordered this product
  const userHasOrdered = db.orders.some((order: Order) => 
    order.clientEmail.toLowerCase() === clientEmail.toLowerCase() &&
    order.items.some((item) => item.productId === productId)
  );

  if (!userHasOrdered) {
    return res.status(403).json({ 
      error: "Para avaliar este produto, é necessário que já o tenha encomendado anteriormente." 
    });
  }

  // Check if they already reviewed this product to avoid duplicates, or just allow updating/appending
  // Let's replace any existing review by the same user on the same product, or just append.
  // Replacing is cleaner and prevents spam!
  db.reviews = (db.reviews || []).filter((r: Review) => 
    !(r.productId === productId && r.clientEmail.toLowerCase() === clientEmail.toLowerCase())
  );

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    clientEmail: clientEmail.toLowerCase(),
    clientName: clientName || clientEmail.split('@')[0],
    rating: Number(rating),
    text: text.trim().slice(0, 500), // cap to 500 characters
    createdAt: new Date().toISOString()
  };

  db.reviews.push(newReview);
  writeDB(db);

  res.status(201).json({ success: true, review: newReview });
});

// POST chatbot endpoint utilizing Gemini AI with context
app.post("/api/chat", async (req, res) => {
  const { message, history, lang } = req.body;
  const gemini = getGeminiClient();

  const fallbackResponses: { [lang: string]: string } = {
    pt: "Olá! Obrigado por contactar o Café da manhã na cama LX. Entregamos os pequenos-almoços artesanais mais luxuosos de Lisboa direto à sua porta. As nossas áreas de entrega incluem Alfama, Graça, Arroios, Penha de França, São Vicente e Santa Clara. Faça a sua reserva até às 23:00 para o dia seguinte!",
    en: "Hello! Thank you for contacting Breakfast in Bed LX. We deliver Lisbon's most luxurious artisanal breakfasts straight to your door. Our delivery areas include Alfama, Graça, Arroios, Penha de França, São Vicente, and Santa Clara. Order by 11:00 PM for next-day delivery!"
  };

  if (!gemini) {
    return res.json({ text: fallbackResponses[lang] || fallbackResponses['en'] });
  }

  try {
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user message to prompt
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const sysInstruction = `You are the highly sophisticated luxury hotel concierge and personal culinary assistant for "Café da manhã na cama LX" (breakfastinbedlx.com). 
We deliver premium, high-end, hand-crafted artisanal Portuguese breakfasts directly to tourists, hotel guests, Airbnb lodgings, and guest-houses in key historic Lisbon neighborhoods.

Core Details about us to help you answer:
1. DELIVERY AREAS in Lisbon: Alfama, Graça, São Vicente, Penha de França, Santa Clara, Arroios, and Santa Apolónia. We automatically validate the postal code.
2. DELICIOUS MENUS:
   - Menu Vitamina C (10.90€): Fresh orange juice, orange roll cake, mushroom quiche, croissants filled with cottage cheese and kiwi.
   - Menu Português (9.90€): Chocolate milk, mixed bread with premium black pork presunto ham, pastel de bacalhau, pastel de nata.
   - Menu Brunch (15.90€): Orange juice, scrambled eggs with farinheira, mini toasts, shrimp rissol, suckling pig rissol, sardine pâté, warm apple pie.
   - Cardápio de Verão (10.90€): Lemon & mint lemonade, fresh soft cheese, rustic toast with tuna paste, lemon tart.
3. EXTRAS rules: We have amazing extras (Bifana Portuguesa, Prego no pão, Croquetes, Pastel de Nata, Pastel de Bacalhau, etc.). EXTRAS CAN ONLY BE PURCHASED TOGETHER WITH A MAIN MENU. This rule is automatically enforced by our e-commerce checkout.
4. ORDERING CUTOFF: Orders for the next day MUST be placed before 23:00 (11:00 PM). After 23:00, the system automatically blocks delivery for the immediately following day to ensure freshness of ingredients.
5. DISCRETION: Our couriers perform SILENT DELIVERIES. They do not ring bells or knock loudly unless requested. They leave the luxury breakfast tray carefully outside the guest room or suite door.
6. LANG: Answer the user elegantly, politely, and dynamically in their preferred language (${lang || 'Portuguese'}), with the composure and high standards of a 5-star Ritz or Four Seasons hotel concierge. Keep it concise, helpful, and highly sophisticated. No markdown links.`;

    const result = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: sysInstruction,
        temperature: 0.8
      }
    });

    res.json({ text: result.text || fallbackResponses[lang] || fallbackResponses['en'] });
  } catch (error) {
    console.error("Gemini assistant error:", error);
    res.json({ text: fallbackResponses[lang] || fallbackResponses['en'] });
  }
});

// Configure Vite integration for dev vs prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Luxury Server running on port ${PORT}`);
  });
}

startServer();
