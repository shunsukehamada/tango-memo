import 'tailwindcss/tailwind.css';
import '../styles/global.css';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';

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
            <ThemeProvider attribute="class" defaultTheme="light">
                <Component {...pageProps} />
            </ThemeProvider>
        </AnimatePresence>
    );
}

export default MyApp;
