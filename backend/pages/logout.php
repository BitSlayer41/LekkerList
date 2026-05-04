<?php

// Start a session
session_start();

// Destroy session
if (session_destroy()) {
    // redirect to login page
    header("Location: ./login.html");
    exit;
}
