import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  BadgeCategory,
  UserBadge,
  Badge as BadgeType,
  BadgeEffect
} from "../types";

const BADGE_POSITIONS = [0, 1, 2, 3, 4, 5]; // 6 positions for equipped badges

export default function BadgesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Queries
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/badges/categories"],
    enabled: true,
  });
  
  const { data: allBadges, isLoading: loadingBadges } = useQuery({
    queryKey: ["/api/badges", selectedCategory], 
    enabled: true,
  });
  
  const { data: userBadges, isLoading: loadingUserBadges } = useQuery({
    queryKey: ["/api/badges/user"],
    enabled: true,
  });
  
  // Mutations
  const equipBadgeMutation = useMutation({
    mutationFn: (params: { badgeId: number, position: number }) => {
      return apiRequest(`/api/badges/equip/${params.badgeId}`, {
        method: "POST",
        body: JSON.stringify({ position: params.position })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/badges/user"] });
      toast({
        title: "نجاح!",
        description: "تم تجهيز الشارة بنجاح",
        variant: "default"
      });
    }
  });
  
  const unequipBadgeMutation = useMutation({
    mutationFn: (badgeId: number) => {
      return apiRequest(`/api/badges/unequip/${badgeId}`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/badges/user"] });
      toast({
        title: "نجاح!",
        description: "تم إزالة الشارة بنجاح",
        variant: "default"
      });
    }
  });
  
  const favoriteBadgeMutation = useMutation({
    mutationFn: (params: { badgeId: number, order: number }) => {
      return apiRequest(`/api/badges/favorite/${params.badgeId}`, {
        method: "POST",
        body: JSON.stringify({ order: params.order })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/badges/user"] });
      toast({
        title: "نجاح!",
        description: "تمت إضافة الشارة إلى المفضلة",
        variant: "default"
      });
    }
  });
  
  const unfavoriteBadgeMutation = useMutation({
    mutationFn: (badgeId: number) => {
      return apiRequest(`/api/badges/unfavorite/${badgeId}`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/badges/user"] });
      toast({
        title: "نجاح!",
        description: "تمت إزالة الشارة من المفضلة",
        variant: "default"
      });
    }
  });
  
  // Filter badges based on active tab
  const filteredBadges = () => {
    if (!allBadges || !userBadges) return [];
    
    if (activeTab === "all") {
      return allBadges;
    } else if (activeTab === "acquired") {
      // Get all user badge IDs
      const userBadgeIds = userBadges.map((ub: UserBadge) => ub.badgeId);
      // Find all badges that match those IDs
      return allBadges.filter((badge: BadgeType) => userBadgeIds.includes(badge.id));
    } else if (activeTab === "unacquired") {
      // Get all user badge IDs
      const userBadgeIds = userBadges.map((ub: UserBadge) => ub.badgeId);
      // Find all badges that don't match those IDs
      return allBadges.filter((badge: BadgeType) => !userBadgeIds.includes(badge.id));
    } else if (activeTab === "equipped") {
      return userBadges.filter((ub: UserBadge) => ub.isEquipped).map((ub: UserBadge) => ub.badge);
    } else if (activeTab === "favorites") {
      return userBadges.filter((ub: UserBadge) => ub.favoriteOrder !== undefined).map((ub: UserBadge) => ub.badge);
    }
    
    return [];
  };
  
  // Find if a badge is equipped
  const getBadgeStatus = (badgeId: number) => {
    if (!userBadges) return { isAcquired: false, isEquipped: false, isFavorite: false };
    
    const userBadge = userBadges.find((ub: UserBadge) => ub.badgeId === badgeId);
    if (!userBadge) return { isAcquired: false, isEquipped: false, isFavorite: false };
    
    return {
      isAcquired: true,
      isEquipped: userBadge.isEquipped,
      isFavorite: userBadge.favoriteOrder !== undefined,
      position: userBadge.equippedPosition,
      favoriteOrder: userBadge.favoriteOrder
    };
  };
  
  // Equipment section - badges that are equipped and empty slots
  const renderEquippedBadges = () => {
    if (!userBadges) return null;
    
    // Get equipped badges with their positions
    const equippedBadges = userBadges.filter((ub: UserBadge) => ub.isEquipped);
    
    return (
      <div className="my-6">
        <h3 className="text-lg font-bold mb-2">الشارات المجهزة</h3>
        <div className="grid grid-cols-6 gap-4">
          {BADGE_POSITIONS.map((position) => {
            const badgeInPosition = equippedBadges.find((ub: UserBadge) => ub.equippedPosition === position);
            
            return (
              <div key={position} className="relative">
                <div className={`h-24 w-24 rounded-full flex items-center justify-center
                  ${badgeInPosition ? 'bg-transparent' : 'bg-slate-200 dark:bg-slate-800 border-2 border-dashed'}`}>
                  {badgeInPosition ? (
                    <div className="relative">
                      <BadgeDisplay badge={badgeInPosition.badge} />
                      <button 
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"
                        onClick={() => unequipBadgeMutation.mutate(badgeInPosition.badgeId)}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">فارغ</span>
                  )}
                </div>
                <div className="text-center mt-1 text-sm">موقع {position + 1}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Badge display component with effects
  const BadgeDisplay = ({ badge }: { badge: BadgeType }) => {
    const getEffectClasses = () => {
      if (!badge.effects || badge.effects.length === 0) return '';
      
      const classes = [];
      
      badge.effects.forEach((effect: BadgeEffect) => {
        if (effect.type === 'glow') {
          const color = effect.color || badge.glowColor || badge.color;
          const intensity = effect.intensity || 5;
          classes.push(`shadow-[0_0_${intensity * 2}px_${color}]`);
        }
        
        if (effect.type === 'pulse') {
          classes.push('animate-pulse');
        }
        
        if (effect.type === 'rotate') {
          classes.push('hover:rotate-12 transition-transform');
        }
        
        if (effect.type === 'shake') {
          classes.push('hover:animate-shake');
        }
        
        if (effect.type === 'sparkle') {
          classes.push('after:content-["✨"] after:absolute after:top-0 after:right-0');
        }
        
        if (effect.type === 'flip') {
          classes.push('group-hover:rotate-y-180 transition-transform duration-700');
        }
        
        if (effect.type === 'rainbow') {
          classes.push('animate-rainbow-border');
        }
      });
      
      return classes.join(' ');
    };
    
    return (
      <div 
        className={`h-20 w-20 rounded-full relative flex items-center justify-center group 
          ${getEffectClasses()}`}
        style={{ backgroundColor: badge.color }}
      >
        <div
          className={`absolute inset-0 rounded-full group-hover:opacity-20 transition-opacity opacity-0 bg-white`}
        ></div>
        <span className="text-white font-bold text-lg z-10">
          {badge.name.substring(0, 2)}
        </span>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-8 dir-rtl text-right">
      <h1 className="text-3xl font-bold mb-6 text-center">الشارات</h1>
      
      {loadingCategories || loadingBadges || loadingUserBadges ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-12 w-12 border-t-2 border-blue-500 rounded-full"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Categories Filter */}
          <div className="flex gap-2 overflow-x-auto p-2">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="whitespace-nowrap"
            >
              الكل
            </Button>
            {categories?.map((category: BadgeCategory) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
          
          {/* Equipped Badges */}
          {renderEquippedBadges()}
          
          {/* Tabs for filtering badges */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">جميع الشارات</TabsTrigger>
              <TabsTrigger value="acquired">الشارات المكتسبة</TabsTrigger>
              <TabsTrigger value="unacquired">الشارات المتبقية</TabsTrigger>
              <TabsTrigger value="equipped">المجهزة</TabsTrigger>
              <TabsTrigger value="favorites">المفضلة</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBadges().map((badge: BadgeType) => {
                  const status = getBadgeStatus(badge.id);
                  
                  return (
                    <Card key={badge.id} className={`overflow-hidden ${badge.isRare ? 'border-amber-400 border-2' : ''}`}>
                      <div className="flex p-4">
                        <div className="mr-4">
                          <BadgeDisplay badge={badge} />
                        </div>
                        <div className="flex flex-col flex-1">
                          <CardHeader className="p-0 pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-lg">
                                {badge.name}
                                {badge.isRare && (
                                  <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800">
                                    نادر
                                  </Badge>
                                )}
                              </CardTitle>
                              
                              {badge.requiredVipLevel > 0 && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                  VIP {badge.requiredVipLevel}
                                </Badge>
                              )}
                            </div>
                            <CardDescription>
                              {badge.description}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="p-0 mt-auto">
                            <div className="flex items-center text-sm">
                              <div className="flex flex-wrap gap-1 mt-2">
                                {status.isAcquired ? (
                                  <Badge variant="outline" className="bg-green-100 text-green-800">مكتسبة</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-800">غير مكتسبة</Badge>
                                )}
                                
                                {status.isEquipped && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800">مجهزة</Badge>
                                )}
                                
                                {status.isFavorite && (
                                  <Badge variant="outline" className="bg-red-100 text-red-800">مفضلة</Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                      
                      {status.isAcquired && (
                        <CardFooter className="flex justify-between p-4 pt-0 gap-2">
                          {!status.isEquipped ? (
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => equipBadgeMutation.mutate({ 
                                badgeId: badge.id, 
                                position: BADGE_POSITIONS.find(pos => 
                                  !userBadges.some((ub: UserBadge) => 
                                    ub.isEquipped && ub.equippedPosition === pos
                                  )
                                ) || 0
                              })}
                            >
                              تجهيز
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => unequipBadgeMutation.mutate(badge.id)}
                            >
                              إزالة
                            </Button>
                          )}
                          
                          {!status.isFavorite ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => favoriteBadgeMutation.mutate({ 
                                badgeId: badge.id, 
                                order: userBadges.filter((ub: UserBadge) => 
                                  ub.favoriteOrder !== undefined
                                ).length
                              })}
                            >
                              إضافة للمفضلة
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => unfavoriteBadgeMutation.mutate(badge.id)}
                            >
                              إزالة من المفضلة
                            </Button>
                          )}
                        </CardFooter>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}