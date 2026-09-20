import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PLAN_CONFIGS, UserRole, MASTER_ADMIN_EMAIL } from '../../types';
import {
  ShieldAlert,
  Briefcase,
  User,
  Sparkles,
  Database,
  ArrowRightLeft,
  ChevronDown,
  ExternalLink,
  Layers,
  Crown,
  LogIn,
  CheckCircle2,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export const TopBar: React.FC<{ onOpenUpgradeModal: () => void }> = ({ onOpenUpgradeModal }) => {
  const {
    role,
    setRole,
    businesses,
    activeBusinessId,
    setActiveBusinessId,
    currentBusiness,
    currentPlanFeatures,
    clients,
    activeClientId,
    setActiveClientId,
    isFirebaseConnected,
    authUser,
    isMasterUser,
    activeEmployeeId,
    employees,
    setIsGoogleAuthModalOpen,
    setIsLoginScreenOpen,
    signOutUser,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentEmployee = employees.find((e) => e.id === activeEmployeeId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs" dir="rtl">
      {/* Top Notification Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 relative shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isFirebaseConnected ? 'bg-emerald-400 opacity-75' : 'bg-indigo-400 opacity-75'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isFirebaseConnected ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
            ></span>
          </span>
          <span className="font-medium text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-none">
            {isFirebaseConnected
              ? 'Firebase Firestore מחובר ומסונכרן בזמן אמת'
              : 'חיבור מאובטח ומסונכרן מקומית'}
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-300 hidden md:inline">
            מערכת <strong className="text-white font-semibold">TALTOR</strong> לניהול לקוחות רב-שכבתי
          </span>
        </div>

        {/* Auth status / dedicated login buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Login Screen Button */}
          <button
            onClick={() => setIsLoginScreenOpen(true)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
            title="מעבר למסך ההתחברות המרכזי"
          >
            <LogIn className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">מסך התחברות</span>
          </button>

          {/* Google Profile / Account Modal Button */}
          <button
            onClick={() => setIsGoogleAuthModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 sm:px-2.5 py-0.5 rounded-lg font-medium text-[10px] sm:text-[11px] border border-slate-700 transition-colors cursor-pointer"
            title="הגדרות חשבון והתחברות"
          >
            {/* Google G logo */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.1-6.71-4.93H1.24v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.29 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.05-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.24 6.58l4.05 3.15c.95-2.83 3.59-4.98 6.71-4.98z"
              />
            </svg>
            {authUser ? (
              <span className="flex items-center gap-1 font-semibold text-white">
                <span className="max-w-[80px] sm:max-w-[130px] truncate">
                  {authUser.displayName || 'משתמש Google'}
                </span>
                {authUser.isMaster && (
                  <span className="bg-amber-400 text-amber-950 text-[9px] px-1 rounded font-bold">
                    מאסטר
                  </span>
                )}
              </span>
            ) : (
              <span>התחבר עם Google</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Current Workspace */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <span className="font-extrabold text-base sm:text-lg tracking-wider">T</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">TALTOR</h1>
                <span className="text-[10px] sm:text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-1.5 py-0.2 rounded-full">
                  CRM Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-[200px] lg:max-w-none">
                {role === 'master'
                  ? 'לוח בקרה ראשי - מנהל מאסטר (טל אליהו)'
                  : role === 'client'
                  ? `פורטל לקוח: ${currentBusiness?.name || ''}`
                  : `${currentBusiness?.name || ''}`}
              </p>
            </div>
          </div>

          {/* Current Plan Badge for Business View (Desktop) */}
          {role === 'business_owner' && currentBusiness && (
            <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-slate-200">
              <button
                id="header-plan-badge-btn"
                onClick={onOpenUpgradeModal}
                className={`group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                  currentBusiness.plan === 'ULTIMATE'
                    ? 'bg-linear-to-r from-amber-500/15 via-orange-500/10 to-amber-500/20 text-amber-900 border-amber-300 hover:border-amber-400 shadow-xs'
                    : currentBusiness.plan === 'PRO'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300 hover:border-indigo-400'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                }`}
                title="לחץ להחלפת / שדרוג חבילה"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>חבילת {currentPlanFeatures.nameHe}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-900 underline mr-1">
                  (שנה חבילה)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop Role & Entity Switcher */}
        <div className="hidden md:flex items-center gap-2">
          {/* If user is Master Admin, show full simulation switchers */}
          {isMasterUser ? (
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-medium">
              {/* Master Admin Tab */}
              <button
                id="role-btn-master"
                onClick={() => setRole('master')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  role === 'master'
                    ? 'bg-white text-indigo-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>מנהל מאסטר</span>
              </button>

              {/* Business Owner Tab */}
              <button
                id="role-btn-business"
                onClick={() => setRole('business_owner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  role === 'business_owner'
                    ? 'bg-white text-indigo-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>בעל עסק</span>
              </button>

              {/* End Client Tab */}
              <button
                id="role-btn-client"
                onClick={() => setRole('client')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  role === 'client'
                    ? 'bg-white text-emerald-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>פורטל לקוח</span>
              </button>
            </div>
          ) : (
            /* Discreet badge for logged in business owner, employee or client */
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              {role === 'business_owner' && activeEmployeeId === 'owner' && (
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>בעל עסק • {currentBusiness?.name}</span>
                </div>
              )}
              {role === 'business_owner' && activeEmployeeId !== 'owner' && (
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>צוות: {currentEmployee?.name} ({currentEmployee?.roleName})</span>
                </div>
              )}
              {role === 'client' && (
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>פורטל לקוח אישי מאובטח</span>
                </div>
              )}
            </div>
          )}

          {/* Business Switcher Dropdown (when in business mode) */}
          {role === 'business_owner' && (
            <div className="relative">
              <select
                id="select-active-business"
                value={activeBusinessId}
                onChange={(e) => setActiveBusinessId(e.target.value)}
                className="text-xs bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer shadow-xs max-w-[170px] truncate"
              >
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.name} ({biz.plan})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Client Selector (when in client mode) */}
          {role === 'client' && (
            <div className="relative">
              <select
                id="select-active-client-portal"
                value={activeClientId}
                onChange={(e) => {
                  setActiveClientId(e.target.value);
                  const selectedClient = clients.find((c) => c.id === e.target.value);
                  if (selectedClient) {
                    setActiveBusinessId(selectedClient.businessId);
                  }
                }}
                className="text-xs bg-white border border-emerald-300 text-emerald-900 rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer shadow-xs max-w-[170px] truncate"
              >
                {clients.map((c) => {
                  const biz = businesses.find((b) => b.id === c.businessId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({biz?.name || 'עסק'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Mobile Header Controls */}
        <div className="flex items-center gap-1.5 md:hidden">
          {/* Compact Role Buttons for Mobile - shown to master admin */}
          {isMasterUser ? (
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200 text-[11px] font-bold">
              <button
                onClick={() => setRole('master')}
                className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                  role === 'master' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600'
                }`}
                title="מנהל מאסטר"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>מאסטר</span>
              </button>

              <button
                onClick={() => setRole('business_owner')}
                className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                  role === 'business_owner' ? 'bg-white text-indigo-950 shadow-xs' : 'text-slate-600'
                }`}
                title="בעל עסק"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>עסק</span>
              </button>

              <button
                onClick={() => setRole('client')}
                className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                  role === 'client' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
                }`}
                title="פורטל לקוח"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>לקוח</span>
              </button>
            </div>
          ) : (
            <div className="text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200 truncate max-w-[130px]">
              {role === 'business_owner'
                ? activeEmployeeId === 'owner'
                  ? currentBusiness?.name || 'בעל עסק'
                  : currentEmployee?.name || 'צוות'
                : 'פורטל לקוח'}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            aria-label="תפריט נייד"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Expanded Options */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 shadow-lg">
          {/* Current Workspace Description */}
          <div className="text-xs text-slate-600 font-medium pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>תצוגה נוכחית:</span>
            <span className="font-bold text-slate-900">
              {role === 'master'
                ? 'לוח בקרה ראשי (טל אליהו)'
                : role === 'client'
                ? `פורטל לקוח: ${currentBusiness?.name || ''}`
                : currentBusiness?.name || ''}
            </span>
          </div>

          {/* Business Switcher on Mobile */}
          {role === 'business_owner' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">החלף עסק:</label>
              <select
                value={activeBusinessId}
                onChange={(e) => setActiveBusinessId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                {businesses.map((biz) => (
                  <option key={biz.id} value={biz.id}>
                    {biz.name} ({biz.plan})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Client Switcher on Mobile */}
          {role === 'client' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">בחר לקוח פעיל בפורטל:</label>
              <select
                value={activeClientId}
                onChange={(e) => {
                  setActiveClientId(e.target.value);
                  const selectedClient = clients.find((c) => c.id === e.target.value);
                  if (selectedClient) {
                    setActiveBusinessId(selectedClient.businessId);
                  }
                }}
                className="w-full text-xs bg-slate-50 border border-emerald-300 text-emerald-900 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {clients.map((c) => {
                  const biz = businesses.find((b) => b.id === c.businessId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({biz?.name || 'עסק'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Plan upgrade button for business */}
          {role === 'business_owner' && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenUpgradeModal();
              }}
              className="w-full text-xs bg-indigo-50 text-indigo-800 font-bold border border-indigo-200 py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>שדרג / החלף חבילת שירות</span>
            </button>
          )}

          {/* Quick links to login screen & disconnect */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLoginScreenOpen(true);
              }}
              className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>מסך התחברות מלא</span>
            </button>

            {authUser && (
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await signOutUser();
                }}
                className="font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>התנתק מהחשבון</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
