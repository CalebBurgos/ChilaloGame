const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

// Elementos de la UI en el HTML
const uiNivel = document.getElementById("ui-nivel");
const uiPuntos = document.getElementById("ui-puntos");
const uiVidas = document.getElementById("ui-vidas");
const uiTiempo = document.getElementById("ui-tiempo");
const modal = document.getElementById("modal-registro");
const modalResumen = document.getElementById("modal-resumen");

// 🎵 SINTETIZADOR DE AUDIO NATIVO
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function reproducirSonido(tipo) {
    try {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (tipo === "recolectar") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); 
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        } 
        else if (tipo === "golpe"){
  osc.type = "triangle";

    osc.frequency.setValueAtTime(
        180,
        audioCtx.currentTime
    );

    osc.frequency.exponentialRampToValueAtTime(
        60,
        audioCtx.currentTime + 0.15
    );

    gainNode.gain.setValueAtTime(
        0.3,
        audioCtx.currentTime
    );

    gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.2
    );

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
        }
            else if (tipo === "victoria") {

    osc.type = "triangle";

    osc.frequency.setValueAtTime(
        523,
        audioCtx.currentTime
    );

    osc.frequency.setValueAtTime(
        659,
        audioCtx.currentTime + 0.15
    );

    osc.frequency.setValueAtTime(
        784,
        audioCtx.currentTime + 0.30
    );

    gainNode.gain.setValueAtTime(
        0.15,
        audioCtx.currentTime
    );

    gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.6
    );

    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
} 
    } catch (e) {
        console.log("AudioContext bloqueado o no soportado momentáneamente.");
    }
}

// 🎮 SISTEMA DE ESTADOS DEL JUEGO
let estadoActual = "MENU";
let scrollTabla = 0;
let siguienteNivel = 1;
let nivelActual = 1;
let puntosScore = 0;
let combo = 0;       
let materialesUnidades = 0; 
let nivelDificultad = 1;
const META_MATERIALES = 50; 
let vidas = 3;
let tiempoSegundos = 60; 
let juegoTerminado = false;
let juegoGanado = false;

let enTransicionNivel = false; 
let transicionIniciada = false; 
let temporizadorIntervalo = null;
let startTime; 

window.recordsLocales = []; 

// 🐦 VARIABLES FÍSICAS BASE DEL CHILALO
const chilalo = {
    x: 375,
    y: 525,
    ancho: 50,       
    alto: 50,        
    vx: 0,
    vy: 0,
    velocidadMax: 7.0, 
    friccion: 0.85,
    gravedad: 0.5,       
    fuerzaSalto: -11.5,  
    enSuelo: false,
    estaDañado: false
};

// 🎥 SISTEMA DE CÁMARA PARA PARKOUR VERTICAL
let scrollCamaraY = 0;
let progresoNido = 0;
let elementosCaida = [];
let ramasPlataforma = [];

const tiposMateriales = [
    { tipo: "lodo plástico", color: "#5d4037", radio: 16, puntos: 15, malo: false },  
    { tipo: "paja seca", color: "#ffd54f", radio: 9, puntos: 10, malo: false },   
    { tipo: "piedra", color: "#78909c", radio: 12, puntos: 0, malo: true }    
];

const botonComenzar = { x: 275, y: 240, ancho: 250, alto: 50 };
const botonTabla = { x: 275, y: 320, ancho: 250, alto: 50 };
const botonVolver = { x: 300, y: 490, ancho: 200, alto: 40 };

// 🖱️ DETECTOR DE CLICS
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (estadoActual === "MENU") {
        if (mouseX >= botonComenzar.x && mouseX <= botonComenzar.x + botonComenzar.ancho &&
            mouseY >= botonComenzar.y && mouseY <= botonComenzar.y + botonComenzar.alto) {
            
            if (audioCtx.state === 'suspended') audioCtx.resume();
            siguienteNivel = 1;
    estadoActual = "INTRO_NIVEL";

    setTimeout(() => {

        estadoActual = "JUEGO";
        reiniciarJuegoCompleto();

    }, 3000);
}
        
        if (mouseX >= botonTabla.x && mouseX <= botonTabla.x + botonTabla.ancho &&
            mouseY >= botonTabla.y && mouseY <= botonTabla.y + botonTabla.alto) {
            
            estadoActual = "TABLA";
            if (typeof window.cargarTablaClasificacionAsync === "function") {
                try {
                    window.cargarTablaClasificacionAsync();
                } catch(err) {
                    console.log("Error al conectar con la base de datos local.");
                }
            }
        }
    } 
    else if (estadoActual === "TABLA") {
        if (mouseX >= botonVolver.x && mouseX <= botonVolver.x + botonVolver.ancho &&
            mouseY >= botonVolver.y && mouseY <= botonVolver.y + botonVolver.alto) {
            
            estadoActual = "MENU";
        }
    }
});

