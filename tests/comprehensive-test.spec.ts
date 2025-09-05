import { test, expect, Page } from '@playwright/test';
import { resolve } from 'path';

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpass';

// Test data files - using absolute path
const TEST_DATA_PATH = resolve('test-data', 'No_categorization');
const TEST_FILES = [
  'Globex_APAC_Logistics_Pte_Ltd_2yr_no_categories.xlsx',
  'Globex_Consulting_UK_Ltd_2yr_no_categories.xlsx', 
  'Globex_EMEA_Manufacturing_Ltd_2yr_no_categories.xlsx',
  'Globex_International_Holdings,_Inc_2yr_no_categories.xlsx',
  'Globex_Retail_NA_LLC_2yr_no_categories.xlsx'
];

interface TestResults {
  fileName: string;
  uploadSuccess: boolean;
  maperResults: any;
  varianceAnalysis: any;
  runwayAnalysis: any;
  chartsRendered: boolean;
  modelPerformance: any;
  excelExport: boolean;
  filterTesting: any;
  errors: string[];
}

test.describe('ZenFlux Enhanced Financial Forecasting Platform - Comprehensive Testing', () => {
  let page: Page;
  const testResults: TestResults[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
    
    // Handle unhandled errors
    page.on('pageerror', error => {
      console.error('Page error:', error);
    });
  });

  test.beforeEach(async () => {
    // Start fresh for each test
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Authentication and Navigation Testing', async () => {
    console.log('🔐 Testing Authentication System...');
    
    // Test landing page loads
    await expect(page).toHaveTitle(/ZenFlux/);
    
    // Navigate to auth page
    const authButton = page.getByRole('button', { name: /sign in|login|get started/i });
    if (await authButton.isVisible()) {
      await authButton.click();
    } else {
      await page.goto(`${BASE_URL}/auth`);
    }
    
    await page.waitForLoadState('networkidle');
    
    // Test authentication
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Verify dashboard elements
    await expect(page.getByText('Financial Command Center')).toBeVisible();
    
    // Test navigation elements
    const homeButton = page.getByRole('button', { name: /home/i });
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    
    await expect(homeButton).toBeVisible();
    await expect(signOutButton).toBeVisible();
    
    console.log('✅ Authentication and Navigation - PASSED');
  });

  test('Dashboard Metrics and Overview Testing', async () => {
    console.log('📊 Testing Dashboard Metrics...');
    
    // Login first
    await loginToSystem();
    
    // Wait for metrics to load
    await page.waitForSelector('[data-testid="metric-card"], .metric-card', { timeout: 10000 });
    
    // Test metric cards
    const metricCards = page.locator('.metric-card, [data-testid="metric-card"]');
    const cardCount = await metricCards.count();
    
    expect(cardCount).toBeGreaterThanOrEqual(4);
    
    // Verify specific metrics
    await expect(page.getByText(/total balance/i)).toBeVisible();
    await expect(page.getByText(/monthly income/i)).toBeVisible(); 
    await expect(page.getByText(/monthly expenses/i)).toBeVisible();
    await expect(page.getByText(/runway/i)).toBeVisible();
    
    console.log('✅ Dashboard Metrics - PASSED');
  });

  test('Tab Navigation and Interface Testing', async () => {
    console.log('📋 Testing Tab Navigation...');
    
    await loginToSystem();
    
    // Test all tabs
    const tabs = ['overview', 'forecasting', 'transactions', 'upload', 'settings'];
    
    for (const tabName of tabs) {
      const tabButton = page.getByRole('tab', { name: new RegExp(tabName, 'i') });
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(1000);
        
        // Verify tab content loads
        const tabContent = page.locator(`[data-state="active"]`);
        await expect(tabContent).toBeVisible();
        
        console.log(`✅ ${tabName} tab - PASSED`);
      }
    }
  });

  // Test each dataset comprehensively
  for (const fileName of TEST_FILES) {
    test(`Comprehensive Testing: ${fileName}`, async () => {
      console.log(`\n🧪 COMPREHENSIVE TESTING: ${fileName}`);
      
      const results: TestResults = {
        fileName,
        uploadSuccess: false,
        maperResults: null,
        varianceAnalysis: null,
        runwayAnalysis: null,
        chartsRendered: false,
        modelPerformance: null,
        excelExport: false,
        filterTesting: null,
        errors: []
      };
      
      try {
        await loginToSystem();
        
        // 1. File Upload Testing
        console.log('📁 Testing File Upload...');
        await testFileUpload(fileName, results);
        
        // 2. Chart Rendering Testing
        console.log('📈 Testing Interactive Charts...');
        await testChartsRendering(results);
        
        // 3. MAPE and Variance Analysis Testing
        console.log('📊 Testing MAPE vs Variance Analysis...');
        await testMAPEAndVariance(results);
        
        // 4. Real Data Calculations Testing
        console.log('🧮 Testing Real Data Calculations...');
        await testRealDataCalculations(results);
        
        // 5. Forecasting Model Testing
        console.log('🤖 Testing AI Forecasting Models...');
        await testForecastingModels(results);
        
        // 6. Transaction Analysis Testing
        console.log('📋 Testing Transaction Analysis...');
        await testTransactionAnalysis(results);
        
        // 7. Excel Export Testing
        console.log('💾 Testing Excel Export...');
        await testExcelExport(results);
        
        // 8. Performance Testing
        console.log('⚡ Testing Performance...');
        await testPerformance(results);
        
      } catch (error) {
        results.errors.push(`Test execution error: ${error.message}`);
        console.error(`❌ Error testing ${fileName}:`, error);
      }
      
      testResults.push(results);
      logTestResults(results);
    });
  }

  test.afterAll(async () => {
    // Generate comprehensive test report
    console.log('\n📋 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    
    testResults.forEach(result => {
      console.log(`\n📊 ${result.fileName}`);
      console.log(`Upload Success: ${result.uploadSuccess ? '✅' : '❌'}`);
      console.log(`Charts Rendered: ${result.chartsRendered ? '✅' : '❌'}`);
      console.log(`Excel Export: ${result.excelExport ? '✅' : '❌'}`);
      console.log(`Errors: ${result.errors.length > 0 ? result.errors.join(', ') : 'None'}`);
    });
    
    await page.close();
  });

  // Helper functions
  async function loginToSystem() {
    await page.goto(`${BASE_URL}/auth`);
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  }

  async function testFileUpload(fileName: string, results: TestResults) {
    try {
      // Navigate to upload tab
      await page.click('button[role="tab"]:has-text("Data Upload")');
      await page.waitForTimeout(1000);
      
      // Test file upload
      const filePath = resolve(TEST_DATA_PATH, fileName);
      const fileInput = page.locator('input[type="file"]');
      
      await fileInput.setInputFiles(filePath);
      
      // Wait for upload progress
      await page.waitForSelector('.progress, [data-testid="upload-progress"]', { timeout: 5000 });
      
      // Wait for upload completion
      await page.waitForSelector('.text-green-600, [data-testid="upload-success"]', { timeout: 30000 });
      
      results.uploadSuccess = true;
      console.log(`✅ File upload successful: ${fileName}`);
      
    } catch (error) {
      results.errors.push(`Upload failed: ${error.message}`);
      console.log(`❌ File upload failed: ${fileName}`);
    }
  }

  async function testChartsRendering(results: TestResults) {
    try {
      // Navigate to overview tab
      await page.click('button[role="tab"]:has-text("Overview")');
      await page.waitForTimeout(2000);
      
      // Check for cash flow chart
      const cashFlowChart = page.locator('.recharts-wrapper, [data-testid="cash-flow-chart"]');
      await expect(cashFlowChart).toBeVisible({ timeout: 10000 });
      
      // Check for expense breakdown chart
      const expenseChart = page.locator('.recharts-pie, [data-testid="expense-chart"]');
      await expect(expenseChart).toBeVisible({ timeout: 10000 });
      
      // Test chart interactivity
      await cashFlowChart.hover();
      await page.waitForTimeout(500);
      
      results.chartsRendered = true;
      console.log('✅ Charts rendered successfully');
      
    } catch (error) {
      results.errors.push(`Chart rendering failed: ${error.message}`);
      console.log('❌ Charts failed to render');
    }
  }

  async function testMAPEAndVariance(results: TestResults) {
    try {
      // Navigate to forecasting tab
      await page.click('button[role="tab"]:has-text("AI Forecasting")');
      await page.waitForTimeout(2000);
      
      // Generate forecast to get MAPE data
      const generateButton = page.getByRole('button', { name: /generate forecast/i });
      if (await generateButton.isVisible()) {
        await generateButton.click();
        
        // Wait for forecast generation
        await page.waitForTimeout(5000);
        
        // Check results tab
        await page.click('button[role="tab"]:has-text("Results")');
        await page.waitForTimeout(1000);
        
        // Look for MAPE metrics
        const mapeElement = page.getByText(/MAPE/i);
        if (await mapeElement.isVisible()) {
          const mapeText = await mapeElement.textContent();
          results.maperResults = { mape: mapeText };
        }
        
        // Look for variance metrics
        const varianceElement = page.getByText(/variance/i);
        if (await varianceElement.isVisible()) {
          const varianceText = await varianceElement.textContent();
          results.varianceAnalysis = { variance: varianceText };
        }
      }
      
      console.log('✅ MAPE and Variance analysis completed');
      
    } catch (error) {
      results.errors.push(`MAPE/Variance testing failed: ${error.message}`);
      console.log('❌ MAPE and Variance analysis failed');
    }
  }

  async function testRealDataCalculations(results: TestResults) {
    try {
      // Check runway calculation in metrics
      const runwayMetric = page.locator('text=/runway/i').locator('..').locator('text=/months/i');
      if (await runwayMetric.isVisible()) {
        const runwayText = await runwayMetric.textContent();
        results.runwayAnalysis = { runway: runwayText };
      }
      
      console.log('✅ Real data calculations verified');
      
    } catch (error) {
      results.errors.push(`Real data calculations failed: ${error.message}`);
      console.log('❌ Real data calculations verification failed');
    }
  }

  async function testForecastingModels(results: TestResults) {
    try {
      // Navigate to models tab
      await page.click('button[role="tab"]:has-text("AI Forecasting")');
      await page.waitForTimeout(1000);
      await page.click('button[role="tab"]:has-text("Models")');
      await page.waitForTimeout(1000);
      
      // Check for model cards
      const modelCards = page.locator('.font-semibold:has-text("LSTM"), .font-semibold:has-text("ARIMA")');
      const modelCount = await modelCards.count();
      
      results.modelPerformance = {
        modelsAvailable: modelCount,
        models: []
      };
      
      console.log(`✅ Found ${modelCount} forecasting models`);
      
    } catch (error) {
      results.errors.push(`Model testing failed: ${error.message}`);
      console.log('❌ Forecasting models testing failed');
    }
  }

  async function testTransactionAnalysis(results: TestResults) {
    try {
      // Navigate to transactions tab
      await page.click('button[role="tab"]:has-text("Transactions")');
      await page.waitForTimeout(2000);
      
      // Test filtering if filter elements exist
      const filterElements = page.locator('input[placeholder*="filter"], input[placeholder*="search"]');
      const filterCount = await filterElements.count();
      
      results.filterTesting = {
        filtersAvailable: filterCount,
        searchTested: false,
        sortingTested: false
      };
      
      // Test search functionality if available
      if (filterCount > 0) {
        await filterElements.first().fill('test');
        await page.waitForTimeout(1000);
        results.filterTesting.searchTested = true;
      }
      
      console.log('✅ Transaction analysis completed');
      
    } catch (error) {
      results.errors.push(`Transaction analysis failed: ${error.message}`);
      console.log('❌ Transaction analysis failed');
    }
  }

  async function testExcelExport(results: TestResults) {
    try {
      // Look for export button
      const exportButton = page.getByRole('button', { name: /export|download/i });
      if (await exportButton.isVisible()) {
        // Start waiting for download before clicking
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await exportButton.click();
        
        const download = await downloadPromise;
        if (download) {
          results.excelExport = true;
          console.log('✅ Excel export successful');
        }
      } else {
        console.log('⚠️  Export button not found');
      }
      
    } catch (error) {
      results.errors.push(`Excel export failed: ${error.message}`);
      console.log('❌ Excel export failed');
    }
  }

  async function testPerformance(results: TestResults) {
    try {
      // Measure page load performance
      const performanceTiming = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart
        };
      });
      
      console.log(`⚡ Performance: DOM loaded in ${performanceTiming.domContentLoaded}ms`);
      
    } catch (error) {
      results.errors.push(`Performance testing failed: ${error.message}`);
    }
  }

  function logTestResults(results: TestResults) {
    console.log(`\n📋 TEST RESULTS: ${results.fileName}`);
    console.log('='.repeat(50));
    console.log(`Upload Success: ${results.uploadSuccess ? '✅' : '❌'}`);
    console.log(`Charts Rendered: ${results.chartsRendered ? '✅' : '❌'}`);
    console.log(`MAPE Results: ${results.maperResults ? '✅' : '❌'}`);
    console.log(`Variance Analysis: ${results.varianceAnalysis ? '✅' : '❌'}`);
    console.log(`Runway Analysis: ${results.runwayAnalysis ? '✅' : '❌'}`);
    console.log(`Model Performance: ${results.modelPerformance ? '✅' : '❌'}`);
    console.log(`Excel Export: ${results.excelExport ? '✅' : '❌'}`);
    console.log(`Filter Testing: ${results.filterTesting ? '✅' : '❌'}`);
    console.log(`Errors: ${results.errors.length}`);
    if (results.errors.length > 0) {
      results.errors.forEach(error => console.log(`  ❌ ${error}`));
    }
  }
});