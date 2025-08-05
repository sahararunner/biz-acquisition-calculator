import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Download, Settings, Info } from 'lucide-react';
import VariableCard from './components/VariableCard';
import CustomSlider from './components/CustomSlider';
import { VARIABLES, DEFAULT_SCENARIO } from './utils/variables';
import { 
  calculateTotalCashRequired, 
  calculateAnnualCashToPocket, 
  calculateDSCR,
  calculateCashOnCashReturn,
  calculateEnhancedRiskScore,
  calculateIRR,
  calculateMOIC,
  calculatePaybackPeriod,
  calculateFiveYearProjections,
  calculateRiskAdjustedOwnership,
  calculateBusinessWACC,
  calculateBusinessEVA,
  verifyCalculations,
  calculateScenariosWithPriority,
  calculateTotalCashNeeded,
  allocateFundingByPriority,
  calculatePurchasePriceFinancing,
  calculateBusinessDebtService,
  calculatePersonalDebtService,
  calculatePriorityBasedWACC,
  calculatePriorityBasedOwnership,
  // New metrics calculations
  calculateCapitalUtilizationRate,
  getCapitalUtilizationStatus,
  calculateLeverageMultiplier,
  getLeverageMultiplierStatus,
  calculatePriceToRevenueRatio,
  getPriceToRevenueStatus,
  calculateEBITDAMargin,
  getEBITDAMarginStatus,
  calculateBusinessCashConversion,
  getCashConversionStatus,
  calculateRevenueToInvestmentEfficiency,
  getRevenueEfficiencyStatus,
  calculateRiskAdjustedReturn,
  getRiskAdjustedStatus,
  calculateIncomeReplacementRatio,
  getIncomeReplacementStatus,
  calculateWealthBuildingVelocity,
  getWealthVelocityStatus,
  calculateExitValueRange,
  calculateStressTestResults,
  getStressTestStatus,
  calculateGrowthFundingCapacity,
  getGrowthCapacityStatus,
  // Debug logging functions
  DEBUG_METRICS,
  logMetricCalculation,
  logAllMetricsSummary
} from './utils/calculations';

