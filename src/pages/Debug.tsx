import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Debug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});

  const { user, session, loading, signIn, signOut } = useAuth();

  useEffect(() => {
    // Check environment variables and configuration
    const info = {
      authSystem: 'MOCK_AUTHENTICATION',
      environment: import.meta.env.MODE,
      userId: user?.id || 'NOT_LOGGED_IN',
      userEmail: user?.email || 'NOT_LOGGED_IN',
      sessionActive: session ? 'YES' : 'NO'
    };
    setDebugInfo(info);
  }, [user, session]);

  const testAuthentication = async () => {
    const results: any = {};
    
    try {
      // Test 1: Check current auth state
      console.log('Testing authentication state...');
      results.authState = user ? `LOGGED IN as ${user.email}` : 'NOT LOGGED IN';
      results.sessionState = session ? 'SESSION ACTIVE' : 'NO SESSION';
    } catch (err: any) {
      results.authState = `EXCEPTION: ${err.message}`;
    }

    try {
      // Test 2: Test login with wrong credentials
      console.log('Testing auth with wrong credentials...');
      const { error } = await signIn('test@example.com', 'wrongpassword');
      if (error) {
        results.authTestFail = `SUCCESS (Auth working - rejected bad credentials): ${error.message}`;
      } else {
        results.authTestFail = 'ERROR: Should have rejected wrong credentials';
      }
    } catch (err: any) {
      results.authTestFail = `EXCEPTION: ${err.message}`;
    }

    try {
      // Test 3: Test login with correct credentials if not already logged in
      if (!user) {
        console.log('Testing auth with correct credentials...');
        const { error } = await signIn('test@example.com', 'testpass');
        if (!error) {
          results.authTestSuccess = 'SUCCESS (Login with correct credentials worked)';
        } else {
          results.authTestSuccess = `ERROR: ${error.message}`;
        }
      } else {
        results.authTestSuccess = 'SKIPPED (Already logged in)';
      }
    } catch (err: any) {
      results.authTestSuccess = `EXCEPTION: ${err.message}`;
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
              <div>Auth System: <span className="font-bold">{debugInfo.authSystem}</span></div>
              <div>User ID: <span className="font-bold">{debugInfo.userId}</span></div>
              <div>User Email: <span className="font-bold">{debugInfo.userEmail}</span></div>
              <div>Session Active: <span className="font-bold">{debugInfo.sessionActive}</span></div>
            </div>
          </div>

          <div>
            <div className="space-x-2 mb-4">
              <Button onClick={testAuthentication}>
                🧪 Test Authentication
              </Button>
              {user && (
                <Button onClick={signOut} variant="outline">
                  🚪 Sign Out
                </Button>
              )}
            </div>
            
            {Object.keys(testResults).length > 0 && (
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Test Results:</h4>
                <div className="font-mono text-sm space-y-1">
                  <div>Auth State: <span className="text-blue-600">{testResults.authState}</span></div>
                  <div>Session State: <span className="text-blue-600">{testResults.sessionState}</span></div>
                  <div>Wrong Credentials Test: <span className={testResults.authTestFail?.includes('SUCCESS') ? 'text-green-600' : 'text-red-600'}>{testResults.authTestFail}</span></div>
                  <div>Correct Credentials Test: <span className={testResults.authTestSuccess?.includes('SUCCESS') ? 'text-green-600' : 'text-red-600'}>{testResults.authTestSuccess}</span></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Browser Console Instructions</h3>
            <div className="bg-yellow-50 p-4 rounded text-sm">
              <p className="mb-2">1. Press <kbd className="bg-gray-200 px-2 py-1 rounded">F12</kbd> to open Developer Tools</p>
              <p className="mb-2">2. Go to <strong>Console</strong> tab</p>
              <p className="mb-2">3. Click "Test Authentication" above</p>
              <p>4. Check for any red error messages and copy them</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default Debug;