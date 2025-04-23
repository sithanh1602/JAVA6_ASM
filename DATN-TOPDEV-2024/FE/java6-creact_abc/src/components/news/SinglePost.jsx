import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaFacebook, FaShare } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import PostService from "../../services/PostService";
import Swal from "sweetalert2";
import { MdArrowBackIosNew } from "react-icons/md";

const SinglePost = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        const allPosts = await PostService.getAllPosts();
        const foundPost = allPosts.find((p) => p.slug === slug);
        if (foundPost) {
          setArticle(foundPost);
          const currentTagNames =
            foundPost.tags?.map((t) => t.tag.tagName) || [];
          const related = allPosts
            .filter((p) => p.slug !== slug && p.status === true) // Exclude current post and ensure status is true
            .filter((p) => {
              const postTagNames = p.tags?.map((t) => t.tag.tagName) || [];
              return currentTagNames.some((tag) => postTagNames.includes(tag));
            })
            .slice(0, 4); // Limit to 4 articles

          setRelatedArticles(related);
        } else {
          Swal.fire("Không tìm thấy!", "Bài viết không tồn tại!", "warning");
        }
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết bài viết:", error);
        Swal.fire("Lỗi!", "Không thể tải chi tiết bài viết!", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetail();
  }, [slug]);

  if (!slug)
    return (
      <div className="text-center p-8 text-red-500 font-medium">
        Lỗi: slug không hợp lệ
      </div>
    );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );

  if (!article)
    return (
      <div className="text-center p-8 text-gray-500">
        Không tìm thấy bài viết
      </div>
    );

  const content = typeof article.content === "string" ? article.content : "";
  const contentParts = content
    .split("<!-- split -->")
    .map((part) => part.trim());
  const articleUrl = window.location.href;
  console.log("Article URL:", articleUrl); // Debug

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        {/* Nút quay lại */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors mb-4">
          <MdArrowBackIosNew className="text-lg" />
          <span>Quay lại</span>
        </button>
        <nav className="text-gray-500 text-sm mb-3">
          <a href="#" className="hover:text-blue-400 transition-colors">
            Tin tức
          </a>{" "}
          &gt; <span className="text-gray-700">{article.title}</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-semibold mt-4 text-gray-900">
          {article.title}
        </h1>
        <div className="text-sm text-gray-500 mt-3 flex items-center gap-2">
          <img
            src={
              article?.user?.image ||
              "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
            }
            alt="User Avatar"
            className="w-10 h-10 rounded-full"
          />{" "}
          <span>{article?.user?.fullName || "Người dùng ẩn danh"}</span>{" "}
          <span className="block h-1 w-1 rounded-full bg-gray-400"></span>
          <span>
            {new Date(article?.createAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <article className="prose prose-lg max-w-none">
            {/* Nội dung bài viết hiển thị theo từng phần */}
            {contentParts.map((part, index) => (
              <div key={index} className="mb-8">
                <ReactMarkdown
                  children={part}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md my-4"
                          {...props}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className={`${className} bg-gray-100 px-1 py-0.5 rounded`}
                          {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => (
                      <div className="text-gray-700 leading-relaxed mb-4">
                        {children}
                      </div>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-bold text-gray-800 mt-6 mb-3">
                        {children}
                      </h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc ml-6 mb-4 space-y-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal ml-6 mb-4 space-y-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-700">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-orange-500 pl-4 italic my-4 text-gray-600">
                        {children}
                      </blockquote>
                    ),
                  }}
                />

                {/* Ảnh giữa nội dung hiển thị sau nội dung phần đó */}
                {index < contentParts.length - 1 &&
                  article?.images?.[index] && (
                    <figure className="my-8">
                      <img
                        src={article.images[index].imageUrl}
                        alt={`Ảnh minh họa ${index}`}
                        className="w-full rounded-lg shadow-sm object-cover max-h-96"
                      />
                      <figcaption className="text-center text-sm text-gray-500 mt-2">
                        Hình ảnh minh họa {index + 1}
                      </figcaption>
                    </figure>
                  )}
              </div>
            ))}

            {/* Tags */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 text-sm items-center">
                <span className="font-semibold text-gray-700">Tags:</span>
                {article.tags?.map((tag, index) => (
                  <a
                    href={`/tags/${tag.tag.tagName}`}
                    key={index}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700 transition">
                    {tag.tag.tagName}
                  </a>
                ))}
              </div>
            </div>
          </article>

          {/* Nút chia sẻ */}
          <div className="mt-8 flex justify-center gap-4">
            <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-sm">
              <FaFacebook className="text-xl" /> Facebook
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition shadow-sm">
              <FaShare className="text-xl" /> Chia sẻ
            </button>
          </div>
        </div>

        {/* Bài viết liên quan */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b border-gray-200">
              Bài viết liên quan
            </h2>
            <div className="space-y-5">
              {relatedArticles.length > 0 ? (
                relatedArticles.map((post) => (
                  <a
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition group">
                    <img
                      src={
                        post.images?.[0]?.imageUrl ||
                        "https://via.placeholder.com/80"
                      }
                      alt={post.title}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                    <div>
                      <h6 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-500 transition-colors">
                        {post.title}
                      </h6>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(post.createAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </a>
                ))
              ) : (
                <p className="text-gray-500 text-center p-4">
                  Không có bài viết liên quan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="mt-12 mb-4">
        <a href="#" className="block hover:opacity-95 transition">
          <img
            src="https://nhatminhlaptop.com/Upload/ProductCategories/2022-03-15-17-22-07_banner/bannerlinhkien-1.png"
            alt="Banner quảng cáo"
            className="w-full rounded-lg shadow-md"
          />
        </a>
      </div>
    </div>
  );
};

export default SinglePost;
