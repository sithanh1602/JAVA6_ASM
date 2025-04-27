import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BuildPCService from "../../../services/BuildPcService";
import { addPcToCart } from "../../../services/CartService";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faShoppingCart, faInfoCircle, faDesktop, faCheck } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

// Component chính để hiển thị chi tiết cấu hình PC
const PCBuildDetail = () => {
  const { buildId } = useParams();
  const navigate = useNavigate();
  const [build, setBuild] = useState(null); // State lưu thông tin cấu hình PC
  const [error, setError] = useState(null); // State lưu thông tin lỗi
  const [images, setImages] = useState([]); // State lưu danh sách hình ảnh
  const [mainImageIndex, setMainImageIndex] = useState(0); // State lưu chỉ số hình ảnh chính
  const [mainImage, setMainImage] = useState(null); // State lưu hình ảnh chính
  const [activeTab, setActiveTab] = useState("specs"); // State lưu tab đang active
  const [loading, setLoading] = useState(true); // State lưu trạng thái đang tải

  // Hook useEffect để gọi API lấy dữ liệu cấu hình PC khi component được render
  useEffect(() => {
    const fetchBuildPCDetails = async () => {
      try {
        setLoading(true);
        console.log("Bắt đầu gọi API với buildId:", buildId);
        const response = await BuildPCService.getBuildPCById(buildId);
        console.log("Dữ liệu từ API:", response.data);
        setBuild(response.data);

        // Xử lý danh sách hình ảnh từ dữ liệu API
        if (response.data) {
          let imagesList = [];

          // Thêm hình ảnh chính vào danh sách (nếu có)
          if (response.data.image) {
            imagesList.push({ id: 0, image: response.data.image });
          }

          // Thêm các hình ảnh bổ sung từ mảng imageUrls (nếu có)
          if (response.data.imageUrls && Array.isArray(response.data.imageUrls)) {
            const additionalImages = response.data.imageUrls.filter(
              (url) => url !== response.data.image
            );

            additionalImages.forEach((imageUrl, index) => {
              imagesList.push({ id: index + 1, image: imageUrl });
            });
          }

          // Nếu có ít nhất một hình ảnh, thiết lập hình ảnh chính
          if (imagesList.length > 0) {
            setImages(imagesList);
            setMainImage(imagesList[0].image);
            setMainImageIndex(0);
          }
        }
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildPCDetails();
  }, [buildId]);

  // Hàm xử lý khi thay đổi hình ảnh
  const handleImageChange = (index) => {
    setMainImageIndex(index);
    setMainImage(images[index]?.image || null);
  };

  // Hàm xử lý khi nhấn nút chuyển đến hình ảnh trước đó
  const handlePreviousImage = () => {
    const newIndex = mainImageIndex > 0 ? mainImageIndex - 1 : images.length - 1;
    handleImageChange(newIndex);
  };

  // Hàm xử lý khi nhấn nút chuyển đến hình ảnh tiếp theo
  const handleNextImage = () => {
    const newIndex = mainImageIndex < images.length - 1 ? mainImageIndex + 1 : 0;
    handleImageChange(newIndex);
  };

  // Hàm xử lý khi thêm cấu hình PC vào giỏ hàng
  const handleAddAllToCart = async () => {
    try {
      // Lấy token từ cookie
      const token = Cookies.get('jwtToken');
      
      // Kiểm tra xem người dùng đã đăng nhập chưa
      if (!token) {
        Swal.fire({
          title: "Thông báo",
          text: "Vui lòng đăng nhập trước khi thêm vào giỏ hàng",
          icon: "warning",
          confirmButtonText: "Đăng nhập",
        }).then(() => {
          navigate("/loginn");
        });
        return;
      }
      
      // Decode token để lấy thông tin
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);
      
      // Lấy userId từ token
      const userId = decodedToken.userId || decodedToken.sub;
      
      // Kiểm tra vai trò người dùng
      const userRoles = decodedToken.roles || [];
      const isAdmin = Array.isArray(userRoles) && userRoles.includes("ADMIN") || 
                    userRoles === "ADMIN" || 
                    decodedToken.sub === "admin";
                    
      if (isAdmin) {
        Swal.fire({
          title: "Thông báo",
          text: "Quản trị viên không được phép thêm sản phẩm vào giỏ hàng",
          icon: "info",
          confirmButtonText: "OK",
        });
        return;
      }

      // Hiển thị thông báo đang xử lý
      Swal.fire({
        title: "Đang xử lý...",
        text: "Đang thêm BuildPC vào giỏ hàng",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Kiểm tra thông tin cấu hình PC
      if (!build || !build.buildId) {
        throw new Error("Không tìm thấy thông tin BuildPC");
      }

      // Gọi API để thêm cấu hình PC vào giỏ hàng
      await addPcToCart(userId, build.buildId, 1);

      // Hiển thị thông báo thành công
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
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      // Hiển thị thông báo lỗi
      Swal.fire("Lỗi", "Có lỗi xảy ra khi thêm BuildPC vào giỏ hàng", "error");
    }
  };

  // Hiển thị màn hình loading khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin cấu hình...</p>
        </div>
      </div>
    );
  }

  // Hiển thị màn hình lỗi nếu có lỗi xảy ra
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <FontAwesomeIcon icon={faInfoCircle} className="text-red-500 text-5xl mb-4" />
          <h2 className="text-2xl font-bold text-red-500 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Nếu chưa có dữ liệu, không hiển thị gì
  if (!build) return null;
  
  // Tạo nội dung markdown để hiển thị thông tin cấu hình PC
  const markdown = `
**Tên cấu hình:** ${build.buildName || "Không có tên"}  
**Mục đích sử dụng:** ${build.usagePurpose || "Không xác định"}  
**Tổng số linh kiện:** ${build.totalProducts || "Không có thông tin"}  

### Các thành phần linh kiện:
${
  build.buildPCProductVariants && Array.isArray(build.buildPCProductVariants)
    ? build.buildPCProductVariants
        .map(
          (variant) =>
            `- **${variant.categoryName}**: ${variant.nameVariants}`
        )
        .join("\n")
    : "- Không có thông tin linh kiện"
}
`;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumbs - Thanh điều hướng đường dẫn */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2">
            <li><a href="/" className="text-blue-600 hover:underline">Trang chủ</a></li>
            <li className="text-gray-500">/</li>
            <li><a href="/pc-builds" className="text-blue-600 hover:underline">PC Builds</a></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-700 truncate">{build.buildName || "Chi tiết cấu hình"}</li>
          </ol>
        </nav>

        {/* Main Product Card - Thẻ sản phẩm chính */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Title Bar on Mobile - Thanh tiêu đề trên thiết bị di động */}
          <div className="md:hidden bg-blue-600 text-white p-4">
            <h1 className="text-xl font-bold">{build.buildName || "Không có tên"}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0">
            {/* Left Column - Image Gallery - Cột bên trái - Thư viện hình ảnh */}
            <div className="lg:col-span-2 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-200">
              {/* Main Image with Navigation - Hình ảnh chính với điều hướng */}
              <div className="relative w-full h-[400px] overflow-hidden bg-white rounded-lg mb-4 flex items-center justify-center">
                <img
                  src={mainImage || build.image || "https://placehold.co/400x300?text=PC+Build"}
                  alt={build.buildName}
                  className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow transition"
                      aria-label="Previous image"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="text-gray-800" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow transition"
                      aria-label="Next image"
                    >
                      <FontAwesomeIcon icon={faChevronRight} className="text-gray-800" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails - Hình thu nhỏ */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-md cursor-pointer hover:opacity-100 transition-all duration-200 ${
                        index === mainImageIndex 
                          ? "ring-2 ring-blue-500 opacity-100" 
                          : "ring-1 ring-gray-200 opacity-80"
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
            </div>

            {/* Right Column - Product Info - Cột bên phải - Thông tin sản phẩm */}
            <div className="lg:col-span-3 p-4 md:p-6">
              {/* Desktop Title - Tiêu đề trên desktop */}
              <div className="hidden md:block mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{build.buildName || "Không có tên"}</h1>
                <p className="text-gray-500 mt-1">{build.usagePurpose || "PC Build"}</p>
              </div>

              {/* Price - Giá */}
              <div className="flex items-center my-4">
                <div className="text-3xl font-bold text-blue-600">
                  {build.totalPrice ? `${build.totalPrice.toLocaleString()}đ` : "Liên hệ"}
                </div>
                {build.originalPrice && build.originalPrice > build.totalPrice && (
                  <div className="ml-3 flex items-center">
                    <span className="text-lg text-gray-400 line-through">{build.originalPrice.toLocaleString()}đ</span>
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                      -{Math.round((1 - build.totalPrice / build.originalPrice) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Key Features - Tính năng chính */}
              <div className="my-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {build.buildPCProductVariants && 
                   build.buildPCProductVariants.slice(0, 4).map((variant, index) => (
                    <div key={index} className="flex items-center">
                      <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" />
                      <div>
                        <span className="text-gray-500 text-sm">{variant.categoryName}:</span>
                        <span className="font-medium ml-1 text-sm">{variant.nameVariants}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons - Các nút thao tác */}
              <div className="flex flex-col md:flex-row gap-3 my-6">
                <button
                  onClick={handleAddAllToCart}
                  className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium shadow-sm transition-all"
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                  Thêm vào giỏ hàng
                </button>
              </div>

              {/* Stock Status and Delivery - Trạng thái hàng và thông tin giao hàng */}
              <div className="bg-gray-50 rounded-lg p-4 my-4">
                <div className="text-sm text-gray-600">
                  <p>Giao hàng miễn phí cho đơn hàng từ 5.000.000đ</p>
                  <p>Thời gian giao hàng: 2-3 ngày làm việc</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Điều hướng tab */}
        <div className="mt-8 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === "specs"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("specs")}
            >
              <FontAwesomeIcon icon={faDesktop} className="mr-2" />
              Thông số kỹ thuật
            </button>
            <button
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === "description"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("description")}
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Mô tả chi tiết
            </button>
          </div>
        </div>

        {/* Tab Content - Nội dung tab */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mt-4">
          {/* Thông số kỹ thuật */}
          {activeTab === "specs" && (
            <div className="overflow-hidden">
              {/* Components Table - Bảng linh kiện */}
              {build.buildPCProductVariants && build.buildPCProductVariants.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại linh kiện
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tên sản phẩm
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Giá (VNĐ)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {build.buildPCProductVariants.map((variant, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {variant.categoryName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {variant.nameVariants}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {variant.price ? variant.price.toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <th colSpan="2" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                          Tổng cộng:
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-blue-600">
                          {build.totalPrice ? build.totalPrice.toLocaleString() : 'Liên hệ'} VNĐ
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Mô tả chi tiết */}
          {activeTab === "description" && (
            <div>
              {/* Thêm markdown vào tab mô tả chi tiết */}
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
              
              {build.description ? (
                <div className="mt-6 prose prose-sm max-w-none">
                  {/* <div dangerouslySetInnerHTML={{ __html: build.description }}></div> */}
                </div>
              ) : (
                <div className="mt-6 text-gray-500 italic">
                  Hiện tại chưa có thông tin mô tả bổ sung cho cấu hình này.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Builds Section - Phần cấu hình tương tự */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Các cấu hình tương tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for related builds - would be dynamically populated */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuildDetail;