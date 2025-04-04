import { Button } from '@/components/ui/button';
import { VolumeX, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SoundSettings() {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 rounded-full"
      aria-label="تحكم بالصوت"
    >
      <Volume2 className="h-5 w-5 text-muted-foreground" />
    </Button>
  );
}