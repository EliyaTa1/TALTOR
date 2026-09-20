import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MASTER_ADMIN_EMAIL, PLAN_CONFIGS, PlanTier } from '../../types';
import {
  Crown,
  Briefcase,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Building2,
  Lock,
  ExternalLink,
  ChevronRight,
  Zap,
  Globe,
  Loader2,
  AlertCircle,
  HelpCircle,
  Mail,
  KeyRound,
  Phone,
} from 'lucide-react';

interface LoginScreenProps {
  onDismiss?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onDismiss }) => {
  const {
    authUser,
    authenticateUserByCredentials,
    registerNewBusiness,
    signOutUser,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form state
  const [regBizName, setRegBizName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCategory, setRegCategory] = useState('');
  const [regPlan, setRegPlan] = useState<PlanTier>('PRO');
  const [regPass, setRegPass] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    const res = await authenticateUserByCredentials(loginId, loginPass);
    setIsLoading(false);
    
    if (!res.success) {
      setErrorMessage(res.error || 'שגיאה בפרטי ההתחברות.');
    } else {
      if (onDismiss) onDismiss();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await registerNewBusiness({
      businessName: regBizName,
      ownerName: regOwnerName,
      ownerEmail: regEmail,
      phone: regPhone,
      category: regCategory,
      plan: regPlan,
      passcode: regPass,
    });

    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'אירעה שגיאה בהרשמה.');
    } else {
      setMode('login');
      setLoginId(regEmail);
      setLoginPass(regPass);
      // Auto login after registration
      const loginRes = await authenticateUserByCredentials(regEmail, regPass);
      if (loginRes.success && onDismiss) {
        onDismiss();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans" dir="rtl">
      {/* Background Ambience / Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 via-indigo-600 to-slate-900 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-500/25">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">TALTOR</span>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                  CRM Cloud
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">מערכת ניהול מולטי-טננט מקצועית</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Branding & Features Pitch (Desktop & Tablet) */}
          <div className="lg:col-span-6 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unified Zero-Leak Login</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              פורטל כניסה מרכזי <br />
              <span className="bg-linear-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                חכם ודיסקרטי
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              ברוכים הבאים למערכת TALTOR. הכניסה מתבצעת דרך דלת אחת לכולם — המערכת מזהה באופן אוטומטי ומאובטח האם אתה מנהל מאסטר, בעל עסק, איש צוות או לקוח, ומנתבת אותך ישירות לסביבת העבודה הייעודית שלך (Tenant ID).
            </p>

            {/* 3 Tier Summary Badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {(['BASIC', 'PRO', 'ULTIMATE'] as PlanTier[]).map((tier) => {
                const conf = PLAN_CONFIGS[tier];
                return (
                  <div
                    key={tier}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      tier === 'ULTIMATE'
                        ? 'bg-amber-950/40 border-amber-500/40'
                        : tier === 'PRO'
                        ? 'bg-indigo-950/40 border-indigo-500/40'
                        : 'bg-slate-800/40 border-slate-700/60'
                    }`}
                  >
                    <span className="block text-[11px] font-bold text-slate-300">{conf.nameHe}</span>
                    <span className="text-base font-black text-white">₪{conf.pricePerMonth}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {tier === 'BASIC' ? 'עד 50 לקוחות' : tier === 'PRO' ? 'משפך + שיווק' : 'AI פנימי וסטטיסטיקה'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Trust highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ניתוב שקט מאחורי הקלעים</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>מנוע סטטיסטי ואנליטיקה חכמה מקומית</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>הפרדת נתונים מוחלטת לעסקים</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Box */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 space-y-6">
              {/* Header inside card */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setMode('login')}
                    className={`text-base font-bold pb-1 border-b-2 transition-colors ${
                      mode === 'login' ? 'text-white border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    התחברות למערכת
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className={`text-base font-bold pb-1 border-b-2 transition-colors ${
                      mode === 'register' ? 'text-white border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    פתיחת חשבון עסקי
                  </button>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              {/* Status if already authenticated */}
              {authUser ? (
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                      {authUser.displayName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{authUser.displayName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{authUser.email}</span>
                    </div>
                  </div>

                  <button
                    onClick={async () => await signOutUser()}
                    className="text-xs text-red-400 hover:text-red-300 font-bold px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-colors"
                  >
                    התנתק
                  </button>
                </div>
              ) : mode === 'login' ? (
                // LOGIN FORM
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <p className="text-xs text-slate-300 mb-2">
                    הזן אימייל (או נייד) וסיסמה. המערכת תזהה את תפקידך אוטומטית.
                  </p>
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="אימייל, טלפון, או master"
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <input
                        type="password"
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="סיסמה (אופציונלי להדגמה)"
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 disabled:opacity-50 min-h-[44px] mt-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>כניסה למערכת</span>}
                  </button>
                </form>
              ) : (
                // REGISTER FORM
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">שם העסק</label>
                      <input
                        type="text"
                        required
                        value={regBizName}
                        onChange={(e) => setRegBizName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="לדוגמה: אולפני רון"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">שם בעל העסק</label>
                      <input
                        type="text"
                        required
                        value={regOwnerName}
                        onChange={(e) => setRegOwnerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="רון אהרון"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">אימייל התחברות</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="owner@business.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">נייד</label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="050-0000000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">תחום העסק</label>
                      <input
                        type="text"
                        value={regCategory}
                        onChange={(e) => setRegCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="ייעוץ, יופי, עו״ד..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">בחר מסלול</label>
                      <select
                        value={regPlan}
                        onChange={(e) => setRegPlan(e.target.value as PlanTier)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="BASIC">BASIC (₪199)</option>
                        <option value="PRO">PRO (₪399)</option>
                        <option value="ULTIMATE">ULTIMATE (₪799)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">סיסמה (לכניסה למערכת)</label>
                    <input
                      type="password"
                      required
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="הזן סיסמה מאובטחת"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 disabled:opacity-50 min-h-[44px] mt-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>הקם סביבת עסק (Multi-Tenant)</span>}
                  </button>
                </form>
              )}

              {/* Error Message Display */}
              {errorMessage && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">הודעת מערכת:</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">TALTOR CRM CLOUD</span>
            <span>•</span>
            <span>Zero-Leak Unified Login Architecture</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>טל אליהו — מנהל מאסטר</span>
            <span>•</span>
            <span>מוגן ע״י הצפנה מקומית</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
