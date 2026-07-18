import { motion } from 'motion/react';
import { X, ShoppingBag, Heart, Scale, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product;
  currentLanguage: string;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isFavorite: boolean;
  relatedProducts: Product[];
  onSelectProduct: (product: Product) => void;
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
}: ProductModalProps) {
  // Localized getters
  const getName = (p: Product) => p.name[currentLanguage] || p.name['pt'];
  const getDescription = (p: Product) => p.description[currentLanguage] || p.description['pt'];
  const getIngredients = (p: Product) => p.ingredients[currentLanguage] || p.ingredients['pt'];
  const getAllergens = (p: Product) => p.allergens[currentLanguage] || p.allergens['pt'] || [];
  const getDeliveryTime = (p: Product) => p.deliveryTime[currentLanguage] || p.deliveryTime['pt'];

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
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-stone-700 shadow-md backdrop-blur-sm hover:bg-white hover:text-stone-950 focus:outline-none"
        >
          <X size={18} />
        </button>

        {/* Gallery / Zooming Image */}
        <div className="relative h-64 w-full md:h-auto md:w-1/2 bg-stone-100 overflow-hidden group">
          <motion.img
            src={product.image}
            alt={getName(product)}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
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
