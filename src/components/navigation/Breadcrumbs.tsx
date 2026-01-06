import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-2 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(
                isLast ? "text-gray-900 font-medium" : "text-gray-500"
              )}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight size={14} className="text-gray-400" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

