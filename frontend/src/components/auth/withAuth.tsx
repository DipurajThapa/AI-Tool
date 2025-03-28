import { ComponentType } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

export function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    requireAuth: boolean = true
) {
    return function WithAuthComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuth(requireAuth);

        if (isLoading) {
            return (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="100vh"
                >
                    <CircularProgress />
                </Box>
            );
        }

        if (requireAuth && !isAuthenticated) {
            return null;
        }

        if (!requireAuth && isAuthenticated) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
} 