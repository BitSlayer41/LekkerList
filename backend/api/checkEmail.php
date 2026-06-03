<?php

// Checks if email exists

require_once __DIR__ . '/../config/database.php';


if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['email'])) {
    $email = $_POST['email'];

    $stmt = $conn->prepare("SELECT id FROM users WHERE email=?");
    $stmt -> bind_param("s", $email);
    $stmt -> execute();
    $stmt -> store_result();

    echo $stmt -> num_rows > 0 ? 'exists' : 'not_found';

    $stmt -> close();
    $conn -> close();
}
