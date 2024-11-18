const Services = () => {
    return (
        <section className="g-gray-50 mb-10 flex items-center justify-center px-3">
            <div className="max-w-7xl flex flex-col lg:flex-row items-center gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Cột trái */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Dịch vụ chăm sóc khách hàng</h2>
                        <p className="text-gray-600">
                            Chúng tôi đặt khách hàng lên hàng đầu và cam kết cung cấp dịch vụ chăm sóc khách hàng chất
                            lượng.
                            Đội ngũ nhân viên chuyên nghiệp và thân thiện của chúng tôi luôn sẵn sàng hỗ trợ bạn trong
                            quá trình mua sắm, đặt hàng và sau khi mua hàng.
                        </p>
                        <div className="relative">
                            <div className="flex items-start space-x-6">
                                <img
                                    src="https://mona-smart.monamedia.net/wp-content/uploads/2022/09/img_16-600x427.jpg"
                                    alt="Customer service"
                                    className="rounded-lg shadow-md w-[300px] h-[300px] object-cover"
                                />

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Giá cả cạnh tranh</h2>
                                    <p className="text-gray-600 mb-3">
                                        Chúng tôi hiểu rằng giá cả là một yếu tố quan trọng khi mua sắm.
                                    </p>
                                    <ul className="list-none space-y-2 text-gray-600">
                                        <li className="flex items-start">
                                            <i className="fas fa-check text-orange-500 mr-2  mt-1"></i>
                                            Đa dạng sản phẩm
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check text-orange-500 mr-2  mt-1"></i>
                                            Chất lượng sản phẩm
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check text-orange-500 mr-2  mt-1"></i>
                                            Tính năng vượt trội
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-check text-orange-500 mr-2 mt-1"></i>
                                            Hỗ trợ khách hàng
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-6">

                        <img
                            src="https://mona-smart.monamedia.net/wp-content/uploads/2022/09/img_16-600x427.jpg"
                            alt="Team discussion"
                            className="rounded-lg shadow-md w-full h-[500px] object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
