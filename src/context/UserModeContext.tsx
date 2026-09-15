import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { UserDataT } from '../types';

type UserMode = 'student' | 'teacher';

interface UserModeContextType {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  canSwitchToTeacher: boolean;
  initializeUserMode: (userData: UserDataT | null) => void;
}

const UserModeContext = createContext<UserModeContextType | undefined>(
  undefined,
);

export const UserModeProvider = ({ children }: { children: ReactNode }) => {
  const [userMode, setUserModeState] = useState<UserMode>('student');
  const [canSwitchToTeacher, setCanSwitchToTeacher] = useState(false);

  // Initialize user mode based on userData
  const initializeUserMode = useCallback((userData: UserDataT | null) => {
    if (!userData) {
      setUserModeState('student');
      setCanSwitchToTeacher(false);
      return;
    }

    // Teacher mode when role is granted or english-backend marked application approved
    const isTeacher =
      userData.roles?.teacher === true ||
      userData.teacher_status === 'approved';
    setCanSwitchToTeacher(isTeacher);

    // Get saved preference from localStorage
    const savedMode = localStorage.getItem('userMode') as UserMode | null;

    // Set default mode: teacher if they have teacher role, otherwise student
    if (savedMode && (savedMode === 'student' || (savedMode === 'teacher' && isTeacher))) {
      setUserModeState(savedMode);
    } else if (isTeacher) {
      setUserModeState('teacher');
    } else {
      setUserModeState('student');
    }
  }, []);

  // Update localStorage when mode changes
  const setUserMode = useCallback((mode: UserMode) => {
    setUserModeState(mode);
    localStorage.setItem('userMode', mode);
  }, []);

  const value = useMemo(
    () => ({
      userMode,
      setUserMode,
      canSwitchToTeacher,
      initializeUserMode,
    }),
    [userMode, setUserMode, canSwitchToTeacher, initializeUserMode],
  );

  return (
    <UserModeContext.Provider value={value}>{children}</UserModeContext.Provider>
  );
};

export const useUserMode = () => {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
};
