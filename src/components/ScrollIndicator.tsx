import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export const ScrollIndicator = () => {
  return (
    <div className="md:hidden flex items-center justify-center gap-2 mb-4 text-muted-foreground text-sm">
      <motion.div
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex items-center gap-1"
      >
        <span>Swipe to explore</span>
        <ChevronRight className="w-4 h-4" />
      </motion.div>
    </div>
  );
};

export const HorizontalScrollGradient = () => {
  return (
    <>
      {/* Left fade gradient */}
      <div className="md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-secondary/30 to-transparent pointer-events-none z-10" />
      {/* Right fade gradient */}
      <div className="md:hidden absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-secondary/30 via-secondary/30 to-transparent pointer-events-none z-10" />
    </>
  );
};
