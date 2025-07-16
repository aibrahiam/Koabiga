import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <>
      <Head title="Unauthorized Access" />
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-red-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600">
              Your session has expired or you do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    For your security, please log in again to continue. 
                    Your session may have expired due to inactivity.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Login
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  Go to Homepage
                </Link>
              </Button>
            </div>
            
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>If you believe this is an error, please contact your administrator.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 