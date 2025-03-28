import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/router';

// Mock the auth store
const mockUseAuthStore = jest.fn();
jest.mock('@/stores/authStore', () => ({
    useAuthStore: () => mockUseAuthStore(),
}));

// Mock the router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuthStore.mockReturnValue({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            clearError: jest.fn(),
        });
    });

    it('should redirect to login when not authenticated and auth is required', () => {
        renderHook(() => useAuth(true));
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should redirect to dashboard when authenticated and auth is not required', () => {
        mockUseAuthStore.mockReturnValue({
            user: null,
            token: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            clearError: jest.fn(),
        });
        renderHook(() => useAuth(false));
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should not redirect when loading', () => {
        mockUseAuthStore.mockReturnValue({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            clearError: jest.fn(),
        });
        renderHook(() => useAuth(true));
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('should return auth state', () => {
        const mockUser = { id: 1, email: 'test@example.com', full_name: 'Test User', role: 'user', is_active: true };
        mockUseAuthStore.mockReturnValue({
            user: mockUser,
            token: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            clearError: jest.fn(),
        });
        const { result } = renderHook(() => useAuth(true));
        expect(result.current).toEqual({
            isAuthenticated: true,
            isLoading: false,
            user: mockUser,
        });
    });
}); 