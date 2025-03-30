import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { GameTable } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, DollarSign, PlayCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TableCardProps {
  table: GameTable;
}

export function TableCard({ table }: TableCardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/game/${table.id}/join`);
      return await res.json();
    },
    onSuccess: () => {
      navigate(`/game/${table.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل الانضمام إلى الطاولة",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Get status color based on table status
  const getStatusColor = () => {
    switch (table.status) {
      case "available":
        return "bg-green-500/70 hover:bg-green-500/60";
      case "busy":
        return "bg-amber-500/70 hover:bg-amber-500/60";
      case "full":
        return "bg-red-500/70 hover:bg-red-500/60";
      default:
        return "bg-gray-500/70 hover:bg-gray-500/60";
    }
  };

  // Get status text in Arabic
  const getStatusText = () => {
    switch (table.status) {
      case "available":
        return "متاحة";
      case "busy":
        return "مشغولة";
      case "full":
        return "ممتلئة";
      default:
        return "غير معروف";
    }
  };

  return (
    <Card className="bg-black/70 border border-[#D4AF37]/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-[#D4AF37]/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-[#D4AF37] text-xl">{table.name}</CardTitle>
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-white/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users size={16} className="text-[#D4AF37] ml-2" />
            <span>اللاعبين: {table.currentPlayers}/{table.maxPlayers}</span>
          </div>
          <div className="flex items-center">
            <DollarSign size={16} className="text-[#D4AF37] ml-2" />
            <span>العمى: {table.smallBlind} / {table.bigBlind}</span>
          </div>
        </div>
        
        <div className="border-t border-[#D4AF37]/20 pt-3 text-sm">
          <div className="flex justify-between mb-1">
            <span>الحد الأدنى للدخول:</span>
            <span className="font-bold text-[#D4AF37]">{table.minBuyIn} رقاقة</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] hover:from-[#E5C04B] hover:to-[#D4AF37] text-[#0A0A0A] font-bold"
          disabled={table.status === "full" || joinMutation.isPending}
          onClick={() => joinMutation.mutate()}
        >
          {joinMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            <>
              <PlayCircle size={18} className="ml-2" />
              انضم للعب
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}