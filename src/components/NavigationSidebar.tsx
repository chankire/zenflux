import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Upload, 
  FileText, 
  Settings, 
  LogOut,
  DollarSign,
  BarChart3,
  Users,
  Shield
} from "lucide-react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    label: "Forex Analysis",
    href: "/forex",
    icon: TrendingUp,
    description: "Multi-currency analysis and hedging"
  },
  {
    label: "Data Upload",
    href: "/upload",
    icon: Upload,
    description: "Manual data entry and file uploads"
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
    description: "Financial reports and forecasts"
  },
  {
    label: "Cash Flow",
    href: "/cashflow",
    icon: DollarSign,
    description: "Cash flow management"
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Advanced financial analytics"
  },
  {
    label: "Team",
    href: "/team",
    icon: Users,
    description: "Team management and permissions"
  },
  {
    label: "Security",
    href: "/security",
    icon: Shield,
    description: "Security settings and compliance"
  }
];

const NavigationSidebar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground text-lg">FinanceAI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive ? "text-sidebar-primary" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
              )} />
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/80">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </Link>
        
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default NavigationSidebar;