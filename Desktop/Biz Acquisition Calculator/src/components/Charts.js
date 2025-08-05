import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { formatCurrency } from '../utils/calculations';

const Charts = ({ results, keyParameters, variables }) => {
  const chartData = useMemo(() => {
    return {
      cashBreakdown: [
        { name: 'Down Payment', value: results.cashRequired.downPayment, color: '#10B981' },
        { name: 'Working Capital', value: results.cashRequired.workingCapital, color: '#3B82F6' },
        { name: 'Due Diligence', value: results.cashRequired.dueDiligence, color: '#F59E0B' },
        { name: 'Professional Fees', value: results.cashRequired.professionalFees, color: '#8B5CF6' },
        { name: 'Tech Investment', value: results.cashRequired.techInvestment, color: '#EF4444' },
        { name: 'Contingency', value: results.cashRequired.contingency, color: '#6B7280' }
      ],
      financingStructure: [
        { name: 'SBA Loan', value: results.financing.sbaLoanAmount, color: '#3B82F6' },
        { name: 'Seller Financing', value: results.financing.sellerFinancing, color: '#10B981' },
        { name: 'Down Payment', value: results.financing.downPayment, color: '#F59E0B' }
      ],
      cashFlowBreakdown: [
        { name: 'EBITDA', value: results.cashFlow.ebitda, color: '#10B981' },
        { name: 'SBA Payment', value: -results.cashFlow.sbaPayment, color: '#EF4444' },
        { name: 'Seller Payment', value: -results.cashFlow.sellerPayment, color: '#F59E0B' },
        { name: 'Management Salary', value: -results.cashFlow.managementSalary, color: '#8B5CF6' },
        { name: 'Tech Investment', value: -results.cashFlow.techInvestmentAmortized, color: '#6B7280' }
      ]
    };
  }, [results]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Visualizations</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cash Flow Breakdown Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.cashFlowBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6">
                {chartData.cashFlowBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Breakdown Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.cashBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.cashBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financing Structure Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financing Structure</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.financingStructure} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3B82F6">
              {chartData.financingStructure.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 5-Year Projections Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Year Cash Flow Projections</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={[
            { year: 'Year 1', revenue: keyParameters.targetRevenue, cashFlow: results.cashFlow.netCashFlow },
            { year: 'Year 2', revenue: keyParameters.targetRevenue * (1 + variables.revenueGrowthRate / 100), cashFlow: results.cashFlow.netCashFlow * 1.05 },
            { year: 'Year 3', revenue: keyParameters.targetRevenue * Math.pow(1 + variables.revenueGrowthRate / 100, 2), cashFlow: results.cashFlow.netCashFlow * 1.10 },
            { year: 'Year 4', revenue: keyParameters.targetRevenue * Math.pow(1 + variables.revenueGrowthRate / 100, 3), cashFlow: results.cashFlow.netCashFlow * 1.15 },
            { year: 'Year 5', revenue: keyParameters.targetRevenue * Math.pow(1 + variables.revenueGrowthRate / 100, 4), cashFlow: results.cashFlow.netCashFlow * 1.20 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            <Area type="monotone" dataKey="cashFlow" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts; 