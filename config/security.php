<?php
session_start();
require_once 'helpers.php';

function generateCSRF() {
    $_SESSION['csrf_token'] = generateId();
    return $_SESSION['csrf_token'];
}

if (empty($_SESSION['csrf_token'])) {
    generateCSRF();
}

header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");