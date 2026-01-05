import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Play, Clock, Flame } from "lucide-react";

interface ExerciseCardProps {
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  duration?: string;
  calories?: number;
  imageUrl?: string;
  isCompleted?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ExerciseCard({
  name,
  sets,
  reps,
  muscleGroup,
  duration,
  calories,
  imageUrl,
  isCompleted = false,
  onClick,
  className,
}: ExerciseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border border-border bg-card cursor-pointer transition-all duration-300 hover:border-primary/30 hover:bg-card/80",
        isCompleted && "opacity-60",
        className
      )}
    >
      {/* Exercise image or placeholder */}
      <div className="relative h-16 w-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Play className="h-6 w-6 text-primary" />
          </div>
        )}
        {isCompleted && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-success flex items-center justify-center">
              <span className="text-success-foreground text-xs">✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Exercise info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{name}</h4>
        <p className="text-sm text-muted-foreground">{muscleGroup}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-primary font-medium">
            {sets} séries × {reps}
          </span>
          {duration && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {duration}
            </span>
          )}
          {calories && (
            <span className="flex items-center gap-1 text-xs text-warning">
              <Flame className="h-3 w-3" />
              {calories} kcal
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
    </motion.div>
  );
}
