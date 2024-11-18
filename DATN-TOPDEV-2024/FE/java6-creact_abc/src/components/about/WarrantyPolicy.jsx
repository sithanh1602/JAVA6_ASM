const WarrantyPolicy = () => {
    return (
        <section className="bg-gray-100 py-12 px-8">
            <div className="flex flex-row">
                <div className="basis-2/5 mt-8 ml-16">
                    <div className="bg-white max-w-2l">
                        <div className="p-6 rounded-lg flex-1">
                            <div className="flex items-center mb-4">
                                <div
                                    className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">01
                                </div>
                                <h3 className="ml-4 text-lg font-semibold">Đa Dạng Sản Phẩm</h3>
                            </div>
                            <p>Chúng tôi hiểu rằng mỗi người có nhu cầu và ưu tiên riêng về công nghệ.</p>
                        </div>
                        <div className="p-6 rounded-lg flex-1">
                            <div className="flex items-center mb-4">
                                <div
                                    className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">02
                                </div>
                                <h3 className="ml-4 text-lg font-semibold">Chất Lượng Đảm Bảo</h3>
                            </div>
                            <p className="">Tất cả các sản phẩm được bán trên trang web của chúng tôi đều được kiểm tra và đảm bảo
                                chất
                                lượng.</p>
                        </div>
                        <div className="p-6 rounded-lg flex-1">
                            <div className="flex items-center mb-4">
                                <div
                                    className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">03
                                </div>
                                <h3 className="ml-4 text-lg font-semibold">Chăm Sóc Khách Hàng</h3>
                            </div>
                            <p>Chúng tôi đặt khách hàng lên hàng đầu và cam kết cung cấp dịch vụ chăm sóc khách hàng
                                chất
                                lượng.</p>
                        </div>
                    </div>
                </div>
                <div className="basis-3/4">
                    <div className=" p-8 mt-8">
                        <h2 className="text-2xl font-semibold mb-4">Chính sách bảo hành và đổi trả</h2>
                        <p className="mb-6">Chúng tôi cung cấp chính sách bảo hành và đổi trả linh hoạt để đảm bảo sự
                            hài
                            lòng của bạn. Nếu bạn gặp bất kỳ vấn đề nào với sản phẩm, chúng tôi sẽ hỗ trợ bạn trong quá
                            trình bảo hành và đổi trả để đảm bảo rằng bạn nhận được sự hỗ trợ và giải quyết tốt
                            nhất.</p>
                        <div className="flex space-x-4 mb-6">
                            <button className="bg-orange-500 text-white px-4 py-2 rounded">Bảo hành</button>
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Đổi trả</button>
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Điều khoản</button>
                        </div>
                        <ul className="list-none space-y-4">
                            <li className="flex items-center">
                                <i className="fas fa-check text-orange-500 mr-2"></i>
                                Thời gian bảo hành từ 6 tháng đến 1 năm
                            </li>
                            <li className="flex items-center">
                                <i className="fas fa-check text-orange-500 mr-2"></i>
                                Phạm vi bảo hành gồm do lỗi kỹ thuật hoặc sản xuất trong quá trình sử dụng
                            </li>
                            <li className="flex items-center">
                                <i className="fas fa-check text-orange-500 mr-2"></i>
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
