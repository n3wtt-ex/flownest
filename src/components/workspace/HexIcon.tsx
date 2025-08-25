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
        "border bg-card/30 backdrop-blur",
        "border-[hsl(var(--brand-yellow,46_100%_65%))]",
        selected ? "ring-2 ring-primary" : "ring-0",
        glow ? "shadow-glow" : "",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -z-10 rounded-[12%] [clip-path:inherit] bg-secondary/20" />
      <Icon className="w-6 h-6 text-foreground" />
    </motion.button>
  );
}
