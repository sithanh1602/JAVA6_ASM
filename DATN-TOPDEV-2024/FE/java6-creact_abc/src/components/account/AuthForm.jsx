import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { FaLock, FaFacebook } from 'react-icons/fa';
import { Input, Checkbox } from '@nextui-org/react';
import Modal from 'react-modal';
import { useAuth0 } from '@auth0/auth0-react';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [resetStage, setResetStage] = useState('email');
    const navigate = useNavigate();
    const { loginWithRedirect } = useAuth0();

    useEffect(() => {
        try {
            const savedUsername = localStorage.getItem('savedUsername');
            const savedPassword = localStorage.getItem('savedPassword');
            if (savedUsername && savedPassword) {
                setUsername(savedUsername);
                setPassword(savedPassword);
                setRememberMe(true);
            }
        } catch (error) {
            console.error('Error loading saved credentials:', error);
        }
    }, []);

    const handleAuth0Login = () => {
        loginWithRedirect({ redirectUri: window.location.origin });
    };

    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);
    const handleToggle = () => setIsLogin(!isLogin);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Vui lòng nhập tên đăng nhập và mật khẩu');
            return;
        }

        Swal.fire({
            title: 'Đang đăng nhập...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username,
                password,
            });

            const { data, message } = response.data;

            if (message === 'Tài khoản của bạn đang bị khóa') {
                Swal.fire({
                    icon: 'error',
                    title: 'Tài khoản bị khóa',
                    text: 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.',
                });
                return;
            }

            if (message !== 'login success') {
                throw new Error(message || 'Đăng nhập thất bại');
            }

            const { token, userId, userName, roles } = data;

            // Store token
            localStorage.setItem('token', token);
            sessionStorage.setItem('token', token);
            Cookies.set('token', token, { expires: 7, sameSite: 'Strict' });

            // Store user data
            localStorage.setItem('UserId', userId);
            localStorage.setItem('userName', userName);
            localStorage.setItem('roles', JSON.stringify(roles));
            localStorage.setItem('role', roles[0]); // Assume primary role is first

            if (rememberMe) {
                localStorage.setItem('savedUsername', username);
                localStorage.setItem('savedPassword', password);
            } else {
                localStorage.removeItem('savedUsername');
                localStorage.removeItem('savedPassword');
            }

            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                showConfirmButton: false,
                timer: 1500,
            });

            // Navigate based on role
            if (roles.includes('ADMIN')) {
                navigate('/admin');
            } else if (roles.includes('USER')) {
                navigate('/');
                window.location.reload();
            } else {
                toast.error('Không có quyền truy cập');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Đăng nhập không thành công',
                text: err.response?.data?.message || 'Tài khoản hoặc mật khẩu không đúng',
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Mật khẩu và xác nhận mật khẩu không khớp');
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/auth/register', {
                username,
                email,
                phone,
                fullName,
                password,
            });
            setIsOtpSent(true);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra điện thoại để xác nhận mã OTP.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error('Vui lòng nhập mã OTP');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:8080/api/auth/verify-otp',
                null,
                { params: { username, otpCode: otp } }
            );
            setIsRegistered(true);
            toast.success(response.data.message || 'Xác minh thành công!');
            setTimeout(() => setIsLogin(true), 2000); // Switch to login after success
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ.');
        }
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleForgotPassword = async () => {
        if (!resetEmail) {
            toast.error('Vui lòng nhập email');
            return;
        }
        if (!validateEmail(resetEmail)) {
            toast.error('Địa chỉ email không hợp lệ');
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/auth/forgot-password', {
                email: resetEmail,
            });
            toast.success(response.data.message || 'Mã OTP đã được gửi!');
            setResetStage('otp');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi gửi yêu cầu');
        }
    };

    const handleVerifyOtpForgotPassWord = async () => {
        if (!resetOtp || resetOtp.length !== 6) {
            toast.error('Mã OTP phải có 6 chữ số');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:8080/api/auth/verify-otp-for-password',
                null,
                { params: { email: resetEmail, otpCode: resetOtp } }
            );
            toast.success(response.data.message || 'OTP xác minh thành công!');
            setResetStage('newPassword');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã OTP không chính xác');
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:8080/api/auth/reset-password',
                null,
                { params: { email: resetEmail, newPassword } }
            );
            toast.success(response.data.message || 'Đặt lại mật khẩu thành công!');
            setIsModalOpen(false);
            setResetStage('email');
            setTimeout(() => setIsLogin(true), 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 border-3 w-full max-w-md bg-white rounded-lg shadow-lg">
                <AnimatePresence mode="wait">
                    {isLogin ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-2xl font-semibold text-center mb-6">Đăng Nhập</h2>
                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <Input
                                        label="Tên đăng nhập"
                                        radius="none"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Input
                                        type="password"
                                        label="Mật khẩu"
                                        radius="none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
                                        Ghi nhớ tài khoản
                                    </Checkbox>
                                    <button
                                        type="button"
                                        className="text-blue-600 hover:underline"
                                        onClick={handleModalOpen}
                                    >
                                        Quên mật khẩu?
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                >
                                    Đăng Nhập
                                </button>
                            </form>
                            <div className="mt-6">
                                <button
                                    onClick={handleAuth0Login}
                                    className="w-full bg-red-600 text-white py-2 flex items-center justify-center rounded hover:bg-red-700 mb-4"
                                >
                                    <FaLock className="mr-2" />
                                    Đăng Nhập với Auth0
                                </button>
                                <button
                                    className="w-full bg-blue-800 text-white py-2 flex items-center justify-center rounded hover:bg-blue-900"
                                >
                                    <FaFacebook className="mr-2" />
                                    Đăng Nhập với Facebook
                                </button>
                            </div>
                            <p className="mt-4 text-center">
                                Chưa có tài khoản?{' '}
                                <button onClick={handleToggle} className="text-blue-600 hover:underline">
                                    Đăng ký
                                </button>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-2xl font-semibold text-center mb-6">Đăng Ký</h2>
                            <form onSubmit={handleRegister}>
                                <div className="mb-4">
                                    <Input
                                        label="Họ và Tên"
                                        radius="none"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Input
                                        label="Email"
                                        type="email"
                                        radius="none"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Input
                                        label="Số điện thoại"
                                        type="text"
                                        radius="none"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Input
                                        label="Tên tài khoản"
                                        radius="none"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Input
                                        type="password"
                                        label="Mật khẩu"
                                        radius="none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <Input
                                        type="password"
                                        label="Xác nhận mật khẩu"
                                        radius="none"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                >
                                    Đăng Ký
                                </button>
                            </form>
                            {isOtpSent && (
                                <div className="mt-4">
                                    <Input
                                        label="Mã OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                    <button
                                        onClick={handleVerifyOtp}
                                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-2"
                                    >
                                        Xác minh OTP
                                    </button>
                                </div>
                            )}
                            <p className="mt-4 text-center">
                                Đã có tài khoản?{' '}
                                <button onClick={handleToggle} className="text-blue-600 hover:underline">
                                    Đăng nhập
                                </button>
                            </p>
                            {isRegistered && (
                                <p className="mt-4 text-center text-green-600">Đăng ký thành công!</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <ToastContainer />

            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                contentLabel="Forgot Password Modal"
                className="bg-white p-6 rounded-lg w-full max-w-md mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                {resetStage === 'email' && (
                    <div>
                        <h2 className="text-2xl mb-4">Quên Mật Khẩu</h2>
                        <Input
                            type="email"
                            label="Email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                        />
                        <button
                            onClick={handleForgotPassword}
                            className="w-full bg-blue-600 text-white py-2 rounded mt-4"
                        >
                            Gửi Mã OTP
                        </button>
                    </div>
                )}
                {resetStage === 'otp' && (
                    <div>
                        <h2 className="text-2xl mb-4">Xác Minh OTP</h2>
                        <Input
                            label="Mã OTP"
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value)}
                            maxLength="6"
                            required
                        />
                        <button
                            onClick={handleVerifyOtpForgotPassWord}
                            className="w-full bg-green-600 text-white py-2 rounded mt-4"
                        >
                            Xác Minh
                        </button>
                    </div>
                )}
                {resetStage === 'newPassword' && (
                    <div>
                        <h2 className="text-2xl mb-4">Đặt Lại Mật Khẩu</h2>
                        <Input
                            type="password"
                            label="Mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            label="Xác nhận mật khẩu"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            className="mt-4"
                        />
                        <button
                            onClick={handleResetPassword}
                            className="w-full bg-blue-600 text-white py-2 rounded mt-4"
                        >
                            Đặt Lại Mật Khẩu
                        </button>
                    </div>
                )}
                <button
                    onClick={handleModalClose}
                    className="w-full bg-gray-600 text-white py-2 rounded mt-4"
                >
                    Đóng
                </button>
            </Modal>
        </div>
    );
};

export default AuthForm;