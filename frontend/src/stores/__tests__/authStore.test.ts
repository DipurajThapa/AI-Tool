import { useAuthStore } from '../authStore';
import { authApi } from '@/services/api';

// Mock the auth API
jest.mock('@/services/api', () => ({
    authApi: {
        login: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
    },
}));

describe('useAuthStore', () => {
    const mockToken = 'mock-token';
    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        useAuthStore.setState({
            isAuthenticated: false,
            token: null,
            user: null,
            error: null,
        });
    });

    it('should initialize with default state', () => {
        const state = useAuthStore.getState();
        expect(state).toMatchObject({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
        // Verify that the functions exist without checking their implementation
        expect(typeof state.login).toBe('function');
        expect(typeof state.register).toBe('function');
        expect(typeof state.logout).toBe('function');
        expect(typeof state.clearError).toBe('function');
    });

    it('should handle successful login', async () => {
        authApi.login.mockResolvedValueOnce({
            data: { token: mockToken, user: mockUser },
        });

        await useAuthStore.getState().login('test@example.com', 'password');

        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().token).toBe(mockToken);
        expect(useAuthStore.getState().user).toEqual(mockUser);
        expect(useAuthStore.getState().error).toBeNull();
    });

    it('should handle login error', async () => {
        const error = new Error('Invalid credentials');
        authApi.login.mockRejectedValueOnce(error);

        await useAuthStore.getState().login('wrong@example.com', 'wrongpass');

        expect(localStorage.getItem('token')).toBeNull();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().token).toBeNull();
        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().error).toBe(error.message);
    });

    it('should handle successful registration', async () => {
        authApi.register.mockResolvedValueOnce({
            data: { token: mockToken, user: mockUser },
        });

        await useAuthStore.getState().register('test@example.com', 'password', 'Test User');

        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().token).toBe(mockToken);
        expect(useAuthStore.getState().user).toEqual(mockUser);
        expect(useAuthStore.getState().error).toBeNull();
    });

    it('should handle registration error', async () => {
        const error = new Error('Email already exists');
        authApi.register.mockRejectedValueOnce(error);

        await useAuthStore.getState().register('existing@example.com', 'password', 'Test User');

        expect(localStorage.getItem('token')).toBeNull();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().token).toBeNull();
        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().error).toBe(error.message);
    });

    it('should handle successful logout', async () => {
        // First login
        authApi.login.mockResolvedValueOnce({
            data: { token: mockToken, user: mockUser },
        });
        await useAuthStore.getState().login('test@example.com', 'password');

        // Then logout
        await useAuthStore.getState().logout();

        expect(localStorage.getItem('token')).toBeNull();
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().token).toBeNull();
        expect(useAuthStore.getState().user).toBeNull();
        expect(useAuthStore.getState().error).toBeNull();
    });

    it('should initialize from localStorage', () => {
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));

        useAuthStore.getState().initialize();

        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().token).toBe(mockToken);
        expect(useAuthStore.getState().user).toEqual(mockUser);
        expect(useAuthStore.getState().error).toBeNull();
    });

    it('should clear error', () => {
        useAuthStore.setState({ error: 'Some error' });
        useAuthStore.getState().clearError();
        expect(useAuthStore.getState().error).toBeNull();
    });
}); 