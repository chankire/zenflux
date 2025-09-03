import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forecastAPI, ForecastRequest } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { Brain, TrendingUp, BarChart3, Activity, Zap, Sparkles } from 'lucide-react';

const forecastModels = [
  {
    type: 'LSTM',
    name: 'LSTM Neural Network',
    description: 'Deep learning model for complex pattern recognition in financial time series',
    icon: Brain,
    color: 'from-purple-500 to-purple-600',
    accuracy: 94,
  },
  {
    type: 'ARIMA',
    name: 'ARIMA Time Series',
    description: 'Classical statistical model for trend and seasonality analysis',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600',
    accuracy: 89,
  },
  {
    type: 'EXPONENTIAL_SMOOTHING',
    name: 'Exponential Smoothing',
    description: 'Weighted average approach with exponential decay for recent observations',
    icon: Activity,
    color: 'from-green-500 to-green-600',
    accuracy: 87,
  },
  {
    type: 'LINEAR_REGRESSION',
    name: 'Linear Regression',
    description: 'Linear trend analysis with feature engineering for financial indicators',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    accuracy: 82,
  },
  {
    type: 'ENSEMBLE',
    name: 'Ensemble Model',
    description: 'Combines all models using weighted averaging for maximum accuracy',
    icon: Sparkles,
    color: 'from-gradient-hero',
    accuracy: 96,
  },
];

const scenarios = [
  { value: 'conservative', label: 'Conservative', description: 'Lower bound estimates with high confidence' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced projections based on historical trends' },
  { value: 'aggressive', label: 'Aggressive', description: 'Optimistic forecasts for growth scenarios' },
];

export const ForecastingInterface: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('ENSEMBLE');
  const [horizon, setHorizon] = useState([90]);
  const [scenario, setScenario] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available models
  const { data: models } = useQuery({
    queryKey: ['forecast-models'],
    queryFn: forecastAPI.getModels,
  });

  // Generate forecast mutation
  const generateForecastMutation = useMutation({
    mutationFn: (request: ForecastRequest) => forecastAPI.generateForecast(request),
    onSuccess: (data) => {
      toast({
        title: "Forecast Generated!",
        description: `${data.model} model completed with ${data.accuracy}% accuracy.`,
      });
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Forecast Failed",
        description: error.response?.data?.message || "Failed to generate forecast. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateForecast = () => {
    generateForecastMutation.mutate({
      model: selectedModel,
      horizon: horizon[0],
      scenario,
    });
  };

  const selectedModelInfo = forecastModels.find(m => m.type === selectedModel);

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-primary" />
            <span>AI Forecasting Models</span>
          </CardTitle>
          <CardDescription>
            Choose the best model for your financial forecasting needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecastModels.map((model) => (
              <motion.div
                key={model.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
                  ${selectedModel === model.type 
                    ? 'border-primary bg-primary/5 shadow-lg' 
                    : 'border-border/60 bg-white/40 hover:border-primary/50'
                  }
                `}
                onClick={() => setSelectedModel(model.type)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                    <model.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">{model.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {model.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-primary">
                        {model.accuracy}% accuracy
                      </span>
                      {selectedModel === model.type && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Forecast Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="metric-card">
          <CardHeader>
            <CardTitle>Forecast Parameters</CardTitle>
            <CardDescription>
              Configure your forecasting parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time Horizon */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Time Horizon: {horizon[0]} days</Label>
              <Slider
                value={horizon}
                onValueChange={setHorizon}
                max={365}
                min={7}
                step={7}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 week</span>
                <span>1 year</span>
              </div>
            </div>

            {/* Scenario Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Scenario</Label>
              <Select value={scenario} onValueChange={(value: any) => setScenario(value)}>
                <SelectTrigger className="input-enterprise">
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateForecast}
              disabled={generateForecastMutation.isPending}
              className="w-full btn-enterprise"
            >
              {generateForecastMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" color="white" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Generate Forecast</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Selected Model Info */}
        {selectedModelInfo && (
          <Card className="metric-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <selectedModelInfo.icon className="w-5 h-5 text-primary" />
                <span>{selectedModelInfo.name}</span>
              </CardTitle>
              <CardDescription>Model specifications and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedModelInfo.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">{selectedModelInfo.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Historical Accuracy</p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-accent">{horizon[0]}</p>
                  <p className="text-xs text-muted-foreground">Days Forecast</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Best For</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedModel === 'LSTM' && 'Complex patterns and non-linear relationships'}
                  {selectedModel === 'ARIMA' && 'Seasonal trends and stable time series'}
                  {selectedModel === 'EXPONENTIAL_SMOOTHING' && 'Short-term forecasts with recent data emphasis'}
                  {selectedModel === 'LINEAR_REGRESSION' && 'Simple trends and feature-based predictions'}
                  {selectedModel === 'ENSEMBLE' && 'Maximum accuracy through model combination'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};