// Debug logging functions for comprehensive metric tracking
export const DEBUG_METRICS = true;

export function logMetricCalculation(sectionName, metricName, inputs, formula, result, assumptions = {}) {
  if (!DEBUG_METRICS) return;
  
  console.group(`📊 ${sectionName} - ${metricName}`);
  console.log(`🔢 INPUTS:`, inputs);
  console.log(`📐 FORMULA: ${formula}`);
  console.log(`📋 ASSUMPTIONS:`, assumptions);
  console.log(`✅ RESULT: ${result}`);
  console.log(`---`);
  console.groupEnd();
}

export function logAllMetricsSummary(scenario, metrics) {
  if (!DEBUG_METRICS) return;
  
  console.group("📊 DASHBOARD METRICS SUMMARY");
  
  console.log("🏢 DEAL STRUCTURE:");
  console.log(`  Purchase Price: ${metrics.purchasePrice}`);
  console.log(`  Available Cash: ${metrics.availableCash}`);
  console.log(`  Cash Surplus: ${metrics.cashSurplus}`);
  console.log(`  WACC: ${metrics.wacc}%`);
  
  console.log("📈 BUSINESS HEALTH:");
  console.log(`  DSCR: ${metrics.businessDSCR}x`);
  console.log(`  ROA: ${metrics.businessROA}%`);
  console.log(`  Debt/EBITDA: ${metrics.debtToEBITDA}x`);
  console.log(`  Interest Coverage: ${metrics.interestCoverage}x`);
  
  console.log("💰 PERSONAL RETURNS:");
  console.log(`  Your ROI: ${metrics.yourROI}%`);
  console.log(`  Cash-on-Cash: ${metrics.cashOnCashReturn}%`);
  console.log(`  Payback: ${metrics.paybackPeriod} years`);
  
  console.log("📊 KEY ASSUMPTIONS:");
  console.log(`  Target Revenue: ${scenario.targetRevenue}`);
  console.log(`  Net Profit Margin: ${scenario.netProfitMargin}%`);
  console.log(`  Valuation Multiple: ${scenario.valuationMultiple}x`);
  console.log(`  Revenue Growth: ${scenario.revenueGrowthRate}%`);
  console.log(`  Working Capital %: ${scenario.workingCapitalPercent}%`);
  console.log(`  Management Salary: ${scenario.managementSalary}`);
  
  console.groupEnd();
}

// SBA loan payment calculation
export const calculateSBAPayment = (principal, rate = 0.115, years = 10) => {
  const monthlyRate = rate / 12;
  const payments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
         (Math.pow(1 + monthlyRate, payments) - 1) * 12;
};

// Seller note payment calculation  
export const calculateSellerPayment = (principal, rate = 0.08, years = 5) => {
  const monthlyRate = rate / 12;
  const payments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
         (Math.pow(1 + monthlyRate, payments) - 1) * 12;
};

// Expected value calculation
export const calculateExpectedValue = (scenarios, probabilities) => {
  return (scenarios.bestCase * probabilities.bestCase / 100) +
         (scenarios.mostLikely * probabilities.mostLikely / 100) +
         (scenarios.worstCase * probabilities.worstCase / 100);
};

// Auto-normalize probabilities
export const normalizeProbabilities = (best, likely, worst) => {
  const total = best + likely + worst;
  if (total !== 100) {
    const factor = 100 / total;
    return {
      best: Math.round(best * factor),
      likely: Math.round(likely * factor),
      worst: Math.round(worst * factor)
    };
  }
  return { best, likely, worst };
};

// SBA minimum constraint
export const validateSBADownPayment = (value) => Math.max(value, 10);

// Debt service coverage validation
export const validateDebtCoverage = (ebitda, debtService) => debtService / ebitda <= 0.8;

// Generate bell curve data
export const generateBellCurve = (mean, min, max) => {
  const stdDev = (max - min) / 6;
  const points = [];
  for (let x = min; x <= max; x += (max - min) / 100) {
    const y = Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    points.push({ x, y });
  }
  return points;
};

// Calculate total cash required
export const calculateTotalCashRequired = (params) => {
  const {
    purchasePrice,
    sbaDownPaymentPercent,
    workingCapitalPercent,
    targetRevenue,
    techInvestment,
    sellerFinancingPercent = 20, // Default seller financing percentage
    dueDiligencePercent = 1.5,
    professionalFeesPercent = 0.8,
    contingencyPercent = 2.5
  } = params;

  // Calculate financing structure correctly
  const sellerFinancingAmount = purchasePrice * (sellerFinancingPercent / 100);
  const sbaLoanAmount = purchasePrice - sellerFinancingAmount;
  const sbaDownPayment = sbaLoanAmount * (sbaDownPaymentPercent / 100);
  
  // Note: Total financing may exceed purchase price if both SBA and seller financing are used
  // This is typical in SBA deals where seller financing is additional to SBA loan
  
  const workingCapital = targetRevenue * (workingCapitalPercent / 100);
  const dueDiligence = purchasePrice * (dueDiligencePercent / 100);
  const professionalFees = purchasePrice * (professionalFeesPercent / 100);
  const contingency = purchasePrice * (contingencyPercent / 100);

  return {
    downPayment: sbaDownPayment,
    workingCapital,
    dueDiligence,
    professionalFees,
    techInvestment,
    contingency,
    total: sbaDownPayment + workingCapital + dueDiligence + professionalFees + techInvestment + contingency
  };
};

// Calculate annual cash to pocket
export const calculateAnnualCashToPocket = (params) => {
  const {
    targetRevenue,
    netProfitMarginPercent,
    sbaLoanAmount,
    sellerFinancingAmount,
    managementSalary,
    techInvestment
  } = params;

  const ebitda = targetRevenue * (netProfitMarginPercent / 100);
  const sbaPayment = calculateSBAPayment(sbaLoanAmount);
  const sellerPayment = calculateSellerPayment(sellerFinancingAmount);
  const techInvestmentAmortized = techInvestment / 3; // Amortized over 3 years

  return {
    ebitda,
    sbaPayment,
    sellerPayment,
    managementSalary,
    techInvestmentAmortized,
    netCashFlow: ebitda - sbaPayment - sellerPayment - managementSalary - techInvestmentAmortized
  };
};

// Calculate Debt Service Coverage Ratio (DSCR)
export const calculateDSCR = (annualEBITDA, totalAnnualDebtService) => {
  const result = totalAnnualDebtService > 0 ? annualEBITDA / totalAnnualDebtService : 0;
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Business Health",
      "DSCR (Debt Service Coverage Ratio)",
      {
        annualEBITDA,
        totalAnnualDebtService
      },
      "DSCR = Annual EBITDA ÷ Total Annual Debt Service",
      result,
      {
        interpretation: result >= 1.25 ? "Strong coverage" : result >= 1.0 ? "Adequate coverage" : "Weak coverage",
        calculation: `${annualEBITDA} ÷ ${totalAnnualDebtService} = ${result}x`
      }
    );
  }
  
  return result;
};

