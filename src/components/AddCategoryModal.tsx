import React, { useState, useRef, useEffect } from 'react';
import { X, Palette, Check, Plus, Edit3 } from 'lucide-react';
import { saveCustomCategory, updateCustomCategory } from '../constants/categories';
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from './CategoryIcon';
import { CategoryMeta } from '../types';

interface AddCategoryModalProps {
  isOpen: boolean;
  isDark?: boolean;
  editingCategory?: CategoryMeta | null;
  onClose: () => void;
  onCategorySaved?: (categoryName: string) => void;
  onCategoryAdded?: (categoryName: string) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  isDark = false,
  editingCategory = null,
  onClose,
  onCategorySaved,
  onCategoryAdded,
}) => {
  const [catName, setCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [selectedIconName, setSelectedIconName] = useState('Tag');
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCategory) {
      setCatName(editingCategory.name);
      setSelectedColor(editingCategory.color || '#10B981');
      setSelectedIconName(editingCategory.iconName || 'Tag');
    } else {
      setCatName('');
      setSelectedColor('#10B981');
      setSelectedIconName('Tag');
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSelectColorClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const formattedName = catName.trim();
    const metaData: CategoryMeta = {
      name: formattedName,
      color: selectedColor,
      bgColor: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconName: selectedIconName,
      description: editingCategory ? editingCategory.description : 'Custom user category',
    };

    if (editingCategory) {
      updateCustomCategory(editingCategory.name, metaData);
    } else {
      saveCustomCategory(metaData);
    }

    if (onCategorySaved) {
      onCategorySaved(formattedName);
    }
    if (onCategoryAdded) {
      onCategoryAdded(formattedName);
    }
    setCatName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              {editingCategory ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <h3 className="text-sm font-extrabold">
              {editingCategory ? `Edit "${editingCategory.name}" Category` : 'Create Custom Category'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Category Name */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Subscriptions, Gym, Pet Care"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
              autoFocus
            />
          </div>

          {/* Select Icon */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
              Choose Icon
            </label>
            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 p-2 rounded-xl border bg-slate-800/40 border-slate-700/60 max-h-36 overflow-y-auto">
              {CATEGORY_ICON_OPTIONS.map((item) => {
                const isSelected = selectedIconName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIconName(item.name)}
                    title={item.label}
                    className={`p-2 rounded-xl flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-md scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                    }`}
                  >
                    <CategoryIcon iconName={item.name} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Category Color
            </label>

            {/* Hidden HTML Color Input */}
            <input
              ref={colorInputRef}
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="sr-only"
            />

            {/* Circular Colour Wheel Control */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectColorClick}
                title="Click to open circular Colour Wheel"
                className="relative w-11 h-11 rounded-full p-1 border-2 border-white/20 shadow-md hover:scale-105 active:scale-95 transition cursor-pointer shrink-0 flex items-center justify-center"
                style={{
                  background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center transition"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Palette className="w-3 h-3 text-white drop-shadow-sm" />
                </div>
              </button>

              <button
                type="button"
                onClick={handleSelectColorClick}
                className={`flex-1 px-3.5 py-2 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div>
                  <p className="text-xs font-black">Circular Colour Wheel</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    HEX: <span className="font-mono font-bold text-emerald-400">{selectedColor.toUpperCase()}</span>
                  </p>
                </div>
                <span
                  className="w-4 h-4 rounded-full border border-white/80 shadow-xs shrink-0"
                  style={{ backgroundColor: selectedColor }}
                />
              </button>
            </div>

            {/* Quick Circular Swatches */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#14B8A6', '#6366F1'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                    selectedColor.toLowerCase() === c.toLowerCase()
                      ? 'border-white scale-110 shadow-md ring-2 ring-emerald-500/50'
                      : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
