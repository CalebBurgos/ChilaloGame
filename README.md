# 🐦 El Desafío del Chilalo

## Descripción General

**El Desafío del Chilalo** es un videojuego educativo desarrollado con tecnologías web (HTML5, CSS3, JavaScript, PHP y MySQL) cuyo objetivo es concientizar sobre la importancia del **Chilalo (Campylorhynchus fasciatus)**, ave representativa del bosque seco de Piura.

El jugador deberá recolectar materiales naturales para la construcción del nido y posteriormente ascender por un árbol de algarrobo hasta completar el proceso de anidación.

---

## Objetivos del Proyecto

* Difundir información sobre la biodiversidad del bosque seco piurano.
* Aplicar conceptos de programación multimedia.
* Implementar persistencia de datos mediante bases de datos relacionales.
* Utilizar comunicación asíncrona cliente-servidor mediante Fetch API.
* Aplicar control de versiones utilizando Git y GitHub.

---

## Tecnologías Utilizadas

### Frontend

* HTML5
* CSS3
* JavaScript ES6
* Canvas API
* Fetch API

### Backend

* PHP 8
* PDO (PHP Data Objects)

### Base de Datos

* MySQL

### Control de Versiones

* Git
* GitHub
* GitHub Pages

---

## Arquitectura del Sistema

### Cliente

Responsable de:

* Renderizado del videojuego en Canvas.
* Gestión de eventos del usuario.
* Cálculo de colisiones.
* Actualización de interfaz gráfica.
* Comunicación asíncrona con el servidor.

### Servidor

Responsable de:

* Recepción de datos mediante solicitudes HTTP.
* Validación y saneamiento de entradas.
* Registro de récords.
* Consulta de clasificaciones.

### Base de Datos

Almacena:

* Nombre del jugador.
* Puntaje obtenido.
* Tiempo empleado.
* Nivel alcanzado.

---

## Funcionalidades Principales

### Nivel 1: Recolección

* Captura de barro y paja.
* Sistema de combo.
* Incremento progresivo de dificultad.
* Obstáculos climáticos.

### Nivel 2: Construcción del Nido

* Plataformas tipo parkour.
* Sistema de gravedad y salto.
* Construcción progresiva del nido.

### Sistema de Puntuación

Incluye:

* Puntos por materiales recolectados.
* Bono por vidas restantes.
* Bono por rapidez.

### Tabla de Récords

* Almacenamiento permanente en MySQL.
* Consulta asíncrona mediante Fetch API.
* Ordenamiento por puntaje.

---

## Seguridad Implementada

### Validación de Datos

Los datos enviados por el cliente son:

* Sanitizados mediante PHP.
* Convertidos a tipos seguros.
* Verificados antes de almacenarse.

### Protección contra SQL Injection

La inserción de registros utiliza:

```php
$stmt = $conexion->prepare($query);
$stmt->bindParam(":nombre", $nombre);
$stmt->bindParam(":punto", $puntaje);
$stmt->bindParam(":tiemp", $tiempo);
$stmt->bindParam(":nivel", $nivel);
```

Implementando sentencias preparadas (Prepared Statements).

---

## Comunicación Asíncrona

La aplicación utiliza Fetch API para intercambiar información sin recargar la página:

```javascript
fetch("backend/guardar_record.php", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
});
```

---

## Estructura del Proyecto

```text
juego-chilalo/
│
├── index.html
├── css/
│   └── estilos.css
│
├── js/
│   ├── juego.js
│   └── conexion.js
│
├── backend/
│   └── guardar_record.php
│
├── assets/
│   ├── imagenes/
│   └── sonidos/
│
└── README.md
```

---

## Instalación Local

### 1. Clonar repositorio

```bash
git clone https://github.com/CalebBurgos/ChilaloGame.git
```

### 2. Iniciar servidor local

Colocar el proyecto dentro de:

```text
xampp/htdocs/
```

### 3. Iniciar servicios

Desde XAMPP:

* Apache
* MySQL

### 4. Crear Base de Datos

```sql
CREATE DATABASE juego_piurano_db;
```

### 5. Ejecutar aplicación

Abrir:

```text
http://localhost/juego-chilalo
```

---

## Despliegue

El proyecto se encuentra publicado mediante GitHub Pages para demostración pública.

Repositorio:

https://github.com/CalebBurgos/ChilaloGame

---

## Autor

**Caleb Burgos Alburqueque**

Curso: Programación Multimedia

Universidad Nacional de Piura

2026
