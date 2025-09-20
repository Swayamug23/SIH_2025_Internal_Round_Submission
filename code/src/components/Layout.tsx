import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Beef, 
  Pill, 
  FileText, 
  Stethoscope,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import farmHero from '@/assets/farm-hero.jpg';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <>{children}</>;
  }

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Beef, label: 'Animals', href: '/animals' },
    { icon: FileText, label: 'Reports', href: '/reports' },
    { icon: Stethoscope, label: 'Treatments', href: '/treatments' },
    ...(user.role === 'Manager' ? [
      { icon: Pill, label: 'Drugs', href: '/drugs' },
      { icon: Users, label: 'Users', href: '/users' },
    ] : []),
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <Sidebar className="bg-gradient-sidebar border-r shadow-soft">
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-4 py-3">
              <Beef className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-sidebar-foreground">LiveStock Portal</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.href)}
                    isActive={location.pathname === item.href}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gradient-primary shadow-soft border-b relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{ backgroundImage: `url(${farmHero})` }}
            />
            <div className="relative flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-primary-foreground lg:hidden" />
                <div className="hidden lg:block">
                  <h1 className="text-xl font-semibold text-primary-foreground">
                    Livestock Management Portal
                  </h1>
                  <p className="text-primary-foreground/80 text-sm">
                    Monitor and manage your farm operations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/20">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-primary-foreground/80">{user.role}</div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;