<?php
require_once '../config/helpers.php';

class Business
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll($page, $limit, $search)
    {
        $offset = ($page - 1) * $limit;

        $statement = $this->pdo->prepare("SELECT b.*, IFNULL(AVG(r.rating), 0) as avg_rating FROM businesses b LEFT JOIN ratings r ON b.id = r.business_id WHERE (b.name LIKE :search OR b.phone LIKE :search OR b.email LIKE :search) AND b.status = '1' GROUP BY b.id ORDER BY b.created_at DESC LIMIT :limit OFFSET :offset");

        $statement->bindValue(':search', "%$search%", PDO::PARAM_STR);
        $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
        $statement->bindValue(':offset', $offset, PDO::PARAM_INT);

        $statement->execute();
        $data = $statement->fetchAll();

        $countstatement = $this->pdo->prepare("SELECT COUNT(*) as total FROM businesses WHERE name LIKE :search  AND status = '1'");

        $countstatement->bindValue(':search', "%$search%", PDO::PARAM_STR);
        $countstatement->execute();

        $total = $countstatement->fetch()['total'];
        return [
            "status" => 'success',
            "errors" => '',
            "data" => $data,
            "total" => (int)$total,
            "page" => $page,
            "limit" => $limit
        ];
    }

    public function getDetails($businessId = null)
    {
        if ($businessId == null) {
            return [
                "status" => 'error',
                "errors" => 'Please provide id',
                "dataId" => ''
            ];
        }
        $statement = $this->pdo->prepare("SELECT * FROM businesses WHERE id = :businessId AND status = '1'");

        $statement->bindValue(':businessId', $businessId, PDO::PARAM_STR);

        $statement->execute();
        $data = $statement->fetch();
        return [
            "status" => 'success',
            "errors" => '',
            "data" => $data,
        ];
    }

    public function create($data)
    {
        if (!isset($data['name']) || !isset($data['address']) || !isset($data['phone']) || !isset($data['email'])) {
            return [
                "status" => 'error',
                "errors" => 'Please provide valid inputs',
                "dataId" => ''
            ];
        }
        $id = generateId();

        $checkStatement = $this->pdo->prepare("SELECT id FROM businesses WHERE (email = ? OR phone = ?) AND status = '1' LIMIT 1");
        $checkStatement->execute([
            $data['phone'],
            $data['email']
        ]);

        $existing = $checkStatement->fetch();

        if ($existing) {
            $statement = $this->pdo->prepare("UPDATE businesses SET name=?, address=?, phone=?, email=? WHERE id=?");
            $statement->execute([
                $data['name'],
                $data['address'],
                $data['phone'],
                $data['email'],
                $existing['id']
            ]);

            return [
                "status" => 'success',
                "errors" => '',
                "dataId" => $existing['id']
            ];
        } else {
            $statement = $this->pdo->prepare("INSERT INTO businesses (id, name, address, phone, email) VALUES (?, ?, ?, ?, ?)");

            $statement->execute([
                $id,
                htmlspecialchars($data['name']),
                htmlspecialchars($data['address']),
                $data['phone'],
                $data['email']
            ]);

            return [
                "status" => 'success',
                "errors" => '',
                "dataId" => $id
            ];
        }
    }

    public function update($id = null, $data = array())
    {
        if ($id == null || !isset($data['name']) || !isset($data['address']) || !isset($data['phone']) || !isset($data['email'])) {
            return [
                "status" => 'error',
                "errors" => 'Please provide valid inputs',
                "dataId" => ''
            ];
        }

        $statement = $this->pdo->prepare("UPDATE businesses SET name=?, address=?, phone=?, email=? WHERE id=?");
        $statement->execute([
            $data['name'],
            $data['address'],
            $data['phone'],
            $data['email'],
            $id
        ]);

        return [
            "status" => 'success',
            "errors" => '',
            "dataId" => $id
        ];
    }

    public function delete($id = null)
    {
        if ($id == null) {
            return [
                "status" => 'error',
                "errors" => 'Please provide id',
                "dataId" => ''
            ];
        }
        $statement = $this->pdo->prepare("UPDATE businesses SET status='5' WHERE id=?");
        $statement->execute([$id]);
        return [
            "status" => 'success',
            "errors" => '',
            "dataId" => $id
        ];
    }
}
