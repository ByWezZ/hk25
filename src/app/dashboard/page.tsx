'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, FileText } from 'lucide-react';
import type { Project } from '@/lib/types';
import { Spinner } from '@/components/Spinner';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user && db) {
      const fetchProjects = async () => {
        setLoading(true);
        const q = query(collection(db, 'users', user.uid, 'projects'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userProjects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];
        setProjects(userProjects);
        setLoading(false);
      };
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const createNewProject = async () => {
    if (user && db) {
      setIsCreating(true);
      try {
        const newProjectRef = await addDoc(collection(db, 'users', user.uid, 'projects'), {
          name: `New Project ${new Date().toLocaleString()}`,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        router.push(`/project/${newProjectRef.id}`);
      } catch (error) {
        console.error("Error creating new project:", error);
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-3xl">My Projects</h1>
        <Button onClick={createNewProject} disabled={isCreating || !db}>
          {isCreating ? <Spinner className="mr-2" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          New Project
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto bg-secondary rounded-full h-16 w-16 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>No Projects Yet</CardTitle>
            <CardDescription>Get started by creating your first project.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createNewProject} disabled={isCreating || !db}>
              {isCreating ? <Spinner className="mr-2" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Create New Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-md hover:border-primary transition-all cursor-pointer"
              onClick={() => router.push(`/project/${project.id}`)}
            >
              <CardHeader>
                <CardTitle className="truncate">{project.name}</CardTitle>
                <CardDescription>
                  {project.createdAt?.toDate ? `Created ${formatDistanceToNow(project.createdAt.toDate())} ago` : 'Date not available'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.strategy || 'No strategy submitted yet.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
