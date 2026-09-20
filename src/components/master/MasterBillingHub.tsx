import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MasterPaymentSettings, SubscriptionBillingRecord } from '../../types';
import {
  CreditCard,
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  ShieldCheck,
  Zap,
  Download,
  Info,
  Save,
  Wallet,
  Building,
} from 'lucide-react';

export const MasterBillingHub: React.FC = () => {
  const {
    subscriptionBillings,
    businesses,
    masterPaymentSettings,
    updateMasterPaymentSettings,
    paySubscriptionInvoice,
    processManualSubscriptionCharge,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'payout_guide' | 'settings'>('subscriptions');

  // Master Settings Form
  const [gateway, setGateway] = useState(masterPaymentSettings.gateway);
  const [apiKey, setApiKey] = useState(masterPaymentSettings.apiKey);
  const [terminalId, setTerminalId] = useState(masterPaymentSettings.terminalId);
  const [bankName, setBankName] = useState(masterPaymentSettings.payoutBankName);
  const [bankBranch, setBankBranch] = useState(masterPaymentSettings.payoutBankBranch);
  const [bankAccount, setBankAccount] = useState(masterPaymentSettings.payoutBankAccount);
  const [accountHolder, setAccountHolder] = useState(masterPaymentSettings.accountHolderName);
  const [companyId, setCompanyId] = useState(masterPaymentSettings.businessRegistrationNumber);
  const [autoBilling, setAutoBilling] = useState(masterPaymentSettings.autoChargeEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Billing Metrics
  const metrics = useMemo(() => {
    const totalMRR = businesses
      .filter((b) => b.status === 'active')
      .reduce((sum, b) => sum + b.monthlyFee, 0);

    const paidThisMonth = subscriptionBillings
      .filter((s) => s.status === 'paid')
      .reduce((sum, s) => sum + s.amount, 0);

    const pendingCollection = subscriptionBillings
      .filter((s) => s.status === 'pending' || s.status === 'overdue')
      .reduce((sum, s) => sum + s.amount, 0);

    const overdueCount = subscriptionBillings.filter((s) => s.status === 'overdue').length;

    return { totalMRR, paidThisMonth, pendingCollection, overdueCount };
  }, [businesses, subscriptionBillings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMasterPaymentSettings({
      gateway,
      apiKey,
      terminalId,
      payoutBankName: bankName,
      payoutBankBranch: bankBranch,
      payoutBankAccount: bankAccount,
      accountHolderName: accountHolder,
      businessRegistrationNumber: companyId,
      autoChargeEnabled: autoBilling,
      active: true,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleSendPaymentReminder = (sub: SubscriptionBillingRecord) => {
    const text = encodeURIComponent(
      `שלום ${sub.ownerName}, תזכורת ידידותית ממערכת TALTOR: מנוי ${sub.plan} בסך ₪${sub.amount} ממתין לתשלום. להסדרת התשלום המאובטח בקליק: https://taltor.app/pay/${sub.id}`
    );
    window.open(`https://wa.me/972${sub.ownerPhone.replace(/[^0-9]/g, '').slice(-9)}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900">
              מערך סליקת מנויים ותקבולים (Master Billing)
            </h2>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ניהול כספי מאסטר
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            גביית תשלומים חודשיים שוטפים מכל בעלי העסקים עבור חבילות BASIC, PRO, ו-ULTIMATE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('payout_guide')}
            className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Info className="w-4 h-4" />
            <span>מדריך: מה נדרש ממך לקבלת הכסף</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">הכנסה חודשית קבועה (MRR)</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            ₪{metrics.totalMRR.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
            מ-{businesses.length} עסקים רשומים
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">נגבה החודש בהצלחה</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ₪{metrics.paidThisMonth.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            הועבר ישירות לחשבונך
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">ממתין לגבייה / טיפול</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            ₪{metrics.pendingCollection.toLocaleString()}
          </span>
          <span className="text-[11px] text-amber-800 block mt-0.5">
            {metrics.overdueCount > 0 ? `⚠️ ${metrics.overdueCount} באיחור` : 'בטיפול שוטף'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">חשבון בנק לקבלת זיכויים</span>
          <span className="text-sm font-black text-slate-900 mt-1 block truncate">
            {masterPaymentSettings.payoutBankName} (סניף {masterPaymentSettings.payoutBankBranch})
          </span>
          <span className="text-[11px] text-indigo-700 font-mono block mt-0.5" dir="ltr">
            חשבון: {masterPaymentSettings.payoutBankAccount}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'subscriptions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>חיובים ומנויי בעלי עסקים ({subscriptionBillings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payout_guide')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'payout_guide'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>מה דרוש ממך לקבלת הכסף (מדריך מלא)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>הגדרות שער סליקה וחשבון בנק</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: SUBSCRIPTIONS & CHARGES */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">רשימת מנויים וחיובים שוטפים</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                מעקב שוטף אחרי תשלומי החבילות, אשראי רשום ואפשרות חיוב יזום.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {subscriptionBillings.map((sub) => {
              const isPaid = sub.status === 'paid';
              const isOverdue = sub.status === 'overdue';

              return (
                <div
                  key={sub.id}
                  className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-slate-900 text-base">{sub.businessName}</span>
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                          sub.plan === 'ULTIMATE'
                            ? 'bg-purple-100 text-purple-800'
                            : sub.plan === 'PRO'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        חבילת {sub.plan}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isPaid ? `שולם ב-${sub.paidDate}` : isOverdue ? 'באיחור בתשלום' : 'ממתין לתשלום'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px] pt-0.5">
                      <span>בעל עסק: <strong>{sub.ownerName}</strong></span>
                      <span>•</span>
                      <span dir="ltr">{sub.ownerPhone}</span>
                      <span>•</span>
                      <span className="font-mono">{sub.invoiceNumber}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>אשראי: ****{sub.cardLast4}</span>
                      </span>
                    </div>
                  </div>

                  {/* Financial amount & Action buttons */}
                  <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                    <div className="text-left">
                      <span className="text-slate-400 text-[11px] block">סכום חודשי:</span>
                      <span className="text-lg font-black text-slate-900">₪{sub.amount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPaid ? (
                        <>
                          <button
                            onClick={() => paySubscriptionInvoice(sub.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>חייב אשראי כעת</span>
                          </button>

                          <button
                            onClick={() => handleSendPaymentReminder(sub)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-2 rounded-xl text-xs transition-colors border border-emerald-200 flex items-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>תזכורת WhatsApp</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => processManualSubscriptionCharge(sub.businessId)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
                            title="חיוב יזום לחודש הבא"
                          >
                            חיוב תקופתי נוסף
                          </button>
                          <button
                            onClick={() => alert(`מוריד קבלה ומסמך מס עבור ${sub.invoiceNumber}...`)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-2 rounded-xl border border-slate-200"
                            title="הורד קבלה למאסטר"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: MASTER PAYOUT GUIDE ("מה אתה צריך ממני") */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'payout_guide' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <h3 className="font-black text-slate-900 text-lg">
                מדריך מפורט: מה דרוש ממך כדי לקבל את הכסף מבעלי העסקים ישירות לחשבונך
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              כמנהל המאסטר ונותן השירות של פלטפורמת TALTOR, הנה בדיוק מה שנדרש על מנת שהסליקה תפעל אוטומטית ובאופן חוקי:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-sm">התקשרות עם שער סליקה ישראלי (Gateway)</h4>
              </div>
              <p className="text-slate-600 leading-relaxed">
                יש לפתוח חשבון סולק אצל אחד הספקים המוכרים בישראל שתומכים בחיובים חוזרים (Recurring Payments):
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1 font-medium">
                <li><strong>משולם (Meshulam / Grow)</strong> - קל ביותר להקמה, סליקה באשראי, Bit והוראות קבע.</li>
                <li><strong>טרנזילה (Tranzila)</strong> - תקן PCI-DSS מחמיר, חיוב חוזר אוטומטי (Tokenization).</li>
                <li><strong>חשבונית ירוקה / Morning</strong> - כולל הפקת חשבונית מס קבלה אוטומטית לכל חיוב.</li>
                <li><strong>Stripe</strong> - תומך כרטיסים בינלאומיים וישראליים.</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-sm">קבלת פרטי מסוף ומפתחות API</h4>
              </div>
              <p className="text-slate-600 leading-relaxed">
                לאחר אישור החשבון בספק הסליקה, תקבל מהם:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1 font-medium">
                <li><strong>מספר מסוף (Terminal ID / User ID)</strong> - המזהה שלך במערכת הסליקה.</li>
                <li><strong>מפתח API סודי (API Secret Key)</strong> - להטמעה בלשונית ההגדרות ב-TALTOR.</li>
                <li><strong>כתובת Webhook Callback</strong> - כדי שספק הסליקה יעדכן את TALTOR בזמן אמת על תשלום מוצלח.</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-sm">הגדרת חשבון בנק לקבלת זיכויי הכספים</h4>
              </div>
              <p className="text-slate-600 leading-relaxed">
                ספק הסליקה יפקיד את הכספים שנגבו מבעלי העסקים ישירות לחשבון הבנק העסקי שלך (בד״כ מדי שבוע או פעם בחודש):
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1 font-medium">
                <li>שם הבנק (לדוגמה: בנק לאומי, הפועלים, דיסקונט).</li>
                <li>מספר סניף ומספר חשבון בנק.</li>
                <li>אישור ניהול חשבון בנק / צ'ק מבוטל לצורך אימות מול חברת הסליקה.</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs">
                  4
                </span>
                <h4 className="font-bold text-slate-900 text-sm">היבט מיסויי וחשבוניות מס דיגיטליות</h4>
              </div>
              <p className="text-slate-600 leading-relaxed">
                בכל חיוב מוצלח של בעל עסק (₪199 / ₪499 / ₪999), יש לשלוח לו חשבונית מס/קבלה:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-1 pt-1 font-medium">
                <li>הגדרת מספר ע.מ. / ח.פ. של העסק שלך.</li>
                <li>חיבור API לחשבונית ירוקה / רווחית / iCount לשליחה אוטומטית במייל.</li>
                <li>הסכום כולל מע״מ כחוק.</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-indigo-950">
                כל הנתונים שמוזנים נשמרים ישירות ב-Firestore ומאובטחים לפי תקן המחמיר ביותר.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              עדכן פרטי סליקה ובנק כעת
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: SETTINGS & BANK ACCOUNTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">הגדרות שער סליקה וחשבון בנק לקבלת תקבולים</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              הזן את פרטי הספק והבנק כדי לקבל את דמי המנוי החודשיים מבעלי העסקים.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>הגדרות התשלום והבנק עודכנו בהצלחה!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {/* Gateway Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ספק סליקה מועדף *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'meshulam', label: 'משולם (Grow)', note: 'ישראלי + Bit' },
                  { id: 'tranzila', label: 'טרנזילה', note: 'תקן PCI מלא' },
                  { id: 'green_invoice', label: 'Morning / ירוקה', note: 'כולל חשבוניות' },
                  { id: 'stripe', label: 'Stripe', note: 'בינלאומי' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGateway(g.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      gateway === g.id
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold">{g.label}</span>
                    <span className="text-[10px] text-slate-400">{g.note}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">מספר מסוף (Terminal ID) *</label>
                <input
                  type="text"
                  required
                  value={terminalId}
                  onChange={(e) => setTerminalId(e.target.value)}
                  placeholder="לדוגמה: 0961234"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">מפתח API סודי (API Key) *</label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="key_live_xxxxxxxx"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Bank details */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs">פרטי חשבון בנק לקבלת הכספים מהסולק:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">שם הבנק *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="בנק לאומי / הפועלים..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">מספר סניף *</label>
                  <input
                    type="text"
                    required
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    placeholder="800"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">מספר חשבון *</label>
                  <input
                    type="text"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="12345678"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">שם המוטב בחשבון הבנק *</label>
                  <input
                    type="text"
                    required
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="טל אליהו / טלטור בע״מ"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">מספר ע.מ / ח.פ להוצאת קבלות</label>
                  <input
                    type="text"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    placeholder="516000000"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Auto charge switch */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">חיוב מנוי אוטומטי חודשי</span>
                <span className="text-slate-500 text-[11px]">
                  חיוב אשראי בעל העסק ביום החידוש החודשי ושליחת קבלה במייל
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoBilling}
                onChange={(e) => setAutoBilling(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>שמור פרטי סליקה ובנק</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
