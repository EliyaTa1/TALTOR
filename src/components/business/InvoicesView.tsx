import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import {
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Lock,
  Sparkles,
  Download,
  X,
  Check,
} from 'lucide-react';

export const InvoicesView: React.FC<{ onOpenUpgrade: () => void }> = ({ onOpenUpgrade }) => {
  const {
    businessInvoices,
    businessClients,
    currentPlanFeatures,
    activeBusinessId,
    addInvoice,
    markInvoicePaid,
    currentBusiness,
  } = useApp();

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [clientId, setClientId] = useState(businessClients[0]?.id || '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );

  const isLocked = !currentPlanFeatures.hasInvoicing;

  const stats = useMemo(() => {
    const paid = businessInvoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    const pending = businessInvoices
      .filter((i) => i.status === 'pending')
      .reduce((sum, i) => sum + i.amount, 0);

    const overdue = businessInvoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + i.amount, 0);

    return { paid, pending, overdue };
  }, [businessInvoices]);

  if (isLocked) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <Lock className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          זמין החל מחבילת PRO
        </span>
        <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">
          ניהול חיובים ודרישות תשלום
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          מעקב תשלומים מדויק, הפקת דרישות תשלום, ניהול חשבוניות ששולמו וממתינות, וסנכרון תשלומים ישיר לפורטל הלקוחות.
        </p>
        <button
          onClick={onOpenUpgrade}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>שדרג עכשיו לחבילת PRO</span>
        </button>
      </div>
    );
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0 || !clientId) return;

    const client = businessClients.find((c) => c.id === clientId);
    const invoiceNumber = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

    await addInvoice({
      businessId: activeBusinessId,
      clientId,
      clientName: client?.name || 'לקוח',
      number: invoiceNumber,
      description: description.trim(),
      amount: Number(amount),
      status: 'pending',
      dueDate,
    });

    setIsNewOpen(false);
    setDescription('');
    setAmount(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">כספים וחשבוניות</h2>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              מעקב גבייה
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            דרישות תשלום, מעקב סטטוסים וסנכרון מיידי לחשבוניות בפורטל הלקוח.
          </p>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>הפק דרישת תשלום</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>סה״כ נגבה (שולם)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₪{stats.paid.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">גבייה שהושלמה בהצלחה</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ממתין לתשלום</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            ₪{stats.pending.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">מועד פירעון קרוב</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>באיחור גבייה</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600 mt-2">
            ₪{stats.overdue.toLocaleString()}
          </div>
          <span className="text-[11px] text-red-500 font-medium">דרוש טיפול ומעקב</span>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {businessInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            אין חשבוניות או דרישות תשלום עדיין.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">מספר חשבונית</th>
                  <th className="py-3 px-4">לקוח</th>
                  <th className="py-3 px-4">תיאור העסקה</th>
                  <th className="py-3 px-4">סכום</th>
                  <th className="py-3 px-4">מועד פירעון</th>
                  <th className="py-3 px-4">סטטוס</th>
                  <th className="py-3 px-4 text-left">פעולה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {businessInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.number}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{inv.clientName}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{inv.description}</td>
                    <td className="py-3 px-4 font-black text-slate-900">₪{inv.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status === 'paid'
                          ? `שולם (${inv.paidDate || 'מאושר'})`
                          : inv.status === 'overdue'
                          ? 'באיחור'
                          : 'ממתין לתשלום'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-left">
                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => markInvoicePaid(inv.id)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-[11px] border border-emerald-200 transition-colors"
                        >
                          סמן כשולם
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 flex items-center justify-end gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" /> שולם
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Invoice Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">הפקת דרישת תשלום חדשה</h3>
              <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">בחר לקוח *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {businessClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">תיאור השירות / העבודה *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="לדוגמה: מקדמה לפרויקט מיתוג ועיצוב"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">סכום לתשלום (₪) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="3500"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">מועד לתשלום</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  הפק דרישת תשלום
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
