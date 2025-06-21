
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import type { Project, ActionItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/Spinner';
import { StrategyForm } from '@/components/features/StrategyForm';
import { ThinkingAnimation } from '@/components/features/ThinkingAnimation';
import { AnalysisDashboard } from '@/components/features/AnalysisDashboard';
import { ActionChecklist } from '@/components/features/ActionChecklist';
import { ChatWindow } from '@/components/features/ChatWindow';
import { ScopedChatDialog } from '@/components/features/ScopedChatDialog';
import { ActionPlanDraftDialog } from '@/components/features/ActionPlanDraftDialog';
import { generateAnalysis, generateActionPlan } from '@/lib/actions';
import { getAIErrorMessage } from '@/lib/utils';
import { MessageSquare, ListTodo, Pencil } from 'lucide-react';

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
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [draftActionPlan, setDraftActionPlan] = useState<string[] | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState('');

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
              setProjectName(projectData.name);
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
          const localProject = {
            id: projectId as string,
            name: `Local Project`,
            userId: user.uid,
            createdAt: new Date(),
          }
          setProject(localProject);
          setProjectName(localProject.name);
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
      toast({ title: 'Error', description: getAIErrorMessage(error), variant: 'destructive' });
      setPageState('form'); 
    }
  };
  
  const handleCreateActionPlan = async () => {
    if (!project?.analysis) return;
    setIsCreatingPlan(true);

    try {
        const analysisText = JSON.stringify(project.analysis);
        const result = await generateActionPlan({ 
            analysisResults: analysisText,
            chatHistory: project.mainChatHistory || [],
        });
        
        setDraftActionPlan(result.actionItems);

    } catch (error) {
        console.error("Error generating action plan:", error);
        toast({ title: 'Error', description: getAIErrorMessage(error), variant: 'destructive' });
    } finally {
        setIsCreatingPlan(false);
    }
  };

  const handleConfirmActionPlan = (confirmedItems: {text: string}[]) => {
     const newActionPlan: ActionItem[] = confirmedItems.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        text: item.text,
        completed: false,
        chatHistory: [],
    }));
    handleActionItemUpdate(newActionPlan);
    setDraftActionPlan(null);
    toast({ title: 'Success', description: 'Action plan saved.' });
  }
  
  const handleActionItemUpdate = async (updatedItems: ActionItem[]) => {
    if (!project) return;
    
    const originalActionPlan = project.actionPlan;
    const updatedProject = { ...project, actionPlan: updatedItems };
    setProject(updatedProject);

    if (db && user && !project.id.startsWith('local-')) {
      const projectRef = doc(db, 'users', user.uid, 'projects', project.id);
      try {
        await updateDoc(projectRef, { actionPlan: updatedItems });
      } catch (error) {
        console.error("Failed to update action plan:", error);
        toast({ title: 'Error', description: 'Failed to save action plan changes.', variant: 'destructive' });
        setProject({ ...project, actionPlan: originalActionPlan }); // Revert on error
      }
    }
  };

  const handleNameSave = async () => {
    if (!user || !projectId || !project || project.name === projectName) {
        setIsEditingName(false);
        return;
    }

    const originalName = project.name;
    const updatedProjectData = { ...project, name: projectName };
    setProject(updatedProjectData); // Optimistic update
    setIsEditingName(false);

    if (db && !project.id.startsWith('local-')) {
        const projectRef = doc(db, 'users', user.uid, 'projects', project.id);
        try {
            await updateDoc(projectRef, { name: projectName });
            toast({ title: 'Success', description: 'Project name updated.' });
        } catch (error) {
            console.error('Error updating project name:', error);
            toast({ title: 'Error', description: 'Failed to update project name.', variant: 'destructive' });
            setProject({ ...project, name: originalName }); // Revert on error
        }
    }
  };


  const handleScopedChatItemUpdate = (updatedItem: ActionItem) => {
    if (!project || !project.actionPlan) return;
    const newActionPlan = project.actionPlan.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    handleActionItemUpdate(newActionPlan);
  };
  
  const renderContent = () => {
    switch (pageState) {
      case 'form':
        return <StrategyForm onSubmit={handleStrategySubmit} />;
      case 'thinking':
        return <ThinkingAnimation />;
      case 'dashboard':
        return project?.analysis ? (
          <div className="space-y-8">
            <AnalysisDashboard analysis={project.analysis} />
            
            <div className="text-center py-6">
                {!project.actionPlan && (
                    <Button onClick={handleCreateActionPlan} size="lg" disabled={isCreatingPlan}>
                        {isCreatingPlan ? <Spinner className="mr-2"/> : <ListTodo className="mr-2" />}
                        {isCreatingPlan ? 'Generating...' : 'Create Action Plan'}
                    </Button>
                )}
            </div>

            {project.actionPlan && (
                <ActionChecklist
                    items={project.actionPlan}
                    onUpdate={handleActionItemUpdate}
                    onDiscuss={(item) => setScopedChatItem(item)}
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
          <div className="flex items-center gap-3">
              {isEditingName ? (
                  <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameSave();
                          if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      autoFocus
                      className="text-3xl font-bold font-headline text-slate-200 h-auto p-0 border-0 bg-transparent focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-1"
                  />
              ) : (
                  <h2 
                      className="text-3xl font-bold font-headline text-slate-200 cursor-pointer"
                      onClick={() => setIsEditingName(true)}
                  >
                      {projectName}
                  </h2>
              )}
               <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => setIsEditingName(true)} />
          </div>
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

      <ScopedChatDialog
        item={scopedChatItem}
        onClose={() => setScopedChatItem(null)}
        onUpdate={handleScopedChatItemUpdate}
      />

      {draftActionPlan && (
        <ActionPlanDraftDialog
            isOpen={!!draftActionPlan}
            onClose={() => setDraftActionPlan(null)}
            items={draftActionPlan.map(text => ({ text }))}
            onConfirm={handleConfirmActionPlan}
        />
      )}
    </>
  );
}

    