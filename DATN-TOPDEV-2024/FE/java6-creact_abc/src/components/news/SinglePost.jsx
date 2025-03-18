import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaFacebook, FaShare, FaGoogle } from "react-icons/fa"; // Import FaDesktop for Build PC
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// npm install react-markdown -ff
// npm install react-syntax-highlighter -f

const SinglePost = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    if (!id) return;

    // Fetch bài viết chính
    fetch(`http://localhost:8080/api/posts/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setArticle(data);

        // Sau khi có bài viết chính, fetch bài viết liên quan
        fetch(`http://localhost:8080/api/posts`)
          .then((response) => response.json())
          .then((data) => {
            // Lọc bài viết chính ra khỏi danh sách bài viết liên quan
            const filteredArticles = data.filter((item) => item.id !== data.id);
            setRelatedArticles(filteredArticles);
          })
          .catch((error) =>
            console.error("Lỗi khi lấy bài viết liên quan:", error)
          );
      })
      .catch((error) => console.error("Lỗi khi lấy bài viết:", error));
  }, [id]);

  if (!id)
    return (
      <div className="text-center p-4 text-red-500">Lỗi: ID không hợp lệ</div>
    );
  if (!article) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="lg:col-span-2 w-[80%] m-auto">
      <div className="text-center mb-6">
        <nav className="text-gray-500 text-sm">
          <a href="#" className="hover:text-orange-500">
            Tin tức
          </a>{" "}
          &gt;
          <span>{article.title}</span>
        </nav>
        <h3 className="text-2xl font-bold mt-2">{article.title}</h3>
        <div className="text-sm text-gray-500 mt-2">
          <span> {new Date(article?.createAt).toLocaleString()}</span> |{" "}
          <span>{article?.user?.fullName || "Người dùng ẩn danh"}</span>
        </div>
      </div>

      <div>
        {" "}
        <img
          src={article?.image}
          alt={article?.image}
          className="w-full mb-6"
        />
      </div>
      <div className="prose max-w-none text-gray-800">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              return !inline ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language="javascript"
                  {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-200 px-1 rounded">{children}</code>
              );
            },
          }}>
          {article.content}
        </ReactMarkdown>
      </div>
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          <span>Tags:</span>
          <a
            href="#"
            className="text-white text-sm bg-amber-800 rounded-lg px-1">
            Technology
          </a>
          <a
            href="#"
            className="text-white text-sm bg-lime-900 rounded-lg px-1">
            Trending
          </a>
          <a
            href="#"
            className="text-white text-sm bg-teal-800 rounded-lg px-1">
            Gaming
          </a>
        </div>
        <div className="flex justify-center space-x-2 mt-4">
          <a
            href="#"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            <FaShare size={20} />
            <span>Share</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-2 bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition">
            <FaFacebook size={20} />
            <span>Facebook</span>
          </a>
        </div>
      </div>

      <div>
        <img
          src="https://nhatminhlaptop.com/Upload/ProductCategories/2022-03-15-17-22-07_banner/bannerlinhkien-1.png"
          alt="Banner"
          className="w-full my-6"
        />
      </div>
      {/* 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <a href="#" className="flex items-center">
          <img src="" alt="Prev" className="w-24 h-24 object-cover mr-4" />
          <div>
            <h5 className="font-bold">
              5 Beautiful buildings you need to before dying
            </h5>
            <small>Prev Post</small>
          </div>
        </a>
        <a href="#" className="flex items-center">
          <img
            src="upload/tech_menu_20.jpg"
            alt="Next"
            className="w-24 h-24 object-cover mr-4"
          />
          <div>
            <h5 className="font-bold">
              Let's make an introduction to the glorious world of history
            </h5>
            <small>Next Post</small>
          </div>
        </a>
      </div> */}
    </div>
  );
};

export default SinglePost;
