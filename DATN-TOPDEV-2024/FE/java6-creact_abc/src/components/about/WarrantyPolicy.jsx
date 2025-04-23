const WarrantyPolicy = () => {
    return (
        <section className="bg-gray-100 py-12 px-8">
            <div className="flex flex-row">
                <div className="basis-2/5 mt-8 ml-16">
                    <div className="bg-white max-w-2l">
                        {/* Box 1 */}
                        <div className="p-6 rounded-lg flex-1 hover:bg-blue-50 transition duration-300 cursor-pointer">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">01</div>
                                <h3 className="ml-4 text-lg font-semibold text-black">Đa Dạng Sản Phẩm</h3>
                            </div>
                            <p className="text-gray-700">Chúng tôi hiểu rằng mỗi người có nhu cầu và ưu tiên riêng về công nghệ.</p>
                        </div>
                        {/* Box 2 */}
                        <div className="p-6 rounded-lg flex-1 hover:bg-blue-50 transition duration-300 cursor-pointer">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">02</div>
                                <h3 className="ml-4 text-lg font-semibold text-black">Chất Lượng Đảm Bảo</h3>
                            </div>
                            <p className="text-gray-700">Tất cả các sản phẩm được bán trên trang web của chúng tôi đều được kiểm tra và đảm bảo chất lượng.</p>
                        </div>
                        {/* Box 3 */}
                        <div className="p-6 rounded-lg flex-1 hover:bg-blue-50 transition duration-300 cursor-pointer">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">03</div>
                                <h3 className="ml-4 text-lg font-semibold text-black">Chăm Sóc Khách Hàng</h3>
                            </div>
                            <p className="text-gray-700">Chúng tôi đặt khách hàng lên hàng đầu và cam kết cung cấp dịch vụ chăm sóc khách hàng chất lượng.</p>
                        </div>
                    </div>
                </div>
                <div className="basis-3/4">
                    <div className="p-8 mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-black">Chính sách bảo hành và đổi trả</h2>
                        <p className="mb-6 text-gray-700">Chúng tôi cung cấp chính sách bảo hành và đổi trả linh hoạt để đảm bảo sự hài lòng của bạn...</p>
                        <div className="flex space-x-4 mb-6">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Bảo hành</button>
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:text-blue-500 transition">Đổi trả</button>
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:text-blue-500 transition">Điều khoản</button>
                        </div>
                        <ul className="list-none space-y-4">
                            <li className="flex items-center cursor-pointer">
                                <i className="fas fa-check text-blue-500 mr-2"></i>
                                Thời gian bảo hành từ 3 tháng đến 6 tháng
                            </li>
                            <li className="flex items-center cursor-pointer">
                                <i className="fas fa-check text-blue-500 mr-2"></i>
                                Phạm vi bảo hành gồm do lỗi kỹ thuật hoặc sản xuất trong quá trình sử dụng
                            </li>
                            <li className="flex items-center  cursor-pointer">
                                <i className="fas fa-check text-blue-500 mr-2"></i>
                                Liên hệ với chúng tôi nếu sản phẩm gặp sự cố
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WarrantyPolicy;
   