// ⌨️ CAPTURADOR DE TECLADO CORREGIDO (Protección antibug de escritura)
const teclas = {};
window.addEventListener("keydown", (e) => { 
    if (estadoActual === "TABLA") {

    if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        scrollTabla++;
    }

    if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        scrollTabla--;
    }

    if (scrollTabla < 0) scrollTabla = 0;
}
    // 🛡️ CONTROL CLAVE: Si se escribe en el input del nombre, el juego no procesa comandos ni se resetea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return; 
    }

    const teclaPresionada = e.key.toLowerCase();
    teclas[teclaPresionada] = true; 
    
    if (teclaPresionada === 'r') {
        if (estadoActual === "JUEGO" || estadoActual === "TABLA" || juegoTerminado) {
            reiniciarJuegoCompleto();
        }
    }
});

window.addEventListener("keyup", (e) => { 
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return; 
    }
    teclas[e.key.toLowerCase()] = false; 
});

// Agrega esto debajo de tus otros eventListeners
window.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        if (temporizadorIntervalo) {
            clearInterval(temporizadorIntervalo);
            temporizadorIntervalo = null;
        }

        juegoTerminado = false;
        juegoGanado = false;
        enTransicionNivel = false;

        estadoActual = "MENU";

        document.querySelector(".marcador-container").style.display = "none";
    }
});

// Movimiento del pajarito con el Mouse
canvas.addEventListener("mousemove", (e) => {
    if (estadoActual === "JUEGO") {
        const rect = canvas.getBoundingClientRect();
        // El Chilalo sigue la posición X del mouse dentro del canvas
        let mouseX = e.clientX - rect.left;
        chilalo.x = mouseX - (chilalo.ancho / 2);
    }
});
canvas.addEventListener("click", () => {

    if (
        estadoActual === "JUEGO" &&
        nivelActual === 2 &&
        chilalo.enSuelo
    ) {
        chilalo.vy = chilalo.fuerzaSalto;
    }

});
canvas.addEventListener("wheel", (e) => {

    if (estadoActual !== "TABLA") return;

    if (e.deltaY > 0) {
        scrollTabla++;
    } else {
        scrollTabla--;
    }

    if (scrollTabla < 0) scrollTabla = 0;

    e.preventDefault();

});
function iniciarNivel(nivel) {
    nivelActual = nivel;
    elementosCaida = [];
    ramasPlataforma = [];
    chilalo.vx = 0;
    chilalo.vy = 0;
    chilalo.estaDañado = false;
    scrollCamaraY = 0;
    
    if (nivel === 1) {
        chilalo.ancho = 50;
        chilalo.alto = 50;
        chilalo.x = 375;
        chilalo.y = 525; 
        tiempoSegundos = 60; 
        if(uiNivel) uiNivel.innerText = "Nivel 1: Recolección tras precipitaciones";
        actualizarUI();
        iniciarTemporizador(); 
    } else if (nivel === 2) {
        chilalo.ancho = 35;
        chilalo.alto = 35;
        chilalo.x = 380; 
        chilalo.y = 540; 
        if(uiNivel) uiNivel.innerText = "Nivel 2: Modelado del Nido";
        if(uiPuntos) uiPuntos.innerText = "Objetivo: ¡Llega hasta el nido!";
        actualizarUI();
        
        let baseHeight = 440; 
        let ultimoX = chilalo.x;

        for (let i = 0; i < 10; i++) {
            let minX = Math.max(80, ultimoX - 220);
            let maxX = Math.min(canvas.width - 220, ultimoX + 220);
            let ramaX = Math.random() * (maxX - minX) + minX;
            let ramaY = baseHeight - (i * 90); 
            
            ramasPlataforma.push({
    x: ramaX,
    y: ramaY,
    ancho: 140,
    alto: 15,
    construida: false,
    esCentro: false,
    piso: i + 1,
    visitada: false
});
            ultimoX = ramaX;
        }

        let nidoY = baseHeight - (10 * 90);
        ramasPlataforma.push({
            x: 270,
            y: nidoY,
            ancho: 260,
            alto: 20,
            construida: false,
            esCentro: true,
            piso: 11
        });

        iniciarTemporizador(); 
    }
}

