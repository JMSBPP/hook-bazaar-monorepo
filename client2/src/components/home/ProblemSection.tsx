import { AlertCircle, DollarSign, TrendingDown, Users } from 'lucide-react';
import Section from '../common/Section';
import Container from '../common/Container';
import Heading from '../common/Heading';
import Card from '../common/Card';
import IconBox from '../common/IconBox';

interface Problem {
  icon: typeof Users;
  title: string;
  description: string;
}

const problems: Problem[] = [
  {
    icon: Users,
    title: 'Missing Market Mechanism',
    description:
      'No two-sided market mechanism between hook supply and pool demand prevents efficient market clearing and optimal matching.',
  },
  {
    icon: DollarSign,
    title: 'High Deployment Costs',
    description:
      'Protocols face prohibitive costs developing custom hooks without access to a curated, competitive marketplace.',
  },
  {
    icon: TrendingDown,
    title: 'Allocation Inefficiency',
    description:
      'Suboptimal hook-pool matching creates Pareto inefficiency, leaving both developers and pools with inferior outcomes.',
  },
  {
    icon: AlertCircle,
    title: 'Competition Suppression',
    description:
      'Hook competition cannot function properly without demand-side choice, limiting innovation and quality improvements.',
  },
];

export default function ProblemSection() {
  return (
    <Section variant="marble" spacing="xl">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <Heading level={2} className="mb-6">
            Pools Lack Agency Over Hook Selection
          </Heading>
          <p
            className="font-body text-[var(--color-black)]"
            style={{
              fontSize: 'var(--font-size-body-lg)',
              lineHeight: 'var(--line-height-loose)',
            }}
          >
            Currently, pools cannot autonomously choose which hooks to integrate when multiple
            eligible hooks are available, leading to significant market failures.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {problems.map((problem, index) => (
            <Card
              key={index}
              variant="white"
              hoverable
              className="border-[var(--color-accent)]"
            >
              {/* Icon */}
              <IconBox
                icon={<problem.icon size={28} aria-hidden="true" />}
                size="lg"
                variant="accent"
                className="mb-4"
              />

              {/* Title */}
              <Heading
                level={3}
                className="mb-3"
                style={{
                  fontSize: 'var(--font-size-h5)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
              >
                {problem.title}
              </Heading>

              {/* Description */}
              <p
                className="font-body text-[var(--color-black)]"
                style={{
                  fontSize: 'var(--font-size-body)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}
              >
                {problem.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
