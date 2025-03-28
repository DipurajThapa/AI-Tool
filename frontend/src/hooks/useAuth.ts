import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = (requireAuth: boolean = true) => {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuthStore();

    useEffect(() => {
        if (!isLoading) {
            if (requireAuth && !isAuthenticated) {
                router.push('/login');
            } else if (!requireAuth && isAuthenticated) {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, requireAuth, router]);

    return {
        isAuthenticated,
        isLoading,
        user,
    };
}; 