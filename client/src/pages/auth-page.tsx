import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { MessageSquare } from "lucide-react";

enum AuthView {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD
}

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>(AuthView.LOGIN);
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="w-full mx-auto bg-white min-h-screen max-w-md shadow-md">
      <header className="p-6 bg-primary text-white">
        <div className="flex justify-center items-center space-x-2">
          <MessageSquare className="h-8 w-8" />
          <h1 className="text-2xl font-bold font-heading">Amour Lingua</h1>
        </div>
        <p className="text-center mt-2 text-sm text-white/80">Love speaks all languages</p>
      </header>

      <main className="flex-1 p-6">
        {currentView === AuthView.LOGIN && (
          <LoginForm 
            onRegisterClick={() => setCurrentView(AuthView.REGISTER)}
            onForgotPasswordClick={() => setCurrentView(AuthView.FORGOT_PASSWORD)}
          />
        )}
        
        {currentView === AuthView.REGISTER && (
          <RegisterForm 
            onLoginClick={() => setCurrentView(AuthView.LOGIN)} 
          />
        )}
        
        {currentView === AuthView.FORGOT_PASSWORD && (
          <ForgotPasswordForm 
            onLoginClick={() => setCurrentView(AuthView.LOGIN)} 
          />
        )}
      </main>
    </div>
  );
}
