export function initParallax() {
    const section = document.getElementById('about-me');
    const sun = document.getElementById('framed-sun');
    const moon = document.getElementById('framed-moon');
    const girl1 = document.getElementById('girl-1');
    const girl2 = document.getElementById('girl-2');

    if (!section || (!sun && !girl1 && !girl2 && !moon)) return;

    const createParallaxController = (targets) => {
        if (targets.length === 0) return null;

        const config = { duration: 0.8, ease: "power2.out" };
        const movers = targets.map(({ element, maxMove }) => ({
            maxMove,
            x: gsap.quickTo(element, "x", config),
            y: gsap.quickTo(element, "y", config)
        }));

        let idleTicker = null;
        const idleAmplitude = 1.5;

        const stopIdleMotion = () => {
            if (idleTicker !== null) {
                gsap.ticker.remove(idleTicker);
                idleTicker = null;
            }
        };

        const startIdleMotion = () => {
            if (idleTicker !== null) return;

            idleTicker = () => {
                const time = gsap.ticker.time;

                movers.forEach(({ x, y, maxMove }, index) => {
                    const phase = index * 0.9;
                    const breathX = Math.sin(time * 1.1 + phase) * maxMove * idleAmplitude;
                    const breathY = Math.cos(time * 0.9 + phase) * maxMove * idleAmplitude * 0.7;

                    x(breathX);
                    y(breathY);
                });
            };

            gsap.ticker.add(idleTicker);
        };

        startIdleMotion();

        return {
            destroy: () => {
                stopIdleMotion();
                movers.forEach(({ x, y }) => {
                    x(0);
                    y(0);
                });
            }
        };
    };

    // Ajuste de intensidad por capa (puedes dejarlos bajos para más seguridad)
    const maxMoveSun = 1.2;
    const maxMoveGirl = 3.5;

    const cleanup = [];

    const leftTargets = [
        ...(sun ? [{ element: sun, maxMove: maxMoveSun }] : []),
        ...(girl1 ? [{ element: girl1, maxMove: maxMoveGirl }] : [])
    ];

    const rightTargets = [
        ...(moon ? [{ element: moon, maxMove: maxMoveSun }] : []),
        ...(girl2 ? [{ element: girl2, maxMove: maxMoveGirl }] : [])
    ];

    const leftController = createParallaxController(leftTargets);
    const rightController = createParallaxController(rightTargets);
    cleanup.push(leftController?.destroy);
    cleanup.push(rightController?.destroy);

    return () => {
        cleanup.forEach((destroy) => {
            if (typeof destroy === 'function') {
                destroy();
            }
        });
    };
}