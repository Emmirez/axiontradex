import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useTheme } from "./context/ThemeContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Ticker from "./sections/Ticker.jsx";
import Hero from "./sections/Hero.jsx";
import LiveMarkets from "./sections/LiveMarkets.jsx";
import Features from "./sections/Features.jsx";
import TradingImages from "./sections/TradingImages.jsx";
import Products from "./sections/Products.jsx";
import Security from "./sections/Security.jsx";
import Testimonials from "./sections/Testimonials.jsx";
import CTA from "./sections/CTA.jsx";
import Footer from "./sections/Footer.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import CopyTrading from "./pages/features/CopyTrading.jsx";
import TradingBot from "./pages/features/TradingBot.jsx";
import AutomatedTrading from "./pages/features/AutomatedTrading.jsx";
import AITrading from "./pages/features/AITrading.jsx";
import GetFunded from "./pages/features/GetFunded.jsx";
import Gold from "./pages/products/Gold.jsx";
import StocksFunds from "./pages/products/StocksFunds.jsx";
import CashManagement from "./pages/products/CashManagement.jsx";
import Contact from "./sections/Contact.jsx";
import AboutUs from "./sections/AboutUs.jsx";
import AboutSection from "./sections/AboutSection.jsx";
import HowItWorks from "./sections/HowItWorks.jsx";
import InvestmentPlans from "./sections/InvestmentPlans.jsx";
import FAQSection from "./sections/FAQSection.jsx";
import LiveActivityToast from "./components/LiveActivityToast.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import NotFound from "./sections/NotFound.jsx";
import Exchange from "./pages/footer/Exchange.jsx";
import Earn from "./pages/footer/Earn.jsx";
import TermsOfService from "./pages/footer/TermsOfService.jsx";
import APIDoc from "./pages/footer/APIDoc.jsx";
import SpotTrading from "./pages/footer/SpotTrading.jsx";
import Blog from "./pages/footer/Blog.jsx";
import PrivacyPolicy from "./pages/footer/PrivacyPolicy.jsx";
import AMLPolicy from "./pages/footer/AMLPolicy.jsx";
import Careers from "./pages/footer/Careers.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import LiveNews from "./sections/LiveNews.jsx";
import LiveTradeAlert from "./components/LiveTradeAlert.jsx";
import FearGreedIndex from "./sections/FearGreedIndex.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Futures from "./pages/footer/Futures.jsx";
import Options from "./pages/footer/Options.jsx";
import Staking from "./pages/footer/Staking.jsx";
import HelpCenter from "./pages/footer/HelpCenter.jsx";
import Press from "./pages/footer/Press.jsx";
import Status from "./pages/footer/Status.jsx";
import CookiePolicy from "./pages/footer/CookiePolicy.jsx";
import RegulatoryInfo from "./pages/footer/RegulatoryInfo.jsx";
import RiskDisclosure from "./pages/footer/RiskDisclosure.jsx";
import PortfolioPage from "./pages/user/PorfolioPage.jsx";
import MarketsPage from "./pages/user/MarketsPage.jsx";
import TradePage from "./pages/user/TradePage.jsx";
import DepositPage from "./pages/user/DepositPage.jsx";
import WithdrawPage from "./pages/user/WithdrawPage.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import ProfilePage from "./pages/user/ProfilePage.jsx";
import UserNotificationsPage from "./pages/user/UserNotificationPage.jsx";
import KYCPage from "./pages/user/KYCPage.jsx";
import ChangePasswordPage from "./pages/user/ChangePasswordPage.jsx";
import TradesPage from "./pages/user/TradeHistory.jsx";
import TransactionsPage from "./pages/user/TransactionsPage.jsx";
import ReferralPage from "./pages/user/ReferralPage.jsx";
import SupportPage from "./pages/user/SupportPage.jsx";
import TicketDetailPage from "./pages/user/TicketDetailPage.jsx";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage.jsx";
import StocksMarketPage from "./pages/user/StocksMarketPage.jsx";
import CryptoMarketPage from "./pages/user/CryptoMarketPage.jsx";
import RealEstatePage from "./pages/user/RealEstatePage.jsx";
import InvestmentHistoryPage from "./pages/user/InvestmentHistoryPage.jsx";
import CopyTradingPage from "./pages/user/CopyTradingPage.jsx";
import PremiumSignalsPage from "./pages/user/PremiumSignalsPage.jsx";
import DemoTradingPage from "./pages/user/DemoTradingPage.jsx";
import SwapPage from "./pages/user/SwapPage.jsx";
import BotsPage from "./pages/user/BotsPage.jsx";
import GoldPage from "./pages/user/GoldPage.jsx";
import TwoFactorPage from "./pages/user/TwoFactorPage.jsx";
import "./i18n";
import PWAInstallBanner from "./components/PWAInstallBanner.jsx";
import AvailableOn from "./components/AvailableOn.jsx";


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function Landing() {
  const { darkMode, setDarkMode } = useTheme();
  const [btcPrice, setBtcPrice] = useState(87991);
  const [btcChange, setBtcChange] = useState(2.4);
  const [btcUp, setBtcUp] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice((prev) => {
        const delta = (Math.random() - 0.48) * prev * 0.003;
        return Math.max(prev + delta, 0.01);
      });
      setBtcChange((prev) => {
        const newChange = prev + (Math.random() - 0.5) * 0.05;
        setBtcUp(newChange >= 0);
        return newChange;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".fade-section").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <ErrorBoundary>
        <Ticker />
      </ErrorBoundary>
      <Hero  />

      {/* New Widget Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FearGreedIndex />
        </div>
      </div>

      <LiveMarkets />
      <Features />
      <TradingImages />
      <HowItWorks />
      <Products />
      <InvestmentPlans />
      <Security />
      <AboutSection />
      <Testimonials />
      <LiveNews />
      <FAQSection />
      <CTA />
      <AvailableOn darkMode={darkMode} />
      <Footer />
      <PWAInstallBanner darkMode={darkMode}/>
      <LiveActivityToast />
      {/* <LiveTradeAlert /> */}
      
    </div>
  );
}

