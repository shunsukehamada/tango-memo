import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { AnimatePresence, AnimationProps, motion } from 'framer-motion';
('next/router');

const IndexPage = () => {
    const router = useRouter();
    const [isTransitioned, setIsTransitioned] = useState(false);
    useEffect(() => {
        const handleMessage = (_event, args) => alert(args);

        // add a listener to 'message' channel
        global.ipcRenderer.addListener('message', handleMessage);

        if (typeof document !== 'undefined') {
            document.addEventListener('wheel', (e) => {
                if (!isTransitioned && e.deltaX >= 40) {
                    setIsTransitioned(true);
                }
            });
        }

        return () => {
            global.ipcRenderer.removeListener('message', handleMessage);
        };
    }, []);

    const onSayHiClick = () => {
        global.ipcRenderer.send('message', 'hi from next');
    };

    const slideInAnimationConfig: AnimationProps = {
        animate: isTransitioned
            ? { transition: { duration: 0 }, x: '0%' }
            : {
                  x: '0%',
                  opacity: 1,
              },
        initial: {
            x: '-30%',
            opacity: 0,
        },
        exit: {
            x: '-30%',
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
                            router.push('/register');
                        }
                    }}
                >
                    <Layout />
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default IndexPage;
