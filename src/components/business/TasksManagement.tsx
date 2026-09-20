import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  CheckCircle2,
  Trash2,
  Filter,
  Search,
  ChevronRight,
  Bell,
  X,
  ArrowUpDown,
} from 'lucide-react';

export const TasksManagement: React.FC = () => {
  const {
    businessTasks,
    businessClients,
    businessEmployees,
    activeBusinessId,
    addTask,
    updateTaskStatus,
    deleteTask,
    postponeTask,
    overdueTasks,
    todayTasks,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Task Modal State
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));
  const [dueTime, setDueTime] = useState('14:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [hasReminder, setHasReminder] = useState(true);

  // Filtered tasks list
  const filteredTasks = useMemo(() => {
    return businessTasks.filter((t) => {
      // Tab filter
      if (activeFilter === 'today' && t.dueDate !== new Date().toISOString().substring(0, 10)) return false;
      if (activeFilter === 'overdue' && (t.status === 'completed' || t.dueDate >= new Date().toISOString().substring(0, 10))) return false;
      if (activeFilter === 'completed' && t.status !== 'completed') return false;
      if (activeFilter === 'all' && t.status === 'completed') return false; // Default active tasks in "all"

      // Priority
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      // Employee
      if (employeeFilter !== 'all' && t.assignedToId !== employeeFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesClient = t.clientName?.toLowerCase().includes(q);
        const matchesAssignee = t.assignedToName?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesClient && !matchesAssignee) return false;
      }

      return true;
    });
  }, [businessTasks, activeFilter, priorityFilter, employeeFilter, searchQuery]);

  const completedCount = useMemo(() => {
    return businessTasks.filter((t) => t.status === 'completed').length;
  }, [businessTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const client = businessClients.find((c) => c.id === selectedClientId);
    const emp = businessEmployees.find((e) => e.id === assignedEmployeeId);

    await addTask({
      businessId: activeBusinessId,
      clientId: selectedClientId || undefined,
      clientName: client?.name,
      assignedToId: assignedEmployeeId || undefined,
      assignedToName: emp?.name || 'בעל העסק',
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime,
      priority,
      status: 'pending',
      reminderSet: hasReminder,
    });

    setIsNewOpen(false);
    setTitle('');
    setDescription('');
    setSelectedClientId('');
    setAssignedEmployeeId('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900">ניהול משימות ותזכורות</h2>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {businessTasks.length} סה״כ משימות
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            שיוך משימות ללקוחות ספציפיים, הקצאת עובדים אחראיים, תאריכי יעד והתראות.
          </p>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>משימה חדשה</span>
        </button>
      </div>

      {/* Analytics KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveFilter('all')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            activeFilter === 'all' ? 'border-indigo-600 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-slate-500 text-xs font-semibold block">משימות פתוחות</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {businessTasks.filter((t) => t.status !== 'completed').length}
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('overdue')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            activeFilter === 'overdue' ? 'border-red-600 ring-2 ring-red-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-red-700 text-xs font-semibold">באיחור</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <span className="text-2xl font-black text-red-600 mt-1 block">
            {overdueTasks.length}
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('today')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            activeFilter === 'today' ? 'border-amber-600 ring-2 ring-amber-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-amber-800 text-xs font-semibold block">יעד להיום</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {todayTasks.length}
          </span>
        </div>

        <div
          onClick={() => setActiveFilter('completed')}
          className={`cursor-pointer bg-white rounded-2xl p-4 border transition-all ${
            activeFilter === 'completed' ? 'border-emerald-600 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-emerald-800 text-xs font-semibold block">הושלמו</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש משימה, לקוח או איש צוות..."
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium"
          >
            <option value="all">כל העדיפויות</option>
            <option value="urgent">דחוף ביותר (Urgent)</option>
            <option value="high">גבוהה (High)</option>
            <option value="medium">בינונית (Medium)</option>
            <option value="low">נמוכה (Low)</option>
          </select>

          {/* Employee filter */}
          {businessEmployees.length > 0 && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option value="all">כל העובדים / צוות</option>
              {businessEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.roleTitle})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 text-xs">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">אין משימות תואמות לסינון</h4>
            <p className="mt-1">כל המשימות במסנן זה בוצעו או שטרם נוספו משימות.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && task.dueDate < new Date().toISOString().substring(0, 10);
            const isToday = !isCompleted && task.dueDate === new Date().toISOString().substring(0, 10);

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                  isCompleted
                    ? 'border-slate-200 bg-slate-50/50 opacity-70'
                    : isOverdue
                    ? 'border-red-200 hover:border-red-300 shadow-xs'
                    : isToday
                    ? 'border-amber-200 hover:border-amber-300 shadow-xs'
                    : 'border-slate-200 hover:border-indigo-200 shadow-xs'
                }`}
              >
                {/* Checkbox and Info */}
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() =>
                      updateTaskStatus(task.id, isCompleted ? 'pending' : 'completed')
                    }
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-indigo-600 bg-white'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-bold text-sm ${
                          isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Tag */}
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          task.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : task.priority === 'medium'
                            ? 'bg-indigo-50 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority === 'urgent'
                          ? 'דחוף ביותר'
                          : task.priority === 'high'
                          ? 'גבוהה'
                          : task.priority === 'medium'
                          ? 'בינונית'
                          : 'נמוכה'}
                      </span>

                      {/* Timing status */}
                      {isOverdue && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          באיחור!
                        </span>
                      )}
                      {isToday && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          יעד היום
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-slate-600 text-xs">{task.description}</p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      {task.clientName && (
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>לקוח: {task.clientName}</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>מועד: {task.dueDate} {task.dueTime ? `(${task.dueTime})` : ''}</span>
                      </span>

                      {task.assignedToName && (
                        <span className="text-indigo-600 font-medium">
                          באחריות: {task.assignedToName}
                        </span>
                      )}

                      {task.reminderSet && (
                        <span className="text-amber-700 flex items-center gap-1 text-[10px]">
                          <Bell className="w-3 h-3" />
                          <span>תזכורת פעילה</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={() => postponeTask(task.id, 1)}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
                      title="דחה ביום אחד"
                    >
                      דחה ביום
                    </button>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="מחק משימה"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Task Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">יצירת משימה ותזכורת חדשה</h3>
              <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">כותרת המשימה *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="לדוגמה: הכנת הצעת מחיר / שיחת מעקב אחרי איפיון"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">קישור ללקוח ספציפי (אופציונלי)</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- כללי (ללא לקוח ספציפי) --</option>
                  {businessClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">הקצאה לאיש צוות</label>
                <select
                  value={assignedEmployeeId}
                  onChange={(e) => setAssignedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">בעל העסק (עצמי)</option>
                  {businessEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.roleTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">תאריך יעד *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">שעת יעד</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">רמת דחיפות</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="urgent">דחוף ביותר (Urgent)</option>
                    <option value="high">גבוהה (High)</option>
                    <option value="medium">בינונית (Medium)</option>
                    <option value="low">נמוכה (Low)</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={hasReminder}
                      onChange={(e) => setHasReminder(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>הפעל התראה בדשבורד</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">פירוט והערות</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="דגשים ופרטים לביצוע..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
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
                  צור משימה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