// Calculate Cash-on-Cash Return
export const calculateCashOnCashReturn = (annualCashToPocket, personalCashInvested) => {
  const result = personalCashInvested > 0 ? (annualCashToPocket / personalCashInvested) * 100 : 0;
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Personal Returns",
      "Cash-on-Cash Return",
      {
        annualCashToPocket,
        personalCashInvested
      },
      "Cash-on-Cash Return = (Annual Cash to Pocket ÷ Personal Cash Invested) × 100",
      result,
      {
        interpretation: result >= 20 ? "Excellent return" : result >= 15 ? "Good return" : result >= 10 ? "Fair return" : "Poor return",
        calculation: `(${annualCashToPocket} ÷ ${personalCashInvested}) × 100 = ${result}%`
      }
    );
  }
  
  return result;
};

// Calculate IRR using Newton-Raphson method
export const calculateIRR = (personalInvestment, cashFlows) => {
  const tolerance = 0.0001;
  const maxIterations = 100;
  let guess = 0.1; // Start with 10%

  for (let i = 0; i < maxIterations; i++) {
    let npv = -personalInvestment;
    let derivative = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      const discountFactor = Math.pow(1 + guess, j + 1);
      npv += cashFlows[j] / discountFactor;
      derivative -= (j + 1) * cashFlows[j] / (discountFactor * (1 + guess));
    }

    const newGuess = guess - npv / derivative;
    
    if (Math.abs(newGuess - guess) < tolerance) {
      const result = newGuess * 100; // Return as percentage
      
      if (DEBUG_METRICS) {
        logMetricCalculation(
          "Personal Returns",
          "IRR (Internal Rate of Return)",
          {
            personalInvestment,
            cashFlows,
            iterations: i + 1
          },
          "IRR = Rate where NPV = 0 (calculated using Newton-Raphson method)",
          result,
          {
            method: "Newton-Raphson iteration",
            tolerance: tolerance,
            maxIterations: maxIterations,
            interpretation: result >= 15 ? "Excellent return" : result >= 10 ? "Good return" : result >= 5 ? "Fair return" : "Poor return"
          }
        );
      }
      
      return result;
    }
    
    guess = newGuess;
  }
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Personal Returns",
      "IRR (Internal Rate of Return)",
      {
        personalInvestment,
        cashFlows
      },
      "IRR = Rate where NPV = 0 (calculated using Newton-Raphson method)",
      null,
      {
        method: "Newton-Raphson iteration",
        tolerance: tolerance,
        maxIterations: maxIterations,
        error: "No convergence - IRR calculation failed"
      }
    );
  }
  
  return null; // No convergence
};

// Calculate Multiple on Invested Capital (MOIC)
export const calculateMOIC = (personalCashInvested, fiveYearProjections) => {
  const totalCashReturned = fiveYearProjections.reduce((sum, year) => sum + year.cashFlow, 0);
  const businessValueAtExit = fiveYearProjections[4].ebitda * 4.2; // Assume same multiple
  const result = (totalCashReturned + businessValueAtExit) / personalCashInvested;
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Personal Returns",
      "MOIC (Multiple on Invested Capital)",
      {
        personalCashInvested,
        totalCashReturned,
        businessValueAtExit,
        year5EBITDA: fiveYearProjections[4].ebitda,
        exitMultiple: 4.2
      },
      "MOIC = (Total Cash Returned + Business Value at Exit) ÷ Personal Cash Invested",
      result,
      {
        exitMultipleSource: "Assumed 4.2x EBITDA exit multiple",
        calculation: `(${totalCashReturned} + ${businessValueAtExit}) ÷ ${personalCashInvested} = ${result}x`
      }
    );
  }
  
  return result;
};

// Calculate Payback Period
export const calculatePaybackPeriod = (personalCashInvested, fiveYearProjections) => {
  let cumulativeCashFlow = 0;
  let result = '>5 years';
  
  for (let i = 0; i < fiveYearProjections.length; i++) {
    cumulativeCashFlow += fiveYearProjections[i].cashFlow;
    if (cumulativeCashFlow >= personalCashInvested) {
      result = i + 1 + ((personalCashInvested - (cumulativeCashFlow - fiveYearProjections[i].cashFlow)) / fiveYearProjections[i].cashFlow);
      break;
    }
  }
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Personal Returns",
      "Payback Period",
      {
        personalCashInvested,
        cumulativeCashFlow,
        fiveYearProjections: fiveYearProjections.map(p => ({ year: p.year, cashFlow: p.cashFlow }))
      },
      "Payback Period = Years until cumulative cash flow exceeds personal investment",
      result,
      {
        interpretation: typeof result === 'number' ? `${result} years to recover investment` : "Investment not recovered within 5 years",
        calculation: `Cumulative cash flow: ${cumulativeCashFlow} vs Personal Investment: ${personalCashInvested}`
      }
    );
  }
  
  return result;
};

// Enhanced Risk Score Calculation
export const calculateEnhancedRiskScore = (dscr, cashOnCash, sellerFinancingPercent) => {
  let score = 5; // Base score
  
  // DSCR scoring
  if (dscr >= 1.5) score += 2;
  else if (dscr >= 1.25) score += 1;
  else score -= 2;
  
  // Cash-on-Cash scoring
  if (cashOnCash >= 20) score += 2;
  else if (cashOnCash >= 15) score += 1;
  else if (cashOnCash < 10) score -= 1;
  
  // Seller financing scoring
  if (sellerFinancingPercent >= 20) score += 1; // Seller has skin in game
  
  const result = Math.max(1, Math.min(10, score));
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Risk Assessment",
      "Enhanced Risk Score",
      {
        dscr,
        cashOnCash,
        sellerFinancingPercent
      },
      "Risk Score = Base(5) + DSCR Bonus + Cash-on-Cash Bonus + Seller Financing Bonus",
      result,
      {
        baseScore: 5,
        dscrContribution: dscr >= 1.5 ? 2 : dscr >= 1.25 ? 1 : -2,
        cashOnCashContribution: cashOnCash >= 20 ? 2 : cashOnCash >= 15 ? 1 : cashOnCash < 10 ? -1 : 0,
        sellerFinancingContribution: sellerFinancingPercent >= 20 ? 1 : 0,
        interpretation: result <= 3 ? "High Risk" : result <= 6 ? "Medium Risk" : "Low Risk"
      }
    );
  }
  
  return result;
};

// Calculate financing structure
export const calculateFinancingStructure = (params) => {
  const {
    purchasePrice,
    sellerFinancingPercent,
    sbaDownPaymentPercent
  } = params;

  const sellerFinancing = purchasePrice * (sellerFinancingPercent / 100);
  const sbaLoanAmount = purchasePrice - sellerFinancing;
  const downPayment = sbaLoanAmount * (sbaDownPaymentPercent / 100);

  return {
    purchasePrice,
    sellerFinancing,
    sbaLoanAmount,
    downPayment
  };
};

