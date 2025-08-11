import React, { useState } from 'react';
import { UserPlus, User, Eye, EyeOff, Coffee, ArrowRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import bcrypt from 'bcryptjs';

interface EmployeeRegistrationProps {
  onBackToLogin: () => void;
  onRegistrationSuccess: () => void;
}

const EmployeeRegistration: React.FC<EmployeeRegistrationProps> = ({ 
  onBackToLogin, 
  onRegistrationSuccess 
}) => {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { showToast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.employeeNumber.trim()) {
      showToast('يرجى إدخال الرقم الوظيفي', 'warning');
      return false;
    }
    if (!formData.name.trim()) {
      showToast('يرجى إدخال الاسم', 'warning');
      return false;
    }
    if (formData.name.trim().length < 2) {
      showToast('الاسم يجب أن يكون حرفين على الأقل', 'warning');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      showToast('يرجى إدخال كلمة المرور', 'warning');
      return false;
    }
    if (formData.password.length < 6) {
      showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'warning');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast('كلمات المرور غير متطابقة', 'error');
      return false;
    }
    return true;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      
      // التحقق من عدم وجود الرقم الوظيفي مسبقاً
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_number')
          .eq('employee_number', formData.employeeNumber.trim())
          .single();

        if (data) {
          showToast('الرقم الوظيفي موجود مسبقاً', 'error');
          setLoading(false);
          return;
        }
        
        setStep(2);
      } catch (error) {
        // إذا لم يجد الرقم، فهذا جيد
        setStep(2);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setLoading(true);

    try {
      // تشفير كلمة المرور
      const hashedPassword = await bcrypt.hash(formData.password, 10);

      // إضافة الموظف الجديد
      const { error } = await supabase
        .from('employees')
        .insert({
          employee_number: formData.employeeNumber.trim(),
          name: formData.name.trim(),
          password_hash: hashedPassword
        });

      if (error) {
        if (error.code === '23505') {
          showToast('الرقم الوظيفي موجود مسبقاً', 'error');
        } else {
          throw error;
        }
        return;
      }

      showToast('تم تسجيل الموظف بنجاح! يمكنك الآن تسجيل الدخول', 'success');
      onRegistrationSuccess();
    } catch (error) {
      showToast('حدث خطأ أثناء التسجيل', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return { text: 'ضعيفة جداً', color: 'text-red-600' };
      case 2: return { text: 'ضعيفة', color: 'text-orange-600' };
      case 3: return { text: 'متوسطة', color: 'text-yellow-600' };
      case 4: return { text: 'قوية', color: 'text-blue-600' };
      case 5: return { text: 'قوية جداً', color: 'text-green-600' };
      default: return { text: '', color: '' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full mb-4 shadow-lg">
            <Coffee className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">فلورينا كافي</h1>
          <p className="text-gray-600">تسجيل موظف جديد</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>البيانات الأساسية</span>
            <span>كلمة المرور</span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {step === 1 ? 'البيانات الأساسية' : 'إعداد كلمة المرور'}
            </h2>
            <p className="text-gray-600 text-center text-sm">
              {step === 1 
                ? 'أدخل بياناتك الأساسية للتسجيل' 
                : 'اختر كلمة مرور قوية لحسابك'
              }
            </p>
          </div>

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Employee Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرقم الوظيفي
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.employeeNumber}
                      onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                      className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="أدخل رقمك الوظيفي"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">الرقم الذي حصلت عليه من الإدارة</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="أدخل اسمك الكامل"
                    required
                    disabled={loading}
                    minLength={2}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="أدخل كلمة مرور قوية"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength <= 1 ? 'bg-red-500' :
                              passwordStrength === 2 ? 'bg-orange-500' :
                              passwordStrength === 3 ? 'bg-yellow-500' :
                              passwordStrength === 4 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${strengthInfo.color}`}>
                          {strengthInfo.text}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-emerald-500'
                      }`}
                      placeholder="أعد إدخال كلمة المرور"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-600 text-xs mt-1">كلمات المرور غير متطابقة</p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <h4 className="font-semibold text-emerald-800 mb-2">ملخص البيانات:</h4>
                  <div className="text-sm text-emerald-700 space-y-1">
                    <p><strong>الرقم الوظيفي:</strong> {formData.employeeNumber}</p>
                    <p><strong>الاسم:</strong> {formData.name}</p>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {step === 1 ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg"
                  >
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        التالي
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    disabled={loading}
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg"
                  >
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        إنشاء الحساب
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    disabled={loading}
                  >
                    السابق
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <button
              onClick={onBackToLogin}
              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors"
              disabled={loading}
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">🔒 ملاحظة أمنية:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• احتفظ بكلمة المرور في مكان آمن</p>
            <p>• لا تشارك بياناتك مع أي شخص آخر</p>
            <p>• يمكنك تغيير كلمة المرور لاحقاً من الإعدادات</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistration;