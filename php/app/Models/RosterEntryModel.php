<?php

namespace App\Models;

use CodeIgniter\Model;

class RosterEntryModel extends Model
{
    protected $table = 'roster_entries';
    protected $primaryKey = 'entry_id';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $allowedFields = [
        'entry_id',
        'entry_date',
        'event_type_id',
        'shift_slot_id',
        'start_at',
        'end_at',
        'note',
        'created_by',
    ];

    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    protected $validationRules = [
        'event_type_id' => 'required',
        'entry_date' => 'required|valid_date',
        'start_at' => 'required',
        'end_at' => 'required',
    ];

    protected $beforeInsert = ['generateUUID'];

    protected function generateUUID(array $data)
    {
        if (empty($data['data']['entry_id'])) {
            $data['data']['entry_id'] = get_uuid();
        }
        return $data;
    }

    /**
     * Get entries for date range with details
     */
    public function getEntriesWithDetails(string $dateFrom, string $dateTo)
    {
        return $this->select('roster_entries.*,
                              event_types.event_code, event_types.event_name, event_types.color_hex,
                              shift_slots.slot_name, shift_slots.start_time, shift_slots.end_time')
            ->join('event_types', 'event_types.event_type_id = roster_entries.event_type_id')
            ->join('shift_slots', 'shift_slots.shift_slot_id = roster_entries.shift_slot_id', 'left')
            ->where('roster_entries.entry_date >=', $dateFrom)
            ->where('roster_entries.entry_date <=', $dateTo)
            ->orderBy('roster_entries.entry_date')
            ->orderBy('roster_entries.start_at')
            ->findAll();
    }

    /**
     * Get entry with assignments
     */
    public function getEntryWithAssignments(string $entryId)
    {
        $entry = $this->find($entryId);

        if ($entry) {
            $db = \Config\Database::connect();
            $assignments = $db->table('roster_assignments ra')
                ->select('ra.*, e.first_name, e.last_name, e.emp_code')
                ->join('employees e', 'e.employee_id = ra.employee_id')
                ->where('ra.entry_id', $entryId)
                ->get()
                ->getResultArray();

            $entry['assignments'] = $assignments;
        }

        return $entry;
    }

    /**
     * Assign employees to entry
     */
    public function assignEmployees(string $entryId, array $employeeIds, ?string $assignedBy = null): bool
    {
        $db = \Config\Database::connect();

        // Remove existing assignments
        $db->table('roster_assignments')->where('entry_id', $entryId)->delete();

        //  Insert new assignments
        if (!empty($employeeIds)) {
            $data = [];
            $now = date('Y-m-d H:i:s');

            foreach ($employeeIds as $employeeId) {
                $data[] = [
                    'entry_id' => $entryId,
                    'employee_id' => $employeeId,
                    'assigned_at' => $now,
                    'assigned_by' => $assignedBy,
                ];
            }

            $db->table('roster_assignments')->insertBatch($data);
        }

        return true;
    }
}
