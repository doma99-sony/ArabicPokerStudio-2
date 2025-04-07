// مكون لوحة الإعدادات للعبة صياد السمك
import React from 'react';
import { GameSettings } from '../types';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Volume2, 
  Music, 
  X,
  Zap
} from 'lucide-react';

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onClose: () => void;
}

/**
 * مكون لوحة الإعدادات
 * يتيح للمستخدم تعديل إعدادات اللعبة
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  // تغيير حالة الصوت
  const toggleSound = () => {
    onUpdateSettings({ soundEnabled: !settings.soundEnabled });
  };
  
  // تغيير حالة الموسيقى
  const toggleMusic = () => {
    onUpdateSettings({ musicEnabled: !settings.musicEnabled });
  };
  
  // تغيير سرعة الدوران
  const toggleFastSpin = () => {
    onUpdateSettings({ fastSpin: !settings.fastSpin });
  };
  
  // تغيير اللغة
  const toggleLanguage = () => {
    const newLanguage = settings.language === 'ar' ? 'en' : 'ar';
    onUpdateSettings({ language: newLanguage });
  };
  
  return (
    <div className="settings-overlay">
      <Card className="settings-panel">
        <CardHeader>
          <CardTitle className="settings-title">الإعدادات</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="close-button" 
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
        </CardHeader>
        
        <CardContent className="settings-content">
          <div className="settings-row">
            <div className="setting-label-container">
              <Volume2 className="w-5 h-5" />
              <Label htmlFor="sound-toggle" className="setting-label">
                الأصوات
              </Label>
            </div>
            <Switch 
              id="sound-toggle" 
              checked={settings.soundEnabled} 
              onCheckedChange={toggleSound}
            />
          </div>
          
          <div className="settings-row">
            <div className="setting-label-container">
              <Music className="w-5 h-5" />
              <Label htmlFor="music-toggle" className="setting-label">
                الموسيقى
              </Label>
            </div>
            <Switch 
              id="music-toggle" 
              checked={settings.musicEnabled} 
              onCheckedChange={toggleMusic}
            />
          </div>
          
          <div className="settings-row">
            <div className="setting-label-container">
              <Zap className="w-5 h-5" />
              <Label htmlFor="fast-spin-toggle" className="setting-label">
                دوران سريع
              </Label>
            </div>
            <Switch 
              id="fast-spin-toggle" 
              checked={settings.fastSpin} 
              onCheckedChange={toggleFastSpin}
            />
          </div>
        </CardContent>
        
        <CardFooter className="settings-footer">
          <Button 
            variant="outline" 
            className="reset-button" 
            onClick={() => onUpdateSettings({
              soundEnabled: true,
              musicEnabled: true,
              fastSpin: false,
              language: 'ar'
            })}
          >
            إعادة ضبط الإعدادات
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsPanel;