import { motion, AnimatePresence } from "framer-motion";

interface Props {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function CookieConsent({ visible, onAccept, onDecline }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          <div className="max-w-3xl mx-auto bg-[#1A1A1A] text-white p-5 md:p-6 rounded-sm shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex-1 text-[12px] leading-relaxed text-white/80">
              This site uses cookies to analyze traffic and improve your experience. By continuing, you agree to our use of cookies.
            </div>
            <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={onDecline}
                className="flex-1 sm:flex-none px-5 py-2.5 border border-white/30 text-white/80 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-[#1A1A1A] text-[10px] uppercase tracking-widest font-medium hover:bg-white/90 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
