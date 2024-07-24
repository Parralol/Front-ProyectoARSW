import { useEffect, useRef } from 'react';

export const useLoadImages = () => {
  const images = useRef({
    monster: [new Image(), new Image()],
    crab: [new Image(), new Image()],
    ship: [new Image(), new Image()],
    laser: [new Image(), new Image()],
    bullet: [new Image(), new Image()],
    bomb: [new Image(), new Image()],
  });

  const shipImage = useRef(new Image());

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
    images.current.ship[0] = loadImage('resources/Aship.gif');
    images.current.ship[1] = loadImage('resources/Aship.gif');
    images.current.laser[0] = loadImage('resources/laser.gif');
    images.current.laser[1] = loadImage('resources/laser2.gif');
    images.current.bullet[0] = loadImage('resources/misil.gif');
    images.current.bullet[1] = loadImage('resources/misil.gif');
    images.current.bomb[0] = loadImage('resources/bombD.gif');
    images.current.bomb[1] = loadImage('resources/bombDR.gif');
    shipImage.current = loadImage('resources/ship.gif');
  }, []);

  return { images, shipImage };
};
