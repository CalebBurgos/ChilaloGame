
window.cargarTablaClasificacionAsync = function() {
    fetch("backend/guardar_record.php?obtener=1&nocache=" + Math.random()) 
    .then(async res => {
    if (!res.ok) throw new Error("Error en el servidor");

    const text = await res.text();

    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error("Respuesta no es JSON válido");
    }
})
    .then(data => {
        console.log("Datos recibidos en conexion.js:", data);
    
        if (data && data.records && Array.isArray(data.records)) {
            window.recordsLocales = data.records;
        } else if (data && data.data && Array.isArray(data.data)) {
            window.recordsLocales = data.data;
        } else if (Array.isArray(data)) {
            window.recordsLocales = data;
        }
    })
    .catch(err => {
        console.error("Error cargando tabla en conexion.js:", err);
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("form-record");
    const modal = document.getElementById("modal-registro");

    if (formulario) {
        formulario.onsubmit = function(e) {
            e.preventDefault(); 

            const nombreInput = document.getElementById("nombre_jugador") ? document.getElementById("nombre_jugador").value.trim() : "";
            if (nombreInput === "") { alert("Por favor, introduce tu nombre."); return; }

            fetch("https://TU-SITIO.epizy.com/backend/guardar_record.php", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify({
                    nombre_jugador: nombreInput,
                    puntaje_total: window.datosSesion.puntaje,
                    tiempo_segundos: window.datosSesion.tiempo,
                    nivel_alcanzado: window.datosSesion.nivel
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success" || data.success === true || data.status === "ok") {
                    console.log("Récord guardado correctamente");
                    if (modal) modal.style.display = "none";
                    
                    if (typeof window.cambiarEstadoJuego === "function") {
                        window.cambiarEstadoJuego("TABLA");
                    }
                    setTimeout(window.cargarTablaClasificacionAsync, 200);
                } else {
                    alert("Error al guardar en el servidor: " + (data.message || "Desconocido"));
                }
            })
            .catch(err => {
                console.error(err);
                alert("Error al conectar con el servidor local de base de datos.");
            });
        };
    }
    
    window.cargarTablaClasificacionAsync();
});
