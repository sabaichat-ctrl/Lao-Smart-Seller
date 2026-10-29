import React, { useState, useEffect } from 'react';
import {
  Bot,
  Facebook,
  Shield,
  Copy,
  Check,
  Sparkles,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { MessengerConfig, MessengerMessageLog, AutoReplyRule } from '../types';
import { api } from '../utils/api';
import { formatDateLao } from '../utils/formatters';

interface MessengerAutomationViewProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const MessengerAutomationView: React.FC<MessengerAutomationViewProps> = ({
  onNotify,
}) => {
  const [config, setConfig] = useState<
    (MessengerConfig & { webhookUrl: string; hasPageAccessToken: boolean; hasAppSecret: boolean }) | null
  >(null);
  const [logs, setLogs] = useState<MessengerMessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for Meta credentials
  const [pageId, setPageId] = useState('');
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [rules, setRules] = useState<AutoReplyRule[]>([]);

  // New rule state
  const [newKeyword, setNewKeyword] = useState('');
  const [newReplyText, setNewReplyText] = useState('');

  // Simulator chat state
  const [simMessage, setSimMessage] = useState('');
  const [simSender, setSimSender] = useState('ລູກຄ້າທົດສອບ');
  const [simulating, setSimulating] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'bot'; text: string; time: string; type?: string }[]
  >([
    {
      sender: 'user',
      text: 'ສະບາຍດີ ມີເສື້ອຢືດດອກຈຳປາ Size L ບໍ່ເຈົ້າ?',
      time: '10:30',
    },
    {
      sender: 'bot',
      text: 'ສະບາຍດີເຈົ້າ! ເສື້ອຢືດດອກຈຳປາ Size L ຍັງມີພ້ອມສົ່ງເລີຍເຈົ້າ ລາຄາ 95,000 ກີບ/ໂຕ ຜ້າຝ້າຍ Cotton ແທ້ 100% ໃສ່ສະບາຍຫຼາຍ ສົນໃຈຮັບຈັກໂຕດີເຈົ້າ?',
      time: '10:30',
      type: 'ai',
    },
  ]);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getMessengerConfig();
      setConfig(data);
      setPageId(data.pageId || '');
      setPageAccessToken(data.pageAccessToken || '');
      setAppSecret(data.appSecret || '');
      setAiEnabled(data.aiAutoReplyEnabled);
      setAiPrompt(data.aiPromptInstruction);
      setRules(data.autoReplyRules || []);
    } catch (err) {
      console.error(err);
      onNotify('ບໍ່ສາມາດດຶງຂໍ້ມູນການຕັ້ງຄ່າ Messenger ໄດ້', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await api.getMessengerLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
    onNotify('ກັອບປີ້ສຳເລັດແລ້ວ', 'success');
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      await api.updateMessengerConfig({
        pageId: pageId.trim(),
        pageAccessToken: pageAccessToken.trim(),
        appSecret: appSecret.trim(),
        aiAutoReplyEnabled: aiEnabled,
        aiPromptInstruction: aiPrompt,
        autoReplyRules: rules,
      });
      onNotify('ບັນທຶກການຕັ້ງຄ່າ Messenger ສຳເລັດແລ້ວ', 'success');
      fetchConfig();
    } catch (err: any) {
      onNotify(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRule = () => {
    if (!newKeyword.trim() || !newReplyText.trim()) {
      onNotify('ກະລຸນາປ້ອນຄຳສັບ ແລະ ຂໍ້ຄວາມຕອບກັບ', 'error');
      return;
    }
    const newRule: AutoReplyRule = {
      id: `rule_${Date.now()}`,
      keyword: newKeyword.trim(),
      matchType: 'contains',
      replyText: newReplyText.trim(),
      isActive: true,
    };
    setRules([...rules, newRule]);
    setNewKeyword('');
    setNewReplyText('');
    onNotify('ເພີ່ມກົດລະບຽບຕອບກັບແລ້ວ (ກະລຸນາກົດບັນທຶກເພື່ອຢືນຢັນ)', 'success');
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  };

  // Test Simulation
  const handleSendSimulatedMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simMessage.trim()) return;

    const userText = simMessage.trim();
    const timeNow = new Date().toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });

    setChatHistory(prev => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setSimMessage('');
    setSimulating(true);

    try {
      const res = await api.simulateMessenger({
        messageText: userText,
        senderName: simSender,
      });

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.replyText,
          time: new Date().toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' }),
          type: res.replyType,
        },
      ]);
      fetchLogs();
    } catch (err: any) {
      onNotify(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການທົດສອບ', 'error');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>ກຳລັງໂຫລດການຕັ້ງຄ່າ Messenger...</span>
      </div>
    );
  }

  const isActuallyConnected = config?.isConnected && config?.hasPageAccessToken;

  return (
    <div className="space-y-6">
      {/* Page Title & Status Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Facebook className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  ລະບົບຕອບກັບອັດຕະໂນມັດ Messenger (Meta Webhook)
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                ເຊື່ອມຕໍ່ Facebook Page, ຕັ້ງຄ່າ Webhook ຝັ່ງ Server ແລະ ລະບົບ AI ຕອບລູກຄ້າ
              </p>
            </div>
          </div>

          {/* Real Connection Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                isActuallyConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isActuallyConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>
                {isActuallyConnected
                  ? 'ເຊື່ອມຕໍ່ Facebook Page ແລ້ວ (Connected)'
                  : 'ຍັງບໍ່ໄດ້ເຊື່ອມຕໍ່ (Not Connected - ໂໝດທົດສອບ)'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-800">
              ຄວາມປອດໄພຂັ້ນສູງ (Secure Server-Side Architecture):
            </span>
            <p className="text-slate-500">
              ລະຫັດ Page Access Token ແລະ Meta App Secret ຈະຖືກເກັບຮັກສາໄວ້ໃນ Server ເທົ່ານັ້ນ.
              ບໍ່ມີການເປີດເຜີຍ token ໃນ Browser code. ທ່ານສາມາດທົດສອບລະບົບຜ່ານ Webhook Simulator ດ້ານລຸ່ມໄດ້ທັນທີ!
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Left = Webhook & Token Setup, Right = Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Webhook Credentials & AI Rules */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Webhook Endpoints */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>1. ຂໍ້ມູນ Webhook ສຳລັບ Meta Developers</span>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Callback URL (ນຳໄປໃສ່ໃນ Meta Developers &gt; Messenger &gt; Webhooks)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={config?.webhookUrl || ''}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 rounded-xl border border-slate-300 text-slate-700 select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(config?.webhookUrl || '', 'url')}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'ກັອບແລ້ວ' : 'ກັອບປີ້'}</span>
                </button>
              </div>
            </div>

            {/* Verify Token */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verify Token (ລະຫັດຢັ້ງຢືນ Webhook)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={config?.webhookVerifyToken || ''}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 rounded-xl border border-slate-300 text-slate-700 select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(config?.webhookVerifyToken || '', 'token')}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'ກັອບແລ້ວ' : 'ກັອບປີ້'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions Collapsible/Card */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
              <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>ຂັ້ນຕອນການເຊື່ອມຕໍ່ກັບ Facebook Page ຕົວຈິງ:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>ເຂົ້າໄປທີ່ <span className="font-semibold text-indigo-700">developers.facebook.com</span> ແລ້ວສ້າງແອັບປະເພດ "Business".</li>
                <li>ເພີ່ມຜະລິດຕະພັນ <span className="font-semibold text-indigo-700">Messenger</span> ເຂົ້າໃນແອັບ.</li>
                <li>ໃນໜ້າ Webhooks, ວາງ <span className="font-mono bg-white px-1 rounded">Callback URL</span> ແລະ <span className="font-mono bg-white px-1 rounded">Verify Token</span> ດ້ານເທິງ.</li>
                <li>ເລືອກ Subscriptions ເປັນ <span className="font-semibold text-indigo-700">messages</span> ແລະ <span className="font-semibold text-indigo-700">messaging_postbacks</span>.</li>
                <li>ສ້າງ <span className="font-semibold text-indigo-700">Page Access Token</span> ຂອງ Page ທ່ານ ແລ້ວນຳມາວາງໃສ່ຊ່ອງດ້ານລຸ່ມເພື່ອເປີດການຕອບກັບ!</li>
              </ol>
            </div>
          </div>

          {/* Section 2: Meta Tokens (Server Protected) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
              <span>2. ຕັ້ງຄ່າ Meta Page Token (ບັນທຶກໄວ້ໃນ Server)</span>
              <span className="text-[11px] font-normal text-slate-500">
                {config?.hasPageAccessToken ? '✓ ມີ Token ແລ້ວ' : '○ ຍັງບໍ່ມີ Token'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook Page ID
                </label>
                <input
                  type="text"
                  placeholder="ຕົວຢ່າງ: 1029384756..."
                  value={pageId}
                  onChange={e => setPageId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meta App Secret (ສຳລັບກວດສອບ HMAC Signature)
                </label>
                <input
                  type="password"
                  placeholder="App Secret..."
                  value={appSecret}
                  onChange={e => setAppSecret(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Page Access Token (EAAG...)
              </label>
              <textarea
                rows={2}
                placeholder="ວາງ Page Access Token ທີ່ໄດ້ຮັບຈາກ Facebook..."
                value={pageAccessToken}
                onChange={e => setPageAccessToken(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                ຖ້າບໍ່ມີ Token, ທ່ານຍັງສາມາດທົດສອບລະບົບ ແລະ ອໍເດີທັງໝົດໄດ້ຜ່ານຕົວຈຳລອງ (Simulator) ດ້ານຂວາ.
              </p>
            </div>
          </div>

          {/* Section 3: AI & Keyword Auto-Reply Rules */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>3. ຕັ້ງຄ່າ AI Smart Reply & ກົດລະບຽບອັດຕະໂນມັດ</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={e => setAiEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-medium text-slate-700">
                  {aiEnabled ? 'ເປີດໃຊ້ AI' : 'ປິດ AI'}
                </span>
              </label>
            </div>

            {/* AI Prompt instructions */}
            {aiEnabled && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ຄຳສັ່ງບຸກຄະລິກກະພາບ AI (Lao Persona Prompt)
                </label>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  AI ຈະອ່ານຂໍ້ມູນສິນຄ້າໃນສາງ, ລາຄາ, ແລະ ບັນຊີ BCEL ຂອງຮ້ານອັດຕະໂນມັດເພື່ອຕອບລູກຄ້າ
                </p>
              </div>
            )}

            {/* Keyword Auto-Reply Rules */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700">
                ກົດລະບຽບຕອບກັບຕາມຄຳສັບ (Keyword Rules):
              </div>

              {/* Rules list */}
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                      rule.isActive
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-100/50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                          "{rule.keyword}"
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (ຖ້າຂໍ້ຄວາມມີຄຳນີ້)
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2">{rule.replyText}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`text-[10px] px-2 py-1 rounded-md font-medium ${
                          rule.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {rule.isActive ? 'ເປີດ' : 'ປິດ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Rule */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-700">+ ເພີ່ມຄຳສັບຕອບກັບໃໝ່:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="ຄຳສັບ ເຊັ່ນ: ສົ່ງຟຣີບໍ່..."
                    value={newKeyword}
                    onChange={e => setNewKeyword(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="ຂໍ້ຄວາມຕອບກັບ..."
                    value={newReplyText}
                    onChange={e => setNewReplyText(e.target.value)}
                    className="sm:col-span-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ເພີ່ມກົດລະບຽບ</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                {saving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກການຕັ້ງຄ່າທັງໝົດ'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Webhook Simulator (Phone Style) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
            {/* Phone header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  LS
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Lao Smart Online Shop</div>
                  <div className="text-[10px] text-blue-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>AI Assistant Active</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                Simulator
              </span>
            </div>

            {/* Quick Test Prompt Buttons */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 shrink-0 font-medium text-[10px]">ລອງຄຳຖາມ:</span>
              <button
                type="button"
                onClick={() => setSimMessage('ສະບາຍດີ ເສື້ອຢືດດອກຈຳປາລາຄາເທົ່າໃດ?')}
                className="px-2 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 text-slate-700 shrink-0"
              >
                ລາຄາສິນຄ້າ?
              </button>
              <button
                type="button"
                onClick={() => setSimMessage('ຂໍເລກບັນຊີແດ່ເຈົ້າ ຈະໂອນເງິນ')}
                className="px-2 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 text-slate-700 shrink-0"
              >
                ເລກບັນຊີ?
              </button>
              <button
                type="button"
                onClick={() => setSimMessage('ຄ່າຈັດສົ່ງໄປຫຼວງພະບາງເທົ່າໃດ?')}
                className="px-2 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 text-slate-700 shrink-0"
              >
                ຄ່າສົ່ງ?
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-100/50">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-400 px-1">
                    <span>{msg.time}</span>
                    {msg.type && (
                      <span className="text-indigo-600 font-semibold uppercase">
                        • {msg.type}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {simulating && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200 w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>AI ກຳລັງພິມຕອບ...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendSimulatedMessage}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="ພິມຂໍ້ຄວາມທົດສອບ (ພາສາລາວ)..."
                value={simMessage}
                onChange={e => setSimMessage(e.target.value)}
                disabled={simulating}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!simMessage.trim() || simulating}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Recent Webhook Activity Logs */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                <span>ປະຫວັດຂໍ້ຄວາມທີ່ຕອບກັບ (Webhook Logs)</span>
              </div>
              <button
                onClick={fetchLogs}
                className="text-[10px] text-emerald-700 hover:underline"
              >
                ຣີເຟຣຊ
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-[11px] text-slate-400 text-center py-2">
                  ຍັງບໍ່ມີປະຫວັດຂໍ້ຄວາມ
                </div>
              ) : (
                logs.slice(0, 5).map(log => (
                  <div
                    key={log.id}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1"
                  >
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span className="font-semibold text-slate-700">{log.senderName}</span>
                      <span>{formatDateLao(log.timestamp)}</span>
                    </div>
                    <div className="text-slate-700 truncate">
                      <span className="font-semibold">ຖາມ: </span>
                      {log.messageText}
                    </div>
                    <div className="text-emerald-700 truncate">
                      <span className="font-semibold">ຕອບ ({log.replyType}): </span>
                      {log.replyText}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
