import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BlogDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);

    useEffect(() => {
        if (!id) return;

        // Fetch bài viết chính
        fetch(`http://localhost:8080/api/posts/${id}`)
            .then(response => response.json())
            .then(data => {
                setArticle(data);

                // Sau khi có bài viết chính, fetch bài viết liên quan
                fetch(`http://localhost:8080/api/posts`)
                    .then(response => response.json())
                    .then(data => {
                        // Lọc bài viết chính ra khỏi danh sách bài viết liên quan
                        const filteredArticles = data.filter(item => item.id !== data.id);
                        setRelatedArticles(filteredArticles);
                    })
                    .catch(error => console.error("Lỗi khi lấy bài viết liên quan:", error));
            })
            .catch(error => console.error("Lỗi khi lấy bài viết:", error));
    }, [id]);


    if (!id) return <div className="text-center p-4 text-red-500">Lỗi: ID không hợp lệ</div>;
    if (!article) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4 w-[90%] flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <img src={article.image} alt={article.title} className="w-full h-96 object-cover rounded-lg mb-4"/>
                    <h1 className="text-3xl font-bold text-gray-800">{article.title}</h1>
                    <p className="text-gray-500 text-sm mb-4">{article.date}</p>
                    <p className="text-gray-700 leading-relaxed">{article.content}</p>
                </div>
            </div>

            <div className="md:w-1/3">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Bài viết liên quan</h2>
                    {relatedArticles.length > 0 ? (
                        relatedArticles.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 mb-3">
                                <div
                                    className="flex flex-col md:flex-row bg-white shadow-md overflow-hidden hover:shadow-lg transition h-20">
                                    <div className="md:w-1/3 flex items-center">
                                        <img src={item.image} alt={item.title} className="w-20 h-20 object-cover"/>
                                    </div>
                                    <div className="md:w-2/3 p-2 flex flex-col justify-between">
                                        <h5 className="text-xs font-bold text-gray-800">{item.title}</h5>
                                        <span className="text-xs text-gray-600 mt-1">
                                            {item.content.length > 100 ? item.content.slice(0, 100) + "..." : item.content}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Không có bài viết liên quan.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
