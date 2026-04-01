import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        x: 60,
        scale: 1
    },
    animate: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1], // Smooth ease out
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        x: -60,
        scale: 0.95,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export default function PageTransition({ children }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}
