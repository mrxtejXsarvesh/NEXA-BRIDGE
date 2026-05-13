import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, Briefcase, Calendar, CalendarClock, User, LogOut, Settings, Sun, Moon, PanelLeftClose, PanelLeft, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import NotificationBell from './NotificationBell';
import VerifiedBadge from './VerifiedBadge';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'alumni', 'admin', 'institution'] },
  { to: '/directory', label: 'Alumni Directory', icon: Users, roles: ['student', 'alumni', 'admin', 'institution'] },
  { to: '/chat', label: 'Messages', icon: MessageSquare, roles: ['student', 'alumni', 'admin', 'institution'] },
  { to: '/jobs', label: 'Jobs & Internships', icon: Briefcase, roles: ['student', 'alumni', 'admin', 'institution'] },
  { to: '/events', label: 'Events', icon: Calendar, roles: ['student', 'alumni', 'admin', 'institution'] },
  { to: '/appointments', label: 'Appointments', icon: CalendarClock, roles: ['student', 'alumni', 'admin', 'institution'] },
  { to: '/institutions', label: 'Institutions', icon: Building2, roles: ['student', 'alumni', 'admin', 'institution'] },
  { to: '/profile', label: 'My Profile', icon: User, roles: ['student', 'alumni', 'admin', 'institution'] },
  { to: '/admin', label: 'Admin Panel', icon: Settings, roles: ['admin'] },
];

export default function AppSidebar() {
  const { profile, role, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={`hidden md:flex flex-col min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        {/* Header */}
        <div className={`p-3 border-b border-sidebar-border flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold">
                Nexa<span className="text-sidebar-primary">Bridge</span>
              </h2>
              <p className="text-xs text-sidebar-foreground/60 mt-0.5">Alumni Connection Engine</p>
            </div>
          )}
          <div className={`flex items-center ${collapsed ? '' : 'gap-1'}`}>
            {!collapsed && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <NotificationBell />
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems
            .filter(item => !role || item.roles.includes(role))
            .map(item => {
              const isActive = location.pathname === item.to;
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-primary/20 text-sidebar-primary shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.to}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right"><p>{item.label}</p></TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
        </nav>

        {/* Footer */}
        <div className={`p-3 border-t border-sidebar-border ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/60" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-default">
                    {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'User'} /> : null}
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right"><p>{profile?.full_name || 'User'}</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/60" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Sign Out</p></TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-9 w-9">
                  {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'User'} /> : null}
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                    <VerifiedBadge role={role} studentBadge={(profile as any)?.student_badge} />
                  </div>
                  <p className="text-xs text-sidebar-foreground/50 capitalize">{role || 'member'}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
