import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AuthForm from "../components/account/AuthForm";
import HomePage from "../pages/home";
import ResetPassword from "../components/account/ResetPassword";
import WebSocketNotification from "../components/account/WebSocketNotification";
import {NextUIProvider} from "@nextui-org/react";
import SmoothScroll from "../services/SmoothScroll";
import 'react-toastify/dist/ReactToastify.css';
import {  ThemeProvider } from './ThemeContext';
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
                            <Route path="/reset-password" element={<ResetPassword />} />
                        </Routes>
                    </div>
                </Router>
            </NextUIProvider>
        </SmoothScroll>
        </ThemeProvider>
    );
}

export default App;
