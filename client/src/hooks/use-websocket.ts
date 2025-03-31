const [socket, setSocket] = useState<WebSocket | null>(null);
const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
const reconnectAttemptsRef = useRef(0);
const MAX_RECONNECT_ATTEMPTS = 5;

useEffect(() => {
  const connectWebSocket = () => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("WebSocket connected");
      reconnectAttemptsRef.current = 0;
      setSocket(ws);
    };

    ws.onclose = () => {
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket();
        }, 1000 * Math.min(reconnectAttemptsRef.current + 1, 5));
      }
    };

    return ws;
  };

  const ws = connectWebSocket();

  return () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    ws.close();
  };
}, []);