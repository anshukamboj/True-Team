
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  Award,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Employee Management',
    description:
      'Manage employee profiles, departments, roles, and workforce information.',
  },
  {
    icon: Clock,
    title: 'Attendance',
    description:
      'Track attendance, working hours, and employee check-ins.',
  },
  {
    icon: CalendarDays,
    title: 'Leave Management',
    description:
      'Manage leave requests, approvals, and leave balances.',
  },
  {
    icon: DollarSign,
    title: 'Payroll',
    description:
      'Organize salary records and payroll information efficiently.',
  },
  {
    icon: Award,
    title: 'Performance',
    description:
      'Monitor employee goals, reviews, achievements, and growth.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Explore workforce data through clear metrics and reports.',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="bg-[#F8F1E6] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div key={feature.title}>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3E5E2]">
                <Icon size={20} className="text-[#B47C80]" />
              </div>

              <h3 className="mb-2 text-base font-bold text-[#321719]">
                {feature.title}
              </h3>

              <p className="max-w-xs text-sm leading-5 text-[#5F4A46]">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturesSection;

