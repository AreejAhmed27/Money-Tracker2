import React, { useState } from 'react';
import {
  User,
  Moon,
  Sun,
  Coins,
  FileSpreadsheet,
  FileText,
  LogOut,
  LogIn,
  Trash2,
  AlertTriangle,
  X,
  Check,
  ShieldCheck,
  Plus,
  Edit3,
  Calendar,
  Camera,
  Tag,
  ChevronDown,
  BookOpen,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  Wallet,
  Download,
  Upload,
  HardDrive,
  Copy,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
} from 'lucide-react';
import { CurrencyConfig, ThemeMode, UserAccount, AssetItem, ExpenseItem, PaymentMethod } from '../types';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../utils/formatters';
import { downloadExcelReport, printPDFReport } from '../utils/reportGenerator';
import { exportAllDataBackup, restoreAllDataFromBackup } from '../utils/storage';
import { AddCategoryModal } from './AddCategoryModal';
import { PrettySelect } from './PrettySelect';
import { PaymentMethodIcon } from './PaymentMethodIcon';
import { ManagePaymentMethodsModal } from './ManagePaymentMethodsModal';
import { FirebaseAuthModal } from './FirebaseAuthModal';
import { syncLocalDataToCloud, syncCloudDataToLocal } from '../utils/cloudSync';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import {
  getAllCategoryList,
  CATEGORIES,
  saveCustomCategory,
  deleteCategory,
} from '../constants/categories';

