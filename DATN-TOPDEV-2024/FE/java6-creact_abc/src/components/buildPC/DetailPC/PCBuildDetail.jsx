import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BuildPCService from "../../../services/BuildPcService";
import { addPcToCart } from "../../../services/CartService"; // Thay đổi từ addProductToCart thành addPcToCart
import Swal from "sweetalert2";

const PCBuildDetail = () => {
  const { buildId } = useParams();
  const navigate = useNavigate();
  const [build, setBuild] = useState(null);
  const [error, setError] = useState(null);
  // Add new state variables for image gallery
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchBuildPCDetails = async () => {
      try {
        console.log("Bắt đầu gọi API với buildId:", buildId);
        const response = await BuildPCService.getBuildPCById(buildId);
        console.log("Dữ liệu từ API:", response.data);
        setBuild(response.data);

        // Initialize images array with all available images
        if (response.data) {
          let imagesList = [];

          // Add main image first if it exists
          if (response.data.image) {
            imagesList.push({ id: 0, image: response.data.image });
          }

          // Add all additional images from imageUrls array if it exists
          if (response.data.imageUrls && Array.isArray(response.data.imageUrls)) {
            // Skip the first image if it's the same as the main image to avoid duplication
            const additionalImages = response.data.imageUrls.filter(
              (url) => url !== response.data.image
            );

            additionalImages.forEach((imageUrl, index) => {
              imagesList.push({ id: index + 1, image: imageUrl });
            });
          }

          // If we have at least one image, set the main image and update the images array
          if (imagesList.length > 0) {
            setImages(imagesList);
            setMainImage(imagesList[0].image);
            setMainImageIndex(0);
          }
        }
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError(err.message);
      }
    };
    fetchBuildPCDetails();
  }, [buildId]);

  // Add image navigation functions
  const handleImageChange = (index) => {
    setMainImageIndex(index);
    setMainImage(images[index]?.image || null);
  };

  const handlePreviousImage = () => {
    const newIndex = mainImageIndex > 0 ? mainImageIndex - 1 : images.length - 1;
    handleImageChange(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = mainImageIndex < images.length - 1 ? mainImageIndex + 1 : 0;
    handleImageChange(newIndex);
  };

  // Log giá trị của build mỗi khi nó thay đổi
  useEffect(() => {
    console.log("Giá trị hiện tại của build:", build);
  }, [build]);

  const handleAddAllToCart = async () => {
    const userId = localStorage.getItem("UserId");
    const role = localStorage.getItem("role");

    if (!userId) {
      Swal.fire({
        title: "Thông báo",
        text: "Vui lòng đăng nhập trước khi thêm vào giỏ hàng",
        icon: "warning",
        confirmButtonText: "Đăng nhập",
      }).then(() => {
        navigate("/login");
      });
      return;
    }

    if (role === "ADMIN") {
      Swal.fire({
        title: "Thông báo",
        text: "Quản trị viên không được phép thêm sản phẩm vào giỏ hàng",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Đang xử lý...",
        text: "Đang thêm BuildPC vào giỏ hàng",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      if (!build || !build.buildId) {
        throw new Error("Không tìm thấy thông tin BuildPC");
      }

      // Thêm BuildPC vào giỏ hàng với số lượng mặc định là 1
      await addPcToCart(userId, build.buildId, 1);

      Swal.fire({
        title: "Thành công",
        text: "Đã thêm BuildPC vào giỏ hàng!",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Xem giỏ hàng",
        cancelButtonText: "Tiếp tục mua sắm",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/cart");
        }
      });
    } catch (error) {
      Swal.fire("Lỗi", "Có lỗi xảy ra khi thêm BuildPC vào giỏ hàng", "error");
    }
  };

  if (error) return <div className="text-red-500 text-center mt-10 text-lg">Error: {error}</div>;
  if (!build) return <div className="text-center mt-10 text-gray-500 text-lg">Loading...</div>;

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="container mx-auto px-4 max-w-6xl bg-white">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái - Hình ảnh và Thông số kỹ thuật */}
            <div className="space-y-4">
              {/* Updated image display with navigation */}
              <div className="relative w-full h-[400px] overflow-hidden flex items-center justify-center">
                <img
                  src={mainImage || build.image || "https://placehold.co/400x300?text=PC+Build"}
                  alt={build.buildName}
                  className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-800 hover:bg-white transition"
                    >
                      {"<"}
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-800 hover:bg-white transition"
                    >
                      {">"}
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails for multiple images */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`w-20 h-20 overflow-hidden cursor-pointer hover:scale-105 transition-transform ${
                        index === mainImageIndex ? "border-2 border-blue-500" : ""
                      }`}
                      onClick={() => handleImageChange(index)}
                    >
                      <img
                        src={image.image}
                        alt={`Build ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="border p-4">
                <h2 className="text-lg font-bold mb-2">Thông số kỹ thuật</h2>
                <p><strong>Tên cấu hình:</strong> {build.buildName || "Không có tên"}</p>
                <p><strong>Mục đích sử dụng:</strong> {build.usagePurpose || "Không xác định"}</p>
                <p><strong>Tổng số linh kiện:</strong> {build.totalProducts || "Không có thông tin"}</p>
                <h3 className="font-semibold mt-4">Các thành phần linh kiện:</h3>
                <ul>
                  {build.buildPCProductVariants && Array.isArray(build.buildPCProductVariants) ? 
                    build.buildPCProductVariants.map((variant, index) => (
                      <li key={index}>
                        {variant.categoryName}: {variant.nameVariants}
                      </li>
                    )) : 
                    <li>Không có thông tin linh kiện</li>
                  }
                </ul>
              </div>
            </div>

            {/* Cột phải - Thông tin cơ bản và Mô tả */}
            <div className="rounded-lg">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h1 className="text-2xl font-bold mb-2">{build.buildName || "Không có tên"}</h1>
                  <div className="text-xl font-semibold text-blue-600">
                    {build.totalPrice ? `${build.totalPrice.toLocaleString()}đ` : "Liên hệ để biết giá"}
                  </div>
                </div>

                <div className="space-y-2 py-4">
                  <h2 className="text-lg font-bold mb-2">Mô tả</h2>
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: build.description || "Không có mô tả" }}
                  ></div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <button
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-700 transition"
                    onClick={handleAddAllToCart}
                  >
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuildDetail;