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
        {/* Current Time */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">الوقت الحالي</h2>
            <p className="text-lg text-gray-700">{getCurrentTime()}</p>
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            حالة اليوم
          </h3>
          
          {todayAttendance ? (
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
                todayAttendance.status === 'حضور' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {todayAttendance.status === 'حضور' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                {todayAttendance.status}
              </div>
              <p className="text-gray-600 mt-2">
                تم التسجيل في: {new Date(todayAttendance.check_in_time).toLocaleString('ar-EG')}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">لم يتم تسجيل الحضور اليوم</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleAttendanceSubmit('حضور')}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <LoadingSpinner /> : <CheckCircle className="w-5 h-5" />}
                  تسجيل حضور
                </button>
                <button
                  onClick={() => handleAttendanceSubmit('غياب')}
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <LoadingSpinner /> : <XCircle className="w-5 h-5" />}
                  تسجيل غياب
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">سجل الحضور الأخير</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وقت التسجيل
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      لا توجد سجلات حضور
                    </td>
                  </tr>
                ) : (
                  recentAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'حضور' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.check_in_time ? 
                          new Date(record.check_in_time).toLocaleString('ar-EG') : 
                          '-'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceView;