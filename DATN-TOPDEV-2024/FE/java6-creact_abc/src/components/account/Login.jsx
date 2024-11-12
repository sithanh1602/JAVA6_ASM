import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { userName: username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      // Giải mã token để kiểm tra thông tin
      const decodedToken = jwtDecode(token); // Hoặc sử dụng parseJwt(token);
      console.log(decodedToken); // In ra nội dung token để kiểm tra

      toast.success('Đăng nhập thành công!'); // Show success notification
    } catch (err) {
      toast.error('Tài khoản hoặc mật khẩu không đúng'); // Show error notification
      console.error('Đăng nhập không thành công:', err);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6">Đăng Nhập</h2>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700" htmlFor="login-username">Tài khoản</label>
              <input
                  type="text"
                  id="login-username" // Thay đổi id thành duy nhất
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tài khoản của bạn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} // Cập nhật trạng thái khi thay đổi
                  required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700" htmlFor="login-password">Mật khẩu</label>
              <input
                  type="password"
                  id="login-password" // Thay đổi id thành duy nhất
                  className="mt-1 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Cập nhật trạng thái khi thay đổi
                  required
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox text-blue-600" />
                  <span className="ml-2 text-gray-700">Nhớ mật khẩu</span>
                </label>
              </div>
              <div>
                <a href="#" className="text-blue-600 hover:underline">Quên mật khẩu?</a>
              </div>
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
            <span className="text-gray-500 mx-2">Hoặc</span>
            <span className="border-t w-1/5 inline-block"></span>
          </div>

          <div className="mt-6">
            <button
                className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center hover:bg-red-700 transition duration-200 mb-4"
            >
              <img src="" alt="Google" className="w-6 h-6 mr-2" />
              Đăng Nhập với Google
            </button>
            <button
                className="w-full bg-blue-800 text-white py-2 rounded flex items-center justify-center hover:bg-blue-900 transition duration-200"
            >
              <img src="" alt="Facebook" className="w-6 h-6 mr-2" />
              Đăng Nhập với Facebook
            </button>
          </div>
        </div>
        <ToastContainer /> {/* Add ToastContainer to display notifications */}
      </div>
  );
};

export default Login;
