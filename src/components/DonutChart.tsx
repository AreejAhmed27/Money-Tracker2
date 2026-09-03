import React, { useState } from 'react';
import { CATEGORIES, getAllCategoryList } from '../constants/categories';
import { CategoryType } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';

interface DonutChartProps {
  breakdown: Record<CategoryType, number>;
  activeMonth: string;
  activeYear: number;
  currencyCode?: string;
  isDark?: boolean;
  onSelectCategory?: (category: CategoryType | null) => void;
  selectedCategory?: CategoryType | null;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  breakdown,
  activeMonth,
  activeYear,
  currencyCode = 'EGP',
  isDark = false,
  onSelectCategory,
  selectedCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryType | null>(null);

  const totalSpent: number = (Object.values(breakdown) as number[]).reduce((sum: number, val: number) => sum + Number(val || 0), 0);

  const categoriesList = getAllCategoryList().map((cat) => {
    const amount = breakdown[cat] || 0;
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    return {
      category: cat,
      meta: CATEGORIES[cat],
      amount,
      percentage,
    };
  });

  const sortedCategories = [...categoriesList].sort((a, b) => b.amount - a.amount);

  let cumulativeAngle = 0;
  const donutSlices = sortedCategories
    .filter((item) => item.amount > 0)
    .map((item) => {
      const sliceAngle = (item.amount / (totalSpent || 1)) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle += sliceAngle;

      const radius = 40;
      const strokeWidth = 14;
      const center = 50;

      const x1 = center + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = center + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = center + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = center + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

      const pathData =
        sliceAngle >= 359.99
          ? `M ${center}, ${center - radius} A ${radius},${radius} 0 1,1 ${center - 0.01},${
              center - radius
            }`
          : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

      return {
        ...item,
        pathData,
        strokeWidth,
      };
    });

  const activeDisplay = hoveredCategory || selectedCategory;
  const activeMeta = activeDisplay ? CATEGORIES[activeDisplay] : null;
  const activeAmount = activeDisplay ? breakdown[activeDisplay] || 0 : totalSpent;

  const cardBg = isDark
    ? 'bg-slate-900 border-slate-800 text-white'
    : 'bg-white border-slate-200/80 text-slate-900';

  return (
    <div className={`${cardBg} rounded-2xl p-5 border shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold">Spending by Category</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Distribution for {activeMonth} {activeYear}
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            className="text-xs font-semibold text-emerald-500 hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {totalSpent === 0 ? (
        <div className={`py-12 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          No expenses recorded for {activeMonth} {activeYear} yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* SVG Donut Graphic Column */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 sm:w-52 sm:h-52">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={isDark ? '#1E293B' : '#F1F5F9'}
                  strokeWidth="14"
                />

                {/* Animated Donut Segments */}
                {donutSlices.map((slice) => {
                  const isSelected = selectedCategory === slice.category;
                  const isHovered = hoveredCategory === slice.category;
                  const opacity =
                    activeDisplay && !isSelected && !isHovered ? 0.35 : 1;

                  return (
                    <path
                      key={slice.category}
                      d={slice.pathData}
                      fill="none"
                      stroke={slice.meta.color}
                      strokeWidth={isHovered || isSelected ? 17 : 14}
                      strokeLinecap="round"
                      style={{
                        opacity,
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => setHoveredCategory(slice.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() =>
                        onSelectCategory &&
                        onSelectCategory(selectedCategory === slice.category ? null : slice.category)
                      }
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10">
                <div className="w-[58%] max-w-[58%] mx-auto flex flex-col items-center justify-center text-center">
                  <span className={`text-[9px] sm:text-[10px] leading-tight font-extrabold uppercase tracking-tight break-words max-w-full line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {activeMeta ? activeMeta.name : 'TOTAL MONTH'}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold font-mono mt-0.5 leading-none text-slate-900 dark:text-white">
                    {formatCompactCurrency(activeAmount, currencyCode)}
                  </span>
                  {activeDisplay && (
                    <span className={`text-[9px] font-bold mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {(((breakdown[activeDisplay] || 0) / (totalSpent || 1)) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category List & Legend Column */}
          <div className="md:col-span-7 space-y-2">
            {categoriesList.map((item) => {
              const isSelected = selectedCategory === item.category;
              const isHovered = hoveredCategory === item.category;

              return (
                <div
                  key={item.category}
                  onClick={() =>
                    onSelectCategory &&
                    onSelectCategory(selectedCategory === item.category ? null : item.category)
                  }
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer border ${
                    isSelected
                      ? isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300 shadow-xs'
                      : isHovered
                      ? isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.meta.color }}
                    />
                    <span className="text-xs font-semibold truncate">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className={`text-[11px] font-medium w-11 text-right ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                      {item.percentage.toFixed(0)}%
                    </span>
                    <span className="text-xs font-bold font-mono w-24 text-right">
                      {formatCurrency(item.amount, currencyCode)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

