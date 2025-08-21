import React, { useState, useEffect } from 'react';
import { Clock, LogOut, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';

interface EmployeeAttendanceViewProps {
  employee: any;
  onLogout: () => void;
}

const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({ employee, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTodayAttendance();
    fetchRecentAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTodayAttendance(data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchRecentAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentAttendance(data || []);
    } catch (error) {
      console.error('Error fetching recent attendance:', error);
    }
  };

  const handleAttendanceSubmit = async (status: 'حضور' | 'غياب') => {
    setLoading(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: employee.id,
          date: today,
          status: status,
          check_in_time: now
        }, { 
          onConflict: 'employee_id,date',
          ignoreDuplicates: false 
        });
      
      if (error) throw error;
      
      showToast(`تم تسجيل ${status} بنجاح`, 'success');
      fetchTodayAttendance();
      fetchRecentAttendance();
    } catch (error) {
      showToast('حدث خطأ أثناء تسجيل الحضور', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{employee.name}</h1>
                  <p className="text-sm text-gray-600">رقم: {employee.employee_number}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              تسجيل خروج
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg shadow-md border">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً {employee.name}</h2>
            <p className="text-gray-600 mb-4">رقمك الوظيفي: {employee.employee_number}</p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">{getCurrentTime()}</p>
            </div>
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-white p-8 rounded-lg shadow-md border">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            تسجيل الحضور لليوم
          </h3>
          
          {todayAttendance ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-xl font-bold shadow-md ${
                todayAttendance.status === 'حضور' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {todayAttendance.status === 'حضور' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                تم تسجيل {todayAttendance.status}
              </div>
              <p className="text-gray-600 mt-4 text-lg">
                تم التسجيل في: {new Date(todayAttendance.check_in_time).toLocaleString('ar-EG')}
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">شكراً لك! تم تسجيل حضورك بنجاح</p>
              </div>
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-600 mb-6 text-lg">يرجى تسجيل حضورك لليوم</p>
              <div className="flex gap-6 justify-center">
                <button
                  onClick={() => handleAttendanceSubmit('حضور')}
                  disabled={loading}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-3 text-lg font-semibold shadow-lg"
                >
                  {loading ? <LoadingSpinner /> : <CheckCircle className="w-6 h-6" />}
                  تسجيل حضور
                </button>
                <button
                  onClick={() => handleAttendanceSubmit('غياب')}
                  disabled={loading}
                  className="bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-3 text-lg font-semibold shadow-lg"
                >
                  {loading ? <LoadingSpinner /> : <XCircle className="w-6 h-6" />}
                  تسجيل غياب
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Attendance - Simplified */}
        {recentAttendance.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">آخر 5 أيام</h3>
            </div>
            <div className="p-6">
              <div className="grid gap-3">
                {recentAttendance.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('ar-EG', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.check_in_time ? 
                          new Date(record.check_in_time).toLocaleTimeString('ar-EG') : 
                          'غير محدد'
                        }
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      record.status === 'حضور' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">تعليمات مهمة:</h3>
          <div className="text-blue-700 space-y-2">
            <p>• يجب تسجيل الحضور يومياً</p>
      </div>

        {/* Demo Employee Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">للتجربة:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>رقم وظيفي تجريبي:</strong> 001</p>
            <p><strong>كلمة المرور:</strong> 123456</p>
            <p className="text-blue-600 font-medium">يمكن للإدارة إضافة هذا الموظف من قسم "إدارة الموظفين"</p>
          </div>
        </div>
    </div>
  );
            <p>• إذا لم تجد رقمك الوظيفي، تواصل مع الإدارة لإضافتك</p>
};

export default EmployeeAttendanceView;