import React, { useState, useRef, useCallback } from 'react';
import { useLoadImages } from './useLoadImages';
import { useWebSocket } from './useWebSocket';
import { useCanvas } from './useCanvas';
import './InvadersGame.css';

const InvadersGame = () => {
  const [entities, setEntities] = useState({});
  const [players, setPlayers] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const canvasRef = useRef(null);
  const { images, shipImage } = useLoadImages();
  const host = 'localhost:8080';
  const ws = useWebSocket(host, setEntities, setPlayers, setPlayerId);
  useCanvas(canvasRef, entities, players, images, shipImage);

  const handleKeyDown = useCallback(
    (event) => {
      if (ws && playerId) {
        const message = JSON.stringify({
          type: 'keydown',
          keyCode: event.keyCode,
          playerId,
        });
        ws.send(message);
      }
    },
    [ws, playerId]
  );

  const handleKeyUp = useCallback(
    (event) => {
      if (ws && playerId) {
        const message = JSON.stringify({
          type: 'keyup',
          keyCode: event.keyCode,
          playerId,
        });
        ws.send(message);
      }
    },
    [ws, playerId]
  );

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleNameChange = (event) => {
    setPlayerName(event.target.value);
  };

  const handleNameSubmit = () => {
    if (ws && playerId && playerName) {
      const message = JSON.stringify({
        type: 'nameChange',
        playerId,
        name: playerName,
      });
      ws.send(message);
    }
  };

  const handleNameBlur = () => {
    handleNameSubmit();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleNameSubmit();
    }
  };

  const renderPlayerInfo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return Object.values(players).map((player) => {
      const { x, y, name } = player;
      return (
        <div
          key={name}
          className="player-info"
          style={{
            left: `${x}px`,
            top: `${y - 60}px`,
          }}
        >
          <div className="player-name">{name}</div>
        </div>
      );
    });
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Invaders Game</h1>
      <div className="game-wrapper">
        <canvas ref={canvasRef} width={640} height={480} className="game-canvas"></canvas>
        <div className="player-info-container">{renderPlayerInfo()}</div>
      </div>
      {playerId && (
        <div className="name-input-container">
          <label className="name-label">
            Change your name:
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyPress={handleKeyPress}
              placeholder="Enter new name"
              className="name-input"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default InvadersGame;