import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, Heart, Scale, Clock, ShieldCheck, Star, MessageSquare } from 'lucide-react';
import { Product, Review, ClientProfile } from '../types';

interface ProductModalProps {
  product: Product;
  currentLanguage: string;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isFavorite: boolean;
  relatedProducts: Product[];
  onSelectProduct: (product: Product) => void;
  reviews: Review[];
  currentClient: ClientProfile | null;
  hasOrderedProduct: boolean;
  onAddReview: (productId: string, rating: number, text: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ProductModal({
  product,
  currentLanguage,
  onClose,
  onAddToCart,
  onAddToWishlist,
  isFavorite,
  relatedProducts,
  onSelectProduct,
  reviews,
  currentClient,
  hasOrderedProduct,
  onAddReview,
}: ProductModalProps) {
  // Localized getters
  const getName = (p: Product) => p.name[currentLanguage] || p.name['pt'];
  const getDescription = (p: Product) => p.description[currentLanguage] || p.description['pt'];
  const getIngredients = (p: Product) => p.ingredients[currentLanguage] || p.ingredients['pt'];
  const getAllergens = (p: Product) => p.allergens[currentLanguage] || p.allergens['pt'] || [];
  const getDeliveryTime = (p: Product) => p.deliveryTime[currentLanguage] || p.deliveryTime['pt'];

  // Review states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get reviews specifically for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const averageRating = productReviews.length > 0 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : null;

  const hasReviewed = currentClient 
    ? productReviews.some(r => r.clientEmail.toLowerCase() === currentClient.email.toLowerCase())
    : false;

  // Sync state with product selection or auth changes
  useEffect(() => {
    if (currentClient) {
      const myReview = productReviews.find(r => r.clientEmail.toLowerCase() === currentClient.email.toLowerCase());
      if (myReview) {
        setRating(myReview.rating);
        setReviewText(myReview.text);
      } else {
        setRating(5);
        setReviewText('');
      }
    } else {
      setRating(5);
      setReviewText('');
    }
    setErrorMessage('');
    setSuccessMessage('');
  }, [product.id, currentClient, reviews]);

  const onSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await onAddReview(product.id, rating, reviewText);
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMessage(currentLanguage === 'pt' ? 'Obrigado pela sua avaliação!' : 'Thank you for your review!');
      setReviewText('');
    } else {
      setErrorMessage(res.error || (currentLanguage === 'pt' ? 'Erro ao submeter avaliação.' : 'Error submitting review.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:h-auto md:max-h-[85vh] md:flex-row"
      >
        {/* Close Button */}
        <button
          id="close-product-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-stone-700 shadow-md backdrop-blur-sm hover:bg-white hover:text-stone-950 focus:outline-none cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Gallery / Zooming Image */}
        <div className="relative h-64 w-full md:h-auto md:w-1/2 bg-stone-100 overflow-hidden group shrink-0">
          <motion.img
            src={product.image}
            alt={getName(product)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=600&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/30 to-transparent"></div>
          
          <div className="absolute bottom-5 left-5 text-white">
            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold tracking-wider uppercase border border-white/10">
              {product.category === 'menu' ? 'Menu Principal' : 'Extra Gourmet'}
            </span>
            <h2 className="mt-2 font-sans text-xl font-semibold tracking-tight leading-tight">
              {getName(product)}
            </h2>
          </div>
        </div>

        {/* Product Details Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="font-sans text-2xl font-bold text-stone-950">
                  {product.price.toFixed(2)}€
                </span>
                <span className="font-mono text-xs text-stone-400">
                  ID: #{product.id.toUpperCase()}
                </span>
              </div>
              <p className="mt-2.5 text-xs text-stone-600 leading-relaxed">
                {getDescription(product)}
              </p>
            </div>

            {/* Contents / Includes list if menu */}
            {product.category === 'menu' && (
              <div className="rounded-2xl bg-stone-50 p-4 border border-stone-100">
                <h3 className="font-sans text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
                  {currentLanguage === 'pt' ? 'O que inclui este menu:' : 'What this menu includes:'}
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(product.contents[currentLanguage] || product.contents['pt'] || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                      <span className="text-gold-600 font-bold leading-none mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Info Tabs: Ingredients, Nutrition, Allergens */}
            <div className="space-y-3.5 border-t border-stone-100 pt-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-stone-100 p-1.5 text-stone-600 shrink-0"><Scale size={14} /></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      {currentLanguage === 'pt' ? 'Peso' : 'Weight'}
                    </h4>
                    <p className="text-xs font-semibold text-stone-800">{product.weight}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="rounded-lg bg-stone-100 p-1.5 text-stone-600 shrink-0"><Clock size={14} /></div>
                  <div>
                    <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      {currentLanguage === 'pt' ? 'Entrega' : 'Delivery'}
                    </h4>
                    <p className="text-xs font-semibold text-stone-800">{getDeliveryTime(product)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  {currentLanguage === 'pt' ? 'Ingredientes' : 'Ingredients'}
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {getIngredients(product)}
                </p>
              </div>

              {/* Nutrition details */}
              <div className="rounded-xl border border-stone-100 p-3 grid grid-cols-4 gap-2 text-center bg-stone-50/50">
                <div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase">Kcal</p>
                  <p className="text-xs font-semibold text-stone-800 mt-0.5">{product.nutrition.calories}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase">{currentLanguage === 'pt' ? 'Prot' : 'Prot'}</p>
                  <p className="text-xs font-semibold text-stone-800 mt-0.5">{product.nutrition.protein}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase">{currentLanguage === 'pt' ? 'Carb' : 'Carbs'}</p>
                  <p className="text-xs font-semibold text-stone-800 mt-0.5">{product.nutrition.carbs}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-stone-400 uppercase">{currentLanguage === 'pt' ? 'Gord' : 'Fat'}</p>
                  <p className="text-xs font-semibold text-stone-800 mt-0.5">{product.nutrition.fat}</p>
                </div>
              </div>

              {/* Allergens warning */}
              {getAllergens(product).length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-gold-800">
                  <ShieldCheck size={13} className="shrink-0" />
                  <span>
                    <strong>{currentLanguage === 'pt' ? 'Alergénios:' : 'Allergens:'}</strong> {getAllergens(product).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* CUSTOMER REVIEWS SECTION */}
            <div className="border-t border-stone-100 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <MessageSquare size={12} className="text-gold-600" />
                  <span>{currentLanguage === 'pt' ? 'Avaliações de Clientes' : 'Customer Reviews'}</span>
                </h3>
                {averageRating && (
                  <div className="flex items-center gap-1 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-100 text-[10px] font-bold text-gold-800 shrink-0">
                    <Star size={11} className="fill-gold-500 text-gold-500" />
                    <span>{averageRating} / 5.0</span>
                    <span className="text-stone-400 font-normal">({productReviews.length})</span>
                  </div>
                )}
              </div>

              {/* Reviews Scrollable List */}
              <div className="max-h-48 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-stone-200">
                {productReviews.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">
                    {currentLanguage === 'pt' ? 'Ainda não há avaliações para este produto.' : 'No reviews for this product yet.'}
                  </p>
                ) : (
                  productReviews.map((rev) => (
                    <div key={rev.id} className="rounded-xl bg-stone-50/70 p-3 border border-stone-100/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-800">{rev.clientName}</span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(rev.createdAt).toLocaleDateString(currentLanguage === 'pt' ? 'pt-PT' : 'en-US')}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            className={s <= rev.rating ? 'fill-gold-500 text-gold-500' : 'text-stone-300'}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed italic">"{rev.text}"</p>
                    </div>
                  ))
                )}
              </div>

              {/* Leave Review Form / Auth Protection */}
              <div className="border-t border-stone-100/80 pt-4 mt-2">
                {currentClient ? (
                  hasOrderedProduct ? (
                    <form onSubmit={onSubmitReview} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
                          {hasReviewed 
                            ? (currentLanguage === 'pt' ? 'Atualizar a sua avaliação' : 'Update your review')
                            : (currentLanguage === 'pt' ? 'Deixar uma avaliação' : 'Write a review')
                          }
                        </h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRating(s)}
                              onMouseEnter={() => setHoverRating(s)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-0.5 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                            >
                              <Star
                                size={16}
                                className={(hoverRating !== null ? s <= hoverRating : s <= rating) ? 'fill-gold-500 text-gold-500' : 'text-stone-300'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          rows={2}
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder={currentLanguage === 'pt' ? 'Partilhe a sua opinião sobre este artigo...' : 'Share your thoughts about this item...'}
                          maxLength={500}
                          className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-2.5 text-xs text-stone-800 placeholder-stone-400 focus:border-gold-500 focus:bg-white focus:outline-none transition-all resize-none"
                          required
                        />
                        <span className="absolute bottom-2 right-2 text-[9px] text-stone-400 font-mono">
                          {reviewText.length}/500
                        </span>
                      </div>

                      {errorMessage && (
                        <p className="text-[10px] text-rose-600 leading-none">{errorMessage}</p>
                      )}
                      {successMessage && (
                        <p className="text-[10px] text-emerald-600 leading-none">{successMessage}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || !reviewText.trim()}
                        className="w-full flex items-center justify-center rounded-xl bg-stone-100 hover:bg-gold-50 hover:text-gold-700 hover:border-gold-200 border border-stone-200/50 py-2 text-xs font-semibold text-stone-700 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        {isSubmitting 
                          ? (currentLanguage === 'pt' ? 'A enviar...' : 'Submitting...') 
                          : (hasReviewed 
                              ? (currentLanguage === 'pt' ? 'Atualizar Avaliação' : 'Update Review') 
                              : (currentLanguage === 'pt' ? 'Submeter Avaliação' : 'Submit Review')
                            )
                        }
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-xl bg-stone-50/50 p-3 border border-stone-100 flex items-center gap-2 text-stone-500 text-[10px] italic">
                      <span>🔒</span>
                      <p>
                        {currentLanguage === 'pt' 
                          ? 'Apenas clientes que já encomendaram este produto o podem avaliar.' 
                          : 'Only customers who have ordered this product before can leave a review.'}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="rounded-xl bg-stone-50/50 p-3 border border-stone-100 flex items-center justify-between gap-2">
                    <p className="text-stone-500 text-[10px] italic">
                      {currentLanguage === 'pt' 
                        ? 'Inicie sessão para avaliar este produto.' 
                        : 'Sign in to review this product.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        const userBtn = document.getElementById('user-profile-button');
                        if (userBtn) userBtn.click();
                      }}
                      className="text-[10px] font-bold text-gold-700 hover:text-gold-900 border-b border-dashed border-gold-600 hover:border-gold-900 cursor-pointer"
                    >
                      {currentLanguage === 'pt' ? 'Entrar / Registar' : 'Login / Register'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions & Cross-selling */}
          <div className="mt-8 border-t border-stone-100 pt-5 space-y-5">
            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                id={`modal-add-cart-${product.id}`}
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-espresso py-3 text-xs font-semibold text-white hover:bg-gold-700 transition-all shadow-md focus:outline-none cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>
                  {currentLanguage === 'pt' ? 'Adicionar ao Carrinho' : 'Add to Cart'}
                </span>
              </button>
              <button
                id={`modal-add-wishlist-${product.id}`}
                onClick={() => onAddToWishlist(product)}
                className={`rounded-xl border border-stone-200 p-3 hover:bg-stone-50 focus:outline-none cursor-pointer ${
                  isFavorite ? 'text-gold-600 bg-gold-50/50' : 'text-stone-500'
                }`}
              >
                <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Related products / Cross-selling */}
            {relatedProducts.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                  {currentLanguage === 'pt' ? 'Sugestões de Acompanhamento:' : 'You might also enjoy:'}
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {relatedProducts.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => onSelectProduct(rel)}
                      className="flex items-center gap-2 shrink-0 rounded-xl border border-stone-100 bg-stone-50 p-1.5 text-left hover:bg-white hover:shadow-sm hover:border-stone-200 transition-all focus:outline-none"
                    >
                      <img
                        src={rel.image}
                        alt={getName(rel)}
                        className="h-10 w-10 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-sans text-[10px] font-medium text-stone-900 truncate max-w-[120px]">
                          {getName(rel)}
                        </p>
                        <p className="text-[10px] font-semibold text-stone-600">
                          +{rel.price.toFixed(2)}€
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
