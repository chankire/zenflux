import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Debug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    // Check environment variables and configuration
    const info = {
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
      supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
      clientUrl: 'PROTECTED_PROPERTY',
      clientKey: 'PROTECTED_PROPERTY',
      environment: import.meta.env.MODE
    };
    setDebugInfo(info);
  }, []);

  const testConnection = async () => {
    const results: any = {};
    
    try {
      // Test 1: Basic connection
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('organizations').select('count').limit(1);
      results.connection = error ? `ERROR: ${error.message}` : 'SUCCESS';
    } catch (err: any) {
      results.connection = `EXCEPTION: ${err.message}`;
    }

    try {
      // Test 2: Auth status
      console.log('Testing auth status...');
      const { data: { session }, error } = await supabase.auth.getSession();
      results.authSession = error ? `ERROR: ${error.message}` : session ? 'LOGGED IN' : 'NOT LOGGED IN';
    } catch (err: any) {
      results.authSession = `EXCEPTION: ${err.message}`;
    }

    try {
      // Test 3: Simple auth test (sign in with existing user)
      console.log('Testing auth signin...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'  // Intentionally wrong to test error handling
      });
      // We expect this to fail with "Invalid login credentials"
      if (error && error.message.includes('Invalid login credentials')) {
        results.authTest = 'SUCCESS (Auth endpoint working - invalid credentials as expected)';
      } else if (error) {
        results.authTest = `ERROR: ${error.message}`;
      } else {
        results.authTest = 'UNEXPECTED SUCCESS (should have failed with wrong password)';
      }
    } catch (err: any) {
      results.authTest = `EXCEPTION: ${err.message}`;
    }

    console.log('Debug test results:', results);
    setTestResults(results);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔍 ZenFlux Debug Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Environment Configuration</h3>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm space-y-1">
              <div>Environment: <span className="font-bold">{debugInfo.environment}</span></div>
              <div>Supabase URL: <span className="font-bold">{debugInfo.supabaseUrl}</span></div>
              <div>Supabase Key: <span className="font-bold">{debugInfo.supabaseKey}</span></div>
              <div>Client URL: <span className="font-bold">{debugInfo.clientUrl}</span></div>
              <div>Client Key: <span className="font-bold">{debugInfo.clientKey}</span></div>
            </div>
          </div>

          <div>
            <Button onClick={testConnection} className="mb-4">
              🧪 Run Connection Tests
            </Button>
            
            {Object.keys(testResults).length > 0 && (
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Test Results:</h4>
                <div className="font-mono text-sm space-y-1">
                  <div>Database Connection: <span className={testResults.connection?.includes('SUCCESS') ? 'text-green-600' : 'text-red-600'}>{testResults.connection}</span></div>
                  <div>Auth Session: <span className="text-blue-600">{testResults.authSession}</span></div>
                  <div>Auth Test: <span className={testResults.authTest?.includes('SUCCESS') ? 'text-green-600' : 'text-red-600'}>{testResults.authTest}</span></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Browser Console Instructions</h3>
            <div className="bg-yellow-50 p-4 rounded text-sm">
              <p className="mb-2">1. Press <kbd className="bg-gray-200 px-2 py-1 rounded">F12</kbd> to open Developer Tools</p>
              <p className="mb-2">2. Go to <strong>Console</strong> tab</p>
              <p className="mb-2">3. Click "Run Connection Tests" above</p>
              <p>4. Check for any red error messages and copy them</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Debug;