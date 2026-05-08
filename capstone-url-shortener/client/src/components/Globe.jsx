import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function Globe({ markers = [] }) {
  const canvasRef = useRef();
  const globeRef = useRef();
  const frameRef = useRef();
  const pointerDown = useRef(null);
  const momentum = useRef(0);
  const phiRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: 520,
        height: 520,
        phi: 0,
        theta: 0.3,
        dark: 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        mapBaseBrightness: 0.05,
        baseColor: [0.65, 0.65, 0.7],
        markerColor: [0.42, 0.37, 0.76],
        glowColor: [1, 1, 1],
        markers: markers.map((m) => ({
          location: [m.lat, m.lng],
          size: Math.min(0.04 + m.count * 0.02, 0.14),
        })),
      });

      globeRef.current = globe;

      function animate() {
        if (pointerDown.current === null) {
          phiRef.current += 0.004;
        }
        phiRef.current += momentum.current;
        momentum.current *= 0.92;
        globe.update({ phi: phiRef.current });
        frameRef.current = requestAnimationFrame(animate);
      }
      animate();
    } catch {
      return;
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      globeRef.current?.destroy();
    };
  }, [markers]);

  function onPointerDown(e) {
    pointerDown.current = e.clientX;
    momentum.current = 0;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (pointerDown.current === null) return;
    const dx = e.clientX - pointerDown.current;
    pointerDown.current = e.clientX;
    momentum.current = dx / 200;
  }

  function onPointerUp() {
    pointerDown.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  }

  return (
    <div className="globe-wrap">
      <canvas
        ref={canvasRef}
        className="globe-canvas"
        style={{ width: 260, height: 260, cursor: "grab", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      {markers.length === 0 && (
        <p className="globe-hint">
          Click locations will appear as visitors interact with your link
        </p>
      )}
    </div>
  );
}
