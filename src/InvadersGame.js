import React, { useEffect } from 'react';

const InvadersGame = () => {
    var host = `localhost:8080`;
    console.log("Host: " + host);
    useEffect(() => {
        const updateGameImage = () => {
            const img = document.getElementById('gameImage');
            if (img) {
                img.src = `http://`+ (host) +'/game/image?' + new Date().getTime();
            }
        };

        const handleKeyDown = (event) => {
            sendKeyEvent(event, 'keydown');
        };

        const handleKeyUp = (event) => {
            sendKeyEvent(event, 'keyup');
        };

        const sendKeyEvent = (event, type) => {
            fetch(`http://`+ (host) +`/game/key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, keyCode: event.keyCode })
            });
        };

        const intervalId = setInterval(updateGameImage, 50); // Update every 50 ms

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <div>
            <h1>Invaders Game</h1>
            <img id="gameImage" src="/game/image" alt="Game Image" />
        </div>
    );
};

export default InvadersGame;