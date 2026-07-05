import { motion } from 'framer-motion';
import {Check,LucideIcon} from 'lucide-react'

interface RoleCardProps {
  role: 'entrepreneur' | 'mentor';
  title: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onChange: (role: 'entrepreneur' | 'mentor') => void;
}


//mon cmpst
export function RoleCard({
  role,
  title,
  description,
  icon : Icon,
  isSelected,
  onChange,
}: RoleCardProps) {
  return (
    <motion.button
      onClick={() => onChange(role)}
      className={`relative p-2 rounded-xl border-2 transition-all flex flex-col items-center text-center cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icône */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 transition-all ${
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
         <Icon size={16} strokeWidth={2} />
      </div>

      {/* Titre */}
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground">{description}</p>

      {/* Indicateur sélection */}
      {isSelected && (
        <motion.div
          className="absolute top-3 right-3 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="text-white text-xs"><Check size={10}/></span>
        </motion.div>
      )}
    </motion.button>
  );
}