// Calculate 5-year projections for advanced metrics
export const calculateFiveYearProjections = (params) => {
  const {
    targetRevenue,
    revenueGrowthRatePercent,
    netProfitMarginPercent,
    sbaLoanAmount,
    sellerFinancingAmount,
    managementSalary,
    techInvestment,
    sbaInterestRate = 11.5,
    sellerInterestRate = 8
  } = params;

  const projections = [];
  let currentRevenue = targetRevenue;

  for (let year = 1; year <= 5; year++) {
    const ebitda = currentRevenue * (netProfitMarginPercent / 100);
    const sbaPayment = calculateSBAPayment(sbaLoanAmount, sbaInterestRate / 100, 10);
    const sellerPayment = calculateSellerPayment(sellerFinancingAmount, sellerInterestRate / 100, 5);
    const techInvestmentAmortized = year <= 3 ? techInvestment / 3 : 0;

    const netCashFlow = ebitda - sbaPayment - sellerPayment - managementSalary - techInvestmentAmortized;

    projections.push({
      year,
      revenue: currentRevenue,
      ebitda,
      cashFlow: netCashFlow
    });

    currentRevenue *= (1 + revenueGrowthRatePercent / 100);
  }

  return projections;
};

// Calculate business targeting metrics
export const calculateBusinessTargetingMetrics = (availableCash, targetRevenue) => {
  return {
    maxSafePurchasePrice: availableCash * 4, // Assuming 25% total cash requirement
    minRequiredEBITDA: (availableCash * 4 * 0.12) / 1.25, // 12% debt service / 1.25x coverage
    targetRevenueRange: {
      min: targetRevenue * 0.8,
      max: targetRevenue * 1.2
    },
    recommendedMultipleRange: {
      min: 3.5,
      max: 5.0
    }
  };
};

// Calculate risk score (1-10)
export const calculateRiskScore = (params) => {
  let riskScore = 5; // Base score

  // Debt service coverage ratio
  const ebitda = params.targetRevenue * (params.netProfitMarginPercent / 100);
  const sbaPayment = calculateSBAPayment(params.sbaLoanAmount);
  const sellerPayment = calculateSellerPayment(params.sellerFinancingAmount);
  const totalDebtService = sbaPayment + sellerPayment;
  const debtCoverageRatio = ebitda / totalDebtService;

  if (debtCoverageRatio < 1.25) riskScore += 3;
  else if (debtCoverageRatio < 1.5) riskScore += 1;
  else if (debtCoverageRatio > 2.0) riskScore -= 1;

  // Working capital ratio
  const workingCapitalRatio = (params.workingCapitalPercent / 100) / (params.netProfitMarginPercent / 100);
  if (workingCapitalRatio > 0.8) riskScore += 2;
  else if (workingCapitalRatio < 0.3) riskScore -= 1;

  // SBA down payment
  if (params.sbaDownPaymentPercent < 12) riskScore += 1;
  else if (params.sbaDownPaymentPercent > 15) riskScore -= 1;

  return Math.max(1, Math.min(10, riskScore));
};

// Calculate business-only WACC (excluding personal loans)
export const calculateBusinessWACC = (sbaLoan, sellerFinancing, purchasePrice) => {
  const totalBusinessDebt = sbaLoan.amount + sellerFinancing.amount;
  const businessEquity = purchasePrice - totalBusinessDebt;
  const totalBusinessCapital = purchasePrice;
  
  if (totalBusinessCapital <= 0) return 0;
  
  const debtWeight = totalBusinessDebt / totalBusinessCapital;
  const equityWeight = businessEquity / totalBusinessCapital;
  
  // Different tax treatment for different debt types
  const sbaAfterTaxCost = 0.115 * 0.75; // 25% tax benefit for business-deductible SBA
  const sellerAfterTaxCost = 0.08 * 0.9; // 10% tax benefit for seller financing (less deductible)
  const afterTaxDebtCost = totalBusinessDebt > 0 ? 
    ((sbaLoan.amount * sbaAfterTaxCost + sellerFinancing.amount * sellerAfterTaxCost) / totalBusinessDebt) : 0;
  const equityCost = 0.15; // Business equity cost
  
  return (debtWeight * afterTaxDebtCost) + (equityWeight * equityCost);
};

// Calculate business-level EVA (excluding personal loans)
export const calculateBusinessEVA = (businessEBITDA, businessCapitalInvested, businessWACC) => {
  const taxRate = 0.25;
  const nopat = businessEBITDA * (1 - taxRate); // Net Operating Profit After Tax
  const capitalCharge = businessCapitalInvested * businessWACC;
  return nopat - capitalCharge;
};

// Calculate business cash flow (company level only)
export const calculateBusinessCashFlow = (scenario, loanStructure, businessCapitalInvested) => {
  const businessDebtService = 
    loanStructure.sbaLoan.annualPayment + 
    loanStructure.sellerFinancing.annualPayment;
  
  const businessFreeCashFlow = 
    scenario.ebitda - 
    businessDebtService - 
    scenario.managementSalary - 
    scenario.techInvestmentAnnual;
  
  const businessDSCR = businessDebtService > 0 ? scenario.ebitda / businessDebtService : 0;
  
  return {
    businessRevenue: scenario.targetRevenue,
    businessEBITDA: scenario.ebitda,
    businessDebtService: businessDebtService,
    businessFreeCashFlow: businessFreeCashFlow,
    businessDSCR: businessDSCR,
    businessROA: businessCapitalInvested > 0 ? (businessFreeCashFlow / businessCapitalInvested) * 100 : 0
  };
};

// Calculate personal cash flow (owner level only)
export const calculatePersonalCashFlow = (businessCashFlow, personalLoans, ownershipData, fundingSources) => {
  const ownerDistribution = businessCashFlow.businessFreeCashFlow * ownershipData.yourOwnership;
  
  const personalDebtService = 
    personalLoans.houseEquity.annualPayment + 
    personalLoans.taiwaneseLoan.annualPayment;
  
  const personalNetCashFlow = ownerDistribution - personalDebtService;
  
  const personalCashInvested = 
    (fundingSources.personalCash.enabled ? fundingSources.personalCash.amount : 0) + 
    (fundingSources.houseEquity.enabled ? fundingSources.houseEquity.amount : 0) + 
    (fundingSources.taiwaneseLoan.enabled ? fundingSources.taiwaneseLoan.amount : 0);
  
  const personalROI = personalCashInvested > 0 ? 
    (personalNetCashFlow / personalCashInvested) * 100 : 0;
  
  return {
    ownerDistribution: ownerDistribution,
    personalDebtService: personalDebtService,
    personalNetCashFlow: personalNetCashFlow,
    personalCashInvested: personalCashInvested,
    personalROI: personalROI
  };
};

