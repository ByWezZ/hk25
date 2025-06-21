'use client';

import { useState } from 'react';
import type { Analysis } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, ThumbsDown, Gavel, Scale } from 'lucide-react';
import { LegalCaseModal } from './LegalCaseModal';

type AnalysisDashboardProps = {
  analysis: Analysis;
};

export function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  const [modalCase, setModalCase] = useState<string | null>(null);
  
  const getVulnerabilityColor = (score: number) => {
    if (score >= 8) return 'bg-red-500/80';
    if (score >= 5) return 'bg-orange-500/80';
    return 'bg-yellow-500/80';
  };
  
  const predictiveAnalysis = analysis.arbiterSynthesis.predictiveAnalysis;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Advocate's Brief */}
      <Card className="bg-slate-900/40 border-blue-500/50 shadow-xl shadow-blue-900/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/50 rounded-lg"><Scale className="h-6 w-6 text-blue-300" /></div>
            <CardTitle className="font-headline text-2xl text-blue-300">Advocate's Brief</CardTitle>
          </div>
          <CardDescription className="text-slate-400 pt-2">Your submitted arguments and supporting cases.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {analysis.advocateBrief.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-slate-800">
                <AccordionTrigger className="text-slate-200 hover:no-underline">{item.argument}</AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 border-l-2 border-blue-500/30">
                    <p className="font-semibold text-sm mb-2 text-slate-300">Case Citations:</p>
                    {item.caseCitations.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {item.caseCitations.map((citation, i) => (
                          <li key={i}>
                             <Button
                              variant="link"
                              className="p-0 h-auto font-normal text-base text-blue-400 hover:text-blue-300"
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
      <Card className="bg-slate-900/40 border-red-500/50 shadow-xl shadow-red-900/10">
        <CardHeader>
           <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/50 rounded-lg"><ThumbsDown className="h-6 w-6 text-red-300" /></div>
            <CardTitle className="font-headline text-2xl text-red-300">Adversary's Rebuttal</CardTitle>
          </div>
          <CardDescription className="text-slate-400 pt-2">Potential counter-arguments and weaknesses found.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.adversaryRebuttal.map((item, index) => (
              <div key={index} className="p-4 bg-red-950/30 rounded-lg border border-red-500/20">
                <p className="font-semibold text-slate-200">{item.rebuttal}</p>
                {item.weaknesses.map((weakness, i) => (
                  <div key={i} className="mt-3 pl-4 border-l-2 border-red-500/30">
                    <p className="text-sm text-red-200">{weakness.weakness}</p>
                    <Badge className={`mt-2 text-white ${getVulnerabilityColor(weakness.vulnerabilityScore)}`}>
                      Vulnerability Score: {weakness.vulnerabilityScore}/10
                    </Badge>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Arbiter's Synthesis */}
      <Card className="bg-slate-900/40 border-amber-500/50 shadow-xl shadow-amber-900/10">
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-900/50 rounded-lg"><Gavel className="h-6 w-6 text-amber-300" /></div>
            <CardTitle className="font-headline text-2xl text-amber-300">Arbiter's Synthesis</CardTitle>
          </div>
          <CardDescription className="text-slate-400 pt-2">Overall analysis and strategic recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-200"><Lightbulb className="h-5 w-5"/>Key Vulnerabilities</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
              {analysis.arbiterSynthesis.keyVulnerabilities.map((item, index) => (
                <li key={index}>{item.vulnerability}</li>
              ))}
            </ul>
          </div>
           <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-200"><Lightbulb className="h-5 w-5"/>Refined Strategy</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-300">
              {analysis.arbiterSynthesis.refinedStrategy.map((item, index) => (
                <li key={index}>{item.recommendation} - <span className="text-muted-foreground">{item.rationale}</span></li>
              ))}
            </ul>
          </div>
          <div>
             <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-200"><TrendingUp className="h-5 w-5"/>Predictive Analysis</h4>
            <div className="flex items-center justify-between p-3 bg-amber-950/30 rounded-lg border border-amber-500/20">
                <span className="text-slate-200">{predictiveAnalysis.outcomePrediction}</span>
                <Badge className="bg-amber-500 text-white">Confidence: {Math.round(predictiveAnalysis.confidenceLevel * 100)}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {modalCase && <LegalCaseModal caseName={modalCase} onClose={() => setModalCase(null)} />}
    </div>
  );
}
