'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { generateLegalSummary } from '@/lib/actions';
import { Spinner } from '@/components/Spinner';

type LegalCaseModalProps = {
  caseName: string;
  onClose: () => void;
};

export function LegalCaseModal({ caseName, onClose }: LegalCaseModalProps) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await generateLegalSummary({ caseName });
        setSummary(result.summary);
      } catch (err) {
        setError('Failed to fetch case summary.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [caseName]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{caseName}</DialogTitle>
          <DialogDescription>AI-Generated Case Summary</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Spinner />
              <p className="ml-2">Generating summary...</p>
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">{summary}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
