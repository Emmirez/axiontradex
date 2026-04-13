import mongoose from 'mongoose'

const networkAddressSchema = new mongoose.Schema({
  id:      { type: String, required: true },  // e.g. 'TRC20'
  label:   { type: String, required: true },  // e.g. 'TRC20 (Tron)'
  address: { type: String, default: '' },
  fee:     { type: String, default: '' },
  enabled: { type: Boolean, default: true },
}, { _id: false })

const coinSchema = new mongoose.Schema({
  id:       { type: String, required: true },  // e.g. 'USDT'
  label:    { type: String, required: true },
  enabled:  { type: Boolean, default: true },
  networks: [networkAddressSchema],
}, { _id: false })

const bankSchema = new mongoose.Schema({
  bankName:      { type: String, default: '' },
  accountName:   { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  routingNumber: { type: String, default: '' },
  swiftCode:     { type: String, default: '' },
  currency:      { type: String, default: 'USD' },
  reference:     { type: String, default: 'Your full name + email' },
  enabled:       { type: Boolean, default: true },
}, { _id: false })

const depositSettingsSchema = new mongoose.Schema({
  // Singleton key — only one doc
  singleton: { type: String, default: 'deposit_settings', unique: true },

  coins:       [coinSchema],
  bank:        bankSchema,
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

const DepositSettings = mongoose.model('DepositSettings', depositSettingsSchema)

//  Default settings (run once on first use) 
export const getOrCreateSettings = async () => {
  let settings = await DepositSettings.findOne({ singleton: 'deposit_settings' })
  if (!settings) {
    settings = await DepositSettings.create({
      coins: [
        {
          id: 'USDT', label: 'Tether (USDT)', enabled: true,
          networks: [
            { id: 'TRC20', label: 'TRC20 (Tron)',     fee: '1 USDT',   address: '', enabled: true },
            { id: 'ERC20', label: 'ERC20 (Ethereum)', fee: '5 USDT',   address: '', enabled: true },
            { id: 'BEP20', label: 'BEP20 (BSC)',      fee: '0.5 USDT', address: '', enabled: true },
          ],
        },
        {
          id: 'BTC', label: 'Bitcoin (BTC)', enabled: true,
          networks: [
            { id: 'BTC', label: 'Bitcoin Network', fee: '0.0001 BTC', address: '', enabled: true },
          ],
        },
        {
          id: 'ETH', label: 'Ethereum (ETH)', enabled: true,
          networks: [
            { id: 'ERC20', label: 'ERC20 (Ethereum)', fee: '0.002 ETH',  address: '', enabled: true },
            { id: 'BEP20', label: 'BEP20 (BSC)',      fee: '0.001 BNB',  address: '', enabled: true },
          ],
        },
        {
          id: 'BNB', label: 'BNB', enabled: true,
          networks: [
            { id: 'BEP20', label: 'BEP20 (BSC)', fee: '0.001 BNB', address: '', enabled: true },
          ],
        },
        {
          id: 'SOL', label: 'Solana (SOL)', enabled: true,
          networks: [
            { id: 'SOL', label: 'Solana Network', fee: '0.01 SOL', address: '', enabled: true },
          ],
        },
      ],
      bank: {
        bankName:      '',
        accountName:   '',
        accountNumber: '',
        routingNumber: '',
        swiftCode:     '',
        currency:      'USD',
        reference:     'Your full name + email',
        enabled:       true,
      },
    })
  }
  return settings
}

export default DepositSettings