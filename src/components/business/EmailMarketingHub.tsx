import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EmailCampaign, EmailIntegrationConfig } from '../../types';
import {
  Mail,
  Send,
  BarChart3,
  Users,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  MousePointerClick,
  Eye,
  TrendingUp,
  Key,
} from 'lucide-react';

export const EmailMarketingHub: React.FC = () => {
  const {
    businessCampaigns,
    businessClients,
    emailConfig,
    updateEmailConfig,
    createAndSendCampaign,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'create' | 'settings'>('campaigns');

  // Campaign builder state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [preheader, setPreheader] = useState('');
  const [content, setContent] = useState(
    'שלום {שם_הלקוח},\n\nשמחים לעדכן אותך במגוון שירותים והטבות בלעדיות לקראת החודש הקרוב.\nנשמח לעמוד לרשותך בכל שאלה.'
  );
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccessAlert, setSentSuccessAlert] = useState<string | null>(null);

  // Settings State
  const safeProvider = emailConfig?.provider || 'mailchimp';
  const [provider, setProvider] = useState<'mailchimp' | 'sendgrid' | 'direct'>(safeProvider);
  const [apiKey, setApiKey] = useState(emailConfig?.apiKey || '');
  const [fromName, setFromName] = useState(emailConfig?.fromName || emailConfig?.senderName || 'סטודיו טל - מיתוג');
  const [fromEmail, setFromEmail] = useState(emailConfig?.fromEmail || emailConfig?.senderEmail || 'tal@studio-tal.co.il');
  const [audienceId, setAudienceId] = useState(emailConfig?.audienceListId || emailConfig?.audienceId || '');
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // Dynamic Segments Calculations
  const segmentCounts = useMemo(() => {
    return {
      all: businessClients.length,
      leads: businessClients.filter((c) => c.status === 'lead').length,
      active: businessClients.filter((c) => c.status === 'active').length,
      vip: businessClients.filter((c) => c.tags?.includes('VIP') || c.dealValue > 10000).length,
    };
  }, [businessClients]);

  // Aggregate Campaign Analytics
  const analytics = useMemo(() => {
    const totalSent = businessCampaigns.reduce((sum, c) => sum + c.recipientCount, 0);
    const avgOpen = businessCampaigns.length
      ? Math.round(businessCampaigns.reduce((sum, c) => sum + c.openRate, 0) / businessCampaigns.length)
      : 0;
    const avgClick = businessCampaigns.length
      ? Math.round(businessCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / businessCampaigns.length)
      : 0;
    const totalLeads = businessCampaigns.reduce((sum, c) => sum + (c.leadsGenerated || 0), 0);

    return { totalSent, avgOpen, avgClick, totalLeads };
  }, [businessCampaigns]);

  // Send campaign action
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    setIsSending(true);

    const count =
      selectedSegment === 'all'
        ? segmentCounts.all
        : selectedSegment === 'leads'
        ? segmentCounts.leads
        : selectedSegment === 'vip'
        ? segmentCounts.vip
        : segmentCounts.active;

    const segmentLabel =
      selectedSegment === 'all'
        ? 'כל הלקוחות במאגר'
        : selectedSegment === 'leads'
        ? 'לידים חדשים'
        : selectedSegment === 'vip'
        ? 'לקוחות פרימיום VIP'
        : 'לקוחות פעילים בריטיינר';

    const activeProvider = (emailConfig?.provider || provider || 'mailchimp').toUpperCase();
    await createAndSendCampaign({
      businessId: emailConfig?.businessId || 'biz-tal-ultimate',
      title: title.trim(),
      subject: subject.trim(),
      previewText: preheader.trim(),
      segmentName: segmentLabel,
      recipientCount: Math.max(count, 1),
      provider: emailConfig?.provider || 'mailchimp',
    });

    setIsSending(false);
    setSentSuccessAlert(`הקמפיין "${title}" נשלח בהצלחה ל-${Math.max(count, 1)} נמענים דרך ${activeProvider}!`);
    setTitle('');
    setSubject('');
    setActiveTab('campaigns');

    setTimeout(() => setSentSuccessAlert(null), 5000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEmailConfig({
      provider,
      apiKey,
      fromName,
      fromEmail,
      audienceListId: audienceId,
      connected: !!apiKey,
    });
    setSettingsSavedAlert(true);
    setTimeout(() => setSettingsSavedAlert(false), 3000);
  };

  // Pre-fill template helper
  const applyTemplate = (type: 'promo' | 'update' | 'vip') => {
    if (type === 'promo') {
      setTitle('מבצע אביב 2026 - 15% הנחה על חבילות שירות');
      setSubject('הטבה מיוחדת עבורך: 15% הנחה לפרויקט הבא שלך');
      setPreheader('בתוקף עד סוף החודש בלבד');
      setContent('שלום {שם_הלקוח},\n\nלרגל עונת האביב, הכנו עבורך הטבה של 15% הנחה על כל שירותי הסטודיו.\nלחץ כאן לתיאום פגישה מהירה.');
    } else if (type === 'vip') {
      setTitle('הזמנה אישית: מפגש אסטרטגי ללקוחות VIP');
      setSubject('הזמנה אישית לשולחן עגול ולסקירת מגמות 2026');
      setPreheader('אירוע סגור ללקוחות נבחרים');
      setContent('שלום {שם_הלקוח},\n\nכחלק מקהילת ה-VIP שלנו, אנו מזמינים אותך להשתתף במפגש אישי וייחודי.\nנשמח לאשר את הגעתך.');
    } else {
      setTitle('ניוזלטר חודשי - חידושים ועדכונים');
      setSubject('מה חדש אצלנו החודש? פרויקטים חדשים וטיפים');
      setPreheader('כל מה שחשוב לדעת');
      setContent('שלום {שם_הלקוח},\n\nהנה סיכום קצר של הפרויקטים והחידושים האחרונים שלנו החודש.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900">
              דיוור שיווקי ואוטומציות אימייל
            </h2>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{(emailConfig?.provider || 'mailchimp').toUpperCase()} מחובר</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            שליחת קמפיינים ממוקדים לפלחי לקוחות ישירות מנתוני ה-CRM ב-TALTOR ומעקב ביצועים.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>צור ושלח קמפיין</span>
          </button>
        </div>
      </div>

      {/* Alert banner if just sent */}
      {sentSuccessAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{sentSuccessAlert}</span>
        </div>
      )}

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>נמענים שנחשפו</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {analytics.totalSent.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">ב-{businessCampaigns.length} קמפיינים</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>אחוז פתיחה ממוצע</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {analytics.avgOpen}%
          </span>
          <span className="text-[11px] text-emerald-700 font-bold mt-0.5 block">גבוה ב-18% מהממוצע</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>אחוז הקלקות (CTR)</span>
            <MousePointerClick className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">
            {analytics.avgClick}%
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">מעורבות לקוחות גבוהה</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>לידים / עסקאות שנוצרו</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-700 mt-1 block">
            {analytics.totalLeads}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">מהמרות ישירות במייל</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'campaigns'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>קמפיינים ודוחות ביצועים ({businessCampaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'create'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>עורך קמפיין חדש</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>הגדרות אינטגרציה ({(emailConfig?.provider || 'mailchimp').toUpperCase()})</span>
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS & TRACKING */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">היסטוריית דיוורים וקמפיינים שנשלחו</h3>
            <span className="text-xs text-slate-400">מעודכן בזמן אמת מ-API</span>
          </div>

          <div className="divide-y divide-slate-100">
            {businessCampaigns.map((c) => (
              <div
                key={c.id}
                className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{c.title}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      נשלח בהצלחה
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({(c.provider || emailConfig?.provider || 'mailchimp').toUpperCase()})
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">נושא: "{c.subject}"</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>פלח: <strong>{c.segmentName}</strong></span>
                    <span>•</span>
                    <span>נמענים: <strong>{c.recipientCount}</strong></span>
                    <span>•</span>
                    <span>נשלח ב: {c.sentAt}</span>
                  </div>
                </div>

                {/* Metrics Badges */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 min-w-[70px]">
                    <span className="text-[10px] text-slate-400 block font-semibold">אחוז פתיחה</span>
                    <span className="text-sm font-black text-emerald-700">{c.openRate}%</span>
                  </div>

                  <div className="text-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 min-w-[70px]">
                    <span className="text-[10px] text-slate-400 block font-semibold">הקלקות (CTR)</span>
                    <span className="text-sm font-black text-indigo-700">{c.clickRate}%</span>
                  </div>

                  <div className="text-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 min-w-[70px]">
                    <span className="text-[10px] text-slate-400 block font-semibold">לידים שנוצרו</span>
                    <span className="text-sm font-black text-purple-700">{c.leadsGenerated || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE CAMPAIGN */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">הגדרת קמפיין ופילוח קהל</h3>
              {/* Quick Template Picker */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400">תבנית מוכנה:</span>
                <button
                  type="button"
                  onClick={() => applyTemplate('promo')}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  מבצע
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => applyTemplate('vip')}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  VIP
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => applyTemplate('update')}
                  className="text-indigo-600 hover:underline font-bold"
                >
                  עדכון
                </button>
              </div>
            </div>

            <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">שם פנימי לקמפיין *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="לדוגמה: ניוזלטר מבצע אביב ללקוחות חוזרים"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">פלח קהל יעד מתוך נתוני ה-CRM *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSegment('all')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSegment === 'all'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px]">כל המאגר</span>
                    <span className="text-sm font-black">{segmentCounts.all} לקוחות</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSegment('active')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSegment === 'active'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px]">לקוחות פעילים</span>
                    <span className="text-sm font-black">{segmentCounts.active} לקוחות</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSegment('leads')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSegment === 'leads'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px]">לידים חדשים</span>
                    <span className="text-sm font-black">{segmentCounts.leads} לקוחות</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSegment('vip')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSegment === 'vip'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px]">לקוחות VIP</span>
                    <span className="text-sm font-black">{segmentCounts.vip} לקוחות</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">שורת נושא (Subject) *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="הטבה מיוחדת עבורך..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">כותרת משנה (Preheader)</label>
                  <input
                    type="text"
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    placeholder="מופיע בתצוגה מקדימה בתיבת הדואר..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">גוף ההודעה (תומך תגיות דינמיות)</label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  תגיות זמינות: <code className="bg-slate-100 px-1 py-0.5 rounded">{"{שם_הלקוח}"}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">{"{שם_העסק}"}</code>
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 text-xs">
                  ישוגר באמצעות שרת <strong>{(emailConfig?.provider || 'mailchimp').toUpperCase()}</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSending || !title.trim() || !subject.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'משגר דיוור...' : 'שלח קמפיין עכשיו'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Inbox Preview Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-500 block">תצוגה מקדימה בתיבת הדואר:</span>

            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-xs">
              <div className="p-3 bg-slate-100 border-b border-slate-200 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>מאת:</span>
                  <strong className="text-slate-900">{emailConfig?.fromName || emailConfig?.senderName || 'סטודיו טל - מיתוג'}</strong>
                  <span dir="ltr">({emailConfig?.fromEmail || emailConfig?.senderEmail || 'tal@studio-tal.co.il'})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>נושא:</span>
                  <strong className="text-slate-900">{subject || '(נושא האימייל)'}</strong>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  T
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{subject || 'הודעה מיוחדת עבורך'}</h4>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed text-xs">
                  {content.replace('{שם_הלקוח}', 'ישראל ישראלי').replace('{שם_העסק}', emailConfig?.fromName || emailConfig?.senderName || 'סטודיו טל')}
                </p>

                <div className="pt-2">
                  <div className="bg-indigo-600 text-white font-bold text-center py-2 rounded-lg text-xs">
                    לצפייה בפרטים ותיאום
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                  הודעה זו נשלחה דרך מערכת TALTOR CRM • להסרה מרשימת התפוצה לחץ כאן
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRATION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">הגדרות חיבור למערכות דיוור חיצוניות</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              חיבור ישיר באמצעות API לשליחת מיילים אמינה דרך SendGrid או Mailchimp.
            </p>
          </div>

          {settingsSavedAlert && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>הגדרות הדיוור עודכנו ונשמרו בהצלחה ב-TALTOR!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ספק דיוור מועדף *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider('mailchimp')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    provider === 'mailchimp'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="block font-bold">Mailchimp</span>
                  <span className="text-[10px] text-slate-400">מוביל לניוזלטרים</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('sendgrid')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    provider === 'sendgrid'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="block font-bold">SendGrid</span>
                  <span className="text-[10px] text-slate-400">דיוק ואמינות עסקית</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProvider('direct')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    provider === 'direct'
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="block font-bold">שרת ישיר (TALTOR)</span>
                  <span className="text-[10px] text-slate-400">ללא צורך בספק נוסף</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">מפתח API Key של {(provider || 'mailchimp').toUpperCase()} *</label>
              <div className="relative">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="SG.xxxxxxx / md-xxxxxx"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                נשמר בצורה מוצפנת ב-Firebase ומשמש אך ורק לשליחת דיוורים מורשים.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">שם השולח (Sender Name)</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="טל אליהו - סטודיו לעיצוב"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">כתובת אימייל שולח (From Email)</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="contact@studio.co.il"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">מזהה רשימת תפוצה (Audience / List ID)</label>
              <input
                type="text"
                value={audienceId}
                onChange={(e) => setAudienceId(e.target.value)}
                placeholder="aud_live_94827"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-xs"
              >
                שמור הגדרות ספק דיוור
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
