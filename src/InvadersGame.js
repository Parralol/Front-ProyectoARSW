import React, { useEffect, useState, useRef } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

const InvadersGame = () => {
    const [entities, setEntities] = useState({});
    const [players, setPlayers] = useState({});
    const [playerId, setPlayerId] = useState(null);
    const [ws, setWs] = useState(null);
    const [playerName, setPlayerName] = useState(''); // State for player name
    const canvasRef = useRef(null);
    const playerInfoRef = useRef(null);

    const host = 'localhost:8080'; // Ensure this is correct
    const shipImage = useRef(new Image());

    // Load image references
    const images = useRef({
        monster: [new Image(), new Image()],
        crab: [new Image(), new Image()],
        laser: [new Image(), new Image()],
        bullet: [new Image(), new Image()],
        bomb: [new Image(), new Image()]
    });

    useEffect(() => {
        // Load all images
        images.current.monster[0].src = 'resources/bicho.gif';  // Update paths as needed
        images.current.monster[1].src = 'resources/bicho1.gif';
        
        images.current.crab[0].src = 'resources/Crab.gif';
        images.current.crab[1].src = 'resources/Crab1.gif';

        images.current.laser[0].src = 'resources/laser.gif';
        images.current.laser[1].src = 'resources/laser2.gif';

        images.current.bullet[0].src = 'resources/misil.gif';
        images.current.bullet[1].src ='resources/misil.gif';

        images.current.bomb[0].src ='resources/bombD.gif';
        images.current.bomb[1].src ='resources/bombDR.gif';

        // Load the ship image
        shipImage.current.src = 'resources/ship.gif'; // Update with the correct path to your image
        shipImage.current.onload = () => console.log('Ship image loaded');

        // Connect to the WebSocket server
        const socket = new ReconnectingWebSocket(`ws://${host}/ws/game`);
        setWs(socket);

        socket.onopen = () => {
            console.log('WebSocket connection established.');
        };

        socket.onmessage = (event) => {
            const message = event.data;
            console.log('Received message:', message);

            try {
                const json = JSON.parse(message);
                setPlayers(json);
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
    }, [host]);

    useEffect(() => {
        const drawPlayers = (ctx) => {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            Object.values(players).forEach(player => {
                ctx.drawImage(shipImage.current, player.x, player.y);
            });
        };

        const updateCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    drawPlayers(ctx);
                }
            }
        };

        const intervalId = setInterval(updateCanvas, 50); // Update every 50 ms

        return () => {
            clearInterval(intervalId);
        };
    }, [players]);

    const handleKeyDown = (event) => {
        console.log('Key down event:', event);
        if (ws && playerId) {
            const message = JSON.stringify({
                type: 'keydown',
                keyCode: event.keyCode,
                playerId,
            });
            console.log('Sending message:', message);
            ws.send(message);
        } else {
            console.log('WebSocket or Player ID not set.');
        }
    };

    const handleKeyUp = (event) => {
        console.log('Key up event:', event);
        if (ws && playerId) {
            const message = JSON.stringify({
                type: 'keyup',
                keyCode: event.keyCode,
                playerId,
            });
            console.log('Sending message:', message);
            ws.send(message);
        } else {
            console.log('WebSocket or Player ID not set.');
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [ws, playerId]);

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
            console.log('Sending name change message:', message);
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

        // Get canvas position and dimensions
        const canvasRect = canvas.getBoundingClientRect();

        return Object.values(players).map((player) => {
            const { x, y, name, life } = player;
            const maxLife = 100; // Adjust according to your maximum life value
            const infoStyle = {
                position: 'absolute',
                left: `${canvasRect.left + x}px`,
                top: `${canvasRect.top + y - 60}px`, // Position above player
                color: 'black',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                backgroundColor: 'white', // Ensure visibility
                padding: '2px',
                borderRadius: '4px',
            };
            const barWidth = 50;
            const barHeight = 10;
            const lifeWidth = (life / maxLife) * barWidth;

            return (
                <div key={name} style={infoStyle}>
                    <div>{name}</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                            style={{
                                backgroundColor: 'red',
                                width: barWidth,
                                height: barHeight,
                                marginRight: '5px',
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: 'green',
                                    width: lifeWidth,
                                    height: barHeight,
                                }}
                            />
                        </div>
                        <div>{life} Life</div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div>
            <h1>Invaders Game</h1>
            <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }}></canvas>
            <div ref={playerInfoRef}>
                {renderPlayerInfo()}
            </div>
            {playerId && (
                <div style={{ marginTop: '20px' }}>
                    <label>
                        Change your name:
                        <input
                            type="text"
                            value={playerName}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur} // Send name on blur
                            onKeyPress={handleKeyPress} // Send name on Enter key
                            placeholder="Enter new name"
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default InvadersGame;