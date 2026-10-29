import React, { useState, useEffect } from 'react';
import { X, Image, Upload, AlertCircle, Sparkles, Check } from 'lucide-react';
import { Product } from '../types';
import { formatKip } from '../utils/formatters';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  productToEdit?: Product | null;
}

const CATEGORIES = [
  'ເສື້ອຜ້າ (Fashion & Clothing)',
  'ເຄື່ອງສຳອາງ (Beauty & Skincare)',
  'ເກີບ-ກະເປົາ (Shoes & Bags)',
  'ອາຫານ-ເຄື່ອງດື່ມ (Food & Drink)',
  'ເຄື່ອງໃຊ້ໃນເຮືອນ (Home & Living)',
  'ອຸປະກອນໄອທີ (Gadgets & IT)',
  'ອື່ນໆ (Other)',
];

const PRESET_IMAGES = [
  {
    name: 'ເສື້ອຢືດ',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ຊຸດສິ້ນໄໝ',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ເຄື່ອງສຳອາງ',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ກາເຟ',
    url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ກະເປົາ',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ເກີບ',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
  },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState<number | ''>(95000);
  const [cost, setCost] = useState<number | ''>(50000);
  const [stock, setStock] = useState<number | ''>(20);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategory(
        CATEGORIES.find(c => c.startsWith(productToEdit.category)) || productToEdit.category
      );
      setPrice(productToEdit.price);
      setCost(productToEdit.cost);
      setStock(productToEdit.stock);
      setImage(productToEdit.image);
      setDescription(productToEdit.description || '');
      setIsActive(productToEdit.isActive ?? true);
    } else {
      setName('');
      setSku(`LSS-${Math.floor(100 + Math.random() * 900)}`);
      setCategory(CATEGORIES[0]);
      setPrice('');
      setCost('');
      setStock(10);
      setImage(PRESET_IMAGES[0].url);
      setDescription('');
      setIsActive(true);
    }
    setError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const numPrice = Number(price) || 0;
  const numCost = Number(cost) || 0;
  const profitPerUnit = numPrice - numCost;
  const profitMarginPercent = numPrice > 0 ? Math.round((profitPerUnit / numPrice) * 100) : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('ຂະໜາດຮູບພາບບໍ່ຄວນເກີນ 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ກະລຸນາປ້ອນຊື່ສິນຄ້າ');
      return;
    }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      setError('ກະລຸນາປ້ອນລາຄາຂາຍທີ່ຖືກຕ້ອງ');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Clean category to short name
      const cleanCategory = category.split(' ')[0];

      await onSave({
        name: name.trim(),
        sku: sku.trim() || `LSS-${Date.now().toString().slice(-4)}`,
        category: cleanCategory,
        price: Number(price),
        cost: Number(cost) || 0,
        stock: Number(stock) || 0,
        image: image || PRESET_IMAGES[0].url,
        description: description.trim(),
        isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກສິນຄ້າ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {productToEdit ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່ (Add Product)'}
              </h2>
              <p className="text-xs text-slate-500">
                ກຳນົດຊື່, ລາຄາຂາຍ, ຕົ້ນທຶນ ແລະ ຈຳນວນໃນສາງ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຊື່ສິນຄ້າ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="ຕົວຢ່າງ: ເສື້ອຢືດຝ້າຍແທ້ Premium..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ລະຫັດສິນຄ້າ (SKU)
              </label>
              <input
                type="text"
                placeholder="LSS-001"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
              />
            </div>
          </div>

          {/* Row 2: Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ໝວດໝູ່ (Category)
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-xs font-medium text-slate-700">
                  {isActive ? 'ເປີດຂາຍປົກກະຕິ (Active)' : 'ປິດຂາຍຊົ່ວຄາວ (Inactive)'}
                </span>
              </label>
            </div>
          </div>

          {/* Row 3: Pricing, Cost & Stock (with instant profit calculation) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              ກຳນົດລາຄາ ແລະ ຈຳນວນໃນສາງ (LAK)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ລາຄາຂາຍ (Price) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="95000"
                    value={price}
                    onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-3.5 pr-8 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">₭</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ຕົ້ນທຶນສິນຄ້າ (Cost)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="50000"
                    value={cost}
                    onChange={e => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-3.5 pr-8 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">₭</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ຈຳນວນໃນສາງ (Stock)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="20"
                  value={stock}
                  onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Profit margin live feedback */}
            {numPrice > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500">ກຳໄລຕໍ່ຊິ້ນ:</span>
                <span className="font-bold text-emerald-700">
                  +{formatKip(profitPerUnit)} ({profitMarginPercent}%)
                </span>
              </div>
            )}
          </div>

          {/* Row 4: Image Picker & Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              ຮູບພາບສິນຄ້າ (Product Image)
            </label>

            {/* Image Preview & URL input */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Image className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="URL ຮູບພາບ (ຫຼື ເລືອກຮູບຕົວຢ່າງດ້ານລຸ່ມ)..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ອັບໂຫລດຮູບຈາກເຄື່ອງ</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">ຮອງຮັບ JPG, PNG</span>
                </div>
              </div>
            </div>

            {/* Quick presets */}
            <div className="pt-1">
              <div className="text-[11px] text-slate-500 mb-1.5">ຮູບຕົວຢ່າງໄວ:</div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border shrink-0 transition-all ${
                      image === preset.url
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{preset.name}</span>
                    {image === preset.url && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ລາຍລະອຽດສິນຄ້າ (Description)
            </label>
            <textarea
              rows={2}
              placeholder="ລາຍລະອຽດ, ຂະໜາດ, ວິທີການໃຊ້..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-2"
            >
              {loading ? (
                <span>ກຳລັງບັນທຶກ...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{productToEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມສິນຄ້າ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
