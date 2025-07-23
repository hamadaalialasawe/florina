/*
  # تحديث سياسات الأمان لتتطلب تسجيل الدخول

  1. تحديث السياسات
    - تغيير جميع السياسات لتتطلب المصادقة
    - السماح للمستخدمين المسجلين بالوصول لجميع البيانات
  
  2. الأمان
    - المستخدمون المسجلون فقط يمكنهم الوصول للبيانات
    - جميع العمليات متاحة للمستخدمين المصادق عليهم
*/

-- حذف السياسات الحالية
DROP POLICY IF EXISTS "Allow all operations on company_info" ON company_info;
DROP POLICY IF EXISTS "Allow all operations on employees" ON employees;
DROP POLICY IF EXISTS "Allow all operations on attendance" ON attendance;
DROP POLICY IF EXISTS "Allow all operations on advances" ON advances;
DROP POLICY IF EXISTS "Allow all operations on bonuses" ON bonuses;
DROP POLICY IF EXISTS "Allow all operations on discounts" ON discounts;
DROP POLICY IF EXISTS "Allow all operations on overtime" ON overtime;
DROP POLICY IF EXISTS "Allow all operations on leaves" ON leaves;

-- إنشاء سياسات جديدة تتطلب المصادقة
CREATE POLICY "Authenticated users can manage company_info"
  ON company_info
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage attendance"
  ON attendance
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage advances"
  ON advances
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage bonuses"
  ON bonuses
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage discounts"
  ON discounts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage overtime"
  ON overtime
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage leaves"
  ON leaves
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);