import React from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus } from '../../types';
import {
  Lock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Plus,
  DollarSign,
  Phone,
  MessageCircle,
  Star,
} from 'lucide-react';

export const PipelineBoard: React.FC<{ onOpenUpgrade: () => void }> = ({ onOpenUpgrade }) => {
  const { businessClients, currentPlanFeatures, updateClient, currentBusiness } = useApp();

  const isLocked = !currentPlanFeatures.hasPipeline;

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
          משפך מכירות Kanban חכם (Sales Pipeline)
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          ניהול עסקאות ויזואלי בשלבים: מליד חדש, דרך שיחות התאמה והצעות מחיר ועד סגירה מוצלחת.
          כולל חישוב שווי צבר עסקאות בזמן אמת.
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

  const columns: { id: ClientStatus; title: string; color: string; badgeBg: string }[] = [
    { id: 'lead', title: 'לידים חדשים', color: 'border-purple-300', badgeBg: 'bg-purple-100 text-purple-800' },
    { id: 'contacted', title: 'שיחת היכרות / אפיון', color: 'border-blue-300', badgeBg: 'bg-blue-100 text-blue-800' },
    { id: 'proposal', title: 'הצעת מחיר בהמתנה', color: 'border-amber-300', badgeBg: 'bg-amber-100 text-amber-800' },
    { id: 'active', title: 'נסגר בהצלחה (פעיל)', color: 'border-emerald-300', badgeBg: 'bg-emerald-100 text-emerald-800' },
  ];

  const moveStage = async (client: Client, direction: 'prev' | 'next') => {
    const order: ClientStatus[] = ['lead', 'contacted', 'proposal', 'active'];
    const currentIndex = order.indexOf(client.status);
    if (currentIndex === -1) return;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < order.length) {
      await updateClient({ ...client, status: order[targetIndex] });
    }
  };

  const totalPipelineSum = businessClients.reduce((sum, c) => sum + (c.dealValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">משפך מכירות Kanban</h2>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {businessClients.length} עסקאות בתהליך
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            הזז עסקאות בין השלבים בלחיצה קלה למעקב אחר התקדמות הלידים.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">שווי צבר עסקאות כולל:</span>
          <span className="text-base font-black text-slate-900">
            ₪{totalPipelineSum.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const clientsInCol = businessClients.filter((c) => c.status === col.id);
          const colSum = clientsInCol.reduce((sum, c) => sum + (c.dealValue || 0), 0);

          return (
            <div
              key={col.id}
              className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3.5 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                    {clientsInCol.length}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">{col.title}</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  ₪{colSum.toLocaleString()}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {clientsInCol.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                    אין עסקאות בשלב זה
                  </div>
                ) : (
                  clientsInCol.map((client) => (
                    <div
                      key={client.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-xs">{client.name}</h4>
                            {client.vipStatus && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">{client.phone}</span>
                        </div>
                        <span className="font-black text-slate-900 text-xs bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          ₪{(client.dealValue || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Tags */}
                      {client.tags && client.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {client.tags.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Move Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <button
                          disabled={col.id === 'lead'}
                          onClick={() => moveStage(client, 'prev')}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-30 p-1 flex items-center gap-0.5 font-medium transition-colors"
                          title="החזר שלב אחורה"
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>אחורה</span>
                        </button>

                        <button
                          disabled={col.id === 'active'}
                          onClick={() => moveStage(client, 'next')}
                          className="text-indigo-600 hover:text-indigo-800 disabled:opacity-30 p-1 flex items-center gap-0.5 font-bold transition-colors"
                          title="קדם לשלב הבא"
                        >
                          <span>קדם שלב</span>
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
