import { Outlet } from "react-router-dom";
import Footer from "../components/Footer.tsx";

export function IndexLayout() {
    return (
        <>
            <Outlet />
            <Footer />
        </>
    );
}

