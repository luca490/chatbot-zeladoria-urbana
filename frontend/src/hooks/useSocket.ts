import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(connectCondition: boolean = true) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Conecta ao servidor WebSocket apenas se a condição for satisfeita
    if (!connectCondition) return;

    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [connectCondition]);

  return socket;
}