// Calculate personal projections
export const calculatePersonalProjections = (businessProjections, personalLoans, ownershipData) => {
  return businessProjections.map((year, index) => {
    const businessFCF = year.businessFreeCashFlow;
    const ownerDistribution = businessFCF * ownershipData.yourOwnership;
    const personalDebtService = personalLoans.total;
    const yourFCF = ownerDistribution - personalDebtService;
    
    return {
      year: index + 1,
      businessFCF: businessFCF,
      ownerDistribution: ownerDistribution,
      yourFCF: yourFCF,
      DSCR: year.businessDSCR,
      cumulative: index === 0 ? yourFCF : (index > 0 ? businessProjections[index - 1].cumulative : 0) + yourFCF
    };
  });
};

// Calculate risk-adjusted ownership with fair methodology
export const calculateRiskAdjustedOwnership = (fundingSources, managementValue = 150000) => {
  // Calculate risk-weighted contributions
  const personalCashRisk = fundingSources.personalCash.enabled ? fundingSources.personalCash.amount : 0;
  
  // Taiwanese loan: Personal guarantee = 80% risk weight
  const taiwaneseLoanRisk = fundingSources.taiwaneseLoan.enabled ? 
    fundingSources.taiwaneseLoan.amount * 0.8 : 0;
    
  // Home equity: Personal asset at risk = 120% risk weight (higher risk premium)
  const homeEquityRisk = fundingSources.houseEquity.enabled ? 
    fundingSources.houseEquity.amount * 1.2 : 0;
    
  // SBA loan: Personal guarantee but asset-backed = 30% risk weight
  // const sbaRisk = 0; // SBA loan is debt, not equity contribution
  
  // Management/operational value (sweat equity)
  const sweatEquityValue = managementValue;
  
  // Total personal risk-adjusted contribution
  const personalRiskAdjusted = personalCashRisk + taiwaneseLoanRisk + homeEquityRisk + sweatEquityValue;
  
  // Outside investor contribution (100% risk weight)
  const investorContribution = fundingSources.additionalInvestment.enabled ? 
    fundingSources.additionalInvestment.amount : 0;
  
  // Total risk-adjusted equity
  const totalRiskAdjustedEquity = personalRiskAdjusted + investorContribution;
  
  // Base ownership calculation
  const baseOwnership = totalRiskAdjustedEquity > 0 ? 
    personalRiskAdjusted / totalRiskAdjustedEquity : 1;
  
  // Dynamic control premium based on investor amount
  const controlPremium = investorContribution > 0 ? 
    Math.min(0.05, investorContribution / 1000000) : 0; // Max 5%, scales with investment size
  
  // Final ownership (capped at 95% to be fair to investors)
  const finalOwnership = Math.min(0.95, baseOwnership + controlPremium);
  
  return {
    yourOwnership: finalOwnership,
    investorOwnership: 1 - finalOwnership,
    breakdown: {
      personalCashRisk,
      taiwaneseLoanRisk,
      homeEquityRisk,
      sweatEquityValue,
      investorContribution,
      controlPremium: controlPremium * 100
    }
  };
};

// Calculate ownership cash flows with preferred return structure
export const calculateOwnershipCashFlows = (totalBusinessCashFlow, ownershipData, fundingSources) => {
  const investorAmount = fundingSources.additionalInvestment.enabled ? 
    fundingSources.additionalInvestment.amount : 0;
  const personalCashAmount = fundingSources.personalCash.enabled ? 
    fundingSources.personalCash.amount : 0;
  
  // Investor preferred return (8% on their investment)
  const investorPreferredReturn = investorAmount * 0.08;
  
  // Your preferred return (6% on personal cash)
  const yourPreferredReturn = personalCashAmount * 0.06;
  
  // Total preferred returns
  const totalPreferredReturns = investorPreferredReturn + yourPreferredReturn;
  
  // Remaining cash flow after preferred returns
  const remainingCashFlow = Math.max(0, totalBusinessCashFlow - totalPreferredReturns);
  
  // Split remaining cash flow based on ownership percentages
  const yourRemainingShare = remainingCashFlow * ownershipData.yourOwnership;
  const investorRemainingShare = remainingCashFlow * ownershipData.investorOwnership;
  
  // Total distributions
  const yourTotalCashFlow = yourPreferredReturn + yourRemainingShare;
  const investorTotalCashFlow = investorPreferredReturn + investorRemainingShare;
  
  // Calculate ROI on actual cash invested (not risk-adjusted amounts)
  const yourCashInvested = personalCashAmount;
  const yourROI = yourCashInvested > 0 ? (yourTotalCashFlow / yourCashInvested) * 100 : 0;
  
  const investorROI = investorAmount > 0 ? (investorTotalCashFlow / investorAmount) * 100 : 0;
  
  return {
    yourTotalCashFlow,
    investorTotalCashFlow,
    yourROI,
    investorROI,
    preferredReturns: {
      yours: yourPreferredReturn,
      investor: investorPreferredReturn
    },
    remainingCashFlowSplit: {
      yours: yourRemainingShare,
      investor: investorRemainingShare
    }
  };
};

// Validate ownership for reasonableness
export const validateOwnership = (ownershipData, fundingSources, businessMetrics) => {
  const warnings = [];
  
  // Check if investor is getting fair deal
  if (ownershipData.investorOwnership < 0.05 && fundingSources.additionalInvestment.amount > 50000) {
    warnings.push("⚠️ Investor ownership very low - may not be attractive");
  }
  
  // Check if you're giving up too much
  if (ownershipData.yourOwnership < 0.6 && fundingSources.personalCash.amount > fundingSources.additionalInvestment.amount) {
    warnings.push("⚠️ Your ownership low despite majority funding");
  }
  
  // Check for reasonable investor return (simplified calculation)
  const investorAmount = fundingSources.additionalInvestment.enabled ? fundingSources.additionalInvestment.amount : 0;
  const expectedInvestorReturn = investorAmount > 0 ? (businessMetrics.totalCashFlow * ownershipData.investorOwnership / investorAmount) * 100 : 0;
  if (expectedInvestorReturn < 15 && investorAmount > 0) {
    warnings.push("⚠️ Investor expected return below market (15%+)");
  }
  
  return warnings;
};

