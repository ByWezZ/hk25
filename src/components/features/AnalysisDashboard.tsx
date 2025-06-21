
'use client';

import { useState } from 'react';
import type { Analysis } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, ThumbsDown, Gavel, Scale, FileText, ShieldQuestion, ChevronRight, MessageCircle } from 'lucide-react';
import { LegalCaseModal } from './LegalCaseModal';
import dynamic from 'next/dynamic';

const ExportButtons = dynamic(() => import('./ExportButtons').then(mod => mod.ExportButtons), {
  ssr: false,
  loading: () => <div className="h-[36px] w-[150px]"></div>
});


type AnalysisDashboardProps = {
  analysis: Analysis;
};

export function AnalysisDashboard({ analysis }: AnalysisDashboardProps) {
  const [modalCase, setModalCase] = useState<string | null>(null);
  
  const getVulnerabilityColor = (score: number) => {
    if (score >= 8) return 'bg-red-200 border-red-400/50 text-red-900';
    if (score >= 5) return 'bg-orange-200 border-orange-400/50 text-orange-900';
    return 'bg-yellow-200 border-yellow-400/50 text-yellow-900';
  };
  
  const getCounterRebuttalStrengthColor = (strength: "High" | "Medium" | "Low") => {
    switch (strength) {
      case "High": return "text-red-600";
      case "Medium": return "text-orange-600";
      case "Low": return "text-yellow-600";
      default: return "text-slate-500";
    }
  }

  const predictiveAnalysis = analysis.arbiterSynthesis.predictiveAnalysis;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in">
      {/* Advocate's Brief */}
      <Card className="bg-card/60 backdrop-blur-sm shadow-lg shadow-slate-300/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Scale className="h-6 w-6 text-blue-600" /></div>
            <CardTitle className="font-headline text-2xl text-blue-800">Advocate's Brief</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {analysis.advocateBrief.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-slate-200">
                <AccordionTrigger className="hover:no-underline text-left">{item.argument}</AccordionTrigger>
                <AccordionContent>
                  <p className="font-semibold text-sm mb-2 text-slate-600">Case Citations & Relevance:</p>
                  <div className="space-y-4">
                    {item.caseCitations.length > 0 ? (
                       item.caseCitations.map((citation, i) => (
                          <div key={i} className="pl-4 border-l-2 border-blue-200">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-normal text-base text-blue-600 hover:text-blue-500 text-left mb-1"
                              onClick={() => setModalCase(citation.citation)}
                            >
                              {citation.citation}
                            </Button>
                            <p className="text-sm text-muted-foreground">{citation.relevance}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-200">No cases cited.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Adversary's Rebuttal */}
      <Card className="bg-card/60 backdrop-blur-sm shadow-lg shadow-slate-300/50">
        <CardHeader>
           <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><ThumbsDown className="h-6 w-6 text-red-600" /></div>
            <CardTitle className="font-headline text-2xl text-red-800">Adversary's Rebuttal</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.identifiedWeaknesses.map((weakness, index) => (
                <div key={index} className="p-4 bg-red-50/50 rounded-lg border border-red-200/80">
                    <p className="font-semibold text-red-900">{weakness.weakness}</p>
                    <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className={`mt-2 ${getVulnerabilityColor(weakness.vulnerabilityScore)}`}>
                          Vulnerability Score: {weakness.vulnerabilityScore}/10
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{weakness.rationale}</p>
                </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Arbiter's Synthesis */}
      <Card className="bg-card/60 backdrop-blur-sm shadow-lg shadow-slate-300/50">
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-100 rounded-lg"><Gavel className="h-6 w-6 text-amber-600" /></div>
            <CardTitle className="font-headline text-2xl text-amber-800">Arbiter's Synthesis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-900"><Lightbulb className="h-5 w-5"/>Key Vulnerabilities</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.arbiterSynthesis.keyVulnerabilities.map((item, index) => (
                <li key={index}>{item.vulnerability}</li>
              ))}
            </ul>
          </div>
           <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-900"><Lightbulb className="h-5 w-5"/>Refined Strategy</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {analysis.arbiterSynthesis.refinedStrategy.map((item, index) => (
                <li key={index}>{item.recommendation} - <span className="text-muted-foreground">{item.rationale}</span></li>
              ))}
            </ul>
          </div>
          <div>
             <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-900"><TrendingUp className="h-5 w-5"/>Predictive Analysis</h4>
            <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200/80">
                <span>{predictiveAnalysis.outcomePrediction}</span>
                <Badge className="bg-amber-500 text-white">Confidence: {Math.round(predictiveAnalysis.confidenceLevel * 100)}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adversarial Playbook */}
      <Card className="bg-card/60 backdrop-blur-sm shadow-lg shadow-slate-300/50 lg:col-span-2 xl:col-span-1">
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg"><ShieldQuestion className="h-6 w-6 text-indigo-600" /></div>
                <CardTitle className="font-headline text-2xl text-indigo-800">Adversarial Playbook</CardTitle>
            </div>
            <ExportButtons />
        </CardHeader>
        <CardContent id="playbook-content">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-indigo-900 mb-2">Opponent Counsel Analysis</h4>
                    <p className="text-sm">{analysis.adversarialPlaybook.opponentCounselAnalysis}</p>
                </div>
                <Accordion type="multiple" className="w-full">
                    {analysis.adversarialPlaybook.potentialCounterArguments.map((item, index) => (
                      <AccordionItem value={`counter-${index}`} key={index} className="border-slate-200">
                          <AccordionTrigger className="hover:no-underline text-left">{item.counterArgument}</AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-4 border-l-2 border-indigo-200 space-y-4">
                              {item.rebuttals.map((rebuttal, rIndex) => (
                                <div key={rIndex}>
                                  <p className="font-semibold text-sm text-slate-600 flex items-center"><MessageCircle className="h-4 w-4 mr-2" /> Our Rebuttal</p>
                                  <p className="text-sm mt-1">{rebuttal.rebuttal}</p>

                                  {rebuttal.potentialCounterRebuttals.length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 border-slate-200/70">
                                      <p className="font-semibold text-sm text-slate-500 mb-2">Potential Counter-Rebuttals:</p>
                                      <ul className="space-y-2 text-sm">
                                        {rebuttal.potentialCounterRebuttals.map((counter, cIndex) => (
                                          <li key={cIndex} className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                                            <div>
                                              <span className={getCounterRebuttalStrengthColor(counter.strength)}>({counter.strength} Strength)</span>
                                              <span className="text-muted-foreground ml-1">{counter.counterRebuttal}</span>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {rebuttal.citations.length > 0 && (
                                    <div className="mt-3">
                                      <p className="font-semibold text-xs text-slate-400 mb-1">Citations:</p>
                                      <div className="flex flex-col items-start space-y-1">
                                          {rebuttal.citations.map((citation, cIndex) => (
                                              <Button
                                                  key={cIndex}
                                                  variant="link"
                                                  className="p-0 h-auto font-normal text-xs text-blue-600 hover:text-blue-500"
                                                  onClick={() => setModalCase(citation)}
                                              >
                                                  {citation}
                                              </Button>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </CardContent>
      </Card>


      {modalCase && <LegalCaseModal caseName={modalCase} onClose={() => setModalCase(null)} />}
    </div>
  );
}
