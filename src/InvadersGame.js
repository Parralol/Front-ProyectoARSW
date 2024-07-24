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
  const [scores, setScores] = useState([]);
  const canvasRef = useRef(null);
  const { images, shipImage } = useLoadImages();
  const host = window.location.host;
  const ws = useWebSocket(host, setEntities, setPlayers, setPlayerId, setScores);
  useCanvas(canvasRef, entities, players, images, shipImage);

  // Handle keydown events to prevent default scrolling behavior
  const handleKeyDown = useCallback(
    (event) => {
      const activeElement = document.activeElement;
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return; // Allow typing in input fields and textareas
      }

      // Prevent default behavior for specific keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }

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

  // Handle keyup events
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
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [handleKeyDown, handleKeyUp]);

  const handleNameChange = useCallback((event) => {
    setPlayerName(event.target.value);
  }, []);

  const handleNameSubmit = useCallback(() => {
    if (ws && playerId && playerName) {
      const message = JSON.stringify({
        type: 'nameChange',
        playerId,
        name: playerName,
      });
      ws.send(message);
    }
  }, [ws, playerId, playerName]);

  const handleNameBlur = useCallback(() => {
    handleNameSubmit();
  }, [handleNameSubmit]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      handleNameSubmit();
    }
  }, [handleNameSubmit]);

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

  const renderScoresTable = useCallback(() => {
    return (
      <div className="scores-table">
        <h2>Scores</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score) => (
              <tr key={score.id}>
                <td>{score.id}</td>
                <td>{score.name}</td>
                <td>{score.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [scores]);

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
      {renderScoresTable()}
    </div>
  );
};

export default InvadersGame;
