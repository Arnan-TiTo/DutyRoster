<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'user_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'user_id',
        'username',
        'password_hash',
        'display_name',
        'employee_id',
        'is_active',
    ];

    protected bool $allowEmptyInserts = false;
    protected bool $updateOnlyChanged = true;

    protected array $casts = [
        'is_active' => 'boolean',
    ];
    protected array $castHandlers = [];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $deletedField = 'deleted_at';

    // Validation
    protected $validationRules = [
        'username' => 'required|min_length[3]|max_length[100]|is_unique[users.username,user_id,{user_id}]',
        'display_name' => 'required|min_length[2]|max_length[200]',
        'password_hash' => 'permit_empty|min_length[60]',
    ];
    protected $validationMessages = [];
    protected $skipValidation = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert = ['generateUUID'];
    protected $afterInsert = [];
    protected $beforeUpdate = [];
    protected $afterUpdate = [];
    protected $beforeFind = [];
    protected $afterFind = [];
    protected $beforeDelete = [];
    protected $afterDelete = [];

    /**
     * Generate UUID before insert
     */
    protected function generateUUID(array $data)
    {
        if (empty($data['data']['user_id'])) {
            $data['data']['user_id'] = get_uuid();
        }
        return $data;
    }

    /**
     * Get user by username
     */
    public function getUserByUsername(string $username)
    {
        return $this->where('username', $username)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get user with roles
     */
    public function getUserWithRoles(string $userId)
    {
        $user = $this->find($userId);

        if ($user) {
            $user['roles'] = $this->getUserRoles($userId);
        }

        return $user;
    }

    /**
     * Get user's roles
     */
    public function getUserRoles(string $userId): array
    {
        $db = \Config\Database::connect();

        return $db->table('user_roles ur')
            ->select('r.role_code')
            ->join('roles r', 'r.role_id = ur.role_id')
            ->where('ur.user_id', $userId)
            ->get()
            ->getResultArray();
    }

    /**
     * Assign roles to user
     */
    public function assignRoles(string $userId, array $roleIds): bool
    {
        $db = \Config\Database::connect();

        // Remove existing roles
        $db->table('user_roles')->where('user_id', $userId)->delete();

        // Insert new roles
        if (!empty($roleIds)) {
            $data = [];
            foreach ($roleIds as $roleId) {
                $data[] = [
                    'user_id' => $userId,
                    'role_id' => $roleId,
                ];
            }
            $db->table('user_roles')->insertBatch($data);
        }

        return true;
    }

    /**
     * Create user with password
     */
    public function createUser(array $data, string $password): ?string
    {
        $data['password_hash'] = password_hash($password, PASSWORD_BCRYPT);

        if ($this->insert($data)) {
            return $this->getInsertID();
        }

        return null;
    }

    /**
     * Verify password
     */
    public function verifyPassword(string $username, string $password): ?array
    {
        $user = $this->getUserByUsername($username);

        if ($user && password_verify($password, $user['password_hash'])) {
            return $user;
        }

        return null;
    }
}
