'use client';

import { useState } from 'react';
import type { Analysis } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, ThumbsDown, Gavel, Scale, FileText, Download, ShieldQuestion } from 'lucide-react';
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

  const exportToPdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const content = document.getElementById('playbook-content');
    if (content) {
      doc.html(content, {
        callback: function (doc) {
          doc.save('Adversarial-Playbook.pdf');
        },
        x: 10,
        y: 10,
        width: 180,
        windowWidth: 800
      });
    }
  };

  const exportToWord = async () => {
    const { asBlob } = await import('html-to-docx');
    const { saveAs } = await import('file-saver');

    const contentElement = document.getElementById('playbook-content');
    if (contentElement) {
      const htmlString = `
        <!DOCTYPE html>
        <html>
        <head><title>Adversarial Playbook</title></head>
        <body>${contentElement.innerHTML}</body>
        </html>
      `;

      const data = await asBlob(htmlString);
      saveAs(data, 'Adversarial-Playbook.docx');
    }
  };

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
                  <div className="pl-4 border-l-2 border-blue-500/30">
                    <p className="font-semibold text-sm mb-2 text-slate-300">Case Citations:</p>
                    {item.caseCitations.length > 0 ? (
                       <div className="flex flex-col items-start space-y-1">
                        {item.caseCitations.map((citation, i) => (
                          <Button
                            key={i}
                            variant="link"
                            className="p-0 h-auto font-normal text-base text-blue-400 hover:text-blue-300 text-left"
                            onClick={() => setModalCase(citation)}
                          >
                            {citation}
                          </Button>
                        ))}
                      </div>
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
      <Card className="bg-card border-red-500/30 shadow-xl shadow-black/20">
        <CardHeader>
           <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/50 rounded-lg"><ThumbsDown className="h-6 w-6 text-red-300" /></div>
            <CardTitle className="font-headline text-2xl text-red-300">Adversary's Rebuttal</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.adversaryRebuttal.map((item, index) => (
              <div key={index} className="p-4 bg-red-950/20 rounded-lg border border-red-500/20">
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
            <div className="flex items-center gap-2 pt-2">
                <Button onClick={exportToPdf} variant="outline" size="sm"><Download className="mr-2 h-3 w-3" /> PDF</Button>
                <Button onClick={exportToWord} variant="outline" size="sm"><Download className="mr-2 h-3 w-3" /> Word</Button>
            </div>
        </CardHeader>
        <CardContent id="playbook-content">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-purple-200 mb-2">Opponent Counsel Analysis</h4>
                    <p className="text-sm text-slate-300">{analysis.adversarialPlaybook.opponentCounselAnalysis}</p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {analysis.adversarialPlaybook.potentialCounterArguments.map((item, index) => (
                    <AccordionItem value={`counter-${index}`} key={index} className="border-slate-700">
                        <AccordionTrigger className="text-slate-200 hover:no-underline text-left">{item.counterArgument}</AccordionTrigger>
                        <AccordionContent>
                        <div className="pl-4 border-l-2 border-purple-500/30 space-y-3">
                            {item.rebuttals.map((rebuttal, rIndex) => (
                                <div key={rIndex}>
                                    <p className="font-semibold text-sm text-slate-300">{rebuttal.rebuttal}</p>
                                     {rebuttal.citations.length > 0 && (
                                        <div className="flex flex-col items-start space-y-1 mt-1">
                                            {rebuttal.citations.map((citation, cIndex) => (
                                                <Button
                                                    key={cIndex}
                                                    variant="link"
                                                    className="p-0 h-auto font-normal text-sm text-blue-400 hover:text-blue-300"
                                                    onClick={() => setModalCase(citation)}
                                                >
                                                    {citation}
                                                </Button>
                                            ))}
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
