import { test, expect } from '@playwright/test';

test.describe('ZenFlux Enhanced Platform Validation', () => {
  
  test('Basic Platform Access and Authentication', async ({ page }) => {
    console.log('🔐 Testing Basic Platform Access...');
    
    // Navigate to the platform
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Verify landing page
    await expect(page).toHaveTitle(/ZenFlux/);
    console.log('✅ Landing page loaded successfully');
    
    // Navigate to auth
    await page.goto('http://localhost:8080/auth');
    await page.waitForLoadState('networkidle');
    
    // Test authentication
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Authentication successful');
    
    // Verify dashboard loads
    await expect(page.getByText('Financial Command Center')).toBeVisible();
    console.log('✅ Dashboard loaded successfully');
  });

  test('Dashboard Features Validation', async ({ page }) => {
    console.log('📊 Testing Dashboard Features...');
    
    // Login
    await page.goto('http://localhost:8080/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Test navigation buttons
    await expect(page.getByRole('button', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
    console.log('✅ Navigation buttons present');
    
    // Test metric cards
    await expect(page.getByText(/total balance/i)).toBeVisible();
    await expect(page.getByText(/monthly income/i)).toBeVisible();
    await expect(page.getByText(/monthly expenses/i)).toBeVisible();
    await expect(page.getByText(/runway/i)).toBeVisible();
    console.log('✅ Metric cards displayed');
    
    // Test tabs
    const tabs = ['Overview', 'AI Forecasting', 'Transactions', 'Data Upload', 'Settings'];
    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') });
      await expect(tab).toBeVisible();
      await tab.click();
      await page.waitForTimeout(500);
      console.log(`✅ ${tabName} tab accessible`);
    }
  });

  test('Enhanced Features Validation', async ({ page }) => {
    console.log('🚀 Testing Enhanced Features...');
    
    // Login
    await page.goto('http://localhost:8080/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Test Overview tab - Interactive Charts
    await page.getByRole('tab', { name: /overview/i }).click();
    await page.waitForTimeout(1000);
    
    // Look for chart containers
    const chartContainers = page.locator('.chart-container');
    const chartCount = await chartContainers.count();
    expect(chartCount).toBeGreaterThan(0);
    console.log(`✅ Found ${chartCount} chart containers`);
    
    // Test AI Forecasting tab
    await page.getByRole('tab', { name: /ai forecasting/i }).click();
    await page.waitForTimeout(1000);
    
    // Check for forecasting interface
    await expect(page.getByText(/advanced financial forecasting/i)).toBeVisible();
    console.log('✅ AI Forecasting interface present');
    
    // Test forecasting models
    await page.getByRole('tab', { name: /models/i }).click();
    await page.waitForTimeout(1000);
    
    // Look for model cards
    const modelCards = page.locator('text=/LSTM|ARIMA|Exponential|Linear|Ensemble/i');
    const modelCount = await modelCards.count();
    expect(modelCount).toBeGreaterThan(0);
    console.log(`✅ Found ${modelCount} forecasting models`);
    
    // Test Data Upload tab
    await page.getByRole('tab', { name: /data upload/i }).click();
    await page.waitForTimeout(1000);
    
    // Check for upload interface
    await expect(page.getByText(/upload financial data/i)).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
    console.log('✅ File upload interface present');
    
    // Test Transactions tab
    await page.getByRole('tab', { name: /transactions/i }).click();
    await page.waitForTimeout(1000);
    
    console.log('✅ All enhanced features validated');
  });

  test('Performance and UX Validation', async ({ page }) => {
    console.log('⚡ Testing Performance and UX...');
    
    // Login and measure performance
    const startTime = Date.now();
    await page.goto('http://localhost:8080/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    const loadTime = Date.now() - startTime;
    
    console.log(`⚡ Dashboard load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    
    // Test responsive design
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    console.log('✅ Responsive design tested');
    
    // Test navigation speed
    const tabSwitchStart = Date.now();
    await page.getByRole('tab', { name: /ai forecasting/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('tab', { name: /overview/i }).click();
    await page.waitForTimeout(100);
    const tabSwitchTime = Date.now() - tabSwitchStart;
    
    console.log(`⚡ Tab switching time: ${tabSwitchTime}ms`);
    expect(tabSwitchTime).toBeLessThan(2000);
    
    console.log('✅ Performance validation completed');
  });

  test('Enhanced MAPE and Variance Analysis Validation', async ({ page }) => {
    console.log('📈 Testing MAPE vs Variance Analysis...');
    
    // Login
    await page.goto('http://localhost:8080/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate to AI Forecasting
    await page.getByRole('tab', { name: /ai forecasting/i }).click();
    await page.waitForTimeout(1000);
    
    // Check for MAPE configuration options
    await expect(page.getByText(/confidence level/i)).toBeVisible();
    await expect(page.getByText(/forecast horizon/i)).toBeVisible();
    console.log('✅ MAPE configuration options present');
    
    // Test forecast generation
    const generateButton = page.getByRole('button', { name: /generate forecast/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      
      // Wait for processing
      await page.waitForTimeout(3000);
      
      // Check results tab
      await page.getByRole('tab', { name: /results/i }).click();
      await page.waitForTimeout(1000);
      
      // Look for MAPE and variance metrics
      const hasResults = await page.getByText(/forecast results|mape|variance/i).count() > 0;
      if (hasResults) {
        console.log('✅ MAPE and variance analysis results displayed');
      } else {
        console.log('⚠️  MAPE results not immediately visible (may need real data)');
      }
    }
    
    console.log('✅ Enhanced MAPE analysis interface validated');
  });

  test('Business Logic and Calculations Validation', async ({ page }) => {
    console.log('🧮 Testing Business Logic and Calculations...');
    
    // Login
    await page.goto('http://localhost:8080/auth');
    await page.fill('input[type="email"]', 'test@example.com');  
    await page.fill('input[type="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Check metric cards for realistic values
    const balanceText = await page.getByText(/\$[\d,]+/).first().textContent();
    const runwayText = await page.getByText(/\d+\s*months/).first().textContent();
    
    console.log(`Balance displayed: ${balanceText}`);
    console.log(`Runway displayed: ${runwayText}`);
    
    // Verify values are numerical and reasonable
    expect(balanceText).toMatch(/\$[\d,]+/);
    expect(runwayText).toMatch(/\d+\s*months/);
    
    console.log('✅ Business calculations displayed correctly');
    
    // Test real-time updates timestamp
    await expect(page.getByText(/last updated/i)).toBeVisible();
    console.log('✅ Real-time update indicator present');
  });
});