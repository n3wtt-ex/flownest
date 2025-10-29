import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";


interface HexIconProps extends HTMLMotionProps<"button"> {
  selected?: boolean;
  glow?: boolean;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export function HexIcon({ selected, glow, title, Icon, className, ...props }: HexIconProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      aria-label={title}
      className={cn(
        "relative isolate grid place-items-center w-16 h-16 rounded-[12%] [clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]",
        "border bg-white/30 dark:bg-gray-800/30 backdrop-blur",
        "border-[hsl(var(--brand-yellow,46_100%_65%))] dark:border-yellow-500/50",
        selected ? "ring-2 ring-primary dark:ring-cyan-400" : "ring-0",
        glow ? "shadow-glow" : "",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -z-10 rounded-[12%] [clip-path:inherit] bg-gray-200/20 dark:bg-gray-700/20" />
      <Icon className="w-6 h-6 text-gray-900 dark:text-white" />
    </motion.button>
  );
}
