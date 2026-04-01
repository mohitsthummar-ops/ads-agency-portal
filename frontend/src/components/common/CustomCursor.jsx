import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';

export default function CustomCursor() {
    const { cursorType, cursorText } = useCursor();
    const [isHovering, setIsHovering] = useState(false);
    const [activeLabel, setActiveLabel] = useState('');
    const shouldReduceMotion = useReducedMotion();

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 250, mass: 0.1 };
    const ringX = useSpring(mouseX, springConfig);
    const ringY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            const target = e.target;
            const isClickable = target.closest('a, button, .clickable');
            const dataLabel = target.closest('[data-cursor-label]')?.getAttribute('data-cursor-label');

            if (isClickable) setIsHovering(true);
            if (dataLabel) setActiveLabel(dataLabel);
        };

        const handleMouseOut = () => {
            setIsHovering(false);
            setActiveLabel('');
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mouseout', handleMouseOut);

        // Hide default cursor
        document.body.classList.add('custom-cursor-active');

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mouseout', handleMouseOut);
            document.body.classList.remove('custom-cursor-active');
        };
    }, [mouseX, mouseY]);

    if (shouldReduceMotion) return null;

    const variants = {
        default: {
            width: 32,
            height: 32,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
        },
        pointer: {
            width: 80,
            height: 80,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '0px solid rgba(59, 130, 246, 0)',
            backdropFilter: 'blur(4px)',
        },
        text: {
            width: 4,
            height: 80,
            backgroundColor: 'rgba(59, 130, 246, 1)',
            borderRadius: '2px',
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[99999] hidden lg:block">
            {/* Smooth Ring */}
            <motion.div
                className="absolute rounded-full flex items-center justify-center mix-blend-multiply overflow-hidden"
                style={{
                    x: ringX,
                    y: ringY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={isHovering || activeLabel ? 'pointer' : 'default'}
                variants={variants}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <AnimatePresence>
                    {activeLabel && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="text-[10px] font-bold uppercase tracking-wider text-blue-800"
                        >
                            {activeLabel}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Sharp Dot */}
            <motion.div
                className="absolute w-1.5 h-1.5 bg-blue-600 rounded-full"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: '-50%',
                    translateY: '-50%',
                    zIndex: 10
                }}
                animate={{
                    scale: isHovering || activeLabel ? 0 : 1,
                    opacity: isHovering || activeLabel ? 0 : 1
                }}
            />
        </div>
    );
}
