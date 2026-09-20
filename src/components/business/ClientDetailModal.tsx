import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus, ClientNote } from '../../types';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageCircle,
  FileText,
  DollarSign,
  Star,
  Shield,
  Clock,
  ExternalLink,
  Plus,
  Send,
  Trash2,
  Lock,
} from 'lucide-react';

interface ClientDetailModalProps {
  client: Client | null;
  onClose: () => void;
  onOpenPortal: (clientId: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onOpenPortal,
}) => {
  const {
    updateClient,
    deleteClient,
    currentPlanFeatures,
    appointments,
    invoices,
    currentBusiness,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'activity' | 'portal'>('overview');
  const [newNoteText, setNewNoteText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});

  if (!client) return null;

  const clientAppointments = appointments.filter((a) => a.clientId === client.id);
  const clientInvoices = invoices.filter((i) => i.clientId === client.id);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: ClientNote = {
      id: 'note-' + Date.now(),
      text: newNoteText.trim(),
      createdAt: new Date().toISOString().substring(0, 10),
      author: currentBusiness?.ownerName || 'בעל עסק',
    };

    const updatedNotes = [newNote, ...(client.notes || [])];
    await updateClient({ ...client, notes: updatedNotes });
    setNewNoteText('');
  };

  const handleStatusChange = async (newStatus: ClientStatus) => {
    await updateClient({ ...client, status: newStatus });
  };

  const handleDeleteClient = async () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${client.name}"?`)) {
      await deleteClient(client.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
                {client.vipStatus && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                    VIP
                  </span>
                )}
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    client.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : client.status === 'proposal'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {client.status === 'active'
                    ? 'לקוח פעיל'
                    : client.status === 'proposal'
                    ? 'הצעת מחיר'
                    : client.status === 'contacted'
                    ? 'שיחת היכרות'
                    : client.status === 'lead'
                    ? 'ליד חדש'
                    : 'לא פעיל'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                הצטרף בתאריך {client.createdAt} • קשר אחרון: {client.lastContactDate || 'השבוע'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct WhatsApp button */}
            <a
              href={`https://wa.me/972${client.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                `שלום ${client.name}, מדבר ${currentBusiness?.ownerName || 'TALTOR'}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              title="שלח הודעת WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            {/* Call button */}
            <a
              href={`tel:${client.phone}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              title="חייג ללקוח"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-100 flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            סקירה כללית
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>הערות ותיעוד</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
              {client.notes?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>פגישות ותשלומים</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full text-[10px]">
              {clientAppointments.length + clientInvoices.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('portal')}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'portal'
                ? 'border-amber-500 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>פורטל לקוח אישי</span>
            {currentPlanFeatures.hasClientPortal ? (
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                פעיל
              </span>
            ) : (
              <Lock className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Contact & Status Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-slate-900" dir="ltr">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{client.email}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">סטטוס שלב:</span>
                    <select
                      value={client.status}
                      onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
                      className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="lead">ליד חדש</option>
                      <option value="contacted">שיחת היכרות</option>
                      <option value="proposal">הצעת מחיר</option>
                      <option value="active">לקוח פעיל</option>
                      <option value="inactive">לא פעיל</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">שווי פרויקט / עסקה:</span>
                    <span className="font-black text-slate-900 text-sm">
                      ₪{(client.dealValue || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">סיכון נטישה AI:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        client.churnRisk === 'low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : client.churnRisk === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {client.churnRisk === 'low'
                        ? 'נמוך (יציב)'
                        : client.churnRisk === 'medium'
                        ? 'בינוני'
                        : 'גבוה (דרוש יחס)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">תגיות וסיווגים</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {client.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg text-xs font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Danger Zone: Delete */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">מזהה לקוח: {client.id}</span>
                <button
                  onClick={handleDeleteClient}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>מחק לקוח מהמערכת</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">הוסף תיעוד / הערה חדשה</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="כתוב סיכום שיחה, משימה או הערת מעקב..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>שמור</span>
                  </button>
                </div>
              </form>

              {/* Notes Timeline */}
              <div className="space-y-3 pt-2">
                {(!client.notes || client.notes.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-6">עדיין אין הערות מתועדות ללקוח זה.</p>
                ) : (
                  client.notes.map((note) => (
                    <div key={note.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
                        <span className="font-semibold text-slate-600">{note.author}</span>
                        <span>{note.createdAt}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY (APPOINTMENTS & INVOICES) */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Appointments for this client */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>פגישות ומפגשים</span>
                </h4>
                {clientAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">אין פגישות רשומות ללקוח זה.</p>
                ) : (
                  <div className="space-y-2">
                    {clientAppointments.map((apt) => (
                      <div key={apt.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{apt.title}</span>
                          <span className="text-slate-500 text-[11px]">
                            {apt.date} בשעה {apt.time} ({apt.durationMinutes} דק׳) • {apt.location}
                          </span>
                        </div>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                          {apt.status === 'completed' ? 'הושלם' : 'מתוכנן'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invoices for this client */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>חשבוניות וחיובים</span>
                </h4>
                {clientInvoices.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl">אין חיובים או חשבוניות ללקוח זה.</p>
                ) : (
                  <div className="space-y-2">
                    {clientInvoices.map((inv) => (
                      <div key={inv.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{inv.description}</span>
                          <span className="text-slate-500 text-[11px]">
                            מספר: {inv.number} • תאריך: {inv.createdAt}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="font-black text-slate-900 block">₪{inv.amount.toLocaleString()}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status === 'paid' ? 'שולם' : 'ממתין לתשלום'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CLIENT PORTAL */}
          {activeTab === 'portal' && (
            <div className="space-y-5">
              {!currentPlanFeatures.hasClientPortal ? (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 text-center">
                  <Lock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    פורטל לקוחות ייעודי זמין בחבילת ULTIMATE
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
                    בחבילת ULTIMATE כל לקוח מקבל לינק אישי מאובטח עם קוד PIN לצפייה בפגישות, תשלום חשבוניות, והורדת מסמכים.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>פרטי גישה לפורטל הלקוח המאובטח</span>
                      </h4>
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        מאובטח ב-PIN
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                      <div className="bg-white p-3 rounded-lg border border-emerald-200">
                        <span className="text-slate-500 block text-[11px]">קוד PIN כניסה:</span>
                        <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                          {client.portalAccessPin || '1234'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200">
                        <span className="text-slate-500 block text-[11px]">סטטוס קישור:</span>
                        <span className="font-bold text-emerald-700 text-xs">פעיל ומוכן לשיתוף</span>
                      </div>
                    </div>
                  </div>

                  {/* Open / Test Portal Button */}
                  <button
                    onClick={() => {
                      onOpenPortal(client.id);
                      onClose();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>פתח את פורטל הלקוח של {client.name} (תצוגת לקוח)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
