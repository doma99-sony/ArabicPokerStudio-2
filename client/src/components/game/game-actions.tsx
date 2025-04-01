import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface GameActionsProps {
  gameState: any;
  onAction: (action: 'fold' | 'check' | 'call' | 'raise' | 'allIn', amount?: number) => Promise<void>;
  isLoading?: boolean;
  isCurrentTurn?: boolean;
}

export function GameActions({ gameState, onAction, isLoading = false, isCurrentTurn = false }: GameActionsProps) {
  const { toast } = useToast();
  const [raiseAmount, setRaiseAmount] = useState<number>(gameState?.currentBet ? gameState.currentBet * 2 : 0);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  
  // التحقق مما إذا كانت الإجراءات ممكنة
  const isFoldEnabled = isCurrentTurn;
  const isCheckEnabled = isCurrentTurn && gameState?.currentBet === 0;
  const isCallEnabled = isCurrentTurn && gameState?.currentBet > 0;
  const isRaiseEnabled = isCurrentTurn && gameState?.userChips && 
                        ((gameState.userChips > gameState?.currentBet && gameState?.currentBet > 0) || 
                         (gameState.userChips > 0 && gameState?.currentBet === 0));
  const isAllInEnabled = isCurrentTurn && gameState?.userChips > 0;
  
  // الحد الأدنى والأقصى للرفع
  const minRaise = Math.max(gameState?.currentBet * 2 || gameState?.bigBlind || 0, gameState?.bigBlind || 0);
  const maxRaise = gameState?.userChips || 0;
  
  const handleRaiseAmountChange = (value: number[]) => {
    setRaiseAmount(value[0]);
  };
  
  const handleRaiseSubmit = async () => {
    if (raiseAmount < minRaise) {
      toast({
        title: "خطأ في الرفع",
        description: `الحد الأدنى للرفع هو ${minRaise}`,
        variant: "destructive"
      });
      return;
    }
    
    await onAction('raise', raiseAmount);
    setShowRaiseSlider(false);
  };
  
  const handleAllIn = async () => {
    if (!gameState?.userChips) {
      toast({
        title: "خطأ في المراهنة",
        description: "لا يمكن المراهنة بكل الرقاقات، رصيدك 0",
        variant: "destructive"
      });
      return;
    }
    
    await onAction('allIn', gameState.userChips);
  };
  
  return (
    <div className="game-actions-container absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex flex-col items-center space-y-3">
        {/* العرض الرئيسي لأزرار الإجراءات */}
        <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
          <Button
            variant="destructive"
            size="lg"
            disabled={!isFoldEnabled || isLoading}
            onClick={() => onAction('fold')}
            className="w-28 h-14 rounded-full text-lg shadow-glow-red"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'تخلي'}
          </Button>
          
          {isCheckEnabled ? (
            <Button
              variant="default"
              size="lg"
              disabled={!isCheckEnabled || isLoading}
              onClick={() => onAction('check')}
              className="w-28 h-14 rounded-full text-lg bg-green-600 hover:bg-green-700 text-white shadow-glow-green"
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'متابعة'}
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              disabled={!isCallEnabled || isLoading}
              onClick={() => onAction('call')}
              className="w-28 h-14 rounded-full text-lg bg-green-600 hover:bg-green-700 text-white shadow-glow-green"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  متابعة <span className="text-xs ml-1">{gameState?.currentBet || 0}</span>
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="default"
            size="lg"
            disabled={!isRaiseEnabled || isLoading}
            onClick={() => setShowRaiseSlider(!showRaiseSlider)}
            className="w-28 h-14 rounded-full text-lg bg-amber-600 hover:bg-amber-700 text-white shadow-glow-amber"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'رفع'}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            disabled={!isAllInEnabled || isLoading}
            onClick={handleAllIn}
            className="w-28 h-14 rounded-full text-lg bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white shadow-glow-gold border-2 border-yellow-300"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'الكل'}
          </Button>
        </div>
        
        {/* خيارات الرفع */}
        {showRaiseSlider && (
          <Card className="p-4 bg-black/80 border-yellow-500/30 w-96 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">المبلغ: {raiseAmount}</span>
                <span className="text-xs text-white/70">
                  الحد الأدنى: {minRaise} | الحد الأقصى: {maxRaise}
                </span>
              </div>
              
              <Slider
                defaultValue={[minRaise]}
                max={maxRaise}
                min={minRaise}
                step={gameState?.bigBlind || 100}
                onValueChange={handleRaiseAmountChange}
                value={[raiseAmount]}
                className="my-6"
              />
              
              <div className="flex justify-between space-x-2 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setRaiseAmount(minRaise)}
                  className="text-xs"
                >
                  الحد الأدنى
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRaiseAmount(Math.floor(maxRaise * 0.25))}
                  className="text-xs"
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRaiseAmount(Math.floor(maxRaise * 0.5))}
                  className="text-xs"
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRaiseAmount(Math.floor(maxRaise * 0.75))}
                  className="text-xs"
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRaiseAmount(maxRaise)}
                  className="text-xs"
                >
                  100%
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
                <Input
                  type="number"
                  min={minRaise}
                  max={maxRaise}
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  className="flex-1"
                />
                
                <Button
                  variant="default"
                  onClick={handleRaiseSubmit}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'رفع'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowRaiseSlider(false)}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* عرض التنويهات حول دور اللاعب */}
        {!isCurrentTurn && !isLoading && (
          <div className="bg-black/70 text-white rounded-full px-4 py-1 text-sm animate-pulse">
            {gameState?.gameStatus === 'waiting'
              ? 'انتظار انضمام لاعبين آخرين...'
              : gameState?.gameStatus === 'showdown'
              ? 'المواجهة النهائية...'
              : 'ليس دورك للعب'}
          </div>
        )}
      </div>
      
      {/* إضافة تأثيرات الظل للأزرار */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .shadow-glow-red {
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.4);
        }
        .shadow-glow-green {
          box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
        }
        .shadow-glow-amber {
          box-shadow: 0 0 15px rgba(255, 191, 0, 0.4);
        }
        .shadow-glow-gold {
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        }
        `
      }} />
    </div>
  );
}