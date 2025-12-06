import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import AppRoutes from './routes/AppRoutes';
import Guard from "./components/Guard.tsx";
import {store} from "./store/slices";
import {Provider} from "react-redux";
import {NotificationProvider} from "./context/NotificationContext.tsx";
import './index.css'
import {SettingsProvider} from "./context/SettingsContext.tsx";
const App: React.FC = () => {
    return (
        <Provider store={store}>
            <SettingsProvider>
            <Router>
                <Guard>
                    <NotificationProvider>
                        <AppRoutes />
                    </NotificationProvider>
                </Guard>
            </Router>
            </SettingsProvider>
        </Provider>
    );
};
export default App;
