import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import type { Protocol } from '../../types';

interface ProtocolDetailsFormData {
  website: string;
  roles: string;
  twitter?: string;
  discord?: string;
  github?: string;
}

interface ProtocolDetailsFormProps {
  protocol: Protocol;
  onSubmit: (data: ProtocolDetailsFormData) => void;
  onCancel: () => void;
}

export default function ProtocolDetailsForm({
  protocol,
  onSubmit,
  onCancel,
}: ProtocolDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProtocolDetailsFormData>({
    defaultValues: {
      website: protocol.website || '',
      roles: protocol.roles?.join(', ') || '',
      twitter: protocol.socials?.twitter || '',
      discord: protocol.socials?.discord || '',
      github: protocol.socials?.github || '',
    },
  });

  const onFormSubmit = (data: ProtocolDetailsFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="website"
          className="block mb-2 font-heading font-medium"
          style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-body-sm)' }}
        >
          Website URL *
        </label>
        <input
          id="website"
          type="url"
          {...register('website', {
            required: 'Website URL is required',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Please enter a valid URL (must start with http:// or https://)',
            },
          })}
          className="w-full px-3 py-2 border-2 angular-clip"
          style={{
            borderColor: 'var(--color-secondary)',
            background: 'var(--color-white)',
          }}
          placeholder="https://example.com"
        />
        {errors.website && (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-accent)' }}>
            {errors.website.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="roles"
          className="block mb-2 font-heading font-medium"
          style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-body-sm)' }}
        >
          Roles (comma-separated) *
        </label>
        <input
          id="roles"
          type="text"
          {...register('roles', {
            required: 'At least one role is required',
          })}
          className="w-full px-3 py-2 border-2 angular-clip"
          style={{
            borderColor: 'var(--color-secondary)',
            background: 'var(--color-white)',
          }}
          placeholder="Admin, Manager, Developer"
        />
        {errors.roles ? (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-accent)' }}>
            {errors.roles.message}
          </p>
        ) : (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-black)', opacity: 0.6 }}>
            Separate multiple roles with commas
          </p>
        )}
      </div>

      <div>
        <label
          className="block mb-3 font-heading font-medium"
          style={{ color: 'var(--color-secondary)', fontSize: 'var(--font-size-body-sm)' }}
        >
          Social Links
        </label>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="twitter"
              className="block mb-1 text-xs"
              style={{ color: 'var(--color-black)' }}
            >
              Twitter/X
            </label>
            <input
              id="twitter"
              type="text"
              {...register('twitter')}
              className="w-full px-3 py-2 border-2 angular-clip"
              style={{
                borderColor: 'var(--color-secondary)',
                background: 'var(--color-white)',
              }}
              placeholder="@username or https://twitter.com/username"
            />
          </div>
          <div>
            <label
              htmlFor="discord"
              className="block mb-1 text-xs"
              style={{ color: 'var(--color-black)' }}
            >
              Discord
            </label>
            <input
              id="discord"
              type="text"
              {...register('discord')}
              className="w-full px-3 py-2 border-2 angular-clip"
              style={{
                borderColor: 'var(--color-secondary)',
                background: 'var(--color-white)',
              }}
              placeholder="https://discord.gg/invite"
            />
          </div>
          <div>
            <label
              htmlFor="github"
              className="block mb-1 text-xs"
              style={{ color: 'var(--color-black)' }}
            >
              GitHub
            </label>
            <input
              id="github"
              type="text"
              {...register('github')}
              className="w-full px-3 py-2 border-2 angular-clip"
              style={{
                borderColor: 'var(--color-secondary)',
                background: 'var(--color-white)',
              }}
              placeholder="https://github.com/username"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-secondary)',
          }}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}


