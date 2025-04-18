import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AuthForm from "../components/account/AuthForm";
import HomePage from "../pages/home";
import WebSocketNotification from "../components/account/WebSocketNotification";
import {NextUIProvider} from "@nextui-org/react";
import SmoothScroll from "../services/SmoothScroll";
import {  ThemeProvider } from './ThemeContext';
import Callback from "../views/Callback";
const App = () => {
    return (
        <ThemeProvider>
        <SmoothScroll>
            <NextUIProvider>
                <Router>
                    <WebSocketNotification />
                    <div className="min-h-screen flex flex-col">
                        <Routes>
                            <Route path="/*" element={<HomePage />} />
                            <Route path="/admin/*" element={<AdminLayout />} />
                            <Route path="/login" element={<AuthForm />} />
                            <Route path="/callback" element={<Callback />} />
                        </Routes>
                    </div>
                </Router>
            </NextUIProvider>
        </SmoothScroll>
        </ThemeProvider>
    );
}

export default App;
