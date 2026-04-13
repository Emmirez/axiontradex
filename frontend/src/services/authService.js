import api from "./apiService.js";

const authService = {
  register: async (formData) => {
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      country: formData.country,
      homeAddress: formData.homeAddress,
      dateOfBirth: formData.dob,
      currency: formData.currency,
      referral: formData.referral || undefined,
    };
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  login: async (email, password, totpToken = null) => {
    const payload = { email, password };
    if (totpToken) payload.totpToken = totpToken;
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get("/users/me");
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  resendVerification: async (email) => {
    const { data } = await api.post("/auth/resend-verification", { email });
    return data;
  },

  resetPassword: async (token, password) => {
    const { data } = await api.patch(`/auth/reset-password/${token}`, {
      password,
    });
    return data;
  },

  verifyEmail: async (token) => {
    const { data } = await api.get(`/auth/verify-email/${token}`);
    return data;
  },

  refreshToken: async () => {
    const { data } = await api.post("/auth/refresh-token");
    return data;
  },

  setup2FA: async () => {
    const { data } = await api.post("/auth/2fa/setup");
    return data;
  },

  enable2FA: async (token) => {
    const { data } = await api.post("/auth/2fa/enable", { token });
    return data;
  },

  disable2FA: async (password) => {
    const { data } = await api.post("/auth/2fa/disable", { password });
    return data;
  },
};

export default authService;
