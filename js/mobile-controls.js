(() => {
  'use strict';
  const zone = document.getElementById('stickZone') || document.getElementById('joystickZone');
  const base = document.getElementById('stickBase') || document.getElementById('joystickBase');
  const knob = document.querySelector('#stickLive i') || document.getElementById('joystickKnob');
  if (!zone || !base || !knob) return;

  let pointerId = null;
  let activeCode = null;

  const sendKey = (type, code) => {
    window.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true }));
  };

  const releaseDirection = () => {
    if (activeCode) sendKey('keyup', activeCode);
    activeCode = null;
  };

  const setDirection = (code) => {
    if (activeCode === code) return;
    releaseDirection();
    activeCode = code;
    if (code) sendKey('keydown', code);
  };

  const updateJoystick = (event) => {
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.29;
    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    if (distance > maxRadius) {
      dx = dx / distance * maxRadius;
      dy = dy / distance * maxRadius;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;

    const deadZone = maxRadius * 0.3;
    setDirection(Math.abs(dx) < deadZone ? null : dx < 0 ? 'ArrowLeft' : 'ArrowRight');
  };

  const stopJoystick = (event) => {
    if (pointerId !== null && event.pointerId !== pointerId) return;
    pointerId = null;
    releaseDirection();
    knob.style.transform = 'translate(0, 0)';
  };

  zone.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pointerId = event.pointerId;
    zone.setPointerCapture?.(pointerId);
    updateJoystick(event);
  }, { passive: false });
  zone.addEventListener('pointermove', (event) => {
    if (event.pointerId === pointerId) updateJoystick(event);
  }, { passive: false });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => zone.addEventListener(type, stopJoystick));
  window.addEventListener('blur', () => stopJoystick({ pointerId }));
})();
