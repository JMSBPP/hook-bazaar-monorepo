import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import HookDeveloperDashboard from './components/HookDeveloperDashboard';
import ProtocolDesignerDashboard from './components/ProtocolDesignerDashboard';
import CreateProtocolPage from './components/protocol/CreateProtocolPage';
import IntegratorPortal from './components/IntegratorPortal';
import SkipLink from './components/common/SkipLink';
import { CreateHookPage } from './components/hook';

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
          <Route path="/ProtocolDashboard" element={<ProtocolDesignerDashboard onNavigate={() => {}} />} />
          <Route path="/ProtocolDashboard/createProtocol" element={<CreateProtocolPage />} />
          <Route path="/integrator" element={<IntegratorPortal onNavigate={() => {}} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
