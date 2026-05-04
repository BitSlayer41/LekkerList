<?php

// Start session
session_start();

// IF user is already logged in then redirect user to home page
if (isset($_SESSION["userId"]) && $_SESSION["userId"] === true) {
    header("location: http://localhost:5173/");
    exit;
}
