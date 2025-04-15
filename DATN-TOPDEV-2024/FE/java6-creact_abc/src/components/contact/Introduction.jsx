import FAQ from "./FAQ";
const Introduction = () => {
    return (
        <section className="py-8 px-6">
            <div className="flex p-16 container justify-center items-center h-screen">
                <div className="flex space-x-4">
                    <div className="relative">
                        <img
                            alt="A modern workspace with a desktop computer, laptop, tablet, and a mug on a glass table with a view of the sky and clouds through the window."
                            className="w-full h-auto" height="600"
                            src="https://storage.googleapis.com/a1aa/image/TKE6Yma35vpyAlsTsgZZL5DwAGbA4P8LYgMGfXVGhLrNuw4JA.jpg"
                            width="800"/>
                        <div className="absolute inset-0 flex justify-center items-center">
                            <div className="bg-white bg-opacity-105 rounded-full p-4">
                                <i className="fas fa-play text-primary-500 text-3xl ml-2">
                                </i>
                            </div>
                        </div>
                    </div>
                    <div>
                        <img alt="A person in a suit sitting at a desk, looking at a laptop and writing in a notebook."
                             className="w-full h-auto" height="600"
                             src="https://storage.googleapis.com/a1aa/image/zz7b36VXKT7ebyIIfbyteWS3miGaeehuVLbTS9oiOPRXjLMeE.jpg"
                             width="800"/>
                    </div>
                </div>
            </div>
            <div className="container mx-auto p-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold mb-4">Chào mừng bạn đến với trang Liên hệ của chúng
                                tôi!</h1>
                            <p className="text-lg mb-4">Chào mừng bạn đến với trang Liên hệ của chúng tôi! Đây là nơi
                                bạn có thể liên hệ trực tiếp với chúng tôi để chia sẻ câu hỏi, ý kiến hoặc yêu cầu của
                                bạn. Chúng tôi rất mong muốn được lắng nghe và giải đáp mọi thắc mắc của bạn</p>
                            <p className="text-lg">Chúng tôi xin cam kết rằng mọi thông tin mà bạn cung cấp cho chúng
                                tôi sẽ được bảo mật và sử dụng chỉ cho mục đích liên hệ và hỗ trợ bạn. Chân thành cảm ơn
                                sự quan tâm của bạn đến chúng tôi và chúng tôi sẵn lòng hỗ trợ bạn trong mọi vấn đề liên
                                quan đến sản phẩm công nghệ của chúng tôi.</p>
                        </div>
                    </div>
                    <FAQ/>
                </div>
            </div>

        </section>
    );
};

export default Introduction;
