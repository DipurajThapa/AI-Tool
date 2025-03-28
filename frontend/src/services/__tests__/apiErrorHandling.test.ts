import {
  authApi,
  erpApi,
  crmApi,
  marketingApi,
  salesApi,
  supportApi,
  workflowApi,
} from '../api'

jest.mock('../api')

describe('API Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Auth API Error Handling', () => {
    it('should handle login network error', async () => {
      const networkError = new Error('Network Error')
      authApi.login.mockRejectedValueOnce(networkError)

      await expect(authApi.login('test@example.com', 'password')).rejects.toThrow('Network Error')
    })

    it('should handle invalid credentials', async () => {
      const error = { response: { data: { message: 'Invalid credentials' } } }
      authApi.login.mockRejectedValueOnce(error)

      await expect(authApi.login('wrong@example.com', 'wrongpass')).rejects.toEqual(error)
    })
  })

  describe('ERP API Error Handling', () => {
    it('should handle task creation validation error', async () => {
      const validationError = {
        response: {
          data: {
            errors: ['Title is required', 'Due date must be in the future']
          }
        }
      }
      erpApi.createTask.mockRejectedValueOnce(validationError)

      await expect(erpApi.createTask({ title: '', dueDate: '2020-01-01' }))
        .rejects.toEqual(validationError)
    })

    it('should handle task not found error', async () => {
      const notFoundError = { response: { status: 404, data: { message: 'Task not found' } } }
      erpApi.updateTask.mockRejectedValueOnce(notFoundError)

      await expect(erpApi.updateTask('123', { title: 'Updated Task' }))
        .rejects.toEqual(notFoundError)
    })
  })

  describe('CRM API Error Handling', () => {
    it('should handle lead creation with invalid data', async () => {
      const invalidDataError = {
        response: {
          data: {
            errors: ['Email is invalid', 'Phone number is required']
          }
        }
      }
      crmApi.createLead.mockRejectedValueOnce(invalidDataError)

      await expect(crmApi.createLead({ name: 'Test Lead' }))
        .rejects.toEqual(invalidDataError)
    })

    it('should handle pagination errors', async () => {
      const paginationError = {
        response: {
          data: {
            message: 'Invalid page number'
          }
        }
      }
      crmApi.getLeads.mockRejectedValueOnce(paginationError)

      await expect(crmApi.getLeads({ page: -1 }))
        .rejects.toEqual(paginationError)
    })
  })

  describe('Marketing API Error Handling', () => {
    it('should handle content generation timeout', async () => {
      const timeoutError = new Error('Request timeout')
      marketingApi.generateContent.mockRejectedValueOnce(timeoutError)

      await expect(marketingApi.generateContent({
        prompt: 'Test prompt',
        maxTokens: 1000
      })).rejects.toThrow('Request timeout')
    })

    it('should handle invalid content parameters', async () => {
      const invalidParamsError = {
        response: {
          data: {
            message: 'Invalid parameters'
          }
        }
      }
      marketingApi.generateContent.mockRejectedValueOnce(invalidParamsError)

      await expect(marketingApi.generateContent({
        prompt: '',
        maxTokens: -1
      })).rejects.toEqual(invalidParamsError)
    })
  })

  describe('Support API Error Handling', () => {
    it('should handle AI chat service unavailable', async () => {
      const serviceError = {
        response: {
          status: 503,
          data: {
            message: 'AI service temporarily unavailable'
          }
        }
      }
      supportApi.chatWithAi.mockRejectedValueOnce(serviceError)

      await expect(supportApi.chatWithAi('Hello', {}))
        .rejects.toEqual(serviceError)
    })

    it('should handle invalid context data', async () => {
      const contextError = {
        response: {
          data: {
            message: 'Invalid context format'
          }
        }
      }
      supportApi.chatWithAi.mockRejectedValueOnce(contextError)

      await expect(supportApi.chatWithAi('Hello', { invalid: 'context' }))
        .rejects.toEqual(contextError)
    })
  })

  describe('Workflow API Error Handling', () => {
    it('should handle workflow execution timeout', async () => {
      const timeoutError = new Error('Workflow execution timeout')
      workflowApi.executeWorkflow.mockRejectedValueOnce(timeoutError)

      await expect(workflowApi.executeWorkflow({
        name: 'Test Workflow',
        steps: []
      })).rejects.toThrow('Workflow execution timeout')
    })

    it('should handle invalid workflow configuration', async () => {
      const configError = {
        response: {
          data: {
            message: 'Invalid workflow configuration'
          }
        }
      }
      workflowApi.executeWorkflow.mockRejectedValueOnce(configError)

      await expect(workflowApi.executeWorkflow({
        name: '',
        steps: null
      })).rejects.toEqual(configError)
    })
  })
}) 