import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import HookDeveloperDashboard from './components/HookDeveloperDashboard';
import ProtocolDesignerDashboard from './components/ProtocolDesignerDashboard';
import CreateProtocolPage from './components/protocol/CreateProtocolPage';
import { ProtocolAdminPage } from './components/protocol/admin';
import IntegratorPortal from './components/IntegratorPortal';
import SkipLink from './components/common/SkipLink';
import { CreateHookPage, CodeVerificationPage } from './components/hook';
import { HookMarketPage } from './components/market';

export default function App() {
  return (
    <BrowserRouter>
      <SkipLink />
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage onNavigate={() => {}} />} />
          <Route path="/home" element={<HomePage onNavigate={() => {}} />} />
          <Route path="/about" element={<AboutPage onNavigate={() => {}} />} />
          <Route path="/contact" element={<ContactPage onNavigate={() => {}} />} />
          <Route path="/hook-developer" element={<HookDeveloperDashboard onNavigate={() => {}} />} />
          <Route path="/hook-developer/create" element={<CreateHookPage />} />
          <Route path="/hook-developer/verify" element={<CodeVerificationPage />} />
          <Route path="/ProtocolDashboard" element={<ProtocolDesignerDashboard onNavigate={() => {}} />} />
          <Route path="/ProtocolDashboard/createProtocol" element={<CreateProtocolPage />} />
          <Route path="/ProtocolDashboard/hook-market" element={<HookMarketPage />} />
          <Route path="/ProtocolDashboard/protocol/:protocolId/admin" element={<ProtocolAdminPage />} />
          <Route path="/integrator" element={<IntegratorPortal onNavigate={() => {}} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
