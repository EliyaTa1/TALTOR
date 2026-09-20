import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const SmartAnalytics: React.FC<{ onOpenUpgrade: () => void }> = ({ onOpenUpgrade }) => {
  const { currentBusiness, currentPlanFeatures, businessClients, businessInvoices, businessAppointments } =
    useApp();
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  // If Business is on BASIC, Smart Analytics is a locked premium feature with a clear upgrade teaser
  const isLocked = !currentPlanFeatures.hasSmartAnalytics;

  // Compute live analytical figures from real client data
  const analyticsData = useMemo(() => {
    const totalCollected = businessInvoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingCollection = businessInvoices
      .filter((i) => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.amount, 0);

    const totalPipelineValue = businessClients.reduce((sum, c) => sum + (c.dealValue || 0), 0);

    const activeClientsCount = businessClients.filter((c) => c.status === 'active').length;
    const leadsCount = businessClients.filter(
      (c) => c.status === 'lead' || c.status === 'contacted' || c.status === 'proposal'
    ).length;

    const conversionRate =
      businessClients.length > 0
        ? Math.round((activeClientsCount / businessClients.length) * 100)
        : 0;

    const avgClientValue =
      activeClientsCount > 0 ? Math.round(totalCollected / activeClientsCount) : 0;

    const avgSatisfaction =
      businessClients.length > 0
        ? (
            businessClients.reduce((sum, c) => sum + (c.satisfactionScore || 9), 0) /
            businessClients.length
          ).toFixed(1)
        : '9.5';

    // Revenue chart mock data combined with real baseline
    const revenueTimeline = [
      { month: 'אוק׳', revenue: 14500, target: 12000 },
      { month: 'נוב׳', revenue: 21000, target: 18000 },
      { month: 'דצמ׳', revenue: 28400, target: 25000 },
      { month: 'ינו׳', revenue: 32900, target: 30000 },
      { month: 'פבר׳', revenue: 39500, target: 35000 },
      { month: 'מרץ', revenue: Math.max(totalCollected, 48500), target: 45000 },
    ];

    // Pipeline breakdown
    const stageCounts = [
      { name: 'לידים חדשים', count: businessClients.filter((c) => c.status === 'lead').length, fill: '#6366f1' },
      { name: 'שיחת היכרות', count: businessClients.filter((c) => c.status === 'contacted').length, fill: '#3b82f6' },
      { name: 'הצעת מחיר', count: businessClients.filter((c) => c.status === 'proposal').length, fill: '#f59e0b' },
      { name: 'לקוחות פעילים', count: activeClientsCount, fill: '#10b981' },
    ];

    // High risk churn count
    const churnAlerts = businessClients.filter((c) => c.churnRisk === 'high');

    return {
      totalCollected,
      pendingCollection,
      totalPipelineValue,
      activeClientsCount,
      leadsCount,
      conversionRate,
      avgClientValue,
      avgSatisfaction,
      revenueTimeline,
      stageCounts,
      churnAlerts,
    };
  }, [businessClients, businessInvoices]);

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
          דשבורד אנליטי חכם לעסק שלך
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          בחבילת <strong>{currentPlanFeatures.nameHe}</strong> מנוהלים אנשי הקשר הבסיסיים. כדי לצפות
          במגמות הכנסה חודשיות, יחסי המרה של לידים, ניתוח שביעות רצון וחיזוי תזרימי — שדרג לחבילת{' '}
          <strong>PRO</strong> או <strong>ULTIMATE</strong>.
        </p>
        <button
          id="unlock-analytics-btn"
          onClick={onOpenUpgrade}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>שדרג עכשיו לחבילת PRO ב-₪249/חודש</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">דשבורד אנליטי חכם</h2>
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
              בינה עסקית AI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            מבט-על בזמן אמת על ביצועי המכירות, שימור לקוחות, יחסי המרה ותזרים מזומנים ב-TALTOR.
          </p>
        </div>

        {/* Time Selector */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'month' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            חודש נוכחי
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'quarter' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            רבעון אחרון
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              timeRange === 'year' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            שנה מלאה
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">סך גבייה מצטברת</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              ₪{analyticsData.totalCollected.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ₪{analyticsData.pendingCollection.toLocaleString()} ממתין לתשלום בחשבוניות פתוחות
          </p>
        </div>

        {/* Metric 2: Active Clients & Pipeline */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">לקוחות פעילים</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {analyticsData.activeClientsCount}
            </span>
            <span className="text-xs text-slate-500">
              מתוך {businessClients.length} לקוחות רשומים
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            שווי פוטנציאלי במשפך: ₪{analyticsData.totalPipelineValue.toLocaleString()}
          </p>
        </div>

        {/* Metric 3: Conversion Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">יחס המרה (ליד ➔ לקוח)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{analyticsData.conversionRate}%</span>
            <span className="text-xs font-semibold text-blue-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            מעל הממוצע הענפי (28%)
          </p>
        </div>

        {/* Metric 4: Satisfaction */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">שביעות רצון ממוצעת</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {analyticsData.avgSatisfaction}
            </span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            מדד NPS מעולה (94%)
          </p>
        </div>
      </div>

      {/* Smart Automated AI Insight Banners */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-amber-300 backdrop-blur-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                תובנת בינה עסקית TALTOR
                <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.2 rounded-full font-bold">
                  פעולה מומלצת
                </span>
              </h4>
              <p className="text-xs text-indigo-200 mt-1 leading-relaxed max-w-2xl">
                {analyticsData.churnAlerts.length > 0
                  ? `זוהה לקוח אחד או יותר בסיכון נטישה עקב היעדר תקשורת מעל 25 יום (לדוגמה: ${analyticsData.churnAlerts[0].name}). מומלץ ליזום הודעת WhatsApp יזומה או לקבוע פגישת מעקב.`
                  : `ביצועי החודש חזקים ב-18% לעומת החודש הקודם! 2 הצעות מחיר בשווי ₪32,000 ממתינות לאישור סופי השבוע.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                alert('התובנות סונכרנו בהצלחה עם מאגר הלקוחות.');
              }}
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-xs"
            >
              הפעל המלצה
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">מגמת צמיחת הכנסות חודשית</h3>
              <p className="text-xs text-slate-500">הכנסה בפועל מול יעד חודשי (בש״ח)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-indigo-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                בפועל
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                יעד
              </span>
            </div>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData.revenueTimeline}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₪${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₪${Number(val).toLocaleString()}`, 'הכנסה']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">התפלגות לקוחות לפי שלב</h3>
                <p className="text-xs text-slate-500">סטטוסים נוכחיים במערכת</p>
              </div>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-44 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.stageCounts} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(val: any) => [val, 'כמות לקוחות']}
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {analyticsData.stageCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-slate-500 block text-[11px]">לקוחות פרימיום VIP</span>
              <span className="font-bold text-slate-900 text-sm">
                {businessClients.filter((c) => c.vipStatus).length}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl">
              <span className="text-slate-500 block text-[11px]">פגישות מתוזמנות</span>
              <span className="font-bold text-slate-900 text-sm">
                {businessAppointments.filter((a) => a.status === 'scheduled').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
