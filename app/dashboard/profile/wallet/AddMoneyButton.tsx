'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AddMoneyButton() {
  const { toast } = useToast();
  
  return (
    <Button 
      className="w-full bg-white text-indigo-900 hover:bg-slate-200 font-bold"
      onClick={() => toast({ title: "Coming soon", description: "Wallet top-ups will be available shortly." })}
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Money
    </Button>
  );
}
