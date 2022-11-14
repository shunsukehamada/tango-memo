import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import { AnimatePresence } from 'framer-motion';

function MyApp({ Component, pageProps, router }) {
    return (
        <AnimatePresence
            mode="wait"
            key={router.asPath}
            onExitComplete={() => {
                window.scrollTo(0, 0);
                console.log('EXIT COMPLETE', router.asPath);
            }}
        >
            <Component {...pageProps} />
        </AnimatePresence>
    );
}

export default MyApp;
