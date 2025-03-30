import { useLocation } from "wouter";
import { GameTable } from "@/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Image } from "@/components/ui/image";
import { useToast } from "@/hooks/use-toast";

interface TableCardProps {
  table: GameTable;
}

export function TableCard({ table }: TableCardProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const tableImages = [
    "https://images.unsplash.com/photo-1609743522653-52354461eb27",
    "https://images.unsplash.com/photo-1606167668584-78701c57f13d",
    "https://images.unsplash.com/photo-1511193311914-0346f16efe90"
  ];
  
  // Get a consistent image for the table based on ID
  const tableImage = tableImages[table.id % tableImages.length];
  
  // Calculate remaining seats
  const remainingSeats = table.maxPlayers - table.currentPlayers;
  
  // Determine status colors and text
  const statusConfig = {
    available: {
      bgColor: "bg-green-600",
      text: `متاحة ${table.currentPlayers}/${table.maxPlayers}`
    },
    busy: {
      bgColor: "bg-casinoRed",
      text: `مشغولة ${table.currentPlayers}/${table.maxPlayers}`
    },
    full: {
      bgColor: "bg-casinoRed",
      text: `طاولة ممتلئة ${table.maxPlayers}/${table.maxPlayers}`
    }
  };
  
  const tableStatus = statusConfig[table.status];
  
  // Check if user has enough chips to join
  const hasEnoughChips = user?.chips && user.chips >= table.minBuyIn;
  
  // Join table handler
  const handleJoinTable = () => {
    if (!hasEnoughChips) {
      toast({
        title: "رصيد غير كافي",
        description: `تحتاج إلى ${table.minBuyIn} رقائق على الأقل للانضمام إلى هذه الطاولة.`,
        variant: "destructive"
      });
      return;
    }
    
    if (table.status === "full") {
      toast({
        title: "الطاولة ممتلئة",
        description: "يرجى اختيار طاولة أخرى.",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/game/${table.id}`);
  };

  return (
    <div className="bg-pokerGreen rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
      <div className="relative h-40 bg-slate">
        <Image
          src={tableImage}
          alt={table.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className={`absolute top-0 right-0 ${tableStatus.bgColor} text-white px-3 py-1 rounded-bl-lg font-roboto`}>
          {tableStatus.text}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-2 font-cairo">{table.name}</h3>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-gold rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-coins text-deepBlack text-xs"></i>
            </div>
            <span className="text-white font-roboto">{table.smallBlind}/{table.bigBlind}</span>
          </div>
          
          <div className="bg-slate/50 rounded px-2 py-1 text-sm">
            <span className="text-white font-roboto">الحد الأدنى: {table.minBuyIn.toLocaleString()}</span>
          </div>
        </div>
        
        {table.status === "full" ? (
          <Button
            disabled
            className="w-full bg-gray-500 text-white font-bold py-2 rounded cursor-not-allowed font-cairo"
          >
            طاولة ممتلئة
          </Button>
        ) : (
          <Button
            onClick={handleJoinTable}
            disabled={!hasEnoughChips}
            className={`w-full ${hasEnoughChips ? "bg-gold hover:bg-darkGold" : "bg-gray-500 cursor-not-allowed"} text-deepBlack font-bold py-2 rounded transition-colors font-cairo`}
          >
            انضم للطاولة
          </Button>
        )}
      </div>
    </div>
  );
}
