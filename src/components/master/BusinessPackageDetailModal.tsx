import React from 'react';
import { Business, PlanTier, PLAN_CONFIGS } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Crown,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface BusinessPackageDetailModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (business: Business) => void;
  onManage: (businessId: string) => void;
}

export const BusinessPackageDetailModal: React.FC<BusinessPackageDetailModalProps> = ({
  business,
  isOpen,
  onClose,
  onEdit,
  onManage,
}) => {
  const { updateBusinessPlan, clients, appointments, invoices } = useApp();

  if (!isOpen || !business) return null;

  const currentPlan = business.plan || 'BASIC';
  const planConfig = PLAN_CONFIGS[currentPlan];
  const bizClients = clients.filter((c) => c.businessId === business.id);
  const bizAppointments = appointments.filter((a) => a.businessId === business.id);
  const bizInvoices = invoices.filter((i) => i.businessId === business.id);

  const featureList = [
    {
      name: 'מכסת לקוחות במערכת',
      value: planConfig.maxClients === 'unlimited' ? 'ללא הגבלה (Unlimited)' : `עד ${planConfig.maxClients} לקוחות`,
      available: true,
      currentUsage: `${bizClients.length} לקוחות פעילים`,
    },
    {
      name: 'משפך מכירות Kanban Pipeline',
      description: 'ניהול שלבי לידים, עסקאות ומשפך המרות',
      available: planConfig.hasPipeline,
    },
    {
      name: 'מערכת חשבוניות, קבלות וסליקה',
      description: 'הפקת מסמכים כספיים, מעקב תשלומים ויתרות',
      available: planConfig.hasInvoicing,
    },
    {
      name: 'אנליטיקה חכמה ומדדי ביצוע (Smart Analytics)',
      description: 'גרפים, פילוח הכנסות וביצועים פיננסיים',
      available: planConfig.hasSmartAnalytics,
    },
    {
      name: 'פורטל לקוחות קצה אישי (Client Portal)',
      description: 'אזור אישי ייעודי ללקוחות לקביעת תורים, צפייה במסמכים ותשלומים',
      available: planConfig.hasClientPortal,
      highlight: true,
    },
    {
      name: 'בינה מלאכותית ותובנות עסקיות (AI Insights)',
      description: 'חיזוי נטישת לקוחות, המלצות אפסייל ומינוף הכנסות',
      available: planConfig.hasAiInsights,
      highlight: true,
    },
    {
      name: 'ניהול ושיתוף חוזים ומסמכים (Document Sharing)',
      description: 'אחסון מסמכים מאובטח בפורטל עם הרשאות צפייה',
      available: planConfig.hasDocumentSharing,
    },
    {
      name: 'מודול דיוור שיווקי וקמפיינים (Email Marketing Hub)',
      description: 'שליחת ניוזלטרים, הודעות שיווקיות ופילוח סגמנטים',
      available: planConfig.hasEmailMarketing,
    },
    {
      name: 'ניהול עובדים והרשאות מותאמות (Custom RBAC Roles)',
      description: 'חלוקת תפקידים, עובדים וצוות עם הרשאות מוגדרות',
      available: planConfig.hasCustomRoles,
    },
    {
      name: 'ייצוא נתונים ודוחות מלאים (Excel / CSV)',
      description: 'הורדת נתוני לקוחות, היסטוריית תשלומים ומשימות',
      available: planConfig.hasDataExport,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className={`p-6 text-white shrink-0 relative ${
            currentPlan === 'ULTIMATE'
              ? 'bg-linear-to-r from-amber-900 via-amber-950 to-slate-900'
              : currentPlan === 'PRO'
              ? 'bg-linear-to-r from-indigo-900 via-slate-900 to-indigo-950'
              : 'bg-linear-to-r from-slate-900 via-slate-800 to-slate-900'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-white/70 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md"
                style={{ backgroundColor: business.brandColor || '#4f46e5' }}
              >
                {business.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black">{business.name}</h2>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                      currentPlan === 'ULTIMATE'
                        ? 'bg-amber-400 text-amber-950 border-amber-300'
                        : currentPlan === 'PRO'
                        ? 'bg-indigo-400 text-indigo-950 border-indigo-300'
                        : 'bg-slate-200 text-slate-900 border-slate-300'
                    }`}
                  >
                    חבילת {planConfig.nameHe}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  בעלים: <strong>{business.ownerName}</strong> • {business.ownerEmail} • {business.phone}
                </p>
              </div>
            </div>

            <div className="text-left">
              <div className="text-2xl font-black">₪{planConfig.pricePerMonth}</div>
              <div className="text-[11px] text-slate-300">דמי מנוי לחודש</div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-slate-500 block text-[11px]">לקוחות במערכת</span>
              <span className="text-base font-black text-slate-900">{bizClients.length}</span>
              <span className="text-[10px] text-slate-400 block">
                {planConfig.maxClients === 'unlimited' ? 'ללא הגבלה' : `מתוך ${planConfig.maxClients}`}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-slate-500 block text-[11px]">פגישות ותורים</span>
              <span className="text-base font-black text-slate-900">{bizAppointments.length}</span>
              <span className="text-[10px] text-slate-400 block">במערכת היומן</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-slate-500 block text-[11px]">מסמכים כספיים</span>
              <span className="text-base font-black text-slate-900">{bizInvoices.length}</span>
              <span className="text-[10px] text-slate-400 block">חשבוניות / הצעות</span>
            </div>
          </div>

          {/* Quick Plan Switcher */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
            <span className="font-extrabold text-slate-900 block mb-2.5">
              שנה חבילת מנוי עבור עסק זה (שינוי מיידי ע״י מאסטר):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['BASIC', 'PRO', 'ULTIMATE'] as PlanTier[]).map((tier) => {
                const conf = PLAN_CONFIGS[tier];
                const isCurrent = currentPlan === tier;
                return (
                  <button
                    key={tier}
                    onClick={() => updateBusinessPlan(business.id, tier)}
                    className={`p-2.5 rounded-xl border font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span>{conf.nameHe}</span>
                    <span className="text-[11px] opacity-80">₪{conf.pricePerMonth}/חודש</span>
                    {isCurrent && <span className="text-[10px] text-indigo-300 font-semibold">(פעיל כעת)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Features Checklist */}
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>סטטוס פיצ'רים ורכיבים בחבילת {planConfig.nameHe}:</span>
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {featureList.map((f, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/60">
                  <div className="flex items-center gap-2.5">
                    {f.available ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <div>
                      <span
                        className={`font-bold block ${
                          f.available ? 'text-slate-900' : 'text-slate-400 line-through'
                        }`}
                      >
                        {f.name}
                      </span>
                      {f.description && <span className="text-[11px] text-slate-400">{f.description}</span>}
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    {f.value ? (
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {f.value}
                      </span>
                    ) : f.available ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        כלול בחבילה
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-100 font-medium px-2 py-0.5 rounded-full text-[10px]">
                        לא כלול
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onEdit(business);
            }}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:border-slate-400 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>ערוך פרטי עסק</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-2 rounded-xl"
            >
              סגור
            </button>

            <button
              onClick={() => {
                onClose();
                onManage(business.id);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <span>היכנס לניהול עסק זה</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
