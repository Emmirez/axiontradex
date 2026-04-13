import api from './apiService.js'

const walletService = {

  getWallet: async () => {
    const { data } = await api.get('/wallet')
    return data
  },

  getTransactions: async (params = {}) => {
    const { data } = await api.get('/wallet/transactions', { params })
    return data
  },

  deposit: async (depositData) => {
    const { data } = await api.post('/wallet/deposit', depositData)
    return data
  },

  withdraw: async (withdrawData) => {
    const { data } = await api.post('/wallet/withdraw', withdrawData)
    return data
  },

}

export default walletService