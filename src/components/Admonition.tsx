import { type FC, type ReactNode } from 'react';
import { Info, Lightbulb, AlertTriangle, XCircle } from 'lucide-react';

interface AdmonitionProps {
  type: 'note' | 'tip' | 'info' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
}

const admonitionConfig = {
  note: {
    icon: Info,
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-400',
    iconColor: 'text-slate-600',
    titleColor: 'text-slate-800',
    title: 'Note',
  },
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    title: 'Tip',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    title: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
    title: 'Warning',
  },
  danger: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    title: 'Danger',
  },
};

const Admonition: FC<AdmonitionProps> = ({ type, title, children }) => {
  const config = admonitionConfig[type] || admonitionConfig.note;
  const Icon = config.icon;

  return (
    <div className={`my-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} p-4`}>
      <div className={`flex items-center gap-2 font-semibold ${config.titleColor} mb-2`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span>{title || config.title}</span>
      </div>
      <div className="text-slate-700 prose-p:my-1 prose-p:leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default Admonition;
