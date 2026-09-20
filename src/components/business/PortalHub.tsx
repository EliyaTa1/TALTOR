import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem, ClientMessage } from '../../types';
import {
  Globe,
  Lock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  FileText,
  Upload,
  Send,
  CheckCircle,
  Eye,
  Copy,
  Check,
  User,
  Shield,
} from 'lucide-react';

export const PortalHub: React.FC<{
  onOpenUpgrade: () => void;
  onOpenPortal: (clientId: string) => void;
}> = ({ onOpenUpgrade, onOpenPortal }) => {
  const {
    currentPlanFeatures,
    currentBusiness,
    businessClients,
    businessDocuments,
    businessMessages,
    addDocument,
    sendMessage,
    activeBusinessId,
    updateBusinessSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'chats' | 'docs' | 'settings'>('chats');
  const [selectedClientId, setSelectedClientId] = useState<string>(
    businessClients[0]?.id || ''
  );
  const [replyText, setReplyText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // New doc form
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('contract');
  const [docClientId, setDocClientId] = useState(businessClients[0]?.id || '');

  // Portal branding text
  const [portalWelcome, setPortalWelcome] = useState(
    currentBusiness?.customPortalMessage || 'ברוכים הבאים לפורטל הלקוחות האישי שלנו.'
  );
  const [isSavedBranding, setIsSavedBranding] = useState(false);

  const isLocked = !currentPlanFeatures.hasClientPortal;

  if (isLocked) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Globe className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
          זמין בלעדית בחבילת ULTIMATE
        </span>
        <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">
          פורטל לקוחות אישי וממותג ("צד הלקוח")
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          הענק ללקוחות הקצה שלך אזור אישי מאובטח ב-PIN: צפייה בפגישות ויומן, תשלום חשבוניות ישיר,
          הורדת חוזים ומסמכים חתומים, וערוץ צ׳אט ישיר בינך לבין הלקוח.
        </p>
        <button
          onClick={onOpenUpgrade}
          className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
        >
          <Sparkles className="w-4 h-4 text-amber-100" />
          <span>שדרג עכשיו לחבילת ULTIMATE (הכל כלול)</span>
        </button>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedClientId) return;

    await sendMessage({
      businessId: activeBusinessId,
      clientId: selectedClientId,
      sender: 'business',
      senderName: currentBusiness?.ownerName || 'בעל עסק',
      message: replyText.trim(),
    });

    setReplyText('');
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docClientId) return;

    const targetClient = businessClients.find((c) => c.id === docClientId);

    await addDocument({
      businessId: activeBusinessId,
      clientId: docClientId,
      clientName: targetClient?.name || 'לקוח',
      title: docTitle.trim(),
      category: docCategory,
      fileSize: '2.4 MB',
      sharedWithClient: true,
    });

    setDocTitle('');
  };

  const handleSaveBranding = async () => {
    await updateBusinessSettings(activeBusinessId, {
      customPortalMessage: portalWelcome,
    });
    setIsSavedBranding(true);
    setTimeout(() => setIsSavedBranding(false), 2500);
  };

  const copyPortalUrl = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/portal?biz=${activeBusinessId}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Selected client messages
  const activeClient = businessClients.find((c) => c.id === selectedClientId) || businessClients[0];
  const clientChat = businessMessages.filter((m) => m.clientId === activeClient?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">מרכז פורטל הלקוחות</h2>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              חבילת ULTIMATE פעילה
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ניהול השירותים, המסמכים וערוצי התקשורת מול לקוחות הקצה שלך בפורטל האישי שלהם.
          </p>
        </div>

        {/* Live Portal Launch Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyPortalUrl}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'הקישור הועתק!' : 'העתק לינק לפורטל'}</span>
          </button>

          {activeClient && (
            <button
              onClick={() => onOpenPortal(activeClient.id)}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>פתח פורטל כלקוח ({activeClient.name})</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'chats'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>פניות וצ׳אט לקוחות</span>
          <span className="bg-indigo-500 text-white text-[10px] px-1.5 rounded-full">
            {businessMessages.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'docs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>מסמכים וחוזים משותפים</span>
          <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 rounded-full">
            {businessDocuments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>הגדרות מיתוג הפורטל</span>
        </button>
      </div>

      {/* TAB 1: CHATS / CLIENT MESSAGES */}
      {activeTab === 'chats' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden min-h-[480px]">
          {/* Client selection sidebar */}
          <div className="border-l border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              בחר שיחת לקוח
            </span>
            {businessClients.map((client) => {
              const count = businessMessages.filter((m) => m.clientId === client.id).length;
              const isSelected = client.id === activeClient?.id;

              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full text-right p-3 rounded-xl transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-white border border-indigo-200 shadow-xs text-indigo-950 font-bold'
                      : 'hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px]">
                      {client.name.charAt(0)}
                    </div>
                    <span className="truncate">{client.name}</span>
                  </div>
                  {count > 0 && (
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Chat Conversation View */}
          <div className="md:col-span-2 p-6 flex flex-col justify-between">
            <div>
              {/* Chat Header */}
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    {activeClient?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">
                      התכתבות מול {activeClient?.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      טלפון: {activeClient?.phone} • סנכרון פורטל ישיר
                    </span>
                  </div>
                </div>

                <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  פורטל מחובר
                </span>
              </div>

              {/* Messages Thread */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {clientChat.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    אין עדיין הודעות עם לקוח זה. שלח הודעת פתיחה!
                  </div>
                ) : (
                  clientChat.map((msg) => {
                    const isFromBiz = msg.sender === 'business';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isFromBiz ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl p-3 text-xs leading-relaxed ${
                            isFromBiz
                              ? 'bg-indigo-600 text-white rounded-tr-xs'
                              : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200'
                          }`}
                        >
                          <span className="block text-[10px] opacity-75 font-semibold mb-1">
                            {msg.senderName}
                          </span>
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`כתוב תגובה ל-${activeClient?.name || 'לקוח'} (הודעה זו תופיע בפורטל שלו)...`}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>שלח</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SHARED DOCUMENTS */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          {/* Add Doc Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>העלאה ושיתוף מסמך / חוזה לפורטל לקוח</span>
            </h3>

            <form onSubmit={handleAddDoc} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="שם המסמך (למשל: הסכם עבודה חתום 2026)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <select
                  value={docClientId}
                  onChange={(e) => setDocClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {businessClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-xs"
                >
                  העלה ושתף בפורטל
                </button>
              </div>
            </form>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {businessDocuments.map((docItem) => (
              <div
                key={docItem.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px]">
                      {docItem.category === 'contract'
                        ? 'חוזה חתום'
                        : docItem.category === 'brief'
                        ? 'אפיון ובריף'
                        : 'דו״ח מסירה'}
                    </span>
                    <span className="text-[11px] text-slate-400">{docItem.date}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs mb-1">{docItem.title}</h4>
                  <p className="text-[11px] text-slate-500">משותף עם: {docItem.clientName}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                  <span className="text-slate-400 font-mono text-[11px]">{docItem.fileSize}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    מוצג בפורטל
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BRANDING SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-2xl space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">התאמת שפת הפורטל והנראות</h3>
          <p className="text-slate-500">
            הגדרות אלו יוצגו בדף הפתיחה כאשר לקוחות הקצה שלך נכנסים לאזור האישי שלהם.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              הודעת פתיחה מותאמת אישית ללקוחות
            </label>
            <textarea
              rows={3}
              value={portalWelcome}
              onChange={(e) => setPortalWelcome(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveBranding}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>שמור שינויים</span>
            </button>
            {isSavedBranding && (
              <span className="text-emerald-600 font-bold">ההגדרות נשמרו בהצלחה!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
