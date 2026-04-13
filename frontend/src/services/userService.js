import api from "./apiService.js";

const userService = {
  getProfile: async () => {
    const { data } = await api.get("/users/me");
    return data;
  },

  updateProfile: async (updates) => {
    const { data } = await api.patch("/users/me", updates);
    return data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const { data } = await api.patch("/users/change-password", {
      currentPassword,
      newPassword,
    });
    return data;
  },

  getDashboard: async () => {
    const { data } = await api.get("/users/dashboard");
    return data;
  },

  getTrades: async (params = {}) => {
    const { data } = await api.get("/users/trades", { params });
    return data;
  },

  getTransactions: async (params = {}) => {
    const { data } = await api.get("/users/transactions", { params });
    return data;
  },

  submitKYC: async (kycData) => {
    const formData = new FormData();

    formData.append("documentType", kycData.documentType);
    formData.append("documentNumber", kycData.documentNumber);

    // Only append if it’s a real File object
    if (kycData.frontFile instanceof File) {
      formData.append("documentUrl", kycData.frontFile);
    } else {
    }

    if (kycData.backFile instanceof File) {
      formData.append("backUrl", kycData.backFile);
    }

    if (kycData.selfieFile instanceof File) {
      formData.append("selfieUrl", kycData.selfieFile);
    } else {
    }

    // JSON fields
    formData.append("personalInfo", JSON.stringify(kycData.personalInfo || {}));
    formData.append("addressInfo", JSON.stringify(kycData.addressInfo || {}));
    formData.append(
      "employmentInfo",
      JSON.stringify(kycData.employmentInfo || {}),
    );

    try {
      const { data } = await api.post("/users/kyc", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return data;
    } catch (err) {
      console.error("KYC submission error:", err.response?.data || err.message);
      throw err;
    }
  },
};

export default userService;
