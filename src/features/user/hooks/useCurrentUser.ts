import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

export function useCurrentUser() {
  const { data: userData, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
    staleTime: 1000 * 60 * 60, 
    gcTime: 1000 * 60 * 60 * 24, 
  });

  const formattedUser = useMemo(() => {
      if (!userData) return { name: '', initials: '', email: '' };

      return {
          name: userData.username,
          email: userData.email, 
          initials: userData.username
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)
      };
  }, [userData]);

  return {
    user: formattedUser,
    isLoading,
  };
}