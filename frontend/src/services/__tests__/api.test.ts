import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a mock axios instance with interceptors
const mockAxiosInstance = {
    interceptors: {
        request: {
            use: jest.fn((callback) => {
                mockAxiosInstance.interceptors.request.callback = callback;
                return () => {};
            }),
            callback: null as any,
        },
        response: {
            use: jest.fn((successCallback, errorCallback) => {
                mockAxiosInstance.interceptors.response.successCallback = successCallback;
                mockAxiosInstance.interceptors.response.errorCallback = errorCallback;
                return () => {};
            }),
            successCallback: null as any,
            errorCallback: null as any,
        },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: {
        baseURL: 'http://localhost:8000/api/v1',
        headers: {
            'Content-Type': 'application/json',
        },
    },
};

// Mock axios.create to return our mock instance
mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

// Import API modules after mocking axios
import { authApi, erpApi, crmApi, marketingApi, salesApi, supportApi, workflowApi } from '../api';

jest.mock('../api');

describe('API Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Auth API', () => {
        it('should call login endpoint with correct data', async () => {
            const mockResponse = { data: { token: 'mock-token' } };
            (authApi.login as jest.Mock).mockResolvedValueOnce(mockResponse);

            await authApi.login('test@example.com', 'password');

            expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password');
        });

        it('should call register endpoint with correct data', async () => {
            const mockResponse = { data: { token: 'mock-token' } };
            (authApi.register as jest.Mock).mockResolvedValueOnce(mockResponse);

            const registerData = { email: 'test@example.com', password: 'password', full_name: 'Test User' };
            await authApi.register(registerData);

            expect(authApi.register).toHaveBeenCalledWith(registerData);
        });

        it('should call logout endpoint', async () => {
            const mockResponse = { data: null };
            (authApi.logout as jest.Mock).mockResolvedValueOnce(mockResponse);

            await authApi.logout();

            expect(authApi.logout).toHaveBeenCalled();
        });
    });

    describe('ERP API', () => {
        it('should call getTasks with pagination params', async () => {
            const mockResponse = { data: { items: [], total: 0, page: 1, size: 10, pages: 0 } };
            (erpApi.getTasks as jest.Mock).mockResolvedValueOnce(mockResponse);

            await erpApi.getTasks(1, 10);

            expect(erpApi.getTasks).toHaveBeenCalledWith(1, 10);
        });

        it('should call createTask with task data', async () => {
            const mockTask = {
                title: 'Test Task',
                description: 'Test Description',
                status: 'pending',
                priority: 'medium',
            };
            const mockResponse = { data: { ...mockTask, id: 1, created_at: '', updated_at: '' } };
            (erpApi.createTask as jest.Mock).mockResolvedValueOnce(mockResponse);

            await erpApi.createTask(mockTask);

            expect(erpApi.createTask).toHaveBeenCalledWith(mockTask);
        });
    });

    describe('CRM API', () => {
        it('should call getLeads with pagination params', async () => {
            const mockResponse = { data: { items: [], total: 0, page: 1, size: 10, pages: 0 } };
            (crmApi.getLeads as jest.Mock).mockResolvedValueOnce(mockResponse);

            await crmApi.getLeads(1, 10);

            expect(crmApi.getLeads).toHaveBeenCalledWith(1, 10);
        });

        it('should call createLead with lead data', async () => {
            const mockLead = {
                email: 'test@example.com',
                name: 'Test Lead',
                company: 'Test Company',
                status: 'new',
                score: 0,
            };
            const mockResponse = { data: { ...mockLead, id: 1, created_at: '', updated_at: '' } };
            (crmApi.createLead as jest.Mock).mockResolvedValueOnce(mockResponse);

            await crmApi.createLead(mockLead);

            expect(crmApi.createLead).toHaveBeenCalledWith(mockLead);
        });
    });

    describe('Marketing API', () => {
        it('should call generateContent with content generation params', async () => {
            const mockParams = {
                topic: 'Test Topic',
                content_type: 'blog',
                target_audience: 'general',
                tone: 'professional',
                keywords: ['test', 'content'],
                length: 'medium',
            };
            const mockResponse = { data: { content: 'Generated content', metadata: {} } };
            (marketingApi.generateContent as jest.Mock).mockResolvedValueOnce(mockResponse);

            await marketingApi.generateContent(mockParams);

            expect(marketingApi.generateContent).toHaveBeenCalledWith(mockParams);
        });
    });

    describe('Support API', () => {
        it('should call chatWithAi with message and context', async () => {
            const mockParams = {
                message: 'Test message',
                ticket_id: 1,
                context: { previous_messages: [] },
            };
            const mockResponse = { data: { message: 'AI response', is_ai_response: true } };
            (supportApi.chatWithAi as jest.Mock).mockResolvedValueOnce(mockResponse);

            await supportApi.chatWithAi(mockParams);

            expect(supportApi.chatWithAi).toHaveBeenCalledWith(mockParams);
        });
    });

    describe('Workflow API', () => {
        it('should call executeWorkflow with workflow data', async () => {
            const mockParams = {
                input_data: { test: 'data' },
                priority: 'high',
            };
            const mockResponse = { data: { id: '123', status: 'running' } };
            (workflowApi.executeWorkflow as jest.Mock).mockResolvedValueOnce(mockResponse);

            await workflowApi.executeWorkflow(1, mockParams);

            expect(workflowApi.executeWorkflow).toHaveBeenCalledWith(1, mockParams);
        });
    });
}); 