import React, { useEffect, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

const InvadersGame = () => {
    const [playerId, setPlayerId] = useState(null);
    const [ws, setWs] = useState(null);
    const host = `localhost:8080`; // Ensure this is correct
    console.log("Host: " + host);

    useEffect(() => {
        // Connect to the WebSocket server
        const socket = new ReconnectingWebSocket(`ws://${host}/ws/game`);
        setWs(socket);

        socket.onopen = () => {
            console.log('WebSocket connection established.');
        };

        socket.onmessage = (event) => {
            const message = event.data;
            console.log('Received message:', message);
            if (message.startsWith('Player ID:')) {
                const id = message.split(':')[1].trim();
                setPlayerId(id);
                console.log('Player ID set:', id);
            } else {
                // Handle other types of messages if needed
            }
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed.');
        };

        return () => {
            socket.close();
        };
    }, []);

    const sendKeyEvent = (event, type) => {
        if (ws && playerId) {
            const message = JSON.stringify({
                type,
                keyCode: event.keyCode,
                playerId,
            });
            console.log('Sending message:', message); // Log the message
            ws.send(message);
        } else {
            console.log('WebSocket or Player ID not set. WebSocket:', ws, 'Player ID:', playerId);
        }
    };

    useEffect(() => {
        const updateGameImage = () => {
            const img = document.getElementById('gameImage');
            if (img) {
                img.src = `http://${host}/game/image?${new Date().getTime()}`;
            }
        };

        const intervalId = setInterval(updateGameImage, 100); // Update every 50 ms

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const handleKeyDown = (event) => {
        console.log('Key down event:', event); // Log key event
        sendKeyEvent(event, 'keydown');
    };

    const handleKeyUp = (event) => {
        console.log('Key up event:', event); // Log key event
        sendKeyEvent(event, 'keyup');
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [ws, playerId]);

    return (
        <div>
            <h1>Invaders Game</h1>
            <img id="gameImage" src={`/game/image?${new Date().getTime()}`} alt="Game Image" />
        </div>
    );
};

export default InvadersGame;
