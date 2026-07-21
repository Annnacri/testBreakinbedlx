import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  currentLanguage: string;
}

export default function Chatbot({ currentLanguage }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Send initial welcoming message based on language
    const greetings: { [lang: string]: string } = {
      pt: 'Olá! Sou o seu concierge pessoal do Café da manhã na cama LX. Como posso ajudar a tornar a sua manhã em Lisboa verdadeiramente luxuosa?',
      en: 'Hello! I am your personal concierge at Breakfast in Bed LX. How may I assist in making your morning in Lisbon truly luxurious?',
      es: '¡Hola! Soy su conserje personal de Desayuno en la cama LX. ¿Cómo puedo ayudarle a hacer su mañana en Lisboa realmente lujosa?',
      fr: 'Bonjour ! Je suis votre concierge personnel pour le Petit-déjeuner au lit LX. Comment puis-je vous aider à rendre votre matinée à Lisbonne unique ?',
      de: 'Hallo! Ich bin Ihr persönlicher Concierge von Frühstück im Bett LX. Wie kann ich Ihren Morgen in Lissabon unvergesslich machen?',
      it: 'Ciao! Sono il tuo concierge personale di Colazione a letto LX. Come posso aiutarti a rendere la tua mattina a Lisbona indimenticabile?',
    };
    
    setMessages([
      { role: 'model', text: greetings[currentLanguage] || greetings['en'] }
    ]);
  }, [currentLanguage]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: updatedMessages.slice(0, -1), // Send history except the last message
          lang: currentLanguage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'model', text: data.text }]);
    } catch (error) {
      console.warn('Error sending message to server, using local chatbot engine:', error);
      
      const query = userText.toLowerCase();
      let reply = '';

      if (currentLanguage === 'pt') {
        if (query.includes('menu') || query.includes('cardapio') || query.includes('comer') || query.includes('pequeno-almoço') || query.includes('pequeno-almoco') || query.includes('prato') || query.includes('opcao') || query.includes('opção')) {
          reply = 'Temos 4 Menus artesanais maravilhosos para si:\n\n1. **Menu Vitamina C** (10.90€): Sumos frescos, torta de laranja fofa e quiche.\n2. **Menu Português** (9.90€): Presunto ibérico, pastel de nata crocante e pastel de bacalhau.\n3. **Menu Brunch** (15.90€): Ovos mexidos com farinheira, rissóis e tarte caseira.\n4. **Cardápio de Verão** (10.90€): Queijo fresco tradicional, torrada com atum e tarte de limão.\n\nLembre-se que também pode adicionar extras deliciosos!';
        } else if (query.includes('zona') || query.includes('onde') || query.includes('entrega') || query.includes('bairro') || query.includes('rua') || query.includes('codigo') || query.includes('código')) {
          reply = 'Entregamos em vários bairros históricos selecionados de Lisboa: **Alfama, Graça, Arroios, Penha de França, São Vicente, Santa Clara e Santa Apolónia**. Nós validamos o seu código postal automaticamente durante a reserva para garantir total conformidade!';
        } else if (query.includes('hora') || query.includes('horario') || query.includes('horário') || query.includes('quando') || query.includes('amanha') || query.includes('amanhã')) {
          reply = 'As entregas são feitas todas as manhãs entre as **08:30 e as 13:30**, no horário exato que escolher! Muito importante: lembre-se de fazer o seu pedido até às **23:00** do dia anterior para garantirmos a frescura total.';
        } else if (query.includes('silencio') || query.includes('silenciosa') || query.includes('bater') || query.includes('campainha') || query.includes('porta')) {
          reply = 'Sim! Respeitamos imenso o seu descanso. Os nossos estafetas são profissionais e treinados para realizar **entregas silenciosas** à porta do seu quarto ou apartamento sem fazer barulho ou tocar a campainha, seguindo as suas indicações.';
        } else if (query.includes('pagamento') || query.includes('pagar') || query.includes('mbway') || query.includes('cartao') || query.includes('cartão') || query.includes('stripe')) {
          reply = 'Aceitamos vários métodos seguros de pagamento de luxo: **MB WAY, Multibanco, Cartão de Crédito (via Stripe) e PayPal** diretamente no nosso checkout.';
        } else if (query.includes('ola') || query.includes('olá') || query.includes('bom dia') || query.includes('boa tarde')) {
          reply = 'Olá! É um prazer falar consigo. Sou o seu concierge pessoal do Café da manhã na cama LX. Como posso ajudar a planear o seu pequeno-almoço gourmet de sonho em Lisboa amanhã?';
        } else {
          reply = 'Compreendo perfeitamente! Como seu concierge pessoal, garanto-lhe que todos os nossos pequenos-almoços são preparados artesanalmente com ingredientes locais frescos do Algarve e entregues com a máxima privacidade nos bairros históricos de Lisboa. Gostaria de saber mais sobre os nossos Menus, Áreas de Entrega, ou as nossas Entregas Silenciosas?';
        }
      } else {
        // English fallback
        if (query.includes('menu') || query.includes('food') || query.includes('breakfast') || query.includes('eat') || query.includes('option') || query.includes('dish')) {
          reply = 'We have 4 exquisite hand-crafted menus:\n\n1. **Vitamin C Menu** (10.90€): Fresh orange juice, orange roll cake, wild mushroom quiche.\n2. **Portuguese Menu** (9.90€): Black pork presunto ham, crispy pastel de nata, pastel de bacalhau.\n3. **Brunch Menu** (15.90€): Scrambled eggs with farinheira, savory rissóis, warm apple pie.\n4. **Summer Menu** (10.90€): Soft fresh cheese, rustic tuna toast, lemon tart.\n\nFeel free to append delicious Extras to your order!';
        } else if (query.includes('zone') || query.includes('where') || query.includes('delivery') || query.includes('deliver') || query.includes('neighborhood') || query.includes('place') || query.includes('street')) {
          reply = 'We deliver straight to your door in premium historic Lisbon neighborhoods: **Alfama, Graça, Arroios, Penha de França, São Vicente, Santa Clara, and Santa Apolónia**. The checkout form will instantly validate your postal code!';
        } else if (query.includes('hour') || query.includes('time') || query.includes('when') || query.includes('schedule') || query.includes('deadline')) {
          reply = 'We deliver fresh every single morning between **08:30 AM and 01:30 PM** at your preferred slot! Please note that next-day orders must be finalized by **11:00 PM** the previous evening to secure the finest ingredients.';
        } else if (query.includes('silent') || query.includes('quiet') || query.includes('bell') || query.includes('door') || query.includes('knock')) {
          reply = 'Absolutely! We cherish your beauty sleep. Our highly professional couriers are trained to perform **silent deliveries** directly at your door or apartment room without ringing bells, respecting your precise wishes.';
        } else if (query.includes('payment') || query.includes('pay') || query.includes('card') || query.includes('paypal') || query.includes('mbway')) {
          reply = 'We support several elegant and highly secure payment options at checkout, including **MB WAY, Multibanco, Credit Cards (processed via Stripe), and PayPal** .';
        } else if (query.includes('hello') || query.includes('hi') || query.includes('good morning')) {
          reply = 'Hello! It is a true pleasure to assist you. I am your personal concierge at Breakfast in Bed LX. How can I help curate your dream gourmet morning in Lisbon tomorrow?';
        } else {
          reply = 'I completely understand! As your personal concierge, I assure you that our luxury breakfasts are hand-cooked using local organic ingredients and delivered with utmost discretion across Lisbon’s historic core. Would you like to know more about our Menus, Delivery Zones, or Silent Delivery practices?';
        }
      }

      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <motion.button
        id="chatbot-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold-600 text-white shadow-xl hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 cursor-pointer"
        aria-label="Open Chatbot"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={24} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-300 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-400"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-24 right-6 z-40 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white/95 shadow-2xl backdrop-blur-md sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-stone-900 px-4 py-3.5 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-600">
                  <Sparkles size={16} className="text-stone-100" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-medium tracking-tight text-stone-100">
                    LX Concierge AI
                  </h3>
                  <p className="font-mono text-[10px] text-stone-400">
                    • Online & ready
                  </p>
                </div>
              </div>
              <button
                id="close-chatbot-btn"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-800 hover:text-white focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto bg-stone-50/50 p-4 space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gold-600 text-white rounded-tr-none'
                        : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-white border border-stone-100 px-4 py-2.5 text-xs text-stone-500 shadow-sm rounded-tl-none">
                    <Loader2 size={14} className="animate-spin text-gold-600" />
                    <span>Confeccionando resposta...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              id="chatbot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-stone-100 bg-white p-3 flex gap-2"
            >
              <input
                id="chatbot-text-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  currentLanguage === 'pt' 
                    ? 'Pergunte sobre menus, entregas ou Lisboa...' 
                    : 'Ask about menus, deliveries or Lisbon...'
                }
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs text-stone-800 placeholder-stone-400 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <button
                id="send-chat-btn"
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center rounded-xl bg-espresso px-3.5 text-white hover:bg-gold-700 disabled:bg-stone-100 disabled:text-stone-300 transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
