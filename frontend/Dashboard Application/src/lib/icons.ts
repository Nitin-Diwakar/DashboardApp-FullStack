// Centralized icon exports for better performance
// Using standard lucide-react imports with tree-shaking

// Re-export commonly used icons to centralize imports
// This helps with tree-shaking while maintaining TypeScript compatibility
export {
  // Navigation icons
  LayoutDashboard,
  Calendar,
  ListTodo,
  Database,
  Settings,
  
  // UI interaction icons
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  
  // Dashboard and data icons
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  
  // Agriculture/irrigation specific icons
  Droplets,
  Thermometer,
  Cloud,
  CloudRain,
  Sun,
  Moon,
  Sprout,
  Leaf,
  
  // Status and alert icons
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  
  // Form and input icons
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  
  // User and auth icons
  User,
  UserPlus,
  Lock,
  Unlock,
  
  // Utility icons
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Copy,
  ExternalLink,
  
  // Theme toggle icons
  Monitor,
} from 'lucide-react';

// Use a plant/agriculture icon instead of Plane
export { Sprout as Plant } from 'lucide-react';
