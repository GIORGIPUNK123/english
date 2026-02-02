import {
  Info,
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Calendar,
  Users,
  Award,
} from 'lucide-react';

export const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  course: BookOpen,
  assignment: FileText,
  calendar: Calendar,
  group: Users,
  achievement: Award,
};

export const DefaultIcon = Info;

export const colorMap = {
  info: 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  success:
    'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  warning:
    'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  course:
    'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  assignment:
    'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  calendar: 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  group: 'bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400',
  achievement:
    'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

export const defaultColor = 'bg-gray-500/10 text-gray-400';
