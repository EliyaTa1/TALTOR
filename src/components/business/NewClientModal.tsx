import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus } from '../../types';
import { X, User, Phone, Mail, MapPin, DollarSign, Tag, FileText, Check } from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient, activeBusinessId, currentPlanFeatures, businessClients } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dealValue, setDealValue] = useState<number>(0);
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [tagsStr, setTagsStr] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [vipStatus, setVipStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Plan capacity check
  const isCapped =
    currentPlanFeatures.maxClients !== 'unlimited' &&
    businessClients.length >= currentPlanFeatures.maxClients;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const pin = Math.floor(1000 + Math.random() * 9000).toString();

      await addClient({
        businessId: activeBusinessId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || `${phone.replace(/[^0-9]/g, '')}@client.co.il`,
        address: address.trim(),
        status,
        dealValue: Number(dealValue) || 0,
        tags,
        notes: initialNote.trim()
          ? [
              {
                id: 'n-' + Date.now(),
                text: initialNote.trim(),
                createdAt: new Date().toISOString().substring(0, 10),
                author: 'מנהל עסק',
              },
            ]
          : [],
        portalAccessPin: pin,
        vipStatus,
        churnRisk: 'low',
        satisfactionScore: 9,
        lastContactDate: new Date().toISOString().substring(0, 10),
      });

      onClose();
      // Reset fields
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setDealValue(0);
      setTagsStr('');
      setInitialNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">הוספת לקוח חדש למערכת</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCapped ? (
          <div className="p-6 text-center">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs mb-4">
              הגעת למגבלת הלקוחות בחבילת {currentPlanFeatures.nameHe} ({currentPlanFeatures.maxClients} לקוחות).
              כדי להוסיף לקוחות נוספים ללא הגבלה, שדרג לחבילת ULTIMATE.
            </div>
            <button
              onClick={onClose}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold"
            >
              סגור
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  שם מלא / שם העסק של הלקוח *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="לדוגמה: רונית כהן"
                    className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">טלפון נייד *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-1234567"
                    className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Email & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">כתובת אימייל</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">עיר / כתובת</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="לדוגמה: תל אביב"
                    className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Status & Deal Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">שלב ראשוני ב-CRM</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                >
                  <option value="lead">ליד חדש</option>
                  <option value="contacted">שיחת היכרות</option>
                  <option value="proposal">הצעת מחיר</option>
                  <option value="active">לקוח פעיל (התקשרות קיימת)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  שווי עסקה / תקציב משוער (₪)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    value={dealValue}
                    onChange={(e) => setDealValue(Number(e.target.value))}
                    placeholder="5000"
                    className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                תגיות (הפרד בפסיקים)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="VIP, ריטיינר, קמפיין, עיצוב"
                  className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Initial Note */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                הערת פתיחה / פרטים ראשוניים
              </label>
              <textarea
                rows={2}
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                placeholder="איך הגיע הלקוח, מה הדרישות, לוחות זמנים..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* VIP Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={vipStatus}
                onChange={(e) => setVipStatus(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-800">סמן כלקוח מועדף (VIP)</span>
            </label>

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
              >
                ביטול
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'שומר ב-Firebase...' : 'צור לקוח חדש'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
