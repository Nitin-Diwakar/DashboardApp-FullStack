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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative bg-transparent text-foreground hover:bg-transparent dark:text-white"
                  >
                  <Bell className="h-5 w-5 text-inherit" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                <div className="flex items-center justify-between border-b p-2">
                  <h2 className="font-semibold">Notifications</h2>
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm text-muted-foreground bg-transparent dark:text-gray-300 hover:underline"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-2 border-b p-3 text-sm",
                          !notification.read && "bg-muted/50"
                        )}
                      >
                        <div className="flex-1">
                          <p>{notification.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {!notification.read && (
                              <Badge variant="outline" className="mr-1">
                                New
                              </Badge>
                            )}
                            Just now
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm bg-transparent text-black hover:underline dark:text-white dark:bg-transparent"
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
