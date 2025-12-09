import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import ProtocolDetailsForm from './ProtocolDetailsForm';
import { useWallet } from '../../hooks/useWallet';
import type { Protocol } from '../../types';

interface ProtocolDetailsFormData {
  website: string;
  roles: string;
  twitter?: string;
  discord?: string;
  github?: string;
}

interface ProtocolDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocol: Protocol;
  onSave: (protocol: Protocol, data: ProtocolDetailsFormData) => void;
}

export default function ProtocolDetailsDialog({
  open,
  onOpenChange,
  protocol,
  onSave,
}: ProtocolDetailsDialogProps) {
  const { address } = useWallet();

  // Check if current user is the protocol creator
  // Allow editing if creator matches OR if creator is not set (for newly created protocols)
  const isCreator = !protocol.creator || protocol.creator?.toLowerCase() === address?.toLowerCase();

  if (!isCreator) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className="font-heading"
              style={{
                color: 'var(--color-secondary)',
                fontSize: 'var(--font-size-h4)',
              }}
            >
              Protocol Details
            </DialogTitle>
            <DialogDescription
              style={{
                color: 'var(--color-black)',
                fontSize: 'var(--font-size-body)',
              }}
            >
              Only the protocol creator can edit protocol details.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="angular-clip p-4" style={{ background: 'var(--color-marble-light)' }}>
              <p
                className="text-sm"
                style={{ color: 'var(--color-black)' }}
              >
                You are not the creator of this protocol. Editing is restricted to the protocol
                creator address: {protocol.creator}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = (data: ProtocolDetailsFormData) => {
    const updatedProtocol: Protocol = {
      ...protocol,
      website: data.website || undefined,
      roles: data.roles
        ? data.roles.split(',').map((r) => r.trim()).filter(Boolean)
        : undefined,
      socials: {
        twitter: data.twitter || undefined,
        discord: data.discord || undefined,
        github: data.github || undefined,
      },
    };
    onSave(updatedProtocol, data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle
            className="font-heading"
            style={{
              color: 'var(--color-secondary)',
              fontSize: 'var(--font-size-h4)',
            }}
          >
            Edit Protocol Details
          </DialogTitle>
          <DialogDescription
            style={{
              color: 'var(--color-black)',
              fontSize: 'var(--font-size-body)',
            }}
          >
            Update your protocol's website, roles, and social links.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ProtocolDetailsForm
            protocol={protocol}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


