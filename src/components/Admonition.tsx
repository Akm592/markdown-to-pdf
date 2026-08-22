import { type FC, type ReactNode } from 'react';
import { Info, Lightbulb, AlertTriangle, XCircle } from 'lucide-react';
import { ADMONITION_LABELS, type AdmonitionType } from '../lib/markdownPlugins';

interface AdmonitionProps {
  type: AdmonitionType;
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
  },
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
  },
  danger: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
  },
};

const Admonition: FC<AdmonitionProps> = ({ type, title, children }) => {
  const config = admonitionConfig[type] || admonitionConfig.note;
  const Icon = config.icon;

  return (
    <div className={`my-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} p-4`}>
      <div className={`flex items-center gap-2 font-semibold ${config.titleColor} mb-2`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span>{title || ADMONITION_LABELS[type]}</span>
      </div>
      <div className="text-slate-700 prose-p:my-1 prose-p:leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default Admonition;
