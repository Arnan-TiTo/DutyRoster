-- Run this AFTER `prisma migrate deploy` (or migrate dev)
-- Adds overlap protection (tstzrange exclusion constraint) as per project plan.

CREATE TABLE IF NOT EXISTS public.employee_timeblocks (
  block_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
  kind text NOT NULL, -- SHIFT | LEAVE | HOLIDAY
  ref_entry_id uuid NULL,
  ref_leave_request_id uuid NULL,
  period tstzrange NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_employee_timeblocks_employee ON public.employee_timeblocks(employee_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ex_employee_timeblocks_no_overlap'
      AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE public.employee_timeblocks
      ADD CONSTRAINT ex_employee_timeblocks_no_overlap
      EXCLUDE USING gist (
        employee_id WITH =,
        period WITH &&
      );
  END IF;
END $$;
