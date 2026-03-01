import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

type StepIndicatorProps = {
    currentStep: number;
    totalSteps: number;
    steps: string[];
};

export default function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
    return (
        <div className="flex items-center w-full max-w-sm mx-auto mb-8">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isPast = currentStep > stepNumber;

                return (
                    <div key={step} className="flex items-center relative flex-1 last:flex-none">
                        {/* Step Circle */}
                        <div className="relative flex flex-col items-center">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: isPast || isActive ? '#4F7CFF' : '#F1F5F9', // electric-blue or slate-100
                                    borderColor: isPast || isActive ? '#4F7CFF' : '#E2E8F0', // electric-blue or slate-200
                                    color: isPast || isActive ? '#FFFFFF' : '#94A3B8', // white or slate-400
                                }}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold z-10 transition-colors duration-300`}
                            >
                                {isPast ? <Check className="w-4 h-4" /> : stepNumber}
                            </motion.div>

                            {/* Step Label */}
                            <span
                                className={`absolute top-10 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-slate-900' : isPast ? 'text-slate-500' : 'text-slate-400'
                                    }`}
                            >
                                {step}
                            </span>
                        </div>

                        {/* Connecting Line */}
                        {index < totalSteps - 1 && (
                            <div className="flex-1 h-0.5 mx-2 bg-slate-200 relative">
                                <motion.div
                                    className="absolute top-0 left-0 h-full bg-electric-blue"
                                    initial={{ width: '0%' }}
                                    animate={{ width: isPast ? '100%' : '0%' }}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
