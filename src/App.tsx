import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import AppRoutes from './routes/AppRoutes';
import ApiStatusGuard from "./components/ApiStatusGuard.tsx";
import {store} from "./store/slices";
import {Provider} from "react-redux";
import {NotificationProvider} from "./context/NotificationContext.tsx";

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <ApiStatusGuard>
                    <NotificationProvider>
                        <AppRoutes />
                    </NotificationProvider>
                </ApiStatusGuard>
            </Router>
        </Provider>
    );
};
export default App;
