import React from 'react';
import { AlertTriangleIcon, Info } from 'lucide-react';
import CustomSlider from './CustomSlider';
import { formatCurrency, formatPercentage } from '../utils/calculations';

const VariableCard = ({ 
  variableKey, 
  variable, 
  value, 
  onValueChange 
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const getConstraintWarning = () => {
    if (variableKey === 'sbaDownPayment' && value < 10) {
      return {
        type: 'warning',
        message: 'SBA requires minimum 10% down payment',
        icon: AlertTriangleIcon
      };
    }
    if (variableKey === 'sellerFinancing' && value === 0) {
      return {
        type: 'warning',
        message: '80% of small business sales include seller financing',
        icon: AlertTriangleIcon
      };
    }
    return null;
  };

  const constraint = getConstraintWarning();

  // Calculate probability based on normal distribution
  const calculateProbability = (val) => {
    const mean = (variable.range.min + variable.range.max) / 2;
    const stdDev = (variable.range.max - variable.range.min) / 6;
    const zScore = Math.abs((val - mean) / stdDev);
    // Calculate probability percentage
    const probability = Math.max(0, 100 - (zScore * 15));
    return Math.round(probability);
  };

  const probability = calculateProbability(value);

  const formatValue = (val) => {
    if (variable.unit === '$') return formatCurrency(val);
    if (variable.unit === '%') return formatPercentage(val);
    if (variable.unit === 'x EBITDA') return `${val.toFixed(1)}x`;
    return `${val}${variable.unit}`;
  };

  return (
    <div className="card p-3">
      <div className="mb-1">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold text-gray-900">{variable.name}</h3>
          <div className="relative inline-block">
            <div
              className="inline-flex items-center gap-1 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </div>
            {showTooltip && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
                <div className="font-medium mb-1">Description:</div>
                <div className="whitespace-pre-wrap">{variable.description}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {/* Current Value and Probability in same row */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-medium text-gray-700">Current: </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatValue(value)}
            </span>
          </div>
          <div>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              probability >= 70 ? 'bg-green-100 text-green-800' :
              probability >= 40 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {probability}% likely
            </span>
          </div>
        </div>

        {/* Slider */}
        <div className="space-y-1">
          <CustomSlider
            value={value}
            onChange={onValueChange}
            min={variable.range.min}
            max={variable.range.max}
            step={variable.unit === '$' ? 1000 : 0.1}
            unit={variable.unit}
            color="blue"
            showTooltip={false}
          />
          {/* Show interest rate for SBA Down Payment % and Seller Financing % */}
          {variableKey === 'sbaDownPayment' && (
            <div className="text-xs text-gray-500 mt-1">Rate: 11.5% (after tax 8.6%)</div>
          )}
          {variableKey === 'sellerFinancing' && (
            <div className="text-xs text-gray-500 mt-1">Rate: 8% (after tax 6.0%)</div>
          )}
        </div>

        {/* Constraint Warnings */}
        {constraint && (
          <div className={`p-1 rounded border text-xs ${
            constraint.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-1">
              <constraint.icon className={`w-3 h-3 ${
                constraint.type === 'warning' ? 'text-amber-600' : 'text-green-600'
              }`} />
              <span className={`${
                constraint.type === 'warning' ? 'text-amber-800' : 'text-green-800'
              }`}>
                {constraint.message}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VariableCard; 