import React, { useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Coffee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp && password !== confirmPassword) {
      showToast('كلمات المرور غير متطابقة', 'error');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
      setLoading(false);
      return;
    }

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showToast('بيانات الدخول غير صحيحة', 'error');
        } else if (error.message.includes('User already registered')) {
          showToast('هذا البريد الإلكتروني مسجل مسبقاً', 'error');
        } else if (error.message.includes('Email not confirmed')) {
          showToast('يرجى تأكيد البريد الإلكتروني أولاً', 'warning');
        } else {
          showToast(error.message, 'error');
        }
      } else {
        if (isSignUp) {
          showToast('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول', 'success');
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
        } else {
          showToast('مرحباً بك في نظام إدارة موظفين فلورينا كافي', 'success');
        }
      }
    } catch (error) {
      showToast('حدث خطأ غير متوقع', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Coffee className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">فلورينا كافي</h1>
          <p className="text-gray-600">نظام إدارة الموظفين</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            <p className="text-gray-600 text-center text-sm">
              {isSignUp 
                ? 'أدخل بياناتك لإنشاء حساب جديد' 
                : 'أدخل بياناتك للوصول إلى النظام'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل بريدك الإلكتروني"
                required
                disabled={loading}
              />
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
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={loading}
                  minLength={6}
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
              <p className="text-xs text-gray-500 mt-1">6 أحرف على الأقل</p>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أعد إدخال كلمة المرور"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={loading}
            >
              {isSignUp 
                ? 'لديك حساب بالفعل؟ سجل الدخول' 
                : 'ليس لديك حساب؟ أنشئ حساباً جديداً'
              }
            </button>
          </div>
        </div>

        {/* Demo Account Info */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">حساب تجريبي:</h3>
          <div className="text-xs text-amber-700 space-y-1">
            <p><strong>البريد:</strong> demo@florinacafe.com</p>
            <p><strong>كلمة المرور:</strong> demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;