function iniciarTemporizador() {
    if (temporizadorIntervalo) clearInterval(temporizadorIntervalo);
    
    temporizadorIntervalo = setInterval(() => {
        if (estadoActual === "JUEGO" && !juegoTerminado && !enTransicionNivel) {
            tiempoSegundos--;
            if(uiTiempo) uiTiempo.innerText = `Tiempo: ${tiempoSegundos}s`;
            
            if (tiempoSegundos <= 0) {
                finalizarJuego(false);
            }
        }
    }, 1000);
}

function ejecutarPantallaIntermedia() {

    if (temporizadorIntervalo) {
        clearInterval(temporizadorIntervalo);
        temporizadorIntervalo = null;
    }

    elementosCaida = [];
    transicionIniciada = false;
    siguienteNivel = 2;
    estadoActual = "INTRO_NIVEL";

    setTimeout(() => {

        estadoActual = "JUEGO";

        iniciarNivel(2);

    }, 3000);
}

function actualizarChilalo() {

    if (teclas["arrowleft"] || teclas["a"]) {
        chilalo.vx = -chilalo.velocidadMax;
    }
    else if (teclas["arrowright"] || teclas["d"]) {
        chilalo.vx = chilalo.velocidadMax;
    }
    else {
        chilalo.vx *= chilalo.friccion;
    }

    chilalo.x += chilalo.vx;

    if (chilalo.x < 0) chilalo.x = 0;

    if (chilalo.x > canvas.width - chilalo.ancho) {
        chilalo.x = canvas.width - chilalo.ancho;
    }

    if (nivelActual === 1) {
        chilalo.y = 525;
    }
    else {

        chilalo.vy += chilalo.gravedad;
        chilalo.y += chilalo.vy;

        let sobreSuperficieSolida = false;

        let sueloRealY =
            575 - chilalo.alto + scrollCamaraY;

        if (chilalo.y >= sueloRealY) {
            chilalo.y = sueloRealY;
            chilalo.vy = 0;
            sobreSuperficieSolida = true;
        }

        for (let rama of ramasPlataforma) {

            if (
                chilalo.x + chilalo.ancho - 8 > rama.x &&
                chilalo.x + 8 < rama.x + rama.ancho
            ) {

                if (
                    chilalo.y + chilalo.alto >= rama.y &&
                    chilalo.y + chilalo.alto - chilalo.vy <= rama.y + 10 &&
                    chilalo.vy >= 0
                ) {

                    chilalo.y = rama.y - chilalo.alto;
                    chilalo.vy = 0;

                    sobreSuperficieSolida = true;
if (!rama.esCentro && !rama.visitada) {

    rama.visitada = true;
    progresoNido++;

}
                    if (rama.esCentro && !rama.construida) {
                        rama.construida = true;
                        finalizarJuego(true);
                    }
                }
            }
        }

        chilalo.enSuelo = sobreSuperficieSolida;

        if (
            (teclas["arrowup"] ||
             teclas["w"] ||
             teclas[" "]) &&
             chilalo.enSuelo
        ) {

            chilalo.vy = chilalo.fuerzaSalto;
            chilalo.enSuelo = false;
        }

        if (chilalo.y - scrollCamaraY < 250) {
            scrollCamaraY +=
                (chilalo.y - scrollCamaraY - 250) * 0.1;
        }

        if (
            chilalo.y - scrollCamaraY > 400 &&
            scrollCamaraY < 0
        ) {

            scrollCamaraY +=
                (chilalo.y - scrollCamaraY - 400) * 0.1;
        }
    }
}

function gestionarElementos() {
    if (nivelActual !== 1 || transicionIniciada) return;

    let factorDificultad = 1.0 + (Math.floor(materialesUnidades / 10) * 0.25); 
    nivelDificultad = Math.floor(materialesUnidades / 10) + 1;
    let tasaGeneracion = 0.015 + (materialesUnidades * 0.0007);

    if (Math.random() < tasaGeneracion) { 
        let mat = tiposMateriales[Math.floor(Math.random() * tiposMateriales.length)];
        let velocidadFinal = (Math.random() * 0.5 + 1.8) * factorDificultad; 

        elementosCaida.push({
            x: Math.random() * (canvas.width - 50) + 25,
            y: -25,
            velocidad: velocidadFinal,
            ...mat
        });
    }

    for (let i = elementosCaida.length - 1; i >= 0; i--) {
        let el = elementosCaida[i];
        if (!el) continue; 
        
        el.y += el.velocidad;

let choque = el.x > chilalo.x &&
             el.x < chilalo.x + chilalo.ancho &&
             el.y > chilalo.y &&
             el.y < chilalo.y + chilalo.alto;

        if (choque) {
            if (el.malo) {
                vidas--;
                combo = 0;
                actualizarUI();
                
                reproducirSonido("golpe");
                chilalo.estaDañado = true;
                setTimeout(() => { chilalo.estaDañado = false; }, 150);

                if (vidas <= 0) {
                    finalizarJuego(false);
                    elementosCaida = [];
                    return; 
                }
            } else {
                materialesUnidades++; 
                combo++;
                puntosScore += el.puntos * combo;
                actualizarUI();
                
                reproducirSonido("recolectar");
                
                if (materialesUnidades >= META_MATERIALES) {
                    transicionIniciada = true; 
                    ejecutarPantallaIntermedia();
                    break; 
                }
            }
            elementosCaida.splice(i, 1);
            continue;
        }

        if (el.y > canvas.height) elementosCaida.splice(i, 1);
    }
}

function actualizarUI() {
    if(uiTiempo) uiTiempo.innerText = `Tiempo: ${tiempoSegundos}s`;
    if(!uiPuntos || !uiVidas) return; 
    if (nivelActual === 1) {
        uiPuntos.innerText =
`Materiales: ${materialesUnidades}/${META_MATERIALES}
 | Score: ${puntosScore}
 | Dificultad: ${nivelDificultad}`;
} else {
        uiPuntos.innerText = `Objetivo: ¡Llega hasta el nido! | Score: ${puntosScore} pts`;
    }
    uiVidas.innerText = `Vidas: ` + "❤️ ".repeat(vidas);
}

function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
const hud = document.querySelector(".marcador-container");

