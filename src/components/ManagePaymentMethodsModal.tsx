import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Edit3, Check, CreditCard, Banknote, Smartphone, Landmark, Wallet, AlertCircle } from 'lucide-react';
import { PaymentMethod, PaymentMethodType } from '../types';
import { PaymentMethodIcon, PAYMENT_METHOD_ICONS } from './PaymentMethodIcon';

interface ManagePaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  methods: PaymentMethod[];
  defaultMethodId: string;
  onSaveMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteMethod: (id: string) => void;
  onSetDefaultMethod: (id: string) => void;
  isDark?: boolean;
}

const PRESET_COLORS = [
  '#10B981', // emerald
  '#6366F1', // indigo
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#14B8A6', // teal
  '#0EA5E9', // sky
  '#64748B', // slate
];

const PRESET_TYPES: { type: PaymentMethodType; label: string; defaultIcon: string }[] = [
  { type: 'cash', label: 'Cash (Physical)', defaultIcon: 'Banknote' },
  { type: 'credit_card', label: 'Credit Card', defaultIcon: 'CreditCard' },
  { type: 'savings_card', label: 'Savings Card / Debit', defaultIcon: 'CreditCard' },
  { type: 'wallet', label: 'Payment Wallet / Digital', defaultIcon: 'Smartphone' },
  { type: 'bank_transfer', label: 'Bank Account / Wire', defaultIcon: 'Landmark' },
  { type: 'other', label: 'Other Method', defaultIcon: 'Wallet' },
];

export const ManagePaymentMethodsModal: React.FC<ManagePaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  methods,
  defaultMethodId,
  onSaveMethod,
  onDeleteMethod,
  onSetDefaultMethod,
  isDark = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentMethodType>('credit_card');
  const [color, setColor] = useState('#6366F1');
  const [iconName, setIconName] = useState('CreditCard');
  const [isDefault, setIsDefault] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsAdding(false);
      setEditingId(null);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingId(null);
    setName('');
    setType('credit_card');
    setColor('#6366F1');
    setIconName('CreditCard');
    setIsDefault(false);
    setNotes('');
    setError('');
    setIsAdding(true);
  };

  const handleStartEdit = (m: PaymentMethod) => {
    setEditingId(m.id);
    setName(m.name);
    setType(m.type);
    setColor(m.color);
    setIconName(m.iconName || 'CreditCard');
    setIsDefault(m.isDefault || defaultMethodId === m.id);
    setNotes(m.notes || '');
    setError('');
    setIsAdding(true);
  };

  const handleTypeChange = (newType: PaymentMethodType) => {
    setType(newType);
    const preset = PRESET_TYPES.find((p) => p.type === newType);
    if (preset) {
      setIconName(preset.defaultIcon);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this payment method (e.g., Apple Pay, Visa Card).');
      return;
    }

    onSaveMethod({
      id: editingId || undefined,
      name: name.trim(),
      type,
      color,
      iconName,
      isDefault,
      notes: notes.trim(),
    });

    setIsAdding(false);
    setEditingId(null);
  };

  const modalBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200 text-slate-900';

  const inputBg = isDark
    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400';

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${modalBg}`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-800/80' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Payment Methods</h3>
              <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Add cards, wallets, or cash & set your default payment method
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {isAdding ? (
            /* Add / Edit Form */
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {editingId ? 'Edit Payment Method' : 'Add New Payment Method'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Method Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Method Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Visa Credit Card, Vodafone Cash, Savings Card"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${inputBg} focus:outline-none focus:ring-2 focus:ring-emerald-500/30`}
                  autoFocus
                />
              </div>

              {/* Method Type Preset */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Category / Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_TYPES.map((p) => {
                    const isSelected = type === p.type;
                    return (
                      <button
                        key={p.type}
                        type="button"
                        onClick={() => handleTypeChange(p.type)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 text-xs font-bold cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/40'
                            : isDark
                            ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <PaymentMethodIcon type={p.type} className="w-4 h-4 shrink-0" />
                        <span className="truncate">{p.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PAYMENT_METHOD_ICONS.map((ico) => {
                    const isSelected = iconName === ico.name;
                    return (
                      <button
                        key={ico.name}
                        type="button"
                        onClick={() => setIconName(ico.name)}
                        title={ico.label}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-sm'
                            : isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <PaymentMethodIcon iconName={ico.name} className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Swatch */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  Accent Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center cursor-pointer ${
                        color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                    title="Custom color picker"
                  />
                </div>
              </div>

              {/* Set as Default Checkbox */}
              <label className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer ${
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold block">Set as Default Payment Method</span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Automatically pre-select this method when logging new expenses & assets
                  </span>
                </div>
              </label>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md transition cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Create Payment Method'}
                </button>
              </div>
            </form>
          ) : (
            /* Methods List View */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your Payment Methods ({methods.length})
                </span>
                <button
                  onClick={handleStartAdd}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Method</span>
                </button>
              </div>

              <div className="space-y-2">
                {methods.map((method) => {
                  const isCurrentDefault = defaultMethodId === method.id || method.isDefault;

                  return (
                    <div
                      key={method.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                        isDark ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${method.color}18`,
                            borderColor: `${method.color}35`,
                            color: method.color,
                          }}
                        >
                          <PaymentMethodIcon
                            type={method.type}
                            iconName={method.iconName}
                            className="w-5 h-5"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold truncate">
                              {method.name}
                            </span>
                            {isCurrentDefault ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                DEFAULT
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onSetDefaultMethod(method.id)}
                                className="text-[10px] font-bold text-slate-400 hover:text-emerald-400 hover:underline cursor-pointer"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                          <p className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {method.type.replace('_', ' ')}
                            {method.notes ? ` • ${method.notes}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(method)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                            isDark
                              ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
                              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                          title="Edit Payment Method"
                          aria-label="Edit Payment Method"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {methods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setMethodToDelete(method)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                              isDark
                                ? 'text-rose-400 hover:bg-rose-500/20'
                                : 'text-rose-600 hover:bg-rose-100'
                            }`}
                            title="Delete Payment Method"
                            aria-label="Delete Payment Method"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {methodToDelete && (
          <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className={`w-full max-w-sm rounded-2xl border p-5 space-y-4 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold">Delete Payment Method</h4>
                  <p className="text-xs text-slate-400">{methodToDelete.name}</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-300">
                Are you sure you want to remove <strong>{methodToDelete.name}</strong> from your payment options? Existing transactions will keep their recorded history.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMethodToDelete(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteMethod(methodToDelete.id);
                    setMethodToDelete(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
