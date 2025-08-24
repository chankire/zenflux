import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Database, Building2, TrendingUp } from "lucide-react";

interface DataModeToggleProps {
  currentMode: 'demo' | 'live';
  onModeChange: (mode: 'demo' | 'live') => void;
  hasRealData?: boolean;
}

const DataModeToggle = ({ currentMode, onModeChange, hasRealData = false }: DataModeToggleProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Demo Mode */}
      <Card className={`cursor-pointer transition-all duration-300 hover:shadow-elegant ${
        currentMode === 'demo' ? 'ring-2 ring-primary shadow-glow' : 'hover:border-primary/50'
      }`} onClick={() => onModeChange('demo')}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Demo Mode</CardTitle>
            </div>
            {currentMode === 'demo' && (
              <Badge variant="default" className="bg-primary">Active</Badge>
            )}
          </div>
          <CardDescription>
            Interactive demo with sample financial data for exploration
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Pre-loaded sample transactions
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-3 h-3" />
              SaaS company scenario
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3" />
              12 months of forecasting
            </div>
          </div>
          {currentMode === 'demo' && (
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full" disabled>
                Currently Active
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Data Mode */}
      <Card className={`cursor-pointer transition-all duration-300 hover:shadow-elegant ${
        currentMode === 'live' ? 'ring-2 ring-accent shadow-glow' : 'hover:border-accent/50'
      } ${!hasRealData ? 'opacity-75' : ''}`} 
      onClick={() => hasRealData && onModeChange('live')}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-accent" />
              </div>
              <CardTitle className="text-lg">Live Data</CardTitle>
            </div>
            {currentMode === 'live' && (
              <Badge variant="default" className="bg-accent">Active</Badge>
            )}
            {!hasRealData && (
              <Badge variant="secondary">Setup Required</Badge>
            )}
          </div>
          <CardDescription>
            Real forecasting powered by your actual financial data
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Your transaction history
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-3 h-3" />
              Connected bank accounts
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3" />
              AI-powered predictions
            </div>
          </div>
          <div className="mt-4">
            {hasRealData ? (
              currentMode === 'live' ? (
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Currently Active
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full bg-accent hover:bg-accent/90" 
                  onClick={() => onModeChange('live')}
                >
                  Switch to Live Data
                </Button>
              )
            ) : (
              <Button variant="outline" size="sm" className="w-full" disabled>
                Upload Data First
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataModeToggle;