import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  CreditCard,
  Truck,
  Shield,
  Save,
  Check,
  AlertCircle,
  Key,
} from 'lucide-react';
import { ShopSettings } from '../types';
import { api } from '../utils/api';
import { formatKip } from '../utils/formatters';

interface SettingsViewProps {
  settings: ShopSettings | null;
  onUpdateSettings: (newSettings: Partial<ShopSettings>) => Promise<void>;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onNotify,
}) => {
  // Shop profile
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [facebookPageName, setFacebookPageName] = useState('');
  const [facebookPageUrl, setFacebookPageUrl] = useState('');

  // Payment
  const [bcelAccountNumber, setBcelAccountNumber] = useState('');
  const [bcelAccountName, setBcelAccountName] = useState('');
  const [bcelQrCodeUrl, setBcelQrCodeUrl] = useState('');

  // Shipping
  const [shippingFeeVientiane, setShippingFeeVientiane] = useState<number>(15000);
  const [shippingFeeProvinces, setShippingFeeProvinces] = useState<number>(25000);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setShopName(settings.shopName || '');
      setShopPhone(settings.shopPhone || '');
      setShopAddress(settings.shopAddress || '');
      setFacebookPageName(settings.facebookPageName || '');
      setFacebookPageUrl(settings.facebookPageUrl || '');

      setBcelAccountNumber(settings.bcelAccountNumber || '');
      setBcelAccountName(settings.bcelAccountName || '');
      setBcelQrCodeUrl(settings.bcelQrCodeUrl || '');

      setShippingFeeVientiane(settings.shippingFeeVientiane || 15000);
      setShippingFeeProvinces(settings.shippingFeeProvinces || 25000);
      setLowStockThreshold(settings.lowStockThreshold || 5);
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      onNotify('ກະລຸນາໃສ່ຊື່ຮ້ານຄ້າ', 'error');
      return;
    }

    try {
      setSaving(true);
      await onUpdateSettings({
        shopName: shopName.trim(),
        shopPhone: shopPhone.trim(),
        shopAddress: shopAddress.trim(),
        facebookPageName: facebookPageName.trim(),
        facebookPageUrl: facebookPageUrl.trim(),
        bcelAccountNumber: bcelAccountNumber.trim(),
        bcelAccountName: bcelAccountName.trim(),
        bcelQrCodeUrl: bcelQrCodeUrl.trim(),
        shippingFeeVientiane: Number(shippingFeeVientiane) || 0,
        shippingFeeProvinces: Number(shippingFeeProvinces) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 5,
      });
      onNotify('ບັນທຶກການຕັ້ງຄ່າຮ້ານຄ້າສຳເລັດແລ້ວ', 'success');
    } catch (err: any) {
      onNotify(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      onNotify('ກະລຸນາປ້ອນລະຫັດຜ່ານເກົ່າ ແລະ ໃໝ່', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      onNotify('ລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນລະຫັດຜ່ານບໍ່ກົງກັນ', 'error');
      return;
    }
    if (newPassword.length < 6) {
      onNotify('ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ', 'error');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.changePassword({ currentPassword, newPassword });
      onNotify('ປ່ຽນລະຫັດຜ່ານຜູ້ດູແລລະບົບສຳເລັດແລ້ວ', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      onNotify(err.message || 'ປ່ຽນລະຫັດຜ່ານບໍ່ສຳເລັດ', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          ຕັ້ງຄ່າຮ້ານຄ້າ ແລະ ລະບົບ (Shop Settings)
        </h1>
        <p className="text-xs text-slate-500">
          ຈັດການຂໍ້ມູນຮ້ານຄ້າ, ບັນຊີ BCEL One, ຄ່າຈັດສົ່ງເລີ່ມຕົ້ນ ແລະ ຄວາມປອດໄພ
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Shop Profile */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>1. ຂໍ້ມູນຮ້ານຄ້າ (Shop Profile)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຊື່ຮ້ານຄ້າ (Shop Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ເບີໂທລະສັບຮ້ານ (Phone)
              </label>
              <input
                type="text"
                value={shopPhone}
                onChange={e => setShopPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ທີ່ຢູ່ຮ້ານ (Address)
            </label>
            <input
              type="text"
              value={shopAddress}
              onChange={e => setShopAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຊື່ Facebook Page
              </label>
              <input
                type="text"
                value={facebookPageName}
                onChange={e => setFacebookPageName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ລິ້ງ Facebook Page URL
              </label>
              <input
                type="text"
                value={facebookPageUrl}
                onChange={e => setFacebookPageUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Payment Details (BCEL One) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>2. ຂໍ້ມູນບັນຊີທະນາຄານ BCEL One / QR Code</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ເລກບັນຊີ BCEL One (Account Number)
              </label>
              <input
                type="text"
                placeholder="010-12-00-XXXXXXXX-001"
                value={bcelAccountNumber}
                onChange={e => setBcelAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຊື່ບັນຊີ (Account Name)
              </label>
              <input
                type="text"
                placeholder="ຕົວຢ່າງ: SOULIPHANH S."
                value={bcelAccountName}
                onChange={e => setBcelAccountName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL ຮູບພາບ BCEL One QR Code (ສຳລັບສະແດງໃນໃບບິນ)
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={bcelQrCodeUrl}
              onChange={e => setBcelQrCodeUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Section 3: Shipping Fees & Low Stock Alert */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>3. ຄ່າຈັດສົ່ງເລີ່ມຕົ້ນ (Default Shipping Fees in LAK)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຄ່າສົ່ງໃນ ນະຄອນຫຼວງວຽງຈັນ (LAK)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={shippingFeeVientiane}
                  onChange={e => setShippingFeeVientiane(Number(e.target.value) || 0)}
                  className="w-full pl-3.5 pr-8 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">₭</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຄ່າສົ່ງ ຕ່າງແຂວງ (LAK)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={shippingFeeProvinces}
                  onChange={e => setShippingFeeProvinces(Number(e.target.value) || 0)}
                  className="w-full pl-3.5 pr-8 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">₭</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ແຈ້ງເຕືອນສະຕັອກໃກ້ໝົດ ເມື່ອເຫຼືອ &lt;=
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(Number(e.target.value) || 1)}
                className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-sm shadow-emerald-600/30 transition-all"
          >
            {saving ? (
              <span>ກຳລັງບັນທຶກ...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ບັນທຶກການຕັ້ງຄ່າຮ້ານຄ້າ</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Section 4: Security & Admin Password */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 mt-8">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <span>4. ປ່ຽນລະຫັດຜ່ານຜູ້ດູແລລະບົບ (Admin Security)</span>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ລະຫັດຜ່ານປັດຈຸບັນ (Current Password)
            </label>
            <input
              type="password"
              required
              placeholder="ລະຫັດຜ່ານເດີມ (ຄ່າເລີ່ມຕົ້ນ: lao123456)..."
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ລະຫັດຜ່ານໃໝ່ (New Password)
              </label>
              <input
                type="password"
                required
                placeholder="ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຢືນຢັນລະຫັດຜ່ານໃໝ່
              </label>
              <input
                type="password"
                required
                placeholder="ພິມລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ..."
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors"
          >
            {passwordLoading ? 'ກຳລັງປ່ຽນ...' : 'ຢືນຢັນປ່ຽນລະຫັດຜ່ານ'}
          </button>
        </form>
      </div>
    </div>
  );
};
