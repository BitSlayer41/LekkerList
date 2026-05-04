<?php

//start the session
session_start();


// Check if user is not logged in, then redirect the user to login page
if (!isset($_SESSION["userId"]) || $_SESSION["userId"] !== true) {
    header("location: ../../login/php");
    exit;
}
