import React from "react";
import { Card } from "@/components/ui/card";
import { Player } from "../hooks/use-egypt-rocket-socket";

interface PlayersListProps {
  players: Player[];
}

const PlayersList: React.FC<PlayersListProps> = ({ players }) => {
  return (
    <Card className="p-4 bg-slate-700 border-none shadow-md">
      <h2 className="text-lg font-bold text-white mb-3">اللاعبين</h2>
      <div className="max-h-[200px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-400">
            <tr>
              <th className="text-right pb-2">اللاعب</th>
              <th className="text-right pb-2">الرهان</th>
              <th className="text-right pb-2">الضارب</th>
              <th className="text-right pb-2">الربح</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-400">
                  لا يوجد لاعبين حالياً
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr key={player.id} className="border-t border-slate-600">
                  <td className="py-2 text-white">{player.username}</td>
                  <td className="py-2 text-white">{player.betAmount}</td>
                  <td className={`py-2 ${player.cashoutMultiplier ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {player.cashoutMultiplier ? `${player.cashoutMultiplier.toFixed(2)}x` : '-'}
                  </td>
                  <td className={`py-2 ${
                    player.profit === null ? 'text-slate-400' :
                    player.profit > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {player.profit === null ? '-' : player.profit}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PlayersList;