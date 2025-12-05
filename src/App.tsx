import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import AppRoutes from './routes/AppRoutes';
import Guard from "./components/Guard.tsx";
import {store} from "./store/slices";
import {Provider} from "react-redux";
import {NotificationProvider} from "./context/NotificationContext.tsx";
import './index.css'
const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Guard>
                    <NotificationProvider>
                        <AppRoutes />
                    </NotificationProvider>
                </Guard>
            </Router>
        </Provider>
    );
};
export default App;
