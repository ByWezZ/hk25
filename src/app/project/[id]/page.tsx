'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Project } from '@/lib/types';
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

  useEffect(() => {
    const fetchProjectData = async () => {
      if (user && projectId && db) {
        const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId as string);
        try {
          const docSnap = await getDoc(projectDocRef);
          if (docSnap.exists()) {
            setProject({ id: docSnap.id, ...docSnap.data() } as Project);
          } else {
            toast({ title: 'Error', description: 'Project not found.', variant: 'destructive' });
            setProject(null);
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          toast({ title: 'Error', description: 'Failed to fetch project data. Check your internet connection or Firebase setup.', variant: 'destructive' });
          setProject(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        if (user && projectId && !db) {
          toast({ title: 'Offline Mode', description: 'Firebase is not configured. Project data is unavailable.', variant: 'destructive' });
        }
      }
    };

    fetchProjectData();
  }, [user, projectId, toast]);

  const handleStrategySubmit = async (strategy: string) => {
    if (!user || !projectId || !db || !project) return;
    
    setAnalysisLoading(true);
    try {
      const result = await generateAnalysis({ legalStrategy: strategy });
      const newAnalysis = result.analysisDashboard;

      const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId as string);
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
    return <div className="container py-8 text-center">Project could not be loaded. Please ensure Firebase is configured and you have an internet connection.</div>;
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
