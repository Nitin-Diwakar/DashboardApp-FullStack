// src/layouts/DashboardLayout.tsx
import { useState, useEffect, Suspense } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  ListTodo,
  Database,
  Bell,
  Menu,
  X,
  Plane as Plant,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserButton, useUser } from "@clerk/clerk-react";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import CircularProgressComponent from "@/components/Spinner/CircularProgress";

const DashboardLayout = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<
    { id: number; message: string; read: boolean }[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mock notifications data - could be personalized based on user type
    const userType = user?.unsafeMetadata?.userType as string;
    
    setNotifications([
      {
        id: 1,
        message: "Soil Moisture Sensor 1 reading below threshold",
        read: false,
      },
      {
        id: 2,
        message: userType === 'farmer' 
          ? "Upcoming fertilizer application scheduled for tomorrow"
          : "System maintenance scheduled for weekend",
        read: false,
      },
      { id: 3, message: "Irrigation completed successfully", read: true },
    ]);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Show loading while user data loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgressComponent />
      </div>
    );
  }

  const NavItem = ({
    to,
    icon: Icon,
    label,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:bg-accent",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/schedule", icon: Calendar, label: "Schedule" },
    { to: "/activities", icon: ListTodo, label: "Activities" },
    { to: "/data", icon: Database, label: "Data" },
    { to: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress || 'User';
  };

  const getUserTypeDisplay = () => {
    const userType = user?.unsafeMetadata?.userType as string;
    return userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'User';
  };

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          {/* Header */}
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <Plant className="h-6 w-6" />
              <span className="text-lg">
                <span className="text-green-500">Agri</span>{" "}
                <span className="text-orange-500">NextGen</span>
              </span>
            </div>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>

          {/* User Info */}
          <div className="px-4 py-2">
            <div className="flex items-center gap-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{getUserTypeDisplay()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <div className="flex-1 px-3">
            <nav className="grid gap-1 text-sm font-medium">
              {navItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header & Content */}
      <div className="flex flex-col flex-1">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              {/* Mobile nav header */}
              <div className="flex items-center gap-2 font-semibold mb-4">
                <Plant className="h-6 w-6" />
                <span className="text-lg">
                  <span className="text-green-500">Agri</span>{" "}
                  <span className="text-orange-500">NextGen</span>
                </span>
              </div>

              {/* User info in mobile */}
              <div className="flex items-center gap-3 mb-4 p-2 rounded border">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{getUserTypeDisplay()}</p>
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Mobile navigation */}
              <nav className="grid gap-2 text-sm font-medium">
                {navItems.map((item) => (
                  <NavItem key={item.to} {...item} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            <div className="flex justify-between items-center">
              <div className="md:hidden">
                <span className="font-semibold text-lg">
                  <span className="text-green-500">Agri</span>{" "}
                  <span className="text-orange-500">NextGen</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Toggle notifications</span>
                </Button>
                <ModeToggle />
                <div className="hidden md:flex">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          <Suspense fallback={<CircularProgressComponent />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;