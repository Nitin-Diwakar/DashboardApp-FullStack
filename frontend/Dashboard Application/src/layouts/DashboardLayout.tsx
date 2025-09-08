import { useState, useEffect } from "react";
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
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<
    { id: number; message: string; read: boolean }[]
  >([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mock notifications data
    setNotifications([
      {
        id: 1,
        message: "Soil Moisture Sensor 1 reading below threshold",
        read: false,
      },
      {
        id: 2,
        message: "Upcoming fertilizer application scheduled for tomorrow",
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
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
            : "text-muted-foreground"
        )
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );

  const NavItems = () => (
    <>
      <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
      <NavItem to="/schedule" icon={Calendar} label="Schedule" />
      <NavItem to="/activities" icon={ListTodo} label="Activities" />
      <NavItem to="/data" icon={Database} label="Data" />
      <NavItem to="/settings" icon={SettingsIcon} label="Settings" />
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4">
          {/* <Plant className="h-6 w-6 text-green-600 mr-2" /> */}
          <span className="font-semibold text-lg">
            <span className="text-green-500">Agri</span>{" "}
            <span className="text-orange-500">NextGen</span>
          </span>
        </div>
        <div className="flex-1 overflow-auto py-4 px-3">
          <nav className="grid gap-1">
            <NavItems />
          </nav>
        </div>
        <div className="border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0">
                <div className="flex h-14 items-center border-b px-4">
                  <Plant className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-semibold text-lg">AgriBolt</span>
                </div>
                <nav className="grid gap-1 p-4">
                  <NavItems />
                </nav>
                <Separator />
                <div className="p-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex-1 md:ml-0">
            <h1 className="text-lg font-semibold md:hidden">
              <span className="text-green-500">Agri</span>{" "}
              <span className="text-orange-500">NextGen</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Fixed Bell Icon with proper notification badge */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {/* Bell Icon - Fixed sizing and positioning */}
                  <Bell className="h-4 w-4 text-foreground" />
                  
                  {/* Notification Badge - Fixed positioning and z-index */}
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 h-5 w-5 min-w-[20px] rounded-full border-2 border-background p-0 text-xs font-bold flex items-center justify-center z-10"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">View notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-[350px] p-0 rounded-lg border bg-popover text-popover-foreground shadow-lg"
                sideOffset={5}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h2 className="font-semibold">Notifications</h2>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-primary hover:bg-accent hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifications(notifications.map(n => ({ ...n, read: true })));
                      }}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem 
                        key={notification.id}
                        className={cn(
                          "flex flex-col items-start gap-1 p-3 border-b cursor-pointer",
                          !notification.read && "bg-accent/50",
                          "hover:bg-accent focus:bg-accent"
                        )}
                        onClick={() => {
                          if (!notification.read) {
                            setNotifications(notifications.map(n => 
                              n.id === notification.id ? { ...n, read: true } : n
                            ));
                          }
                        }}
                      >
                        <p className="text-sm">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            Just now
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-sm hover:bg-accent hover:text-foreground"
                    onClick={() => navigate('/notifications')}
                  >
                    View all notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <ModeToggle />
            <span className="hidden md:inline text-sm">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;