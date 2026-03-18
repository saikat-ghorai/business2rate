<?php
require '../config/db.php';
require '../config/security.php';
require '../classes/Business.php';
require '../classes/Rating.php';

$business = new Business($pdo);
$rating = new Rating($pdo);

$type = $_GET['type'] ?? '';
$action = $_GET['action'] ?? '';

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    if (!isset($_SERVER['HTTP_X_CSRF_TOKEN']) || $_SERVER['HTTP_X_CSRF_TOKEN'] !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(["error" => "Invalid CSRF", "csrf_token" => $_SESSION['csrf_token']]);
        exit;
    }
}

switch ($type) {

    case 'business':
        switch ($action) {

            case 'list':
                $page = max(1, (int)($_GET['page'] ?? 1));
                $search = $_GET['search'] ?? '';

                respond($business->getAll($page, $limit, $search));
                break;

            case 'details':
                $businessId = $_GET['id'] ?? '';

                respond($business->getDetails($businessId));
                break;

            case 'add':
                respond($business->create($data));
                break;

            case 'update':
                respond($business->update($data['id'], $data));
                break;

            case 'delete':
                respond($business->delete($data['id']));
                break;
        }
        break;

    case 'rating':

        switch ($action) {
            case 'add':
                respond($rating->addOrUpdate($data));
                break;
        }

        break;
}

function respond($data) {
    $newToken = generateCSRF();
    $data['csrf_token'] = $newToken;
    echo json_encode($data);
    exit;
}
