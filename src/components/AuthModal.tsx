import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, ShoppingBag } from 'lucide-react';
import { api, setAuthToken } from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (admin: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('lao123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ username: username.trim(), password });
      setAuthToken(res.token);
      onSuccess(res.admin);
    } catch (err: any) {
      setError(err.message || 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-tr from-emerald-700 via-teal-700 to-emerald-600 text-white text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Lao Smart Seller</h2>
          <p className="text-xs text-emerald-100 mt-1">
            ເຂົ້າສູ່ລະບົບຜູ້ດູແລຮ້ານຄ້າ (Admin Authentication)
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ຊື່ຜູ້ໃຊ້ (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ລະຫັດຜ່ານ (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick test hint box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">ລະຫັດຜ່ານເລີ່ມຕົ້ນສຳລັບທົດສອບ:</div>
            <div className="flex justify-between text-slate-500">
              <span>ຊື່ຜູ້ໃຊ້: <code className="font-mono font-bold text-emerald-700">admin</code></span>
              <span>ລະຫັດຜ່ານ: <code className="font-mono font-bold text-emerald-700">lao123456</code></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>ກຳລັງເຂົ້າສູ່ລະບົບ...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>ເຂົ້າສູ່ລະບົບ (Login)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
