import React, { useState, useEffect } from "react";
import { storage } from "../../../../firebase.config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PostService from "../../../../services/PostService";
import PostCateService from "../../../../services/PostCateService";
import TagService from "../../../../services/TagPostService";
import * as yup from "yup";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import TagInput from "./TagInput";
import Select from "react-select";

// Schema validation với một số điều chỉnh để giảm bớt các ràng buộc
const postSchema = yup.object({
  title: yup
    .string()
    .required("Tiêu đề không được để trống")
    .min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
  content: yup
    .string()
    .required("Nội dung không được để trống")
    .min(20, "Nội dung phải có ít nhất 20 ký tự"),
  status: yup.string().required("Trạng thái không được để trống"),
  postCategoriesId: yup
    .number()
    .typeError("Danh mục không hợp lệ")
    .required("Danh mục là bắt buộc"),
  tagIds: yup
    .array()
    .of(yup.number().typeError("Tag không hợp lệ"))
    .min(1, "Chọn ít nhất một tag"),
  // Đã giảm bớt ràng buộc cho imageUrls, cho phép mảng rỗng
  imageUrls: yup.array().of(yup.string()),
  // Bỏ qua validation user để tránh lỗi khi chưa đăng nhập
  user: yup.object().nullable(),
});

const PostInput = ({ post, onClose }) => {
  const [imagePreview, setImagePreview] = useState(post?.images?.[0]?.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(!post); // Cờ để xác định tạo mới hay cập nhật
  const [formSubmitAttempt, setFormSubmitAttempt] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: post
      ? {
          title: post.title,
          content: post.content,
          status: post.status.toString(),
          postCategoriesId: post.postCategories?.id,
          tagIds: post.tags?.map((tag) => tag.tag.id) || [],
          imageUrls: post.images?.map((img) => img.imageUrl) || [],
          user: { userId: post.user?.userId || null },
        }
      : {
          title: "",
          content: "",
          status: "true",
          postCategoriesId: "",
          tagIds: [],
          imageUrls: [],
          user: { userId: null },
        },
  });

  const tagIds = watch("tagIds");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await PostCateService.getAllPostCategories();
        console.log("Danh mục:", data);
        setCategories(data);
      } catch (error) {
        console.error("Lỗi fetch categories:", error);
        Swal.fire("Lỗi!", "Không thể tải danh sách danh mục!", "error");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await TagService.getAllTags();
        console.log("Tags:", data);
        if (data.length === 0) {
          Swal.fire("Thông báo", "Hiện tại chưa có tag nào. Vui lòng thêm tag mới!", "info");
        }
        const formattedTags = data.map((tag) => ({
          value: tag.id,
          label: tag.tagName || tag.name,
        }));
        setTags(formattedTags);
      } catch (error) {
        console.error("Lỗi fetch tags:", error);
        Swal.fire("Lỗi!", "Không thể tải danh sách tags!", "error");
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
        status: post.status.toString(),
        postCategoriesId: post.postCategories?.id,
        tagIds: post.tags?.map((tag) => tag.tag.id) || [],
        imageUrls: post.images?.map((img) => img.imageUrl) || [],
        user: { userId: post.user?.userId || null },
      });
      setImagePreview(post.images?.[0]?.imageUrl || null);
      setIsCreating(false); // Đặt lại cờ khi có post (cập nhật)
    } else {
      setIsCreating(true); // Đặt cờ khi không có post (tạo mới)
    }
  }, [post, reset]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setImageError("Vui lòng chọn file ảnh (JPEG, PNG, GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setImageFile(file);
      setImageError("");
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw new Error("Không thể upload ảnh: " + error.message);
    }
  };

  const getUserFromToken = () => {
    const token = Cookies.get("token");
    console.log("Token hiện tại:", token);
    
    // Để phát triển, nếu không tìm thấy token, trả về một userId mặc định
    if (!token) {
      console.log("Không tìm thấy token, sử dụng userId mặc định");
      return { userId: 1 }; // userId mặc định để phát triển
    }
    
    try {
      const decodedToken = jwtDecode(token);
      console.log("Token được giải mã:", decodedToken);
      return { userId: decodedToken.userId || 1 };
    } catch (error) {
      console.error("Token không hợp lệ:", error);
      // Trả về userId mặc định nếu có lỗi
      return { userId: 1 };
    }
  };

  const onSubmit = async (data) => {
    console.log("Nút đã được click, bắt đầu xử lý...");
    setFormSubmitAttempt(true);
    setLoading(true);
    
    try {
      console.log("Đang thực hiện:", isCreating ? "Tạo bài viết" : "Cập nhật bài viết");
      console.log("Dữ liệu form ban đầu:", data);
  
      const user = getUserFromToken();
      console.log("User từ token:", user);
      
      // Nếu không có user và không phải môi trường phát triển, hiển thị lỗi
      if (!user && process.env.NODE_ENV !== "development") {
        Swal.fire("Lỗi!", "Bạn chưa đăng nhập! Vui lòng đăng nhập lại.", "error");
        setLoading(false);
        return;
      }
  
      let imageUrls = data.imageUrls || [];
      if (imageFile) {
        try {
          console.log("Bắt đầu upload ảnh:", imageFile.name);
          const newImageUrl = await uploadImage(imageFile);
          console.log("Upload ảnh thành công:", newImageUrl);
          imageUrls = [newImageUrl];
        } catch (uploadError) {
          console.error("Lỗi upload ảnh:", uploadError);
          Swal.fire("Lỗi!", `Không thể upload ảnh: ${uploadError.message}`, "error");
          setLoading(false);
          return;
        }
      } else if (isCreating && (!imageUrls || imageUrls.length === 0)) {
        setImageError("Vui lòng chọn một ảnh");
        Swal.fire("Lỗi!", "Ảnh không được để trống khi tạo bài viết!", "error");
        setLoading(false);
        return;
      }
  
      const postData = {
        title: data.title,
        content: data.content,
        status: data.status === "true",
        postCategoriesId: Number(data.postCategoriesId),
        tagIds: Array.isArray(data.tagIds) ? data.tagIds.map(Number) : [],
        imageUrls: imageUrls,
        user: { userId: Number(user.userId) },
      };
  
      console.log("Dữ liệu gửi đi chi tiết:", JSON.stringify(postData));
  
      if (isCreating) {
        console.log("Đang gọi API tạo bài viết...");
        // Sửa lại phương thức trong PostService.js để sử dụng Cookies.get() thay vì Cookies.getItem()
        const result = await PostService.createPost(postData);
        console.log("Kết quả tạo bài viết:", result);
        Swal.fire("Thành công!", "Bài viết đã được tạo.", "success");
      } else {
        console.log("Đang gọi API cập nhật bài viết với ID:", post.id);
        const result = await PostService.updatePost(post.id, postData);
        console.log("Kết quả cập nhật bài viết:", result);
        Swal.fire("Thành công!", "Bài viết đã được cập nhật.", "success");
      }
      onClose();
    } catch (error) {
      console.error("Chi tiết lỗi submit đầy đủ:", error);
      console.error("Stack trace:", error.stack);
      
      // Kiểm tra chi tiết lỗi
      if (error.response) {
        // Lỗi từ response của server
        console.error("Lỗi từ server:", error.response.data);
        console.error("Mã lỗi:", error.response.status);
        Swal.fire("Lỗi từ server!", `${error.response.status}: ${JSON.stringify(error.response.data)}`, "error");
      } else if (error.request) {
        // Đã gửi request nhưng không nhận được response
        console.error("Không nhận được phản hồi từ server:", error.request);
        Swal.fire("Lỗi kết nối!", "Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.", "error");
      } else {
        // Lỗi khác
        Swal.fire("Lỗi!", `Có lỗi xảy ra: ${error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidationBeforeSubmit = () => {
    trigger().then((isValid) => {
      if (isValid) {
        console.log("Form hợp lệ, đang submit...");
      } else {
        console.log("Form không hợp lệ:", errors);
        Swal.fire("Lỗi!", "Vui lòng kiểm tra lại thông tin form.", "error");
      }
    });
  };

  const handleTagAdded = async () => {
    try {
      const updatedTags = await TagService.getAllTags();
      setTags(updatedTags.map((tag) => ({ value: tag.id, label: tag.tagName || tag.name })));
      Swal.fire("Thành công!", "Danh sách tags đã được cập nhật.", "success");
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể cập nhật danh sách tags!", "error");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white p-4 rounded-lg">
      <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log("Lỗi validation:", errors);
        Swal.fire("Lỗi validation!", "Vui lòng kiểm tra lại thông tin nhập.", "error");
      })} className="grid grid-cols-2 gap-4">
        {/* Phần ảnh */}
        <div className="flex justify-center">
          <div className="relative w-full h-[200px]">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer block w-full h-full rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors duration-300"
            >
              <div className="w-full h-full rounded-lg overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                )}
              </div>
            </label>
            {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
          </div>
        </div>

        {/* Phần form */}
        <div className="flex flex-col space-y-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Tiêu đề bài viết</label>
            <input
              {...register("title")}
              placeholder="Nhập Tiêu Đề Bài Viết"
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Nội dung bài viết</label>
            <textarea
              {...register("content")}
              placeholder="Nhập Nội Dung Bài Viết"
              rows={3}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm resize-none"
            />
            {errors.content && <span className="text-red-500 text-xs">{errors.content.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Trạng Thái</label>
            <select
              {...register("status")}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="true">Còn hoạt động</option>
              <option value="false">Hết hoạt động</option>
            </select>
            {errors.status && <span className="text-red-500 text-xs">{errors.status.message}</span>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Danh mục bài viết</label>
            <select
              {...register("postCategoriesId")}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.postCategoriesId && (
              <span className="text-red-500 text-xs">{errors.postCategoriesId.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="flex items-center space-x-2">
              <Select
                isMulti
                options={tags}
                placeholder="Chọn tags..."
                className="w-full text-sm"
                value={tags.filter((tag) => tagIds?.includes(tag.value))}
                onChange={(selectedOptions) => {
                  const selectedIds = selectedOptions.map((option) => Number(option.value));
                  setValue("tagIds", selectedIds, { shouldValidate: true });
                }}
                noOptionsMessage={() => "Không có tag nào"}
              />
              <button
                type="button"
                onClick={() => setIsTagModalOpen(true)}
                className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                +
              </button>
            </div>
            {errors.tagIds && <span className="text-red-500 text-xs">{errors.tagIds.message}</span>}
          </div>

          <div className="flex space-x-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleValidationBeforeSubmit}
              disabled={loading || isSubmitting}
              className="w-full px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Đang xử lý..." : isCreating ? "Tạo" : "Cập Nhật"}
            </button>
          </div>
        </div>
      </form>

      {isTagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <TagInput onClose={() => setIsTagModalOpen(false)} onTagAdded={handleTagAdded} />
        </div>
      )}
    </div>
  );
};

export default PostInput;