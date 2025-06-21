// This file will be created.
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import type { SimulationState } from '@/lib/simulation-types';
import { Spinner } from '@/components/Spinner';
import { useToast } from '@/hooks/use-toast';
import { SimulationClient } from '@/components/features/simulation/SimulationClient';
import { getAIErrorMessage } from '@/lib/utils';


export default function SimulationPage() {
  const { id: projectId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !projectId) {
      router.push('/dashboard');
      return;
    }

    const fetchProjectData = async () => {
      setLoading(true);
      if (!db) {
        toast({ title: "Error", description: "Firebase is not configured.", variant: "destructive" });
        router.push('/dashboard');
        return;
      }
      
      const projectDocRef = doc(db, 'users', user.uid, projectId as string);
      try {
        const docSnap = await getDoc(projectDocRef);
        if (docSnap.exists()) {
          const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
          if (!projectData.strategy || !projectData.analysis) {
             toast({ title: 'Cannot start simulation', description: 'Project analysis must be complete before starting a simulation.', variant: 'destructive' });
             router.push(`/project/${projectId}`);
             return;
          }
          setProject(projectData);
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
  }, [user, projectId, toast, router]);

  const handleSaveState = async (simulationState: SimulationState) => {
    if (!user || !project) return;
     if (project.id.startsWith('local-')) return; // Don't save for local-only projects

    const projectRef = doc(db, 'users', user.uid, 'projects', project.id);
    try {
      await updateDoc(projectRef, { simulationState });
    } catch (error) {
      console.error("Failed to save simulation state:", error);
      toast({ title: 'Error', description: 'Failed to save simulation progress.', variant: 'destructive' });
    }
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
     return <div className="flex h-screen items-center justify-center text-destructive">Project not found or invalid.</div>;
  }

  return (
    <SimulationClient
      project={project}
      onSaveState={handleSaveState}
    />
  );
}
