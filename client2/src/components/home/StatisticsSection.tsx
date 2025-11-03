import { Code, DollarSign, Layers, Package, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import Section from '../common/Section';
import Container from '../common/Container';
import Heading from '../common/Heading';
import Card from '../common/Card';
import IconBox from '../common/IconBox';
import type { Statistic } from '../../types';

interface StatWithIcon extends Statistic {
  icon: typeof Package;
  color: 'primary' | 'accent';
}

export default function StatisticsSection() {
  const [counters, setCounters] = useState({
    hooks: 0,
    protocols: 0,
    pools: 0,
    tvl: 0,
    volume: 0,
    developers: 0,
  });

  const targets = {
    hooks: 124,
    protocols: 38,
    pools: 256,
    tvl: 847,
    volume: 1240,
    developers: 89,
  };

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        hooks: Math.floor(targets.hooks * progress),
        protocols: Math.floor(targets.protocols * progress),
        pools: Math.floor(targets.pools * progress),
        tvl: Math.floor(targets.tvl * progress),
        volume: Math.floor(targets.volume * progress),
        developers: Math.floor(targets.developers * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats: StatWithIcon[] = [
    {
      icon: Package,
      label: 'Total Hooks Deployed',
      value: counters.hooks,
      suffix: '',
      color: 'primary',
    },
    {
      icon: Layers,
      label: 'Active Protocols',
      value: counters.protocols,
      suffix: '',
      color: 'accent',
    },
    {
      icon: Code,
      label: 'Total Pools',
      value: counters.pools,
      suffix: '',
      color: 'primary',
    },
    {
      icon: DollarSign,
      label: 'Total TVL',
      value: counters.tvl,
      suffix: 'M',
      prefix: '$',
      color: 'accent',
    },
    {
      icon: TrendingUp,
      label: 'Volume (24h)',
      value: counters.volume,
      suffix: 'M',
      prefix: '$',
      color: 'primary',
    },
    {
      icon: Users,
      label: 'Hook Developers',
      value: counters.developers,
      suffix: '',
      color: 'accent',
    },
  ];

  return (
    <Section variant="marble" spacing="xl">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <Heading level={2} className="mb-6">
            Platform <span className="text-[var(--color-primary)]">Statistics</span>
          </Heading>
          <p
            className="font-body max-w-2xl mx-auto text-[var(--color-black)]"
            style={{
              fontSize: 'var(--font-size-body-lg)',
              lineHeight: 'var(--line-height-loose)',
            }}
          >
            Real-time metrics showcasing the growth and adoption of the Hook Bazaar ecosystem.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} variant="white" hoverable>
              {/* Icon */}
              <IconBox
                icon={<stat.icon size={24} aria-hidden="true" />}
                size="md"
                variant={stat.color}
                className="mb-4"
              />

              {/* Value */}
              <div
                className="mb-2 font-heading text-[var(--color-secondary)]"
                style={{
                  fontSize: 'var(--font-size-h2)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: '1',
                }}
                aria-live="polite"
                aria-atomic="true"
              >
                {stat.prefix}
                {stat.value.toLocaleString()}
                {stat.suffix}
              </div>

              {/* Label */}
              <div
                className="font-heading text-[var(--color-accent)] uppercase tracking-wider"
                style={{
                  fontSize: 'var(--font-size-body-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
