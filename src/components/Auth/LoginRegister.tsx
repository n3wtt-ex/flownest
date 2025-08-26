import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess(false);
    // Form değişiminde alanları temizle
    setEmail('');
    setPassword('');
    setFullName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        navigate('/');
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Başarılı kayıt sonrasında alanları temizle
        setEmail('');
        setPassword('');
        setFullName('');
      }
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-foreground">
              Kayıt başarılı!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.
            </p>
            <button
              onClick={toggleForm}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:scale-110">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Veya{' '}
            <button
              onClick={toggleForm}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none transition-colors duration-300"
            >
              {isLogin ? 'yeni hesap oluşturun' : 'mevcut hesabınızla giriş yapın'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl transition-all duration-500 border border-border" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg transition-all duration-300 animate-pulse">
              {error}
            </div>
          )}
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={!isLogin}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm transition-all duration-300"
                    placeholder="Ad ve soyadınızı girin"
                  />
                </div>
              </div>
            )}
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                E-posta adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete={isLogin ? "email" : "off"}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 appearance-none relative block w-full px-3 py-3 border border-border placeholder-muted-foreground text-foreground bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm transition-all duration-300"
                  placeholder="E-posta adresinizi girin"
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 appearance-none relative block w-full px-3 py-3 pr-12 border border-border placeholder-muted-foreground text-foreground bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:z-10 sm:text-sm transition-all duration-300"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Giriş yapılıyor...' : 'Hesap oluşturuluyor...'}
                </span>
              ) : (
                isLogin ? 'Giriş Yap' : 'Hesap Oluştur'
              )}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 CRM Platform. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}