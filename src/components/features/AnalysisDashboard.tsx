'use client';

import { useState } from 'react';
import type { Analysis } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, ThumbsDown, Gavel, Scale } from 'lucide-react';
import { LegalCaseModal } from './LegalCaseModal';

type AnalysisDashboardProps = {
  analysis: Analysis;
};

export function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  const [modalCase, setModalCase] = useState<string | null>(null);

  const renderTextWithCitations = (text: string, citations: string[]) => {
    if (!citations || citations.length === 0) {
      return text;
    }

    const regex = new RegExp(`(${citations.join('|')})`, 'g');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (citations.includes(part)) {
        return (
          <Button
            key={index}
            variant="link"
            className="p-0 h-auto text-base"
            onClick={() => setModalCase(part)}
          >
            {part}
          </Button>
        );
      }
      return part;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Advocate's Brief */}
      <Card className="border-t-4 border-blue-500 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-blue-500" />
            <CardTitle className="font-headline text-2xl text-blue-800">Advocate's Brief</CardTitle>
          </div>
          <CardDescription>Your submitted arguments and supporting cases.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {analysis.advocateBrief.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{item.argument}</AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 border-l-2 border-blue-200">
                    <p className="font-semibold text-sm mb-2">Case Citations:</p>
                    {item.caseCitations.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {item.caseCitations.map((citation, i) => (
                          <li key={i}>
                             <Button
                              variant="link"
                              className="p-0 h-auto font-normal text-base text-blue-600 hover:text-blue-800"
                              onClick={() => setModalCase(citation)}
                            >
                              {citation}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No cases cited.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Adversary's Rebuttal */}
      <Card className="border-t-4 border-red-500 shadow-md">
        <CardHeader>
           <div className="flex items-center gap-3">
            <ThumbsDown className="h-6 w-6 text-red-500" />
            <CardTitle className="font-headline text-2xl text-red-800">Adversary's Rebuttal</CardTitle>
          </div>
          <CardDescription>Potential counter-arguments and weaknesses found.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.adversaryRebuttal.map((item, index) => (
              <div key={index} className="p-3 bg-red-50 rounded-lg">
                <p className="font-semibold">{item.rebuttal}</p>
                {item.weaknesses.map((weakness, i) => (
                  <div key={i} className="mt-2 pl-4 border-l-2 border-red-200">
                    <p className="text-sm text-red-900">{weakness.weakness}</p>
                    <Badge variant="destructive" className="mt-1">
                      Vulnerability Score: {weakness.vulnerabilityScore}
                    </Badge>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Arbiter's Synthesis */}
      <Card className="border-t-4 border-amber-500 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Gavel className="h-6 w-6 text-amber-500" />
            <CardTitle className="font-headline text-2xl text-amber-800">Arbiter's Synthesis</CardTitle>
          </div>
          <CardDescription>Overall analysis and strategic recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-600"/>Key Vulnerabilities</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.arbiterSynthesis.keyVulnerabilities.map((item, index) => (
                <li key={index}>{item.vulnerability}</li>
              ))}
            </ul>
          </div>
           <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-amber-600"/>Refined Strategy</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.arbiterSynthesis.refinedStrategy.map((item, index) => (
                <li key={index}>{item.recommendation} - <span className="text-muted-foreground">{item.rationale}</span></li>
              ))}
            </ul>
          </div>
          <div>
             <h4 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-amber-600"/>Predictive Analysis</h4>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span>{analysis.arbiterSynthesis.predictiveAnalysis.outcomePrediction}</span>
                <Badge className="bg-amber-500 text-white">Confidence: {analysis.arbiterSynthesis.predictiveAnalysis.confidenceLevel * 100}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {modalCase && <LegalCaseModal caseName={modalCase} onClose={() => setModalCase(null)} />}
    </div>
  );
}
