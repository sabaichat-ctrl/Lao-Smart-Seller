import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Tag,
  DollarSign,
} from 'lucide-react';
import { Product, ShopSettings } from '../types';
import { formatKip } from '../utils/formatters';

interface ProductsViewProps {
  products: Product[];
  settings: ShopSettings | null;
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onQuickUpdateStock: (id: string, newStock: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  settings,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onQuickUpdateStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ທັງໝົດ');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const categories = [
    'ທັງໝົດ',
    'ເສື້ອຜ້າ',
    'ເຄື່ອງສຳອາງ',
    'ເກີບ-ກະເປົາ',
    'ອາຫານ-ເຄື່ອງດື່ມ',
    'ອື່ນໆ',
  ];

  const threshold = settings?.lowStockThreshold ?? 5;

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ທັງໝົດ' || p.category.includes(selectedCategory);

    const matchesLowStock = onlyLowStock ? p.stock <= threshold : true;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockTotal = products.filter(p => p.stock <= threshold).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            ຈັດການສິນຄ້າ ແລະ ສະຕັອກ (Products & Stock)
          </h1>
          <p className="text-xs text-slate-500">
            ສິນຄ້າທັງໝົດ {products.length} ລາຍການ • ໃກ້ໝົດ {lowStockTotal} ລາຍການ (LAK)
          </p>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ ເພີ່ມສິນຄ້າໃໝ່</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຕາມຊື່, ລະຫັດ SKU ຫຼື ໝວດໝູ່..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Low Stock Toggle button */}
          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              onlyLowStock
                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyLowStock ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>ສິນຄ້າໃກ້ໝົດ ({lowStockTotal})</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0">ໝວດໝູ່:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold">ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ</p>
            <p className="text-xs text-slate-400 mt-1">ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເພີ່ມສິນຄ້າໃໝ່</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const isLowStock = product.stock <= threshold;
            const profit = product.price - product.cost;
            const margin = product.price > 0 ? Math.round((profit / product.price) * 100) : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col group hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Product Image & Badges */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    {product.category}
                  </span>

                  {/* Stock Status Badge */}
                  <span
                    className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                      product.stock === 0
                        ? 'bg-rose-500 text-white'
                        : isLowStock
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {product.stock === 0
                      ? 'ສິນຄ້າໝົດ'
                      : isLowStock
                      ? `ໃກ້ໝົດ: ${product.stock} ຊິ້ນ`
                      : `ໃນສາງ: ${product.stock} ຊິ້ນ`}
                  </span>
                </div>

                {/* Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-mono">{product.sku}</span>
                      <span className={product.isActive ? 'text-emerald-600' : 'text-slate-400'}>
                        {product.isActive ? '● ເປີດຂາຍ' : '○ ປິດຂາຍ'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Cost Breakdown */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">ລາຄາຂາຍ:</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatKip(product.price)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                      <span>ຕົ້ນທຶນ: {formatKip(product.cost)}</span>
                      <span className="font-semibold text-emerald-700">
                        ກຳໄລ: +{formatKip(profit)} ({margin}%)
                      </span>
                    </div>
                  </div>

                  {/* Quick Stock Controls & Edit/Delete */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Quick stock stepper */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[10px] text-slate-400">ສະຕັອກ:</span>
                      <button
                        onClick={() => onQuickUpdateStock(product.id, Math.max(0, product.stock - 1))}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        title="ຫຼຸດ 1"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-slate-800">
                        {product.stock}
                      </span>
                      <button
                        onClick={() => onQuickUpdateStock(product.id, product.stock + 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                        title="ເພີ່ມ 1"
                      >
                        +
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="ແກ້ໄຂສິນຄ້າ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບສິນຄ້າ "${product.name}"?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="ລົບສິນຄ້າ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
