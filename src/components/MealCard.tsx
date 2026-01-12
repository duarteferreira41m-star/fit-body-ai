import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Utensils, Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MealCardOption {
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: string[];
}

interface MealCardProps {
  name: string;
  time: string;
  options: MealCardOption[];
  isCompleted?: boolean;
  className?: string;
}

export function MealCard({
  name,
  time,
  options,
  isCompleted = false,
  className,
}: MealCardProps) {
  const defaultOption = options[0];
  const defaultValue = defaultOption?.label || "Opcao 1";

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
          <span className="font-bold">{defaultOption?.calories ?? 0}</span>
          <span className="text-xs">kcal</span>
        </div>
      </div>

      <Tabs defaultValue={defaultValue} className="space-y-3">
        <TabsList className="w-full justify-between">
          {options.map((option) => (
            <TabsTrigger key={option.label} value={option.label} className="flex-1">
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {options.map((option) => (
          <TabsContent key={option.label} value={option.label}>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">Proteina</p>
                <p className="font-bold text-foreground">{option.protein}g</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">Carbos</p>
                <p className="font-bold text-foreground">{option.carbs}g</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary">
                <p className="text-xs text-muted-foreground">Gordura</p>
                <p className="font-bold text-foreground">{option.fat}g</p>
              </div>
            </div>

            <div className="space-y-1">
              {option.foods.map((food, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {food}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}
