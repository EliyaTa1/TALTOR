import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Crown,
  Zap,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  Sparkles,
  Lock,
} from 'lucide-react';
import { PLAN_CONFIGS } from '../../types';

export const BusinessBillingView: React.FC<{ onOpenUpgrade: () => void }> = ({ onOpenUpgrade }) => {
  const {
    currentBusiness,
    currentPlanFeatures,
    businessSubscription,
    subscriptionBillings,
    activeBusinessId,
    paySubscriptionInvoice,
    updateBusinessSettings,
  } = useApp();

  const [isUpdateCardOpen, setIsUpdateCardOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [cardSuccessAlert, setCardSuccessAlert] = useState(false);

  if (!currentBusiness) return null;

  // Filter history of invoices for this specific business
  const businessInvoices = subscriptionBillings.filter((s) => s.businessId === activeBusinessId);

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim() || newCardNumber.length < 4) return;
    setIsSavingCard(true);

    const last4 = newCardNumber.replace(/\s+/g, '').slice(-4);
    await updateBusinessSettings(activeBusinessId, {
      cardLast4: last4,
      paymentMethod: 'credit_card',
    });

    setIsSavingCard(false);
    setIsUpdateCardOpen(false);
    setCardSuccessAlert(true);
    setTimeout(() => setCardSuccessAlert(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900">
              ניהול מנוי ותשלומי עסק למערכת TALTOR
            </h2>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              חבילת {currentPlanFeatures.nameHe}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            פרטי חיוב חודשיים, אמצעי תשלום שמורים, היסטוריית קבלות מס דיגיטליות מ-TALTOR.
          </p>
        </div>

        <button
          onClick={onOpenUpgrade}
          className="text-xs bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>שדרג לחבילה גבוהה יותר</span>
        </button>
      </div>

      {cardSuccessAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>אמצעי התשלום עודכן בהצלחה במערכת הסליקה המאובטחת!</span>
        </div>
      )}

      {/* Plan Status & Payment Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Plan Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-slate-500 block">חבילת מנוי פעילה</span>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-900">חבילת {currentPlanFeatures.nameHe}</h3>
            {currentBusiness.plan === 'ULTIMATE' ? (
              <Crown className="w-5 h-5 text-amber-500" />
            ) : currentBusiness.plan === 'PRO' ? (
              <Zap className="w-5 h-5 text-indigo-600" />
            ) : (
              <Shield className="w-5 h-5 text-slate-600" />
            )}
          </div>
          <p className="text-xs text-slate-600">{currentPlanFeatures.taglineHe}</p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-400 text-xs">דמי מנוי:</span>
            <span className="text-lg font-black text-slate-900">₪{currentBusiness.monthlyFee} / חודש</span>
          </div>
        </div>

        {/* Next Billing Date Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-slate-500 block">מועד חיוב קרוב</span>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-black text-slate-900">{currentBusiness.nextBillingDate || '2026-04-15'}</h3>
          </div>
          <span className="inline-block text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            מנוי פעיל - חידוש אוטומטי
          </span>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">סטטוס תשלום:</span>
            <span className="font-bold text-emerald-700">הוסדר לחודש הנוכחי</span>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">אמצעי תשלום רשום</span>
            <div className="flex items-center gap-2 mt-1">
              <CreditCard className="w-5 h-5 text-slate-700" />
              <span className="font-mono font-bold text-slate-900 text-base">
                **** {currentBusiness.cardLast4 || '4242'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              חיוב מאובטח לפי תקן PCI-DSS
            </span>
          </div>

          <button
            onClick={() => setIsUpdateCardOpen(true)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors border border-slate-200"
          >
            עדכן כרטיס אשראי
          </button>
        </div>
      </div>

      {/* Subscription Invoices History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">היסטוריית חשבוניות וקבלות מנוי חודשיות</h3>
          <span className="text-xs text-slate-400">כולל מע״מ כחוק מ-TALTOR</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {businessInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                  <span className="font-black text-slate-800">דמי מנוי TALTOR ({inv.plan})</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    שולם
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>תאריך: {inv.paidDate || inv.billingDate}</span>
                  <span>•</span>
                  <span>אמצעי: כרטיס אשראי מסתיים ב-{inv.cardLast4}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-base font-black text-slate-900">₪{inv.amount}</span>

                <button
                  onClick={() => alert(`מוריד קבלה מקורית ומאושרת מס הכנסה עבור ${inv.invoiceNumber}...`)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>הורד קבלה</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Card Modal */}
      {isUpdateCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm">עדכון אמצעי תשלום למנוי TALTOR</h3>
              <button onClick={() => setIsUpdateCardOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCard} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">מספר כרטיס אשראי *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    placeholder="4580 1234 5678 9012"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">תוקף (MM/YY) *</label>
                  <input
                    type="text"
                    required
                    value={newCardExp}
                    onChange={(e) => setNewCardExp(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">3 ספרות בגב (CVC) *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={newCardCvc}
                    onChange={(e) => setNewCardCvc(e.target.value)}
                    placeholder="772"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>הפרטים מוצפנים ונשמרים בהתאם לתקן אבטחת סליקה עולמי.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateCardOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isSavingCard}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  {isSavingCard ? 'מעדכן...' : 'שמור כרטיס חדש'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
