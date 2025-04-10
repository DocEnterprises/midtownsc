import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  const colors = ['#ff0000', '#ffffff', '#0000ff'];
  
  // Launch confetti from the left
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.2, y: 0.8 },
    colors,
    angle: 60
  });

  // Launch confetti from the right
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.8, y: 0.8 },
      colors,
      angle: 120
    });
  }, 100);
};

export const triggerPurchaseConfetti = () => {
  const duration = 1500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#ff0000', '#ffffff', '#0000ff']
    });
    
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#ff0000', '#ffffff', '#0000ff']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};