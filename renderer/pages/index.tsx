import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { resetServerContext } from 'react-beautiful-dnd';
('next/router');

export const getServerSideProps: GetServerSideProps = async () => {
    resetServerContext();
    return { props: {} };
};

const IndexPage = () => {
    const router = useRouter();
    const [isTransitioned, setIsTransitioned] = useState(false);
    const animationControl = useAnimationControls();
    useEffect(() => {
        const handleMessage = (_event, args) => alert(args);

        // add a listener to 'message' channel
        global.ipcRenderer.addListener('message', handleMessage);

        if (typeof document !== 'undefined') {
            document.addEventListener('wheel', (e) => {
                if (e.deltaX >= 40) {
                    setIsTransitioned(true);
                }
            });
        }

        animationControl.start({ x: ['-10%', '0%'], opacity: [0, 1], transition: { duration: 0.25 } });
    }, []);

    useEffect(() => {
        const transition = async () => {
            if (isTransitioned) {
                await animationControl.start({
                    x: '-50%',
                    opacity: [1, 1, 0.25, 0],
                    transition: { duration: 0.25 },
                });
                router.push('/register');
            }
        };
        transition();
    }, [isTransitioned]);
    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div animate={animationControl}>
                    <Layout />
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default IndexPage;
