import React, { useState } from 'react';
import { LogIn, Clock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import bcrypt from 'bcryptjs';

interface EmployeeAuthFormProps {
  onEmployeeLogin: (employee: any) => void;
  onBackToAdmin: () => void;
  onShowRegistration: () => void;
}

const EmployeeAuthForm: React.FC<EmployeeAuthFormProps> = ({ 
  onEmployeeLogin, 
  onBackToAdmin, 
  onShowRegistration 
}) => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('محاولة تسجيل دخول للموظف:', employeeNumber);

    try {
      // البحث عن الموظف بالرقم الوظيفي
      const { data: employees, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_number', employeeNumber);

      if (employeeError) {
        console.error('خطأ في البحث عن الموظف:', employeeError);
        showToast('حدث خطأ في البحث عن الموظف', 'error');
        setLoading(false);
        return;
      }

      console.log('نتائج البحث:', employees);

      const employee = employees && employees.length > 0 ? employees[0] : null;

      if (!employee) {
        showToast('الرقم الوظيفي غير موجود', 'error');
        setLoading(false);
        return;
      }

      console.log('تم العثور على الموظف:', employee);

      // التحقق من كلمة المرور (في التطبيق الحقيقي يجب استخدام hash)
      const expectedPassword = employee.password_hash;
      
      // التحقق من كلمة المرور المشفرة أو الافتراضية
      let passwordValid = false;
      if (expectedPassword) {
        // إذا كانت كلمة المرور مشفرة
        if (expectedPassword.startsWith('$2')) {
          console.log('التحقق من كلمة المرور المشفرة');
          passwordValid = await bcrypt.compare(password, expectedPassword);
        } else {
          // كلمة مرور غير مشفرة (للتوافق مع النظام القديم)
          console.log('التحقق من كلمة المرور غير المشفرة');
          passwordValid = password === expectedPassword;
        }
      } else {
        // كلمة المرور الافتراضية
        console.log('استخدام كلمة المرور الافتراضية');
        passwordValid = password === '123456';
      }
      
      console.log('نتيجة التحقق من كلمة المرور:', passwordValid);

      if (!passwordValid) {
        showToast('كلمة المرور غير صحيحة', 'error');
        setLoading(false);
        return;
      }

      // تحديث آخر تسجيل دخول
      await supabase
        .from('employees')
        .update({ last_login: new Date().toISOString() })
        .eq('id', employee.id);

      showToast(`مرحباً ${employee.name}`, 'success');
      onEmployeeLogin(employee);
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      showToast('حدث خطأ أثناء تسجيل الدخول', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تسجيل حضور الموظفين</h1>
          <p className="text-gray-600">فلورينا كافي</p>
        </div>

        {/* Employee Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              تسجيل دخول الموظف
            </h2>
            <p className="text-gray-600 text-center text-sm">
              أدخل بياناتك لتسجيل الحضور
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الرقم الوظيفي
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="أدخل رقمك الوظيفي"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">كلمة المرور الافتراضية: 123456</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToAdmin}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={loading}
            >
              العودة لتسجيل دخول الإدارة
            </button>
          </div>

          {/* Employee Registration Button */}
          <div className="mt-4 text-center border-t border-gray-200 pt-4">
            <button
              onClick={onShowRegistration}
              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
              disabled={loading}
            >
              <UserPlus className="w-4 h-4" />
              تسجيل موظف جديد
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-2">تعليمات:</h3>
          <div className="text-xs text-green-700 space-y-1">
            <p>• استخدم رقمك الوظيفي المسجل في النظام</p>
            <p>• كلمة المرور الافتراضية للحسابات القديمة: 123456</p>
            <p>• الموظفون الجدد يجب تسجيل حساب جديد أولاً</p>
            <p>• يمكنك تسجيل الحضور والغياب فقط</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAuthForm;