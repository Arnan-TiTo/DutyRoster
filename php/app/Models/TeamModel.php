<?php

namespace App\Models;

use CodeIgniter\Model;

class TeamModel extends Model
{
    protected $table = 'teams';
    protected $primaryKey = 'team_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'team_id',
        'team_code',
        'team_name',
    ];

    protected $validationRules = [
        'team_name' => 'required|max_length[200]',
        'team_code' => 'permit_empty|max_length[50]|is_unique[teams.team_code,team_id,{team_id}]',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['team_id'])) {
            $data['data']['team_id'] = get_uuid();
        }
        return $data;
    }

    /**
     * Get team with employee count
     */
    public function getTeamWithCount(string $teamId)
    {
        $team = $this->find($teamId);

        if ($team) {
            $db = \Config\Database::connect();
            $count = $db->table('employees')
                ->where('team_id', $teamId)
                ->where('is_active', true)
                ->countAllResults();

            $team['employee_count'] = $count;
        }

        return $team;
    }

    /**
     * Get all teams with employee counts
     */
    public function getAllWithCounts()
    {
        $teams = $this->findAll();

        foreach ($teams as &$team) {
            $db = \Config\Database::connect();
            $count = $db->table('employees')
                ->where('team_id', $team['team_id'])
                ->where('is_active', true)
                ->countAllResults();

            $team['employee_count'] = $count;
        }

        return $teams;
    }
}
