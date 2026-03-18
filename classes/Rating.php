<?php
require_once '../config/helpers.php';

class Rating
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function addOrUpdate($data)
    {
        if (!isset($data['name']) || !isset($data['phone']) || !isset($data['email'])) {
            return [
                "status" => 'error',
                "errors" => 'Please provide valid inputs',
                "dataId" => ''
            ];
        }
        $checkStatement = $this->pdo->prepare("SELECT id FROM ratings WHERE business_id = ? AND (email = ? OR phone = ?) LIMIT 1");

        $checkStatement->execute([
            $data['business_id'],
            $data['email'],
            $data['phone']
        ]);

        $existing = $checkStatement->fetch();

        if ($existing) {
            $updateStmt = $this->pdo->prepare("UPDATE ratings SET rating = ? WHERE id = ?");

            $updateStmt->execute([
                $data['rating'],
                $existing['id']
            ]);
        } else {
            $insertStmt = $this->pdo->prepare("INSERT INTO ratings (id, business_id, name, email, phone, rating) VALUES (?, ?, ?, ?, ?, ?)");

            $insertStmt->execute([
                generateId(),
                $data['business_id'],
                $data['name'],
                $data['email'],
                $data['phone'],
                $data['rating']
            ]);
        }
        return [
            "status" => 'success',
            "errors" => '',
            "avg" => $this->getAverage($data['business_id'])
        ];
    }

    public function getAverage($business_id)
    {
        $statement = $this->pdo->prepare("SELECT AVG(rating) as avg_rating FROM ratings WHERE business_id=?");
        $statement->execute([$business_id]);
        return round($statement->fetch()['avg_rating'], 1);
    }
}
