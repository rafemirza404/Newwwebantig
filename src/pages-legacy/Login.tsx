import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import BrandingPanel from '@/components/auth/BrandingPanel';
const agentblueLogo = '/agentblue-logo.png';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormData) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      return;
    }
    navigate('/dashboard');
  };

  const handleGoogle = async () => {
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast({ title: 'Google sign in failed', description: error.message, variant: 'destructive' });
      setOauthLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* Left side: Branding Panel */}
      <BrandingPanel />

      {/* Right side: Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 2xl:px-24">

        {/* Mobile Header (hidden on large screens) */}
        <div className="lg:hidden flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-electric-blue rounded-lg flex items-center justify-center p-1">
              <img src={agentblueLogo} alt="AgentBlue" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <span className="text-xl font-bold text-slate-900">AgentBlue</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-sm">Your automation command center awaits.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-slate-700 text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                {...register('email')}
                className="mt-1.5 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-electric-blue focus-visible:border-electric-blue shadow-sm py-2.5"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">Password</Label>
                {/* <button type="button" className="text-electric-blue text-xs font-medium hover:text-blue-700">Forgot password?</button> */}
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-electric-blue focus-visible:border-electric-blue shadow-sm py-2.5 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-electric-blue hover:bg-blue-600 text-white font-medium py-2.5 shadow-sm transition-all"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-3 text-slate-400 font-medium">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={oauthLoading}
            onClick={handleGoogle}
            className="w-full bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium shadow-sm py-2.5"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {oauthLoading ? 'Redirecting...' : 'Continue with Google'}
          </Button>

          <p className="text-center text-slate-500 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-electric-blue hover:text-blue-700 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
