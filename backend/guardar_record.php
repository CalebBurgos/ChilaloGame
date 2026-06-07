<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$host = "sql104.infinityfree.com";
$db_name = "if0_42119119_juego_piurano_db";
$username = "if0_42119119";
$password = "CalebBurgos01";


try {
    $conexion = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 📊 ACCIÓN EXTRA: Si se solicita leer la tabla por GET
    if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET['obtener'])) {
        // CORRECCIÓN AQUÍ: Usamos AS para convertir los nombres reales a los que espera el JS
        $sql = "SELECT nombre AS nombre_jugador,
               puntaje AS puntaje_total,
               tiempo AS tiempo_segundos
        FROM tabla_records
        ORDER BY puntaje DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "records" => $records]);
        exit;
    }

    // 🔒 ACCIÓN ORIGINAL: Guardado por POST
    $inputCrudo = file_get_contents("php://input");
    $datos = json_decode($inputCrudo, true);

    if ($_SERVER["REQUEST_METHOD"] === "POST" && $datos) {
        $nombre = filter_var($datos['nombre_jugador'], FILTER_SANITIZE_STRING);
        $puntaje = intval($datos['puntaje_total']);
        $tiempo = intval($datos['tiempo_segundos']);
        $nivel = intval($datos['nivel_alcanzado']);

        // CORRECCIÓN AQUÍ: Insertamos en las columnas reales de tu base de datos
        $query = "INSERT INTO tabla_records (nombre, puntaje, tiempo, nivel_alcanzado) 
                  VALUES (:nombre, :punto, :tiemp, :nivel)";
        
        $stmt = $conexion->prepare($query);
        $stmt->bindParam(":nombre", $nombre);
        $stmt->bindParam(":punto", $puntaje);
        $stmt->bindParam(":tiemp", $tiempo);
        $stmt->bindParam(":nivel", $nivel);
        $stmt->execute();

        echo json_encode([
            "status" => "success",
            "message" => "¡Récord guardado con éxito en el esquema relacional!"
        ]);
        exit;
    }

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Fallo en el servidor: " . $e->getMessage()
    ]);
}
?>
