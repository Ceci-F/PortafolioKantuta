export function initTimeOrbitCover() {
    const cover = document.querySelector('.front-cover');
    const sun = document.querySelector('.sun');
    const moon = document.querySelector('.moon');

    if (!cover || !sun || !moon) return;

    const lerp = (start, end, value) => start + (end - start) * value;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const applyOrbState = (element, state) => {
        element.style.display = state.visible ? 'block' : 'none';
        element.style.left = `${state.left}%`;
        element.style.top = `${state.top}%`;
        element.style.opacity = `${state.opacity}`;
    };

    const getOrbitState = (progress) => {
        const eased = progress * progress * (3 - 2 * progress);
        return {
            visible: true,
            left: lerp(0, 100, eased),
            top: lerp(45, 20, Math.sin(Math.PI * eased)),
            opacity: 1
        };
    };

    const getDayState = (hour) => {
        const progress = clamp((hour - 6) / 12, 0, 1);
        return getOrbitState(progress);
    };

    const getNightState = (hour) => {
        const progress = hour >= 18
            ? clamp((hour - 18) / 12, 0, 1)
            : clamp((hour + 6) / 12, 0, 1);

        return getOrbitState(progress);
    };

    const updateCover = () => {
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

        const sunVisible = hour >= 6 && hour < 18;
        const sunState = sunVisible ? getDayState(hour) : { visible: false, left: 0, top: 0, opacity: 0 };
        const moonState = sunVisible ? { visible: false, left: 0, top: 0, opacity: 0 } : getNightState(hour);

        applyOrbState(sun, sunState);
        applyOrbState(moon, moonState);
    };

    updateCover();

    const millisecondsUntilNextMinute = (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds();
    window.setTimeout(() => {
        updateCover();
        window.setInterval(updateCover, 60000);
    }, Math.max(0, millisecondsUntilNextMinute));
}