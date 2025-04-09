import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, User, Users, DollarSign, Table, Play, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocketManager, SocketMessageType } from '../poker-masr/logic/socket-manager';
import { usePokerStore } from '../poker-masr/store/poker-store';

/**
 * أنواع غرف البوكر
 */
interface PokerRoom {
  id: number;
  name: string;
  description: string;
  minBuyIn: number;
  maxBuyIn: number;
  blinds: { small: number, big: number };
  isVIP: boolean;
  maxPlayersPerTable: number;
  playersCount: number;
  tablesCount: number;
  tables: PokerTable[];
}

/**
 * نوع طاولة البوكر
 */
interface PokerTable {
  id: number;
  roomId: number;
  name: string;
  status: string;
  playersCount: number;
  maxPlayers: number;
  minBuyIn: number;
  maxBuyIn: number;
  blinds: { small: number, big: number };
  isRoundActive: boolean;
}

/**
 * بوكر مصر - الصفحة الرئيسية
 * الصفحة الرئيسية للعبة بوكر مصر التي تعرض غرف اللعب المختلفة
 */
export default function PokerMasrLobby() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>("rooms");
  const [selectedRoom, setSelectedRoom] = useState<PokerRoom | null>(null);
  const [rooms, setRooms] = useState<PokerRoom[]>([]);
  const [tables, setTables] = useState<PokerTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [socketManager, setSocketManager] = useState<SocketManager | null>(null);
  
  // الاتصال بخادم البوكر
  useEffect(() => {
    // عدم الاتصال إذا لم تكن هناك بيانات مستخدم
    if (!user?.id || !user?.username) {
      setError('يرجى تسجيل الدخول للوصول إلى غرف البوكر');
      setLoading(false);
      return;
    }

    setConnecting(true);
    console.log('جاري الاتصال بخادم البوكر...');

    const connectToServer = async () => {
      try {
        // استخدام متجر البوكر للاتصال
        const { initializeSocket } = usePokerStore.getState();
        const connected = await initializeSocket(user.id, user.username);
        
        if (connected) {
          const sm = usePokerStore.getState().socketManager;
          setSocketManager(sm);
          
          // تسجيل المعالجات للاستجابة للرسائل من السيرفر
          if (sm) {
            // تسجيل معالج لاستقبال قائمة الغرف
            sm.registerHandlers({
              [SocketMessageType.ROOMS_LIST]: (data: { rooms: PokerRoom[] }) => {
                if (data.rooms) {
                  setRooms(data.rooms);
                  setLoading(false);
                }
              },
              [SocketMessageType.TABLES_LIST]: (data: { tables: PokerTable[], roomId?: number }) => {
                if (data.tables) {
                  // تحديث قائمة الطاولات للغرفة المختارة
                  if (data.roomId) {
                    const roomIndex = rooms.findIndex(r => r.id === data.roomId);
                    if (roomIndex >= 0) {
                      const updatedRooms = [...rooms];
                      updatedRooms[roomIndex].tables = data.tables;
                      setRooms(updatedRooms);
                    }
                  }
                  // في جميع الحالات، تحديث قائمة الطاولات المعروضة
                  setTables(data.tables);
                }
              },
              [SocketMessageType.TABLE_CREATED]: (data: { tableInfo: PokerTable, roomId: number }) => {
                // إضافة الطاولة الجديدة إلى قائمة الطاولات وتحديث الغرفة
                if (data.tableInfo && data.roomId) {
                  toast({
                    title: 'تم إنشاء الطاولة',
                    description: `تم إنشاء الطاولة ${data.tableInfo.name} بنجاح!`,
                  });
                  
                  // تحديث قائمة الطاولات
                  const roomIndex = rooms.findIndex(r => r.id === data.roomId);
                  if (roomIndex >= 0) {
                    // نسخة جديدة من الغرف لتحديث واجهة المستخدم
                    const updatedRooms = [...rooms];
                    
                    // إذا كانت الطاولات موجودة بالفعل، أضف الطاولة الجديدة إليها
                    if (updatedRooms[roomIndex].tables) {
                      updatedRooms[roomIndex].tables = [
                        ...updatedRooms[roomIndex].tables,
                        data.tableInfo
                      ];
                    } else {
                      // إنشاء مصفوفة جديدة إذا لم تكن موجودة
                      updatedRooms[roomIndex].tables = [data.tableInfo];
                    }
                    
                    // زيادة عدد الطاولات في الغرفة
                    updatedRooms[roomIndex].tablesCount = (updatedRooms[roomIndex].tablesCount || 0) + 1;
                    
                    // تحديث الغرف
                    setRooms(updatedRooms);
                    
                    // إذا كانت هذه هي الغرفة المختارة حاليًا، قم بتحديث قائمة الطاولات المعروضة
                    if (selectedRoom && selectedRoom.id === data.roomId) {
                      setTables([...tables, data.tableInfo]);
                    }
                  }
                }
              },
              [SocketMessageType.ERROR]: (data: { message: string }) => {
                setError(data.message);
                setLoading(false);
              }
            });

            // طلب قائمة الغرف من السيرفر
            sm.sendMessage(SocketMessageType.GET_ROOMS);
          }
          
          toast({
            title: 'تم الاتصال بنجاح',
            description: 'أنت الآن متصل بخادم بوكر مصر!'
          });
        } else {
          setError('فشل الاتصال بخادم البوكر. يرجى المحاولة مرة أخرى.');
          setLoading(false);
        }
      } catch (error) {
        console.error('خطأ في الاتصال بالخادم:', error);
        setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      } finally {
        setConnecting(false);
      }
    };
    
    connectToServer();
    
    // تنظيف عند مغادرة الصفحة
    return () => {
      if (socketManager) {
        socketManager.unregisterHandler(SocketMessageType.ROOMS_LIST);
        socketManager.unregisterHandler(SocketMessageType.TABLES_LIST);
        socketManager.unregisterHandler(SocketMessageType.TABLE_CREATED);
        socketManager.unregisterHandler(SocketMessageType.ERROR);
      }
    };
  }, [user?.id, user?.username, toast]);
  
  // استخدام البيانات المحلية مؤقتًا حتى تصل البيانات من السيرفر
  const defaultRooms: PokerRoom[] = [
    {
      id: 1,
      name: 'غرفة المبتدئين',
      description: 'غرفة مناسبة للاعبين الجدد في لعبة البوكر',
      minBuyIn: 200,
      maxBuyIn: 2000,
      blinds: { small: 5, big: 10 },
      isVIP: false,
      maxPlayersPerTable: 6,
      playersCount: 0,
      tablesCount: 2,
      tables: []
    },
    {
      id: 2,
      name: 'غرفة المحترفين',
      description: 'غرفة للاعبين ذوي الخبرة مع رهانات أعلى',
      minBuyIn: 1000,
      maxBuyIn: 10000,
      blinds: { small: 25, big: 50 },
      isVIP: false,
      maxPlayersPerTable: 6,
      playersCount: 0,
      tablesCount: 2,
      tables: []
    },
    {
      id: 3,
      name: 'غرفة VIP',
      description: 'غرفة حصرية مع رهانات عالية',
      minBuyIn: 5000,
      maxBuyIn: 50000,
      blinds: { small: 100, big: 200 },
      isVIP: true,
      maxPlayersPerTable: 4,
      playersCount: 0,
      tablesCount: 1,
      tables: []
    }
  ];

  // استخدام البيانات الافتراضية إذا لم تكن هناك بيانات من السيرفر
  useEffect(() => {
    if (!loading && rooms.length === 0 && !error) {
      setRooms(defaultRooms);
    }
  }, [loading, rooms.length, error]);
  
  // معالجة اختيار غرفة
  const handleRoomSelect = (room: PokerRoom) => {
    setSelectedRoom(room);
    setSelectedTab('tables');
    
    // طلب قائمة الطاولات لهذه الغرفة من السيرفر
    if (socketManager) {
      socketManager.sendMessage(SocketMessageType.GET_TABLES, { roomId: room.id });
    }
  };
  
  // معالجة الانضمام إلى طاولة
  const handleJoinTable = (tableId: number) => {
    // التوجيه إلى صفحة تكساس هولدم مع معرف الطاولة كباراميتر
    navigate(`/poker-lobby/poker-masr/texas-holdem?table=${tableId}`);
  };

  // معالجة إنشاء طاولة جديدة
  const handleCreateTable = () => {
    if (!selectedRoom || !socketManager) {
      toast({
        title: 'خطأ',
        description: 'لا يمكن إنشاء طاولة. يرجى التأكد من اختيار غرفة والاتصال بالخادم.',
        variant: 'destructive'
      });
      return;
    }

    const roomId = selectedRoom.id;
    const defaultName = `طاولة ${selectedRoom.name} الجديدة`;
    const tableName = prompt('أدخل اسم الطاولة الجديدة:', defaultName);
    
    if (!tableName) return; // إلغاء الإنشاء إذا ضغط إلغاء

    // إرسال طلب إنشاء طاولة إلى الخادم
    socketManager.sendMessage(SocketMessageType.CREATE_TABLE, {
      roomId,
      name: tableName,
      maxPlayers: selectedRoom.maxPlayersPerTable
    });

    toast({
      title: 'جاري إنشاء الطاولة',
      description: 'يتم الآن إنشاء طاولة جديدة. سيتم إظهارها في القائمة قريباً.',
    });
  };
  
  // تحديث قائمة الغرف من السيرفر
  const refreshRooms = () => {
    setLoading(true);
    if (socketManager) {
      socketManager.sendMessage(SocketMessageType.GET_ROOMS);
    } else {
      // إذا لم يكن هناك اتصال، نعيد الاتصال
      if (user?.id && user?.username) {
        const { initializeSocket } = usePokerStore.getState();
        initializeSocket(user.id, user.username)
          .then(connected => {
            if (connected) {
              const sm = usePokerStore.getState().socketManager;
              setSocketManager(sm);
              if (sm) {
                sm.sendMessage(SocketMessageType.GET_ROOMS);
              }
            } else {
              setError('فشل الاتصال بخادم البوكر. يرجى المحاولة مرة أخرى.');
              setLoading(false);
            }
          })
          .catch(err => {
            console.error('خطأ في إعادة الاتصال:', err);
            setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
            setLoading(false);
          });
      } else {
        setError('يرجى تسجيل الدخول للوصول إلى غرف البوكر');
        setLoading(false);
      }
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="outline" className="bg-orange-900/20 text-orange-400 border-orange-600">انتظار</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-600">نشطة</Badge>;
      case 'starting':
        return <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-600">بدء</Badge>;
      case 'showdown':
        return <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-600">عرض الأوراق</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // عرض شاشة الخطأ
  if (error) {
    return (
      <div className="poker-masr-lobby min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black flex flex-col items-center justify-center">
        <div className="bg-black/50 border border-red-500/30 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl text-white mb-4">حدث خطأ</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              setLoading(true);
              refreshRooms();
            }}
            className="bg-[#D4AF37] text-black hover:bg-[#FFC800] hover:text-black border-none"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // عرض شاشة التحميل
  if (loading || connecting) {
    return (
      <div className="poker-masr-lobby min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin mb-4" />
        <h2 className="text-2xl text-white mb-2">
          {connecting ? 'جاري الاتصال بخادم البوكر...' : 'جاري تحميل غرف البوكر...'}
        </h2>
        <p className="text-white/70">يرجى الانتظار قليلاً</p>
      </div>
    );
  }
  
  return (
    <div className="poker-masr-lobby min-h-screen bg-gradient-to-b from-[#0A3A2A] to-black">
      {/* الهيدر */}
      <div className="relative w-full h-48 overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src="/images/egyptian-poker-bg.jpg" 
          alt="بوكر مصر" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-bold text-white mb-2">بوكر مصر</h1>
          <p className="text-lg text-white/80">أفضل تجربة للعب البوكر بنكهة عربية</p>
        </div>
        
        {/* زر العودة */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white/80 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      
      {/* قسم الغرف */}
      <div className="container mx-auto px-4 py-8">
        <Tabs 
          defaultValue="rooms" 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-black/40">
              <TabsTrigger value="rooms" onClick={() => setSelectedTab('rooms')}>
                الغرف المتاحة
              </TabsTrigger>
              <TabsTrigger value="tables" onClick={() => setSelectedTab('tables')} disabled={!selectedRoom}>
                الطاولات {selectedRoom ? `(${selectedRoom.name})` : ''}
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshRooms}
                className="text-white bg-black/30 hover:bg-black/50 border border-white/20"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                تحديث
              </Button>
              
              {selectedRoom && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedRoom(null);
                    setSelectedTab('rooms');
                  }}
                  className="text-white hover:text-white/80"
                >
                  العودة لقائمة الغرف
                </Button>
              )}
            </div>
          </div>
          
          <TabsContent value="rooms" className="mt-0">
            <Card className="bg-black/50 border-none shadow-xl">
              <CardContent className="p-6">
                <UITable>
                  <TableHeader className="bg-black/60">
                    <TableRow>
                      <TableHead className="text-white">🏠 الغرفة</TableHead>
                      <TableHead className="text-white">👥 اللاعبين</TableHead>
                      <TableHead className="text-white">🎲 الطاولات</TableHead>
                      <TableHead className="text-white">💰 الرهانات</TableHead>
                      <TableHead className="text-right text-white">تفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms && rooms.length > 0 ? rooms.map((room: PokerRoom) => (
                      <TableRow 
                        key={room.id}
                        className="hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => handleRoomSelect(room)}
                      >
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center">
                            {room.isVIP ? (
                              <span className="mr-2 text-[#D4AF37] text-xl">👑</span>
                            ) : null}
                            {room.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-[#D4AF37]" />
                            {room.playersCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center">
                            <Table className="mr-2 h-4 w-4 text-[#D4AF37]" />
                            {room.tablesCount}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center">
                            <DollarSign className="mr-2 h-4 w-4 text-[#D4AF37]" />
                            {room.blinds.small}/{room.blinds.big}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-[#D4AF37] text-black hover:bg-[#FFC800] hover:text-black border-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoomSelect(room);
                            }}
                          >
                            عرض الطاولات
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-white/70">
                          لا توجد غرف متاحة حاليًا
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </UITable>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tables" className="mt-0">
            {selectedRoom ? (
              <Card className="bg-black/50 border-none shadow-xl">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center">
                        {selectedRoom.isVIP && <span className="mr-2 text-[#D4AF37] text-xl">👑</span>}
                        {selectedRoom.name}
                      </h3>
                      <p className="text-white/70 text-sm">{selectedRoom.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-4 rtl:space-x-reverse text-sm text-white/80">
                        <div>
                          <span className="text-[#D4AF37]">الحد الأدنى:</span> {selectedRoom.minBuyIn}
                        </div>
                        <div>
                          <span className="text-[#D4AF37]">الحد الأقصى:</span> {selectedRoom.maxBuyIn}
                        </div>
                        <div>
                          <span className="text-[#D4AF37]">البلايند:</span> {selectedRoom.blinds.small}/{selectedRoom.blinds.big}
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateTable}
                        className="bg-[#079458] hover:bg-[#06c166] text-white border-none"
                        size="sm"
                      >
                        <Table className="mr-2 h-4 w-4" />
                        إنشاء طاولة جديدة
                      </Button>
                    </div>
                  </div>
                  
                  <UITable>
                    <TableHeader className="bg-black/60">
                      <TableRow>
                        <TableHead className="text-white">🎲 الطاولة</TableHead>
                        <TableHead className="text-white">👥 اللاعبين</TableHead>
                        <TableHead className="text-white">حالة الطاولة</TableHead>
                        <TableHead className="text-white">💰 الرهانات</TableHead>
                        <TableHead className="text-right text-white">الإجراء</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRoom.tables && selectedRoom.tables.length > 0 ? (
                        selectedRoom.tables.map((table) => (
                          <TableRow key={table.id} className="hover:bg-white/5">
                            <TableCell className="font-medium text-white">
                              {table.name}
                            </TableCell>
                            <TableCell className="text-white">
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4 text-[#D4AF37]" />
                                {table.playersCount}/{table.maxPlayers}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(table.status)}
                              {table.isRoundActive && (
                                <span className="ml-2 inline-flex items-center">
                                  <Play className="animate-pulse h-3 w-3 text-green-500 mr-1" />
                                  <span className="text-green-500 text-xs">نشطة</span>
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-white">
                              <div className="flex items-center">
                                <DollarSign className="mr-2 h-4 w-4 text-[#D4AF37]" />
                                {table.blinds.small}/{table.blinds.big}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-[#D4AF37] text-black hover:bg-[#FFC800] hover:text-black border-none"
                                onClick={() => handleJoinTable(table.id)}
                                disabled={table.playersCount >= table.maxPlayers}
                              >
                                {table.playersCount >= table.maxPlayers ? 'ممتلئة' : 'انضم للطاولة'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-white/70">
                            لا توجد طاولات متاحة في هذه الغرفة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </UITable>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-white">
                يرجى اختيار غرفة أولاً لعرض الطاولات المتاحة
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}