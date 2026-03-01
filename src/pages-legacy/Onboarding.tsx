import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Activity, Rocket } from 'lucide-react';

export default function Onboarding() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'there';

    const handleStart = () => {
        setLeaving(true);
        setTimeout(() => navigate('/dashboard'), 320);
    };

    const handleSkip = () => {
        setLeaving(true);
        setTimeout(() => navigate('/dashboard'), 320);
    };

    return (
        <motion.div
            animate={{ opacity: leaving ? 0 : 1, y: leaving ? -12 : 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-slate-50 flex flex-col font-sans"
        >

            {/* Simple Header */}
            <header className="px-8 py-6 flex justify-between items-center border-b border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 tracking-tight">AgentBlue Setup</span>
                    <span className="text-xs text-slate-500">Welcome process</span>
                </div>

                {/* Progress Strip */}
                <div className="hidden md:flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        Account
                    </div>
                    <div className="w-8 h-px bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-slate-900 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full border-2 border-electric-blue flex items-center justify-center text-electric-blue text-[10px] font-bold">2</div>
                        Audit
                    </div>
                    <div className="w-8 h-px bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold">3</div>
                        Strategy
                    </div>
                </div>

                <button
                    onClick={handleSkip}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Skip for now
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="max-w-xl w-full">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-12"
                    >
                        {/* Sophia Avatar */}
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-blue-100">
                            <Bot className="w-8 h-8 text-electric-blue" />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
                            Hey {firstName}! I'm Sophia 🤖
                        </h1>

                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                            I'm going to guide you through a quick operations audit. We'll identify exactly where your business is leaking revenue and how to fix it with automation.
                        </p>

                        {/* What to expect cards */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-10">
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3">
                                <Activity className="w-5 h-5 text-electric-blue shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-slate-900 font-semibold text-sm mb-1">8 quick questions</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">About your lead flow, operations, and current bottlenecks.</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3">
                                <Rocket className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-slate-900 font-semibold text-sm mb-1">Instant blueprint</h3>
                                    <p className="text-slate-500 text-xs leading-relaxed">Get a personalized roadmap showing your exact ROI potential.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={handleStart}
                                className="w-full sm:w-auto text-base bg-[#4F7CFF] hover:bg-blue-600 text-white font-medium px-8 py-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all outline-none"
                            >
                                Start My Free Audit
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>

                    </motion.div>

                    {/* Trust indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                            Takes less than 2 minutes • No commitment required
                        </p>
                    </motion.div>

                </div>
            </main>
        </motion.div>
    );
}
