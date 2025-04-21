import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { FaLock, FaFacebook} from 'react-icons/fa';
import {Input, Checkbox} from "@nextui-org/react";
import { useAuth0 } from "@auth0/auth0-react";



const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Thêm state cho mật khẩu nhập lại
    const [rememberMe, setRememberMe] = useState(false);
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const navigate = useNavigate(); // Sử dụng useNavigate thay vì useHistory
    const { loginWithRedirect } = useAuth0();


    useEffect(() => {
        // Tải tên đăng nhập và mật khẩu từ localStorage khi component được tải
        const savedUsername = localStorage.getItem('savedUsername');
        const savedPassword = localStorage.getItem('savedPassword');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleAuth0Login = () => {
        loginWithRedirect({
            redirectUri: window.location.origin,
        });
    };


    const handleToggle = () => setIsLogin(!isLogin);
    const handleLogin = async (e) => {
        e.preventDefault();

        // Show loading notification with SweetAlert2
        Swal.fire({
            title: 'Đang đăng nhập...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Send login request with raw password
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username: username,
                password: password
            });

            const { data, message } = response.data;
            const { token, userId, userName, fullName, phone, roles } = data;

            // Check for locked account
            if (message === "Account is locked") {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Tài khoản bị khóa',
                    text: 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.'
                });
                return;
            }

            // Store token in localStorage, sessionStorage, and Cookies
            localStorage.setItem('token', token);
            sessionStorage.setItem('token', token);
            Cookies.set('token', token, { expires: 7, sameSite: 'Strict' });

            // Store user information
            localStorage.setItem('roles', JSON.stringify(roles));
            const userRole = roles[0]; // Assuming the first role is the primary role
            localStorage.setItem('role', userRole);
            localStorage.setItem('UserId', userId);
            localStorage.setItem('userName', userName);
            localStorage.setItem('fullName', fullName);
            localStorage.setItem('phone', phone);

            // Save login info if rememberMe is checked
            if (rememberMe) {
                localStorage.setItem('savedUsername', username);
                localStorage.setItem('savedPassword', password);
            } else {
                localStorage.removeItem('savedUsername');
                localStorage.removeItem('savedPassword');
            }

            // Close loading notification and show success message
            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                showConfirmButton: false,
                timer: 1500
            });

            // Navigate based on user role
            if (userRole === 'ADMIN') {
                navigate('/admin');
            } else if (userRole === 'USER') {
                navigate('/');
                window.location.reload(); // Reload page after redirect
            } else {
                toast.error('Không có quyền truy cập');
            }
        } catch (err) {
            Swal.close();

            // Handle login errors and display error message
            let errorMessage = 'Tài khoản hoặc mật khẩu không đúng';
            if (err.response && err.response.data) {
                errorMessage = err.response.data.message || errorMessage;
            }

            Swal.fire({
                icon: 'error',
                title: 'Đăng nhập không thành công',
                text: errorMessage
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Mật khẩu và mật khẩu nhập lại không khớp.');
            return;
        }
        try {
            await axios.post('http://localhost:8080/api/auth/register', {
                userName: username,
                email,
                phone,
                fullName,
                password
            });
            setIsOtpSent(true);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra điện thoại để xác nhận mã OTP.');
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data);
            } else {
                toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/verify-otp', null, {
                params: {
                    userName: username,
                    otpCode: otp
                }
            });
            setIsRegistered(true);
            toast.success(response.data);
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data);
            } else {
                toast.error('Đã xảy ra lỗi khi xác minh OTP. Vui lòng thử lại.');
            }
        }
    };

    // Email validation regex
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };


    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-galaxy">
                <div className="p-8 border-3 w-full max-w-md ">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="login"
                                initial={{opacity: 0, x: 50}}
                                animate={{opacity: 1, x: 0}}
                                exit={{opacity: 0, x: -50}}
                                transition={{duration: 0.5}}
                            >
                                <h2 className="text-2xl font-semibold text-center mb-6">Đăng Nhập</h2>
                                <form onSubmit={handleLogin}>
                                    <div className="mb-4 flex items-center">
                                        <Input
                                            label="Tên đăng nhập"
                                            radius="none"
                                            className="border-gray-500"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4 flex items-center">
                                        <Input
                                            type="password"
                                            radius="none"
                                            className="border-gray-500"
                                            label="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="flex items-center">
                                            <Checkbox
                                                isSelected={rememberMe}
                                                onValueChange={setRememberMe}
                                            >
                                                Ghi nhớ tài khoản và mật khẩu
                                            </Checkbox>
                                        </label>
                                        <a
                                            href="/reset-password"
                                            className="text-orange-400 hover:underline"
                                        >
                                            Quên mật khẩu?
                                        </a>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-2 hover:bg-blue-700 transition duration-200"
                                    >
                                        Đăng Nhập
                                    </button>
                                </form>
                                <div className="flex items-center justify-center mt-6">
                                    <span className="border-t w-1/5 inline-block"></span>
                                    <span className="text-white-500 mx-2">Hoặc</span>
                                    <span className="border-t w-1/5 inline-block"></span>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={handleAuth0Login} // Gọi hàm đăng nhập Auth0
                                        className="w-full bg-red-600 text-white py-2 flex items-center justify-center hover:bg-red-700 transition duration-200 mb-4"
                                    >
                                        <FaLock className="w-4 h-4 mr-2"/> {/* Thay FaGoogle bằng FaLock */}
                                        Đăng Nhập với Auth0
                                    </button>
                                    <button
                                        className="w-full bg-blue-800 text-white py-2 flex items-center justify-center hover:bg-blue-900 transition duration-200"
                                    >
                                        <FaFacebook className="w-4 h-4 mr-2"/>
                                        Đăng Nhập với Facebook
                                    </button>
                                </div>
                                <p className="mt-4 text-center text-white-600">
                                    Chưa có tài khoản?{' '}
                                    <button onClick={handleToggle}
                                            className=" text-orange-400 hover:underline">
                                        Đăng ký
                                    </button>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register"
                                initial={{opacity: 0, x: -50}}
                                animate={{opacity: 1, x: 0}}
                                exit={{opacity: 0, x: 50}}
                                transition={{duration: 0.5}}
                            >
                                <h2 className="text-2xl font-semibold text-center mb-6">Đăng Ký</h2>
                                <form onSubmit={handleRegister}>
                                    <div className="mb-4 flex items-center">
                                        <Input
                                            label="Họ và Tên"
                                            radius="none"
                                            type="text"
                                            className="border-gray-300"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <Input
                                            label="Email"
                                            radius="none"
                                            type="email"
                                            className="border-gray-300"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <Input
                                            label="Số điện thoại"
                                            type="text"
                                            radius="none"
                                            className="border-gray-300"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <Input
                                            type="text"
                                            label="Tên tài khoản"
                                            radius="none"
                                            className="border-gray-300"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <Input
                                            type="password"
                                            label="Mật khẩu"
                                            radius="none"
                                            className="border-gray-300"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <Input
                                            type="password"
                                            label="Mật khẩu"
                                            radius="none"
                                            className="border-gray-300"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-center mt-6">
                                        <span className="border-t w-1/5 inline-block"></span>
                                        <span className="text-white-500 mx-2">Chú ý</span>
                                        <span className="border-t w-1/5 inline-block"></span>
                                    </div>
                                    <div className="flex items-center justify-center mt-6 mb-3">
                    <span className="text-white-500 text-sm mx-2">
                        Dữ liệu cá nhân của bạn sẽ được sử dụng để hỗ trợ trải nghiệm của bạn trên toàn bộ trang web này, để quản lý quyền truy cập vào tài khoản của bạn và cho các mục đích khác được mô tả trong
                        <a href="/privacy-policy" className="text-orange-500 hover:text-orange-700 transition duration-200"> chính sách riêng tư</a>.
                    </span>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                                    >
                                        Đăng Ký
                                    </button>
                                </form>

                                {/* Hiển thị ô nhập mã xác nhận nếu mã OTP đã được gửi */}
                                {isOtpSent && (
                                    <div className="mt-4">
                                        <h4 className="text-lg">Nhập mã xác nhận đã gửi đến điện thoại của bạn:</h4>
                                        <input
                                            type="text"
                                            className="mt-1 p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-500 ease-in-out"
                                            placeholder="Nhập mã xác nhận"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                        />
                                        <button
                                            onClick={handleVerifyOtp}
                                            className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200"
                                        >
                                            Xác minh mã xác nhận
                                        </button>
                                    </div>
                                )}

                                <p className="mt-4 text-center">
                                    Đã có tài khoản?{' '}
                                    <button onClick={handleToggle} className="font-semibold text-orange-400 hover:underline">
                                        Đăng nhập
                                    </button>
                                </p>

                                {/* Hiển thị thông báo đăng ký thành công nếu đã xác minh mã */}
                                {isRegistered && (
                                    <p className="mt-4 text-center text-green-500 font-semibold">Đăng ký thành công!</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <ToastContainer/>
            </div>
        </>
    );
};

export default AuthForm;
