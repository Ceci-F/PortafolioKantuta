export function initCloudLoop() {
	const cover = document.querySelector('.front-cover');
	const existingClouds = Array.from(document.querySelectorAll('.front-cover .cloud'));

	if (!cover || existingClouds.length === 0) return;

	const sourceByVersion = {
		1: existingClouds.find((cloud) => cloud.classList.contains('cloud-1')) || existingClouds[0],
		2: existingClouds.find((cloud) => cloud.classList.contains('cloud-2')) || existingClouds[1] || existingClouds[0]
	};

	existingClouds.forEach((cloud) => cloud.remove());

	const cloudConfigs = [
		{ top: '1.1rem', scale: 0.95 },
		{ top: '2.2rem', scale: 1.08 },
		{ top: '1.6rem', scale: 0.9 },
		{ top: '2.8rem', scale: 1.02 }
	];

	const cloudSpeed = 34;
	const minGap = 220;
	const gapVariance = 120;
	const clearSkyMinGap = 320;
	const clearSkyMaxGap = 520;
	let cloudIdCounter = 0;
	let clouds = [];

	const pickVersion = () => {
		return Math.random() < 0.5 ? 1 : 2;
	};

	const randomTop = (baseTop) => {
		const offsets = ['-0.25rem', '0rem', '0.15rem', '0.3rem'];
		const offset = offsets[Math.floor(Math.random() * offsets.length)];
		return `calc(${baseTop} + ${offset})`;
	};

	const hasVisibleCloud = () => {
		const viewportWidth = window.innerWidth;
		return clouds.some((cloud) => cloud.x < viewportWidth && cloud.x + cloud.width > 0);
	};

	const pickSpawnGap = () => {
		if (!hasVisibleCloud()) {
			return minGap * 0.55 + Math.random() * (minGap * 0.35);
		}

		const shouldClear = Math.random() < 0.28;
		if (shouldClear) {
			return clearSkyMinGap + Math.random() * (clearSkyMaxGap - clearSkyMinGap);
		}

		return minGap + Math.random() * gapVariance;
	};

	const createCloudElement = (version, scale, top) => {
		const template = sourceByVersion[version] || sourceByVersion[1];
		const cloud = template.cloneNode(true);
		cloud.classList.remove('cloud-1', 'cloud-2');
		cloud.classList.add(`cloud-loop-${cloudIdCounter += 1}`);
		cloud.style.top = top;
		cloud.style.left = '0';
		cloud.style.right = 'auto';
		cloud.style.zIndex = '4';
		cloud.style.pointerEvents = 'none';
		cloud.style.opacity = '0';
		cloud.style.visibility = 'hidden';
		cloud.style.transition = 'none';
		cloud.style.transform = `translateX(0px) scale(${scale})`;
		cloud.dataset.scale = String(scale);
		cloud.dataset.version = String(version);
		return cloud;
	};

	const getCloudWidth = (element) => element.getBoundingClientRect().width || 320;

	const placeCloudsInitial = () => {
		const viewportWidth = window.innerWidth;
		const initialClouds = [];
		let nextX = -40 + Math.random() * 60;

		cloudConfigs.forEach((config) => {
			const version = pickVersion();
			const cloud = createCloudElement(version, config.scale, config.top);
			cover.appendChild(cloud);

			const cloudWidth = getCloudWidth(cloud);
			const firstWaveLimit = viewportWidth * 0.86;
			const overflowSpacing = minGap + Math.random() * (gapVariance * 0.8);
			const x = nextX <= firstWaveLimit
				? nextX
				: viewportWidth + 40 + (nextX - firstWaveLimit) + overflowSpacing;
			cloud.style.transform = `translateX(${x}px) scale(${config.scale})`;
			cloud.style.visibility = 'visible';
			cloud.style.opacity = '1';

			initialClouds.push({
				element: cloud,
				x,
				scale: config.scale,
				top: config.top,
				version,
				width: cloudWidth
			});

			nextX += cloudWidth + (minGap * 0.55 + Math.random() * (gapVariance * 0.9));
		});

		clouds = initialClouds;
	};

	const spawnReplacementCloud = () => {
		const viewportWidth = window.innerWidth;
		const version = pickVersion();
		const scale = 0.9 + Math.random() * 0.16;
		const topOptions = ['1.05rem', '1.45rem', '1.95rem', '2.35rem', '2.75rem'];
		const top = randomTop(topOptions[Math.floor(Math.random() * topOptions.length)]);
		const cloud = createCloudElement(version, scale, top);
		cover.appendChild(cloud);

		const cloudWidth = getCloudWidth(cloud);
		const referenceRightEdge = Math.max(...clouds.map((item) => item.x + item.width));
		const spacing = pickSpawnGap();
		const x = Math.max(viewportWidth + 40, referenceRightEdge + spacing);

		cloud.style.transform = `translateX(${x}px) scale(${scale})`;
		window.requestAnimationFrame(() => {
			cloud.style.visibility = 'visible';
			cloud.style.opacity = '1';
		});

		clouds.push({
			element: cloud,
			x,
			scale,
			top,
			version,
			width: cloudWidth
		});
	};

	placeCloudsInitial();

	let lastFrameTime = performance.now();
	let animationFrameId = 0;

	const tick = (now) => {
		const deltaSeconds = Math.min(0.05, (now - lastFrameTime) / 1000);
		lastFrameTime = now;

		clouds.forEach((cloud) => {
			cloud.x -= cloudSpeed * deltaSeconds;
			cloud.element.style.transform = `translateX(${cloud.x}px) scale(${cloud.scale})`;
		});

		const exitingClouds = clouds.filter((cloud) => cloud.x + cloud.width < -minGap);
		if (exitingClouds.length > 0) {
			exitingClouds.forEach((cloud) => {
				cloud.element.style.opacity = '0';
				cloud.element.style.visibility = 'hidden';
				cloud.element.remove();
			});

			clouds = clouds.filter((cloud) => cloud.x + cloud.width >= -minGap);
			exitingClouds.forEach(() => spawnReplacementCloud());
		}

		animationFrameId = window.requestAnimationFrame(tick);
	};

	window.addEventListener('resize', () => {
		const viewportWidth = window.innerWidth;
		clouds.forEach((cloud) => {
			cloud.width = getCloudWidth(cloud.element);
			cloud.x = Math.min(cloud.x, viewportWidth + cloud.width * 2);
			cloud.element.style.transform = `translateX(${cloud.x}px) scale(${cloud.scale})`;
		});
	});

	animationFrameId = window.requestAnimationFrame(tick);
}
