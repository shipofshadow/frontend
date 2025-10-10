import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.tsx";
import Navbar from "../components/common/Navbar.tsx";

export function IndexLayout() {
    return (
        <>
            <Navbar/>
            <main id="wrapper" style={{  minHeight: '100vh' }}>
                <Outlet />
            </main>
            <Footer />

        </>
    );
}