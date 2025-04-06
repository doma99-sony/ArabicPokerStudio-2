import React from "react";
import { Card } from "@/components/ui/card";
import { GameHistory } from "../hooks/use-egypt-rocket-socket";

interface GameHistoryProps {
  history: GameHistory[];
}

const GameHistoryComponent: React.FC<GameHistoryProps> = ({ history }) => {
  return (
    <Card className="p-4 bg-slate-700 border-none shadow-md">
      <h2 className="text-lg font-bold text-white mb-3">سجل الألعاب</h2>
      <div className="max-h-[200px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-400">
            <tr>
              <th className="text-right pb-2">الضارب</th>
              <th className="text-right pb-2">الوقت</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-4 text-center text-slate-400">
                  لا يوجد سجل للألعاب السابقة
                </td>
              </tr>
            ) : (
              history.map((game) => (
                <tr key={game.id} className="border-t border-slate-600">
                  <td className={`py-2 ${
                    game.multiplier >= 2 ? 'text-emerald-400' :
                    game.multiplier >= 1.5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {game.multiplier.toFixed(2)}x
                  </td>
                  <td className="py-2 text-white">{game.crashed_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default GameHistoryComponent;