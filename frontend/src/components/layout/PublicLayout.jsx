import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../common/PageTransition';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
    const location = useLocation();

    return (
        <div className="animated-bg min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 pt-16">
                <AnimatePresence mode="wait">
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>
            </main>
            <Footer />
        </div>
    );
}
