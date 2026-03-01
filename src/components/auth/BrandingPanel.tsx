import { Link } from 'react-router-dom';
const agentblueLogo = '/agentblue-logo.png';
import { motion } from 'framer-motion';

const float = (delay = 0) => ({
    animate: { y: [0, -8, 0] },
    transition: { repeat: Infinity, duration: 4, ease: 'easeInOut', delay },
});

export default function BrandingPanel() {
    return (
        <div className="hidden lg:flex flex-col justify-between w-[55%] bg-electric-blue p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-[40%] right-[5%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Top section: Logo */}
            <div className="relative z-10">
                <Link to="/" className="flex items-center gap-3 w-fit hover:opacity-90 transition-opacity">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-lg">
                        <img src={agentblueLogo} alt="AgentBlue" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">AgentBlue</span>
                </Link>
            </div>

            {/* Middle section: Value Prop */}
            <div className="relative z-10 max-w-lg mt-12 mb-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6"
                >
                    Stop losing revenue to operational chaos.
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-blue-100 text-lg md:text-xl leading-relaxed mb-12"
                >
                    The intelligent automation platform built exclusively for high-volume Solar & HVAC companies.
                </motion.p>

                {/* Floating Stat Bubbles */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                        transition={{
                            opacity: { delay: 0.4, duration: 0.5 },
                            x: { delay: 0.4, duration: 0.5 },
                            y: { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0 },
                        }}
                        className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-fit shadow-xl"
                    >
                        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl">
                            ⚡️
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg">94% Lead Capture</p>
                            <p className="text-blue-200 text-sm">Average across our clients</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                        transition={{
                            opacity: { delay: 0.5, duration: 0.5 },
                            x: { delay: 0.5, duration: 0.5 },
                            y: { repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1.5 },
                        }}
                        className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-fit shadow-xl ml-8"
                    >
                        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl">
                            ⏱️
                        </div>
                        <div>
                            <p className="text-white font-semibold text-lg">3s Response Time</p>
                            <p className="text-blue-200 text-sm">24/7 autonomous engagement</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom section: Minimal Footer / Link */}
            <div className="relative z-10 text-blue-200 text-sm flex gap-6">
                <span>© {new Date().getFullYear()} AgentBlue</span>
                <a href="mailto:sophia@supportagentblue.in" className="hover:text-white transition-colors">Contact Support</a>
            </div>
        </div>
    );
}
