'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, arrayUnion } from 'firebase/firestore';
import type { Project, ActionItem, ChatMessage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { StrategyForm } from '@/components/features/StrategyForm';
import { ThinkingAnimation } from '@/components/features/ThinkingAnimation';
import { AnalysisDashboard } from '@/components/features/AnalysisDashboard';
import { ActionChecklist } from '@/components/features/ActionChecklist';
import { ChatWindow } from '@/components/features/ChatWindow';
import { generateAnalysis, generateActionPlan, chatWithArbiter, scopedChat } from '@/lib/actions';
import { MessageSquare, ListTodo } from 'lucide-react';

type PageState = 'form' | 'thinking' | 'dashboard';

export default function ProjectPage() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [pageState, setPageState] = useState<PageState>('form');
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setChatOpen] = useState(false);
  const [scopedChatItem, setScopedChatItem] = useState<ActionItem | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      if (user && projectId) {
        if (db && !(projectId as string).startsWith('local-')) {
          const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId as string);
          try {
            const docSnap = await getDoc(projectDocRef);
            if (docSnap.exists()) {
              const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
              setProject(projectData);
              setPageState(projectData.analysis ? 'dashboard' : 'form');
            } else {
              toast({ title: 'Error', description: 'Project not found.', variant: 'destructive' });
              setProject(null);
            }
          } catch (error) {
            console.error("Error fetching project:", error);
            toast({ title: 'Error', description: 'Failed to fetch project data.', variant: 'destructive' });
          }
        } else {
          // Firebase is not configured or it's a local project
          setProject({
            id: projectId as string,
            name: `Local Project`,
            userId: user.uid,
            createdAt: new Date(),
          });
          setPageState('form');
        }
      }
      setLoading(false);
    };

    fetchProjectData();
  }, [user, projectId, toast]);

  const handleStrategySubmit = async (strategy: string) => {
    if (!user || !projectId || !project) return;

    setPageState('thinking');
    try {
      const result = await generateAnalysis({ legalStrategy: strategy });
      const newAnalysis = result.analysisDashboard;
      
      const updatedProject = { ...project, strategy, analysis: newAnalysis };

      if (db && !(projectId as string).startsWith('local-')) {
        const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId as string);
        await setDoc(projectDocRef, updatedProject, { merge: true });
      }

      setProject(updatedProject);
      setPageState('dashboard');
      toast({ title: 'Success', description: 'Analysis generated successfully.' });
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({ title: 'Error', description: 'Failed to generate analysis.', variant: 'destructive' });
      setPageState('form'); // Revert to form on error
    }
  };
  
  const handleCreateActionPlan = async () => {
    if (!project?.analysis) return;

    try {
        const analysisText = JSON.stringify(project.analysis);
        const result = await generateActionPlan({ analysisResults: analysisText });

        const newActionPlan = result.actionItems.map((item, index) => ({
            id: `${Date.now()}-${index}`,
            text: item,
            completed: false,
            chatHistory: [],
        }));

        const updatedProject = { ...project, actionPlan: newActionPlan };
        
        if (db && !(projectId as string).startsWith('local-')) {
            const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId as string);
            await updateDoc(projectDocRef, { actionPlan: newActionPlan });
        }
        
        setProject(updatedProject);
        toast({ title: 'Success', description: 'Action plan created.' });

    } catch (error) {
        console.error("Error generating action plan:", error);
        toast({ title: 'Error', description: 'Failed to create action plan.', variant: 'destructive' });
    }
  };
  
  const renderContent = () => {
    switch (pageState) {
      case 'form':
        return <StrategyForm onSubmit={handleStrategySubmit} isLoading={false} />;
      case 'thinking':
        return <ThinkingAnimation />;
      case 'dashboard':
        return project?.analysis ? (
          <div className="space-y-8">
            <AnalysisDashboard analysis={project.analysis} />
            {!project.actionPlan && (
                <div className="text-center py-6">
                    <Button onClick={handleCreateActionPlan} size="lg">
                        <ListTodo className="mr-2" /> Create Action Plan
                    </Button>
                </div>
            )}
            {project.actionPlan && (
                <ActionChecklist
                    items={project.actionPlan}
                    onUpdate={(updatedItems) => setProject(p => p ? {...p, actionPlan: updatedItems} : null)}
                    onDiscuss={(item) => setScopedChatItem(item)}
                    projectId={project.id}
                    userId={user!.uid}
                />
            )}
          </div>
        ) : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return <div className="container py-8 text-center text-slate-400">Project could not be loaded.</div>;
  }

  return (
    <>
      <div className="container py-8 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold font-headline text-slate-200">{project.name}</h2>
          {pageState === 'dashboard' && (
            <Button variant="outline" onClick={() => setChatOpen(true)}>
              <MessageSquare className="mr-2" /> Chat with Arbiter
            </Button>
          )}
        </div>
        
        {renderContent()}
      </div>
      
      <ChatWindow
        isOpen={isChatOpen}
        onOpenChange={setChatOpen}
        project={project}
        onProjectUpdate={setProject}
      />
    </>
  );
}
