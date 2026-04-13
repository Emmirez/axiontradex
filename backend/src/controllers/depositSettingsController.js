import DepositSettings, {
  getOrCreateSettings,
} from "../models/DepositSettingsModel.js";
import { successResponse, errorResponse } from "../utils/responseUtils.js";

export const getDepositSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return successResponse(res, 200, "Deposit settings", { settings });
  } catch (err) {
    console.error("getDepositSettings error:", err);
    return errorResponse(res, 500, err.message);
  }
};

// Admin: update all coin addresses
// Body: { coins: [ { id, networks: [{ id, address, fee, enabled }] } ] }
export const updateCoinAddresses = async (req, res) => {
  try {
    const { coins } = req.body;
    if (!coins || !Array.isArray(coins))
      return errorResponse(res, 400, "coins array is required");

    const settings = await getOrCreateSettings();

    // Merge incoming data into existing coins
    const mergedCoins = settings.coins.map((existingCoin) => {
      const incoming = coins.find((c) => c.id === existingCoin.id);
      if (!incoming) return existingCoin;

      return {
        ...existingCoin.toObject(),
        enabled: incoming.enabled ?? existingCoin.enabled,
        networks: existingCoin.networks.map((existingNet) => {
          const inNet = incoming.networks?.find((n) => n.id === existingNet.id);
          if (!inNet) return existingNet;
          return {
            ...existingNet.toObject(),
            address: inNet.address ?? existingNet.address,
            fee: inNet.fee ?? existingNet.fee,
            enabled: inNet.enabled ?? existingNet.enabled,
          };
        }),
      };
    });

    // Replace the whole coins array — simple and reliable
    const updated = await DepositSettings.findOneAndUpdate(
      { singleton: "deposit_settings" },
      { $set: { coins: mergedCoins, updatedBy: req.user._id } },
      { new: true },
    );

    console.log("✅ Saved coins:", JSON.stringify(updated.coins, null, 2));

    return successResponse(res, 200, "Coin addresses updated", {
      settings: updated,
    });
  } catch (err) {
    console.error("❌ updateCoinAddresses error:", err);
    return errorResponse(res, 500, err.message);
  }
};

//  Admin: update bank details
// Body: { bankName, accountName, accountNumber, routingNumber, swiftCode, currency, reference, enabled }
export const updateBankDetails = async (req, res) => {
  try {
    const {
      bankName,
      accountName,
      accountNumber,
      routingNumber,
      swiftCode,
      currency,
      reference,
      enabled,
    } = req.body;

    const setFields = { updatedBy: req.user._id };

    if (bankName !== undefined) setFields["bank.bankName"] = bankName;
    if (accountName !== undefined) setFields["bank.accountName"] = accountName;
    if (accountNumber !== undefined)
      setFields["bank.accountNumber"] = accountNumber;
    if (routingNumber !== undefined)
      setFields["bank.routingNumber"] = routingNumber;
    if (swiftCode !== undefined) setFields["bank.swiftCode"] = swiftCode;
    if (currency !== undefined) setFields["bank.currency"] = currency;
    if (reference !== undefined) setFields["bank.reference"] = reference;
    if (enabled !== undefined) setFields["bank.enabled"] = enabled;

    const updated = await DepositSettings.findOneAndUpdate(
      { singleton: "deposit_settings" },
      { $set: setFields },
      { returnDocument: "after" },
    );

    return successResponse(res, 200, "Bank details updated", {
      bank: updated.bank,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// Admin: update a single network address
// Convenience endpoint for quick single-address edits
// Body: { coinId, networkId, address, fee, enabled }
export const updateSingleAddress = async (req, res) => {
  try {
   
    const { coinId, networkId, address, fee, enabled } = req.body;

    if (!coinId || !networkId)
      return errorResponse(res, 400, "coinId and networkId are required");

    const settings = await getOrCreateSettings();

    const coinIndex = settings.coins.findIndex((c) => c.id === coinId);
    if (coinIndex === -1)
      return errorResponse(res, 404, `Coin ${coinId} not found`);

    const netIndex = settings.coins[coinIndex].networks.findIndex(
      (n) => n.id === networkId,
    );
    if (netIndex === -1)
      return errorResponse(
        res,
        404,
        `Network ${networkId} not found for ${coinId}`,
      );

    const setFields = { updatedBy: req.user._id };
    if (address !== undefined)
      setFields[`coins.${coinIndex}.networks.${netIndex}.address`] = address;
    if (fee !== undefined)
      setFields[`coins.${coinIndex}.networks.${netIndex}.fee`] = fee;
    if (enabled !== undefined)
      setFields[`coins.${coinIndex}.networks.${netIndex}.enabled`] = enabled;

    const updated = await DepositSettings.findOneAndUpdate(
      { singleton: "deposit_settings" },
      { $set: setFields },
      { returnDocument: "after" },
    );

    const updatedNet = updated.coins[coinIndex].networks[netIndex];

    return successResponse(res, 200, `${coinId} ${networkId} address updated`, {
      coinId,
      networkId,
      address: updatedNet.address,
      fee: updatedNet.fee,
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};
