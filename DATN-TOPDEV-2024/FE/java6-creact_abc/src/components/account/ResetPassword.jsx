import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import { Input, Button } from "@nextui-org/react";

const ResetPassword = () => {
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetStage, setResetStage] = useState("email");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Debug: Log resetStage whenever it changes
  useEffect(() => {}, [resetStage]);

  // Email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Hàm xử lý thông báo thành công với màu xanh lá
  const showSuccessToast = (message) => {
    toast.success(message, {
      style: {
        background: "#10B981", // Màu xanh lá (green-500)
        color: "white",
      },
      iconTheme: {
        primary: "white",
        secondary: "#10B981",
      },
    });
  };

  const handleForgotPassword = async () => {
    // Validate email before sending
    if (!resetEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(resetEmail)) {
      toast.error("Địa chỉ email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // Sử dụng axios trực tiếp thay vì apiClient
      const response = await axios.post(
        "http://localhost:8080/api/auth/forgot-password",
        { email: resetEmail },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: false,
        }
      );

      // Xử lý phản hồi theo cấu trúc Response<String>
      if (response.data && response.data.status === "success") {
        showSuccessToast(response.data.data || response.data.message);

        // Fix: Ensure state update is properly triggered
        setTimeout(() => {
          setResetStage("otp");
        }, 100);
      } else {
        toast.error(response.data.message || "Không thể gửi OTP");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi gửi yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Validate OTP
    if (!resetOtp || resetOtp.length !== 6) {
      toast.error("Mã OTP phải có 6 chữ số");
      return;
    }

    setLoading(true);
    try {
      // Sử dụng axios trực tiếp thay vì apiClient
      const response = await axios.post(
        "http://localhost:8080/api/auth/verify-otp-for-password",
        null,
        {
          params: {
            email: resetEmail,
            otpCode: resetOtp,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: false,
        }
      );

      // Xử lý phản hồi theo cấu trúc Response<String>
      if (response.data && response.data.status === "success") {
        showSuccessToast(response.data.data || response.data.message);

        // Fix: Ensure state update is properly triggered
        setTimeout(() => {
          setResetStage("newPassword");
        }, 100);
      } else {
        toast.error(response.data.message || "Mã OTP không chính xác");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã OTP không chính xác");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Validate new password
    if (!newPassword || newPassword.length < 3) {
      toast.error("Mật khẩu phải có ít nhất 3 ký tự");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      // Sử dụng axios trực tiếp thay vì apiClient
      const response = await axios.post(
        "http://localhost:8080/api/auth/reset-password",
        null,
        {
          params: {
            email: resetEmail,
            newPassword: newPassword,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: false,
        }
      );

      // Xử lý phản hồi theo cấu trúc Response<String>
      if (response.data && response.data.status === "success") {
        // Sử dụng showSuccessToast với màu xanh lá thay vì toast.success
        showSuccessToast(response.data.data || response.data.message);

        // Đảm bảo chuyển hướng về trang đăng nhập sau khi thành công

        setTimeout(() => {
          navigate("/loginn");
        }, 2000);
      } else {
        toast.error(response.data.message || "Không thể đặt lại mật khẩu");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-galaxy p-4">
      <div className="p-8 border-3 w-full max-w-md bg-gray-800 rounded-lg shadow-lg">
        <ToastContainer />

        {resetStage === "email" && (
          <div>
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Quên Mật Khẩu
            </h2>
            <p className="text-gray-300 mb-4">
              Nhập email của bạn để nhận mã xác nhận.
            </p>

            <div className="mb-4">
              <Input
                type="email"
                label="Email"
                placeholder="Nhập email của bạn"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                startContent={<FaEnvelope className="text-gray-400" />}
                className="w-full"
                required
              />
            </div>

            <Button
              color="primary"
              className="w-full"
              onClick={handleForgotPassword}
              isLoading={loading}
            >
              {loading ? "Đang gửi..." : "Gửi Mã OTP"}
            </Button>

            <div className="mt-4 text-center">
              <Button
                color="primary"
                variant="light"
                onClick={() => navigate("/loginn")}
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </div>
        )}

        {resetStage === "otp" && (
          <div>
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Xác Minh OTP
            </h2>
            <p className="text-gray-300 mb-4">
              Vui lòng nhập mã OTP đã được gửi đến email của bạn.
            </p>

            <div className="mb-4">
              <Input
                type="text"
                label="Mã OTP"
                placeholder="Nhập mã OTP 6 số"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                startContent={<FaKey className="text-gray-400" />}
                className="w-full"
                maxLength={6}
                required
              />
            </div>

            <Button
              color="primary"
              className="w-full"
              onClick={handleVerifyOtp}
              isLoading={loading}
            >
              {loading ? "Đang xác minh..." : "Xác Minh OTP"}
            </Button>

            <div className="mt-4 flex justify-between">
              <Button
                color="primary"
                variant="light"
                onClick={() => setResetStage("email")}
              >
                Quay lại
              </Button>

              <Button
                color="primary"
                variant="light"
                onClick={handleForgotPassword}
              >
                Gửi lại OTP
              </Button>
            </div>
          </div>
        )}

        {resetStage === "newPassword" && (
          <div>
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Đặt Lại Mật Khẩu
            </h2>
            <p className="text-gray-300 mb-4">
              Tạo mật khẩu mới cho tài khoản của bạn.
            </p>

            <div className="mb-4">
              <Input
                type="password"
                label="Mật khẩu mới"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                startContent={<FaLock className="text-gray-400" />}
                className="w-full"
                required
              />
            </div>

            <div className="mb-4">
              <Input
                type="password"
                label="Xác nhận mật khẩu"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                startContent={<FaLock className="text-gray-400" />}
                className="w-full"
                required
              />
            </div>

            <Button
              color="primary"
              className="w-full"
              onClick={handleResetPassword}
              isLoading={loading}
            >
              {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
            </Button>

            <div className="mt-4 text-center">
              <Button
                color="default"
                variant="light"
                onClick={() => setResetStage("otp")}
              >
                Quay lại
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
