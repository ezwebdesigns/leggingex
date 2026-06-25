import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { CountryProvider } from '@/contexts/CountryContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';

// Page imports
import Home from '@/pages/Home';
import Categories from '@/pages/Categories';
import SearchPage from '@/pages/SearchPage';
import Favorites from '@/pages/Favorites';
import ProductDetail from '@/pages/ProductDetail';
import Admin from '@/pages/Admin';
import Catalogue from '@/pages/Catalogue';
import ProduitDetail from '@/pages/ProduitDetail';
import Blog from '@/pages/Blog';
import DynamicPage from '@/pages/DynamicPage';

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

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
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