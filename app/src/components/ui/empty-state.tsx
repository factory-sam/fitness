import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-6" : "py-10"}`}
    >
      <span className={`font-mono opacity-20 ${compact ? "text-xl mb-2" : "text-2xl mb-3"}`}>
        {icon}
      </span>
      <p className="font-mono text-sm text-text-secondary">{title}</p>
      <p className="font-mono text-xs text-text-muted mt-1 max-w-xs">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-4">
          {action &&
            (action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold text-bg font-mono text-xs font-semibold rounded-md hover:bg-gold-bright transition-colors"
              >
                {action.label} <span aria-hidden>→</span>
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold text-bg font-mono text-xs font-semibold rounded-md hover:bg-gold-bright transition-colors"
              >
                {action.label}
              </button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="font-mono text-xs text-text-muted hover:text-gold transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="font-mono text-xs text-text-muted hover:text-gold transition-colors"
              >
                {secondaryAction.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
