import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Input, Checkbox, Button } from '@nextui-org/react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha'; // Import reCAPTCHA
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

axios.defaults.withCredentials = true;

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
    const [secondsLeft, setSecondsLeft] = useState(60);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [recaptchaToken, setRecaptchaToken] = useState(null); // State để lưu token reCAPTCHA
    const navigate = useNavigate();
    const recaptchaRef = useRef(); // Ref để reset reCAPTCHA

    const GOOGLE_CLIENT_ID = '310245911476-bb6s06ookc8aftr8b9lka1n30sl41ou7.apps.googleusercontent.com';
    const RECAPTCHA_SITE_KEY = '6Lc19CQrAAAAAEDjiVHCrgtdJgyGSKbkW6NMR8x-'; // Site Key mới

    useEffect(() => {
        const token = Cookies.get('jwtToken');
        const refreshToken = Cookies.get('refreshToken');

        const redirectIfLoggedIn = async () => {
            try {
                let decodedToken;
                let roles = [];

                if (token) {
                    decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000;
                    if (decodedToken.exp < currentTime) {
                        if (refreshToken) {
                            const response = await axios.post('http://localhost:8080/api/auth/refresh-token');
                            const { data } = response.data;
                            const { token: newToken } = data;
                            Cookies.set('jwtToken', newToken, { expires: 1, secure: true, sameSite: 'Strict' });
                            decodedToken = jwtDecode(newToken);
                            roles = decodedToken.roles || [];
                        } else {
                            Cookies.remove('jwtToken');
                            Cookies.remove('refreshToken');
                            return;
                        }
                    } else {
                        roles = decodedToken.roles || [];
                    }
                } else if (refreshToken) {
                    const response = await axios.post('http://localhost:8080/api/auth/refresh-token');
                    const { data } = response.data;
                    const { token: newToken } = data;
                    Cookies.set('jwtToken', newToken, { expires: 1, secure: true, sameSite: 'Strict' });
                    decodedToken = jwtDecode(newToken);
                    roles = decodedToken.roles || [];
                } else {
                    return;
                }

                if (roles.includes('ADMIN')) {
                    navigate('/admin');
                } else if (roles.includes('USER')) {
                    navigate('/');
                    window.location.reload();
                }
            } catch (err) {
                console.error('Failed to refresh token:', err);
                Cookies.remove('refreshToken');
                Cookies.remove('jwtToken');
            }
        };

        redirectIfLoggedIn();
    }, [navigate]);

    useEffect(() => {
        if (isOtpSent) {
            const timer = setInterval(() => {
                setSecondsLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isOtpSent]);

    const handleToggle = () => setIsLogin(!isLogin);

    // Hàm xử lý khi reCAPTCHA thay đổi
    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Kiểm tra nếu reCAPTCHA chưa được hoàn thành
        if (!recaptchaToken) {
            Swal.fire({
                icon: 'error',
                title: 'Xác minh thất bại',
                text: 'Vui lòng xác minh rằng bạn không phải là robot.',
            });
            return;
        }

        Swal.fire({
            title: 'Đang đăng nhập...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            console.log('Sending login request with:', { username, password, rememberMe, recaptchaToken });
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username,
                password,
                rememberMe,
            });
            console.log('API Response:', response.data);

            const { data, message } = response.data;
            const { token } = data;
            console.log('Token:', token);

            if (message === 'Account is locked') {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Tài khoản bị khóa',
                    text: 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.',
                });
                return;
            }

            Cookies.set('jwtToken', token, { expires: 1, secure: true, sameSite: 'Strict' });
            console.log('Cookie set with token:', token);

            const decodedToken = jwtDecode(token);
            const roles = decodedToken.roles || [];
            console.log('Decoded Token:', decodedToken);
            console.log('Roles:', roles);

            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                showConfirmButton: false,
                timer: 1500,
            });

            if (roles.includes('ADMIN')) {
                navigate('/admin');
            } else if (roles.includes('USER')) {
                console.log('Navigating to /');
                navigate('/');
                window.location.reload();
            } else {
                toast.dismiss();
                toast.error('Không có quyền truy cập');
            }

            // Reset reCAPTCHA sau khi đăng nhập thành công
            setRecaptchaToken(null);
            recaptchaRef.current.reset();
        } catch (err) {
            console.error('Login error:', err);
            Swal.close();
            const errorMessage = err.response?.data?.message || 'Tài khoản hoặc mật khẩu không đúng';
            Swal.fire({
                icon: 'error',
                title: 'Đăng nhập không thành công',
                text: errorMessage,
            });

            // Reset reCAPTCHA nếu đăng nhập thất bại
            setRecaptchaToken(null);
            recaptchaRef.current.reset();
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        Swal.fire({
            title: 'Đang xác thực Google...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await axios.post('http://localhost:8080/api/auth/google', {
                credential: credentialResponse.credential,
                clientId: GOOGLE_CLIENT_ID,
            });

            if (response.data.status === 'success') {
                const { data, message } = response.data;
                const { token } = data;

                Cookies.set('jwtToken', token, { expires: 1, secure: true, sameSite: 'Strict' });

                const decodedToken = jwtDecode(token);
                const roles = decodedToken.roles || [];

                Swal.close();
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập Google thành công!',
                    text: message || 'Chào mừng bạn đã đăng nhập!',
                    showConfirmButton: false,
                    timer: 1500,
                });

                if (roles.includes('ADMIN')) {
                    navigate('/admin');
                } else if (roles.includes('USER')) {
                    navigate('/');
                    window.location.reload();
                } else {
                    toast.dismiss();
                    toast.error('Không có quyền truy cập');
                }
            } else {
                Swal.close();
                const errorMessage = response.data.message || 'Đăng nhập Google thất bại';
                if (response.data.message === 'Account is locked') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Tài khoản bị khóa',
                        text: 'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên.',
                    });
                } else if (response.data.message === 'Client ID không hợp lệ') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi Client ID',
                        text: 'Client ID không hợp lệ. Vui lòng kiểm tra cấu hình.',
                    });
                } else if (response.data.message === 'Token Google không hợp lệ') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi xác minh token',
                        text: 'Token Google không hợp lệ. Vui lòng thử lại.',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Đăng nhập không thành công',
                        text: errorMessage,
                    });
                }
            }
        } catch (err) {
            Swal.close();
            const errorMessage = err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.';
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hệ thống',
                text: errorMessage,
            });
        }
    };

    const handleGoogleLoginFailure = () => {
        Swal.fire({
            icon: 'error',
            title: 'Đăng nhập Google thất bại',
            text: 'Không thể đăng nhập bằng Google. Vui lòng thử lại.',
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.dismiss();
            toast.error('Mật khẩu và xác nhận mật khẩu không khớp.');
            return;
        }

        Swal.fire({
            title: 'Đang đăng ký...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                userName: username,
                email,
                fullName,
                password,
                confirmPassword,
                phone,
            });

            Swal.close();
            setIsOtpSent(true);
            setSecondsLeft(60);
            setIsResendDisabled(true);
            toast.dismiss();
            toast.success(response.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.');
        } catch (error) {
            Swal.close();
            const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            toast.dismiss();
            toast.error(errorMessage);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.dismiss();
            toast.error('Vui lòng nhập mã OTP.');
            return;
        }

        Swal.fire({
            title: 'Đang xác minh OTP...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await axios.post('http://localhost:8080/api/auth/verifyOtp', null, {
                params: { email, otp },
            });

            Swal.close();
            toast.dismiss();
            toast.success(response.data.message || 'Xác thực thành công! Tài khoản đã được kích hoạt.');
            setIsOtpSent(false);
            setIsLogin(true);
        } catch (error) {
            Swal.close();
            const errorMessage = error.response?.data?.message || 'Xác minh OTP thất bại. Vui lòng thử lại.';
            toast.dismiss();
            toast.error(errorMessage);
        }
    };

    const handleResendOtp = async () => {
        Swal.fire({
            title: 'Đang gửi lại OTP...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const response = await axios.post('http://localhost:8080/api/auth/resendOtp', null, {
                params: { email },
            });

            Swal.close();
            toast.dismiss();
            toast.success(response.data.message || 'Đã gửi lại OTP. Vui lòng kiểm tra email.');
            setSecondsLeft(60);
            setIsResendDisabled(true);
            setOtp('');
        } catch (error) {
            Swal.close();
            const errorMessage = error.response?.data?.message || 'Gửi lại OTP thất bại. Vui lòng thử lại.';
            toast.dismiss();
            toast.error(errorMessage);
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-[700px] flex items-center justify-center bg-gray-100">
                <div className="p-8 bg-white shadow-lg rounded-lg w-full max-w-md min-h-[500px]">
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
                                    <div className="mb-4 mt-4">
                                        <Input
                                            label="Tên đăng nhập"
                                            radius="none"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4 mt-4">
                                        <Input
                                            type="password"
                                            label="Mật khẩu"
                                            radius="none"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mb-4 mt-4">
                                        <Checkbox
                                            isSelected={rememberMe}
                                            onValueChange={setRememberMe}
                                        >
                                            Ghi nhớ tài khoản
                                        </Checkbox>
                                        <a href="/reset-password" className="text-blue-600 hover:underline mb-4 mt-4">
                                            Quên mật khẩu?
                                        </a>
                                    </div>
                                    {/* Thêm reCAPTCHA */}
                                    <div className="flex justify-center mb-4 w-full mb-4 mt-4 ">
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={RECAPTCHA_SITE_KEY}
                                            onChange={handleRecaptchaChange}
                                            width="385"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200  mb-4 mt-4"
                                    >
                                        Đăng Nhập
                                    </Button>
                                    <div className="flex justify-center min-h-[90px] w-full mb-4 mt-2">
                                        <GoogleLogin
                                            onSuccess={handleGoogleLoginSuccess}
                                            onError={handleGoogleLoginFailure}
                                            text="signin_with"
                                            shape="rectangular"
                                            theme="outline"
                                            width="385"
                                        />
                                    </div>
                                </form>
                                <p className="mt-2 text-center text-gray-600">
                                    Chưa có tài khoản?{' '}
                                    <button onClick={handleToggle} className="text-blue-600 hover:underline">
                                        Đăng ký
                                    </button>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={isOtpSent ? 'otp' : 'register'}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.5 }}
                            >
                                {isOtpSent ? (
                                    <>
                                        <h2 className="text-2xl font-semibold text-center mb-6">Xác Minh OTP</h2>
                                        <p className="text-center text-gray-600 mb-4">
                                            Nhập mã OTP đã được gửi đến email{' '}
                                            <span className="font-semibold">{email}</span>
                                        </p>
                                        <div className="mb-4">
                                            <Input
                                                type="text"
                                                label="Mã OTP"
                                                radius="none"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="text-center mb-4">
                                            <p className="text-gray-600">
                                                Mã OTP hết hạn trong:{' '}
                                                <span className="font-semibold text-red-600">
                                                    {secondsLeft} giây
                                                </span>
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleVerifyOtp}
                                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-200 mb-2"
                                        >
                                            Xác Minh OTP
                                        </Button>
                                        <Button
                                            onClick={handleResendOtp}
                                            disabled={isResendDisabled}
                                            className={`w-full py-2 rounded transition duration-200 ${
                                                isResendDisabled
                                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                            }`}
                                        >
                                            Gửi Lại OTP
                                        </Button>
                                        <p className="mt-4 text-center text-gray-600">
                                            Đã có tài khoản?{' '}
                                            <button
                                                onClick={() => setIsLogin(true)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Đăng nhập
                                            </button>
                                        </p>
                                    </>
                                ) : (
                                    <>
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

                                            <Button
                                                type="submit"
                                                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                                            >
                                                Đăng Ký
                                            </Button>
                                        </form>
                                        <p className="mt-4 text-center text-gray-600">
                                            Đã có tài khoản?{' '}
                                            <button
                                                onClick={handleToggle}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Đăng nhập
                                            </button>
                                        </p>
                                        <p className="mt-2 text-center text-gray-600">
                                            Hoặc{' '}
                                            <button
                                                onClick={() => setIsLogin(true)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Đăng nhập bằng Google
                                            </button>
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <ToastContainer />
            </div>
        </GoogleOAuthProvider>
    );
};

export default AuthForm;