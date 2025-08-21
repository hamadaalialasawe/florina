import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';

interface EmployeeAuthFormProps {
  onEmployeeLogin: (employee: any) => void;
}

const EmployeeAuthForm: React.FC<EmployeeAuthFormProps> = ({ onEmployeeLogin }) => {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!employeeNumber.trim() || !password.trim()) {
      setError('يرجى إدخال الرقم الوظيفي وكلمة المرور');
      return;
    }

    setLoading(true);

    try {
      // First, find the employee by employee_number
      const { data: employees, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_number', employeeNumber.trim());

      if (fetchError) {
        throw fetchError;
      }

      if (!employees || employees.length === 0) {
        setError('الرقم الوظيفي غير موجود');
        return;
      }

      const employee = employees[0];

      // Check if employee has a password set
      if (!employee.password_hash) {
        setError('لم يتم تعيين كلمة مرور لهذا الموظف. يرجى التواصل مع الإدارة');
        return;
      }

      // For demo purposes, we'll use simple password comparison
      // In production, you should use proper password hashing
      if (employee.password_hash !== password) {
        setError('كلمة المرور غير صحيحة');
        return;
      }

      // Update last login
      await supabase
        .from('employees')
        .update({ last_login: new Date().toISOString() })
        .eq('id', employee.id);

      showToast(`مرحباً ${employee.name}`, 'success');
      onEmployeeLogin(employee);

    } catch (error: any) {
      console.error('Login error:', error);
      setError('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تسجيل دخول الموظفين</h1>
          <p className="text-gray-600">أدخل بياناتك للوصول إلى نظام الحضور</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الرقم الوظيفي
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل الرقم الوظيفي"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل كلمة المرور"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل دخول
              </>
            )}
          </button>
        </form>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">للتجربة:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>رقم وظيفي:</strong> 001</p>
            <p><strong>كلمة المرور:</strong> 123456</p>
            <p className="text-blue-600 font-medium mt-2">
              يمكن للإدارة إضافة موظفين جدد من قسم "إدارة الموظفين"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAuthForm;