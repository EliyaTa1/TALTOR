import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MASTER_ADMIN_EMAIL } from '../../types';
import {
  ShieldAlert,
  Crown,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  LogOut,
  X,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export const GoogleAuthModal: React.FC = () => {
  const {
    authUser,
    isGoogleAuthModalOpen,
    setIsGoogleAuthModalOpen,
    signInWithGoogle,
    signInAsMasterDemo,
    signInAsBusinessOwnerDemo,
    signOutUser,
    businesses,
    setRole,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDemoBizId, setSelectedDemoBizId] = useState<string>(businesses[0]?.id || '');

  if (!isGoogleAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await signInWithGoogle();
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'ההתחברות לא הושלמה.');
    } else {
      setIsGoogleAuthModalOpen(false);
    }
  };

  const handleMasterDemoLogin = () => {
    signInAsMasterDemo();
    setIsGoogleAuthModalOpen(false);
  };

  const handleBusinessDemoLogin = () => {
    if (selectedDemoBizId) {
      signInAsBusinessOwnerDemo(selectedDemoBizId);
      setIsGoogleAuthModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={() => setIsGoogleAuthModalOpen(false)}
            className="absolute left-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow-md">
              {/* Official Google G Logo SVG */}
              <svg viewBox="0 0 24 24" className="w-full h-full">
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
            </div>
            <div>
              <h2 className="text-lg font-extrabold">התחברות באמצעות Google</h2>
              <p className="text-xs text-indigo-200">פורטל אבטחה וזיהוי משתמשים TALTOR</p>
            </div>
          </div>

          <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-xl p-3 text-xs text-indigo-100 flex items-start gap-2.5 mt-3">
            <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">זיהוי מנהל מאסטר אוטומטי:</span>
              <span>
                חשבון ה-Google של <strong>{MASTER_ADMIN_EMAIL}</strong> מזוהה אוטומטית כמנהל מאסטר עליון עם גישה מלאה לכלל בעלי העסקים.
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Status if Logged In */}
          {authUser ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {authUser.photoURL ? (
                    <img
                      src={authUser.photoURL}
                      alt={authUser.displayName || 'משתמש'}
                      className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      {authUser.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{authUser.displayName}</span>
                      {authUser.isMaster && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>מנהל מאסטר</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{authUser.email}</span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await signOutUser();
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-bold px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>התנתק</span>
                </button>
              </div>

              {authUser.isMaster && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => {
                      setRole('master');
                      setIsGoogleAuthModalOpen(false);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>עבור ללוח ניהול מאסטר</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Primary Google Login Button */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-4 rounded-xl border-2 border-slate-300 hover:border-indigo-500 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
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
                  )}
                  <span className="text-sm">התחבר עם חשבון Google (חלון מאובטח)</span>
                </button>

                {errorMessage && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">הודעת מערכת:</span>
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-4 text-slate-400 text-xs font-semibold">או התחברות מהירה לבדיקה</span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              {/* Fast Direct Master Login (No popup block risk in iframe) */}
              <div className="space-y-3">
                <div className="border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl p-3.5 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Crown className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          התחברות ישירה כמנהל מאסטר
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          טל אליהו ({MASTER_ADMIN_EMAIL})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleMasterDemoLogin}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                    >
                      התחבר כמאסטר
                    </button>
                  </div>
                </div>

                {/* Fast Business Owner Login */}
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>התחברות מהירה כבעל עסק רשום</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDemoBizId}
                      onChange={(e) => setSelectedDemoBizId(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded-lg p-2 flex-1 font-medium text-slate-800"
                    >
                      {businesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} - {b.ownerName} ({b.plan})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleBusinessDemoLogin}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shrink-0"
                    >
                      התחבר כעסק
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Info Footer */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>אבטחת מידע ברמת Enterprise</span>
            </div>
            <p>
              אימות זהות מבוסס פרוטוקול Google OAuth 2.0 ו-Firebase Authentication. נתוני כל עסק מבודדים ומנוהלים בהתאם לחבילת השירות.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
