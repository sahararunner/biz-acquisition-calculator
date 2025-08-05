// Variable definitions with 2025 market data ranges
export const VARIABLES = {
  sbaDownPayment: {
    name: "SBA Down Payment %",
    description: "Required down payment percentage for SBA loan",
    unit: "%",
    range: { min: 8, max: 18 },
    defaultValue: 12,
    constraint: "Minimum 10% per June 2025 SBA rules",
    color: "best-case"
  },
  sellerFinancing: {
    name: "Seller Financing %",
    description: "Percentage of purchase price financed by seller",
    unit: "%",
    range: { min: 0, max: 40 },
    defaultValue: 20,
    color: "most-likely"
  },
  valuationMultiple: {
    name: "Valuation Multiple",
    description: "EBITDA multiple for business valuation",
    unit: "x EBITDA",
    range: { min: 3.0, max: 6.0 },
    defaultValue: 4.2,
    color: "expected-value"
  },
  netProfitMargin: {
    name: "Net Profit Margin %",
    description: "Net profit margin as percentage of revenue",
    unit: "%",
    range: { min: 15, max: 35 },
    defaultValue: 25,
    color: "success"
  },
  revenueGrowthRate: {
    name: "Revenue Growth Rate %",
    description: "Annual revenue growth rate",
    unit: "%",
    range: { min: 0, max: 20 },
    defaultValue: 8,
    color: "best-case"
  },
  workingCapital: {
    name: "Working Capital % of Revenue",
    description: "Working capital as percentage of annual revenue",
    unit: "%",
    range: { min: 5, max: 25 },
    defaultValue: 12,
    color: "most-likely"
  },
  managementSalary: {
    name: "Management Salary $",
    description: "Annual management salary requirement",
    unit: "$",
    range: { min: 0, max: 150000 },
    defaultValue: 75000,
    color: "worst-case"
  },
  techInvestment: {
    name: "Tech Investment Year 1 $",
    description: "First year technology investment",
    unit: "$",
    range: { min: 10000, max: 200000 },
    defaultValue: 60000,
    color: "expected-value"
  }
};

// Key parameters with default values
export const KEY_PARAMETERS = {
  purchasePrice: {
    name: "Purchase Price",
    description: "Total purchase price for the business",
    unit: "$",
    range: { min: 1500000, max: 3500000 },
    defaultValue: 2500000
  },
  targetRevenue: {
    name: "Target Annual Revenue",
    description: "Expected annual revenue for the business",
    unit: "$",
    range: { min: 1200000, max: 3000000 },
    defaultValue: 2000000
  },
  availableCash: {
    name: "Available Cash",
    description: "Total cash available for the acquisition",
    unit: "$",
    range: { min: 200000, max: 1000000 },
    defaultValue: 500000
  }
};

// Market rates and terms
export const MARKET_RATES = {
  sba: {
    interestRate: 0.115,
    term: 10,
    guarantee: { over150k: 0.75, under150k: 0.85 },
    maximum: 5000000
  },
  sellerFinancing: {
    interestRate: 0.08,
    term: 5
  },
  fixedCosts: {
    dueDiligence: 0.015,
    professionalFees: 0.008,
    contingency: 0.025
  }
};

// DEFAULT SCENARIO - Realistic business acquisition parameters
export const DEFAULT_SCENARIO = {
  variables: {
    // Revenue and Profitability
    targetRevenue: 2500000, // $2.5M target revenue
    netProfitMargin: 25, // 25% net profit margin (typical for service businesses)
    revenueGrowthRate: 8, // 8% annual revenue growth
    
    // Valuation
    valuationMultiple: 4, // 4x EBITDA multiple (reasonable for small businesses)
    
    // Financing Structure
    sbaDownPayment: 12, // 12% SBA minimum down payment
    sbaInterestRate: 11.5, // 11.5% SBA interest rate
    sellerFinancing: 20, // 20% seller financing
    sellerInterestRate: 8, // 8% seller note rate
    
    // Working Capital and Fees
    workingCapital: 10, // 10% of revenue for working capital
    dueDiligencePercent: 1.5, // 1.5% of purchase price
    professionalFeesPercent: 0.8, // 0.8% of purchase price
    
    // Operating Costs
    managementSalary: 100000, // $100K management salary
    techInvestment: 100000, // $100K tech investment (amortized over 3 years)
    currentSalary: 100000, // $100K current employment salary
    
    // Risk Parameters
    contingencyPercent: 2.5, // 2.5% contingency
    taxRate: 25, // 25% effective tax rate
    equityCost: 15, // 15% business equity cost
    sweatEquityValue: 150000 // $150K sweat equity value
  }
};

// INTEREST RATES AND TERMS
export const LOAN_TERMS = {
  taiwaneseLoan: {
    rate: 0.028, // 2.8% interest rate
    term: 10, // 10-year term
    riskWeight: 0.8 // 80% risk weight (personal guarantee)
  },
  houseEquity: {
    rate: 0.08, // 8% interest rate
    term: 15, // 15-year term
    riskWeight: 1.2 // 120% risk weight (higher risk premium)
  },
  sbaLoan: {
    rate: 0.115, // 11.5% interest rate
    term: 10, // 10-year term
    taxBenefit: 0.75 // 25% tax benefit (business deductible)
  },
  sellerFinancing: {
    rate: 0.08, // 8% interest rate
    term: 5, // 5-year term
    taxBenefit: 0.9 // 10% tax benefit (less deductible)
  }
};

// EXPECTED RANGES FOR VALIDATION
export const EXPECTED_RANGES = {
  businessWACC: { min: 7, max: 12 }, // 7-12% business WACC
  businessEVA: { min: 0, max: 200000 }, // $0-$200K EVA
  ownership: { min: 0.6, max: 0.95 }, // 60-95% ownership
  personalROI: { min: 10, max: 30 }, // 10-30% personal ROI
  businessDSCR: { min: 1.25, max: 2.5 } // 1.25-2.5x DSCR
}; 