if (estadoActual === "JUEGO") {
    hud.style.display = "flex";
} else {
    hud.style.display = "none";
}
    if (estadoActual === "MENU") {
        canvas.style.backgroundColor = "#e0f7fa"; 
        ctx.fillStyle = "#d84315";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("EL DESAFÍO DEL CHILALO", canvas.width / 2, 120);
       ctx.fillStyle = "#E6C27A";

ctx.beginPath();

ctx.moveTo(0,600);

ctx.quadraticCurveTo(
    150,500,
    300,600
);

ctx.quadraticCurveTo(
    450,530,
    600,600
);

ctx.quadraticCurveTo(
    700,550,
    800,600
);

ctx.lineTo(800,600);
ctx.lineTo(0,600);

ctx.closePath();

ctx.fill();
ctx.fillStyle = "#4E342E";
ctx.font = "bold 14px Arial";

ctx.fillText(
"Bosque Seco de Piura",
650,
30
);
        ctx.fillStyle = "#558b2f";
        ctx.font = "bold 20px Arial";
        ctx.fillText("— Menú de Inicio —", canvas.width / 2, 160);

        ctx.fillStyle = "#2e7d32"; 
        ctx.fillRect(botonComenzar.x, botonComenzar.y, botonComenzar.ancho, botonComenzar.alto);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(botonComenzar.x, botonComenzar.y, botonComenzar.ancho, botonComenzar.alto);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.fillText("Comenzar Juego 🌾", canvas.width / 2, botonComenzar.y + 32);

        ctx.fillStyle = "#ef6c00"; 
        ctx.fillRect(botonTabla.x, botonTabla.y, botonTabla.ancho, botonTabla.alto);
        ctx.strokeRect(botonTabla.x, botonTabla.y, botonTabla.ancho, botonTabla.alto);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Ver Tabla de Récords 🏆", canvas.width / 2, botonTabla.y + 32);

        ctx.fillStyle = "#37474f";
        ctx.font = "italic 14px Arial";
        ctx.fillText("Ayuda al ave emblemática de Piura a construir su nido.", canvas.width / 2, 435);
        ctx.font = "bold 15px Arial";
ctx.fillStyle = "#4E342E";
ctx.fillText(
"El Chilalo (Campylorhynchus fasciatus)",
canvas.width / 2,
465
);

ctx.fillText(
"es un ave característica del bosque seco",
canvas.width / 2,
480 
);

ctx.fillText(
"de Piura y Tumbes.",
canvas.width / 2,
495
);
        return; 
    }

    if (estadoActual === "TABLA") {
        canvas.style.backgroundColor = "#263238"; 
        ctx.fillStyle = "#ffd54f";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🏆 MEJORES PUNTAJES LOCALES 🏆", canvas.width / 2, 80);

        ctx.fillStyle = "#37474f";
        ctx.fillRect(100, 130, 600, 320);
        ctx.strokeStyle = "#ffd54f";
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 130, 600, 320);

        ctx.fillStyle = "#b0bec5";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "left";
        ctx.fillText("POS  JUGADOR      PUNTAJE     TIEMPO", 130, 165);
        ctx.fillText("---------------------------------------", 130, 185);

        ctx.fillStyle = "#ffffff";
        if (!window.recordsLocales || window.recordsLocales.length === 0) {
            ctx.textAlign = "center";
            ctx.font = "italic 16px Arial";
            ctx.fillText("No hay récords o cargando servidor local...", canvas.width / 2, 280);
        } else {
            if (scrollTabla > window.recordsLocales.length - 8) {
                scrollTabla = Math.max(0, window.recordsLocales.length - 8);
            }
            window.recordsLocales
                .slice(scrollTabla, scrollTabla + 8)
                .forEach((rec, idx) => {
                    let pos = `${scrollTabla + idx + 1}.`.padEnd(5, ' ');
                    let nombre = rec.nombre_jugador.substring(0, 12).padEnd(13, ' ');
                    let score = `${rec.puntaje_total} pts`.padEnd(12, ' ');
                    let tiempo = `${rec.tiempo_segundos}s`;
                    ctx.font = "16px monospace";
                    ctx.fillText(`${pos}${nombre}${score}${tiempo}`, 130, 215 + (idx * 28));
                });
        }

        ctx.fillStyle = "#d84315";
        ctx.fillRect(botonVolver.x, botonVolver.y, botonVolver.ancho, botonVolver.alto);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(botonVolver.x, botonVolver.y, botonVolver.ancho, botonVolver.alto);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Volver al Menú", canvas.width / 2, botonVolver.y + 25);
        return;
    }
