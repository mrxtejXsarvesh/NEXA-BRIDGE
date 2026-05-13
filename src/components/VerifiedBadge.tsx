import { BadgeCheck, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  role?: string | null;
  studentBadge?: string | null;
  size?: number;
}

const badgeConfig: Record<string, { emoji: string; label: string; color: string }> = {
  gold: { emoji: '🥇', label: 'Gold Student', color: '#FFD700' },
  silver: { emoji: '🥈', label: 'Silver Student', color: '#C0C0C0' },
  bronze: { emoji: '🥉', label: 'Bronze Student', color: '#CD7F32' },
};

export default function VerifiedBadge({ role, studentBadge, size = 14 }: VerifiedBadgeProps) {
  const roleBadge = role === 'admin' ? 'Verified Admin' : role === 'alumni' ? 'Verified Alumni' : null;
  const sBadge = studentBadge ? badgeConfig[studentBadge] : null;

  return (
    <TooltipProvider>
      <span className="inline-flex items-center gap-0.5 shrink-0">
        {roleBadge && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="inline-flex shrink-0 cursor-default items-center"
                style={{ color: role === 'admin' ? 'hsl(var(--primary))' : 'hsl(var(--accent))' }}
                aria-label={roleBadge}
              >
                <BadgeCheck style={{ width: size, height: size }} />
              </span>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{roleBadge}</p></TooltipContent>
          </Tooltip>
        )}
        {sBadge && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex shrink-0 cursor-default text-xs leading-none" aria-label={sBadge.label}>
                {sBadge.emoji}
              </span>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{sBadge.label}</p></TooltipContent>
          </Tooltip>
        )}
      </span>
    </TooltipProvider>
  );
}
