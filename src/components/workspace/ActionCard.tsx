import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ActionCardProps {
  onAskAgent?: () => void;
}

export function ActionCard({ onAskAgent }: ActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onAskAgent}
      className="flex-shrink-0 w-[320px] h-[160px] bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-dashed border-orange-300 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-400 transition-all overflow-hidden group cursor-pointer flex flex-col items-center justify-center p-6"
    >
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto group-hover:bg-orange-200 transition-colors">
          <Sparkles size={24} className="text-orange-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-900 mb-1">
            Need help?
          </h3>
          <p className="text-xs text-stone-600 mb-3">
            Ask an Agent to create something new
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-orange-700 group-hover:text-orange-800 transition-colors">
          <span>Start Chat</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}

