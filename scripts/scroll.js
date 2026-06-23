export function initHorizontalScroll() {
    gsap.registerPlugin(ScrollTrigger);

    const content = document.querySelector('.frame-3-content');
    if (!content) return;

    // Alturas de recorrido base
    const safeTop = "30vh"; 
    const safeBottom = "70vh";

    // ========================================================
    // VALORES BASE DE LA LLANTA TRASERA (Para escala 1.0)
    // Calculados proporcionalmente a partir de tus ajustes previos
    const baseOffsetX = -11.25; 
    const baseOffsetY = 26.25; 
    // ========================================================

    gsap.set(".traveling-element", { 
        x: "10vw", 
        y: safeBottom, 
        yPercent: -50, 
        xPercent: -50, 
        scale: 1 
    });

    // Configuración de hitos en el espacio horizontal y vertical
    const stopsInfo = [
        { vw: 75, bikeIsUp: false }, 
        { vw: 125, bikeIsUp: true }, 
        { vw: 175, bikeIsUp: false },
        { vw: 225, bikeIsUp: true }  
    ];

    // 1. MAPEADO MATEMÁTICO DE HITOS (Centro de Bici vs Posición de Llanta)
    const milestones = [
        { x: 10, y: 70, scale: 1.0 }, // Punto de partida inicial
        ...stopsInfo.map(stop => ({
            x: stop.vw,
            y: stop.bikeIsUp ? 30 : 70,
            scale: stop.bikeIsUp ? 0.6 : 0.8
        })),
        { x: 310, y: 70, scale: 1.0 } // Punto de salida final
    ];

    // Convertimos cada hito a la coordenada exacta de la rueda aplicando la escala correspondiente
    const wheelPoints = milestones.map(m => ({
        x: m.x + (baseOffsetX * m.scale),
        y: m.y + (baseOffsetY * m.scale)
    }));

    // 2. GENERACIÓN DE LA CURVA DEL SVG
    let pathD = `M ${wheelPoints[0].x} ${wheelPoints[0].y}`;
    for (let i = 0; i < wheelPoints.length - 1; i++) {
        const pStart = wheelPoints[i];
        const pEnd = wheelPoints[i + 1];
        
        // El factor 0.364 emula perfectamente la aceleración "sine.inOut" de GSAP en curvas Bezier
        const cpX = (pEnd.x - pStart.x) * 0.364;
        pathD += ` C ${pStart.x + cpX} ${pStart.y}, ${pEnd.x - cpX} ${pEnd.y}, ${pEnd.x} ${pEnd.y}`;
    }

    // Configuración de seguridad para el inicio de la máscara
    const maskStartX = -50;
    const initialMaskWidth = wheelPoints[0].x - maskStartX;

    const svgHTML = `
    <svg class="trail-svg" viewBox="0 0 300 100" preserveAspectRatio="none">
        <clipPath id="trail-clip">
            <rect id="trail-mask-rect" x="${maskStartX}" y="-20" width="${initialMaskWidth}" height="140" />
        </clipPath>
        <path d="${pathD}" fill="none" stroke="var(--illustration-orange, #ff7b00)" stroke-width="4" stroke-dasharray="8 8" vector-effect="non-scaling-stroke" clip-path="url(#trail-clip)" />
    </svg>`;
    content.insertAdjacentHTML('afterbegin', svgHTML);

    // 3. TIMELINE PRINCIPAL DE GSAP
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".frame-3-wrapper",
            start: "top top",
            end: "+=6000", 
            pin: true,
            scrub: 1, 
            invalidateOnRefresh: true
        }
    });

    const cards = gsap.utils.toArray('.card-content');
    const paradasImgs = gsap.utils.toArray('.parada-img'); 

    stopsInfo.forEach((stop, index) => {
        const targetY = stop.bikeIsUp ? safeTop : safeBottom;
        const targetScale = stop.bikeIsUp ? 0.6 : 0.8;     
        const containerX = -(stop.vw - 50);

        // Sincronización de arranque: se acopla al cierre del hito anterior
        const startMove = index === 0 ? 0 : `leaveStop${index - 1}`;

        // -- MOVIMIENTO HACIA LA PARADA --
        tl.to(content, {
            x: `${containerX}vw`,
            duration: 5,
            ease: "none" 
        }, startMove)
        
        .to(".traveling-element", {
            x: `${stop.vw}vw`,
            duration: 5,
            ease: "none" 
        }, startMove)
        
        .to(".traveling-element", {
            y: targetY,
            scale: targetScale,
            duration: 5,
            ease: "sine.inOut" 
        }, startMove)
        
        // Revela el rastro hasta la posición exacta calculada de la rueda en este hito
        .to("#trail-mask-rect", {
            attr: { width: wheelPoints[index + 1].x - maskStartX },
            duration: 5,
            ease: "none"
        }, startMove);

        // -- DESPLIEGUE (Apertura) --
        tl.to(paradasImgs[index], {
            xPercent: -55, 
            duration: 1.2,
            ease: "power2.out"
        }, `>`) 
        .to(cards[index], {
            xPercent: 55, 
            opacity: 1,
            duration: 1.2,
            ease: "power2.out"
        }, `<`); 

        // -- LECTURA --
        tl.to({}, { duration: 2.5 }); 

        // Seteo del punto de partida para la salida
        tl.add(`leaveStop${index}`);

        // -- CIERRE (Retorno armonioso antes de avanzar) --
        tl.to(paradasImgs[index], {
            xPercent: 0, 
            duration: 1.2,
            ease: "power2.inOut"
        }, `leaveStop${index}`) 
        .to(cards[index], {
            xPercent: 0, 
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut"
        }, `leaveStop${index}`);
    });

    // -- SALIDA FINAL DE LA PANTALLA --
    const finalStart = `leaveStop${stopsInfo.length - 1}`;
    tl.to(content, { x: "-200vw", duration: 4, ease: "none" }, finalStart)
      .to(".traveling-element", { x: "310vw", duration: 4, ease: "none" }, finalStart)
      .to(".traveling-element", { y: safeBottom, scale: 1, duration: 4, ease: "sine.inOut" }, finalStart)
      .to("#trail-mask-rect", { attr: { width: wheelPoints[wheelPoints.length - 1].x - maskStartX }, duration: 4, ease: "none" }, finalStart);
}