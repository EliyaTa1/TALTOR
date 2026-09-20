import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, PlanTier, PLAN_CONFIGS, MASTER_ADMIN_EMAIL } from '../../types';
import {
  ShieldAlert,
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Power,
  ExternalLink,
  Crown,
  Zap,
  Shield,
  Clock,
  Sparkles,
  Database,
  CheckCircle2,
  X,
  RefreshCw,
  CreditCard,
  Building2,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  Mail,
  Phone,
  Layers,
  AlertTriangle,
  LogIn,
} from 'lucide-react';
import { MasterBillingHub } from './MasterBillingHub';
import { EditBusinessModal } from './EditBusinessModal';
import { BusinessPackageDetailModal } from './BusinessPackageDetailModal';

export const MasterDashboard: React.FC<{
  onSelectBusinessToManage: (businessId: string) => void;
}> = ({ onSelectBusinessToManage }) => {
  const {
    businesses,
    clients,
    auditLogs,
    updateBusinessPlan,
    toggleBusinessStatus,
    createBusiness,
    deleteBusiness,
    resetToDemoData,
    isFirebaseConnected,
    authUser,
    setIsGoogleAuthModalOpen,
  } = useApp();

  const [masterView, setMasterView] = useState<'businesses' | 'billing'>('businesses');
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isNewBusinessOpen, setIsNewBusinessOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [packageDetailBusiness, setPackageDetailBusiness] = useState<Business | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

  // New business form state
  const [newBizName, setNewBizName] = useState('');
  const [newBizOwner, setNewBizOwner] = useState('');
  const [newBizEmail, setNewBizEmail] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizCategory, setNewBizCategory] = useState('קוסמטיקה ואסתטיקה');
  const [newBizPlan, setNewBizPlan] = useState<PlanTier>('PRO');

  // Master Global KPIs
  const masterStats = useMemo(() => {
    const totalBusinesses = businesses.length;
    const activeBusinesses = businesses.filter((b) => b.status === 'active').length;

    // Monthly Recurring Revenue (MRR) from business subscriptions
    const totalMRR = businesses
      .filter((b) => b.status === 'active')
      .reduce((sum, b) => sum + (PLAN_CONFIGS[b.plan]?.pricePerMonth || 0), 0);

    const planCounts = {
      BASIC: businesses.filter((b) => b.plan === 'BASIC').length,
      PRO: businesses.filter((b) => b.plan === 'PRO').length,
      ULTIMATE: businesses.filter((b) => b.plan === 'ULTIMATE').length,
    };

    const totalClientsCount = clients.length;

    return {
      totalBusinesses,
      activeBusinesses,
      totalMRR,
      planCounts,
      totalClientsCount,
    };
  }, [businesses, clients]);

  // Filtered Businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlan = planFilter === 'ALL' || b.plan === planFilter;
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [businesses, searchQuery, planFilter, statusFilter]);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim() || !newBizOwner.trim()) return;

    await createBusiness({
      name: newBizName.trim(),
      ownerName: newBizOwner.trim(),
      ownerEmail: newBizEmail.trim() || `${newBizName.replace(/\s+/g, '').toLowerCase()}@business.co.il`,
      phone: newBizPhone.trim() || '050-1122334',
      category: newBizCategory,
      plan: newBizPlan,
    });

    setIsNewBusinessOpen(false);
    setNewBizName('');
    setNewBizOwner('');
    setNewBizEmail('');
    setNewBizPhone('');
  };

  const confirmDeleteBusiness = async () => {
    if (businessToDelete) {
      await deleteBusiness(businessToDelete.id);
      setBusinessToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Master Admin Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold tracking-tight">
                  ניהול מאסטר ראשי - TALTOR Control Hub
                </h1>
                <span className="bg-amber-400 text-amber-950 font-black text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Crown className="w-3.5 h-3.5" />
                  <span>מנהל מאסטר עליון</span>
                </span>
                <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-[11px] font-mono px-2.5 py-0.5 rounded-full">
                  Root Controller
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span>
                  שלום <strong>טל אליהו</strong> (<span className="font-mono text-indigo-300">{MASTER_ADMIN_EMAIL}</span>).
                </span>
                <span>שליטה מלאה בכלל בעלי העסקים, מסלולי המנויים (BASIC / PRO / ULTIMATE) וסליקת הכספים.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsGoogleAuthModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-2 border border-white/15"
              title="הגדרות כניסת Google וניהול זהויות"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>חיבור Google Auth</span>
            </button>

            <button
              onClick={() => setIsNewBusinessOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף בעל עסק חדש</span>
            </button>

            <button
              onClick={resetToDemoData}
              className="bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
              title="טען מחדש נתוני הדגמה ישראליים מקוריים"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>אפס נתונים</span>
            </button>
          </div>
        </div>
      </div>

      {/* Master Mode Switcher Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setMasterView('businesses')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            masterView === 'businesses'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>ניהול בעלי עסקים, חבילות והרשאות ({businesses.length})</span>
        </button>

        <button
          onClick={() => setMasterView('billing')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            masterView === 'billing'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>סליקת מנויים ותקבולים לטל אליהו (Master Billing)</span>
        </button>
      </div>

      {masterView === 'billing' ? (
        <MasterBillingHub />
      ) : (
        <>
          {/* Global Master KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: MRR */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>הכנסות חודשיות ממנויים (MRR)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                ₪{masterStats.totalMRR.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                מתוך {masterStats.activeBusinesses} עסקים פעילים
              </p>
            </div>

            {/* Metric 2: Total Businesses */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>בעלי עסקים במערכת</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {masterStats.totalBusinesses}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                <span>{masterStats.planCounts.BASIC} בסיסי</span>
                <span>•</span>
                <span>{masterStats.planCounts.PRO} PRO</span>
                <span>•</span>
                <span className="font-bold text-amber-700">{masterStats.planCounts.ULTIMATE} אולטימייט</span>
              </div>
            </div>

            {/* Metric 3: Total End Clients */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>סך לקוחות קצה מנוהלים</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900">
                {masterStats.totalClientsCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                בכלל העסקים ברשת TALTOR
              </p>
            </div>

            {/* Metric 4: Firebase Engine */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>בסיס נתונים Firebase</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{isFirebaseConnected ? 'חיבור ענן פעיל' : 'סנכרון מקומי פעיל'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                multi-tenant scoped
              </p>
            </div>
          </div>

          {/* Businesses Management Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Header & Search Controls */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  רשימת בעלי העסקים והמנויים
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  צפייה במאפייני כל חבילה, עריכת פרטי עסק, שדרוג/שנמוך חבילות, הקפאת חשבונות ומחיקה
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חיפוש עסק, בעלים, אימייל..."
                    className="pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 w-48 lg:w-56 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 px-1">חבילה:</span>
                  {(['ALL', 'BASIC', 'PRO', 'ULTIMATE'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setPlanFilter(t)}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                        planFilter === t
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {t === 'ALL' ? 'הכל' : t}
                    </button>
                  ))}
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="ALL">כל הסטטוסים</option>
                  <option value="active">פעילים בלבד</option>
                  <option value="suspended">מוקפאים בלבד</option>
                </select>
              </div>
            </div>

            {/* Mobile Businesses Cards (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
              {filteredBusinesses.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  לא נמצאו בעלי עסקים התואמים את החיפוש.
                </div>
              ) : (
                filteredBusinesses.map((biz) => {
                  const bizClients = clients.filter((c) => c.businessId === biz.id);
                  return (
                    <div
                      key={biz.id}
                      className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 space-y-3 shadow-xs"
                    >
                      {/* Card Top: Business identity & status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-xs shrink-0"
                            style={{ backgroundColor: biz.brandColor || '#4f46e5' }}
                          >
                            {biz.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">
                              {biz.name}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {biz.category} • {bizClients.length} לקוחות
                            </span>
                          </div>
                        </div>

                        {/* Status Toggle Badge */}
                        <button
                          onClick={() =>
                            toggleBusinessStatus(
                              biz.id,
                              biz.status === 'active' ? 'suspended' : 'active'
                            )
                          }
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1 shrink-0 ${
                            biz.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{biz.status === 'active' ? 'פעיל' : 'מוקפא'}</span>
                        </button>
                      </div>

                      {/* Owner & Contact details */}
                      <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">בעלים:</span>
                          <span className="font-bold text-slate-800">{biz.ownerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">אימייל:</span>
                          <span className="font-mono text-slate-700 text-[11px] truncate max-w-[200px]">
                            {biz.ownerEmail}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">דמי מנוי:</span>
                          <span className="font-black text-slate-900">
                            ₪{PLAN_CONFIGS[biz.plan]?.pricePerMonth || biz.monthlyFee || 99} לחודש
                          </span>
                        </div>
                      </div>

                      {/* Plan Switcher */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 block">
                          חבילת שירות:
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={biz.plan}
                            onChange={(e) => updateBusinessPlan(biz.id, e.target.value as PlanTier)}
                            className={`flex-1 text-xs font-bold rounded-xl px-3 py-2 border ${
                              biz.plan === 'ULTIMATE'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : biz.plan === 'PRO'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            <option value="BASIC">חבילת BASIC (99 ₪)</option>
                            <option value="PRO">חבילת PRO (249 ₪)</option>
                            <option value="ULTIMATE">חבילת ULTIMATE (499 ₪)</option>
                          </select>

                          <button
                            onClick={() => setPackageDetailBusiness(biz)}
                            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-indigo-600"
                            title="צפה במאפייני החבילה"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onSelectBusinessToManage(biz.id)}
                          className="flex-1 bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <span>היכנס כעסק זה</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingBusiness(biz)}
                          className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
                          title="ערוך עסק"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setBusinessToDelete(biz)}
                          className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="מחק עסק"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Businesses Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">שם העסק</th>
                    <th className="py-3.5 px-4">בעלים ואימייל כניסה</th>
                    <th className="py-3.5 px-4">תחום</th>
                    <th className="py-3.5 px-4">חבילת מנוי נוכחית</th>
                    <th className="py-3.5 px-4">תשלום חודשי</th>
                    <th className="py-3.5 px-4">סטטוס</th>
                    <th className="py-3.5 px-4 text-left">פעולות מאסטר</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        לא נמצאו בעלי עסקים התואמים את החיפוש.
                      </td>
                    </tr>
                  ) : (
                    filteredBusinesses.map((biz) => {
                      const bizClients = clients.filter((c) => c.businessId === biz.id);
                      return (
                        <tr key={biz.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Business Name */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs"
                                style={{ backgroundColor: biz.brandColor || '#4f46e5' }}
                              >
                                {biz.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block text-xs">{biz.name}</span>
                                <span className="text-[11px] text-slate-400">
                                  {bizClients.length} לקוחות מנוהלים
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Owner & Login Email */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">{biz.ownerName}</span>
                            <div className="flex items-center gap-1 text-slate-500 text-[11px] font-mono">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{biz.ownerEmail}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 text-slate-600">{biz.category}</td>

                          {/* Plan Badge + Quick Switch */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={biz.plan}
                                onChange={(e) => updateBusinessPlan(biz.id, e.target.value as PlanTier)}
                                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer ${
                                  biz.plan === 'ULTIMATE'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : biz.plan === 'PRO'
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                    : 'bg-slate-100 text-slate-800 border-slate-300'
                                }`}
                              >
                                <option value="BASIC">חבילת BASIC (99 ₪)</option>
                                <option value="PRO">חבילת PRO (249 ₪)</option>
                                <option value="ULTIMATE">חבילת ULTIMATE (499 ₪)</option>
                              </select>

                              {/* Button to view full features checklist for this package */}
                              <button
                                onClick={() => setPackageDetailBusiness(biz)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="צפה במאפייני החבילה המלאים ומגבלותיה"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Fee */}
                          <td className="py-3.5 px-4 font-black text-slate-900">
                            ₪{PLAN_CONFIGS[biz.plan]?.pricePerMonth || biz.monthlyFee || 99}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() =>
                                toggleBusinessStatus(
                                  biz.id,
                                  biz.status === 'active' ? 'suspended' : 'active'
                                )
                              }
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                                biz.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              }`}
                              title="לחץ לשינוי סטטוס"
                            >
                              <Power className="w-3 h-3" />
                              <span>{biz.status === 'active' ? 'פעיל' : 'מוקפא'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Business Button */}
                              <button
                                onClick={() => setEditingBusiness(biz)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="ערוך פרטי עסק"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Business Button */}
                              <button
                                onClick={() => setBusinessToDelete(biz)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="מחק עסק מהמערכת"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Login / Impersonate as Business Owner */}
                              <button
                                onClick={() => onSelectBusinessToManage(biz.id)}
                                className="bg-slate-900 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <span>היכנס כעסק</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Platform Activity / Audit Log */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>יומן פעילות ואבטחה מערכתי (Audit Log)</span>
            </h3>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        log.badgeType === 'purple'
                          ? 'bg-purple-500'
                          : log.badgeType === 'success'
                          ? 'bg-emerald-500'
                          : log.badgeType === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span className="font-bold text-slate-900">{log.action}</span>
                    {log.targetBusinessName && (
                      <span className="text-slate-500 font-medium">• {log.targetBusinessName}</span>
                    )}
                    <span className="text-slate-400">({log.details})</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px] shrink-0">
                    <span className="font-medium text-slate-600">{log.performedBy}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Edit Business Modal */}
      <EditBusinessModal
        business={editingBusiness}
        isOpen={!!editingBusiness}
        onClose={() => setEditingBusiness(null)}
      />

      {/* Package Detail Modal */}
      <BusinessPackageDetailModal
        business={packageDetailBusiness}
        isOpen={!!packageDetailBusiness}
        onClose={() => setPackageDetailBusiness(null)}
        onEdit={(biz) => {
          setPackageDetailBusiness(null);
          setEditingBusiness(biz);
        }}
        onManage={(bizId) => {
          setPackageDetailBusiness(null);
          onSelectBusinessToManage(bizId);
        }}
      />

      {/* Delete Business Confirmation Dialog */}
      {businessToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  מחיקת עסק: {businessToDelete.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  האם אתה בטוח שברצונך למחוק את העסק של <strong>{businessToDelete.ownerName}</strong>?
                  פעולה זו תסיר את העסק ממאגר הנתונים ומהמנויים.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setBusinessToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
              >
                ביטול
              </button>

              <button
                onClick={confirmDeleteBusiness}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>מחק עסק לצמיתות</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Business Modal */}
      {isNewBusinessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">הקמת בעל עסק חדש במערכת TALTOR</h3>
              <button
                onClick={() => setIsNewBusinessOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">שם העסק / המותג *</label>
                <input
                  type="text"
                  required
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  placeholder="לדוגמה: אדריכלות ושזירה ירוקה"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">שם בעל העסק *</label>
                  <input
                    type="text"
                    required
                    value={newBizOwner}
                    onChange={(e) => setNewBizOwner(e.target.value)}
                    placeholder="שם מלא"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">טלפון / וואטסאפ</label>
                  <input
                    type="tel"
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    placeholder="050-1234567"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  אימייל התחברות (לצורך Google Auth) *
                </label>
                <input
                  type="email"
                  required
                  value={newBizEmail}
                  onChange={(e) => setNewBizEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">תחום עיסוק</label>
                  <input
                    type="text"
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    placeholder="עיצוב, קוסמטיקה, ייעוץ..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">חבילת מנוי ראשונית</label>
                  <select
                    value={newBizPlan}
                    onChange={(e) => setNewBizPlan(e.target.value as PlanTier)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
                  >
                    <option value="BASIC">BASIC (99 ₪/חודש)</option>
                    <option value="PRO">PRO (249 ₪/חודש)</option>
                    <option value="ULTIMATE">ULTIMATE (499 ₪/חודש)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBusinessOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  צור עסק במערכת
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
