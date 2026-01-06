import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Utensils, Flame } from "lucide-react";

interface MealCardProps {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: string[];
  isCompleted?: boolean;
  className?: string;
}

export function MealCard({
  name,
  time,
  calories,
  protein,
  carbs,
  fat,
  foods,
  isCompleted = false,
  className,
}: MealCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl border border-border bg-card transition-all duration-300",
        isCompleted && "border-success/30 bg-success/5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center",
              isCompleted ? "bg-success/10" : "bg-primary/10"
            )}
          >
            <Utensils className={cn("h-5 w-5", isCompleted ? "text-success" : "text-primary")} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {time}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-warning">
          <Flame className="h-4 w-4" />
          <span className="font-bold">{calories}</span>
          <span className="text-xs">kcal</span>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-secondary">
          <p className="text-xs text-muted-foreground">Proteína</p>
          <p className="font-bold text-foreground">{protein}g</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary">
          <p className="text-xs text-muted-foreground">Carbos</p>
          <p className="font-bold text-foreground">{carbs}g</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-secondary">
          <p className="text-xs text-muted-foreground">Gordura</p>
          <p className="font-bold text-foreground">{fat}g</p>
        </div>
      </div>

      {/* Foods list */}
      <div className="space-y-1">
        {foods.map((food, index) => (
          <div
            key={index}
            className="text-sm text-muted-foreground flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {food}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