// Separate InfoPopup component to prevent recreation
const InfoPopup = ({ 
  showInfoPopup, 
  setShowInfoPopup, 
  searchTerm, 
  setSearchTerm, 
  searchInputRef, 
  allMetricsData 
}) => {
  // Filter metrics based on search term
  const filteredMetrics = allMetricsData.map(section => ({
    ...section,
    metrics: section.metrics.filter(metric => 
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.formula.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.metrics.length > 0);

  // Function to create detailed breakdown for each metric
  const createDetailedBreakdown = (metricName, variables) => {
    const breakdowns = {
      "Your ROI": {
        steps: [
          "Step 1: Calculate Your Net Annual Gain",
          "Your Net Annual Gain = EBITDA - Business Debt Payments - Management Salary - Tech Investment (amortized)",
          `EBITDA = $${(variables.targetRevenue * variables.netProfitMargin / 100).toLocaleString()}`,
          "Business Debt Payments = SBA Payment + Seller Financing Payment",
          `SBA Payment = $${(variables.targetRevenue * variables.netProfitMargin / 100 * variables.valuationMultiple * (1 - variables.sellerFinancing / 100) * 0.115).toLocaleString()} (11.5% rate)`,
          `Seller Payment = $${(variables.targetRevenue * variables.netProfitMargin / 100 * variables.valuationMultiple * variables.sellerFinancing / 100 * 0.08).toLocaleString()} (8% rate)`,
          `Management Salary = $${variables.managementSalary?.toLocaleString()}`,
          `Tech Investment (amortized) = $${variables.techInvestment / 3} (over 3 years)`,
          "",
          "Step 2: Calculate Your Total Investment",
          "Your Total Investment = Personal Cash + Taiwanese Loan + Home Equity",
          "Your Total Investment = Sum of your personal funding sources",
          "",
          "Step 3: Calculate ROI",
          "Your ROI = (Your Net Annual Gain ÷ Your Total Investment) × 100"
        ]
      },
      "Wealth Building Velocity": {
        steps: [
          "Step 1: Calculate MOIC (Multiple on Invested Capital)",
          "MOIC = (Total Cash Returned + Business Value at Exit) ÷ Personal Cash Invested",
          "",
          "Step 2: Calculate Annual Wealth Creation Rate",
          "Wealth Building Velocity = (MOIC^(1/5) - 1) × 100",
          "",
          "This converts your total 5-year return into an annualized compound growth rate.",
          "Example: If MOIC = 3.0x over 5 years:",
          "Wealth Building Velocity = (3.0^(1/5) - 1) × 100 = 24.57%"
        ]
      }
    };
    
    return breakdowns[metricName] || null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">All Metrics & Formulas</h2>
          <button
            onClick={() => {
              setShowInfoPopup(false);
              setSearchTerm('');
            }}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        {/* Search Box */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search metrics and formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              Found {filteredMetrics.reduce((total, section) => total + section.metrics.length, 0)} matching metrics
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No metrics found</div>
              <div className="text-gray-500 text-sm">Try a different search term</div>
            </div>
          ) : (
            filteredMetrics.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  {section.section}
                </h3>
                <div className="grid gap-4">
                  {section.metrics.map((metric, metricIndex) => {
                    const breakdown = createDetailedBreakdown(metric.name, {
                      targetRevenue: 2500000,
                      netProfitMargin: 25,
                      valuationMultiple: 4.2,
                      sellerFinancing: 20,
                      sbaDownPayment: 12,
                      workingCapital: 12,
                      managementSalary: 75000,
                      techInvestment: 60000
                    });
                    
                    return (
                      <div key={metricIndex} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{metric.name}</h4>
                        
                        {/* Original Formula */}
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Formula:</div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded border">
                            {metric.formula}
                          </div>
                        </div>
                        
                        {/* Detailed Breakdown */}
                        {breakdown && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Step-by-Step Calculation:</div>
                            <div className="bg-white p-3 rounded border">
                              {breakdown.steps.map((step, stepIndex) => (
                                <div key={stepIndex} className={`text-sm ${step === "" ? "h-2" : "mb-1"}`}>
                                  {step === "" ? "" : (
                                    <span className={step.startsWith("Step") ? "font-semibold text-blue-600" : 
                                                   step.startsWith("•") ? "text-gray-600 ml-2" : 
                                                   "text-gray-700"}>{step}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // NEW FUNDING SOURCES STATE
  const [fundingSources, setFundingSources] = useState(() => {
    const saved = localStorage.getItem('fundingSources');
    return saved ? JSON.parse(saved) : {
      taiwaneseLoan: { 
        amount: 300000, 
        rate: 0.028, 
        term: 10, 
        enabled: true,
        type: 'debt',
        description: 'USD loan from Taiwan'
      },
      houseEquity: { 
        amount: 98273, 
        rate: 0.08, 
        term: 15, 
        enabled: true,
        type: 'debt',
        description: 'Home equity loan (tax deductible for business use)'
      },
      sbaLoan: { 
        amount: 0, 
        rate: 0.115, 
        term: 10, 
        enabled: false,
        type: 'debt',
        description: 'SBA 7(a) business acquisition loan'
      },
      sellerFinancing: { 
        amount: 0, 
        rate: 0.08, 
        term: 5, 
        enabled: false,
        type: 'debt',
        description: 'Seller note (subordinated)'
      },
      additionalInvestment: { 
        amount: 50000, 
        expectedReturn: 0.15, 
        enabled: true,
        type: 'equity',
        description: 'Outside investor equity (dilutes ownership)'
      },
      personalCash: { 
        amount: 50000, 
        opportunityCost: 0.08, 
        enabled: true,
        type: 'equity',
        description: 'Personal cash investment'
      }
    };
  });

  // Info popup state
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef(null);

  // Custom target revenue state
  const [customTargetRevenue, setCustomTargetRevenue] = useState(3500000);

  const [variables, setVariables] = useState(() => {
    const saved = localStorage.getItem('variables');
    const savedVariables = saved ? JSON.parse(saved) : DEFAULT_SCENARIO.variables;
    
    // Ensure new variables are present (for backward compatibility)
    return {
      ...DEFAULT_SCENARIO.variables,
      ...savedVariables
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fundingSources', JSON.stringify(fundingSources));
  }, [fundingSources]);

  useEffect(() => {
    localStorage.setItem('variables', JSON.stringify(variables));
  }, [variables]);

  // Validation function to catch calculation errors - MUST BE DEFINED BEFORE ANY USEMEMO
  const validateScenario = (scenario) => {
    const errors = [];
    
    if (isNaN(scenario.targetRevenue) || scenario.targetRevenue <= 0) {
      errors.push('Business revenue is invalid');
    }
    
    if (isNaN(scenario.ebitda) || scenario.ebitda <= 0) {
      errors.push('EBITDA calculation is invalid');
    }
    
    if (isNaN(scenario.purchasePrice) || scenario.purchasePrice <= 0) {
      errors.push('Purchase price calculation is invalid');
    }
    
    if (scenario.wacc > 50) {
      errors.push(`WACC too high: ${scenario.wacc}% (should be 7-12%)`);
    }
    
    if (scenario.downPaymentNeeded < scenario.purchasePrice * 0.15) {
      errors.push('Down payment unrealistically low');
    }
    
    if (errors.length > 0) {
      console.error('❌ Calculation Errors:', errors);
    } else {
  
    }
    
    return errors;
  };

  // NEW CALCULATION FUNCTIONS
  // Calculate monthly payment for any loan
  const calculateLoanPayment = (principal, rate, termYears) => {
    if (principal <= 0 || rate <= 0) return 0;
    const monthlyRate = rate / 12;
    const payments = termYears * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
           (Math.pow(1 + monthlyRate, payments) - 1) * 12; // Return annual payment
  };

  // Fix WACC calculation - use decimal rates, not percentages!
  const calculateWACC = (fundingSources, taxRate = 0.25) => {
    let totalCapital = 0;
    let weightedCost = 0;
    
    // Include only enabled funding sources with amounts
    Object.entries(fundingSources).forEach(([key, source]) => {
      if (source.enabled && source.amount > 0) {
        totalCapital += source.amount;
        
        // CRITICAL: Use decimal rates, not percentages!
        let costRate;
        if (key === 'taiwaneseLoan') costRate = 0.028; // 2.8% (personal loan)
        else if (key === 'houseEquity') costRate = 0.08; // 8% (personal loan)
        else if (key === 'sbaLoan') costRate = 0.115 * (1 - taxRate); // 11.5% after tax (business deductible)
        else if (key === 'sellerFinancing') costRate = 0.08 * (1 - taxRate * 0.5); // 8% after partial tax (less deductible)
        else if (key === 'additionalInvestment') costRate = 0.20; // 20% equity cost (investor expected return)
        else if (key === 'personalCash') costRate = 0.08; // 8% opportunity cost
        else costRate = 0.08; // Default
        
        weightedCost += source.amount * costRate;
      }
    });
    
    const wacc = totalCapital > 0 ? (weightedCost / totalCapital) : 0;
    return wacc * 100; // Convert to percentage for display
  };







  // Calculate key parameters for three scenarios
  const keyParameters = useMemo(() => {
    // Fix available cash calculation to only include specific funding sources
    const totalAvailableCash = (
      (fundingSources.taiwaneseLoan.enabled ? fundingSources.taiwaneseLoan.amount : 0) +
      (fundingSources.houseEquity.enabled ? fundingSources.houseEquity.amount : 0) +
      (fundingSources.additionalInvestment.enabled ? fundingSources.additionalInvestment.amount : 0) +
      (fundingSources.personalCash.enabled ? fundingSources.personalCash.amount : 0)
    );
    
    const scenarios = [
      { targetRevenue: 2000000, name: "Small Business" },
      { targetRevenue: 2500000, name: "Target Business" },
      { targetRevenue: 3000000, name: "Large Business" },
      { targetRevenue: customTargetRevenue, name: "Custom Business" }
    ];

    return scenarios.map(scenario => {
      // Step 1: Calculate EBITDA using current variable values (not mean)
      const netMargin = variables.netProfitMargin || 25;
      const valuationMultiple = variables.valuationMultiple || 4;
      const sellerFinancingPercent = variables.sellerFinancing ?? 20;
      const revenueGrowthRate = variables.revenueGrowthRate ?? 8;
      const sbaDownPaymentPercent = Math.max(variables.sbaDownPayment || 12, 10);
      
      const ebitda = scenario.targetRevenue * (netMargin / 100);
      const purchasePrice = ebitda * valuationMultiple;
      
      // Step 2: Calculate proper down payment structure
      // CORRECTED LOGIC: Calculate seller financing first, then SBA loan, then down payment
      const sellerFinancingAmount = purchasePrice * (sellerFinancingPercent / 100);
      const sbaLoanAmount = purchasePrice - sellerFinancingAmount;
      const sbaDownPayment = sbaLoanAmount * (sbaDownPaymentPercent / 100);
      
      // Note: Total financing may exceed purchase price if both SBA and seller financing are used
      // This is typical in SBA deals where seller financing is additional to SBA loan
      
      // Step 3: Add working capital and fees
      const workingCapitalPercent = variables.workingCapital || 10;
      const workingCapital = scenario.targetRevenue * (workingCapitalPercent / 100);
      const fees = purchasePrice * 0.025; // 2.5% total fees
      
      const totalDownPaymentNeeded = sbaDownPayment + workingCapital + fees;
      

      
      return {
        ...scenario,
        ebitda: Math.round(ebitda),
        purchasePrice: Math.round(purchasePrice),
        availableCash: totalAvailableCash,
        downPaymentNeeded: Math.round(totalDownPaymentNeeded),
        sbaDownPayment: Math.round(sbaDownPayment),
        sbaLoanAmount: Math.round(sbaLoanAmount),
        sellerFinancingAmount: Math.round(sellerFinancingAmount),
        workingCapital: Math.round(workingCapital),
        fees: Math.round(fees),
        cashSurplusDeficit: Math.round(totalAvailableCash - totalDownPaymentNeeded)
      };
    });
  }, [fundingSources, variables, customTargetRevenue]);

  // Calculate results for all three scenarios with priority-based funding
  const allResults = useMemo(() => {
    const targetRevenues = [2000000, 2500000, 3000000, customTargetRevenue];
    const scenarioNames = ["Small Business", "Target Business", "Large Business", "Custom Business"];
    
    return calculateScenariosWithPriority(targetRevenues, variables, fundingSources).map((scenario, index) => {
      // Calculate additional metrics using existing functions
      const cashRequired = calculateTotalCashRequired({
        purchasePrice: scenario.purchasePrice,
        sbaDownPaymentPercent: variables.sbaDownPayment,
        sellerFinancingPercent: variables.sellerFinancing,
        workingCapitalPercent: variables.workingCapital,
        targetRevenue: scenario.targetRevenue,
        techInvestment: variables.techInvestment
      });

      const cashFlow = calculateAnnualCashToPocket({
        targetRevenue: scenario.targetRevenue,
        netProfitMarginPercent: variables.netProfitMargin,
        sbaLoanAmount: scenario.purchaseFinancing.sbaLoanAmount,
        sellerFinancingAmount: scenario.purchaseFinancing.sellerFinancingAmount,
        managementSalary: variables.managementSalary,
        techInvestment: variables.techInvestment
      });

      // Calculate 5-year projections for advanced metrics
      const fiveYearProjections = calculateFiveYearProjections({
        targetRevenue: scenario.targetRevenue,
        revenueGrowthRatePercent: variables.revenueGrowthRate,
        netProfitMarginPercent: variables.netProfitMargin,
        sbaLoanAmount: scenario.purchaseFinancing.sbaLoanAmount,
        sellerFinancingAmount: scenario.purchaseFinancing.sellerFinancingAmount,
        managementSalary: variables.managementSalary,
        techInvestment: variables.techInvestment,
        sbaInterestRate: variables.sbaInterestRate,
        sellerInterestRate: variables.sellerInterestRate
      });

      // Calculate advanced return metrics using personal investment base
      const personalInvestmentBase = 
        scenario.fundingAllocation.allocation.personalCash + 
        scenario.fundingAllocation.allocation.taiwaneseLoan + 
        scenario.fundingAllocation.allocation.houseEquity;
      const irr = calculateIRR(personalInvestmentBase, fiveYearProjections.map(p => p.cashFlow));
      const moic = calculateMOIC(personalInvestmentBase, fiveYearProjections);
      const paybackPeriod = calculatePaybackPeriod(personalInvestmentBase, fiveYearProjections);

      // Calculate 6-year projections
      const projections = [];
      let currentRevenue = scenario.targetRevenue;
      let cumulativeCashFlow = 0;

      for (let year = 1; year <= 6; year++) {
        const ebitda = currentRevenue * (variables.netProfitMargin / 100);
        const sbaPayment = calculateLoanPayment(scenario.purchaseFinancing.sbaLoanAmount, variables.sbaInterestRate / 100, 10);
        const sellerPayment = calculateLoanPayment(scenario.purchaseFinancing.sellerFinancingAmount, variables.sellerInterestRate / 100, 5);
        const techInvestmentAmortized = variables.techInvestment / 3;

        const netCashFlow = ebitda - sbaPayment - sellerPayment - variables.managementSalary - techInvestmentAmortized;
        cumulativeCashFlow += netCashFlow;

        projections.push({
          year,
          revenue: currentRevenue,
          ebitda,
          netCashFlow,
          cumulativeCashFlow
        });

        currentRevenue *= (1 + variables.revenueGrowthRate / 100);
      }
      
      // Log 6-Year Projections
      if (DEBUG_METRICS) {
        console.group("📊 Growth Projections - 6-Year Cash Flow");
        
        for (let year = 1; year <= 6; year++) {
          const yearData = projections[year - 1];
          console.log(`📅 YEAR ${year}:`);
          console.log(`  Revenue: ${yearData.revenue}`);
          console.log(`  EBITDA: ${yearData.ebitda}`);
          console.log(`  Net Cash Flow: ${yearData.netCashFlow}`);
          console.log(`  Cumulative Cash Flow: ${yearData.cumulativeCashFlow}`);
          console.log(`  Growth Rate: Revenue +${variables.revenueGrowthRate}%`);
          console.log(`---`);
        }
        
        console.log(`📋 ASSUMPTIONS:`);
        console.log(`  Annual Revenue Growth: ${variables.revenueGrowthRate}%`);
        console.log(`  Net Profit Margin: ${variables.netProfitMargin}%`);
        console.log(`  Management Salary: ${variables.managementSalary}`);
        console.log(`  Tech Investment: ${variables.techInvestment} (amortized over 3 years)`);
        
        console.groupEnd();
      }

      // Calculate ROI
      const totalInvestment = cashRequired.total;
      const sixYearCashFlow = projections[5].cumulativeCashFlow;
      const roi = ((sixYearCashFlow - totalInvestment) / totalInvestment) * 100;

      // Calculate additional metrics
      const debtServiceCoverage = scenario.businessDebtService.totalBusinessDebtService > 0 ? 
        scenario.ebitda / scenario.businessDebtService.totalBusinessDebtService : 0;
      const cashOnCashReturn = calculateCashOnCashReturn(cashFlow.netCashFlow, personalInvestmentBase);
      const riskScore = calculateEnhancedRiskScore(debtServiceCoverage, cashOnCashReturn, variables.sellerFinancing);
      
      // Log Business DSCR calculation
      if (DEBUG_METRICS) {
        logMetricCalculation(
          "Business Health",
          "Business DSCR",
          {
            businessEBITDA: scenario.ebitda,
            businessDebtService: scenario.businessDebtService.totalBusinessDebtService
          },
          "Business DSCR = Business EBITDA ÷ Business Debt Service",
          debtServiceCoverage,
          {
            debtServiceComponents: "SBA + Seller Financing only (excludes personal debt)",
            calculation: `${scenario.ebitda} ÷ ${scenario.businessDebtService.totalBusinessDebtService} = ${debtServiceCoverage}x`
          }
        );
      }
      
      // Log Cash-on-Cash Return calculation
      if (DEBUG_METRICS) {
        logMetricCalculation(
          "Personal Returns",
          "Cash-on-Cash Return",
          {
            yourNetAnnualGain: cashFlow.netCashFlow,
            yourCashInvested: personalInvestmentBase
          },
          "Cash-on-Cash = Annual Cash Flow ÷ Your Cash Invested",
          cashOnCashReturn,
          {
            definition: "Return on actual cash invested (excluding leverage)",
            calculation: `${cashFlow.netCashFlow} ÷ ${personalInvestmentBase} = ${cashOnCashReturn}%`
          }
        );
      }

      // Business capital invested
      const businessCapitalInvested = scenario.purchasePrice + 
        (scenario.targetRevenue * variables.workingCapital / 100) + 
        (scenario.purchasePrice * 0.015) + // Due diligence
        (scenario.purchasePrice * 0.008); // Professional fees

      // Business EVA
      const businessEVA = calculateBusinessEVA(scenario.ebitda, businessCapitalInvested, scenario.wacc / 100);
      
      // Log Business EVA calculation
      if (DEBUG_METRICS) {
        logMetricCalculation(
          "Business Health",
          "Economic Value Added",
          {
            businessEBITDA: scenario.ebitda,
            taxRate: 0.25,
            businessCapitalInvested,
            wacc: scenario.wacc
          },
          "EVA = NOPAT - Capital Charge = EBITDA × (1 - Tax Rate) - (Capital × WACC)",
          businessEVA,
          {
            nopat: scenario.ebitda * (1 - 0.25),
            capitalCharge: businessCapitalInvested * (scenario.wacc / 100),
            calculation: `${scenario.ebitda} × (1 - 0.25) - (${businessCapitalInvested} × ${scenario.wacc}%) = ${businessEVA}`
          }
        );
      }

      // Deal ROI (business level)
      const dealROI = scenario.purchasePrice > 0 ? (scenario.businessCashFlow / scenario.purchasePrice) * 100 : 0;

      // Personal cash invested
      const personalCashInvested = 
        scenario.fundingAllocation.allocation.personalCash + 
        scenario.fundingAllocation.allocation.taiwaneseLoan + 
        scenario.fundingAllocation.allocation.houseEquity;

      // Validate calculations before returning
      const validationErrors = validateScenario({
        targetRevenue: scenario.targetRevenue,
        ebitda: scenario.ebitda,
        purchasePrice: scenario.purchasePrice,
        wacc: scenario.wacc,
        downPaymentNeeded: scenario.totalCashNeeded
      });

      return {
        scenario: scenarioNames[index],
        cashRequired,
        cashFlow,
        financing: {
          purchasePrice: scenario.purchasePrice,
          sellerFinancing: scenario.purchaseFinancing.sellerFinancingAmount,
          sbaLoanAmount: scenario.purchaseFinancing.sbaLoanAmount,
          downPayment: scenario.purchaseFinancing.sbaDownPayment
        },
        projections,
        roi,
        // Enhanced metrics
        debtServiceCoverage,
        dscr: debtServiceCoverage,
        cashOnCashReturn,
        riskScore,
        sbaLoanPrincipal: scenario.purchaseFinancing.sbaLoanPrincipal,
        sbaMonthlyPayment: scenario.businessDebtService.sbaAnnualPayment / 12,
        sbaAnnualPayment: scenario.businessDebtService.sbaAnnualPayment,
        sellerMonthlyPayment: scenario.businessDebtService.sellerAnnualPayment / 12,
        sellerAnnualPayment: scenario.businessDebtService.sellerAnnualPayment,
        irr,
        moic,
        paybackPeriod,
        fiveYearProjections,
        
        // FUNDING STRUCTURE WITH PRIORITY ALLOCATION
        activeFundingSources: Object.entries(scenario.fundingAllocation.allocation)
          .filter(([_, amount]) => amount > 0)
          .reduce((acc, [key, amount]) => {
            acc[key] = {
              amount,
              enabled: true,
              type: key === 'additionalInvestment' || key === 'personalCash' ? 'equity' : 'debt',
              rate: key === 'taiwaneseLoan' ? 0.028 : 
                    key === 'houseEquity' ? 0.08 : 
                    key === 'sbaLoan' ? 0.115 : 
                    key === 'sellerFinancing' ? 0.08 : 0,
              term: key === 'taiwaneseLoan' ? 10 : 
                     key === 'houseEquity' ? 15 : 
                     key === 'sbaLoan' ? 10 : 
                     key === 'sellerFinancing' ? 5 : 0,
              annualPayment: key === 'taiwaneseLoan' ? scenario.personalDebtService.taiwanesePayment :
                            key === 'houseEquity' ? scenario.personalDebtService.houseEquityPayment :
                            key === 'sbaLoan' ? scenario.businessDebtService.sbaAnnualPayment :
                            key === 'sellerFinancing' ? scenario.businessDebtService.sellerAnnualPayment : 0
            };
            return acc;
          }, {}),
        totalFunding: scenario.fundingAllocation.totalAllocated,
        totalDebtService: (scenario.businessDebtService?.totalBusinessDebtService || 0) + (scenario.personalDebtService?.totalPersonalDebtService || 0),
        totalPersonalEquity: scenario.fundingAllocation.allocation.personalCash + scenario.fundingAllocation.allocation.taiwaneseLoan + scenario.fundingAllocation.allocation.houseEquity,
        totalAdditionalEquity: scenario.fundingAllocation.allocation.additionalInvestment,
        ownershipPercentage: scenario.ownership.yourOwnership,
        wacc: scenario.wacc,
        personalCostOfCapital: scenario.personalCostOfCapital,
        
        // BUSINESS-LEVEL METRICS
        businessFreeCashFlow: Math.round(scenario.businessCashFlow),
        businessDebtService: Math.round(scenario.businessDebtService.totalBusinessDebtService),
        businessDSCR: scenario.businessDebtService.totalBusinessDebtService > 0 ? scenario.ebitda / scenario.businessDebtService.totalBusinessDebtService : 0,
        businessEVA: Math.round(businessEVA),
        businessWACC: scenario.wacc,
        businessCapitalInvested: Math.round(businessCapitalInvested),
        dealROI: dealROI,
        
        // PERSONAL-LEVEL METRICS
        personalCashFlow: Math.round(scenario.personalNetCashFlow),
        ownerCashFlow: Math.round(scenario.personalNetCashFlow),
        personalROI: scenario.personalROI,
        ownerROI: scenario.personalROI,
        personalDebtService: Math.round(scenario.personalDebtService.totalPersonalDebtService),
        personalCashInvested: Math.round(personalCashInvested),
        ownerDistribution: Math.round(scenario.ownerDistribution),
        ownershipDilution: scenario.ownership.investorOwnership * 100,
        investorOwnership: scenario.ownership.investorOwnership,
        
        // OWNERSHIP BREAKDOWN
        ownershipBreakdown: scenario.ownership.breakdown,
        
        // VALIDATION
        validationErrors,
        
        // PRIORITY ALLOCATION DATA
        fundingAllocation: scenario.fundingAllocation,
        purchaseFinancing: scenario.purchaseFinancing,
        businessDebtService: scenario.businessDebtService,
        personalDebtService: scenario.personalDebtService,
        ownership: scenario.ownership,
        businessCashFlow: scenario.businessCashFlow,
        ownerDistribution: scenario.ownerDistribution,
        personalNetCashFlow: scenario.personalNetCashFlow,
        targetRevenue: scenario.targetRevenue,
        ebitda: scenario.ebitda,
        purchasePrice: scenario.purchasePrice,
        totalCashNeeded: scenario.totalCashNeeded,
        
        // NEW METRICS CALCULATIONS
        // Section 1: Deal Structure & Financing
        capitalUtilizationRate: calculateCapitalUtilizationRate(scenario.fundingAllocation.totalAllocated, variables.availableCash || 750000),
        leverageMultiplier: calculateLeverageMultiplier(personalCashInvested, fundingSources.personalCash.amount),
        priceToRevenueRatio: calculatePriceToRevenueRatio(scenario.purchasePrice, scenario.targetRevenue),
        
        // Section 2: Business Health Metrics
        ebitdaMargin: calculateEBITDAMargin(scenario.ebitda, scenario.targetRevenue),
        businessCashConversion: calculateBusinessCashConversion(scenario.businessCashFlow, scenario.ebitda),
        revenueToInvestmentEfficiency: calculateRevenueToInvestmentEfficiency(scenario.targetRevenue, personalCashInvested),
        
        // Section 3: Personal Investment Returns
        riskAdjustedReturn: calculateRiskAdjustedReturn(scenario.personalROI, 4.5, riskScore),
                  incomeReplacementRatio: calculateIncomeReplacementRatio(scenario.personalNetCashFlow, variables.currentSalary ?? 100000),
        wealthBuildingVelocity: calculateWealthBuildingVelocity(moic, 5), // Based on actual MOIC from scenario
        
        // Section 4: Growth & Risk Projections
        exitValueRange: calculateExitValueRange(
          scenario.ebitda * Math.pow(1 + (variables.revenueGrowthRate || 5) / 100, 5), // Year 5 EBITDA
          scenario.ownership.yourOwnership
        ),
        stressTestResults: calculateStressTestResults(scenario.personalROI),
        growthFundingCapacity: calculateGrowthFundingCapacity(
          scenario.ebitda * 3, // Max sustainable debt (3x EBITDA)
          scenario.businessDebtService.totalBusinessDebtService + scenario.personalDebtService.totalPersonalDebtService,
          scenario.businessCashFlow * Math.pow(1 + (variables.revenueGrowthRate || 5) / 100, 3), // Year 3 cash flow
          calculateLeverageMultiplier(personalCashInvested, fundingSources.personalCash.amount)
        )
      };
      
      // Log Leverage Multiplier calculation
      if (DEBUG_METRICS) {
        const leverageMultiplier = calculateLeverageMultiplier(personalCashInvested, fundingSources.personalCash.amount);
        logMetricCalculation(
          "Deal Structure",
          "Leverage Multiplier",
          {
            totalInvestment: personalCashInvested,
            personalCashInvested: fundingSources.personalCash.amount
          },
          "Leverage Multiplier = Total Investment ÷ Personal Cash Invested",
          leverageMultiplier,
          {
            interpretation: leverageMultiplier >= 8 ? "Excellent leverage" : leverageMultiplier >= 5 ? "Good leverage" : leverageMultiplier >= 3 ? "Fair leverage" : "Poor leverage",
            calculation: `${personalCashInvested} ÷ ${fundingSources.personalCash.amount} = ${leverageMultiplier}x`
          }
        );
      }
      
      // Log Risk-Adjusted Return calculation
      if (DEBUG_METRICS) {
        const riskAdjustedReturn = calculateRiskAdjustedReturn(scenario.personalROI, 4.5, riskScore);
        logMetricCalculation(
          "Personal Returns",
          "Risk-Adjusted Return",
          {
            yourROI: scenario.personalROI,
            riskFreeRate: 4.5,
            riskScore
          },
          "Risk-Adjusted Return = (Your ROI - Risk-Free Rate) ÷ Risk Score",
          riskAdjustedReturn,
          {
            interpretation: riskAdjustedReturn >= 1.5 ? "Excellent risk-adjusted return" : riskAdjustedReturn >= 1.0 ? "Good risk-adjusted return" : riskAdjustedReturn >= 0.5 ? "Fair risk-adjusted return" : "Poor risk-adjusted return",
            calculation: `(${scenario.personalROI} - 4.5) ÷ ${riskScore} = ${riskAdjustedReturn}`
          }
        );
      }
      
      // Log W-2 Replacement calculation
      if (DEBUG_METRICS) {
        const incomeReplacementRatio = calculateIncomeReplacementRatio(scenario.personalNetCashFlow, variables.currentSalary ?? 100000);
        logMetricCalculation(
          "Personal Returns",
          "W-2 Replacement",
          {
            yourNetAnnualGain: scenario.personalNetCashFlow,
            currentSalary: variables.currentSalary ?? 100000
          },
          "W-2 Replacement = (Your Net Annual Gain ÷ Current Salary) × 100",
          incomeReplacementRatio,
          {
            interpretation: incomeReplacementRatio >= 120 ? "Excellent replacement" : incomeReplacementRatio >= 80 ? "Good replacement" : incomeReplacementRatio >= 40 ? "Fair replacement" : "Poor replacement",
            calculation: `(${scenario.personalNetCashFlow} ÷ ${variables.currentSalary ?? 100000}) × 100 = ${incomeReplacementRatio}%`
          }
        );
      }
      
      // Log Wealth Velocity calculation
      if (DEBUG_METRICS) {
        const wealthBuildingVelocity = calculateWealthBuildingVelocity(moic, 5);
        logMetricCalculation(
          "Personal Returns",
          "Wealth Velocity",
          {
            totalReturnMultiple: moic,
            investmentPeriod: 5
          },
          "Wealth Velocity = Annual wealth creation rate from total return multiple",
          wealthBuildingVelocity,
          {
            interpretation: wealthBuildingVelocity >= 80 ? "Excellent velocity" : wealthBuildingVelocity >= 40 ? "Good velocity" : wealthBuildingVelocity >= 20 ? "Fair velocity" : "Poor velocity",
            calculation: `Annual wealth creation from ${moic.toFixed(2)}x return over 5 years = ${wealthBuildingVelocity}%`
          }
        );
      }
    });
    
    // Log comprehensive summary for all scenarios
    if (DEBUG_METRICS) {
      console.group("📊 COMPREHENSIVE DASHBOARD SUMMARY");
      console.log("🎯 SCENARIOS ANALYZED:", allResults.length);
      
      allResults.forEach((result, index) => {
        console.group(`📋 SCENARIO ${index + 1}: ${result.scenario}`);
        console.log("🏢 DEAL STRUCTURE:");
        console.log(`  Purchase Price: ${formatCurrency(result.purchasePrice)}`);
        console.log(`  Available Cash: ${formatCurrency(result.availableCash || 750000)}`);
        console.log(`  Cash Surplus: ${formatCurrency(result.cashSurplus || 0)}`);
        console.log(`  WACC: ${result.wacc?.toFixed(2) || 0}%`);
        
        console.log("📈 BUSINESS HEALTH:");
        console.log(`  DSCR: ${result.businessDSCR?.toFixed(2) || 0}x`);
        console.log(`  ROA: ${result.businessROA?.toFixed(2) || 0}%`);
        console.log(`  EVA: ${formatCurrency(result.businessEVA || 0)}`);
        
        console.log("💰 PERSONAL RETURNS:");
        console.log(`  Your ROI: ${result.personalROI?.toFixed(2) || 0}%`);
        console.log(`  Cash-on-Cash: ${result.cashOnCashReturn?.toFixed(2) || 0}%`);
        console.log(`  Payback: ${result.paybackPeriod || '>5 years'}`);
        
        console.log("📊 KEY ASSUMPTIONS:");
        console.log(`  Target Revenue: ${formatCurrency(result.targetRevenue)}`);
        console.log(`  Net Profit Margin: ${variables.netProfitMargin}%`);
        console.log(`  Valuation Multiple: ${variables.valuationMultiple}x`);
        console.log(`  Revenue Growth: ${variables.revenueGrowthRate}%`);
        console.log(`  Working Capital %: ${variables.workingCapital}%`);
        console.log(`  Management Salary: ${formatCurrency(variables.managementSalary)}`);
        console.groupEnd();
      });
      
      console.groupEnd();
    }
  }, [variables, fundingSources, customTargetRevenue]);

  const handleFundingSourceChange = useCallback((sourceKey, field, value) => {
    setFundingSources(prev => ({
      ...prev,
      [sourceKey]: { ...prev[sourceKey], [field]: value }
    }));
  }, []);

  const handleVariableChange = useCallback((variableKey, value) => {
    setVariables(prev => ({ ...prev, [variableKey]: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setFundingSources({
      taiwaneseLoan: { 
        amount: 300000, 
        rate: 0.028, 
        term: 10, 
        enabled: true,
        type: 'debt',
        description: 'USD loan from Taiwan'
      },
      houseEquity: { 
        amount: 98273, 
        rate: 0.08, 
        term: 15, 
        enabled: true,
        type: 'debt',
        description: 'Home equity loan (tax deductible for business use)'
      },
      sbaLoan: { 
        amount: 0, 
        rate: 0.115, 
        term: 10, 
        enabled: false,
        type: 'debt',
        description: 'SBA 7(a) business acquisition loan'
      },
      sellerFinancing: { 
        amount: 0, 
        rate: 0.08, 
        term: 5, 
        enabled: false,
        type: 'debt',
        description: 'Seller note (subordinated)'
      },
      additionalInvestment: { 
        amount: 50000, 
        expectedReturn: 0.15, 
        enabled: true,
        type: 'equity',
        description: 'Outside investor equity (dilutes ownership)'
      },
      personalCash: { 
        amount: 50000, 
        opportunityCost: 0.08, 
        enabled: true,
        type: 'equity',
        description: 'Personal cash investment'
      }
    });
    setVariables(DEFAULT_SCENARIO.variables);
  }, []);

  // Info Tooltip Component with Auto-Positioning
  const InfoTooltip = ({ formula, children }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: true, left: true });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    
    const calculatePosition = useCallback(() => {
      if (!triggerRef.current || !tooltipRef.current) return;
      
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate available space in each direction
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;
      
      // Determine vertical position (prefer below, fallback to above)
      const shouldShowAbove = spaceBelow < tooltipRect.height && spaceAbove > tooltipRect.height;
      
      // Determine horizontal position (prefer center, fallback to left/right)
      let horizontalPosition = 'center';
      if (spaceRight < tooltipRect.width / 2) {
        horizontalPosition = 'left';
      } else if (spaceLeft < tooltipRect.width / 2) {
        horizontalPosition = 'right';
      }
      
      // Ensure tooltip doesn't go off-screen
      if (tooltipRect.width > viewportWidth) {
        horizontalPosition = 'center';
      }
      
      setTooltipPosition({
        top: !shouldShowAbove,
        left: horizontalPosition === 'left',
        center: horizontalPosition === 'center',
        right: horizontalPosition === 'right'
      });
    }, []);
    
    // Add window resize and scroll listeners
    useEffect(() => {
      const handleResize = () => {
        if (showTooltip) {
          calculatePosition();
        }
      };
      
      const handleScroll = () => {
        if (showTooltip) {
          calculatePosition();
        }
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }, [showTooltip, calculatePosition]);
    
    const handleMouseEnter = () => {
      setShowTooltip(true);
      // Calculate position after tooltip is rendered
      setTimeout(calculatePosition, 0);
    };
    
    const handleMouseLeave = () => {
      setShowTooltip(false);
    };
    
    return (
      <div className="relative inline-block">
        <div 
          ref={triggerRef}
          className="inline-flex items-center gap-1 cursor-help"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
          {!children && <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />}
        </div>
        {showTooltip && (
          <div 
            ref={tooltipRef}
            className={`absolute z-50 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-md max-h-96 overflow-auto ${
              tooltipPosition.top 
                ? 'top-full mt-2' 
                : 'bottom-full mb-2'
            } ${
              tooltipPosition.center 
                ? 'left-1/2 transform -translate-x-1/2' 
                : tooltipPosition.left 
                ? 'left-0' 
                : 'right-0'
            }`}
            style={{
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: 'calc(100vh - 2rem)'
            }}
          >
            <div className="font-medium mb-2">Description:</div>
            <div className="whitespace-pre-wrap leading-relaxed">{formula}</div>
            {/* Arrow pointing to trigger */}
            <div className={`absolute w-0 h-0 border-l-4 border-r-4 border-transparent ${
              tooltipPosition.top 
                ? 'bottom-full left-1/2 transform -translate-x-1/2 border-b-4 border-b-gray-900' 
                : 'top-full left-1/2 transform -translate-x-1/2 border-t-4 border-t-gray-900'
            }`}></div>
          </div>
        )}
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // All metrics data
  const allMetricsData = [
      {
        section: "Deal Structure",
        metrics: [
          {
            name: "Purchase Price",
            formula: "Purchase Price = Target Revenue × Net Profit Margin % × Valuation Multiple"
          },
          {
            name: "SBA Down Payment",
            formula: "SBA Down Payment = (Purchase Price - Seller Financing Amount) × SBA Down Payment %\n\nThis is the minimum cash required for the SBA loan."
          },
          {
            name: "Down Payment Needed",
            formula: "Down Payment Needed = SBA Down Payment + Working Capital + Fees\n\nIncludes:\n• SBA Down Payment\n• Working Capital (7.9% of revenue)\n• Due Diligence & Professional Fees (2.5% of purchase price)"
          },
          {
            name: "Available Cash",
            formula: "Available Cash = Sum of all enabled funding sources:\n\n• Taiwanese Loan (2.8%)\n• Personal Cash (8.0%)\n• Additional Investment (15.0%)\n• Home Equity (8.0%)"
          },
          {
            name: "Cash Surplus/Deficit",
            formula: "Cash Surplus/Deficit = Available Cash - Down Payment Needed\n\nPositive (Green): You have sufficient cash for the acquisition\nNegative (Red): You need additional funding or must reduce deal size"
          },
          {
            name: "WACC",
            formula: "WACC = Weighted Average Cost of Capital\nIncludes ALL funding sources with after-tax rates:\n• Taiwanese Loan: 2.1% after-tax\n• Personal Cash: 6% after-tax\n• Additional Investment: 15% (equity cost)\n• Home Equity: 6% after-tax"
          },
          {
            name: "Your Personal Cost",
            formula: "Your Personal Cost of Capital\nWeighted average of your personal funding sources:\n• Taiwanese Loan: 2.8%\n• Personal Cash: 8% (opportunity cost)\n• Home Equity: 8%"
          },
          {
            name: "Your Ownership",
            formula: "Risk-adjusted ownership based on personal guarantees, asset risk, and sweat equity"
          },
          {
            name: "Monthly Business Debt Payment",
            formula: "Monthly Business Debt Payment = (SBA Annual Payment + Seller Financing Annual Payment) / 12"
          },
          {
            name: "Monthly Personal Debt Payment",
            formula: "Monthly Personal Debt Payment = (Taiwanese Loan Annual Payment + Home Equity Annual Payment) / 12"
          },
          {
            name: "Capital Utilization Rate",
            formula: "Capital Utilization Rate = Total Allocated Funding ÷ Available Cash × 100\n\nMeasures percentage of available funding deployed in the deal. Lower utilization provides safety margin for unexpected costs."
          },
          {
            name: "Leverage Multiplier",
            formula: "Leverage Multiplier = Total Investment ÷ Personal Cash Invested\n\nShows how effectively you're using leverage to amplify investment capacity. Higher multipliers indicate better capital efficiency."
          },
          {
            name: "Price-to-Revenue",
            formula: "Price-to-Revenue = Purchase Price ÷ Target Annual Revenue\n\nMeasures deal efficiency relative to business size. Lower ratios indicate better value deals."
          }
        ]
      },
      {
        section: "Business Health",
        metrics: [
          {
            name: "Business Debt Service",
            formula: "Business Debt Service = SBA Annual Payment + Seller Financing Annual Payment\nSBA: 11.5% rate, 10-year term\nSeller: 8% rate, 5-year term"
          },
          {
            name: "Economic Value Added",
            formula: "Economic Value Added = NOPAT - Capital Charge\nNOPAT = EBITDA × (1 - Tax Rate)\nCapital Charge = Business Capital Invested × WACC"
          },
          {
            name: "Business DSCR",
            formula: "Business DSCR = EBITDA / Business Debt Service (SBA + Seller only)"
          },
          {
            name: "Business ROA",
            formula: "Business ROA = (Business Free Cash Flow / Business Capital Invested) × 100\nBusiness Capital = Purchase Price + Working Capital + Due Diligence + Professional Fees"
          },
          {
            name: "Debt-to-EBITDA Ratio",
            formula: "Debt-to-EBITDA Ratio = Total Business Debt ÷ EBITDA"
          },
          {
            name: "Interest Coverage Ratio",
            formula: "Interest Coverage Ratio = EBITDA ÷ Interest Payments"
          },
          {
            name: "EBITDA Margin",
            formula: "EBITDA Margin = Business EBITDA ÷ Business Revenue × 100\n\nMeasures operational profitability before financing and tax effects. Higher margins indicate more efficient operations and better value creation potential."
          },
          {
            name: "Business Cash Conversion",
            formula: "Business Cash Conversion = Business Free Cash Flow ÷ Business EBITDA × 100\n\nShows how efficiently EBITDA converts to actual cash flow. Higher conversion indicates better working capital management."
          },
          {
            name: "Revenue-to-Investment Efficiency",
            formula: "Revenue-to-Investment Efficiency = Target Revenue ÷ Your Total Investment\n\nMeasures business scale relative to capital deployed. Higher ratios indicate more efficient capital deployment."
          }
        ]
      },
      {
        section: "Personal Returns",
        metrics: [
          {
            name: "Your ROI",
            formula: "Your ROI = (Your Net Annual Gain ÷ Your Total Cash Invested) × 100\nYour Total Cash Invested = Personal Cash + Taiwanese Loan + Home Equity"
          },
          {
            name: "Cash-on-Cash Return",
            formula: "Cash-on-Cash Return = Annual Cash Flow ÷ Your Cash Invested"
          },
          {
            name: "Payback Period",
            formula: "Payback Period = Your Total Investment ÷ Your Net Annual Gain"
          },
          {
            name: "Risk-Adjusted Return",
            formula: "Risk-Adjusted Return = (Your ROI - Risk-Free Rate) ÷ Risk Score\n\nMeasures return per unit of risk taken. Higher ratios indicate better risk-adjusted performance compared to safe investments."
          },
          {
            name: "Income Replacement Ratio",
            formula: "Income Replacement Ratio = Your Net Annual Gain ÷ Current Salary × 100\n\nShows percentage of current employment income replaced by business cash flows. Higher ratios indicate faster transition to business ownership."
          },
          {
            name: "Wealth Building Velocity",
            formula: "Wealth Building Velocity = Annual Wealth Creation Rate\n\nMeasures how fast your investment builds wealth compared to traditional investments. Based on total return projections including exit value."
          }
        ]
      },
      {
        section: "Growth & Risk Projections",
        metrics: [
          {
            name: "5-Year Exit Value Scenarios",
            formula: "5-Year Exit Value Range = Year 5 EBITDA × Valuation Multiple × Your Ownership %\n\nProjects potential business sale value in 5 years under different market scenarios. Includes cumulative cash flows received during ownership period.\n\nAssumptions:\n• Year 5 EBITDA (5% annual growth)\n• Your Ownership percentage\n• Multiple Range: 3.0x (recession) to 4.5x (growth market)\n\nTotal Return = Exit Value + 5-Year Cumulative Cash Flows\n\nConservative includes potential market downturns\nExpected assumes current market conditions continue  \nOptimistic reflects strong business performance and market growth"
          },
          {
            name: "Stress Test Results",
            formula: "Stress Test Results = ROI Under Adverse Scenarios\n\nTests investment performance under various economic stress conditions to assess downside protection and resilience.\n\nTest Scenarios:\n• Revenue Decline: -20% from base case\n• Margin Compression: -300 basis points EBITDA margin\n• Interest Rate Rise: +200 basis points on variable debt\n\nMinimum ROI shows worst-case scenario performance\nTarget: Maintain >7% ROI (market minimum) under stress\n\nStrong stress test results indicate robust investment with good downside protection"
          },
          {
            name: "Growth Funding Capacity",
            formula: "Growth Funding Capacity = Additional Sustainable Debt Capacity\n\nEstimates additional funding available for business growth, acquisitions, or expansion based on improved cash flows and debt capacity.\n\nCalculation Based On:\n• Improved DSCR from business growth\n• Conservative debt-to-EBITDA limits (<3.0x)\n• Projected Year 3+ cash flow performance\n\nUses Include:\n• Acquiring competitor businesses\n• Major expansion projects  \n• Equipment or technology investments\n• Working capital for growth\n\nHigher capacity indicates strong scalability potential and strategic flexibility"
          }
        ]
      }
    ];

  // Auto-focus search input when popup opens
  useEffect(() => {
    if (showInfoPopup && searchInputRef.current) {
      // Small delay to ensure the popup is fully rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showInfoPopup]);





  // Test calculation to verify formulas
  const testCalculation = useCallback(() => {
    const testScenario = {
      targetRevenue: 2500000,
      netProfitMargin: 25,
      valuationMultiple: 4,
      sbaLoanAmount: 1500000,
      sellerFinancingAmount: 500000,
      personalCash: 550000,
      additionalInvestment: 100000
    };
    
    const result = verifyCalculations(testScenario);
    
    // Verify results are in expected ranges
    const { testScenario: calc, expectedRanges } = result;
    
    return result;
  }, []);

  // Run test calculation on component mount
  useEffect(() => {
    testCalculation();
  }, [testCalculation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-6">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Acquisition Calculator</h1>
              <p className="text-sm text-gray-600 mt-1">Interactive tool for evaluating acquisition scenarios</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowInfoPopup(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Info className="w-4 h-4" />
                Info
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Two Panel Layout */}
      <div className="flex h-screen">
        {/* Left Panel - Controls */}
        <div className="w-1/3 bg-gray-50 p-6 overflow-y-auto">
          {/* Funding Sources Configuration */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Funding Sources Configuration</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(fundingSources).filter(([key, source]) => key !== 'sbaLoan' && key !== 'sellerFinancing').map(([key, source]) => (
                <div key={key} className="card p-3">
                  <div className="mb-1">
                    <div className="flex items-center gap-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {key === 'houseEquity' ? 'Home Equity' : 
                         key === 'sbaLoan' ? 'SBA Loan' : 
                         key === 'personalCash' ? 'Personal Cash' :
                         key === 'additionalInvestment' ? 'Additional Investment' :
                         key === 'taiwaneseLoan' ? 'Taiwanese Loan' :
                         key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <InfoTooltip formula={source.description}>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                      </InfoTooltip>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {/* Current Value Display */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-medium text-gray-700">Current: </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(source.amount)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <CustomSlider
                        value={source.amount}
                        onChange={(value) => handleFundingSourceChange(key, 'amount', value)}
                        min={0}
                        max={key === 'taiwaneseLoan' || key === 'houseEquity' ? 300000 : 
                             key === 'additionalInvestment' || key === 'personalCash' ? 100000 : 1000000}
                        step={25000}
                        unit="$"
                        color="blue"
                        showTooltip={false}
                      />
                    </div>
                    
                    {source.type === 'debt' && (
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-gray-500">Rate: {(source.rate * 100).toFixed(1)}% (after tax {key === 'houseEquity' ? (source.rate * 100).toFixed(1) : (source.rate * 0.75 * 100).toFixed(1)}%)</div>
                        <div className="text-gray-500">Term: {source.term} years</div>
                      </div>
                    )}
                    

                  </div>
                </div>
              ))}
            </div>
            

          </div>

          {/* Variable Controls */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Variable Controls</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(VARIABLES).map(([key, variable]) => (
                <VariableCard
                  key={key}
                  variableKey={key}
                  variable={variable}
                  value={variables[key]}
                  onValueChange={(value) => handleVariableChange(key, value)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="w-2/3 bg-white p-6 overflow-y-auto">

          {/* Scenario Comparison */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Scenario Comparison</h2>
            <div className="grid lg:grid-cols-4 gap-4">
              {keyParameters.map((scenario, index) => {
                return (
                  <div key={index} className="border border-gray-200 rounded p-4">
                    <div className="text-center mb-3">
                      <h3 className="text-sm text-gray-600">
                        {index === 3 ? "Custom Target Annual Revenue:" : "Target Annual Revenue:"}
                      </h3>
                      {index === 3 ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-gray-600">$</span>
                          <input
                            type="text"
                            value={customTargetRevenue.toLocaleString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                              setCustomTargetRevenue(value);
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                              setCustomTargetRevenue(value);
                            }}
                            className="text-lg font-bold text-gray-900 bg-transparent border-none outline-none text-center w-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded"
                            placeholder="3,500,000"
                            min="100000"
                            max="10000000"
                          />
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(scenario.targetRevenue)}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-center mb-0.5">
                          <InfoTooltip formula="Purchase Price = Target Revenue × Net Profit Margin % × Valuation Multiple\n\nExample: $2,000,000 × 20.7% × 4.1x = $1,697,400">
                            <span className="text-xs font-medium text-purple-800">Purchase Price</span>
                          </InfoTooltip>
                        </div>
                        <p className="text-sm font-bold text-purple-900 text-center">
                          {formatCurrency(scenario.purchasePrice)}
                        </p>
                      </div>
                      
                      <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-center mb-0.5">
                          <InfoTooltip formula="SBA Down Payment = (Purchase Price - Seller Financing Amount) × SBA Down Payment %\n\nExample: ($1,697,400 - $274,979) × 13% = $184,915\n\nThis is the minimum cash required for the SBA loan portion only.">
                            <span className="text-xs font-medium text-orange-800">SBA Down Payment</span>
                          </InfoTooltip>
                        </div>
                        <p className="text-sm font-bold text-orange-900 text-center">
                          {formatCurrency(scenario.sbaDownPayment)}
                        </p>
                      </div>
                      
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-center mb-0.5">
                          <InfoTooltip formula="Down Payment Needed = SBA Down Payment + Working Capital + Fees\n\nIncludes:\n• SBA Down Payment\n• Working Capital (7.9% of revenue)\n• Due Diligence & Professional Fees (2.5% of purchase price)\n\nThis is the total cash required for the acquisition.">
                            <span className="text-xs font-medium text-blue-800">Down Payment Needed</span>
                          </InfoTooltip>
                        </div>
                        <p className="text-sm font-bold text-blue-900 text-center">
                          {formatCurrency(scenario.downPaymentNeeded)}
                        </p>
                      </div>
                      
                      <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-center mb-0.5">
                          <InfoTooltip formula="Available Cash = Sum of all enabled funding sources:\n\n• Taiwanese Loan: $725,000 (2.8%)\n• Personal Cash: $550,000 (8.0%)\n• Additional Investment: $100,000 (15.0%)\n• Home Equity: $200,000 (8.0%)\n\nThis represents your total accessible capital for the acquisition.">
                            <span className="text-xs font-medium text-yellow-800">Available Cash</span>
                          </InfoTooltip>
                        </div>
                        <p className="text-sm font-bold text-yellow-900 text-center">
                          {formatCurrency(scenario.availableCash)}
                        </p>
                      </div>
                      
                      <div className={`p-2 rounded-lg border ${
                        scenario.cashSurplusDeficit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="text-center mb-0.5">
                          <InfoTooltip formula="Cash Surplus/Deficit = Available Cash - Down Payment Needed\n\nPositive (Green): You have sufficient cash for the acquisition\nNegative (Red): You need additional funding or must reduce acquisition costs\n\nThis determines if the deal is financially feasible with your current resources.">
                            <span className={`text-xs font-medium ${scenario.cashSurplusDeficit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                              Cash Surplus/Deficit
                            </span>
                          </InfoTooltip>
                        </div>
                        <p className={`text-sm font-bold text-center ${scenario.cashSurplusDeficit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                          {formatCurrency(scenario.cashSurplusDeficit)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deal Structure & Financing Display */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Deal Structure & Financing</h2>
            <div className="grid lg:grid-cols-4 gap-4">
              {allResults.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <div className="space-y-3">

                    
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-2">Funding Allocation</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Taiwanese Loan:</span>
                          <span className="font-medium">{formatCurrency(scenario.fundingAllocation?.allocation?.taiwaneseLoan || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Personal Cash:</span>
                          <span className="font-medium">{formatCurrency(scenario.fundingAllocation?.allocation?.personalCash || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Additional Investment:</span>
                          <span className="font-medium">{formatCurrency(scenario.fundingAllocation?.allocation?.additionalInvestment || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Seller Financing:</span>
                          <span className="font-medium">{formatCurrency(scenario.fundingAllocation?.allocation?.sellerFinancing || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Home Equity:</span>
                          <span className="font-medium">{formatCurrency(scenario.fundingAllocation?.allocation?.houseEquity || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SBA Loan:</span>
                          <span className="font-medium">{formatCurrency(scenario.fundingAllocation?.allocation?.sbaLoan || 0)}</span>
                        </div>
                        <div className="border-t pt-1 mt-1">
                          <div className="flex justify-between">
                            <span>Total Allocated:</span>
                            <span>{formatCurrency(scenario.fundingAllocation?.totalAllocated || 0)}</span>
                          </div>
                          {scenario.fundingAllocation?.downPaymentGap > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Funding Gap:</span>
                              <span>{formatCurrency(scenario.fundingAllocation.downPaymentGap)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-2">Financing Summary</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <InfoTooltip formula="WACC = Weighted Average Cost of Capital\nIncludes ALL funding sources with after-tax rates:\n• Taiwanese Loan: 2.1% after-tax\n• Personal Cash: 6% after-tax\n• Additional Investment: 15%\n• Seller Financing: 6% after-tax\n• Home Equity: 8%\n• SBA Loan: 8.6% after-tax">
                            <span>WACC:</span>
                          </InfoTooltip>
                          <span className="font-medium">{(scenario.wacc || 0).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <InfoTooltip formula="Your Personal Cost of Capital\nWeighted average of your personal funding sources:\n• Taiwanese Loan: 2.8%\n• Personal Cash: 8% (opportunity cost)\n• Home Equity: 8%">
                            <span>Your Personal Cost:</span>
                          </InfoTooltip>
                          <span className="font-medium">{(scenario.personalCostOfCapital || 0).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <InfoTooltip formula="Risk-adjusted ownership based on personal guarantees, asset risk, and sweat equity">
                            <span>Your Ownership:</span>
                          </InfoTooltip>
                          <span className="font-medium">{((scenario.ownershipPercentage || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Investor Ownership:</span>
                          <span className="font-medium">{((scenario.investorOwnership || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          Based on risk-adjusted contributions (Taiwanese Loan: 80%, Home Equity: 120%, Personal Cash: 100%). Control premium and sweat equity not considered.
                        </div>
                        <div className="flex justify-between">
                          <InfoTooltip formula="Monthly Business Debt Payment = (SBA Annual Payment + Seller Financing Annual Payment) / 12">
                            <span>Monthly Business Debt Payment:</span>
                          </InfoTooltip>
                          <span className="font-medium">{formatCurrency((scenario.businessDebtService.totalBusinessDebtService / 12))}</span>
                        </div>
                        <div className="flex justify-between">
                          <InfoTooltip formula="Monthly Personal Debt Payment = (Taiwanese Loan Annual Payment + Home Equity Annual Payment) / 12">
                            <span>Monthly Personal Debt Payment:</span>
                          </InfoTooltip>
                          <span className="font-medium">{formatCurrency((scenario.personalDebtService.totalPersonalDebtService / 12))}</span>
                        </div>
                        
                        {/* NEW METRICS - Section 1 */}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between">
                            <InfoTooltip formula="Capital Utilization Rate = Total Allocated Funding ÷ Available Cash × 100\n\nMeasures percentage of available funding deployed in the deal. Lower utilization provides safety margin for unexpected costs.\n\nExample: $516K allocated ÷ $750K available = 69%\n\nStandards:\n🔴 Critical: >95% (Minimal safety margin)\n🟡 Below Target: 85-95% (Limited flexibility)  \n🟢 Good: 65-85% (Balanced deployment)\n🔵 Excellent: <65% (High safety margin)">
                              <span>Capital Utilization:</span>
                            </InfoTooltip>
                            <span className={`font-medium ${getCapitalUtilizationStatus(scenario.capitalUtilizationRate).color === '#E74C3C' ? 'text-red-600' : getCapitalUtilizationStatus(scenario.capitalUtilizationRate).color === '#F1C40F' ? 'text-yellow-500' : getCapitalUtilizationStatus(scenario.capitalUtilizationRate).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                              {(scenario.capitalUtilizationRate || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-600 mt-1">
                            <span className="font-medium">Standard:</span> Critical &gt;95% | Below Target 85-95% | Good 65-85% | Excellent &lt;65%
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <InfoTooltip formula="Leverage Multiplier = Total Investment ÷ Personal Cash Invested\n\nShows how effectively you're using leverage to amplify investment capacity. Higher multipliers indicate better capital efficiency.\n\nExample: $516K total investment ÷ $50K personal cash = 10.3x\n\nStandards:\n🔴 Critical: <3x (Inefficient capital use)\n🟡 Below Target: 3-5x (Limited leverage)\n🟢 Good: 5-8x (Balanced leverage)\n🔵 Excellent: >8x (High capital efficiency)">
                            <span>Leverage Multiplier:</span>
                          </InfoTooltip>
                          <span className={`font-medium ${getLeverageMultiplierStatus(scenario.leverageMultiplier).color === '#E74C3C' ? 'text-red-600' : getLeverageMultiplierStatus(scenario.leverageMultiplier).color === '#F1C40F' ? 'text-yellow-500' : getLeverageMultiplierStatus(scenario.leverageMultiplier).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            {(scenario.leverageMultiplier || 0).toFixed(1)}x
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          <span className="font-medium">Standard:</span> Critical &lt;3x | Below Target 3-5x | Good 5-8x | Excellent &gt;8x
                        </div>
                        
                        <div className="flex justify-between">
                          <InfoTooltip formula="Price-to-Revenue = Purchase Price ÷ Target Annual Revenue\n\nMeasures deal efficiency relative to business size. Lower ratios indicate better value deals.\n\nExample: $2,147,000 purchase price ÷ $2,500,000 revenue = 0.86x\n\nStandards:\n🔴 Critical: >1.2x (Expensive relative to revenue)\n🟡 Below Target: 1.0-1.2x (Fair market pricing)\n🟢 Good: 0.8-1.0x (Good value)\n🔵 Excellent: <0.8x (Excellent value)">
                            <span>Price-to-Revenue:</span>
                          </InfoTooltip>
                          <span className={`font-medium ${getPriceToRevenueStatus(scenario.priceToRevenueRatio).color === '#E74C3C' ? 'text-red-600' : getPriceToRevenueStatus(scenario.priceToRevenueRatio).color === '#F1C40F' ? 'text-yellow-500' : getPriceToRevenueStatus(scenario.priceToRevenueRatio).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            {(scenario.priceToRevenueRatio || 0).toFixed(2)}x
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          <span className="font-medium">Standard:</span> Critical &gt;1.2x | Below Target 1.0-1.2x | Good 0.8-1.0x | Excellent &lt;0.8x
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Health Metrics */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Business Health Metrics</h2>
            <div className="grid lg:grid-cols-4 gap-4">
              {allResults.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Business Revenue:</span>
                      <span className="font-medium">{formatCurrency(scenario.targetRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Business EBITDA:</span>
                      <span className="font-medium">{formatCurrency(scenario.ebitda)}</span>
                    </div>
                    <div className="flex justify-between">
                      <InfoTooltip formula="Business Debt Service = SBA Annual Payment + Seller Financing Annual Payment\nSBA: 11.5% rate, 10-year term\nSeller: 8% rate, 5-year term">
                        <span>Business Debt Service:</span>
                      </InfoTooltip>
                      <span className="font-medium">{formatCurrency(scenario.businessDebtService.totalBusinessDebtService)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Business Free Cash Flow:</span>
                      <span className="font-medium">{formatCurrency(scenario.businessFreeCashFlow)}</span>
                    </div>
                    <div className="flex justify-between">
                      <InfoTooltip formula="Economic Value Added = NOPAT - Capital Charge\nNOPAT = EBITDA × (1 - Tax Rate)\nCapital Charge = Business Capital Invested × WACC">
                        <span>Economic Value Added:</span>
                      </InfoTooltip>
                      <span className="font-medium">
                        {formatCurrency(scenario.businessEVA)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <InfoTooltip formula="Business DSCR = EBITDA / Business Debt Service (SBA + Seller only)">
                        <span>Business DSCR:</span>
                      </InfoTooltip>
                      <span className={`font-medium ${scenario.businessDSCR < 1.25 ? 'text-red-600' : scenario.businessDSCR < 1.5 ? 'text-yellow-500' : scenario.businessDSCR < 2.0 ? 'text-green-600' : 'text-blue-600'}`}>
                        {(scenario.businessDSCR || 0).toFixed(2)}x
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Standard:</span> Critical &lt;1.25x | Below Target 1.25-1.5x | Good 1.5-2.0x | Excellent &gt;2.0x
                    </div>
                    <div className="flex justify-between">
                      <InfoTooltip formula="Business ROA = (Business Free Cash Flow / Business Capital Invested) × 100\nBusiness Capital = Purchase Price + Working Capital + Due Diligence + Professional Fees">
                        <span>Business ROA:</span>
                      </InfoTooltip>
                      <span className={`font-medium ${((scenario.businessFreeCashFlow / scenario.businessCapitalInvested) * 100) < 3 ? 'text-red-600' : ((scenario.businessFreeCashFlow / scenario.businessCapitalInvested) * 100) < 6 ? 'text-yellow-500' : ((scenario.businessFreeCashFlow / scenario.businessCapitalInvested) * 100) < 10 ? 'text-green-600' : 'text-blue-600'}`}>
                        {((scenario.businessFreeCashFlow / scenario.businessCapitalInvested) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Standard:</span> Critical &lt;3% | Below Target 3-6% | Good 6-10% | Excellent &gt;10%
                    </div>
                    <div className="flex justify-between">
                      <InfoTooltip formula="Debt-to-EBITDA Ratio = Total Business Debt ÷ EBITDA">
                        <span>Debt-to-EBITDA Ratio:</span>
                      </InfoTooltip>
                      <span className={`font-medium ${((scenario.fundingAllocation.allocation.sbaLoan + scenario.fundingAllocation.allocation.sellerFinancing) / scenario.ebitda) > 4.0 ? 'text-red-600' : ((scenario.fundingAllocation.allocation.sbaLoan + scenario.fundingAllocation.allocation.sellerFinancing) / scenario.ebitda) > 3.0 ? 'text-yellow-500' : ((scenario.fundingAllocation.allocation.sbaLoan + scenario.fundingAllocation.allocation.sellerFinancing) / scenario.ebitda) > 2.0 ? 'text-green-600' : 'text-blue-600'}`}>
                        {(() => {
                          const sbaLoan = scenario.fundingAllocation.allocation.sbaLoan || 0;
                          const sellerFinancing = scenario.fundingAllocation.allocation.sellerFinancing || 0;
                          const totalBusinessDebt = sbaLoan + sellerFinancing;
                          const debtToEbitdaRatio = totalBusinessDebt / scenario.ebitda;
                          
                          return debtToEbitdaRatio.toFixed(1) + 'x';
                        })()}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Standard:</span> Critical &gt;4.0x | Below Target 3.0-4.0x | Good 2.0-3.0x | Excellent &lt;2.0x
                    </div>
                    <div className="flex justify-between">
                      <InfoTooltip formula="Interest Coverage Ratio = EBITDA ÷ Interest Payments">
                        <span>Interest Coverage Ratio:</span>
                      </InfoTooltip>
                      <span className={`font-medium ${(scenario.ebitda / ((scenario.fundingAllocation.allocation.sbaLoan * 0.115) + (scenario.fundingAllocation.allocation.sellerFinancing * 0.08))) < 1.5 ? 'text-red-600' : (scenario.ebitda / ((scenario.fundingAllocation.allocation.sbaLoan * 0.115) + (scenario.fundingAllocation.allocation.sellerFinancing * 0.08))) < 2.5 ? 'text-yellow-500' : (scenario.ebitda / ((scenario.fundingAllocation.allocation.sbaLoan * 0.115) + (scenario.fundingAllocation.allocation.sellerFinancing * 0.08))) < 3.0 ? 'text-green-600' : 'text-blue-600'}`}>
                        {(() => {
                          const sbaLoan = scenario.fundingAllocation.allocation.sbaLoan || 0;
                          const sellerFinancing = scenario.fundingAllocation.allocation.sellerFinancing || 0;
                          const sbaInterest = sbaLoan * 0.115;
                          const sellerInterest = sellerFinancing * 0.08;
                          const totalInterest = sbaInterest + sellerInterest;
                          const interestCoverageRatio = totalInterest > 0 ? scenario.ebitda / totalInterest : Infinity;
                          
                          return interestCoverageRatio.toFixed(1) + 'x';
                        })()}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Standard:</span> Critical &lt;1.5x | Below Target 1.5-2.5x | Good 2.5-3.0x | Excellent &gt;3.0x
                    </div>
                    
                    {/* NEW METRICS - Section 2 */}
                    <div className="flex justify-between">
                      <InfoTooltip formula="EBITDA Margin = Business EBITDA ÷ Business Revenue × 100\n\nMeasures operational profitability before financing and tax effects. Higher margins indicate more efficient operations and pricing power.\n\nExample: $565K EBITDA ÷ $2,500K revenue = 22.6%\n\nStandards:\n🔴 Critical: &lt;15% (Poor profitability)\n🟡 Below Target: 15-18% (Below average)\n🟢 Good: 18-22% (Solid profitability)\n🔵 Excellent: &gt;22% (Strong profitability)">
                        <span>EBITDA Margin:</span>
                      </InfoTooltip>
                      <span className={`font-medium ${getEBITDAMarginStatus(scenario.ebitdaMargin).color === '#E74C3C' ? 'text-red-600' : getEBITDAMarginStatus(scenario.ebitdaMargin).color === '#F1C40F' ? 'text-yellow-500' : getEBITDAMarginStatus(scenario.ebitdaMargin).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                        {(scenario.ebitdaMargin || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Standard:</span> Critical &lt;15% | Below Target 15-18% | Good 18-22% | Excellent &gt;22%
                    </div>
                    
                    <div className="flex justify-between">
                      <InfoTooltip formula="Business Cash Conversion = Business Free Cash Flow ÷ Business EBITDA × 100\n\nShows how efficiently EBITDA converts to actual cash flow. Higher conversion indicates better working capital management and cash generation.\n\nExample: $157K FCF ÷ $565K EBITDA = 28%\n\nStandards:\n🔴 Critical: &lt;15% (Poor cash conversion)\n🟡 Below Target: 15-20% (Below average)\n🟢 Good: 20-30% (Solid conversion)\n🔵 Excellent: &gt;30% (Strong cash generation)">
                        <span>Cash Conversion:</span>
                      </InfoTooltip>
                      <span className={`font-medium ${getCashConversionStatus(scenario.businessCashConversion).color === '#E74C3C' ? 'text-red-600' : getCashConversionStatus(scenario.businessCashConversion).color === '#F1C40F' ? 'text-yellow-500' : getCashConversionStatus(scenario.businessCashConversion).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                        {(scenario.businessCashConversion || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Standard:</span> Critical &lt;15% | Below Target 15-20% | Good 20-30% | Excellent &gt;30%
                    </div>
                    
                    <div className="flex justify-between">
                      <InfoTooltip formula="Revenue-to-Investment Efficiency = Target Revenue ÷ Your Total Investment\n\nMeasures business scale relative to capital deployed. Higher ratios indicate more efficient capital deployment and larger business scale per dollar invested.\n\nExample: $2,500K revenue ÷ $516K investment = 4.8x\n\nStandards:\n🔴 Critical: &lt;3x (Inefficient scale)\n🟡 Below Target: 3-4x (Below average)\n🟢 Good: 4-6x (Good efficiency)\n🔵 Excellent: &gt;6x (High efficiency)">
                        <span>Revenue Multiple:</span>
                      </InfoTooltip>
                      <span className={`font-medium ${getRevenueEfficiencyStatus(scenario.revenueToInvestmentEfficiency).color === '#E74C3C' ? 'text-red-600' : getRevenueEfficiencyStatus(scenario.revenueToInvestmentEfficiency).color === '#F1C40F' ? 'text-yellow-500' : getRevenueEfficiencyStatus(scenario.revenueToInvestmentEfficiency).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                        {(scenario.revenueToInvestmentEfficiency || 0).toFixed(1)}x
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">
                      <span className="font-medium">Standard:</span> Critical &lt;3x | Below Target 3-4x | Good 4-6x | Excellent &gt;6x
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Investment Returns */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Personal Investment Returns</h2>
            <div className="grid lg:grid-cols-4 gap-4">
              {allResults.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Business Burden/Gain */}
                    <div className="business-analysis">
                      <h3 className="text-xs font-bold text-gray-700 mb-2">Business Level</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Revenue Burden:</span>
                          <span>{formatCurrency(scenario.targetRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operating Costs:</span>
                          <span>-{formatCurrency(scenario.targetRevenue - scenario.ebitda)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Business Debt Service:</span>
                          <span>-{formatCurrency(scenario.businessDebtService.totalBusinessDebtService)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Management Costs:</span>
                          <span>-{formatCurrency(variables.managementSalary)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-medium">
                          <span>Business Net Gain:</span>
                          <span className="font-medium">
                            {formatCurrency(scenario.businessFreeCashFlow)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Personal Burden/Gain */}
                    <div className="personal-analysis">
                      <h3 className="text-xs font-bold text-gray-700 mb-2">Personal Level</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Personal Investment:</span>
                          <span>-{formatCurrency(scenario.personalCashInvested)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Business Distribution:</span>
                          <span>+{formatCurrency(scenario.ownerDistribution)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Personal Debt Service:</span>
                          <span>-{formatCurrency(scenario.personalDebtService.totalPersonalDebtService)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-medium">
                          <span>Your Net Annual Gain:</span>
                          <span className="font-medium">
                            {formatCurrency(scenario.personalCashFlow)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <InfoTooltip formula="Your ROI = (Your Net Annual Gain ÷ Your Total Cash Invested) × 100\nYour Total Cash Invested = Personal Cash + Taiwanese Loan + Home Equity">
                            <span>Your ROI:</span>
                          </InfoTooltip>
                          <span className={`font-medium ${scenario.personalROI < 7 ? 'text-red-600' : scenario.personalROI < 12 ? 'text-yellow-500' : scenario.personalROI < 20 ? 'text-green-600' : 'text-blue-600'}`}>
                            {scenario.personalROI.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          <span className="font-medium">Standard:</span> Critical &lt;7% | Below Target 7-12% | Good 12-20% | Excellent &gt;20%
                        </div>
                        <div className="flex justify-between">
                          <InfoTooltip formula="Cash-on-Cash Return = Annual Cash Flow ÷ Your Cash Invested">
                            <span>Cash-on-Cash Return:</span>
                          </InfoTooltip>
                          <span className={`font-medium ${(scenario.personalCashFlow / scenario.personalCashInvested * 100) < 8 ? 'text-red-600' : (scenario.personalCashFlow / scenario.personalCashInvested * 100) < 12 ? 'text-yellow-500' : (scenario.personalCashFlow / scenario.personalCashInvested * 100) < 20 ? 'text-green-600' : 'text-blue-600'}`}>
                            {(scenario.personalCashFlow / scenario.personalCashInvested * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          <span className="font-medium">Standard:</span> Critical &lt;8% | Below Target 8-12% | Good 12-20% | Excellent &gt;20%
                        </div>
                        <div className="flex justify-between">
                          <InfoTooltip formula="Payback Period = Your Total Investment ÷ Your Net Annual Gain">
                            <span>Payback Period:</span>
                          </InfoTooltip>
                          <span className={`font-medium ${(scenario.personalCashInvested / scenario.personalCashFlow) > 8 ? 'text-red-600' : (scenario.personalCashInvested / scenario.personalCashFlow) > 5 ? 'text-yellow-500' : (scenario.personalCashInvested / scenario.personalCashFlow) > 3 ? 'text-green-600' : 'text-blue-600'}`}>
                            {(scenario.personalCashInvested / scenario.personalCashFlow).toFixed(1)} years
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          <span className="font-medium">Standard:</span> Critical &gt;8 years | Below Target 5-8 years | Good 3-5 years | Excellent &lt;3 years
                        </div>
                        
                        {/* NEW METRICS - Section 3 */}
                        <div className="flex justify-between">
                          <InfoTooltip formula="Risk-Adjusted Return = (Your ROI - Risk-Free Rate) ÷ Risk Score\n\nMeasures return per unit of risk taken. Higher ratios indicate better risk-adjusted performance compared to safer alternatives.\n\nExample: (14.8% ROI - 4.5% treasury) ÷ 4.9 risk score = 2.1\n\nRisk Score Components: Leverage, concentration, industry, execution risk\n\nStandards:\n🔴 Critical: &lt;0.5 (Poor risk compensation)\n🟡 Below Target: 0.5-1.0 (Fair risk-return)\n🟢 Good: 1.0-1.5 (Good risk-return)\n🔵 Excellent: &gt;1.5 (Strong risk-return)">
                            <span>Risk-Adjusted Return:</span>
                          </InfoTooltip>
                          <span className={`font-medium ${getRiskAdjustedStatus(scenario.riskAdjustedReturn).color === '#E74C3C' ? 'text-red-600' : getRiskAdjustedStatus(scenario.riskAdjustedReturn).color === '#F1C40F' ? 'text-yellow-500' : getRiskAdjustedStatus(scenario.riskAdjustedReturn).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            {(scenario.riskAdjustedReturn || 0).toFixed(1)}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          <span className="font-medium">Standard:</span> Critical &lt;0.5 | Below Target 0.5-1.0 | Good 1.0-1.5 | Excellent &gt;1.5
                        </div>
                        
                        <div className="flex justify-between">
                          <InfoTooltip formula="Income Replacement Ratio = Your Net Annual Gain ÷ Current Salary × 100\n\nShows percentage of current employment income replaced by business cash flows. Higher ratios indicate faster path to financial independence.\n\nExample: $76K business income ÷ $100K salary = 76%\n\nTimeline: Year 1: 76% | Year 3: 132% (full replacement + growth)\n\nStandards:\n🔴 Critical: &lt;40% (Cannot replace income)\n🟡 Below Target: 40-80% (Partial replacement)\n🟢 Good: 80-120% (Near full replacement)\n🔵 Excellent: &gt;120% (Income enhancement)">
                            <span>W-2 Replacement:</span>
                          </InfoTooltip>
                          <span className={`font-medium ${getIncomeReplacementStatus(scenario.incomeReplacementRatio).color === '#E74C3C' ? 'text-red-600' : getIncomeReplacementStatus(scenario.incomeReplacementRatio).color === '#F1C40F' ? 'text-yellow-500' : getIncomeReplacementStatus(scenario.incomeReplacementRatio).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            {(scenario.incomeReplacementRatio || 0).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          <span className="font-medium">Standard:</span> Critical &lt;40% | Below Target 40-80% | Good 80-120% | Excellent &gt;120%
                        </div>
                        
                        <div className="flex justify-between">
                          <InfoTooltip formula="Wealth Building Velocity = Annual Wealth Creation Rate\n\nMeasures how fast your investment builds wealth compared to traditional investments. Based on total return projections including cash flows and equity appreciation.\n\nExample: 5.0x total return over 5 years = 100%+ annual wealth creation\n\nComparison: S&P 500 ~10% | Real Estate ~15% | This Investment ~100%+\n\nStandards:\n🔴 Critical: &lt;20% (Below market alternatives)\n🟡 Below Target: 20-40% (Market competitive)\n🟢 Good: 40-80% (Above market)\n🔵 Excellent: &gt;80% (Exceptional wealth building)">
                            <span>Wealth Velocity:</span>
                          </InfoTooltip>
                          <span className={`font-medium ${getWealthVelocityStatus(scenario.wealthBuildingVelocity).color === '#E74C3C' ? 'text-red-600' : getWealthVelocityStatus(scenario.wealthBuildingVelocity).color === '#F1C40F' ? 'text-yellow-500' : getWealthVelocityStatus(scenario.wealthBuildingVelocity).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            {(scenario.wealthBuildingVelocity || 0).toFixed(0)}%+
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">
                          <span className="font-medium">Standard:</span> Critical &lt;20% | Below Target 20-40% | Good 40-80% | Excellent &gt;80%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Growth & Risk Projections */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Growth & Risk Projections</h2>
            <div className="grid lg:grid-cols-4 gap-4">
              {allResults.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded p-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Year</th>
                        <th className="text-right py-1">Business FCF</th>
                        <th className="text-right py-1">Your Distribution</th>
                        <th className="text-right py-1">Your Net FCF</th>
                        <th className="text-right py-1">DSCR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.projections.map((year, yearIndex) => {
                        // Calculate business FCF for this year
                        const yearEBITDA = year.ebitda;
                        const yearBusinessFCF = yearEBITDA - scenario.businessDebtService.totalBusinessDebtService - variables.managementSalary - (variables.techInvestment / 3);
                        const yearOwnerDistribution = yearBusinessFCF * scenario.ownership.yourOwnership;
                        const yearYourFCF = yearOwnerDistribution - scenario.personalDebtService.totalPersonalDebtService;
                        const yearDSCR = scenario.businessDebtService.totalBusinessDebtService > 0 ? yearEBITDA / scenario.businessDebtService.totalBusinessDebtService : 0;
                        
                        return (
                          <tr key={yearIndex}>
                            <td className="py-1">{year.year}</td>
                            <td className="text-right py-1">{formatCurrency(yearBusinessFCF)}</td>
                            <td className="text-right py-1">{formatCurrency(yearOwnerDistribution)}</td>
                            <td className="text-right py-1">{formatCurrency(yearYourFCF)}</td>
                            <td className={`text-right py-1 ${yearDSCR < 1.25 ? 'text-red-600' : yearDSCR < 1.5 ? 'text-yellow-500' : yearDSCR < 2.0 ? 'text-green-600' : 'text-blue-600'}`}>
                              {yearDSCR.toFixed(2)}x
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* NEW METRICS - Section 4 */}
                  <div className="mt-4 space-y-3 text-xs">
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">5-Year Exit Value Scenarios:</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Conservative:</span>
                          <span>{formatCurrency(scenario.exitValueRange?.conservative || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected:</span>
                          <span className="font-medium">{formatCurrency(scenario.exitValueRange?.expected || 0)} 🎯</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Optimistic:</span>
                          <span>{formatCurrency(scenario.exitValueRange?.optimistic || 0)}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1">
                        <InfoTooltip formula="5-Year Exit Value Range = Year 5 EBITDA × Valuation Multiple × Your Ownership %\n\nProjects potential business sale value in 5 years under different market scenarios. Includes cumulative cash flows received during ownership period.\n\nAssumptions:\n• Year 5 EBITDA: $721K (5% annual growth)\n• Your Ownership: 83%\n• Multiple Range: 3.0x (recession) to 4.5x (growth market)\n\nTotal Return = Exit Value + 5-Year Cumulative Cash Flows\n\nConservative includes potential market downturns\nExpected assumes current market conditions continue  \nOptimistic reflects strong business performance and market growth">
                          <span>Based on Year 5 EBITDA projections and market multiples</span>
                        </InfoTooltip>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">Stress Test Results:</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Revenue -20%:</span>
                          <span className={`font-medium ${getStressTestStatus(scenario.stressTestResults?.revenueStressROI).color === '#E74C3C' ? 'text-red-600' : getStressTestStatus(scenario.stressTestResults?.revenueStressROI).color === '#F1C40F' ? 'text-yellow-500' : getStressTestStatus(scenario.stressTestResults?.revenueStressROI).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            ROI = {(scenario.stressTestResults?.revenueStressROI || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margin -300bp:</span>
                          <span className={`font-medium ${getStressTestStatus(scenario.stressTestResults?.marginStressROI).color === '#E74C3C' ? 'text-red-600' : getStressTestStatus(scenario.stressTestResults?.marginStressROI).color === '#F1C40F' ? 'text-yellow-500' : getStressTestStatus(scenario.stressTestResults?.marginStressROI).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            ROI = {(scenario.stressTestResults?.marginStressROI || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interest +200bp:</span>
                          <span className={`font-medium ${getStressTestStatus(scenario.stressTestResults?.rateStressROI).color === '#E74C3C' ? 'text-red-600' : getStressTestStatus(scenario.stressTestResults?.rateStressROI).color === '#F1C40F' ? 'text-yellow-500' : getStressTestStatus(scenario.stressTestResults?.rateStressROI).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            ROI = {(scenario.stressTestResults?.rateStressROI || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span>Minimum Scenario:</span>
                          <span className={`font-medium ${getStressTestStatus(scenario.stressTestResults?.minROI).color === '#E74C3C' ? 'text-red-600' : getStressTestStatus(scenario.stressTestResults?.minROI).color === '#F1C40F' ? 'text-yellow-500' : getStressTestStatus(scenario.stressTestResults?.minROI).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            {(scenario.stressTestResults?.minROI || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1">
                        <InfoTooltip formula="Stress Test Results = ROI Under Adverse Scenarios\n\nTests investment performance under various economic stress conditions to assess downside protection and resilience.\n\nTest Scenarios:\n• Revenue Decline: -20% from base case\n• Margin Compression: -300 basis points EBITDA margin\n• Interest Rate Rise: +200 basis points on variable debt\n\nMinimum ROI shows worst-case scenario performance\nTarget: Maintain &gt;7% ROI (market minimum) under stress\n\nStrong stress test results indicate robust investment with good downside protection">
                          <span>Target: Maintain &gt;7% ROI under stress</span>
                        </InfoTooltip>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">Growth Funding Capacity:</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Available Capacity:</span>
                          <span className={`font-medium ${getGrowthCapacityStatus(scenario.growthFundingCapacity).color === '#E74C3C' ? 'text-red-600' : getGrowthCapacityStatus(scenario.growthFundingCapacity).color === '#F1C40F' ? 'text-yellow-500' : getGrowthCapacityStatus(scenario.growthFundingCapacity).color === '#27AE60' ? 'text-green-600' : 'text-blue-600'}`}>
                            {formatCurrency(scenario.growthFundingCapacity || 0)}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-600">
                          <InfoTooltip formula="Growth Funding Capacity = Additional Sustainable Debt Capacity\n\nEstimates additional funding available for business growth, acquisitions, or expansion based on improved cash flows and debt capacity.\n\nCalculation Based On:\n• Improved DSCR from business growth\n• Conservative debt-to-EBITDA limits (&lt;3.0x)\n• Projected Year 3+ cash flow performance\n\nUses Include:\n• Acquiring competitor businesses\n• Major expansion projects  \n• Equipment or technology investments\n• Working capital for growth\n\nHigher capacity indicates strong scalability potential and strategic flexibility">
                          <span>Available for: Acquisition or expansion</span>
                        </InfoTooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
      
      {/* Info Popup */}
      {showInfoPopup && (
        <InfoPopup 
          showInfoPopup={showInfoPopup}
          setShowInfoPopup={setShowInfoPopup}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchInputRef={searchInputRef}
          allMetricsData={allMetricsData}
        />
      )}
    </div>
  );
};

export default App; 