if (estadoActual === "INTRO_NIVEL") {

    ctx.fillStyle = "#1B2631";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "#FFD54F";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";

    if(siguienteNivel === 1){

        ctx.fillText(
            "NIVEL 1",
            canvas.width/2,
            150
        );

        ctx.font = "22px Arial";

        ctx.fillText(
            "Recolecta barro y paja seca",
            canvas.width/2,
            250
        );

        ctx.fillText(
            "formados tras lluvias excepcionales.",
            canvas.width/2,
            290
        );

        ctx.fillText(
            "⚠ Evita las rocas ⚠",
            canvas.width/2,
            350
        );

    } else {

        ctx.fillText(
            "NIVEL 2",
            canvas.width/2,
            150
        );

        ctx.font = "22px Arial";

        ctx.fillText(
            "Construye el nido del Chilalo",
            canvas.width/2,
            250
        );

        ctx.fillText(
            "sobre un árbol de algarrobo.",
            canvas.width/2,
            290
        );

        ctx.fillText(
            "Llega hasta la copa.",
            canvas.width/2,
            350
        );
    }

    return;
}
    if (nivelActual === 1) {
        canvas.style.backgroundColor = "#e0f7fa";
        // ☀️ Sol piurano
ctx.fillStyle = "#FFD54F";
ctx.beginPath();
ctx.arc(700, 80, 45, 0, Math.PI * 2);
ctx.fill();

// 🌳 Algarrobo izquierdo
ctx.fillStyle = "#6D4C41";
ctx.fillRect(80, 460, 25, 100);

ctx.fillStyle = "#388E3C";
ctx.beginPath();
ctx.arc(92, 430, 45, 0, Math.PI * 2);
ctx.fill();

// 🌳 Algarrobo derecho
ctx.fillStyle = "#6D4C41";
ctx.fillRect(680, 470, 25, 90);

ctx.fillStyle = "#388E3C";
ctx.beginPath();
ctx.arc(692, 440, 40, 0, Math.PI * 2);
ctx.fill(); 
    } else {
        canvas.style.backgroundColor = "#f1f8e9"; 
    }

    ctx.fillStyle = "#c2b280";
    let renderSueloY = 560 - scrollCamaraY;
    if (renderSueloY < canvas.height) {
        ctx.fillRect(0, renderSueloY, canvas.width, canvas.height - renderSueloY + 100);
    }

    if (nivelActual === 2) {
        ctx.save();
        ctx.translate(0, -scrollCamaraY); 

        ctx.fillStyle = "#3e2723";
        ctx.fillRect(370, -600, 60, 1160); 

        for (let rama of ramasPlataforma) {
            ctx.fillStyle = "#5d4037"; 
            ctx.fillRect(rama.x, rama.y, rama.ancho, rama.alto);

            ctx.fillStyle = "#2e7d32";
            ctx.beginPath();
            if (rama.esCentro) {
                ctx.arc(rama.x - 15, rama.y + 10, 25, 0, Math.PI * 2);
                ctx.arc(rama.x + rama.ancho + 15, rama.y + 10, 25, 0, Math.PI * 2);
            } else {
                ctx.arc(rama.x - 8, rama.y + 7, 16, 0, Math.PI * 2); 
                ctx.arc(rama.x + rama.ancho + 8, rama.y + 7, 16, 0, Math.PI * 2); 
            }
            ctx.fill();

            if (rama.esCentro) {

    let centroX = rama.x + (rama.ancho / 2);

    // Copa del algarrobo
    ctx.fillStyle = "#2E7D32";

    ctx.beginPath();
    ctx.arc(centroX - 60, rama.y - 45, 25, 0, Math.PI * 2);
    ctx.arc(centroX + 60, rama.y - 45, 25, 0, Math.PI * 2);
    ctx.arc(centroX, rama.y - 60, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ff9800";
    ctx.lineWidth = 3;
    ctx.setLineDash([6,6]);

    ctx.strokeRect(
        centroX - 50,
        rama.y - 45,
        100,
        45
    );

    ctx.setLineDash([]);
               if (progresoNido >= 3) {
                    // Base del nido
ctx.fillStyle = "#8D6E63";

ctx.beginPath();
ctx.ellipse(
    centroX,
    rama.y - 10,
    55,
    38,
    0,
    0,
    Math.PI * 2
);
ctx.fill();


// Capas exteriores
ctx.strokeStyle = "#6D4C41";
ctx.lineWidth = 3;

for(let i = 0; i < 5; i++){

    ctx.beginPath();

    ctx.arc(
        centroX,
        rama.y - 10,
        30 + (i * 5),
        Math.PI * 0.15,
        Math.PI * 0.85
    );

    ctx.stroke();
}


// Capa superior abovedada
ctx.fillStyle = "#A1887F";

ctx.beginPath();

ctx.ellipse(
    centroX,
    rama.y - 20,
    45,
    28,
    0,
    Math.PI,
    0,
    true
);

ctx.fill();

// Entrada del nido
ctx.fillStyle = "#2E1B12";

ctx.beginPath();

ctx.arc(
    centroX + 18,
    rama.y - 8,
    12,
    0,
    Math.PI * 2
);

ctx.fill();

// Borde de la entrada
ctx.strokeStyle = "#5D4037";
ctx.lineWidth = 2;

ctx.beginPath();

ctx.arc(
    centroX + 18,
    rama.y - 8,
    12,
    0,
    Math.PI * 2
);

ctx.stroke();

// Detalles de paja
ctx.strokeStyle = "#D7B56D";
ctx.lineWidth = 1;

const semillas = [
[10,10],[20,15],[30,20],[40,12],[50,25],
[60,10],[70,18],[15,28],[25,35],[35,22],
[45,18],[55,32],[65,28],[75,20]
];
for(let p of semillas){

    let x1 = centroX - 40 + p[0];
    let y1 = rama.y - 40 + p[1];

    ctx.beginPath();

    ctx.moveTo(x1, y1);

    ctx.lineTo(
        x1 + 4,
        y1 + 2
    );

    ctx.stroke();
}ctx.stroke();

                }
            }
        }
        ctx.restore();
    } else if (nivelActual === 1) {
        for (let el of elementosCaida) {
            if (!el) continue;
            ctx.fillStyle = el.color;
            ctx.beginPath();
            ctx.arc(el.x, el.y, el.radio, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    ctx.save();
    if (nivelActual === 2) {
        ctx.translate(0, -scrollCamaraY);
    }

    if (chilalo.estaDañado) {
        ctx.fillStyle = "#ff1744"; 
    } else {
        ctx.fillStyle = "#e64a19"; 
    }
    ctx.fillRect(chilalo.x, chilalo.y, chilalo.ancho, chilalo.alto);
    
    ctx.fillStyle = "#ffffff"; 
    ctx.fillRect(chilalo.x + (chilalo.ancho * 0.7), chilalo.y + (chilalo.alto * 0.2), chilalo.ancho * 0.12, chilalo.alto * 0.12);
    ctx.fillStyle = "#ffb300"; 
    ctx.fillRect(chilalo.x + chilalo.ancho - 2, chilalo.y + (chilalo.alto * 0.25), chilalo.ancho * 0.16, chilalo.alto * 0.1);
    ctx.restore();

    if (juegoTerminado && !juegoGanado) {
        ctx.fillStyle = "rgba(18, 18, 18, 0.98)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#ff5252";
        ctx.font = "bold 38px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER 🐦", canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Los elementos climáticos vencieron al Chilalo esta vez.", canvas.width / 2, canvas.height / 2 + 10);
        
        ctx.fillStyle = "#ffd54f";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("👉 PRESIONA LA TECLA [ R ] PARA REINICIAR 👈", canvas.width / 2, canvas.height / 2 + 80);
    }
}

function finalizarJuego(ganado) {
    juegoTerminado = true;
    if (temporizadorIntervalo) {
        clearInterval(temporizadorIntervalo);
        temporizadorIntervalo = null;
    }

    if (ganado) {
        juegoGanado = true;
        let tiempoTranscurrido =
Math.floor((Date.now() - startTime) / 1000);

let bonoVidas = vidas * 100;

// Máximo 500 puntos por rapidez
let bonoTiempo = Math.max(
    0,
    500 - (tiempoTranscurrido * 5)
);

puntosScore += bonoVidas + bonoTiempo;

        window.datosSesion = {
            puntaje: puntosScore, 
            tiempo: tiempoTranscurrido,
            nivel: 2
        };
reproducirSonido("victoria");
        if(modalResumen) modalResumen.innerHTML = `
<h3>🐦 ¡Nido completado!</h3>
🏆 Materiales:
${puntosScore - bonoVidas - bonoTiempo} pts<br>

❤️ Bono por vidas:
${bonoVidas} pts<br>

⚡ Bono por rapidez:
${bonoTiempo} pts<br><br>

Puntaje Final:
<strong>${puntosScore} pts</strong><br><br>

📚 ¿Sabías que?<br>

El Chilalo es una de las aves más representativas
del bosque seco de Piura.

Construye grandes nidos utilizando barro,
ramas y fibras vegetales para proteger
a sus crías.<br><br>

<br><br>
🌿 Conservemos el bosque seco piurano,
hábitat natural del Chilalo.<br><br>

⏱ Tiempo empleado:
${tiempoTranscurrido} segundos.
`;
        if(modal) modal.style.display = "flex";
    }
}

function reiniciarJuegoCompleto() {
    if (temporizadorIntervalo) clearInterval(temporizadorIntervalo);
    
    puntosScore = 0;
    materialesUnidades = 0;
    vidas = 3;
    juegoTerminado = false;
    juegoGanado = false;
    enTransicionNivel = false;
    transicionIniciada = false; 
    scrollCamaraY = 0; 
    elementosCaida = []; 
    progresoNido = 0;
    if(modal) modal.style.display = "none";
    estadoActual = "JUEGO"; 
    
    startTime = Date.now(); 
    iniciarNivel(1); 
}

function gameLoop() {
    if (estadoActual === "JUEGO" && !enTransicionNivel && !juegoTerminado) {
        actualizarChilalo();
        gestionarElementos();
    }
    dibujar();
    requestAnimationFrame(gameLoop);
}

window.cambiarEstadoJuego = function(nuevoEstado) {
    estadoActual = nuevoEstado;
};

gameLoop();