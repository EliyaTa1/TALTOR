import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react';

interface TaskNotificationBannerProps {
  onNavigateToTasks?: () => void;
}

export const TaskNotificationBanner: React.FC<TaskNotificationBannerProps> = ({ onNavigateToTasks }) => {
  const { overdueTasks, todayTasks, updateTaskStatus, postponeTask } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalUrgent = overdueTasks.length + todayTasks.length;

  if (totalUrgent === 0) {
    return null;
  }

  return (
    <div className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-4 shadow-xs mb-6 text-slate-800 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-sm">
                תזכורות ומשימות דחופות לטיפול
              </h4>
              <span className="text-[11px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                {totalUrgent} דורשות תשומת לב
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {overdueTasks.length > 0 && (
                <span className="text-red-700 font-bold ml-2">
                  ⚠️ {overdueTasks.length} משימות באיחור!
                </span>
              )}
              {todayTasks.length > 0 && (
                <span className="text-amber-800 font-semibold">
                  📌 {todayTasks.length} משימות מתוזמנות להיום.
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onNavigateToTasks && (
            <button
              onClick={onNavigateToTasks}
              className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors flex items-center gap-1"
            >
              <span>לוח משימות מלא</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-amber-100/50 transition-colors flex items-center gap-1"
          >
            <span className="text-[11px] font-bold">
              {isExpanded ? 'צמצם' : 'הצג משימות'}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Quick Action List */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-amber-200/80 space-y-2">
          {overdueTasks.map((t) => (
            <div
              key={t.id}
              className="bg-white/95 rounded-xl p-3 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-red-100 text-red-800 px-2 py-0.5 rounded-md border border-red-200">
                  באיחור ({t.dueDate})
                </span>
                <span className="font-bold text-slate-900">{t.title}</span>
                {t.clientName && (
                  <span className="text-slate-500 text-[11px]">• לקוח: {t.clientName}</span>
                )}
                {t.assignedToName && (
                  <span className="text-indigo-600 text-[11px] font-medium">({t.assignedToName})</span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => postponeTask(t.id, 1)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  דחה ביום
                </button>
                <button
                  onClick={() => updateTaskStatus(t.id, 'completed')}
                  className="text-[11px] font-bold text-emerald-800 hover:text-white bg-emerald-100 hover:bg-emerald-600 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>בוצע</span>
                </button>
              </div>
            </div>
          ))}

          {todayTasks.map((t) => (
            <div
              key={t.id}
              className="bg-white/95 rounded-xl p-3 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                  היום ({t.dueTime || 'סוף יום'})
                </span>
                <span className="font-bold text-slate-900">{t.title}</span>
                {t.clientName && (
                  <span className="text-slate-500 text-[11px]">• לקוח: {t.clientName}</span>
                )}
                {t.assignedToName && (
                  <span className="text-indigo-600 text-[11px] font-medium">({t.assignedToName})</span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => postponeTask(t.id, 1)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  דחה למחר
                </button>
                <button
                  onClick={() => updateTaskStatus(t.id, 'completed')}
                  className="text-[11px] font-bold text-emerald-800 hover:text-white bg-emerald-100 hover:bg-emerald-600 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>סמן כבוצע</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
