import { useEffect, useState, useRef } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const useWebSocket = (host, setEntities, setPlayers, setPlayerId) => {
  const [ws, setWs] = useState(null);
  const handledLosses = useRef(new Set()); // Track handled losses

  useEffect(() => {
    const socket = new ReconnectingWebSocket(`wss://${host}/ws/game`);
    setWs(socket);

    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    socket.onmessage = async (event) => {
      const message = event.data;
      //console.log('Received message:', message);

      try {
        const data = JSON.parse(message);

        if (data && data[Object.keys(data)[0]] && data[Object.keys(data)[0]].name) {
          setPlayers(data);

          // Check for player loss
          Object.values(data).forEach(player => {
            if (player.loose && !handledLosses.current.has(player.name)) {
              handledLosses.current.add(player.name);
              handlePlayerLoss(); // Trigger loss handling
            }
          });
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

  // Function to handle player loss
  const handlePlayerLoss = async () => {
    try {
      // Make a request to the server to handle player loss
      await fetch('https://localhost:8080/send', {
        method: 'GET', // Change to 'POST' if the endpoint requires POST
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Loss handling request sent.');
    } catch (error) {
      console.error('Error sending loss handling request:', error);
    }
  };

  return ws;
};