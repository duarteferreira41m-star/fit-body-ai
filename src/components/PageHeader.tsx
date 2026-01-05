import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  rightElement?: React.ReactNode;
}

export function PageHeader({ title, subtitle, className, rightElement }: PageHeaderProps) {
  return (
    <header className={cn("px-4 pt-12 pb-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground tracking-wide">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {rightElement}
      </div>
    </header>
  );
}