interface SettingsViewProps {
  userAccount?: UserAccount | null;
  onUpdateUserAccount?: (user: UserAccount) => void;
  onAccountChange?: (user: UserAccount | null) => void;
  onDeleteAccount?: () => void;
  currentTheme?: ThemeMode;
  themeMode?: ThemeMode;
  onToggleTheme?: (theme: ThemeMode) => void;
  onThemeChange?: (theme: ThemeMode) => void;
  currencyCode?: string;
  onChangeCurrency?: (code: string) => void;
  onCurrencyChange?: (code: string) => void;
  paymentMethods?: PaymentMethod[];
  defaultPaymentMethodId?: string;
  onSavePaymentMethod?: (method: Omit<PaymentMethod, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeletePaymentMethod?: (id: string) => void;
  onSetDefaultPaymentMethod?: (id: string) => void;
  expenses?: ExpenseItem[];
  assets?: AssetItem[];
  expensesCount?: number;
  assetsCount?: number;
  activeMonth?: string;
  activeYear?: number;
  availableYears?: number[];
  onSelectYear?: (year: number) => void;
  onAddNewYear?: (year: number) => void;
  onClearData?: () => void;
  onGenerateReportPDF?: (period: 'daily' | 'monthly' | 'yearly') => void;
  onGenerateReportCSV?: (period: 'daily' | 'monthly' | 'yearly') => void;
  onOpenTutorial?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userAccount,
  onUpdateUserAccount,
  onAccountChange,
  onDeleteAccount,
  currentTheme,
  themeMode,
  onToggleTheme,
  onThemeChange,
  currencyCode = 'EGP',
  onChangeCurrency,
  onCurrencyChange,
  paymentMethods = [],
  defaultPaymentMethodId = 'pm-cash',
  onSavePaymentMethod,
  onDeletePaymentMethod,
  onSetDefaultPaymentMethod,
  expenses = [],
  assets = [],
  activeMonth = 'August',
  activeYear = 2026,
  availableYears = [2026],
  onSelectYear,
  onAddNewYear,
  onClearData,
  onOpenTutorial,
}) => {
  const currentUser: UserAccount = userAccount || {
    name: 'Areej Ahmed',
    email: 'areejahmed.27502@gmail.com',
    isLoggedIn: true,
    joinedDate: '2026-08-01',
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [emailInput, setEmailInput] = useState(currentUser.email);
  const [passwordInput, setPasswordInput] = useState('');
  const [newYearInput, setNewYearInput] = useState('');

  // Manage payment methods modal state
  const [isManageMethodsOpen, setIsManageMethodsOpen] = useState(false);

  // Confirmation modal state for wipe data/delete account
  const [confirmAction, setConfirmAction] = useState<'wipeAll' | 'deleteAccount' | null>(null);

  // Custom category creation in settings
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>(getAllCategoryList());

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const isDark = (themeMode || currentTheme || 'light') === 'dark';

  const handleSaveAccount = (updatedUser: UserAccount) => {
    if (onUpdateUserAccount) onUpdateUserAccount(updatedUser);
    if (onAccountChange) onAccountChange(updatedUser);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleSaveAccount({
          ...currentUser,
          avatarUrl: base64String,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    handleSaveAccount({
      ...currentUser,
      avatarUrl: undefined,
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    handleSaveAccount({
      name: 'Guest User',
      email: 'guest@example.com',
      isLoggedIn: false,
    });
  };

  const handleManualCloudSync = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      await syncLocalDataToCloud(user.uid);
      setSyncStatusMsg('All financial records safely backed up to Cloud!');
      setTimeout(() => setSyncStatusMsg(null), 3500);
    } catch (e: any) {
      setSyncStatusMsg('Sync error: ' + (e.message || 'Failed to sync'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualCloudRestore = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await syncCloudDataToLocal(user.uid);
      if (res.success) {
        setSyncStatusMsg(`Restored ${res.itemCount} records from Cloud! Reloading...`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setSyncStatusMsg('No cloud backup records found for this account.');
      }
    } catch (e: any) {
      setSyncStatusMsg('Restore error: ' + (e.message || 'Failed to restore'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    if (onToggleTheme) onToggleTheme(mode);
    if (onThemeChange) onThemeChange(mode);
  };

  const handleCurrencySelect = (code: string) => {
    if (onChangeCurrency) onChangeCurrency(code);
    if (onCurrencyChange) onCurrencyChange(code);
  };

  const handleAddCustomYear = () => {
    const parsed = parseInt(newYearInput, 10);
    if (!isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
      if (onAddNewYear) onAddNewYear(parsed);
      setNewYearInput('');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Settings Title Header */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <h2 className="text-xl font-extrabold tracking-tight">App Settings & Preferences</h2>
      </div>

      {/* SECTION: APP GUIDE & TUTORIAL */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <div className="flex items-center space-x-2.5 mb-3">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
            isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">App Guide & Tutorial</h3>
          </div>
        </div>

        <button
          onClick={onOpenTutorial}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>View Tutorial</span>
        </button>
      </div>

      {/* SECTION 1: USER ACCOUNT */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">User Account</h3>
          </div>
        </div>

        {/* User Profile Summary Box */}
        {currentUser.isLoggedIn ? (
          <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
            <div className="flex items-center space-x-3">
              {/* Profile Avatar with Photo Upload */}
              <div className="relative group shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-emerald-500 text-white font-bold flex items-center justify-center text-lg shadow-xs border-2 border-emerald-500">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (currentUser.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  htmlFor="avatar-file-input"
                  className="absolute inset-0 bg-slate-900/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="Change Profile Photo"
                >
                  <Camera className="w-5 h-5" />
                </label>
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold flex items-center gap-1.5 truncate">
                  <span className="truncate">{currentUser.name}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {currentUser.email}
                </p>
              </div>
            </div>

            {/* Profile Action Buttons placed neatly next to each other */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-700/40">
              <label
                htmlFor="avatar-file-input-btn"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5 transition shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{currentUser.avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </label>
              <input
                id="avatar-file-input-btn"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <button
                onClick={() => {
                  setNameInput(currentUser.name);
                  setEmailInput(currentUser.email);
                  setIsAuthModalOpen(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  isDark ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Edit Name</span>
              </button>

              {currentUser.avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-xl border text-center ${isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              You are currently using Money Tracker as a Guest User.
            </p>
          </div>
        )}

        {/* Sign In / Sign Up, Logout, or Delete Account Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-800/40 flex flex-col sm:flex-row items-center gap-2">
          {currentUser.isLoggedIn ? (
            <>
              <button
                onClick={handleLogout}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>Log Out Account</span>
              </button>

              <button
                onClick={() => setConfirmAction('deleteAccount')}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Delete Account</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </button>

              <button
                onClick={() => setConfirmAction('deleteAccount')}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>Delete Account</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SECTION: CLOUD BACKUP & MULTI-DEVICE SYNC */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Cloud Sync</h3>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={handleManualCloudSync}
            disabled={isSyncing}
            className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center space-x-2">
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
              <span className="font-extrabold">Backup to Cloud</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleManualCloudRestore}
            disabled={isSyncing}
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-center transition shadow-md cursor-pointer border disabled:opacity-50 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4 text-emerald-500" />}
              <span className="font-extrabold">Restore from Cloud</span>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: APPEARANCE & THEME TOGGLE */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold">App Visual Mode</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={() => handleThemeSelect('light')}
            className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold text-xs transition ${
              !isDark
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Light</span>
            {!isDark && <Check className="w-4 h-4 ml-1" />}
          </button>

          <button
            onClick={() => handleThemeSelect('dark')}
            className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold text-xs transition ${
              isDark
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
            {isDark && <Check className="w-4 h-4 ml-1" />}
          </button>
        </div>
      </div>

      {/* SECTION: PAYMENT METHODS */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Payment Methods</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsManageMethodsOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* List of Payment Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
          {paymentMethods.map((method) => {
            const isCurrentDefault = defaultPaymentMethodId === method.id || method.isDefault;

            return (
              <div
                key={method.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition ${
                  isCurrentDefault
                    ? isDark
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                    : isDark
                    ? 'bg-slate-800/40 border-slate-700/60'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${method.color}15`,
                      borderColor: `${method.color}35`,
                      color: method.color,
                    }}
                  >
                    <PaymentMethodIcon
                      type={method.type}
                      iconName={method.iconName}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-extrabold truncate">{method.name}</p>
                      {isCurrentDefault && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {method.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {!isCurrentDefault && onSetDefaultPaymentMethod && (
                  <button
                    type="button"
                    onClick={() => onSetDefaultPaymentMethod(method.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-emerald-500 hover:underline cursor-pointer shrink-0"
                  >
                    Make Default
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: MULTI-YEAR MANAGEMENT */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Multi-Year Slates & Tracking</h3>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className={`text-xs font-extrabold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Select Active Year Slate
            </label>
            <PrettySelect<number>
              value={activeYear}
              isDark={isDark}
              options={availableYears.map((yr) => ({
                value: yr,
                label: `Year Slate ${yr}`,
                symbol: String(yr).slice(-2),
                description: yr === activeYear ? 'Currently active tracking slate' : 'Switch to this year slate',
              }))}
              onChange={(newYr) => onSelectYear && onSelectYear(newYr)}
            />
          </div>

          <div className="pt-3 border-t border-slate-800/40">
            <label className={`text-xs font-extrabold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Add New Year Slate
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="e.g. 2027"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border w-36 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400'
                }`}
              />
              <button
                onClick={handleAddCustomYear}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Year Slate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: FINANCIAL REPORTS & EXPORT */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Download Financial Statements</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Excel / CSV Download */}
          <button
            onClick={() => downloadExcelReport(expenses, assets, activeMonth, activeYear, currencyCode)}
            className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-between transition shadow-md"
          >
            <div className="flex items-center space-x-2.5">
              <FileSpreadsheet className="w-5 h-5" />
              <div className="text-left">
                <p className="font-extrabold">Excel / CSV Spreadsheet</p>
              </div>
            </div>
          </button>

          {/* Printable PDF Report */}
          <button
            onClick={() => printPDFReport(expenses, assets, activeMonth, activeYear, currencyCode, currentUser)}
            className="p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-between transition shadow-md"
          >
            <div className="flex items-center space-x-2.5">
              <FileText className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <p className="font-extrabold">Formatted PDF Statement</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION: PHONE-TO-PHONE DATA TRANSFER */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Transfer Data</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {/* Export Full Backup */}
          <button
            type="button"
            onClick={() => {
              const backupJson = exportAllDataBackup();
              const blob = new Blob([backupJson], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              const dateStr = new Date().toISOString().split('T')[0];
              a.download = `money_tracker_backup_${dateStr}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-between transition shadow-md cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Download className="w-5 h-5" />
              <div className="text-left">
                <p className="font-extrabold">Export Backup (.json)</p>
              </div>
            </div>
          </button>

          {/* Import / Restore Backup */}
          <label className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-between transition shadow-md cursor-pointer border border-slate-700">
            <div className="flex items-center space-x-2.5">
              <Upload className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <p className="font-extrabold">Import Backup (.json)</p>
              </div>
            </div>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  if (content) {
                    const result = restoreAllDataFromBackup(content);
                    if (result.success) {
                      window.location.reload();
                    } else {
                      alert(`Import failed: ${result.message}`);
                    }
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>
      </div>


      {/* SECTION 7: DATA MANAGEMENT */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200/80 shadow-sm text-slate-900'}`}>
        <h3 className="text-base font-extrabold mb-3">Data Management</h3>

        <div>
          <button
            onClick={() => setConfirmAction('wipeAll')}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 transition cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4 shrink-0 text-red-500" />
            <span>Wipe All Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction !== null && (
        <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className={`w-full max-w-sm sm:max-w-md rounded-2xl p-5 shadow-2xl border space-y-4 animate-in zoom-in-95 duration-150 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-500/15 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-black">Are you sure?</h3>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {confirmAction === 'deleteAccount' && 'Permanently delete user profile'}
                    {confirmAction === 'wipeAll' && 'Permanent deletion of all local records'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setConfirmAction(null)}
                className={`p-1.5 rounded-xl cursor-pointer transition ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-xl text-xs font-medium leading-relaxed border ${
              isDark ? 'bg-red-950/30 border-red-900/40 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {confirmAction === 'deleteAccount' && (
                <p>
                  This will delete your user account profile and sign you out to Guest mode.
                </p>
              )}
              {confirmAction === 'wipeAll' && (
                <p>
                  This will permanently wipe all stored entries (expenses, assets, goals, debts, and money held). This action cannot be undone.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmAction === 'deleteAccount') {
                    const guestAcc: UserAccount = {
                      name: 'Guest User',
                      email: 'guest@example.com',
                      isLoggedIn: false,
                      avatarUrl: undefined,
                    };
                    handleSaveAccount(guestAcc);
                    if (onDeleteAccount) onDeleteAccount();
                  }
                  if (confirmAction === 'wipeAll') onClearData?.();
                  setConfirmAction(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-md cursor-pointer transition bg-red-600 hover:bg-red-500 shadow-red-950/30"
              >
                {confirmAction === 'deleteAccount' ? 'Yes, Delete Account' : 'Yes, Wipe All Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth / Profile Modal with Firebase Cloud Sync */}
      <FirebaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isDark={isDark}
        initialMode={authMode}
        onAuthSuccess={(user) => {
          handleSaveAccount({
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            isLoggedIn: true,
            joinedDate: new Date().toISOString().split('T')[0],
          });
        }}
      />

      {/* Add Custom Category Modal */}
      <AddCategoryModal
        isOpen={isAddCatModalOpen}
        isDark={isDark}
        onClose={() => setIsAddCatModalOpen(false)}
        onCategoryAdded={() => {
          setCategoriesList(getAllCategoryList());
        }}
      />

      {/* Manage Payment Methods Modal */}
      <ManagePaymentMethodsModal
        isOpen={isManageMethodsOpen}
        onClose={() => setIsManageMethodsOpen(false)}
        methods={paymentMethods}
        defaultMethodId={defaultPaymentMethodId}
        onSaveMethod={(method) => {
          if (onSavePaymentMethod) onSavePaymentMethod(method);
        }}
        onDeleteMethod={(id) => {
          if (onDeletePaymentMethod) onDeletePaymentMethod(id);
        }}
        onSetDefaultMethod={(id) => {
          if (onSetDefaultPaymentMethod) onSetDefaultPaymentMethod(id);
        }}
        isDark={isDark}
      />
    </div>
  );
};
