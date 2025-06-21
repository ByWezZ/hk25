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
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Submit Your Strategy</CardTitle>
        <CardDescription>
          Paste your case facts and initial strategy below to begin the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Describe your case facts, legal arguments, and desired outcomes..."
            className="min-h-[250px] text-base"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !strategy.trim()} size="lg">
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Simulating Tribunal...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
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
