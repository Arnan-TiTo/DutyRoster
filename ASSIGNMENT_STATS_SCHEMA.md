-- Add to schema.prisma

model EmployeeAssignmentStat {
  statId           String   @id @default(uuid()) @map("stat_id")
  employeeId       String   @map("employee_id")
  employee         Employee @relation(fields: [employeeId], references: [employeeId], onDelete: Cascade)
  totalAssignments Int      @default(0) @map("total_assignments")
  lastResetAt      DateTime @default(now()) @map("last_reset_at")
  updatedAt        DateTime @default(now()) @updatedAt @map("updated_at")

  @@unique([employeeId])
  @@map("employee_assignment_stats")
}

-- Then add to Employee model:
// assignmentStats EmployeeAssignmentStat?
