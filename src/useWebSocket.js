import { useEffect, useState, useRef } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const useWebSocket = (host, setEntities, setPlayers, setPlayerId, setScores) => {
  const [ws, setWs] = useState(null);
  const handledLosses = useRef(new Set());

  useEffect(() => {
    const socket = new ReconnectingWebSocket(`wss://${host}/ws/game`);
    setWs(socket);

    const onOpen = () => {
      console.log('WebSocket connection established.');
    };

    const onMessage = (event) => {
      const message = event.data;
      try {
        const data = JSON.parse(message);

        if (data && data[Object.keys(data)[0]] && data[Object.keys(data)[0]].name) {
          setPlayers(data);
          Object.values(data).forEach((player) => {
            if (player.loose && !handledLosses.current.has(player.name)) {
              handledLosses.current.add(player.name);
              handlePlayerLoss();
            }
          });
        } else {
          setEntities(data);
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        if (message.startsWith('Player ID:')) {
          const id = message.split(':')[1].trim();
          setPlayerId(id);
        }
      }
    };

    const onClose = () => {
      console.log('WebSocket connection closed.');
    };

    socket.addEventListener('open', onOpen);
    socket.addEventListener('message', onMessage);
    socket.addEventListener('close', onClose);

    return () => {
      socket.removeEventListener('open', onOpen);
      socket.removeEventListener('message', onMessage);
      socket.removeEventListener('close', onClose);
      socket.close();
    };
  }, [host, setEntities, setPlayers, setPlayerId, setScores]);

  const handlePlayerLoss = async () => {
    try {
      await fetch(`https://${host}/send`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Loss handling request sent.');
      await fetchScores();
    } catch (error) {
      console.error('Error sending loss handling request:', error);
    }
  };

  const fetchScores = async () => {
    try {
      const response = await fetch(`https://${host}/scores`);
      if (response.ok) {
        const scores = await response.json();
        setScores(scores);
        console.log('Scores fetched successfully:', scores);
      } else {
        console.error('Failed to fetch scores:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  return ws;
};
