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
    if (score >= 8) return 'bg-red-500/80 border-red-400/50';
    if (score >= 5) return 'bg-orange-500/80 border-orange-400/50';
    return 'bg-yellow-500/80 border-yellow-400/50';
  };
  
  const getCounterRebuttalStrengthColor = (strength: "High" | "Medium" | "Low") => {
    switch (strength) {
      case "High": return "text-red-400";
      case "Medium": return "text-orange-400";
      case "Low": return "text-yellow-400";
      default: return "text-slate-400";
    }
  }

  const predictiveAnalysis = analysis.arbiterSynthesis.predictiveAnalysis;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in">
      {/* Advocate's Brief */}
      <Card className="bg-card border-blue-500/30 shadow-xl shadow-black/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/50 rounded-lg"><Scale className="h-6 w-6 text-blue-300" /></div>
            <CardTitle className="font-headline text-2xl text-blue-300">Advocate's Brief</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {analysis.advocateBrief.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index} className="border-slate-800">
                <AccordionTrigger className="text-slate-200 hover:no-underline text-left">{item.argument}</AccordionTrigger>
                <AccordionContent>
                  <p className="font-semibold text-sm mb-2 text-slate-300">Case Citations & Relevance:</p>
                  <div className="space-y-4">
                    {item.caseCitations.length > 0 ? (
                       item.caseCitations.map((citation, i) => (
                          <div key={i} className="pl-4 border-l-2 border-blue-500/30">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-normal text-base text-blue-400 hover:text-blue-300 text-left mb-1"
                              onClick={() => setModalCase(citation.citation)}
                            >
                              {citation.citation}
                            </Button>
                            <p className="text-sm text-muted-foreground">{citation.relevance}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-500/30">No cases cited.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Adversary's Rebuttal */}
      <Card className="bg-card border-red-500/30 shadow-xl shadow-black/20">
        <CardHeader>
           <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/50 rounded-lg"><ThumbsDown className="h-6 w-6 text-red-300" /></div>
            <CardTitle className="font-headline text-2xl text-red-300">Adversary's Rebuttal</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.adversaryRebuttal.map((weakness, index) => (
                <div key={index} className="p-4 bg-red-950/20 rounded-lg border border-red-500/20">
                    <p className="font-semibold text-red-200">{weakness.weakness}</p>
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
      <Card className="bg-card border-amber-500/30 shadow-xl shadow-black/20">
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-900/50 rounded-lg"><Gavel className="h-6 w-6 text-amber-300" /></div>
            <CardTitle className="font-headline text-2xl text-amber-300">Arbiter's Synthesis</CardTitle>
          </div>
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
            <div className="flex items-center justify-between p-3 bg-amber-950/20 rounded-lg border border-amber-500/20">
                <span className="text-slate-200">{predictiveAnalysis.outcomePrediction}</span>
                <Badge className="bg-amber-500 text-white">Confidence: {Math.round(predictiveAnalysis.confidenceLevel * 100)}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adversarial Playbook */}
      <Card className="bg-playbook border-purple-500/30 shadow-xl shadow-black/20 lg:col-span-2 xl:col-span-1">
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/50 rounded-lg"><ShieldQuestion className="h-6 w-6 text-purple-300" /></div>
                <CardTitle className="font-headline text-2xl text-purple-300">Adversarial Playbook</CardTitle>
            </div>
            <ExportButtons />
        </CardHeader>
        <CardContent id="playbook-content">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-purple-200 mb-2">Opponent Counsel Analysis</h4>
                    <p className="text-sm text-slate-300">{analysis.adversarialPlaybook.opponentCounselAnalysis}</p>
                </div>
                <Accordion type="multiple" className="w-full">
                    {analysis.adversarialPlaybook.potentialCounterArguments.map((item, index) => (
                      <AccordionItem value={`counter-${index}`} key={index} className="border-slate-700">
                          <AccordionTrigger className="text-slate-200 hover:no-underline text-left">{item.counterArgument}</AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-4 border-l-2 border-purple-500/30 space-y-4">
                              {item.rebuttals.map((rebuttal, rIndex) => (
                                <div key={rIndex}>
                                  <p className="font-semibold text-sm text-slate-300 flex items-center"><MessageCircle className="h-4 w-4 mr-2" /> Our Rebuttal</p>
                                  <p className="text-sm text-slate-300/90 mt-1">{rebuttal.rebuttal}</p>

                                  {rebuttal.potentialCounterRebuttals.length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 border-slate-600/50">
                                      <p className="font-semibold text-sm text-slate-400 mb-2">Potential Counter-Rebuttals:</p>
                                      <ul className="space-y-2 text-sm">
                                        {rebuttal.potentialCounterRebuttals.map((counter, cIndex) => (
                                          <li key={cIndex} className="flex items-start gap-2">
                                            <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                                            <div>
                                              <span className={getCounterRebuttalStrengthColor(counter.strength)}>({counter.strength} Strength)</span>
                                              <span className="text-slate-400/90 ml-1">{counter.counterRebuttal}</span>
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
                                                  className="p-0 h-auto font-normal text-xs text-blue-400 hover:text-blue-300"
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
