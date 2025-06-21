'use client';

import type { ActionItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, ListTodo } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type ActionChecklistProps = {
    items: ActionItem[];
    onUpdate: (items: ActionItem[]) => void;
    onDiscuss: (item: ActionItem) => void;
    projectId: string;
    userId: string;
};

export function ActionChecklist({ items, onUpdate, onDiscuss, projectId, userId }: ActionChecklistProps) {
    const handleToggle = async (itemId: string) => {
        const updatedItems = items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        onUpdate(updatedItems);
        
        if (db && !projectId.startsWith('local-')) {
            const projectRef = doc(db, 'users', userId, 'projects', projectId);
            await updateDoc(projectRef, { actionPlan: updatedItems });
        }
    };

    return (
        <Card className="bg-slate-900/40 border-slate-800 shadow-xl shadow-slate-900/10">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-900/50 rounded-lg"><ListTodo className="h-6 w-6 text-green-300" /></div>
                    <CardTitle className="font-headline text-2xl text-green-300">Action Plan</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-700">
                            <div className="flex items-center space-x-4">
                                <Checkbox
                                    id={item.id}
                                    checked={item.completed}
                                    onCheckedChange={() => handleToggle(item.id)}
                                    className="data-[state=checked]:bg-green-500"
                                />
                                <label
                                    htmlFor={item.id}
                                    className={`text-sm font-medium leading-none text-slate-200 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                                >
                                    {item.text}
                                </label>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => onDiscuss(item)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Discuss
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
