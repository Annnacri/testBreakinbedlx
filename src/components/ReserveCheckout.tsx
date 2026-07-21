import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Building, CreditCard, 
  HelpCircle, ShieldCheck, CheckCircle, Loader2, AlertCircle, Sparkles, X,
  Smartphone, ExternalLink
} from 'lucide-react';
import { ReservationDetails, CartItem, Coupon } from '../types';
import { AVAILABLE_HOURS, DELIVERY_ZONES } from '../data';

interface ReserveCheckoutProps {
  cartItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  coupon: Coupon | null;
  discount: number;
  total: number;
  currentLanguage: string;
  clientEmail: string;
  clientName: string;
  onApplyCoupon: (code: string) => Promise<boolean>;
  onRemoveCoupon: () => void;
  onCompleteCheckout: (reservation: ReservationDetails, paymentMethod: string, guestEmail?: string) => Promise<void>;
  onClose: () => void;
}

export default function ReserveCheckout({
  cartItems,
  subtotal,
  deliveryFee,
  coupon,
  discount,
  total,
  currentLanguage,
  clientEmail,
  clientName,
  onApplyCoupon,
  onRemoveCoupon,
  onCompleteCheckout,
  onClose,
}: ReserveCheckoutProps) {
  const isPartner = clientEmail !== 'anon-tourist@breakfastinbedlx.com' && (
    clientName.toLowerCase().includes('travel') ||
    clientName.toLowerCase().includes('adventure') ||
    clientName.toLowerCase().includes('hotel') ||
    clientName.toLowerCase().includes('agency') ||
    clientName.toLowerCase().includes('host') ||
    clientName.toLowerCase().includes('apart') ||
    clientName.toLowerCase().includes('stay') ||
    clientEmail.toLowerCase().includes('travel') ||
    clientEmail.toLowerCase().includes('partner') ||
    clientEmail.toLowerCase().includes('host')
  );

  const [step, setStep] = useState<1 | 2>(1);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paidTotal, setPaidTotal] = useState<number | null>(null);

  // Payment simulation state
  const [paymentSimulationState, setPaymentSimulationState] = useState<'idle' | 'waiting_mbway' | 'processing_card' | 'redirecting_paypal' | 'done'>('idle');
  const [mbwayTimer, setMbwayTimer] = useState(10);
  const [mbwayPhone, setMbwayPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  // Form details
  const [date, setDate] = useState('');
  const [time, setTime] = useState(AVAILABLE_HOURS[1] || '08:30');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [accType, setAccType] = useState<ReservationDetails['type']>('airbnb');
  const [accommodationName, setAccommodationName] = useState(isPartner ? clientName : '');
  const [roomNumber, setRoomNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  // Guest customer contact details
  const [guestEmail, setGuestEmail] = useState(isPartner ? '' : (clientEmail === 'anon-tourist@breakfastinbedlx.com' ? '' : clientEmail));
  const [guestName, setGuestName] = useState(isPartner ? '' : (clientName || ''));

  useEffect(() => {
    if (isPartner) {
      setAccommodationName(clientName);
      setGuestEmail('');
      setGuestName('');
    } else {
      if (clientEmail && clientEmail !== 'anon-tourist@breakfastinbedlx.com') {
        setGuestEmail(clientEmail);
      }
      if (clientName) {
        setGuestName(clientName);
      }
    }
  }, [clientEmail, clientName, isPartner]);
  
  // Validation messages
  const [zipWarning, setZipWarning] = useState('');
  const [minDate, setMinDate] = useState('');
  const [blockedTodayWarning, setBlockedTodayWarning] = useState(false);

  // Set minimum date and handle past 23:00 logic
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Determine the minimum selectable date
    const minD = new Date();
    if (currentHour >= 23) {
      // It's after 23:00, so we MUST block tomorrow as well!
      minD.setDate(minD.getDate() + 2); // Minimum selectable is the day after tomorrow
      setBlockedTodayWarning(true);
    } else {
      // It's before 23:00, tomorrow is available
      minD.setDate(minD.getDate() + 1); // Minimum selectable is tomorrow
    }
    
    const formatted = minD.toISOString().split('T')[0];
    setMinDate(formatted);
    setDate(formatted);
  }, []);

  // Delivery postal code validation
  const handleZipChange = (val: string) => {
    setPostalCode(val);
    if (!val) {
      setZipWarning('');
      return;
    }

    const cleanZip = val.replace(/\s+/g, '').replace(/-+/g, '');
    const prefix = cleanZip.slice(0, 4); // First 4 digits
    
    // Check against authorized zones zipPrefixes
    const isMatched = DELIVERY_ZONES.some(zone => 
      zone.zipPrefixes.includes(prefix)
    );

    if (prefix.length >= 4 && !isMatched) {
      setZipWarning(
        currentLanguage === 'pt' 
          ? 'Lamentamos, mas de momento não fazemos entregas neste código postal. Entregamos apenas nas seguintes áreas: Penha de França, Graça, São Vicente, Alfama, Santa Clara, Arroios e Santa Apolónia.'
          : 'We are sorry, but we currently do not deliver to this postal code. We only deliver to: Penha de França, Graça, São Vicente, Alfama, Santa Clara, Arroios, and Santa Apolónia.'
      );
    } else {
      setZipWarning('');
    }
  };

  const handleApplyCouponForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const success = await onApplyCoupon(couponInput);
    if (!success) {
      setCouponError(
        currentLanguage === 'pt' 
          ? 'Cupão inválido ou limite mínimo não atingido.' 
          : 'Invalid coupon or minimum limit not reached.'
      );
    } else {
      setCouponError('');
    }
  };

  const [paymentMethod, setPaymentMethod] = useState('mbway');

  const handleSubmitCheckout = async () => {
    if (!date || !time || !address || !postalCode || !accommodationName) {
      alert(
        currentLanguage === 'pt'
          ? 'Por favor preencha todos os campos obrigatórios.'
          : 'Please fill in all required fields.'
      );
      return;
    }

    if (paymentMethod === 'mbway' && !mbwayPhone.trim()) {
      alert(
        currentLanguage === 'pt'
          ? 'Por favor introduza o seu número de telemóvel para o pagamento MB WAY.'
          : 'Please enter your phone number for the MB WAY payment.'
      );
      return;
    }

    if (paymentMethod === 'stripe') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
        alert(
          currentLanguage === 'pt'
            ? 'Por favor preencha todos os dados do cartão de crédito.'
            : 'Please fill in all credit card details.'
        );
        return;
      }
    }

    setPaidTotal(total);
    setIsProcessing(true);
    
    const reservation: ReservationDetails = {
      date,
      time,
      address,
      postalCode,
      type: accType,
      accommodationName,
      roomNumber,
      notes,
    };

    const finalizeAndSaveOrder = async () => {
      try {
        await onCompleteCheckout(reservation, paymentMethod, guestEmail);
        setIsProcessing(false);
        setIsSuccess(true);
        setPaymentSimulationState('done');
      } catch (e) {
        console.error(e);
        setIsProcessing(false);
        setPaymentSimulationState('idle');
        alert('Erro ao processar reserva. Por favor tente novamente.');
      }
    };

    if (paymentMethod === 'mbway') {
      setPaymentSimulationState('waiting_mbway');
      setMbwayTimer(10);
    } else if (paymentMethod === 'stripe') {
      setPaymentSimulationState('processing_card');
      setTimeout(() => {
        finalizeAndSaveOrder();
      }, 3000);
    } else if (paymentMethod === 'applepay' || paymentMethod === 'googlepay' || paymentMethod === 'paypal') {
      setPaymentSimulationState('redirecting_paypal');
      setTimeout(() => {
        finalizeAndSaveOrder();
      }, 3000);
    } else {
      // Multibanco reference or default
      await finalizeAndSaveOrder();
    }
  };

  // MB Way countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentSimulationState === 'waiting_mbway' && mbwayTimer > 0) {
      interval = setInterval(() => {
        setMbwayTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            const reservation: ReservationDetails = {
              date,
              time,
              address,
              postalCode,
              type: accType,
              accommodationName,
              roomNumber,
              notes,
            };
            setPaidTotal(total);
            onCompleteCheckout(reservation, paymentMethod, guestEmail)
              .then(() => {
                setIsProcessing(false);
                setIsSuccess(true);
                setPaymentSimulationState('done');
              })
              .catch((e) => {
                console.error(e);
                setIsProcessing(false);
                setPaymentSimulationState('idle');
                alert('Erro ao processar reserva. Por favor tente novamente.');
              });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentSimulationState, mbwayTimer, date, time, address, postalCode, accType, accommodationName, roomNumber, notes, paymentMethod, guestEmail, onCompleteCheckout]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-md overflow-y-auto">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="checkout-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-stone-100 flex flex-col md:flex-row my-8 max-h-[90vh]"
          >
            {/* Left Column: Form Steps */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                <div>
                  <h2 className="font-sans text-base font-semibold tracking-tight text-stone-950">
                    {currentLanguage === 'pt' ? 'Reserva de Pequeno-Almoço' : 'Breakfast Booking'}
                  </h2>
                  <p className="font-mono text-[10px] text-stone-400 mt-0.5">
                    breakfastinbedlx.com • Luxury Concierge
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`h-2 w-8 rounded-full ${step === 1 ? 'bg-gold-600' : 'bg-stone-200'}`}></span>
                  <span className={`h-2 w-8 rounded-full ${step === 2 ? 'bg-gold-600' : 'bg-stone-200'}`}></span>
                </div>
              </div>

              {paymentSimulationState !== 'idle' && paymentSimulationState !== 'done' ? (
                /* Beautiful Payment Simulation View */
                <div className="space-y-6 py-8 flex flex-col items-center justify-center text-center">
                  {paymentSimulationState === 'waiting_mbway' && (
                    <div className="space-y-6 max-w-sm w-full">
                      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600 animate-pulse">
                        <Smartphone size={40} className="text-rose-500" />
                        <span className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-25"></span>
                      </div>
                      
                      <div className="space-y-2 px-4">
                        <h3 className="font-sans text-sm font-semibold text-stone-900">
                          {currentLanguage === 'pt' ? 'A aguardar autorização MB WAY...' : 'Waiting for MB WAY authorization...'}
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {currentLanguage === 'pt'
                            ? `Enviámos um pedido de autorização de ${total.toFixed(2)}€ para a sua aplicação MB WAY (${mbwayPhone}). Confirme a transação para concluir.`
                            : `We sent a payment request of ${total.toFixed(2)}€ to your MB WAY app (${mbwayPhone}). Please authorize the transaction to complete.`}
                        </p>
                      </div>

                      {/* Progress Bar & Countdown */}
                      <div className="space-y-2 w-full px-8">
                        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${(mbwayTimer / 10) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] font-mono text-stone-400">
                          {currentLanguage === 'pt' ? `Expira em ${mbwayTimer} segundos` : `Expires in ${mbwayTimer} seconds`}
                        </p>
                      </div>

                      {/* Speed up simulator action */}
                      <button
                        type="button"
                        onClick={async () => {
                          setPaidTotal(total);
                          setIsProcessing(true);
                          try {
                            const reservation: ReservationDetails = {
                              date,
                              time,
                              address,
                              postalCode,
                              type: accType,
                              accommodationName,
                              roomNumber,
                              notes,
                            };
                            await onCompleteCheckout(reservation, paymentMethod, guestEmail);
                            setIsProcessing(false);
                            setIsSuccess(true);
                            setPaymentSimulationState('done');
                          } catch (e) {
                            console.error(e);
                            setIsProcessing(false);
                            setPaymentSimulationState('idle');
                            alert('Erro ao simular aprovação.');
                          }
                        }}
                        className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer shadow-sm transition-colors"
                      >
                        {currentLanguage === 'pt' ? 'Aprovar Pagamento Manualmente' : 'Approve Payment Manually'}
                      </button>
                    </div>
                  )}

                  {paymentSimulationState === 'processing_card' && (
                    <div className="space-y-6 max-w-sm w-full">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                        <Loader2 size={40} className="animate-spin text-gold-600" />
                      </div>
                      
                      <div className="space-y-2 px-4">
                        <h3 className="font-sans text-sm font-semibold text-stone-900">
                          {currentLanguage === 'pt' ? 'A processar pagamento...' : 'Processing payment...'}
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {currentLanguage === 'pt'
                            ? 'A comunicar de forma segura com os servidores do Stripe para validar o cartão de crédito e processar o pagamento com encriptação AES-256 de nível bancário.'
                            : 'Communicating securely with Stripe servers to validate credit card and process payment with bank-grade AES-256 encryption.'}
                        </p>
                      </div>
                      <div className="flex justify-center items-center gap-2 text-[10px] text-stone-400">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>PCI-DSS Compliant • Connection Encrypted</span>
                      </div>
                    </div>
                  )}

                  {paymentSimulationState === 'redirecting_paypal' && (
                    <div className="space-y-6 max-w-sm w-full">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Loader2 size={40} className="animate-spin text-blue-500" />
                      </div>
                      
                      <div className="space-y-2 px-4">
                        <h3 className="font-sans text-sm font-semibold text-stone-900">
                          {currentLanguage === 'pt' 
                            ? `A redirecionar...` 
                            : `Redirecting...`}
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {currentLanguage === 'pt'
                            ? `A estabelecer ligação segura com ${paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'applepay' ? 'Apple Pay' : 'Google Pay'}. Por favor não feche esta página.`
                            : `Establishing secure connection with ${paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'applepay' ? 'Apple Pay' : 'Google Pay'}. Please do not close this page.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : step === 1 ? (
                /* Step 1: Delivery Details & Date */
                <div className="space-y-5">
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-700">
                    1. {currentLanguage === 'pt' ? 'Quem é o hóspede e quando entregar?' : 'Who is the guest & when to deliver?'}
                  </h3>

                  {isPartner && (
                    <div className="rounded-xl bg-gold-50/40 p-3.5 border border-gold-100 flex gap-2.5">
                      <span className="text-base">💡</span>
                      <p className="text-[10px] text-stone-700 leading-normal font-sans">
                        {currentLanguage === 'pt' ? (
                          <>
                            <strong>Área de Parceiros:</strong> Por favor, introduza o <strong>Nome do Hóspede</strong> e o <strong>E-mail do Hóspede</strong> para quem está a encomendar. O nome do seu alojamento (<strong>{clientName}</strong>) foi preenchido automaticamente abaixo.
                          </>
                        ) : (
                          <>
                            <strong>Partner Area:</strong> Please enter the <strong>Guest Name</strong> and <strong>Guest E-mail</strong> of the person you are ordering for. Your accommodation name (<strong>{clientName}</strong>) has been prefilled automatically below.
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Guest Contact Details */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        {currentLanguage === 'pt' ? 'Nome do Hóspede *' : 'Guest Name *'}
                      </label>
                      <input
                        id="checkout-guest-name"
                        type="text"
                        required
                        placeholder={currentLanguage === 'pt' ? 'EX: Ana Esteves' : 'EX: Ana Esteves'}
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white py-2 px-3.5 text-xs text-stone-800 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        {currentLanguage === 'pt' ? 'E-mail do Hóspede *' : 'Guest E-mail *'}
                      </label>
                      <input
                        id="checkout-guest-email"
                        type="email"
                        required
                        placeholder="EX: anaesteves@gmail.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white py-2 px-3.5 text-xs text-stone-800 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  {/* Hour Rule notice if active */}
                  {blockedTodayWarning && (
                    <div className="rounded-xl bg-gold-50/50 p-3.5 border border-gold-100 flex gap-2.5">
                      <AlertCircle size={16} className="text-gold-800 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gold-950 leading-relaxed">
                        {currentLanguage === 'pt' 
                          ? 'Passa das 23:00. O dia de amanhã encontra-se fechado para garantir a confeção artesanal dos ingredientes. Escolha datas subsequentes.'
                          : 'Past 11:00 PM. Tomorrow is closed to guarantee artisanal ingredient preparation. Please choose a subsequent date.'}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Date picker */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        {currentLanguage === 'pt' ? 'Data de Entrega *' : 'Delivery Date *'}
                      </label>
                      <div className="relative mt-1.5">
                        <CalendarIcon size={14} className="absolute left-3.5 top-3 text-stone-400" />
                        <input
                          id="checkout-date-input"
                          type="date"
                          min={minDate}
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3.5 text-xs text-stone-800 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>
                    </div>

                    {/* Time picker */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        {currentLanguage === 'pt' ? 'Horário de Entrega *' : 'Delivery Time *'}
                      </label>
                      <div className="relative mt-1.5">
                        <Clock size={14} className="absolute left-3.5 top-3 text-stone-400" />
                        <select
                          id="checkout-time-input"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3.5 text-xs text-stone-800 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                        >
                          {AVAILABLE_HOURS.map((hr) => (
                            <option key={hr} value={hr}>{hr}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Accommodation type selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2">
                      {currentLanguage === 'pt' ? 'Tipo de Alojamento' : 'Accommodation Type'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { id: 'hotel', label: 'Hotel' },
                        { id: 'airbnb', label: 'Airbnb' },
                        { id: 'apartment', label: 'Apart.' },
                        { id: 'other', label: 'Outro' }
                      ] as const).map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setAccType(type.id)}
                          className={`rounded-xl py-2 text-center text-xs font-semibold border transition-all focus:outline-none cursor-pointer ${
                            accType === type.id 
                              ? 'border-gold-600 bg-gold-50/30 text-gold-950 shadow-sm' 
                              : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accommodation Name & Room Number */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        {currentLanguage === 'pt' ? 'Nome do Alojamento / Hotel *' : 'Accommodation / Hotel Name *'}
                      </label>
                      <div className="relative mt-1.5">
                        <Building size={14} className="absolute left-3.5 top-3 text-stone-400" />
                        <input
                          id="checkout-acc-name"
                          type="text"
                          required
                          placeholder="EX: Lisbon Blue Boutique Hotel"
                          value={accommodationName}
                          onChange={(e) => setAccommodationName(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3.5 text-xs text-stone-800 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        {currentLanguage === 'pt' ? 'Nº do Quarto / Porta (Opcional)' : 'Room / Door Number (Optional)'}
                      </label>
                      <input
                        id="checkout-room-number"
                        type="text"
                        placeholder="EX: 402"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3.5 text-xs text-stone-800 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                    </div>
                  </div>

                  {/* Address & Postal Code */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        {currentLanguage === 'pt' ? 'Endereço Completo *' : 'Full Address *'}
                      </label>
                      <div className="relative mt-1.5">
                        <MapPin size={14} className="absolute left-3.5 top-3 text-stone-400" />
                        <input
                          id="checkout-address-input"
                          type="text"
                          required
                          placeholder="EX: Rua da Alfama, nº 25"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-3.5 text-xs text-stone-800 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase">
                        {currentLanguage === 'pt' ? 'Código Postal *' : 'Postal Code *'}
                      </label>
                      <input
                        id="checkout-postal-input"
                        type="text"
                        required
                        placeholder="EX: 1100-025"
                        value={postalCode}
                        onChange={(e) => handleZipChange(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3.5 text-xs text-stone-800 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const mapEl = document.getElementById('delivery-map-section');
                          if (mapEl) {
                            mapEl.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="text-[10px] text-gold-600 underline hover:text-gold-800 text-left mt-1.5 inline-block font-semibold cursor-pointer"
                      >
                        {currentLanguage === 'pt' ? 'Ver Mapa de Áreas de Entrega' : 'View Delivery Areas Map'}
                      </button>
                    </div>
                  </div>

                  {/* Postcode check error / warning banner */}
                  {zipWarning && (
                    <div className="rounded-xl bg-gold-50/40 p-3 border border-gold-100 text-[10px] text-gold-800 flex gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{zipWarning}</span>
                    </div>
                  )}

                  {/* Notes / Silent instruction */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase">
                      {currentLanguage === 'pt' ? 'Notas / Instruções Especiais' : 'Special Instructions / Notes'}
                    </label>
                    <textarea
                      id="checkout-notes-input"
                      rows={2}
                      placeholder={
                        currentLanguage === 'pt'
                          ? 'EX: Por favor entregar silenciosamente sem bater à porta, deixar junto ao elevador.'
                          : 'EX: Please deliver silently without knocking, leave next to the lift.'
                      }
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 px-3.5 text-xs text-stone-800 focus:border-gold-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>

                  {/* Continue step */}
                  <div className="pt-2">
                    <button
                      id="checkout-continue-btn"
                      type="button"
                      disabled={!date || !time || !address || !postalCode || !accommodationName || !guestName.trim() || !guestEmail.trim() || !guestEmail.includes('@') || !!zipWarning}
                      onClick={() => setStep(2)}
                      className="w-full rounded-xl bg-espresso py-3 text-xs font-semibold text-white hover:bg-gold-700 disabled:bg-stone-100 disabled:text-stone-300 transition-colors focus:outline-none cursor-pointer"
                    >
                      {currentLanguage === 'pt' ? 'Continuar para Pagamento' : 'Continue to Payment'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Step 2: Payment Details */
                <div className="space-y-6">
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-700">
                    2. {currentLanguage === 'pt' ? 'Escolha o método de pagamento' : 'Choose payment method'}
                  </h3>

                  {/* Localized payment cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      { id: 'mbway', label: 'MB WAY', desc: 'Telemóvel' },
                      { id: 'multibanco', label: 'Multibanco', desc: 'Entidade/Referência' },
                      { id: 'stripe', label: 'Cartão de Crédito', desc: 'Visa, MasterCard' },
                      { id: 'applepay', label: 'Apple Pay', desc: 'Apple Wallet' },
                      { id: 'googlepay', label: 'Google Pay', desc: 'GPay Wallet' },
                      { id: 'paypal', label: 'PayPal', desc: 'Conta PayPal' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`rounded-xl p-3.5 text-left border flex flex-col justify-between h-20 transition-all focus:outline-none cursor-pointer ${
                          paymentMethod === pm.id 
                            ? 'border-gold-600 bg-gold-50/30 text-gold-950 shadow-sm' 
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span className="font-sans text-xs font-bold">{pm.label}</span>
                        <span className="text-[10px] text-stone-400 mt-1 leading-tight">{pm.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment form mock inputs based on selected payment method */}
                  <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-4">
                    {paymentMethod === 'mbway' && (
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase">
                          {currentLanguage === 'pt' ? 'Número de Telemóvel MB WAY' : 'MB WAY Phone Number'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={mbwayPhone}
                          onChange={(e) => setMbwayPhone(e.target.value)}
                          placeholder="+351 9xx xxx xxx"
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {paymentMethod === 'stripe' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase">
                            {currentLanguage === 'pt' ? 'Número do Cartão' : 'Card Number'}
                          </label>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs focus:border-gold-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase">Validade</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/AA"
                              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs focus:border-gold-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase">CVC</label>
                            <input
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="123"
                              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs focus:border-gold-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {(paymentMethod === 'multibanco' || paymentMethod === 'applepay' || paymentMethod === 'googlepay' || paymentMethod === 'paypal') && (
                      <div className="flex items-center gap-3 text-stone-600">
                        <ShieldCheck className="text-gold-700 shrink-0" size={18} />
                        <p className="text-[11px] leading-relaxed">
                          {currentLanguage === 'pt'
                            ? 'O pagamento será efetuado de forma 100% segura. Será gerada uma referência de pagamento ou um pop-up de validação no final da encomenda.'
                            : 'Payment will be executed 100% securely. A payment reference or pop-up validation will be generated upon confirmation.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl border border-stone-200 py-3 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors focus:outline-none cursor-pointer"
                    >
                      {currentLanguage === 'pt' ? 'Voltar' : 'Back'}
                    </button>
                    <button
                      id="checkout-finalize-btn"
                      type="button"
                      onClick={handleSubmitCheckout}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-espresso py-3 text-xs font-semibold text-white hover:bg-gold-700 transition-colors focus:outline-none shadow-md cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>{currentLanguage === 'pt' ? 'Processando...' : 'Processing...'}</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={14} />
                          <span>{currentLanguage === 'pt' ? 'Confirmar e Pagar' : 'Confirm & Pay'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full md:w-80 bg-stone-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-stone-100 flex flex-col justify-between shrink-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-stone-500">
                    {currentLanguage === 'pt' ? 'Resumo do Pedido' : 'Order Summary'}
                  </h4>
                  <button 
                     id="close-reserve-checkout"
                     onClick={onClose} 
                     className="md:hidden text-stone-400 hover:text-stone-900 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Items preview list */}
                <div className="max-h-44 overflow-y-auto space-y-3.5 pr-1">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-start text-xs">
                      <div className="max-w-[80%]">
                        <p className="font-medium text-stone-900 leading-tight">
                          {item.product.name[currentLanguage] || item.product.name['pt']}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {item.quantity}x • {item.product.price.toFixed(2)}€
                        </p>
                      </div>
                      <span className="font-semibold text-stone-800">
                        {(item.product.price * item.quantity).toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCouponForm} className="border-t border-b border-stone-200/60 py-4 space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="checkout-coupon-input"
                      type="text"
                      placeholder={currentLanguage === 'pt' ? 'Código Promocional' : 'Promo Code'}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-800 focus:border-gold-500 focus:outline-none"
                    />
                    <button
                      id="apply-coupon-btn"
                      type="submit"
                      className="rounded-xl bg-espresso px-3.5 text-xs font-semibold text-white hover:bg-gold-700 cursor-pointer"
                    >
                      {currentLanguage === 'pt' ? 'Aplicar' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-rose-600 font-medium">{couponError}</p>}
                  {coupon && (
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-xs text-emerald-800">
                      <span className="font-semibold font-mono">{coupon.code}</span>
                      <button id="remove-coupon-btn" type="button" onClick={onRemoveCoupon} className="text-emerald-700 font-bold hover:text-emerald-950 cursor-pointer">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </form>

                {/* Financial Math block */}
                <div className="space-y-2.5 text-xs border-b border-stone-200/60 pb-4">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{currentLanguage === 'pt' ? 'Taxa de Entrega' : 'Delivery Fee'}</span>
                    <span>{deliveryFee.toFixed(2)}€</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Desconto</span>
                      <span>-{discount.toFixed(2)}€</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grand Total */}
              <div className="mt-4">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-xs font-semibold text-stone-800">Total</span>
                  <span className="font-sans text-xl font-bold text-stone-950">
                    {total.toFixed(2)}€
                  </span>
                </div>
                <div className="rounded-xl bg-espresso p-3 text-center text-[10px] text-stone-300">
                  {currentLanguage === 'pt' 
                    ? '🔒 Pagamento encriptado e 100% seguro' 
                    : '🔒 Secure and encrypted checkout'}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Success Screen */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl bg-white p-8 text-center border border-stone-100 shadow-2xl space-y-6"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle size={32} />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-sans text-lg font-semibold text-stone-950">
                {currentLanguage === 'pt' ? 'Reserva Efetuada com Sucesso!' : 'Booking Confirmed!'}
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                {currentLanguage === 'pt'
                  ? `A sua encomenda de luxo foi registada na nossa base de dados. Preparamos os ingredientes mais frescos de Lisboa para entregar silenciosamente no dia ${date} às ${time}.`
                  : `Your luxury booking has been recorded in our database. We are preparing Lisbon's freshest artisanal ingredients for a silent delivery on ${date} at ${time}.`}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-100 p-4 text-left space-y-2 bg-stone-50">
              <p className="text-[11px] text-stone-500">
                <strong>{currentLanguage === 'pt' ? 'Nome:' : 'Name:'}</strong> {guestName}
              </p>
              <p className="text-[11px] text-stone-500">
                <strong>{currentLanguage === 'pt' ? 'Endereço:' : 'Address:'}</strong> {address}
              </p>
              <p className="text-[11px] text-stone-500">
                <strong>{currentLanguage === 'pt' ? 'Alojamento:' : 'Accommodation:'}</strong> {accommodationName} {roomNumber ? `(Quarto ${roomNumber})` : ''}
              </p>
              <p className="text-[11px] text-stone-500">
                <strong>Email:</strong> {guestEmail}
              </p>
            </div>

            {/* Payment Method Receipt Details */}
            {paymentMethod === 'multibanco' && (
              <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3 shadow-sm font-sans text-left">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
                  <div className="bg-[#1D5E9B] text-white font-black px-2 py-0.5 text-[9px] rounded tracking-wider">MULTIBANCO</div>
                  <span className="text-[9px] text-stone-500 font-bold uppercase">
                    {currentLanguage === 'pt' ? 'PAGAMENTO DE SERVIÇOS' : 'PAYMENT OF SERVICES'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-xs text-stone-700">
                  <span className="text-stone-400">{currentLanguage === 'pt' ? 'Entidade:' : 'Entity:'}</span>
                  <span className="font-mono font-bold text-right">21898</span>
                  <span className="text-stone-400">{currentLanguage === 'pt' ? 'Referência:' : 'Reference:'}</span>
                  <span className="font-mono font-bold text-right text-espresso tracking-wider">483 920 182</span>
                  <span className="text-stone-400">{currentLanguage === 'pt' ? 'Montante:' : 'Amount:'}</span>
                  <span className="font-mono font-bold text-right text-espresso">{(paidTotal !== null ? paidTotal : total).toFixed(2)}€</span>
                </div>
                <p className="text-[9px] text-stone-400 text-center pt-2 border-t border-stone-100/60 leading-normal">
                  {currentLanguage === 'pt'
                    ? 'Por favor efetue o pagamento no prazo de 2 horas num ATM ou Homebanking para confirmar a sua reserva.'
                    : 'Please complete payment within 2 hours at any ATM or via Homebanking to confirm your booking.'}
                </p>
              </div>
            )}

            {paymentMethod === 'mbway' && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-1.5 text-left">
                <div className="flex items-center gap-2 border-b border-emerald-100/40 pb-2 mb-1.5">
                  <div className="bg-[#E41B53] text-white font-bold px-1.5 py-0.5 text-[8px] rounded tracking-wider">MB WAY</div>
                  <span className="text-[9px] text-emerald-800 font-bold uppercase">
                    {currentLanguage === 'pt' ? 'APROVADO COM SUCESSO' : 'SUCCESSFULLY APPROVED'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-normal">
                  {currentLanguage === 'pt'
                    ? `Transação autorizada com sucesso no número ${mbwayPhone}. O valor de ${(paidTotal !== null ? paidTotal : total).toFixed(2)}€ foi debitado de forma segura.`
                    : `Transaction successfully authorized on phone ${mbwayPhone}. The amount of ${(paidTotal !== null ? paidTotal : total).toFixed(2)}€ was securely debited.`}
                </p>
              </div>
            )}

            {paymentMethod === 'stripe' && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-1.5 text-left">
                <div className="flex items-center gap-2 border-b border-emerald-100/40 pb-2 mb-1.5">
                  <div className="bg-espresso text-white font-semibold px-1.5 py-0.5 text-[8px] rounded tracking-wider">CARD</div>
                  <span className="text-[9px] text-emerald-800 font-bold uppercase">
                    {currentLanguage === 'pt' ? 'PAGAMENTO PROCESSADO' : 'PAYMENT PROCESSED'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-normal">
                  {currentLanguage === 'pt'
                    ? `O seu cartão terminado em **** ${cardNumber.slice(-4) || '4242'} foi debitado com sucesso em ${(paidTotal !== null ? paidTotal : total).toFixed(2)}€ através do Stripe.`
                    : `Your card ending in **** ${cardNumber.slice(-4) || '4242'} was successfully charged ${(paidTotal !== null ? paidTotal : total).toFixed(2)}€ via Stripe.`}
                </p>
              </div>
            )}

            {(paymentMethod === 'applepay' || paymentMethod === 'googlepay' || paymentMethod === 'paypal') && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-1.5 text-left">
                <div className="flex items-center gap-2 border-b border-emerald-100/40 pb-2 mb-1.5">
                  <span className="text-[9px] text-emerald-800 font-bold uppercase">
                    {currentLanguage === 'pt' ? 'PAGAMENTO DIGITAL AUTORIZADO' : 'DIGITAL PAYMENT AUTHORIZED'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-normal">
                  {currentLanguage === 'pt'
                    ? `Autenticação bem-sucedida! O valor de ${(paidTotal !== null ? paidTotal : total).toFixed(2)}€ foi cobrado de forma 100% segura.`
                    : `Authentication successful! The amount of ${(paidTotal !== null ? paidTotal : total).toFixed(2)}€ was charged 100% securely.`}
                </p>
              </div>
            )}

            <button
              id="success-close-btn"
              onClick={onClose}
              className="w-full rounded-xl bg-espresso py-3 text-xs font-semibold text-white hover:bg-gold-700 transition-colors cursor-pointer"
            >
              {currentLanguage === 'pt' ? 'Voltar para a Página Inicial' : 'Back to Home'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
