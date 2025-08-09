/*
  # إضافة نظام تسجيل حضور للموظفين

  1. تحديث جدول الموظفين
    - إضافة حقل كلمة المرور للموظفين
    - إضافة حقل آخر تسجيل دخول

  2. تحديث جدول الحضور
    - إضافة حقل الوقت لتسجيل وقت الحضور
    - تحديث الفهارس

  3. الأمان
    - إضافة سياسات RLS للموظفين
    - السماح للموظفين بتسجيل حضورهم فقط
*/

-- إضافة حقول جديدة لجدول الموظفين
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE employees ADD COLUMN password_hash text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE employees ADD COLUMN last_login timestamptz;
  END IF;
END $$;

-- تحديث جدول الحضور لإضافة الوقت
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance' AND column_name = 'check_in_time'
  ) THEN
    ALTER TABLE attendance ADD COLUMN check_in_time timestamptz DEFAULT now();
  END IF;
END $$;

-- إضافة سياسة RLS للموظفين لتسجيل حضورهم
CREATE POLICY "Employees can insert their own attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = attendance.employee_id 
      AND employees.employee_number = current_setting('app.current_employee_number', true)
    )
  );

CREATE POLICY "Employees can view their own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = attendance.employee_id 
      AND employees.employee_number = current_setting('app.current_employee_number', true)
    )
  );

-- إضافة سياسة للموظفين لعرض بياناتهم
CREATE POLICY "Employees can view their own data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (employee_number = current_setting('app.current_employee_number', true));

-- إضافة فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_employees_number_password ON employees(employee_number, password_hash);