// Test script to verify debug logging functionality
const { 
  DEBUG_METRICS, 
  logMetricCalculation, 
  logAllMetricsSummary,
  calculateDSCR,
  calculateCashOnCashReturn,
  calculateMOIC,
  calculatePaybackPeriod,
  calculateEnhancedRiskScore
} = require('./src/utils/calculations.js');

console.log('🧪 TESTING DEBUG LOGGING FUNCTIONALITY');
console.log('=====================================');

// Test basic logging
if (DEBUG_METRICS) {
  console.log('✅ DEBUG_METRICS is enabled');
  
  // Test DSCR calculation
  const dscr = calculateDSCR(500000, 300000);
  console.log(`DSCR Result: ${dscr}x`);
  
  // Test Cash-on-Cash calculation
  const cashOnCash = calculateCashOnCashReturn(100000, 500000);
  console.log(`Cash-on-Cash Result: ${cashOnCash}%`);
  
  // Test MOIC calculation
  const fiveYearProjections = [
    { cashFlow: 100000, ebitda: 200000 },
    { cashFlow: 110000, ebitda: 220000 },
    { cashFlow: 120000, ebitda: 240000 },
    { cashFlow: 130000, ebitda: 260000 },
    { cashFlow: 140000, ebitda: 280000 }
  ];
  const moic = calculateMOIC(500000, fiveYearProjections);
  console.log(`MOIC Result: ${moic}x`);
  
  // Test Payback Period
  const payback = calculatePaybackPeriod(500000, fiveYearProjections);
  console.log(`Payback Period: ${payback} years`);
  
  // Test Risk Score
  const riskScore = calculateEnhancedRiskScore(1.5, 20, 25);
  console.log(`Risk Score: ${riskScore}/10`);
  
  console.log('\n📊 All debug logging tests completed successfully!');
} else {
  console.log('❌ DEBUG_METRICS is disabled');
} 