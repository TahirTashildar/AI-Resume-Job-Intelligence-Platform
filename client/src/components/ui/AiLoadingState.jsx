import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Cycles through meaningful status messages while a long-running AI call is in flight.
export default function AiLoadingState({ messages = ['Thinking...'] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 1800);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-white p-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500"
      >
        <Sparkles size={22} />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="text-sm font-medium text-slate-600"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
