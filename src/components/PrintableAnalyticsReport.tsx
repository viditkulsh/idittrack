import React from 'react';

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface PrintableAnalyticsReportProps {
  analytics: any;
  companyName?: string;
  reportDate?: string;
}

export const PrintableAnalyticsReport: React.FC<PrintableAnalyticsReportProps> = ({ 
  analytics, 
  companyName = "Your Company Name",
  reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}) => {
  return (
    <div className="print-report" style={{ 
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.4',
      color: '#000000'
    }}>
      {/* Enhanced Print Styles */}
      <style>{`
        @media print {
          .print-report {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 15mm !important;
          }
          .page-break {
            page-break-before: always !important;
          }
          .avoid-break {
            page-break-inside: avoid !important;
          }
          .no-print {
            display: none !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        .header-section {
          border-bottom: 3px solid #3B82F6;
          margin-bottom: 30px;
          padding-bottom: 20px;
        }
        .section-title {
          background: #F3F4F6;
          padding: 10px 15px;
          border-left: 4px solid #3B82F6;
          margin: 20px 0 15px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 15px 0;
        }
        .metric-card {
          border: 1px solid #E5E7EB;
          padding: 15px;
          border-radius: 6px;
          background: #FAFAFA;
          text-align: center;
        }
        .metric-value {
          font-size: 20px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 5px;
        }
        .metric-label {
          font-size: 11px;
          color: #6B7280;
        }
        .table-style {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 11px;
        }
        .table-style th, .table-style td {
          border: 1px solid #E5E7EB;
          padding: 8px 10px;
          text-align: left;
          vertical-align: top;
        }
        .table-style th {
          background: #F9FAFB;
          font-weight: bold;
        }
        .classification-a { background: #FEF2F2; color: #B91C1C; }
        .classification-b { background: #FFFBEB; color: #D97706; }
        .classification-c { background: #F0FDF4; color: #166534; }
        .vital { background: #FEF2F2; color: #B91C1C; }
        .essential { background: #FFFBEB; color: #D97706; }
        .desirable { background: #F0FDF4; color: #166534; }
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .conclusion-box {
          background: #F8FAFC;
          padding: 20px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          margin: 20px 0;
        }
        @media print {
          .metric-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px !important;
          }
          .metric-card {
            padding: 10px !important;
          }
          .metric-value {
            font-size: 16px !important;
          }
          .metric-label {
            font-size: 9px !important;
          }
          .table-style {
            font-size: 9px !important;
          }
          .table-style th, .table-style td {
            padding: 6px 8px !important;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="header-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#1F2937' }}>
              {companyName}
            </h1>
            <h2 style={{ fontSize: '20px', color: '#3B82F6', margin: '0 0 5px 0' }}>
              Comprehensive Business Intelligence & Inventory Analytics Report
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0' }}>
              Generated on: {reportDate}
            </p>
          </div>
          <div style={{ textAlign: 'right', color: '#6B7280' }}>
            <p style={{ margin: '0', fontSize: '12px' }}>Executive Summary</p>
            <p style={{ margin: '0', fontSize: '12px' }}>Strategic Analysis & Recommendations</p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="section-title">📊 EXECUTIVE SUMMARY</div>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.profitability.totalRevenue)}</div>
          <div className="metric-label">Total Revenue</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.profitability.grossProfit)}</div>
          <div className="metric-label">Gross Profit</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.profitability.profitMargin.toFixed(1)}%</div>
          <div className="metric-label">Profit Margin</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.products.total}</div>
          <div className="metric-label">Total Products</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.orders.total}</div>
          <div className="metric-label">Total Orders</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.inventory.totalValue)}</div>
          <div className="metric-label">Inventory Value</div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="section-title">🎯 KEY PERFORMANCE INDICATORS</div>
      <table className="table-style">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Current Value</th>
            <th>Industry Benchmark</th>
            <th>Status</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Inventory Turnover</td>
            <td>{analytics.financialRatios.inventoryTurnover.toFixed(1)}x</td>
            <td>8-12x</td>
            <td>{analytics.financialRatios.inventoryTurnover >= 8 ? '✅ Good' : '⚠️ Below Target'}</td>
            <td>{analytics.financialRatios.inventoryTurnover < 8 ? 'Increase turnover rate' : 'Maintain current level'}</td>
          </tr>
          <tr>
            <td>Gross Margin</td>
            <td>{analytics.financialRatios.grossMargin.toFixed(1)}%</td>
            <td>30-40%</td>
            <td>{analytics.financialRatios.grossMargin >= 30 ? '✅ Healthy' : '⚠️ Needs Improvement'}</td>
            <td>{analytics.financialRatios.grossMargin < 30 ? 'Focus on high-margin products' : 'Maintain pricing strategy'}</td>
          </tr>
          <tr>
            <td>Stockout Rate</td>
            <td>{analytics.financialRatios.stockoutRate.toFixed(1)}%</td>
            <td>&lt; 5%</td>
            <td>{analytics.financialRatios.stockoutRate <= 5 ? '✅ Excellent' : '⚠️ High Risk'}</td>
            <td>{analytics.financialRatios.stockoutRate > 5 ? 'Improve safety stock levels' : 'Continue monitoring'}</td>
          </tr>
          <tr>
            <td>GMROI</td>
            <td>{analytics.advancedMetrics.gmroi.toFixed(1)}%</td>
            <td>150%+</td>
            <td>{analytics.advancedMetrics.gmroi >= 150 ? '✅ Excellent' : '⚠️ Below Target'}</td>
            <td>{analytics.advancedMetrics.gmroi < 150 ? 'Optimize inventory mix' : 'Excellent performance'}</td>
          </tr>
          <tr>
            <td>Days Sales Inventory</td>
            <td>{analytics.advancedMetrics.dsi.toFixed(0)} days</td>
            <td>30-45 days</td>
            <td>{analytics.advancedMetrics.dsi <= 45 ? '✅ Good' : '⚠️ Too High'}</td>
            <td>{analytics.advancedMetrics.dsi > 45 ? 'Reduce inventory levels' : 'Optimal cash flow'}</td>
          </tr>
        </tbody>
      </table>

      <div className="page-break"></div>

      {/* ABC Analysis */}
      <div className="section-title">🏷️ ABC ANALYSIS - INVENTORY CLASSIFICATION</div>
      <p style={{ marginBottom: '15px' }}>
        ABC Analysis categorizes inventory based on revenue contribution using the Pareto Principle (80/20 rule).
        This classification helps prioritize inventory management efforts and resource allocation.
      </p>
      
      <div className="metric-grid">
        <div className="metric-card classification-a">
          <div className="metric-value">{analytics.abcAnalysis.filter((item: any) => item.classification === 'A').length}</div>
          <div className="metric-label">Class A Products (Top 80% Revenue)</div>
        </div>
        <div className="metric-card classification-b">
          <div className="metric-value">{analytics.abcAnalysis.filter((item: any) => item.classification === 'B').length}</div>
          <div className="metric-label">Class B Products (Next 15% Revenue)</div>
        </div>
        <div className="metric-card classification-c">
          <div className="metric-value">{analytics.abcAnalysis.filter((item: any) => item.classification === 'C').length}</div>
          <div className="metric-label">Class C Products (Remaining 5% Revenue)</div>
        </div>
      </div>

      <table className="table-style">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Classification</th>
            <th>Revenue</th>
            <th>Revenue %</th>
            <th>Cumulative %</th>
          </tr>
        </thead>
        <tbody>
          {analytics.abcAnalysis.slice(0, 15).map((item: any) => (
            <tr key={item.id} className={`classification-${item.classification.toLowerCase()}`}>
              <td>{item.name}</td>
              <td>{item.sku}</td>
              <td><strong>{item.classification}</strong></td>
              <td>{formatCurrency(item.revenue)}</td>
              <td>{item.revenuePercentage.toFixed(2)}%</td>
              <td>{item.cumulativePercentage.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Multi-Dimensional Classification */}
      <div className="section-title">🔍 MULTI-DIMENSIONAL INVENTORY CLASSIFICATION</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }}>
        {/* VED Analysis */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#1F2937' }}>VED Analysis (Vital, Essential, Desirable)</h4>
          <table className="table-style">
            <thead>
              <tr>
                <th>Classification</th>
                <th>Count</th>
                <th>Business Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr className="vital">
                <td><strong>Vital</strong></td>
                <td>{analytics.vedAnalysis.filter((item: any) => item.classification === 'Vital').length}</td>
                <td>Critical to operations</td>
              </tr>
              <tr className="essential">
                <td><strong>Essential</strong></td>
                <td>{analytics.vedAnalysis.filter((item: any) => item.classification === 'Essential').length}</td>
                <td>Important for smooth ops</td>
              </tr>
              <tr className="desirable">
                <td><strong>Desirable</strong></td>
                <td>{analytics.vedAnalysis.filter((item: any) => item.classification === 'Desirable').length}</td>
                <td>Nice to have</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* HML Analysis */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#1F2937' }}>HML Analysis (High, Medium, Low Value)</h4>
          <table className="table-style">
            <thead>
              <tr>
                <th>Classification</th>
                <th>Count</th>
                <th>Control Level</th>
              </tr>
            </thead>
            <tbody>
              <tr className="vital">
                <td><strong>High</strong></td>
                <td>{analytics.hmlAnalysis.filter((item: any) => item.classification === 'High').length}</td>
                <td>Strict controls required</td>
              </tr>
              <tr className="essential">
                <td><strong>Medium</strong></td>
                <td>{analytics.hmlAnalysis.filter((item: any) => item.classification === 'Medium').length}</td>
                <td>Standard procedures</td>
              </tr>
              <tr className="desirable">
                <td><strong>Low</strong></td>
                <td>{analytics.hmlAnalysis.filter((item: any) => item.classification === 'Low').length}</td>
                <td>Basic tracking</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }}>
        {/* FSN Analysis */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#1F2937' }}>FSN Analysis (Fast, Slow, Non-moving)</h4>
          <table className="table-style">
            <thead>
              <tr>
                <th>Classification</th>
                <th>Count</th>
                <th>Action Required</th>
              </tr>
            </thead>
            <tbody>
              <tr className="desirable">
                <td><strong>Fast</strong></td>
                <td>{analytics.fsnAnalysis.filter((item: any) => item.classification === 'Fast').length}</td>
                <td>Maintain stock levels</td>
              </tr>
              <tr className="essential">
                <td><strong>Slow</strong></td>
                <td>{analytics.fsnAnalysis.filter((item: any) => item.classification === 'Slow').length}</td>
                <td>Monitor closely</td>
              </tr>
              <tr className="vital">
                <td><strong>Non-moving</strong></td>
                <td>{analytics.fsnAnalysis.filter((item: any) => item.classification === 'Non-moving').length}</td>
                <td>Immediate action needed</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SDE Analysis */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#1F2937' }}>SDE Analysis (Availability)</h4>
          <table className="table-style">
            <thead>
              <tr>
                <th>Classification</th>
                <th>Count</th>
                <th>Procurement Strategy</th>
              </tr>
            </thead>
            <tbody>
              <tr className="vital">
                <td><strong>Scarce</strong></td>
                <td>{analytics.sdeAnalysis.filter((item: any) => item.classification === 'Scarce').length}</td>
                <td>Strategic partnerships</td>
              </tr>
              <tr className="essential">
                <td><strong>Difficult</strong></td>
                <td>{analytics.sdeAnalysis.filter((item: any) => item.classification === 'Difficult').length}</td>
                <td>Multiple suppliers</td>
              </tr>
              <tr className="desirable">
                <td><strong>Easy</strong></td>
                <td>{analytics.sdeAnalysis.filter((item: any) => item.classification === 'Easily Available').length}</td>
                <td>Standard procurement</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="page-break"></div>

      {/* Inventory Optimization */}
      <div className="section-title">⚙️ INVENTORY OPTIMIZATION TECHNIQUES</div>

      {/* EOQ Analysis */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>Economic Order Quantity (EOQ) Analysis</h4>
      <p style={{ marginBottom: '15px' }}>
        EOQ determines optimal order quantities to minimize total inventory costs including ordering and holding costs.
      </p>
      
      <table className="table-style">
        <thead>
          <tr>
            <th>Product</th>
            <th>Annual Demand</th>
            <th>EOQ</th>
            <th>Reorder Point</th>
            <th>Total Cost</th>
            <th>Potential Savings</th>
          </tr>
        </thead>
        <tbody>
          {analytics.inventoryOptimization.eoqAnalysis.slice(0, 10).map((item: any) => (
            <tr key={item.productId}>
              <td>{item.productName}</td>
              <td>{item.annualDemand}</td>
              <td>{item.economicOrderQuantity}</td>
              <td>{item.reorderPoint}</td>
              <td>{formatCurrency(item.totalCost)}</td>
              <td>{formatCurrency(item.totalCost * 0.15)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* JIT Metrics */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>Just-in-Time (JIT) Performance Metrics</h4>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-value">{analytics.inventoryOptimization.jitMetrics.inventoryTurnover.toFixed(1)}x</div>
          <div className="metric-label">Inventory Turnover</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.inventoryOptimization.jitMetrics.wasteReduction.toFixed(1)}%</div>
          <div className="metric-label">Waste Reduction</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.inventoryOptimization.jitMetrics.supplierReliability.toFixed(1)}%</div>
          <div className="metric-label">Supplier Reliability</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.inventoryOptimization.jitMetrics.stockoutFrequency.toFixed(1)}%</div>
          <div className="metric-label">Stockout Frequency</div>
        </div>
      </div>

      {/* Safety Stock Analysis */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>Safety Stock Analysis</h4>
      <table className="table-style">
        <thead>
          <tr>
            <th>Product</th>
            <th>Current Safety Stock</th>
            <th>Recommended Safety Stock</th>
            <th>Service Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {analytics.inventoryOptimization.safetyStockAnalysis.slice(0, 10).map((item: any) => (
            <tr key={item.productId}>
              <td>{item.productName}</td>
              <td>{item.currentSafetyStock}</td>
              <td>{item.recommendedSafetyStock}</td>
              <td>{item.serviceLevel}%</td>
              <td>
                {item.recommendedSafetyStock > item.currentSafetyStock ? 
                  '⚠️ Increase Needed' : 
                  '✅ Adequate'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="page-break"></div>

      {/* Financial Analysis */}
      <div className="section-title">💰 FINANCIAL PERFORMANCE ANALYSIS</div>

      {/* Profitability Metrics */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>Profitability Analysis</h4>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.profitability.totalRevenue)}</div>
          <div className="metric-label">Total Revenue</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.profitability.totalCost)}</div>
          <div className="metric-label">Total Cost</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.profitability.grossProfit)}</div>
          <div className="metric-label">Gross Profit</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.profitability.averageOrderValue)}</div>
          <div className="metric-label">Average Order Value</div>
        </div>
      </div>

      {/* Category Performance */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>Category Performance Analysis</h4>
      <table className="table-style">
        <thead>
          <tr>
            <th>Category</th>
            <th>Revenue</th>
            <th>Profit</th>
            <th>Margin %</th>
            <th>Quantity Sold</th>
            <th>Performance Rating</th>
          </tr>
        </thead>
        <tbody>
          {analytics.categoryPerformance.slice(0, 10).map((category: any) => (
            <tr key={category.category}>
              <td>{category.category}</td>
              <td>{formatCurrency(category.revenue)}</td>
              <td>{formatCurrency(category.profit)}</td>
              <td>{category.margin.toFixed(1)}%</td>
              <td>{category.quantity}</td>
              <td>
                {category.margin > 30 ? '⭐ Excellent' :
                 category.margin > 20 ? '✅ Good' :
                 category.margin > 10 ? '⚠️ Average' : '❌ Poor'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cost Analysis */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>Cost Structure Analysis</h4>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.advancedMetrics.stockoutCost)}</div>
          <div className="metric-label">Stockout Cost (Lost Revenue)</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.advancedMetrics.overheadCarryingCost)}</div>
          <div className="metric-label">Carrying Cost (Annual)</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{analytics.advancedMetrics.obsolescenceRisk.toFixed(1)}%</div>
          <div className="metric-label">Obsolescence Risk</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(analytics.inventoryOptimization.eoqAnalysis.reduce((sum: number, item: any) => sum + item.totalCost * 0.15, 0))}</div>
          <div className="metric-label">Potential EOQ Savings</div>
        </div>
      </div>

      <div className="page-break"></div>

      {/* Strategic Recommendations */}
      <div className="section-title">🎯 STRATEGIC RECOMMENDATIONS & ACTION PLAN</div>

      {/* Immediate Actions (30 Days) */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>🚀 Immediate Actions (30 Days) - Quick Wins</h4>
      <table className="table-style">
        <thead>
          <tr>
            <th>Action Item</th>
            <th>Priority</th>
            <th>Expected Impact</th>
            <th>Resources Required</th>
            <th>Timeline</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Implement ABC analysis for procurement prioritization</td>
            <td>🔴 High</td>
            <td>15-20% efficiency improvement</td>
            <td>1 analyst, 1 week</td>
            <td>Week 1-2</td>
          </tr>
          <tr>
            <td>Set up reorder alerts for Class A + Vital items</td>
            <td>🔴 High</td>
            <td>Prevent stockouts on critical items</td>
            <td>IT support, 2 days</td>
            <td>Week 1</td>
          </tr>
          <tr>
            <td>Review and adjust safety stock levels</td>
            <td>🟡 Medium</td>
            <td>5-10% carrying cost reduction</td>
            <td>Inventory team, 1 week</td>
            <td>Week 2-3</td>
          </tr>
          <tr>
            <td>Identify and plan liquidation of {analytics.fsnAnalysis.filter((item: any) => item.classification === 'Non-moving').length} non-moving items</td>
            <td>🟡 Medium</td>
            <td>Free up {formatCurrency(analytics.advancedMetrics.overheadCarryingCost * 0.2)} in working capital</td>
            <td>Sales team, 2 weeks</td>
            <td>Week 2-4</td>
          </tr>
        </tbody>
      </table>

      {/* Medium-term Optimization (60 Days) */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>⚙️ Medium-term Optimization (60 Days)</h4>
      <table className="table-style">
        <thead>
          <tr>
            <th>Initiative</th>
            <th>Expected Benefit</th>
            <th>Investment Required</th>
            <th>ROI Timeline</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Deploy EOQ calculations for top 50 products</td>
            <td>{formatCurrency(analytics.inventoryOptimization.eoqAnalysis.reduce((sum: number, item: any) => sum + item.totalCost * 0.15, 0))} annual savings</td>
            <td>$5,000 (software + training)</td>
            <td>3-6 months</td>
          </tr>
          <tr>
            <td>Negotiate JIT agreements with key suppliers</td>
            <td>{analytics.inventoryOptimization.jitMetrics.wasteReduction.toFixed(1)}% waste reduction</td>
            <td>$10,000 (negotiation + setup)</td>
            <td>6-12 months</td>
          </tr>
          <tr>
            <td>Implement MRP for production planning</td>
            <td>20-30% reduction in stockouts</td>
            <td>$15,000 (system + implementation)</td>
            <td>6-9 months</td>
          </tr>
          <tr>
            <td>Set up batch tracking system</td>
            <td>Reduce quality risks by 50%</td>
            <td>$8,000 (tracking system)</td>
            <td>3-6 months</td>
          </tr>
        </tbody>
      </table>

      {/* Long-term Strategic Initiatives (90 Days+) */}
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>🎯 Long-term Strategic Initiatives (90+ Days)</h4>
      <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
        <li><strong>Perpetual Inventory System:</strong> Real-time tracking with RFID/barcode integration</li>
        <li><strong>Advanced Demand Forecasting:</strong> AI/ML-powered prediction for seasonal trends</li>
        <li><strong>Supplier Integration:</strong> EDI connections for automated ordering and availability updates</li>
        <li><strong>Performance Dashboard:</strong> Real-time KPI monitoring for all stakeholders</li>
        <li><strong>Mobile Inventory Management:</strong> Warehouse staff mobile access for instant updates</li>
      </ul>

      {/* Risk Assessment */}
      <div className="section-title">⚠️ RISK ASSESSMENT & MITIGATION</div>
      <table className="table-style">
        <thead>
          <tr>
            <th>Risk Factor</th>
            <th>Current Level</th>
            <th>Potential Impact</th>
            <th>Mitigation Strategy</th>
            <th>Timeline</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Stockout Risk</td>
            <td>{analytics.financialRatios.stockoutRate.toFixed(1)}%</td>
            <td>{formatCurrency(analytics.advancedMetrics.stockoutCost)} potential loss</td>
            <td>Implement safety stock optimization</td>
            <td>30 days</td>
          </tr>
          <tr>
            <td>Obsolescence Risk</td>
            <td>{analytics.advancedMetrics.obsolescenceRisk.toFixed(1)}%</td>
            <td>Working capital tied up</td>
            <td>FSN analysis + liquidation plan</td>
            <td>60 days</td>
          </tr>
          <tr>
            <td>Supplier Dependency</td>
            <td>Medium</td>
            <td>Supply chain disruption</td>
            <td>Diversify suppliers for scarce items</td>
            <td>90 days</td>
          </tr>
          <tr>
            <td>Batch Quality Issues</td>
            <td>{analytics.advancedMetrics.batchTracking.qualityIssues} items</td>
            <td>Customer satisfaction impact</td>
            <td>Enhanced batch tracking system</td>
            <td>60 days</td>
          </tr>
        </tbody>
      </table>

      {/* Financial Projections */}
      <div className="section-title">📈 FINANCIAL PROJECTIONS & ROI</div>
      <h4 style={{ margin: '20px 0 10px 0', color: '#1F2937' }}>12-Month Financial Impact Projection</h4>
      <table className="table-style">
        <thead>
          <tr>
            <th>Initiative</th>
            <th>Investment</th>
            <th>Annual Savings</th>
            <th>ROI %</th>
            <th>Payback Period</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ABC + VED Implementation</td>
            <td>$2,000</td>
            <td>{formatCurrency(analytics.profitability.totalRevenue * 0.05)}</td>
            <td>{((analytics.profitability.totalRevenue * 0.05 - 2000) / 2000 * 100).toFixed(0)}%</td>
            <td>1 month</td>
          </tr>
          <tr>
            <td>EOQ Optimization</td>
            <td>$5,000</td>
            <td>{formatCurrency(analytics.inventoryOptimization.eoqAnalysis.reduce((sum: number, item: any) => sum + item.totalCost * 0.15, 0))}</td>
            <td>{((analytics.inventoryOptimization.eoqAnalysis.reduce((sum: number, item: any) => sum + item.totalCost * 0.15, 0) - 5000) / 5000 * 100).toFixed(0)}%</td>
            <td>3 months</td>
          </tr>
          <tr>
            <td>JIT Implementation</td>
            <td>$10,000</td>
            <td>{formatCurrency(analytics.advancedMetrics.overheadCarryingCost * 0.25)}</td>
            <td>{((analytics.advancedMetrics.overheadCarryingCost * 0.25 - 10000) / 10000 * 100).toFixed(0)}%</td>
            <td>6 months</td>
          </tr>
          <tr>
            <td>Safety Stock Optimization</td>
            <td>$3,000</td>
            <td>{formatCurrency(analytics.advancedMetrics.overheadCarryingCost * 0.1)}</td>
            <td>{((analytics.advancedMetrics.overheadCarryingCost * 0.1 - 3000) / 3000 * 100).toFixed(0)}%</td>
            <td>2 months</td>
          </tr>
        </tbody>
      </table>

      {/* Conclusion */}
      <div className="section-title">📋 EXECUTIVE CONCLUSION</div>
      <div className="conclusion-box avoid-break">
        <h4 style={{ margin: '0 0 15px 0', color: '#1E293B' }}>Key Findings:</h4>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Current inventory turnover of <strong>{analytics.financialRatios.inventoryTurnover.toFixed(1)}x</strong> indicates optimization opportunities</li>
          <li><strong>{analytics.abcAnalysis.filter((item: any) => item.classification === 'A').length}</strong> Class A products generate 80% of revenue and require priority focus</li>
          <li><strong>{analytics.fsnAnalysis.filter((item: any) => item.classification === 'Non-moving').length}</strong> non-moving items need immediate liquidation</li>
          <li>Potential annual savings of <strong>{formatCurrency(analytics.inventoryOptimization.eoqAnalysis.reduce((sum: number, item: any) => sum + item.totalCost * 0.15, 0) + analytics.advancedMetrics.overheadCarryingCost * 0.25)}</strong> through optimization</li>
        </ul>
        
        <h4 style={{ margin: '20px 0 15px 0', color: '#1E293B' }}>Recommended Priority Actions:</h4>
        <ol style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Implement multi-dimensional classification (ABC+VED) for strategic inventory management</li>
          <li>Deploy EOQ calculations for top-performing products to optimize order quantities</li>
          <li>Establish JIT partnerships with reliable suppliers to reduce carrying costs</li>
          <li>Set up automated reorder systems based on scientific safety stock calculations</li>
          <li>Develop real-time inventory tracking for improved visibility and control</li>
        </ol>
      </div>

      {/* Footer */}
      <div style={{ 
        borderTop: '2px solid #E5E7EB', 
        paddingTop: '20px', 
        textAlign: 'center', 
        color: '#6B7280',
        fontSize: '10px'
      }}>
        <p>This report was generated by the Comprehensive Business Intelligence & Inventory Analytics System</p>
        <p>For questions or additional analysis, please contact the Business Intelligence Team</p>
        <p style={{ margin: '10px 0 0 0' }}>© 2025 {companyName} - Confidential Business Analysis Report</p>
      </div>
    </div>
  );
};
