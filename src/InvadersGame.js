import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

const InvadersGame = () => {
    const [entities, setEntities] = useState({});
    const [players, setPlayers] = useState({});
    const [playerId, setPlayerId] = useState(null);
    const [ws, setWs] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const canvasRef = useRef(null);

    const host = 'localhost:8080';
    const shipImage = useRef(new Image());

    const images = useRef({
        monster: [new Image(), new Image()],
        crab: [new Image(), new Image()],
        laser: [new Image(), new Image()],
        bullet: [new Image(), new Image()],
        bomb: [new Image(), new Image()]
    });

    useEffect(() => {
        const loadImage = (src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => console.log(`Image loaded: ${src}`);
            img.onerror = () => console.error(`Failed to load image at ${src}`);
            return img;
        };

        images.current.monster[0] = loadImage('resources/bicho.gif');
        images.current.monster[1] = loadImage('resources/bicho1.gif');
        images.current.crab[0] = loadImage('resources/Crab.gif');
        images.current.crab[1] = loadImage('resources/Crab1.gif');
        images.current.laser[0] = loadImage('resources/laser.gif');
        images.current.laser[1] = loadImage('resources/laser2.gif');
        images.current.bullet[0] = loadImage('resources/misil.gif');
        images.current.bullet[1] = loadImage('resources/misil.gif');
        images.current.bomb[0] = loadImage('resources/bombD.gif');
        images.current.bomb[1] = loadImage('resources/bombDR.gif');
        shipImage.current = loadImage('resources/ship.gif');

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
    }, [host]);

    const drawEntities = useCallback((ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        Object.values(entities).forEach(entity => {
            let image;
            switch (entity.type) {
                case 'Monster':
                    image = images.current.monster[0];
                    break;
                case 'Crab':
                    image = images.current.crab[0];
                    break;
                case 'Laser':
                    image = images.current.laser[0];
                    break;
                case 'Bullet':
                    image = images.current.bullet[0];
                    break;
                case 'Bomb':
                    image = images.current.bomb[0];
                    break;
                default:
                    console.log('Unknown entity type:', entity.type);
                    return;
            }

            if (image.complete) {
                ctx.drawImage(image, entity.x, entity.y);
            } else {
                console.log(`Image for type ${entity.type} not loaded`);
            }
        });

        Object.values(players).forEach(player => {
            if (shipImage.current.complete) {
                ctx.drawImage(shipImage.current, player.x, player.y);

                const maxLife = 200;
                const barWidth = 50;
                const barHeight = 10;
                const lifeWidth = (player.life / maxLife) * barWidth;

                ctx.fillStyle = 'red';
                ctx.fillRect(player.x, player.y - 20, barWidth, barHeight);

                ctx.fillStyle = 'green';
                ctx.fillRect(player.x, player.y - 20, lifeWidth, barHeight);

                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(`${player.life}`, player.x + barWidth / 2 - 10, player.y - 10);
            } else {
                console.log('Ship image not loaded');
            }
        });
    }, [entities, players]);

    useEffect(() => {
        const render = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    drawEntities(ctx);
                }
            }
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

        return () => cancelAnimationFrame(render);
    }, [drawEntities]);

    const handleKeyDown = useCallback((event) => {
        if (ws && playerId) {
            const message = JSON.stringify({
                type: 'keydown',
                keyCode: event.keyCode,
                playerId,
            });
            ws.send(message);
        }
    }, [ws, playerId]);

    const handleKeyUp = useCallback((event) => {
        if (ws && playerId) {
            const message = JSON.stringify({
                type: 'keyup',
                keyCode: event.keyCode,
                playerId,
            });
            ws.send(message);
        }
    }, [ws, playerId]);

    useEffect(() => {
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

        const canvasRect = canvas.getBoundingClientRect();

        return Object.values(players).map((player) => {
            const { x, y, name } = player;
            const infoStyle = {
                position: 'absolute',
                left: `${canvasRect.left + x}px`,
                top: `${canvasRect.top + y - 60}px`,
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                backgroundColor: 'black',
                padding: '2px',
                borderRadius: '4px',
            };

            return (
                <div key={name} style={infoStyle}>
                    <div>{name}</div>
                </div>
            );
        });
    };

    return (
        <div>
            <h1>Invaders Game</h1>
            <canvas ref={canvasRef} width={640} height={480} style={{ border: '1px solid black' }}></canvas>
            <div>
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
                            onBlur={handleNameBlur}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter new name"
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default InvadersGame;