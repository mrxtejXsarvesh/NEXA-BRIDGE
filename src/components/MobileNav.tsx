import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Users, MessageSquare, Briefcase, Calendar, CalendarClock, User, LogOut, Settings, Sun, Moon, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from './NotificationBell';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'alumni', 'admin'] },
  { to: '/directory', label: 'Directory', icon: Users, roles: ['student', 'alumni', 'admin'] },
  { to: '/chat', label: 'Messages', icon: MessageSquare, roles: ['student', 'alumni', 'admin'] },
  { to: '/jobs', label: 'Jobs', icon: Briefcase, roles: ['student', 'alumni', 'admin'] },
  { to: '/events', label: 'Events', icon: Calendar, roles: ['student', 'alumni', 'admin'] },
  { to: '/appointments', label: 'Appointments', icon: CalendarClock, roles: ['student', 'alumni', 'admin'] },
  { to: '/institutions', label: 'Institutions', icon: Building2, roles: ['student', 'alumni', 'admin'] },
  { to: '/profile', label: 'Profile', icon: User, roles: ['student', 'alumni', 'admin'] },
  { to: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 border-b border-border glass">
        <h2 className="text-lg font-bold">Nexa<span className="text-primary">Bridge</span></h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <NotificationBell />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="p-3 border-b border-border space-y-1 glass">
          {navItems
            .filter(item => !role || item.roles.includes(role))
            .map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  location.pathname === item.to ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 text-sm text-destructive w-full">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </nav>
      )}
    </div>
  );
}
