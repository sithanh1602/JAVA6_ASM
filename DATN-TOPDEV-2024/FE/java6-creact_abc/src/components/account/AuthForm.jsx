import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { FaUser, FaLock, FaEnvelope, FaGoogle, FaFacebook ,FaUserCircle,FaKey,FaPhone} from 'react-icons/fa';
import Modal from 'react-modal'; // Import react-modal



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
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

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


    const handleModalOpen = () => setIsModalOpen(true); // Open modal
    const handleModalClose = () => setIsModalOpen(false); // Close modal

    const handleToggle = () => setIsLogin(!isLogin);

    const handleLogin = async (e) => {
        e.preventDefault();

        // Hiển thị thông báo "Đang đăng nhập..." bằng SweetAlert2
        Swal.fire({
            title: 'Đang đăng nhập...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Thêm thời gian chờ để tăng thời gian hiển thị hiệu ứng loading
        setTimeout(async () => {
            try {
                const encodedPassword = btoa(password);
                const response = await axios.post('http://localhost:8080/api/auth/login', { userName: username, password: encodedPassword });
                const token = response.data.token;
                localStorage.setItem('token', token);
                sessionStorage.setItem('token', token);
                Cookies.set('token', token, { expires: 7, sameSite: 'Strict' });
                const decodedToken = jwtDecode(token);

                localStorage.setItem('roles', JSON.stringify(decodedToken.roles));
                const userRole = decodedToken.roles[0];
                localStorage.setItem('role', userRole);
                localStorage.setItem('UserId', JSON.stringify(decodedToken.userId));
                if (rememberMe) {
                    localStorage.setItem('savedUsername', username);
                    localStorage.setItem('savedPassword', password);
                } else {
                    localStorage.removeItem('savedUsername');
                    localStorage.removeItem('savedPassword');
                }

                // Đóng thông báo "Đang đăng nhập..." và hiển thị thông báo thành công
                Swal.close();
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập thành công!',
                    showConfirmButton: false,
                    timer: 1500
                });

                if (userRole === 'ADMIN') {
                    navigate('/admin');
                } else if (userRole === 'USER') {
                    navigate('/');
                } else {
                    toast.error('Không có quyền truy cập');
                }
            } catch (err) {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Đăng nhập không thành công',
                    text: 'Tài khoản hoặc mật khẩu không đúng'
                });
                console.error('Đăng nhập không thành công:', err);
            }
        }, 10); // Thời gian chờ 2000ms (2 giây)
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

    const handleForgotPassword = async () => {
        try {
            console.log("Sending request with email:", email);
            const response = await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            toast.success(response.data);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error:", error.response.data);
            toast.error('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.');
        }
    };


    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-galaxy">
                <div className="bg-transparent p-8 rounded-lg shadow-lg w-full max-w-md text-white">
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
                                        <input
                                            type="text"
                                            className="mt-1 p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-500 ease-in-out"
                                            placeholder="Nhập tài khoản của bạn"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                        <FaUser
                                            className=" ml-2 mt-1"/> {/* Thêm mt-1 để căn chỉnh icon */}
                                    </div>

                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="password"
                                            className="mt-1 p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-500 ease-in-out"
                                            placeholder="Nhập mật khẩu của bạn"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <FaLock
                                            className=" ml-2 mt-1"/> {/* Thêm mt-1 để căn chỉnh icon */}
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="flex items-center text-white">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                checked={rememberMe}
                                                onChange={() => setRememberMe(!rememberMe)}
                                            />
                                            Ghi nhớ tài khoản và mật khẩu ?
                                        </label>
                                        <button
                                            type="button"
                                            className="text-orange-400 hover:underline"
                                            onClick={handleModalOpen} // Open the modal
                                        >
                                            Quên mật khẩu?
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
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
                                        className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center hover:bg-red-700 transition duration-200 mb-4"
                                    >
                                        <FaGoogle className="w-4 h-4 mr-2"/> {/* Thêm mt-1 để căn chỉnh icon */}
                                        Đăng Nhập với Google
                                    </button>
                                    <button
                                        className="w-full bg-blue-800 text-white py-2 rou   nded flex items-center justify-center hover:bg-blue-900 transition duration-200"
                                    >
                                        <FaFacebook className="w-4 h-4 mr-2"/>
                                        Đăng Nhập với Facebook
                                    </button>
                                </div>
                                <p className="mt-4 text-center text-white-600">
                                    Chưa có tài khoản?{' '}
                                    <button onClick={handleToggle}
                                            className="font-semibold text-orange-400 hover:underline">
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
                                        <input
                                            type="text"
                                            className="mt-1 p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-500 ease-in-out"
                                            placeholder="Nhập họ tên của bạn"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                        <FaUser className="ml-2 mt-1" />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="email"
                                            className="mt-1 p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-500 ease-in-out"
                                            placeholder="Nhập email của bạn"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <FaEnvelope className="ml-2 mt-1" />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="text"
                                            className="mt-1 p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-500 ease-in-out"
                                            placeholder="Nhập số điện thoại của bạn"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                        <FaPhone className="ml-2 mt-1" />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="text"
                                            className="mt-1 p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-500 ease-in-out"
                                            placeholder="Nhập tài khoản của bạn"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                        <FaUserCircle className="ml-2 mt-1" />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="password"
                                            className="mt-1 p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-500 ease-in-out"
                                            placeholder="Nhập mật khẩu của bạn"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <FaLock className="ml-2 mt-1" />
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="password"
                                            className="mt-1 p-2 w-full border-b bg-transparent border-gray-300 focus:outline-none focus:border-blue-500"
                                            placeholder="Nhập lại mật khẩu của bạn"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <FaKey className="ml-2 mt-1" />
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

                                <p className="mt-4 text-center text-white text-gray-600">
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

            {/* Modal for Forgot Password */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleModalClose}
                contentLabel="Forgot Password Modal"
                className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md mx-auto"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <h2 className="text-2xl font-semibold text-center mb-6">Quên Mật Khẩu</h2>
                <div className="mb-4">
                    <input
                        type="email"
                        className="p-2 w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <FaEnvelope className="absolute right-2 top-2" />
                </div>
                <div className="flex justify-center">
                    <button
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                        onClick={handleForgotPassword}
                    >
                        Gửi yêu cầu
                    </button>
                </div>
                <div className="mt-4 text-center">
                    <button
                        onClick={handleModalClose}
                        className="text-red-400 hover:underline"
                    >
                        Đóng
                    </button>
                </div>
            </Modal>
            <style>
                {`
                  .bg-galaxy {
                    background: linear-gradient(135deg, #330867, #4b0082, #8a2be2, #ff00ff);
                    background-size: 200% 200%;
                    animation: galaxy 10s ease infinite;
                  }
        
                  @keyframes galaxy {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}
            </style>
        </>
    );
};

export default AuthForm;
