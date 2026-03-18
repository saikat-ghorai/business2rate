<?php
function generateId() {
    return substr(bin2hex(random_bytes(4)), 0, 7) . '-' . substr(bin2hex(random_bytes(3)), 0, 5) . '-' . substr(bin2hex(random_bytes(3)), 0, 5) . '-' . substr(bin2hex(random_bytes(3)), 0, 5);
}