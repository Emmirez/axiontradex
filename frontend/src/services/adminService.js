import api from './apiService.js'

const adminService = {

  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard')
    return data
  },

  getUsers: async (params = {}) => {
    const { data } = await api.get('/admin/users', { params })
    return data
  },

  getUserById: async (id) => {
    const { data } = await api.get(`/admin/users/${id}`)
    return data
  },

  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/admin/users/${id}/status`, { status })
    return data
  },

  promoteToAdmin: async (id) => {
    const { data } = await api.patch(`/admin/users/${id}/promote`)
    return data
  },

  demoteToUser: async (id) => {
    const { data } = await api.patch(`/admin/users/${id}/demote`)
    return data
  },

  reviewKYC: async (id, status, note = '') => {
    const { data } = await api.patch(`/admin/users/${id}/kyc`, { status, note })
    return data
  },

  adjustWallet: async (id, amount, currency, note, type) => {
    const { data } = await api.patch(`/admin/users/${id}/wallet`, { amount, currency, note, type })
    return data
  },

  getTransactions: async (params = {}) => {
    const { data } = await api.get('/admin/transactions', { params })
    return data
  },

  processTransaction: async (id, status, note = '') => {
    const { data } = await api.patch(`/admin/transactions/${id}`, { status, note })
    return data
  },

}

export default adminService