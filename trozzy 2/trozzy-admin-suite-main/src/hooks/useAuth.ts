import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getLoggedInUser, setLoggedInUser, AuthUser, initializeMockData } from '@/lib/mockData';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeMockData();
    const loggedInUser = getLoggedInUser();
    setUser(loggedInUser);
    setLoading(false);

    if (!loggedInUser && location.pathname !== '/sign-in') {
      navigate('/sign-in');
    }
  }, [navigate, location.pathname]);

  const logout = () => {
    setLoggedInUser(null);
    setUser(null);
    navigate('/sign-in');
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setLoggedInUser(updatedUser);
      setUser(updatedUser);
    }
  };

  return { user, loading, logout, updateUser, isAuthenticated: !!user };
};
