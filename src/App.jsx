import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { CountryProvider } from '@/contexts/CountryContext';
import { AdminRoute } from '@/components/ProtectedRoute';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/admin/AdminLayout';
import { getSettings } from '@/lib/settings';

// Page imports
import Home from '@/pages/Home';
import Categories from '@/pages/Categories';
import SearchPage from '@/pages/SearchPage';
import Favorites from '@/pages/Favorites';
import ProductDetail from '@/pages/ProductDetail';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminProducts from '@/pages/AdminProducts';
import AdminImport from '@/pages/AdminImport';
import AdminHome from '@/pages/AdminHome';
import AdminPages from '@/pages/AdminPages';
import AdminSettings from '@/pages/AdminSettings';
import Catalogue from '@/pages/Catalogue';
import ProduitDetail from '@/pages/ProduitDetail';
import Blog from '@/pages/Blog';
import AdminPageEditor from '@/pages/AdminPageEditor';
import DynamicPage from '@/pages/DynamicPage';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  useEffect(() => {
    getSettings().then((s) => {
      const seo = s.seo || {};
      const general = s.general || {};
      const favicon = general.favicon;
      const siteTitle = general.site_title || 'Leggings — Find your perfect pair';
      const metaTitle = seo.meta_title || siteTitle;
      const metaDesc = seo.meta_description || 'Discover the best leggings for women, men, kids, sports and fashion.';

      document.title = metaTitle;
      let link = document.querySelector('link[rel="icon"]');
      if (favicon) {
        if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
        link.href = favicon;
      }
      let desc = document.querySelector('meta[name="description"]');
      if (desc) desc.content = metaDesc;
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = metaTitle;
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = metaDesc;
      if (seo.og_image) {
        let ogImg = document.querySelector('meta[property="og:image"]');
        if (!ogImg) { ogImg = document.createElement('meta'); ogImg.setAttribute('property', 'og:image'); document.head.appendChild(ogImg); }
        ogImg.content = seo.og_image;
      }
    }).catch(() => {});
  }, []);

  const Forbidden = () => {
    const navigateToLogin = () => window.location.href = '/login';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <span className="text-6xl block mb-4">🔒</span>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to access this area.</p>
        <button onClick={navigateToLogin} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          Go to Login
        </button>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route element={<AdminRoute forbiddenElement={<Forbidden />} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/import" element={<AdminImport />} />
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/pages" element={<AdminPages />} />
            <Route path="/admin/pages/new" element={<AdminPageEditor />} />
            <Route path="/admin/pages/:id/edit" element={<AdminPageEditor />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/produit/:id" element={<ProduitDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/:slug" element={<DynamicPage />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <CountryProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </CountryProvider>
    </AuthProvider>
  )
}

export default App