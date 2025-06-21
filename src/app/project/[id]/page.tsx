'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import type { Project, Analysis, ActionItem, ChatMessage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/Spinner';
import { StrategyForm } from '@/components/features/StrategyForm';
import { AnalysisDashboard } from '@/components/features/AnalysisDashboard';
// Import other components as they are created
// import { ActionChecklist } from '@/components/features/ActionChecklist';
// import { ChatWindow } from '@/components/features/ChatWindow';
import { generateAnalysis } from '@/lib/actions';

export default function ProjectPage() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const projectDocRef = user && projectId ? doc(db, 'users', user.uid, 'projects', projectId as string) : null;

  const fetchProject = useCallback(async () => {
    if (projectDocRef) {
      setLoading(true);
      try {
        const docSnap = await getDoc(projectDocRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() } as Project);
        } else {
          toast({ title: 'Error', description: 'Project not found.', variant: 'destructive' });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({ title: 'Error', description: 'Failed to fetch project data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  }, [projectDocRef, toast]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleStrategySubmit = async (strategy: string) => {
    if (!projectDocRef || !project) return;
    
    setAnalysisLoading(true);
    try {
      const result = await generateAnalysis({ legalStrategy: strategy });
      const newAnalysis = result.analysisDashboard;

      await updateDoc(projectDocRef, {
        strategy,
        analysis: newAnalysis,
      });

      setProject({ ...project, strategy, analysis: newAnalysis });
      toast({ title: 'Success', description: 'Analysis generated successfully.' });

    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({ title: 'Error', description: 'Failed to generate analysis.', variant: 'destructive' });
    } finally {
      setAnalysisLoading(false);
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
    return <div className="container py-8 text-center">Project not found.</div>;
  }

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
      
      {!project.analysis ? (
        <StrategyForm onSubmit={handleStrategySubmit} isLoading={analysisLoading} />
      ) : (
        <div className="space-y-8">
          <AnalysisDashboard analysis={project.analysis} />
          {/* ActionChecklist and ChatWindow will go here */}
        </div>
      )}
    </div>
  );
}
