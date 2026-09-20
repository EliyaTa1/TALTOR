import React, { useState, useEffect } from 'react';
import { Business, PlanTier, PLAN_CONFIGS } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Tag,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Power,
  Palette,
  Check,
} from 'lucide-react';

interface EditBusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'קוסמטיקה ואסתטיקה',
  'עיצוב ומיתוג דיגיטלי',
  'עורכי דין ומשפט',
  'כושר ואימונים אישיים',
  'ייעוץ עסקי ופיננסי',
  'צילום והפקות',
  'טיפולים אלטרנטיביים',
  'שירותים מקצועיים',
];

const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#0284c7', // Sky
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#d97706', // Amber
  '#059669', // Emerald
  '#1e293b', // Slate
];

export const EditBusinessModal: React.FC<EditBusinessModalProps> = ({ business, isOpen, onClose }) => {
  const { updateBusinessSettings, updateBusinessPlan } = useApp();

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [plan, setPlan] = useState<PlanTier>('PRO');
  const [status, setStatus] = useState<'active' | 'suspended' | 'trial'>('active');
  const [monthlyFee, setMonthlyFee] = useState<number>(249);
  const [brandColor, setBrandColor] = useState('#4f46e5');
  const [customPortalMessage, setCustomPortalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setOwnerName(business.ownerName || '');
      setOwnerEmail(business.ownerEmail || '');
      setPhone(business.phone || '');
      setCategory(business.category || 'שירותים מקצועיים');
      setPlan(business.plan || 'PRO');
      setStatus(business.status || 'active');
      setMonthlyFee(business.monthlyFee || PLAN_CONFIGS[business.plan || 'PRO']?.pricePerMonth || 249);
      setBrandColor(business.brandColor || '#4f46e5');
      setCustomPortalMessage(business.customPortalMessage || '');
    }
  }, [business]);

  if (!isOpen || !business) return null;

  const handlePlanChange = (newPlan: PlanTier) => {
    setPlan(newPlan);
    setMonthlyFee(PLAN_CONFIGS[newPlan]?.pricePerMonth || 99);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateBusinessSettings(business.id, {
        name: name.trim(),
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
        phone: phone.trim(),
        category,
        plan,
        monthlyFee: Number(monthlyFee),
        status,
        brandColor,
        customPortalMessage: customPortalMessage.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to update business:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ backgroundColor: brandColor }}
            >
              {name.charAt(0) || 'B'}
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>עריכת עסק: {business.name}</span>
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  ID: {business.id}
                </span>
              </h2>
              <p className="text-xs text-slate-300">עדכון פרטי עסק, בעלים, חבילת שירות וסטטוס חשבון ע״י מנהל מאסטר</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          {/* Business & Owner Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">שם העסק *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">שם הבעלים *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                אימייל הבעלים (משמש להתחברות עם Google) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">מספר טלפון / וואטסאפ</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">תחום פעילות העסק</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Plan & Pricing Tier */}
          <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>חבילת מנוי שירות</span>
              </span>
              <span className="text-[11px] text-slate-500">שינוי חבילה מעדכן מיידית את פיצ'רי העסק</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {(['BASIC', 'PRO', 'ULTIMATE'] as PlanTier[]).map((tier) => {
                const conf = PLAN_CONFIGS[tier];
                const isSelected = plan === tier;
                return (
                  <button
                    type="button"
                    key={tier}
                    onClick={() => handlePlanChange(tier)}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? tier === 'ULTIMATE'
                          ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                          : tier === 'PRO'
                          ? 'border-indigo-500 bg-indigo-50/80 shadow-xs'
                          : 'border-slate-800 bg-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">{conf.nameHe}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <div className="text-slate-700 font-black text-sm">₪{conf.pricePerMonth}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {tier === 'BASIC'
                        ? 'עד 50 לקוחות'
                        : tier === 'PRO'
                        ? 'עד 500 לקוחות + שיווק'
                        : 'ללא הגבלה + פורטל ו-AI'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">דמי מנוי חודשיים (₪)</label>
                <input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">סטטוס חשבון</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold"
                >
                  <option value="active">פעיל (Active)</option>
                  <option value="suspended">מוקפא (Suspended)</option>
                  <option value="trial">תקופת ניסיון (Trial)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Brand Color & Portal Welcome */}
          <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-4 space-y-3">
            <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>מיתוג וצבע העסק</span>
            </span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      brandColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0"
              />
              <span className="text-[11px] font-mono text-slate-500">{brandColor}</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">הודעת ברוכים הבאים בפורטל הלקוח</label>
              <textarea
                rows={2}
                value={customPortalMessage}
                onChange={(e) => setCustomPortalMessage(e.target.value)}
                placeholder="הודעה שתוצג ללקוחות הקצה בעת כניסה לפורטל..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold rounded-xl transition-colors"
            >
              ביטול
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>שמור שינויים</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
