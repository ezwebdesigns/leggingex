import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';
import Footer from './Footer';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />
      <main className="md:pl-16 pb-20 md:pb-0 flex-1 flex flex-col">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}