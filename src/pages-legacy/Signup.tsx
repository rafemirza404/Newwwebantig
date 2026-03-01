import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandingPanel from '@/components/auth/BrandingPanel';
import StepIndicator from '@/components/auth/StepIndicator';
const agentblueLogo = '/agentblue-logo.png';

// Validation schemas for each step
const step1Schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const step2Schema = z.object({
  companyName: z.string().min(1, 'Enter your company name'),
  industry: z.enum(['solar', 'hvac', 'both'], { required_error: 'Select your industry' }),
});

const combinedSchema = step1Schema.merge(step2Schema);
type FormData = z.infer<typeof combinedSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(combinedSchema),
    mode: "onTouched"
  });

  const industry = watch('industry');

  const onNextStep = async () => {
    const isStep1Valid = await trigger(['fullName', 'email', 'password']);
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          company_name: data.companyName,
          industry: data.industry,
        },
      },
    });

    if (error) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
      return;
    }

    // Success step
    setStep(3);
  };

  // Handle auto-redirect on step 3
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        navigate('/onboarding');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const handleGoogle = async () => {
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboarding` },
    });
    if (error) {
      toast({ title: 'Google sign up failed', description: error.message, variant: 'destructive' });
      setOauthLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <BrandingPanel />

      <div className="flex-1 flex flex-col px-6 py-12 lg:px-16 2xl:px-24">

        {/* Mobile Header (hidden on large screens) */}
        <div className="lg:hidden flex justify-center mb-10 mt-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-electric-blue rounded-lg flex items-center justify-center p-1">
              <img src={agentblueLogo} alt="AgentBlue" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <span className="text-xl font-bold text-slate-900">AgentBlue</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center pb-20">

          {step < 3 && (
            <StepIndicator
              currentStep={step}
              totalSteps={2}
              steps={['Account', 'Company']}
            />
          )}

          <AnimatePresence mode="wait">

            {/* STEP 1: Account */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Create your account</h1>
                  <p className="text-slate-500 text-sm font-medium">Step 1 of 2: Let's get to know you</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="fullName" className="text-slate-700 text-sm font-medium">Full Name</Label>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="Jane Smith"
                        {...register('fullName')}
                        className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-electric-blue shadow-sm py-2.5"
                      />
                    </div>
                    {errors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-700 text-sm font-medium">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      {...register('email')}
                      className="mt-1.5 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-electric-blue shadow-sm py-2.5"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-slate-700 text-sm font-medium">Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        {...register('password')}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-electric-blue shadow-sm py-2.5 pr-10"
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
                    type="button"
                    onClick={onNextStep}
                    className="w-full bg-electric-blue hover:bg-blue-600 text-white font-medium py-2.5 shadow-sm mt-4 transition-all"
                  >
                    Continue
                  </Button>
                </div>

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
                  Already have an account?{' '}
                  <Link to="/login" className="text-electric-blue hover:text-blue-700 font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* STEP 2: Company */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-slate-400 hover:text-slate-600 p-1 -ml-2 rounded-md hover:bg-slate-100 transition-colors"
                      aria-label="Go back"
                    >
                      ←
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your business</h1>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Step 2 of 2: Almost done</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="companyName" className="text-slate-700 text-sm font-medium">Company Name</Label>
                    <div className="relative mt-1.5">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input
                        id="companyName"
                        type="text"
                        autoComplete="organization"
                        placeholder="Sunshine Solar LLC"
                        {...register('companyName')}
                        className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-electric-blue shadow-sm py-2.5"
                      />
                    </div>
                    {errors.companyName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.companyName.message}</p>}
                  </div>

                  <div>
                    <Label className="text-slate-700 text-sm font-medium mb-1.5 block">Industry</Label>
                    <Select
                      value={industry}
                      onValueChange={(val: 'solar' | 'hvac' | 'both') => {
                        setValue('industry', val, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className="w-full bg-white border-slate-200 text-slate-900 focus:ring-electric-blue shadow-sm py-2.5">
                        <SelectValue placeholder="Select your industry" className="text-slate-400" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 shadow-lg">
                        <SelectItem value="solar" className="text-slate-700 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">Solar</SelectItem>
                        <SelectItem value="hvac" className="text-slate-700 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">HVAC</SelectItem>
                        <SelectItem value="both" className="text-slate-700 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">Solar & HVAC</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.industry && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.industry.message}</p>}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-electric-blue hover:bg-blue-600 text-white font-medium py-2.5 shadow-sm transition-all"
                    >
                      {isSubmitting ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 3: Success & Redirecting */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                  className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </motion.div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                  Account Created!
                </h2>

                <p className="text-slate-500 text-base mb-8 max-w-[280px]">
                  Welcome to AgentBlue. Let's get your business automated.
                </p>

                <div className="flex items-center gap-3 text-sm text-slate-400 font-medium bg-slate-100/50 px-4 py-2 rounded-full">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-electric-blue rounded-full animate-spin" />
                  Heading to your setup...
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
