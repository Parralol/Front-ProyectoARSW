import { useEffect, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const useWebSocket = (host, setEntities, setPlayers, setPlayerId) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new ReconnectingWebSocket(`ws://${host}/ws/game`);
    setWs(socket);

    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socket.onmessage = (event) => {
      const message = event.data;
      console.log('Received message:', message);

      try {
        const data = JSON.parse(message);
        if (data && data[Object.keys(data)[0]].name) {
          setPlayers(data);
        } else {
          setEntities(data);
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        console.log('Message content:', message);
        if (message.startsWith('Player ID:')) {
          const id = message.split(':')[1].trim();
          setPlayerId(id);
        }
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    return () => {
      socket.close();
    };
  }, [host, setEntities, setPlayers, setPlayerId]);

  return ws;
};