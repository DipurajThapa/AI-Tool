import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { AuthApi } from './authApi';
import { ERPApi } from './erpApi';
import { CRMApi } from './crmApi';
import { MarketingApi } from './marketingApi';
import { SupportApi } from './supportApi';
import { WorkflowApi } from './workflowApi';
import { NotificationsApi } from './notificationsApi';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    auth: new AuthApi(api),
    erp: new ERPApi(api),
    crm: new CRMApi(api),
    marketing: new MarketingApi(api),
    support: new SupportApi(api),
    workflow: new WorkflowApi(api),
    notifications: new NotificationsApi(api),
}; 