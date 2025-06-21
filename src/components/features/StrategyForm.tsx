'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { Spinner } from '../Spinner';

type StrategyFormProps = {
  onSubmit: (strategy: string) => void;
  isLoading: boolean;
};

export function StrategyForm({ onSubmit, isLoading }: StrategyFormProps) {
  const [strategy, setStrategy] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim()) {
      onSubmit(strategy.trim());
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-transparent border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-4xl text-slate-100">Submit Your Strategy</CardTitle>
        <CardDescription className="text-slate-400 text-lg pt-2">
          Paste your case facts and initial strategy below to begin the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Textarea
            placeholder="Describe your case facts, legal arguments, and desired outcomes..."
            className="min-h-[300px] text-base bg-slate-900/70 border-slate-700 focus:ring-primary focus-visible:ring-1"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex justify-center">
            <Button type="submit" disabled={isLoading || !strategy.trim()} size="lg">
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate Analysis
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
