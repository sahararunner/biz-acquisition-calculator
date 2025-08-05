import React, { useState, useCallback } from 'react';
import { formatCurrency, formatPercentage } from '../utils/calculations';

const CustomSlider = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = '',
  color = 'blue',
  showTooltip = true,
  disabled = false,
  className = ''
}) => {
  const [showTooltipState, setShowTooltipState] = useState(false);

  const handleChange = useCallback((e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  }, [onChange]);

  const formatValue = (val) => {
    if (unit === '$') return formatCurrency(val);
    if (unit === '%') return formatPercentage(val);
    if (unit === 'x EBITDA') return `${val.toFixed(1)}x`;
    return `${val}${unit}`;
  };

  const getColorClasses = () => {
    switch (color) {
      case 'best-case':
        return 'slider-best-case';
      case 'most-likely':
        return 'slider-most-likely';
      case 'worst-case':
        return 'slider-worst-case';
      case 'expected-value':
        return 'slider-expected-value';
      default:
        return 'slider-blue';
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {showTooltip && (
            <span className="text-sm text-gray-600">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
          disabled={disabled}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${getColorClasses()}
            focus:outline-none focus:ring-2 focus:ring-${color === 'best-case' ? 'green' : 'blue'}-500
            transition-all duration-150 ease-out
            relative z-10
            ${color === 'best-case' ? 'slider-thumb-green' : 'slider-thumb'}
          `}
          style={{
            background: `linear-gradient(to right, 
              ${color === 'best-case' ? '#10B981' : 
                color === 'most-likely' ? '#3B82F6' : 
                color === 'worst-case' ? '#EF4444' : 
                color === 'expected-value' ? '#8B5CF6' : '#3B82F6'} 0%, 
              ${color === 'best-case' ? '#10B981' : 
                color === 'most-likely' ? '#3B82F6' : 
                color === 'worst-case' ? '#EF4444' : 
                color === 'expected-value' ? '#8B5CF6' : '#3B82F6'} ${percentage}%, 
              #E5E7EB ${percentage}%, 
              #E5E7EB 100%)`
          }}
        />
      </div>

      {/* Tooltip */}
      {showTooltipState && showTooltip && (
        <div
          className="absolute z-20 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg"
          style={{
            left: `${percentage}%`,
            transform: 'translateX(-50%)',
            bottom: '100%',
            marginBottom: '8px'
          }}
        >
          {formatValue(value)}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Range labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

export default CustomSlider; 