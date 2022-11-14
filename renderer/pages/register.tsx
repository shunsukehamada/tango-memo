import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { AnimatePresence, AnimationProps, motion } from 'framer-motion';
const Register: React.FC = () => {
    const router = useRouter();
    const [isTransitioned, setIsTransitioned] = useState(false);

    if (typeof document !== 'undefined') {
        document.addEventListener('wheel', (e) => {
            if (!isTransitioned && e.deltaX <= -40) {
                setIsTransitioned(true);
            }
        });
    }
    const slideInAnimationConfig: AnimationProps = {
        animate: isTransitioned
            ? { transition: { duration: 0 }, x: '0%' }
            : {
                  x: '0%',
                  opacity: 1,
              },
        initial: {
            x: '30%',
            opacity: 0,
        },
        exit: {
            x: '30%',
            opacity: 0,
            transition: {
                duration: 0.25,
            },
        },
        transition: {
            duration: 0.25,
        },
    };
    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    {...slideInAnimationConfig}
                    key={Math.random()}
                    onAnimationComplete={(e) => {
                        if (isTransitioned) {
                            router.push('/');
                        }
                    }}
                >
                    <div className="h-screen w-screen flex justify-center items-center overflow-hidden">
                        <div className="font-bold text-9xl">入力画面</div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};
export default Register;
