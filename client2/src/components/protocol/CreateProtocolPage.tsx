import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import CreateProtocolDialog from './CreateProtocolDialog';
import { useState } from 'react';

export default function CreateProtocolPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(true);

  const handleSuccess = (protocolId: bigint, chainId: number, protocolName: string, feeRecipient?: string) => {
    // Close dialog and navigate back to dashboard with protocol data
    setDialogOpen(false);
    // Small delay to show success message before navigation
    setTimeout(() => {
      navigate('/ProtocolDashboard', {
        state: {
          newProtocol: {
            protocolId: protocolId.toString(),
            chainId,
            protocolName,
            feeRecipient,
          },
        },
      });
    }, 2000);
  };

  const handleClose = () => {
    setDialogOpen(false);
    navigate('/ProtocolDashboard');
  };

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={(page) => navigate(`/${page}`)} />

      {/* Hero Section */}
      <section
        className="speed-lines"
        style={{
          paddingTop: 'var(--space-2xl)',
          paddingBottom: 'var(--space-2xl)',
          background: 'var(--color-marble-light)',
        }}
      >
        <div className="container-custom">
          <button
            onClick={() => navigate('/ProtocolDashboard')}
            className="flex items-center gap-2 mb-8 font-heading transition-colors duration-200"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-medium)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-secondary)';
            }}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div>
            <h1
              className="mb-2 font-heading"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-h2)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Create <span style={{ color: 'var(--color-primary)' }}>Protocol</span>
            </h1>
            <p
              className="font-body"
              style={{
                color: 'var(--color-black)',
                fontSize: 'var(--font-size-body)',
              }}
            >
              Select a chain and create your protocol
            </p>
          </div>
        </div>
      </section>

      {/* Create Protocol Dialog */}
      <CreateProtocolDialog
        open={dialogOpen}
        onOpenChange={handleClose}
        onSuccess={handleSuccess}
      />

      <Footer onNavigate={(page) => navigate(`/${page}`)} />
    </div>
  );
}


