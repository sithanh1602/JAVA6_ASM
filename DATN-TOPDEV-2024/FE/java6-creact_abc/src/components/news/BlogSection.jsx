import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import PostService from "../../services/PostService";
import PostCateService from "../../services/PostCateService";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";
import ReactPaginate from "react-paginate";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import video1 from "../../assets/video/video1.mp4";
import video2 from "../../assets/video/video2.mp4";
import video3 from "../../assets/video/video3.mp4";
import thumbnail1 from "../../assets/Post/thumbnail1.jpg"; 
import thumbnail2 from "../../assets/Post/thumbnail2.jpg";
import thumbnail3 from "../../assets/Post/thumbnail3.jpg";

const BlogSection = () => {
  const videos = [
    {
      title: "Build PC Gaming Full Trắng Đẹp Mê Ly",
      src: video1,
      thumbnail: thumbnail1,
    },
    {
      title: "Khám Phá Những Dàn PC Gaming Đẹp Mắt Nhất",
      src: video2,
      thumbnail: thumbnail2,
    },
    {
      title: "Set Up PC Gaming Hồng: Hiệu Năng Đỉnh Cao",
      src: video3,
      thumbnail: thumbnail3,
    },
  ];

  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [postCategories, setPostCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const videoRefs = useRef([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const allPosts = await PostService.getAllPosts();
        const filteredPosts = allPosts.filter((post) => post.status === true);
        console.log("Filtered Posts:", filteredPosts);
        setArticles(filteredPosts);
        setFilteredArticles(filteredPosts);

        const categories = await PostCateService.getAllPostCategories();
        console.log("Fetched Post Categories:", categories);
        setPostCategories(categories || []);
      } catch (error) {
        Swal.fire("Lỗi!", "Không thể tải dữ liệu!", "error");
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Không thể tải bài viết hoặc danh mục");
        setPostCategories([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(
        articles.filter(
          (article) => String(article.postCategories.id
          ) === selectedCategory
        )
      );
    }
    setCurrentPage(0);
  }, [selectedCategory, articles]);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(String(categoryId));
  };

  // trend video
  const handleVideoPlay = (index) => {
    videoRefs.current.forEach((video, i) => {
      if (i !== index && video && !video.paused) {
        video.pause();
      }
    });
  };

  return (
    <section className="py-10 w-[80%] mx-auto">
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 border-b mb-6">
          <button
            className={`px-4 py-2 text-sm font-semibold transition-all ${
              selectedCategory === "all"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-600 hover:text-red-500"
            }`}
            onClick={() => handleCategoryClick("all")}
          >
            Tất cả
          </button>
          {postCategories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                selectedCategory === String(category.id)
                  ? "text-red-500 border-b-2 border-red-500"
                  : "text-gray-600 hover:text-red-500"
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : currentArticles.length > 0 ? (
              currentArticles.map((article) => (
                <Link
                  to={`/post/${article.slug}`}
                  key={article.id}
                  className="block bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    {article?.images?.length > 0 && (
                      <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden ">
                        <img
                          src={article.images[0].imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-xl text-gray-800 mb-2">
                        {article.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        <ReactMarkdown>
                          {article.content.length > 150
                            ? article.content.slice(0, 150) + "..."
                            : article.content}
                        </ReactMarkdown>
                      </p>
                      <div className="flex items-center">
                        <img
                          src={
                            article?.user?.image ||
                            "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                          }
                          alt="User Avatar"
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-3">
                          <p className="font-semibold text-gray-700">
                            {article?.userId || "Người dùng ẩn danh"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(article?.createAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500">
                Không có bài viết trong danh mục này.{" "}
                {selectedCategory !== "all" &&
                  `(Danh mục ID: ${selectedCategory}, Tổng bài viết: ${articles.length})`}
              </p>
            )}

            {filteredArticles.length > itemsPerPage && (
              <ReactPaginate
                previousLabel={<MdArrowBackIosNew />}
                nextLabel={<MdArrowForwardIos />}
                pageCount={Math.ceil(filteredArticles.length / itemsPerPage)}
                onPageChange={handlePageChange}
                containerClassName="flex justify-center items-center space-x-2 mt-6"
                pageClassName="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition"
                activeClassName="text-red-800"
                previousClassName="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                nextClassName="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <img
                src="https://i.pinimg.com/736x/08/99/02/089902cc7b693e1da9e68b2ce10199f5.jpg"
                alt="Banner"
                className="w-80 h-auto rounded-lg shadow-md"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Trend Videos
              </h2>
              <div className="flex justify-center">
                <div className="space-y-6">
                  {videos.map((video, index) => (
                    <div key={index} className="text-center">
                      <video
                        ref={(el) => (videoRefs.current[index] = el)} // Assign ref to video
                        src={video.src}
                        poster={video.thumbnail}
                        controls
                        onPlay={() => handleVideoPlay(index)} // Handle play event
                        className="w-80 h-48 object-cover rounded-lg shadow-md"
                      />
                      <h4 className="mt-2 font-medium text-gray-700">
                        {video.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;