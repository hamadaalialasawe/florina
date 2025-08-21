import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users, UserCheck, Key } from 'lucide-react';
import { supabase, Employee } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import bcrypt from 'bcryptjs';

const EmployeesView: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    employee_number: '',
    name: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('employee_number');
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showToast('خطأ في تحميل بيانات الموظفين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employee_number.trim() || !formData.name.trim()) {
      showToast('يرجى ملء جميع الحقول', 'warning');
      return;
    }

    // التحقق من عدم وجود الرقم الوظيفي مسبقاً قبل الإضافة
    if (!editingEmployee) {
      const { data: existingEmployee } = await supabase
        .from('employees')
        .select('employee_number')
        .eq('employee_number', formData.employee_number.trim())
        .single();
      
      if (existingEmployee) {
        showToast('الرقم الوظيفي موجود مسبقاً', 'error');
        return;
      }
    }

    try {
      if (editingEmployee) {
        const { error } = await supabase
          .from('employees')
          .update({ 
            name: formData.name.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEmployee.id);
        
        if (error) throw error;
        showToast('تم تحديث بيانات الموظف بنجاح', 'success');
      } else {
        // إنشاء كلمة مرور افتراضية مشفرة
        const defaultPassword = '123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const { error } = await supabase
          .from('employees')
          .insert({
            employee_number: formData.employee_number.trim(),
            name: formData.name.trim(),
            password_hash: hashedPassword
          });
        
        if (error) {
          if (error.code === '23505') {
            showToast('الرقم الوظيفي موجود مسبقاً', 'error');
            return;
          }
          throw error;
        }
        showToast(`تم إضافة الموظف "${formData.name}" بنجاح. كلمة المرور الافتراضية: 123456`, 'success');
      }
      
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      showToast('حدث خطأ أثناء حفظ البيانات', 'error');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_number: employee.employee_number,
      name: employee.name
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', confirmDelete.id);
      
      if (error) throw error;
      showToast('تم حذف الموظف بنجاح', 'success');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      showToast('حدث خطأ أثناء حذف الموظف', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handlePasswordReset = async () => {
    if (!showPasswordForm || !newPassword) {
      showToast('يرجى إدخال كلمة المرور الجديدة', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
      return;
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const { error } = await supabase
        .from('employees')
        .update({ 
          password_hash: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', showPasswordForm.id);
      
      if (error) throw error;
      
      showToast('تم تغيير كلمة المرور بنجاح', 'success');
      setShowPasswordForm(null);
      setNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      showToast('حدث خطأ أثناء تغيير كلمة المرور', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ employee_number: '', name: '' });
    setShowForm(false);
    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h2>
            <p className="text-gray-600 text-sm">إضافة وتعديل وحذف بيانات الموظفين</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          إضافة موظف جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-gray-600 text-sm">إجمالي الموظفين</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{employees.filter(emp => emp.password_hash).length}</p>
              <p className="text-gray-600 text-sm">موظفين مسجلين</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{employees.filter(emp => !emp.password_hash).length}</p>
              <p className="text-gray-600 text-sm">بحاجة لكلمة مرور</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md border">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الرقم الوظيفي"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الرقم الوظيفي
                </label>
                <input
                  type="text"
                  value={formData.employee_number}
                  onChange={(e) => setFormData({...formData, employee_number: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${editingEmployee ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  required
                  disabled={!!editingEmployee}
                  placeholder="أدخل الرقم الوظيفي"
                />
                {editingEmployee && (
                  <p className="text-xs text-gray-500 mt-1">الرقم الوظيفي لا يمكن تعديله</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم الموظف
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="أدخل اسم الموظف"
                />
              </div>
            </div>
            
            {!editingEmployee && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>ملاحظة:</strong> سيتم إنشاء كلمة مرور افتراضية للموظف: <code className="bg-blue-100 px-1 rounded">123456</code>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                {editingEmployee ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرقم الوظيفي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم الموظف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حالة التسجيل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر دخول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الإضافة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العمليات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد موظفين مضافين بعد'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.employee_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.password_hash 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.password_hash ? 'مسجل' : 'غير مسجل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.last_login 
                        ? new Date(employee.last_login).toLocaleDateString('ar-EG')
                        : 'لم يسجل دخول'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employee.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="تعديل البيانات"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setShowPasswordForm(employee);
                          setNewPassword('');
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="تغيير كلمة المرور"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(employee)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="حذف الموظف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Dialog */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key className="w-5 h-5 text-green-600" />
                تغيير كلمة المرور
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                <strong>ملاحظة:</strong> سيتم إنشاء كلمة مرور افتراضية للموظف: <code className="bg-blue-100 px-1 rounded">123456</code><br/>
                <span className="text-xs">يمكن للموظف استخدام هذه الكلمة لتسجيل الدخول وتسجيل الحضور</span>
              </p>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="أدخل كلمة المرور الجديدة"
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">6 أحرف على الأقل</p>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handlePasswordReset}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                تغيير كلمة المرور
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(null);
                  setNewPassword('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="تأكيد حذف الموظف"
        message={`هل أنت متأكد من حذف الموظف "${confirmDelete?.name}"؟ سيتم حذف جميع البيانات المرتبطة به (حضور، سلف، مكافآت، خصومات، إجازات، عمل إضافي).`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        type="danger"
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default EmployeesView;