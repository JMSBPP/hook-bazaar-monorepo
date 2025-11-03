import Navigation from './Navigation';
import HeroSection from './home/HeroSection';
import ProblemSection from './home/ProblemSection';
import SolutionSection from './home/SolutionSection';
import FeaturesSection from './home/FeaturesSection';
import UserTypeSection from './home/UserTypeSection';
import StatisticsSection from './home/StatisticsSection';
import ContactSection from './home/ContactSection';
import Footer from './Footer';
import type { Page } from '../types';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <>
      <Navigation onNavigate={onNavigate} />
      <main id="main-content" tabIndex={-1}>
        <HeroSection onNavigate={onNavigate} />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <UserTypeSection onNavigate={onNavigate} />
        <StatisticsSection />
        <ContactSection />
      </main>
      <Footer onNavigate={onNavigate} />
    </>
  );
}
