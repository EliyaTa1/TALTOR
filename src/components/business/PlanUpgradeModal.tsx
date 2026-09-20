import React from 'react';
import { useApp } from '../../context/AppContext';
import { PLAN_CONFIGS, PlanTier } from '../../types';
import { Check, X, Sparkles, Shield, Zap, Crown, ArrowLeft } from 'lucide-react';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBusinessId?: string;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  targetBusinessId,
}) => {
  const { currentBusiness, businesses, updateBusinessPlan, role } = useApp();

  if (!isOpen) return null;

  const activeBiz = targetBusinessId
    ? businesses.find((b) => b.id === targetBusinessId) || currentBusiness
    : currentBusiness;

  if (!activeBiz) return null;

  const handleSelectPlan = async (tier: PlanTier) => {
    await updateBusinessPlan(activeBiz.id, tier);
    onClose();
  };

  const tiers: PlanTier[] = ['BASIC', 'PRO', 'ULTIMATE'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                ניהול חבילת מנוי: {activeBiz.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              בחר את רמת המנוי המתאימה לעסק שלך. השינוי חל מיידית ומסונכרן ישירות בענן Firebase.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const config = PLAN_CONFIGS[tier];
              const isCurrent = activeBiz.plan === tier;

              return (
                <div
                  key={tier}
                  className={`relative rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                    tier === 'ULTIMATE'
                      ? 'border-amber-400 bg-linear-to-b from-amber-500/5 via-white to-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                      : tier === 'PRO'
                      ? 'border-indigo-400 bg-linear-to-b from-indigo-50/40 via-white to-slate-50 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Highlight pill */}
                  {config.highlightBadge && (
                    <div className="absolute -top-3 right-6 bg-linear-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                      {config.highlightBadge}
                    </div>
                  )}

                  <div>
                    {/* Icon & Title */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {tier === 'ULTIMATE' ? (
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                            <Crown className="w-5 h-5" />
                          </div>
                        ) : tier === 'PRO' ? (
                          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                            <Zap className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                            <Shield className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base">{config.nameHe}</h4>
                          <span className="text-[11px] text-slate-500 font-mono tracking-wide">
                            {config.name}
                          </span>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                          נוכחית
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">₪{config.pricePerMonth}</span>
                        <span className="text-xs text-slate-500">/ לחודש</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {config.description}
                      </p>
                    </div>

                    {/* Feature List */}
                    <div className="space-y-2.5 mb-6">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {config.maxClients === 'unlimited'
                            ? 'לקוחות ללא הגבלה'
                            : `עד ${config.maxClients} לקוחות מנוהלים`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>ניהול פרטי קשר, הערות ופניות WhatsApp</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>יומן פגישות ומשימות עסקי</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        {config.hasPipeline ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={config.hasPipeline ? 'font-medium' : 'text-slate-400 line-through'}>
                          משפך מכירות Kanban חכם
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        {config.hasInvoicing ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={config.hasInvoicing ? 'font-medium' : 'text-slate-400 line-through'}>
                          דרישות תשלום ומעקב חשבוניות
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        {config.hasSmartAnalytics ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={config.hasSmartAnalytics ? 'font-semibold text-indigo-900' : 'text-slate-400 line-through'}>
                          דשבורד אנליטי חכם עם גרפים
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        {config.hasClientPortal ? (
                          <Check className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={config.hasClientPortal ? 'font-bold text-amber-900' : 'text-slate-400 line-through'}>
                          פורטל לקוחות אישי ומאובטח
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        {config.hasAiInsights ? (
                          <Check className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={config.hasAiInsights ? 'font-bold text-amber-900' : 'text-slate-400 line-through'}>
                          AI לחיזוי נטישה ותובנות שימור
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        {config.hasDocumentSharing ? (
                          <Check className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className={config.hasDocumentSharing ? 'font-medium' : 'text-slate-400 line-through'}>
                          שיתוף חוזים ומסמכים מוגנים
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Action Button */}
                  <button
                    id={`select-plan-${tier.toLowerCase()}-btn`}
                    onClick={() => handleSelectPlan(tier)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : tier === 'ULTIMATE'
                        ? 'bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25'
                        : tier === 'PRO'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCurrent ? 'חבילה נוכחית' : `בחר חבילת ${config.nameHe}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>* ניתן לשדרג או לשנמך בכל עת. החיוב יחסי לחודש הפעילות.</span>
          <button
            onClick={onClose}
            className="font-medium text-slate-700 hover:text-slate-900 underline"
          >
            סגור חלון
          </button>
        </div>
      </div>
    </div>
  );
};
