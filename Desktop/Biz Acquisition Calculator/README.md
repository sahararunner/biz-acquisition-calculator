# Business Acquisition Calculator

A comprehensive React-based interactive calculator for evaluating business acquisition scenarios with probability-weighted analysis based on 2025 market research.

## 🚀 Features

### Core Functionality
- **Interactive Sliders**: Real-time control over all acquisition variables
- **Probability-Weighted Analysis**: Three scenarios (Best Case, Most Likely, Worst Case) with customizable probabilities
- **Auto-Normalization**: Probabilities automatically sum to 100%
- **Real-time Calculations**: Instant updates as you adjust parameters
- **Local Storage**: Saves your configuration automatically

### Key Variables (2025 Market Data)
1. **SBA Down Payment %** (8-18%, centered at 12%)
2. **Seller Financing %** (0-40%, centered at 18%)
3. **Valuation Multiple** (3.0-6.0x EBITDA, centered at 4.2x)
4. **Net Profit Margin %** (15-35%, centered at 25%)
5. **Revenue Growth Rate %** (0-20%, centered at 8%)
6. **Working Capital % of Revenue** (5-25%, centered at 12%)
7. **Management Salary $** (0-150K, centered at 75K)
8. **Tech Investment Year 1 $** (10K-200K, centered at 60K)

### Results Dashboard
- **Total Cash Required**: Breakdown of all acquisition costs
- **Annual Cash Flow**: Projected cash to pocket after debt service
- **Financing Structure**: SBA loan, seller financing, and down payment details
- **Risk Assessment**: 1-10 risk score with color-coded indicators

### Visualizations
- **Scenario Comparison Chart**: Cash required vs annual cash flow across scenarios
- **Cash Breakdown Pie Chart**: Where your money goes
- **Financing Structure Chart**: Loan and equity breakdown
- **5-Year Projections**: Revenue and cash flow growth over time
- **Bell Curve Distributions**: Probability distributions for each variable

### Market Intelligence
- Current SBA rates (11.5%)
- Austin market premiums (+15%)
- Seller financing trends (80% of deals)
- Valuation ranges for IT services

## 🛠️ Technology Stack

- **React 18** with hooks and functional components
- **Recharts** for data visualizations
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Local Storage** for state persistence

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd business-acquisition-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🎯 Usage

### Getting Started
1. **Set Key Parameters**: Adjust purchase price, target revenue, and available cash
2. **Review Results**: Check the dashboard for immediate feedback
3. **Fine-tune Variables**: Expand variable cards to adjust scenarios and probabilities
4. **Analyze Visualizations**: Use charts to understand the deal structure
5. **Export Results**: Save your analysis for later reference

### Key Parameters
- **Purchase Price**: $1.5M - $3.5M (default: $2.5M)
- **Target Revenue**: $1.2M - $3.0M (default: $2.0M)
- **Available Cash**: $200K - $1M (default: $500K)

### Variable Controls
Each variable has:
- **Three scenario sliders** (Best Case, Most Likely, Worst Case)
- **Three probability sliders** (auto-normalized to 100%)
- **Real-time expected value calculation**
- **Bell curve visualization**
- **Constraint warnings** for SBA/market rules

### Understanding Results

#### Cash Required Breakdown
- **SBA Down Payment**: Based on loan amount and down payment %
- **Working Capital**: Revenue × Working Capital %
- **Due Diligence**: Purchase Price × 1.5%
- **Professional Fees**: Purchase Price × 0.8%
- **Tech Investment**: Year 1 amount
- **Contingency**: Purchase Price × 2.5%

#### Annual Cash Flow
- **EBITDA**: Revenue × Net Profit Margin %
- **Less**: SBA debt service (10-year term, 11.5% rate)
- **Less**: Seller note payments (5-year term, 8% rate)
- **Less**: Management salary
- **Less**: Tech investment (amortized over 3 years)

#### Risk Assessment
- **Low Risk (1-3)**: Strong deal structure
- **Medium Risk (4-6)**: Moderate risk level
- **High Risk (7-10)**: Review required

## 📊 Market Data (2025)

### SBA Loan Terms
- **Interest Rate**: 11.5% (current market rate)
- **Term**: 10 years for business acquisition
- **Guarantee**: 75% for loans over $150K, 85% for loans under $150K
- **Maximum**: $5 million
- **Minimum Down Payment**: 10% (June 2025 rules)

### Seller Financing Terms
- **Interest Rate**: 8% (market standard)
- **Term**: 5 years typical
- **Subordination**: Always subordinate to SBA financing

### Fixed Costs
- **Due Diligence**: 1.5% of purchase price
- **Professional Fees**: 0.8% of purchase price
- **Contingency**: 2.5% of purchase price

## 🎨 Design Features

### Color Coding
- **Best Case**: Green (#10B981)
- **Most Likely**: Blue (#3B82F6)
- **Worst Case**: Red (#EF4444)
- **Expected Value**: Purple (#8B5CF6)

### Responsive Design
- Mobile-first approach
- Smooth animations and transitions
- Accessible keyboard navigation
- High contrast mode support

## 🔧 Customization

### Adding New Variables
1. Add variable definition to `src/utils/variables.js`
2. Update calculation functions in `src/utils/calculations.js`
3. Add variable card to the main interface

### Modifying Market Rates
Update constants in `src/utils/variables.js`:
```javascript
export const MARKET_RATES = {
  sba: {
    interestRate: 0.115, // Update current rate
    // ... other settings
  }
};
```

## 📈 Performance Features

- **Debounced calculations** (300ms delay after slider changes)
- **Memoized expensive calculations** using useMemo
- **Optimized re-renders** using React.memo
- **Local storage persistence** for user inputs

## 🚨 Validation & Constraints

### SBA Rules
- Minimum 10% down payment
- Maximum $5 million loan amount
- Debt service coverage ratio validation

### Market Constraints
- Seller financing typically 0-40% of purchase price
- Working capital should not exceed 25% of revenue
- Valuation multiples based on industry standards

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ for business decision-makers** 