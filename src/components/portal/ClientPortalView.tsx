import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  CreditCard,
  FileText,
  MessageSquare,
  ShieldCheck,
  Clock,
  MapPin,
  Download,
  CheckCircle2,
  Send,
  User,
  Building,
  Phone,
  ArrowRight,
  ExternalLink,
  Lock,
  Plus,
  AlertCircle,
} from 'lucide-react';

export const ClientPortalView: React.FC = () => {
  const {
    currentClient,
    currentBusiness,
    portalClientAppointments,
    portalClientInvoices,
    portalClientDocuments,
    portalClientMessages,
    addAppointment,
    markInvoicePaid,
    sendMessage,
    setRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appointments' | 'invoices' | 'docs' | 'chat'>('appointments');
  const [newMsgText, setNewMsgText] = useState('');
  const [isRequestAppointmentOpen, setIsRequestAppointmentOpen] = useState(false);
  const [requestedTitle, setRequestedTitle] = useState('פגישת עדכון והתקדמות');
  const [requestedDate, setRequestedDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [requestedTime, setRequestedTime] = useState('11:00');
  const [requestNotes, setRequestNotes] = useState('');
  const [paidSuccessAlert, setPaidSuccessAlert] = useState<string | null>(null);

  if (!currentClient || !currentBusiness) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500 text-xs">לא נבחר לקוח פעיל להצגה בפורטל.</p>
        <button
          onClick={() => setRole('business_owner')}
          className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
        >
          חזור לניהול עסק
        </button>
      </div>
    );
  }

  // Handle Client Requesting Appointment
  const handleClientBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAppointment({
      businessId: currentBusiness.id,
      clientId: currentClient.id,
      clientName: currentClient.name,
      title: requestedTitle.trim(),
      date: requestedDate,
      time: requestedTime,
      durationMinutes: 45,
      price: 0,
      status: 'scheduled',
      location: 'משרדי הסטודיו / שיחת וידאו (בקשת לקוח)',
      notes: requestNotes.trim(),
    });

    setIsRequestAppointmentOpen(false);
    setRequestNotes('');
  };

  // Handle Client Paying Invoice via Portal
  const handlePayInvoice = async (invoiceId: string, invoiceNumber: string) => {
    await markInvoicePaid(invoiceId);
    setPaidSuccessAlert(`החשבונית ${invoiceNumber} שולמה בהצלחה! קבלה נשלחה למייל.`);
    setTimeout(() => setPaidSuccessAlert(null), 4000);
  };

  // Handle Client Sending Message to Business
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    await sendMessage({
      businessId: currentBusiness.id,
      clientId: currentClient.id,
      sender: 'client',
      senderName: currentClient.name,
      message: newMsgText.trim(),
    });

    setNewMsgText('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Return to Business Bar */}
      <div className="bg-emerald-950 text-emerald-100 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">
            הינך צופה כעת בפורטל הלקוח האישי של <strong>{currentClient.name}</strong> מול{' '}
            <strong>{currentBusiness.name}</strong>
          </span>
        </div>

        <button
          onClick={() => setRole('business_owner')}
          className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-[11px]"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>חזור לתצוגת בעל העסק</span>
        </button>
      </div>

      {/* Client Portal Branded Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-500/20">
              {currentBusiness.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{currentBusiness.name}</h1>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                  אזור אישי מאובטח
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                שלום <strong>{currentClient.name}</strong>,{' '}
                {currentBusiness.customPortalMessage ||
                  'ברוכים הבאים לפורטל הלקוחות שלך. כאן תוכל לצפות בפגישות, לשלם חשבוניות ולהוריד מסמכים.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-right">
            <span className="text-slate-400 block text-[11px]">קשר מול העסק:</span>
            <span className="font-bold text-slate-900 block">{currentBusiness.ownerName}</span>
            <span className="text-slate-600 font-mono text-[11px]" dir="ltr">
              {currentBusiness.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {paidSuccessAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{paidSuccessAlert}</span>
        </div>
      )}

      {/* Navigation Tabs for End-Client */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'appointments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>הפגישות שלי ({portalClientAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'invoices'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>חשבוניות ותשלומים ({portalClientInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'docs'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>מסמכים וקבצים ({portalClientDocuments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>פנייה ישירה וצ׳אט ({portalClientMessages.length})</span>
        </button>
      </div>

      {/* TAB 1: CLIENT APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">לוח הפגישות והמפגשים שלך</h3>
            <button
              onClick={() => setIsRequestAppointmentOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>בקש פגישה חדשה</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portalClientAppointments.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
                אין פגישות מתוזמנות כרגע. לחץ על "בקש פגישה חדשה" לתיאום מועד.
              </div>
            ) : (
              portalClientAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{apt.date}</span>
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {apt.status === 'completed' ? 'הושלם' : 'מתוכנן'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-1">{apt.title}</h4>
                    <div className="space-y-1 text-xs text-slate-500 mt-3 bg-slate-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          שעה: {apt.time} ({apt.durationMinutes} דקות)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.location}</span>
                      </div>
                      {apt.notes && (
                        <p className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200">
                          {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">חשבוניות ודרישות תשלום</h3>

          <div className="space-y-3">
            {portalClientInvoices.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
                אין חשבוניות או דרישות תשלום לחשבונך.
              </div>
            ) : (
              portalClientInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-900">{inv.number}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status === 'paid' ? `שולם (${inv.paidDate})` : 'ממתין לתשלום'}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm">{inv.description}</p>
                    <span className="text-slate-400 text-[11px]">מועד פירעון: {inv.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left">
                      <span className="text-slate-400 text-[11px] block">סכום לתשלום:</span>
                      <span className="text-lg font-black text-slate-900">
                        ₪{inv.amount.toLocaleString()}
                      </span>
                    </div>

                    {inv.status !== 'paid' ? (
                      <button
                        onClick={() => handlePayInvoice(inv.id, inv.number)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-xs"
                      >
                        שלם עכשיו בפורטל
                      </button>
                    ) : (
                      <button
                        onClick={() => alert(`מוריד קבלה מקורית עבור חשבונית ${inv.number}...`)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>הורד קבלה</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLIENT SHARED DOCUMENTS */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">קבצים ומסמכים משותפים לפרויקט שלך</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portalClientDocuments.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
                אין מסמכים משותפים להצגה כעת.
              </div>
            ) : (
              portalClientDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {doc.category === 'contract'
                          ? 'הסכם חתום'
                          : doc.category === 'brief'
                          ? 'בריף עבודה'
                          : 'דו״ח תוצרים'}
                      </span>
                      <span className="text-slate-400 text-[11px]">{doc.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs mb-1">{doc.title}</h4>
                    <span className="text-slate-400 text-[11px] font-mono">{doc.fileSize}</span>
                  </div>

                  <button
                    onClick={() => alert(`מוריד את הקובץ: ${doc.title}...`)}
                    className="mt-4 w-full bg-slate-50 hover:bg-slate-100 text-indigo-900 font-bold py-2 rounded-xl text-xs transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>צפה והורד קובץ מאובטח</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DIRECT CLIENT CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              ערוץ תקשורת ישיר מול {currentBusiness.name}
            </h3>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              מוצפן ומאובטח
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {portalClientMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                שלח את ההודעה הראשונה שלך ישירות אל {currentBusiness.ownerName}!
              </div>
            ) : (
              portalClientMessages.map((msg) => {
                const isFromMe = msg.sender === 'client';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isFromMe ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl p-3 text-xs leading-relaxed ${
                        isFromMe
                          ? 'bg-emerald-600 text-white rounded-tr-xs'
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

          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={newMsgText}
              onChange={(e) => setNewMsgText(e.target.value)}
              placeholder="כתוב הודעה, שאלה או בקשה..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newMsgText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>שלח פנייה</span>
            </button>
          </form>
        </div>
      )}

      {/* Request Appointment Modal */}
      {isRequestAppointmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-slate-900 text-sm">בקשת מועד לפגישה</h3>
              <button
                onClick={() => setIsRequestAppointmentOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClientBookAppointment} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">נושא הפגישה</label>
                <input
                  type="text"
                  required
                  value={requestedTitle}
                  onChange={(e) => setRequestedTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">תאריך מבוקש</label>
                  <input
                    type="date"
                    required
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">שעה מועדפת</label>
                  <input
                    type="time"
                    required
                    value={requestedTime}
                    onChange={(e) => setRequestedTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">הערות נוספות</label>
                <textarea
                  rows={2}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="נושאים שתרצה שנתמקד בהם..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRequestAppointmentOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  שלח בקשת פגישה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
