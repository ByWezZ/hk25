'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Project, ActionItem, ChatMessage } from '@/lib/types';
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
import { generateAnalysis, generateActionPlan, generateProjectName } from '@/lib/actions';
import { getAIErrorMessage } from '@/lib/utils';
import { MessageSquare, ListTodo, Pencil, Rocket, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type PageState = 'form' | 'thinking' | 'dashboard';

export default function ProjectPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const isNewProject = projectId === 'new';

  const [project, setProject] = useState<Project | null>(null);
  const [pageState, setPageState] = useState<PageState>('form');
  const [loading, setLoading] = useState(!isNewProject);
  const [isChatOpen, setChatOpen] = useState(false);
  const [scopedChatItem, setScopedChatItem] = useState<ActionItem | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [draftActionPlan, setDraftActionPlan] = useState<string[] | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (isNewProject) {
      setLoading(false);
      setPageState('form');
      setProject(null);
      return;
    }

    // Handle loading local projects from sessionStorage first
    const localProjectData = sessionStorage.getItem('pendingLocalProject');
    if (localProjectData) {
      sessionStorage.removeItem('pendingLocalProject');
      const parsedProject = JSON.parse(localProjectData);
      // Ensure the project ID from session matches the URL
      if (parsedProject.id === projectId) {
        parsedProject.createdAt = new Date(parsedProject.createdAt);
        setProject(parsedProject);
        setProjectName(parsedProject.name);
        setPageState('dashboard');
        setLoading(false);
        return;
      }
    }
    
    const fetchProjectData = async () => {
      setLoading(true);
      if (!user || !projectId || !db) {
        setLoading(false);
        if(!db) console.warn("Firebase not configured. Cannot fetch project.");
        return;
      }
      
      const projectDocRef = doc(db, 'users', user.uid, projectId as string);
      try {
        const docSnap = await getDoc(projectDocRef);
        if (docSnap.exists()) {
          const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
          setProject(projectData);
          setProjectName(projectData.name);
          setPageState(projectData.analysis ? 'dashboard' : 'form');
        } else {
          toast({ title: 'Error', description: 'Project not found.', variant: 'destructive' });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({ title: 'Error', description: 'Failed to fetch project data.', variant: 'destructive' });
      }
      setLoading(false);
    };

    fetchProjectData();
  }, [user, projectId, toast, isNewProject, router]);

  const handleStrategySubmit = async (strategy: string) => {
    if (!user) return;
    setPageState('thinking');
  
    try {
      const [nameResult, analysisResult] = await Promise.all([
        generateProjectName({ strategyText: strategy }),
        generateAnalysis({ legalStrategy: strategy }),
      ]);
  
      if (!db) {
        console.warn("Firebase not configured. Running in local mode.");
        toast({ title: "Local Mode", description: "Analysis generated. Project will not be saved." });

        const localProject: Project = {
          id: `local-${Date.now()}`,
          name: nameResult.projectName,
          userId: user.uid,
          strategy: strategy,
          analysis: analysisResult.analysisDashboard,
          createdAt: new Date(),
        };

        const serializableProject = {
          ...localProject,
          createdAt: localProject.createdAt.toISOString(),
        };
        sessionStorage.setItem('pendingLocalProject', JSON.stringify(serializableProject));
        
        router.push(`/project/${localProject.id}`);
        return;
      }

      const newProjectData: Omit<Project, 'id' | 'createdAt'> = {
        name: nameResult.projectName,
        userId: user.uid,
        strategy: strategy,
        analysis: analysisResult.analysisDashboard,
      };
      
      const projectWithTimestamp = {
        ...newProjectData,
        createdAt: serverTimestamp(),
      }

      const projectCollectionRef = collection(db, 'users', user.uid, 'projects');
      const newDocRef = await addDoc(projectCollectionRef, projectWithTimestamp);
      
      toast({ title: 'Success', description: 'Analysis generated and project created.' });

      router.push(`/project/${newDocRef.id}`);

    } catch (error) {
      console.error("Error creating project and analysis:", error);
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
    if (!project || project.name === projectName) {
        setIsEditingName(false);
        return;
    }

    const originalName = project.name;
    const updatedProjectData = { ...project, name: projectName };
    setProject(updatedProjectData); // Optimistic update
    setIsEditingName(false);

    if (db && user && !project.id.startsWith('local-')) {
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
            
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl shadow-black/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center text-center p-6 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <ListTodo className="h-10 w-10 text-primary mb-4" />
                        <h3 className="font-semibold text-lg mb-2 text-foreground">Create Action Plan</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                           Generate a checklist of actionable tasks based on the AI analysis and your conversation history.
                        </p>
                         <Button onClick={handleCreateActionPlan} disabled={isCreatingPlan}>
                            {isCreatingPlan ? <Spinner className="mr-2"/> : <ChevronRight className="mr-2" />}
                            {isCreatingPlan ? 'Generating...' : 'Generate Plan'}
                        </Button>
                    </div>

                     <div className="flex flex-col items-center text-center p-6 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                        <Rocket className="h-10 w-10 text-primary mb-4" />
                        <h3 className="font-semibold text-lg mb-2 text-foreground">Enter Virtual Hearing</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                           Engage in a realistic, simulated hearing to test your arguments, practice cross-examination, and get real-time coaching.
                        </p>
                         <Button onClick={() => {
                             if (project) {
                                if (project.id.startsWith('local-')) {
                                    try {
                                        const serializableProject = {
                                            ...project,
                                            createdAt: project.createdAt?.toDate ? project.createdAt.toDate().toISOString() : new Date(project.createdAt).toISOString(),
                                        };
                                        sessionStorage.setItem('localProject', JSON.stringify(serializableProject));
                                    } catch (e) {
                                        console.error("Could not serialize project for sessionStorage", e);
                                        toast({ title: "Error", description: "Could not start local simulation.", variant: "destructive" });
                                        return;
                                    }
                                }
                                router.push(`/project/${project.id}/simulation`);
                            }
                        }}>
                             <ChevronRight className="mr-2" /> Start Simulation
                        </Button>
                    </div>
                </CardContent>
            </Card>


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

  if (!project && !isNewProject) {
    return <div className="container py-8 text-center text-slate-400">Project could not be loaded.</div>;
  }

  return (
    <>
      <div className="container py-8 relative">
        {project && (
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
        )}
        
        {renderContent()}
      </div>
      
      {project && (
        <>
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
        </>
      )}

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
