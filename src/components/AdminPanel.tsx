import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Award, 
  Percent, Truck, Clock, RefreshCw, Download, Plus, Trash2, Edit2, 
  Check, X, ChevronRight, Sparkles, Sliders, Box, AlertCircle
} from 'lucide-react';
import { Product, Order, ClientProfile, Coupon } from '../types';
import { AVAILABLE_HOURS, DELIVERY_ZONES } from '../data';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  clients: ClientProfile[];
  coupons: Coupon[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateProductStock: (productId: string, popular: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
  onClose: () => void;
}

export default function AdminPanel({
  products,
  orders,
  clients,
  coupons,
  onUpdateOrderStatus,
  onUpdateProductStock,
  onDeleteProduct,
  onAddProduct,
  onAddCoupon,
  onDeleteCoupon,
  onClose,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'clients' | 'coupons' | 'settings'>('dashboard');
  
  // New product form state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductNamePt, setNewProductNamePt] = useState('');
  const [newProductNameEn, setNewProductNameEn] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('10.00');
  const [newProductCategory, setNewProductCategory] = useState<'menu' | 'extra'>('menu');
  
  // New coupon state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState('10');
  const [newCouponMinSpend, setNewCouponMinSpend] = useState('20');

  // Stats Calculations
  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const totalSales = orders.filter(o => o.status !== 'cancelled').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveryZonesCount = DELIVERY_ZONES.length;

  // Simulate PDF/Excel Export
  const handleExport = (type: 'pdf' | 'excel', dataset: string) => {
    alert(`Exportando relatório de ${dataset} em formato ${type.toUpperCase()}...\nO ficheiro será descarregado automaticamente.`);
    
    // Create an invisible anchor to simulate download
    const element = document.createElement('a');
    let content = '';
    let filename = '';
    let mimeType = '';

    if (type === 'excel') {
      content = `ID,Cliente,Total,Data,Estado\n` + 
        orders.map(o => `${o.id},${o.clientEmail},${o.total}€,${o.createdAt.split('T')[0]},${o.status}`).join('\n');
      filename = `relatorio_${dataset}_breakfastinbedlx.csv`;
      mimeType = 'text/csv';
    } else {
      content = `=== RELATORIO DE ${dataset.toUpperCase()} ===\n\n` +
        `Data: ${new Date().toLocaleDateString()}\n` +
        `Receita Acumulada: ${revenue.toFixed(2)}€\n` +
        `Total de Encomendas: ${totalSales}\n\n` +
        `Detalhes das Encomendas:\n` +
        orders.map(o => `[${o.id}] - ${o.clientEmail} - ${o.total}€ (${o.status})`).join('\n');
      filename = `relatorio_${dataset}_breakfastinbedlx.txt`;
      mimeType = 'text/plain';
    }

    const file = new Blob([content], {type: mimeType});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    onAddCoupon({
      code: newCouponCode.toUpperCase().trim(),
      discountType: newCouponType,
      value: parseFloat(newCouponValue),
      minSpend: newCouponMinSpend ? parseFloat(newCouponMinSpend) : undefined
    });
    setNewCouponCode('');
    setNewCouponValue('10');
    setNewCouponMinSpend('20');
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductNamePt.trim() || !newProductNameEn.trim()) return;
    
    onAddProduct({
      name: { pt: newProductNamePt, en: newProductNameEn },
      category: newProductCategory,
      price: parseFloat(newProductPrice),
      contents: { pt: ['Ingrediente 1', 'Ingrediente 2'], en: ['Ingredient 1', 'Ingredient 2'] },
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop',
      description: { pt: 'Novo produto gourmet adicionado pelo administrador.', en: 'New gourmet product added by administrator.' },
      ingredients: { pt: 'Ingredientes premium selecionados.', en: 'Selected premium ingredients.' },
      nutrition: { calories: 350, protein: '10g', carbs: '45g', fat: '12g' },
      allergens: { pt: ['Glúten'], en: ['Gluten'] },
      weight: '300g',
      deliveryTime: { pt: 'Entrega rápida em embalagem de luxo.', en: 'Fast delivery in luxury packaging.' },
      popular: false,
    });

    setShowAddProductModal(false);
    setNewProductNamePt('');
    setNewProductNameEn('');
    setNewProductPrice('10.00');
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-stone-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="ml-auto flex h-full w-full max-w-6xl flex-col bg-stone-50 shadow-2xl"
      >
        {/* Admin Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-600/10 text-gold-700">
              <Sliders size={20} />
            </div>
            <div>
              <h1 className="font-sans text-lg font-medium tracking-tight text-stone-950">
                LX Concierge Backoffice
              </h1>
              <p className="font-mono text-xs text-stone-500">
                breakfastinbedlx.com • Gestão de Luxo
              </p>
            </div>
          </div>
          <button 
            id="close-admin-panel"
            onClick={onClose}
            className="rounded-full border border-stone-200 p-2 text-stone-500 hover:bg-stone-50 hover:text-stone-950 focus:outline-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-56 border-r border-stone-200 bg-white p-4 flex flex-col justify-between">
            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Painel Geral', icon: TrendingUp },
                { id: 'orders', label: 'Encomendas', icon: ShoppingBag, badge: pendingOrders },
                { id: 'products', label: 'Menu & Stock', icon: Box },
                { id: 'clients', label: 'Clientes', icon: Users },
                { id: 'coupons', label: 'Cupões & Promos', icon: Percent },
                { id: 'settings', label: 'Horários & Áreas', icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`admin-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gold-600 text-white shadow-md shadow-gold-600/10' 
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white text-gold-700' : 'bg-gold-600 text-white'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick backup / export info */}
            <div className="rounded-xl bg-gold-50/50 p-3 border border-gold-100">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-gold-700 mt-0.5 shrink-0" />
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  Sistema pronto para escalabilidade internacional e expansão multimoeda.
                </p>
              </div>
            </div>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-500">Receita Total</span>
                      <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><DollarSign size={16} /></div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-sans text-2xl font-semibold text-stone-950">{revenue.toFixed(2)}€</h3>
                      <p className="text-[10px] text-stone-500">Vendas confirmadas e em rota</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-500">Encomendas</span>
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-700"><ShoppingBag size={16} /></div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-sans text-2xl font-semibold text-stone-950">{totalSales}</h3>
                      <p className="text-[10px] text-stone-500">Excluindo pedidos cancelados</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-500">Clientes Ativos</span>
                      <div className="rounded-lg bg-purple-50 p-2 text-purple-700"><Users size={16} /></div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-sans text-2xl font-semibold text-stone-950">{clients.length}</h3>
                      <p className="text-[10px] text-stone-500">Registados na plataforma</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-500">Áreas Ativas</span>
                      <div className="rounded-lg bg-gold-50 p-2 text-gold-700"><Truck size={16} /></div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-sans text-2xl font-semibold text-stone-950">{deliveryZonesCount}</h3>
                      <p className="text-[10px] text-stone-500">Lisboa Centro Histórico</p>
                    </div>
                  </div>
                </div>

                {/* Relatórios & Exportações */}
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                      <h2 className="font-sans text-sm font-medium text-stone-950">Exportar Relatórios Financeiros</h2>
                      <p className="text-xs text-stone-500">Descarregue faturas e relatórios para contabilidade e marketing.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        id="export-excel-btn"
                        onClick={() => handleExport('excel', 'encomendas')}
                        className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Excel (CSV)</span>
                      </button>
                      <button
                        id="export-pdf-btn"
                        onClick={() => handleExport('pdf', 'encomendas')}
                        className="flex items-center gap-1.5 rounded-xl bg-espresso px-3 py-1.5 text-xs font-medium text-white hover:bg-gold-700 cursor-pointer"
                      >
                        <Download size={14} />
                        <span>PDF Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick summary chart representation */}
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-700">Estado de Execução de Entregas</span>
                      <span className="text-xs font-bold text-gold-700">{pendingOrders} pendentes</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden flex">
                      <div className="bg-gold-600 h-full" style={{ width: `${(pendingOrders / (totalSales || 1)) * 100}%` }}></div>
                      <div className="bg-emerald-600 h-full" style={{ width: `${(orders.filter(o => o.status === 'delivered').length / (totalSales || 1)) * 100}%` }}></div>
                      <div className="bg-stone-400 h-full flex-1"></div>
                    </div>
                    <div className="mt-3 flex gap-4 text-[10px] text-stone-500">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gold-600"></span> Pendentes</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-600"></span> Entregues</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-stone-400"></span> Em Rota / Outros</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 font-sans text-xs font-semibold uppercase tracking-wider text-stone-500">Atividade Recente de Encomendas</h3>
                  <div className="divide-y divide-stone-100">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-stone-100 p-2 text-stone-700">
                            <ShoppingBag size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-stone-900">{order.clientEmail}</p>
                            <p className="text-[10px] text-stone-500">Bairro: {order.reservation.address} • {order.reservation.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-stone-900">{order.total.toFixed(2)}€</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            'bg-gold-50 text-gold-700 border border-gold-100'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Orders Management */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-sans text-sm font-semibold text-stone-950">Gestão Ativa de Pedidos</h2>
                  <button onClick={() => handleExport('excel', 'encomendas')} className="flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer">
                    <Download size={12} />
                    <span>Exportar CSV</span>
                  </button>
                </div>

                <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                  {orders.map((order) => (
                    <div key={order.id} className="p-5 hover:bg-stone-50/50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-900">Encomenda #{order.id.slice(-6).toUpperCase()}</span>
                            <span className="text-xs text-stone-400">•</span>
                            <span className="text-xs text-stone-500">{order.createdAt.split('T')[0]}</span>
                          </div>
                          <p className="mt-1 text-xs text-stone-700">
                            Cliente: <span className="font-semibold">{order.clientEmail}</span> | Morada: <span className="font-semibold">{order.reservation.address} ({order.reservation.postalCode})</span>
                          </p>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Horário Agendado: <span className="font-semibold text-gold-800">{order.reservation.time}</span> | Alojamento: {order.reservation.type.toUpperCase()} - {order.reservation.accommodationName}
                          </p>
                          {order.reservation.notes && (
                            <p className="mt-1.5 rounded-lg bg-gold-50/40 p-2 text-[10px] text-gold-900 border border-gold-100/50">
                              Nota do cliente: "{order.reservation.notes}"
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-sm font-bold text-stone-950">{order.total.toFixed(2)}€</span>
                          <div className="flex gap-1">
                            {['cooking', 'delivering', 'delivered', 'cancelled'].map((st) => (
                              <button
                                key={st}
                                onClick={() => onUpdateOrderStatus(order.id, st as any)}
                                className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                                  order.status === st 
                                    ? 'bg-gold-600 text-white' 
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Display items */}
                      <div className="mt-3.5 border-t border-stone-100 pt-3 flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="rounded-lg bg-stone-100/80 px-2.5 py-1 text-[10px] text-stone-700 border border-stone-200/50">
                            {item.quantity}x <span className="font-semibold">{item.name}</span> ({item.price.toFixed(2)}€)
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Products Management */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-sans text-sm font-semibold text-stone-950">Catálogo e Controlo de Stock</h2>
                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    className="flex items-center gap-1 rounded-xl bg-espresso px-3 py-2 text-xs font-medium text-white hover:bg-gold-700 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Adicionar Produto</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {products.map((prod) => (
                    <div key={prod.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm flex gap-3">
                      <img 
                        src={prod.image} 
                        alt={prod.name.pt} 
                        className="h-20 w-20 rounded-xl object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${prod.category === 'menu' ? 'bg-gold-100 text-gold-800' : 'bg-stone-100 text-stone-800'}`}>
                              {prod.category.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-stone-900">{prod.price.toFixed(2)}€</span>
                          </div>
                          <h4 className="font-sans text-xs font-medium text-stone-950 mt-1">{prod.name.pt}</h4>
                          <p className="text-[10px] text-stone-500 mt-0.5 truncate">{prod.description.pt}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                          <button
                            onClick={() => onUpdateProductStock(prod.id, !prod.popular)}
                            className={`text-[10px] font-medium flex items-center gap-1 cursor-pointer ${prod.popular ? 'text-gold-600' : 'text-stone-400 hover:text-stone-700'}`}
                          >
                            <Award size={12} />
                            <span>{prod.popular ? 'Destaque' : 'Destacar'}</span>
                          </button>
                          <button
                            onClick={() => onDeleteProduct(prod.id)}
                            className="text-[10px] font-medium text-stone-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Clients Management */}
            {activeTab === 'clients' && (
              <div className="space-y-4">
                <h2 className="font-sans text-sm font-semibold text-stone-950">Ficheiros de Clientes de Luxo</h2>
                <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                  {clients.map((cli) => (
                    <div key={cli.email} className="p-4 flex justify-between items-center hover:bg-stone-50/50">
                      <div>
                        <h4 className="font-sans text-xs font-medium text-stone-950">{cli.name}</h4>
                        <p className="text-[10px] text-stone-500">Email: {cli.email} | Telefone: {cli.phone}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Endereço Padrão: {cli.address || 'Não especificado'} ({cli.postalCode || ''})</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-lg bg-stone-100 px-2 py-1 text-[10px] text-stone-600">
                          {cli.favorites.length} Favoritos
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Coupons Management */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-sans text-sm font-semibold text-stone-950 mb-4">Adicionar Novo Cupão de Desconto</h2>
                  <form onSubmit={handleCreateCouponSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase">Código</label>
                      <input
                        type="text"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="EX: LISBON10"
                        className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase">Tipo</label>
                      <select
                        value={newCouponType}
                        onChange={(e: any) => setNewCouponType(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-gold-500 focus:outline-none"
                      >
                        <option value="percentage">Percentual (%)</option>
                        <option value="fixed">Fixo (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-500 uppercase">Valor</label>
                      <input
                        type="number"
                        value={newCouponValue}
                        onChange={(e) => setNewCouponValue(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-espresso py-2.5 text-xs font-semibold text-white hover:bg-gold-700 transition-colors cursor-pointer"
                      >
                        Criar Cupão
                      </button>
                    </div>
                  </form>
                </div>

                <div>
                  <h2 className="font-sans text-sm font-semibold text-stone-950 mb-4">Lista de Cupões Ativos</h2>
                  <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                    {coupons.map((c) => (
                      <div key={c.code} className="p-4 flex items-center justify-between hover:bg-stone-50/50">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-gold-50/50 p-2 text-gold-700">
                            <Percent size={14} />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-stone-950 bg-stone-100 px-2 py-0.5 rounded-md">{c.code}</span>
                            <span className="ml-2 text-xs text-stone-600">
                              Desconto de {c.value}{c.discountType === 'percentage' ? '%' : '€'}
                            </span>
                            {c.minSpend && (
                              <p className="text-[10px] text-stone-400 mt-0.5">Compra mínima: {c.minSpend}€</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteCoupon(c.code)}
                          className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans text-sm font-semibold text-stone-950 mb-3">Zonas de Entrega Disponíveis</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {DELIVERY_ZONES.map((zone) => (
                      <div key={zone.name} className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-stone-900">{zone.name}</p>
                          <p className="text-[9px] font-mono text-stone-500">Prefixo Postal: {zone.zipPrefixes.join(', ')}</p>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-200 pt-6">
                  <h3 className="font-sans text-sm font-semibold text-stone-950 mb-3">Horários Permitidos de Entrega</h3>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_HOURS.map((hour) => (
                      <span key={hour} className="rounded-xl bg-stone-100 border border-stone-200/50 px-3 py-1.5 text-xs font-semibold text-stone-800">
                        {hour}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-gold-50/50 p-4 border border-gold-100 flex gap-3">
                  <AlertCircle size={20} className="text-gold-800 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gold-900">Regra de Fecho às 23h00</h4>
                    <p className="text-[10px] text-gold-800 mt-1 leading-relaxed">
                      O sistema bloqueia automaticamente qualquer encomenda efetuada após as 23:00 para o próprio dia seguinte. Esta regra está ativa e protege a integridade dos pasteleiros e fornecedores artesanais locais.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>

      {/* Add Product Modal (simulated inside Admin) */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-200">
            <h3 className="font-sans text-sm font-bold text-stone-950 mb-4">Novo Produto Gourmet</h3>
            <form onSubmit={handleCreateProductSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 uppercase">Nome (PT)</label>
                <input
                  type="text"
                  required
                  value={newProductNamePt}
                  onChange={(e) => setNewProductNamePt(e.target.value)}
                  placeholder="Ex: Torta de Noz Caseira"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 uppercase">Nome (EN)</label>
                <input
                  type="text"
                  required
                  value={newProductNameEn}
                  onChange={(e) => setNewProductNameEn(e.target.value)}
                  placeholder="Ex: Homemade Walnut Roll"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase">Preço (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-gold-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase">Categoria</label>
                  <select
                    value={newProductCategory}
                    onChange={(e: any) => setNewProductCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-gold-500 focus:outline-none"
                  >
                    <option value="menu">Menu Principal</option>
                    <option value="extra">Extra / Bebida</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-espresso py-2 text-xs font-semibold text-white hover:bg-gold-700 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
