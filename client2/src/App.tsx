import { useState } from 'react';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import HookDeveloperDashboard from './components/HookDeveloperDashboard';
import ProtocolDesignerDashboard from './components/ProtocolDesignerDashboard';
import IntegratorPortal from './components/IntegratorPortal';
import SkipLink from './components/common/SkipLink';
import type { Page } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'about':
        return <AboutPage onNavigate={setCurrentPage} />;
      case 'contact':
        return <ContactPage onNavigate={setCurrentPage} />;
      case 'hook-developer':
        return <HookDeveloperDashboard onNavigate={setCurrentPage} />;
      case 'protocol-designer':
        return <ProtocolDesignerDashboard onNavigate={setCurrentPage} />;
      case 'integrator':
        return <IntegratorPortal onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-white">{renderPage()}</div>
    </>
  );
}
