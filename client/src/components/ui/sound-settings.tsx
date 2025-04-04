import { useState } from 'react';
import { useSoundStore, SoundCategory } from '@/hooks/use-sound-system';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX, Music, Bell, Gamepad2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SoundSettings() {
  const [open, setOpen] = useState(false);
  const { 
    masterVolume, 
    categoryVolumes, 
    isMuted, 
    categoryMuted, 
    setMasterVolume, 
    setCategoryVolume, 
    toggleMute, 
    toggleCategoryMute, 
    resetSettings 
  } = useSoundStore();

  // Category labels
  const categoryLabels: Record<SoundCategory, { name: string, arabicName: string, icon: React.ReactNode }> = {
    ui: { 
      name: 'UI', 
      arabicName: 'واجهة المستخدم', 
      icon: <Bell className="h-4 w-4" /> 
    },
    game: { 
      name: 'Game', 
      arabicName: 'أصوات اللعبة', 
      icon: <Gamepad2 className="h-4 w-4" /> 
    },
    ambient: { 
      name: 'Music', 
      arabicName: 'الموسيقى', 
      icon: <Music className="h-4 w-4" /> 
    },
    win: { 
      name: 'Win', 
      arabicName: 'أصوات الفوز', 
      icon: <Trophy className="h-4 w-4" /> 
    },
    notification: { 
      name: 'Alerts', 
      arabicName: 'التنبيهات', 
      icon: <Bell className="h-4 w-4" /> 
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
          onClick={(e) => {
            // Prevent the dialog from opening when just toggling mute
            if (e.target === e.currentTarget) {
              e.preventDefault();
              toggleMute();
            }
          }}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Volume2 className={cn(
              "h-5 w-5",
              masterVolume > 0.7 ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-[#0A3A2A] border-[#D4AF37]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-[#D4AF37]">إعدادات الصوت</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Master volume control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMuted ? <VolumeX className="h-5 w-5 text-[#D4AF37]" /> : <Volume2 className="h-5 w-5 text-[#D4AF37]" />}
                <span className="text-sm font-medium text-white">الصوت الرئيسي</span>
              </div>
              <Switch
                checked={!isMuted}
                onCheckedChange={() => toggleMute()}
                className="data-[state=checked]:bg-[#D4AF37]"
              />
            </div>
            <Slider
              disabled={isMuted}
              value={[masterVolume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setMasterVolume(value[0] / 100)}
              className={cn(
                "w-full",
                isMuted && "opacity-50"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          
          {/* Category volume controls */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-[#D4AF37]">أنواع الأصوات</div>
            {(Object.keys(categoryVolumes) as SoundCategory[]).map((category) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryLabels[category].icon}
                    <span className="text-sm text-white">{categoryLabels[category].arabicName}</span>
                  </div>
                  <Switch
                    checked={!categoryMuted[category]}
                    onCheckedChange={() => toggleCategoryMute(category)}
                    className="data-[state=checked]:bg-[#D4AF37]"
                  />
                </div>
                <Slider
                  disabled={categoryMuted[category]}
                  value={[categoryVolumes[category] * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setCategoryVolume(category, value[0] / 100)}
                  className={cn(
                    "w-full",
                    categoryMuted[category] && "opacity-50"
                  )}
                />
              </div>
            ))}
          </div>
          
          {/* Reset button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={resetSettings} 
              variant="outline"
              className="bg-black/20 border-[#D4AF37] text-[#D4AF37] hover:bg-[#0A3A2A]/80 hover:text-[#D4AF37]"
            >
              إعادة تعيين الإعدادات
            </Button>
          </div>
        </div>
        
        <DialogClose asChild>
          <Button 
            className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/20 border-[#D4AF37] text-[#D4AF37] hover:bg-[#0A3A2A]/80 hover:text-[#D4AF37]"
            size="icon"
          >
            ×
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}