export default function App() {
  return (
    <>
      {/* Auth */}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        {/*admin (protected+guuard)*/}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <AdminRoute>
              <AdminNotificationsPage />
            </AdminRoute>
          }
        />

        {/* <Route path="/admin/deposits" element={<AdminRoute><AdminDeposits /></AdminRoute>} />
        <Route path="/admin/deposit-settings" element={<AdminRoute><AdminDepositSettings /></AdminRoute>} /> */}

        {/*  Products */}
        <Route path="/copy-trading" element={<CopyTrading />} />
        <Route path="/trading-bot" element={<TradingBot />} />
        <Route path="/automated" element={<AutomatedTrading />} />
        <Route path="/ai-trading" element={<AITrading />} />
        <Route path="/funded" element={<GetFunded />} />
        <Route path="/gold" element={<Gold />} />
        <Route path="/stocks" element={<StocksFunds />} />
        <Route path="/cash" element={<CashManagement />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/exchange" element={<Exchange />} />
        <Route path="/spot-trading" element={<SpotTrading />} />
        <Route path="/earn" element={<Earn />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/futures" element={<Futures />} />
        <Route path="/options" element={<Options />} />
        <Route path="/staking" element={<Staking />} />
        <Route path="/press" element={<Press />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/status" element={<Status />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/aml-policy" element={<AMLPolicy />} />
        <Route path="/api-docs" element={<APIDoc />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/risk-disclosure" element={<RiskDisclosure />} />
        <Route path="/regulatory-info" element={<RegulatoryInfo />} />

        {/* User (protected)*/}
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/markets"
          element={
            <ProtectedRoute>
              <MarketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trade/:pair"
          element={
            <ProtectedRoute>
              <TradePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trade"
          element={
            <ProtectedRoute>
              <TradePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <DepositPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <WithdrawPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signals"
          element={
            <ProtectedRoute>
              <PremiumSignalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/demo"
          element={
            <ProtectedRoute>
              <DemoTradingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bots"
          element={
            <ProtectedRoute>
              <BotsPage/>
            </ProtectedRoute>
          }
        />
        <Route path="/gold-trade" element={<ProtectedRoute><GoldPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/password" element={<ChangePasswordPage />} />
        <Route path="/kyc" element={<KYCPage />} />
        <Route path="/notifications" element={<UserNotificationsPage />} />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trades"
          element={
            <ProtectedRoute>
              <TradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referral"
          element={
            <ProtectedRoute>
              <ReferralPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/ticket/:id"
          element={
            <ProtectedRoute>
              <TicketDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stocks-market"
          element={
            <ProtectedRoute>
              <StocksMarketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crypto-market"
          element={
            <ProtectedRoute>
              <CryptoMarketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/real-estate"
          element={
            <ProtectedRoute>
              <RealEstatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investments"
          element={
            <ProtectedRoute>
              <InvestmentHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/copy-trader"
          element={
            <ProtectedRoute>
              <CopyTradingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/swap"
          element={
            <ProtectedRoute>
              <SwapPage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/2fa" element={<ProtectedRoute><TwoFactorPage /></ProtectedRoute>} />
        {/*404 — catch all unmatched routes*/}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
