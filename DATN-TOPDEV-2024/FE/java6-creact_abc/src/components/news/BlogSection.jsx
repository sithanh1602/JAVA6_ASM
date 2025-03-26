import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import video1 from '../../assets/video/video1.mp4';
import video2 from '../../assets/video/video2.mp4';
import video3 from '../../assets/video/video3.mp4';

const BlogSection = () => {

    const videos = [
        {title: "Build PC Gaming Full Trắng Đẹp Mê Ly",
            src: video1,
        },
        {title: "Khám Phá Những Dàn PC Gaming Đẹp Mắt Nhất",
            src: video2,
        },
        {title: "Set Up PC Gaming Hồng: Hiệu Năng Đỉnh Cao",
            src: video3,
        }
        
    ]

  const [articles, setArticles] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8080/api/posts")
      .then((response) => response.json())
      .then((data) => {
        const activePosts = data.filter((post) => post.status); // Chỉ lấy bài viết còn hoạt động
        setArticles(activePosts);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <section className="py-10 w-[80%] mx-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách bài viết */}
        <div className="lg:col-span-2 space-y-4">
          {articles.map((article) => (
            <Link to={`/post/${article.id}`} key={article.id} className="block">
              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={article?.image}
                  alt={article.title}
                  className="w-full md:w-1/3 h-48 object-cover"
                />
                <div>
                  <h4 className="font-bold">{article.title}</h4>
                  <p className="text-gray-600">
                    {article.content.length > 150
                      ? article.content.slice(0, 150) + "..."
                      : article.content}
                  </p>
                  <div className="mt-4 flex items-center">
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
                        {article?.user?.fullName || "Người dùng ẩn danh"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(article?.createAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div>
          <div className="mb-6 flex justify-center">
            <img
              src="https://i.pinimg.com/736x/08/99/02/089902cc7b693e1da9e68b2ce10199f5.jpg"
              alt="Banner"
              className="w-80 h-auto"
            />
          </div>
          <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Trend Videos</h2>
    <div className="flex justify-center">
    <div className="space-y-4 ">
        {videos.map((video, index) => (
          <div key={index}>
            <video 
              src={video.src} 
              controls 
              className="w-80 h-48 object-cover"
            />
            <h4 className="mt-2 font-medium">
              {video.title}
            </h4>
          </div>
        ))}
      </div>
    </div>
    </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