// Verification function to test calculations with known values
export const verifyCalculations = (testScenario) => {
  const {
    targetRevenue = 2500000,
    netProfitMargin = 25,
    valuationMultiple = 4,
    sbaLoanAmount = 1500000,
    sellerFinancingAmount = 500000,
    personalCash = 550000,
    additionalInvestment = 100000
  } = testScenario;

  // Test business calculations
  const ebitda = targetRevenue * (netProfitMargin / 100);
  const purchasePrice = ebitda * valuationMultiple;
  const businessCapitalInvested = purchasePrice + (targetRevenue * 0.1) + (purchasePrice * 0.015) + (purchasePrice * 0.008);
  
  // Test WACC
  const businessWACC = calculateBusinessWACC(
    { amount: sbaLoanAmount, rate: 0.115 },
    { amount: sellerFinancingAmount, rate: 0.08 },
    purchasePrice
  );
  
  // Test EVA
  const businessEVA = calculateBusinessEVA(ebitda, businessCapitalInvested, businessWACC);
  
  // Test ownership
  const fundingSources = {
    personalCash: { enabled: true, amount: personalCash },
    taiwaneseLoan: { enabled: true, amount: 725000 },
    houseEquity: { enabled: false, amount: 200000 },
    additionalInvestment: { enabled: true, amount: additionalInvestment }
  };
  
  const ownershipData = calculateRiskAdjustedOwnership(fundingSources);
  
  return {
    testScenario: {
      targetRevenue,
      ebitda,
      purchasePrice,
      businessCapitalInvested,
      businessWACC: businessWACC * 100,
      businessEVA,
      ownershipData
    },
    expectedRanges: {
      businessWACC: { min: 7, max: 12 },
      businessEVA: { min: 0, max: 200000 },
      ownership: { min: 0.6, max: 0.95 }
    }
  };
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`;
}; 

// FUNDING PRIORITY ALLOCATION FUNCTIONS
// Calculate total cash needed for acquisition
export const calculateTotalCashNeeded = (scenario, variables) => {
  const purchasePrice = scenario.purchasePrice;
  const workingCapitalPercent = variables.workingCapital || 14.6;
  const workingCapital = scenario.targetRevenue * (workingCapitalPercent / 100);
  const dueDiligence = purchasePrice * 0.015;
  const professionalFees = purchasePrice * 0.008;
  const contingency = purchasePrice * 0.025;
  const techInvestment = variables.techInvestment ?? 100000;
  
  // Calculate SBA down payment correctly
  const sellerFinancingPercent = variables.sellerFinancing || 20;
  const sellerFinancingAmount = purchasePrice * (sellerFinancingPercent / 100);
  const sbaLoanAmount = purchasePrice - sellerFinancingAmount;
  const sbaDownPaymentPercent = variables.sbaDownPayment || 12;
  const sbaDownPayment = sbaLoanAmount * (sbaDownPaymentPercent / 100);
  
  const totalCashNeeded = sbaDownPayment + workingCapital + dueDiligence + professionalFees + contingency + techInvestment;
  
  return {
    purchasePrice,
    workingCapital,
    dueDiligence,
    professionalFees,
    contingency,
    techInvestment,
    sbaDownPayment,
    totalCashNeeded
  };
};

// Allocate funding by priority order (lowest to highest cost) - FOCUSED ON DOWN PAYMENT
export const allocateFundingByPriority = (downPaymentNeeded, fundingSources) => {
  const allocation = {
    taiwaneseLoan: 0,
    personalCash: 0,
    additionalInvestment: 0,
    sellerFinancing: 0,
    houseEquity: 0,
    sbaLoan: 0
  };
  
  let remainingDownPayment = downPaymentNeeded;
  
  // Priority 1: Taiwanese Loan (cheapest - 2.8%) - $300,000 available
  if (fundingSources.taiwaneseLoan.enabled && remainingDownPayment > 0) {
    const used = Math.min(remainingDownPayment, fundingSources.taiwaneseLoan.amount);
    allocation.taiwaneseLoan = used;
    remainingDownPayment -= used;
  }
  
  // Priority 2: Personal Cash (8% opportunity cost) - $50,000 available
  if (fundingSources.personalCash.enabled && remainingDownPayment > 0) {
    const used = Math.min(remainingDownPayment, fundingSources.personalCash.amount);
    allocation.personalCash = used;
    remainingDownPayment -= used;
  }
  
  // Priority 3: Additional Investment (15% expected return) - $50,000 available
  if (fundingSources.additionalInvestment.enabled && remainingDownPayment > 0) {
    const used = Math.min(remainingDownPayment, fundingSources.additionalInvestment.amount);
    allocation.additionalInvestment = used;
    remainingDownPayment -= used;
  }
  
  // Priority 4: Seller Financing (8%) - $0 available (disabled)
  if (fundingSources.sellerFinancing.enabled && remainingDownPayment > 0) {
    const used = Math.min(remainingDownPayment, fundingSources.sellerFinancing.amount);
    allocation.sellerFinancing = used;
    remainingDownPayment -= used;
  }
  
  // Priority 5: Home Equity Loan (8% but personal asset at risk) - $98,273 available
  if (fundingSources.houseEquity.enabled && remainingDownPayment > 0) {
    const used = Math.min(remainingDownPayment, fundingSources.houseEquity.amount);
    allocation.houseEquity = used;
    remainingDownPayment -= used;
  }
  
  // Priority 6: SBA Loan (11.5% - highest cost, use as last resort) - $0 available (disabled)
  if (remainingDownPayment > 0) {
    allocation.sbaLoan = remainingDownPayment; // Whatever is left
  }
  
  return {
    allocation,
    downPaymentGap: remainingDownPayment < 0 ? 0 : remainingDownPayment,
    totalAllocated: downPaymentNeeded - Math.max(0, remainingDownPayment),
    downPaymentNeeded: downPaymentNeeded,
    remainingDownPayment: Math.max(0, remainingDownPayment)
  };
};

// Determine purchase price financing structure
export const calculatePurchasePriceFinancing = (purchasePrice, fundingAllocation, variables) => {
  // Seller financing reduces the amount that needs bank financing
  const sellerFinancingAmount = fundingAllocation.allocation.sellerFinancing || 0;
  const amountNeedingBankFinancing = purchasePrice - sellerFinancingAmount;
  
  // SBA loan covers remaining purchase price
  const sbaLoanAmount = Math.max(0, amountNeedingBankFinancing);
  const sbaDownPaymentPercent = Math.max(variables.sbaDownPayment || 10, 10);
  const sbaDownPayment = sbaLoanAmount * (sbaDownPaymentPercent / 100);
  const sbaLoanPrincipal = sbaLoanAmount - sbaDownPayment;
  
  return {
    sellerFinancingAmount,
    sbaLoanAmount,
    sbaDownPayment,
    sbaLoanPrincipal,
    totalDownPaymentCovered: sbaDownPayment // This comes from cash allocation
  };
};

// Calculate business debt service with priority allocation
export const calculateBusinessDebtService = (purchaseFinancing) => {
  // Only SBA loan and seller financing create debt service for the business
  const sbaAnnualPayment = calculateSBAPayment(
    purchaseFinancing.sbaLoanPrincipal, 
    0.115, 
    10
  );
  
  const sellerAnnualPayment = calculateSellerPayment(
    purchaseFinancing.sellerFinancingAmount, 
    0.08, 
    5
  );
  
  return {
    sbaAnnualPayment,
    sellerAnnualPayment,
    totalBusinessDebtService: sbaAnnualPayment + sellerAnnualPayment
  };
};

// Calculate personal debt service with priority allocation
export const calculatePersonalDebtService = (fundingAllocation) => {
  // Only personal loans create personal debt service
  const houseEquityPayment = fundingAllocation.allocation.houseEquity > 0 ? 
    calculateSBAPayment(fundingAllocation.allocation.houseEquity, 0.08, 15) : 0;
    
  const taiwanesePayment = fundingAllocation.allocation.taiwaneseLoan > 0 ? 
    calculateSBAPayment(fundingAllocation.allocation.taiwaneseLoan, 0.028, 10) : 0;
  
  return {
    houseEquityPayment,
    taiwanesePayment,
    totalPersonalDebtService: houseEquityPayment + taiwanesePayment
  };
};

// Calculate WACC with priority-based allocation - ALL FUNDING SOURCES
export const calculatePriorityBasedWACC = (fundingAllocation, purchasePrice) => {
  // WACC should include ALL funding sources used for the business acquisition
  // Each source has its own after-tax cost of capital
  
  let totalFunding = 0;
  let weightedCost = 0;
  
  // After-tax cost rates for each funding source
  const afterTaxCostRates = {
    taiwaneseLoan: 0.028 * 0.75, // 2.8% × 0.75 = 2.1% after-tax (if business deductible)
    personalCash: 0.08 * 0.75, // 8% × 0.75 = 6% after-tax (opportunity cost with tax benefit)
    additionalInvestment: 0.15, // 15% equity cost (no tax benefit)
    sellerFinancing: 0.08 * 0.75, // 8% × 0.75 = 6% after-tax
    houseEquity: 0.08, // 8% (personal debt, no business tax benefit)
    sbaLoan: 0.115 * 0.75 // 11.5% × 0.75 = 8.6% after-tax
  };
  
  // Calculate weighted average cost of capital across all funding sources
  Object.entries(fundingAllocation.allocation).forEach(([source, amount]) => {
    if (amount > 0) {
      totalFunding += amount;
      weightedCost += amount * afterTaxCostRates[source];
    }
  });
  
  return totalFunding > 0 ? (weightedCost / totalFunding) * 100 : 0;
};

// Calculate ownership with priority-based allocation
export const calculatePriorityBasedOwnership = (fundingAllocation) => {
  // Risk-adjusted personal contributions based on ACTUAL allocated amounts
  const personalCashRisk = fundingAllocation.allocation.personalCash * 1.0;
  const taiwaneseLoanRisk = fundingAllocation.allocation.taiwaneseLoan * 0.8; // Personal guarantee
  const houseEquityRisk = fundingAllocation.allocation.houseEquity * 1.2; // Personal asset risk
  
  const totalPersonalRisk = personalCashRisk + taiwaneseLoanRisk + houseEquityRisk;
  const investorContribution = fundingAllocation.allocation.additionalInvestment;
  const totalEquity = totalPersonalRisk + investorContribution;
  
  const finalOwnership = totalEquity > 0 ? totalPersonalRisk / totalEquity : 1; // Removed control premium
  
  return {
    yourOwnership: finalOwnership,
    investorOwnership: 1 - finalOwnership,
    breakdown: {
      personalCashRisk,
      taiwaneseLoanRisk,
      houseEquityRisk,
      investorContribution
    }
  };
};

// Calculate personal cost of capital (for personal funding sources)
export const calculatePersonalCostOfCapital = (fundingAllocation) => {
  let totalPersonalFunding = 0;
  let weightedPersonalCost = 0;
  
  // Only consider personal funding sources: Taiwanese Loan, Personal Cash, Home Equity
  const personalCostRates = {
    taiwaneseLoan: 0.028, // 2.8% - personal loan rate
    personalCash: 0.08, // 8% opportunity cost
    houseEquity: 0.08, // 8% home equity rate
    // Excluded: additionalInvestment, sellerFinancing, sbaLoan (not personal funding)
  };
  
  // Only calculate for personal funding sources
  const personalSources = ['taiwaneseLoan', 'personalCash', 'houseEquity'];
  
  personalSources.forEach(source => {
    const amount = fundingAllocation.allocation[source] || 0;
    if (amount > 0) {
      totalPersonalFunding += amount;
      weightedPersonalCost += amount * personalCostRates[source];
    }
  });
  
  return totalPersonalFunding > 0 ? (weightedPersonalCost / totalPersonalFunding) * 100 : 0;
};

// Main scenario calculation with priority-based funding
export const calculateScenariosWithPriority = (targetRevenues, variables, fundingSources) => {
  return targetRevenues.map(revenue => {
    // Step 1: Calculate business metrics
    const netMargin = variables.netProfitMargin || 25;
    const valuationMultiple = variables.valuationMultiple || 4;
    const ebitda = revenue * (netMargin / 100);
    const purchasePrice = ebitda * valuationMultiple;
    
    // Log Purchase Price calculation
    if (DEBUG_METRICS) {
      logMetricCalculation(
        "Deal Structure", 
        "Purchase Price",
        {
          targetRevenue: revenue,
          netProfitMargin: netMargin,
          valuationMultiple: valuationMultiple
        },
        "Purchase Price = Target Revenue × Net Profit Margin × Valuation Multiple",
        purchasePrice,
        {
          netProfitMarginSource: "User input assumption",
          valuationMultipleSource: "Market multiple assumption",
          calculation: `${revenue} × ${netMargin}% × ${valuationMultiple}x = ${purchasePrice}`
        }
      );
    }
    
    const businessMetrics = {
      targetRevenue: revenue,
      ebitda: ebitda,
      purchasePrice: purchasePrice
    };
    
    // Step 2: Calculate down payment needed (same logic as Scenario Comparison)
    const downPaymentCalculation = calculateDownPaymentNeeded(businessMetrics, variables);
    
    // Log Down Payment calculation
    if (DEBUG_METRICS) {
      logMetricCalculation(
        "Deal Structure",
        "Down Payment Needed",
        {
          sbaDownPayment: downPaymentCalculation.sbaDownPayment,
          workingCapital: downPaymentCalculation.workingCapital,
          fees: downPaymentCalculation.fees
        },
        "Down Payment = SBA Down Payment + Working Capital + Due Diligence + Professional Fees",
        downPaymentCalculation.downPaymentNeeded,
        {
          workingCapitalPercent: variables.workingCapital || 7.9,
          dueDiligencePercent: 1.5,
          professionalFeesPercent: 1.0,
          calculation: `${downPaymentCalculation.sbaDownPayment} + ${downPaymentCalculation.workingCapital} + ${downPaymentCalculation.fees} = ${downPaymentCalculation.downPaymentNeeded}`
        }
      );
    }
    
    // Step 3: Allocate funding by priority based on down payment needed
    const fundingAllocation = allocateFundingByPriority(
      downPaymentCalculation.downPaymentNeeded, 
      fundingSources
    );
    
    // Step 4: Calculate purchase price financing
    const purchaseFinancing = calculatePurchasePriceFinancing(
      businessMetrics.purchasePrice, 
      fundingAllocation,
      variables
    );
    
    // Step 5: Calculate debt service
    const businessDebtService = calculateBusinessDebtService(purchaseFinancing);
    const personalDebtService = calculatePersonalDebtService(fundingAllocation);
    
    // Step 6: Calculate ownership, WACC, and personal cost of capital
    const ownership = calculatePriorityBasedOwnership(fundingAllocation);
    const wacc = calculatePriorityBasedWACC(fundingAllocation, businessMetrics.purchasePrice);
    const personalCostOfCapital = calculatePersonalCostOfCapital(fundingAllocation);
    
    // Log WACC calculation
    if (DEBUG_METRICS) {
      logMetricCalculation(
        "Deal Structure",
        "WACC",
        {
          fundingAllocation: fundingAllocation.allocation,
          purchasePrice: businessMetrics.purchasePrice
        },
        "WACC = Σ(Weight × After-tax Rate) for all funding sources",
        wacc,
        {
          taxRate: 0.25,
          afterTaxRates: "Calculated based on funding source rates",
          calculation: `Weighted average of all funding source rates`
        }
      );
    }
    
    // Log Personal Cost calculation
    if (DEBUG_METRICS) {
      logMetricCalculation(
        "Deal Structure",
        "Your Personal Cost",
        {
          personalFunding: {
            taiwaneseLoan: fundingAllocation.allocation.taiwaneseLoan,
            personalCash: fundingAllocation.allocation.personalCash,
            houseEquity: fundingAllocation.allocation.houseEquity
          },
          personalCostOfCapital
        },
        "Personal Cost = Weighted average of personal funding sources",
        personalCostOfCapital,
        {
          personalSources: "Taiwanese Loan + Personal Cash + Home Equity",
          calculation: `Weighted average of personal funding rates`
        }
      );
    }
    
    // Step 7: Calculate cash flows
    const businessCashFlow = businessMetrics.ebitda - 
      businessDebtService.totalBusinessDebtService - 
      (variables.managementSalary ?? 100000) - 
      (variables.techInvestment ?? 100000) / 3;
    
    const ownerDistribution = businessCashFlow * ownership.yourOwnership;
    const personalNetCashFlow = ownerDistribution - personalDebtService.totalPersonalDebtService;
    
    // Log Business Cash Flow calculation
    if (DEBUG_METRICS) {
      logMetricCalculation(
        "Business Health",
        "Business Free Cash Flow",
        {
          ebitda: businessMetrics.ebitda,
          businessDebtService: businessDebtService.totalBusinessDebtService,
          managementSalary: variables.managementSalary ?? 100000,
          techInvestment: (variables.techInvestment ?? 100000) / 3
        },
        "Business FCF = EBITDA - Business Debt Service - Management Salary - Tech Investment/3",
        businessCashFlow,
        {
          techInvestmentAmortization: "Amortized over 3 years",
          calculation: `${businessMetrics.ebitda} - ${businessDebtService.totalBusinessDebtService} - ${variables.managementSalary ?? 100000} - ${(variables.techInvestment ?? 100000) / 3} = ${businessCashFlow}`
        }
      );
    }
    
    // Log Personal Cash Flow calculation
    if (DEBUG_METRICS) {
      logMetricCalculation(
        "Personal Returns",
        "Your Net Annual Gain",
        {
          ownerDistribution,
          personalDebtService: personalDebtService.totalPersonalDebtService,
          yourOwnership: ownership.yourOwnership
        },
        "Your Net Annual Gain = Owner Distribution - Personal Debt Service",
        personalNetCashFlow,
        {
          ownerDistributionCalculation: `Business FCF × Your Ownership %`,
          calculation: `${ownerDistribution} - ${personalDebtService.totalPersonalDebtService} = ${personalNetCashFlow}`
        }
      );
    }
    
    // Log ROI calculation
    if (DEBUG_METRICS) {
      const yourTotalCashInvested = fundingAllocation.allocation.personalCash + fundingAllocation.allocation.taiwaneseLoan + fundingAllocation.allocation.houseEquity;
      const yourROI = (personalNetCashFlow / yourTotalCashInvested) * 100;
      
      logMetricCalculation(
        "Personal Returns",
        "Your ROI",
        {
          yourNetAnnualGain: personalNetCashFlow,
          yourTotalCashInvested
        },
        "Your ROI = (Your Net Annual Gain ÷ Your Total Cash Invested) × 100",
        yourROI,
        {
          yourCashInvestedComponents: "Personal Cash + Taiwanese Loan + Home Equity",
          netAnnualGainComponents: "Business Distribution - Personal Debt Service",
          calculation: `(${personalNetCashFlow} ÷ ${yourTotalCashInvested}) × 100 = ${yourROI}%`
        }
      );
    }
    
    return {
      ...businessMetrics,
      ...downPaymentCalculation,
      fundingAllocation,
      purchaseFinancing,
      businessDebtService,
      personalDebtService,
      ownership,
      wacc,
      personalCostOfCapital,
      businessCashFlow,
      ownerDistribution,
      personalNetCashFlow,
      personalROI: (personalNetCashFlow / (fundingAllocation.allocation.personalCash + fundingAllocation.allocation.taiwaneseLoan + fundingAllocation.allocation.houseEquity)) * 100
    };
  });
}; 

// Calculate down payment needed using the same logic as Scenario Comparison
export const calculateDownPaymentNeeded = (scenario, variables) => {
  const purchasePrice = scenario.purchasePrice;
  
  // Calculate SBA down payment
  const sellerFinancingPercent = variables.sellerFinancing || 20;
  const sellerFinancingAmount = purchasePrice * (sellerFinancingPercent / 100);
  const sbaLoanAmount = purchasePrice - sellerFinancingAmount;
  const sbaDownPaymentPercent = variables.sbaDownPayment || 12;
  const sbaDownPayment = sbaLoanAmount * (sbaDownPaymentPercent / 100);
  
  // Calculate working capital and fees (same as Scenario Comparison)
  const workingCapitalPercent = variables.workingCapital || 7.9;
  const workingCapital = scenario.targetRevenue * (workingCapitalPercent / 100);
  const fees = purchasePrice * 0.025; // 2.5% total fees (due diligence + professional fees)
  
  // Down Payment Needed = SBA Down Payment + Working Capital + Fees
  const downPaymentNeeded = sbaDownPayment + workingCapital + fees;
  
  return {
    sbaDownPayment,
    workingCapital,
    fees,
    downPaymentNeeded
  };
}; 

// NEW METRICS CALCULATIONS

// Capital Utilization Rate
export const calculateCapitalUtilizationRate = (totalAllocated, availableCash) => {
  return availableCash > 0 ? (totalAllocated / availableCash) * 100 : 0;
};

export const getCapitalUtilizationStatus = (rate) => {
  if (rate > 95) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (rate > 85) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (rate > 65) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// Leverage Multiplier
export const calculateLeverageMultiplier = (totalInvestment, personalCashInvested) => {
  const result = personalCashInvested > 0 ? totalInvestment / personalCashInvested : 0;
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Deal Structure",
      "Leverage Multiplier",
      {
        totalInvestment,
        personalCashInvested
      },
      "Leverage Multiplier = Total Investment ÷ Personal Cash Invested",
      result,
      {
        interpretation: result >= 8 ? "Excellent leverage" : result >= 5 ? "Good leverage" : result >= 3 ? "Fair leverage" : "Poor leverage",
        calculation: `${totalInvestment} ÷ ${personalCashInvested} = ${result}x`
      }
    );
  }
  
  return result;
};

export const getLeverageMultiplierStatus = (multiplier) => {
  if (multiplier < 3) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (multiplier < 5) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (multiplier < 8) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// Price-to-Revenue Ratio
export const calculatePriceToRevenueRatio = (purchasePrice, targetRevenue) => {
  return targetRevenue > 0 ? purchasePrice / targetRevenue : 0;
};

export const getPriceToRevenueStatus = (ratio) => {
  if (ratio > 1.2) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (ratio > 1.0) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (ratio > 0.8) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// EBITDA Margin
export const calculateEBITDAMargin = (ebitda, revenue) => {
  return revenue > 0 ? (ebitda / revenue) * 100 : 0;
};

export const getEBITDAMarginStatus = (margin) => {
  if (margin < 15) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (margin < 18) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (margin < 22) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// Business Cash Conversion
export const calculateBusinessCashConversion = (businessFreeCashFlow, businessEBITDA) => {
  return businessEBITDA > 0 ? (businessFreeCashFlow / businessEBITDA) * 100 : 0;
};

export const getCashConversionStatus = (conversion) => {
  if (conversion < 15) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (conversion < 20) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (conversion < 30) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// Revenue-to-Investment Efficiency
export const calculateRevenueToInvestmentEfficiency = (targetRevenue, yourTotalInvestment) => {
  return yourTotalInvestment > 0 ? targetRevenue / yourTotalInvestment : 0;
};

export const getRevenueEfficiencyStatus = (efficiency) => {
  if (efficiency < 3) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (efficiency < 4) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (efficiency < 6) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// Risk-Adjusted Return
export const calculateRiskAdjustedReturn = (yourROI, riskFreeRate = 4.5, riskScore) => {
  const result = riskScore > 0 ? (yourROI - riskFreeRate) / riskScore : 0;
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Personal Returns",
      "Risk-Adjusted Return",
      {
        yourROI,
        riskFreeRate,
        riskScore
      },
      "Risk-Adjusted Return = (Your ROI - Risk-Free Rate) ÷ Risk Score",
      result,
      {
        interpretation: result >= 1.5 ? "Excellent risk-adjusted return" : result >= 1.0 ? "Good risk-adjusted return" : result >= 0.5 ? "Fair risk-adjusted return" : "Poor risk-adjusted return",
        calculation: `(${yourROI} - ${riskFreeRate}) ÷ ${riskScore} = ${result}`
      }
    );
  }
  
  return result;
};

export const getRiskAdjustedStatus = (ratio) => {
  if (ratio < 0.5) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (ratio < 1.0) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (ratio < 1.5) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// Income Replacement Ratio
export const calculateIncomeReplacementRatio = (yourNetAnnualGain, currentSalary) => {
  const result = currentSalary > 0 ? (yourNetAnnualGain / currentSalary) * 100 : 0;
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Personal Returns",
      "W-2 Replacement",
      {
        yourNetAnnualGain,
        currentSalary
      },
      "W-2 Replacement = (Your Net Annual Gain ÷ Current Salary) × 100",
      result,
      {
        interpretation: result >= 120 ? "Excellent replacement" : result >= 80 ? "Good replacement" : result >= 40 ? "Fair replacement" : "Poor replacement",
        calculation: `(${yourNetAnnualGain} ÷ ${currentSalary}) × 100 = ${result}%`
      }
    );
  }
  
  return result;
};

export const getIncomeReplacementStatus = (ratio) => {
  if (ratio < 40) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (ratio < 80) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (ratio < 120) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// Wealth Building Velocity
export const calculateWealthBuildingVelocity = (totalReturnMultiple, investmentPeriod = 5) => {
  const annualWealthCreation = Math.pow(totalReturnMultiple, 1/investmentPeriod) - 1;
  const result = annualWealthCreation * 100;
  
  if (DEBUG_METRICS) {
    logMetricCalculation(
      "Personal Returns",
      "Wealth Velocity",
      {
        totalReturnMultiple,
        investmentPeriod
      },
      "Wealth Velocity = Annual wealth creation rate from total return multiple",
      result,
      {
        interpretation: result >= 80 ? "Excellent velocity" : result >= 40 ? "Good velocity" : result >= 20 ? "Fair velocity" : "Poor velocity",
        calculation: `Annual wealth creation from ${totalReturnMultiple}x return over ${investmentPeriod} years = ${result}%`
      }
    );
  }
  
  return result;
};

export const getWealthVelocityStatus = (velocity) => {
  if (velocity < 20) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (velocity < 40) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (velocity < 80) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// 5-Year Exit Value Range
export const calculateExitValueRange = (year5EBITDA, yourOwnership, conservativeMultiple = 3.0, expectedMultiple = 3.59, optimisticMultiple = 4.5) => {
  return {
    conservative: year5EBITDA * conservativeMultiple * yourOwnership,
    expected: year5EBITDA * expectedMultiple * yourOwnership,
    optimistic: year5EBITDA * optimisticMultiple * yourOwnership
  };
};

// Stress Test Results
export const calculateStressTestResults = (baseROI, revenueStress = -20, marginStress = -300, rateStress = 200) => {
  // Simplified stress test calculations
  const revenueStressROI = baseROI * (1 + revenueStress / 100);
  const marginStressROI = baseROI * (1 + marginStress / 10000); // basis points
  const rateStressROI = baseROI * (1 - rateStress / 10000); // basis points
  
  const minROI = Math.min(revenueStressROI, marginStressROI, rateStressROI);
  
  return {
    revenueStressROI,
    marginStressROI,
    rateStressROI,
    minROI
  };
};

export const getStressTestStatus = (minROI) => {
  if (minROI < 5) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (minROI < 7) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (minROI < 10) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
};

// Growth Funding Capacity
export const calculateGrowthFundingCapacity = (maxSustainableDebt, currentTotalDebt, projectedYear3CashFlow, leverageMultiplier) => {
  const currentDebtCapacity = maxSustainableDebt - currentTotalDebt;
  const cashFlowGrowthCapacity = projectedYear3CashFlow * leverageMultiplier;
  return Math.min(currentDebtCapacity, cashFlowGrowthCapacity);
};

export const getGrowthCapacityStatus = (capacity) => {
  if (capacity < 50000) return { color: '#E74C3C', level: 'critical', label: 'Critical' };
  if (capacity < 100000) return { color: '#F1C40F', level: 'below-target', label: 'Below Target' };
  if (capacity < 200000) return { color: '#27AE60', level: 'good', label: 'Good' };
  return { color: '#3498DB', level: 'excellent', label: 'Excellent' };
}; 