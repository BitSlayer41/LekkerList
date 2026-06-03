<?php

session_start();

define('DBSERVER', 'localhost');
define('DBUSERNAME', 'root');
define('DBPASSWORD', '');
define('DBNAME', 'marketplace');

$conn = mysqli_connect(DBSERVER, DBUSERNAME, DBPASSWORD, DBNAME);

if ($conn === false) {
    die(json_encode(["error" => "Database connection failed: " . mysqli_connect_error()]));
}
