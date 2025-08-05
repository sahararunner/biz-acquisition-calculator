import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  calculateRiskScore,
  formatCurrency 
} from '../utils/calculations';

const ResultsDashboard = ({ 
  keyParameters, 
  variables, 
  results 
}) => {
  const riskScore = useMemo(() => {
    return calculateRiskScore({
      targetRevenue: keyParameters.targetRevenue,
      netProfitMarginPercent: results.cashFlow.ebitda / keyParameters.targetRevenue * 100,
      sbaLoanAmount: results.financing.sbaLoanAmount,
      sellerFinancingAmount: results.financing.sellerFinancing,
      workingCapitalPercent: variables.workingCapital,
      sbaDownPaymentPercent: variables.sbaDownPayment
    });
  }, [results, keyParameters, variables]);

  const getRiskLevel = (score) => {
    if (score <= 3) return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score <= 6) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Results Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Cash Required */}
        <div className="metric-card best-case">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Cash Required</h3>
            <DollarSign className="w-6 h-6 text-best-case" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Down Payment:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashRequired.downPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Working Capital:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashRequired.workingCapital)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Due Diligence:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashRequired.dueDiligence)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Professional Fees:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashRequired.professionalFees)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tech Investment:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashRequired.techInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Contingency:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashRequired.contingency)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-900">Total:</span>
              <span className="text-sm font-mono font-bold">{formatCurrency(results.cashRequired.total)}</span>
            </div>
          </div>
        </div>

        {/* Annual Cash to Pocket */}
        <div className="metric-card most-likely">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Annual Cash Flow</h3>
            <TrendingUp className="w-6 h-6 text-most-likely" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">EBITDA:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashFlow.ebitda)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SBA Payment:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashFlow.sbaPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Seller Payment:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashFlow.sellerPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Management Salary:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashFlow.managementSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tech Investment:</span>
              <span className="text-sm font-mono">{formatCurrency(results.cashFlow.techInvestmentAmortized)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-900">Net Cash Flow:</span>
              <span className="text-sm font-mono font-bold">{formatCurrency(results.cashFlow.netCashFlow)}</span>
            </div>
          </div>
        </div>

        {/* Financing Structure */}
        <div className="metric-card expected-value">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financing Structure</h3>
            <Building className="w-6 h-6 text-expected-value" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Purchase Price:</span>
              <span className="text-sm font-mono">{formatCurrency(results.financing.purchasePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">SBA Loan:</span>
              <span className="text-sm font-mono">{formatCurrency(results.financing.sbaLoanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Seller Financing:</span>
              <span className="text-sm font-mono">{formatCurrency(results.financing.sellerFinancing)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-900">Down Payment:</span>
              <span className="text-sm font-mono font-bold">{formatCurrency(results.financing.downPayment)}</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="metric-card worst-case">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
            <AlertTriangle className="w-6 h-6 text-worst-case" />
          </div>
          
          <div className="space-y-3">
            <div className="text-center">
              <div className={`text-2xl font-bold ${riskLevel.color}`}>
                {riskScore}/10
              </div>
              <div className={`text-sm font-medium ${riskLevel.color}`}>
                {riskLevel.level} Risk
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  riskScore <= 3 ? 'bg-green-500' : 
                  riskScore <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(riskScore / 10) * 100}%` }}
              ></div>
            </div>
            
            <div className="text-xs text-gray-600 text-center">
              {riskScore <= 3 ? 'Strong deal structure' :
               riskScore <= 6 ? 'Moderate risk level' : 'High risk - review required'}
            </div>
          </div>
        </div>
      </div>

      {/* Cash Shortfall Warning */}
      {results.cashRequired.total > keyParameters.availableCash && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">
              Cash Shortfall: Need additional {formatCurrency(results.cashRequired.total - keyParameters.availableCash)}
            </span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {results.cashRequired.total <= keyParameters.availableCash && riskScore <= 6 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Strong deal structure - low risk
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard; 