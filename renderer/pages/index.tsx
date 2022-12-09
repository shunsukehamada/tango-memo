import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';

// export const getServerSideProps: GetServerSideProps = async () => {
//     resetServerContext();
//     return { props: {} };
// };

const IndexPage = () => {
    const router = useRouter();
    const [isTransitioned, setIsTransitioned] = useState(false);
    const animationControl = useAnimationControls();
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.addEventListener('wheel', (e) => {
                if (e.deltaX >= 40) {
                    setIsTransitioned(true);
                }
            });
        }

        animationControl.start({ x: '0%', opacity: 1 });
    }, []);

    useEffect(() => {
        const transition = async () => {
            if (isTransitioned) {
                await animationControl.start({
                    x: '-50%',
                    opacity: 0,
                });
                router.push('/register');
            }
        };
        transition();
    }, [isTransitioned]);
    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, x: '-5%' }}
                    animate={animationControl}
                    transition={{ duration: 0.2 }}
                >
                    <Layout />
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default IndexPage;
