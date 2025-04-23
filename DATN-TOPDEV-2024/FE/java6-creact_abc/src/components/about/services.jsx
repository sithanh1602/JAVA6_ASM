import Team from "../../assets/team.jpg";
const Services = () => {
    return (
        <section className=" mb-10 flex items-center justify-center px-4 mt-10">
            <div className="max-w-7xl flex flex-col lg:flex-row items-center gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    {/* Cột trái */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Dịch vụ chăm sóc khách hàng
                        </h2>
                        <p className="text-gray-600 text-base md:text-lg">
                            Chúng tôi đặt khách hàng lên hàng đầu và cam kết cung cấp dịch vụ chăm sóc khách hàng chất lượng.
                            Đội ngũ nhân viên chuyên nghiệp và thân thiện của chúng tôi luôn sẵn sàng hỗ trợ bạn trong quá trình mua sắm, đặt hàng và sau khi mua hàng.
                        </p>

                        <div className="flex items-start gap-6">
                            <img
                                src="https://i.pinimg.com/736x/91/fa/9a/91fa9a87fbacb805a507ff4160a104f8.jpg"
                                alt="Customer service"
                                className="rounded-lg shadow-md w-[280px] h-[280px] object-cover"
                            />

                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Giá cả cạnh tranh
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm md:text-base">
                                    Chúng tôi hiểu rằng giá cả là yếu tố then chốt khi chọn lựa sản phẩm.
                                </p>
                                <ul className="list-none space-y-2 text-gray-700 text-sm md:text-base">
                                    {[
                                        "Đa dạng sản phẩm",
                                        "Chất lượng sản phẩm",
                                        "Tính năng vượt trội",
                                        "Hỗ trợ khách hàng",
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start  transition-colors duration-200">
                                            <i className="fas fa-check text-blue-500 mr-2 mt-1"></i>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-6">
                        <img
                            src={Team}
                            alt="Team discussion"
                            className="rounded-lg shadow-md w-full h-[500px] object-cover hover:shadow-blue-300 transition-shadow duration-300"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
