import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GameAction, GameState } from "@/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface BetControlsProps {
  gameState: GameState;
}

export function BetControls({ gameState }: BetControlsProps) {
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState(gameState.currentBet || gameState.bigBlind);
  
  // Find the current player
  const currentPlayer = gameState.players.find(p => p.isCurrentPlayer);
  
  // Determine if it's the current player's turn
  const isPlayerTurn = currentPlayer && gameState.currentTurn === currentPlayer.id;
  
  // Calculate min and max bet amounts
  const minBet = gameState.currentBet || gameState.bigBlind;
  const maxBet = currentPlayer?.chips || 0;
  
  // Handle bet amount changes
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBetAmount(Math.max(minBet, Math.min(maxBet, value)));
  };
  
  // Decrease bet amount
  const decreaseBet = () => {
    setBetAmount(Math.max(minBet, betAmount - gameState.bigBlind));
  };
  
  // Increase bet amount
  const increaseBet = () => {
    setBetAmount(Math.min(maxBet, betAmount + gameState.bigBlind));
  };
  
  // Game action mutation
  const actionMutation = useMutation({
    mutationFn: async ({ action, amount }: { action: GameAction; amount?: number }) => {
      const res = await apiRequest("POST", `/api/game/${gameState.id}/action`, { action, amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game/${gameState.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Execute game action
  const executeAction = (action: GameAction) => {
    if (!isPlayerTurn) return;
    
    let amount;
    if (action === "raise" || action === "allIn") {
      amount = action === "allIn" ? maxBet : betAmount;
    }
    
    actionMutation.mutate({ action, amount });
  };
  
  // Check if fold action is possible
  const canFold = isPlayerTurn;
  
  // Check if check action is possible (only if no bet has been made)
  const canCheck = isPlayerTurn && gameState.currentBet === 0;
  
  // Check if call action is possible (current bet exists and not equal to player's bet)
  const canCall = isPlayerTurn && gameState.currentBet > 0 && (!currentPlayer?.betAmount || currentPlayer.betAmount < gameState.currentBet);
  
  // Check if raise action is possible
  const canRaise = isPlayerTurn && currentPlayer && currentPlayer.chips > gameState.currentBet;

  return (
    <div className="mt-3 bg-slate/30 rounded-lg p-3">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Button
            variant="destructive"
            className="bg-casinoRed hover:bg-red-700 text-white font-cairo"
            disabled={!canFold || actionMutation.isPending}
            onClick={() => executeAction("fold")}
          >
            طي
          </Button>
          
          {canCheck ? (
            <Button
              variant="secondary"
              className="bg-slate hover:bg-slate-700 text-white font-cairo"
              disabled={actionMutation.isPending}
              onClick={() => executeAction("check")}
            >
              متابعة
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="bg-slate hover:bg-slate-700 text-white font-cairo"
              disabled={!canCall || actionMutation.isPending}
              onClick={() => executeAction("call")}
            >
              مجاراة ({gameState.currentBet})
            </Button>
          )}
          
          <Button
            className="bg-gradient-to-br from-gold to-darkGold hover:from-lightGold hover:to-gold text-deepBlack font-cairo"
            disabled={!canRaise || actionMutation.isPending}
            onClick={() => executeAction("raise")}
          >
            رفع
          </Button>
        </div>
        
        <div className="flex items-center mt-3 sm:mt-0">
          <span className="text-white ml-2 font-tajawal">قيمة الرهان:</span>
          <div className="flex items-center bg-deepBlack/50 border border-gold/30 rounded-md overflow-hidden">
            <button
              className="bg-slate/50 px-2 py-1 text-white"
              onClick={decreaseBet}
              disabled={betAmount <= minBet || !canRaise}
            >
              -
            </button>
            <Input
              type="number"
              value={betAmount}
              onChange={handleBetAmountChange}
              className="bg-deepBlack w-20 text-center text-white border-none focus:outline-none font-roboto"
              disabled={!canRaise}
            />
            <button
              className="bg-slate/50 px-2 py-1 text-white"
              onClick={increaseBet}
              disabled={betAmount >= maxBet || !canRaise}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
