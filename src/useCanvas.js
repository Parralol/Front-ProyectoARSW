import { useEffect, useCallback } from 'react';

export const useCanvas = (canvasRef, entities, players, images, shipImage) => {
  const drawEntities = useCallback(
    (ctx) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      Object.values(entities).forEach((entity) => {
        let image;
        switch (entity.type) {
          case 'Monster':
            image = images.current.monster[0];
            break;
          case 'Crab':
            image = images.current.crab[0];
            break;
          case 'Ship':
            image = images.current.ship[0];
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

      Object.values(players).forEach((player) => {
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
    },
    [entities, players, images, shipImage]
  );

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
  }, [drawEntities, canvasRef]);
};