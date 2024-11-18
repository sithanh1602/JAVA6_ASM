const ContactForm = () => {
    return (
        <section className="py-0 px-16">
            <div className=" p-8  flex space-x-8">
                <div className="w-1/2">
                    <img alt="A person with a thoughtful expression, wearing a blue sweater" className="rounded-lg"
                         height="560px"
                         src="https://mona-smart.monamedia.net/wp-content/uploads/2022/09/img_01.jpg"
                         width="469px"/>
                </div>
                <div className="w-2/3">
                    <form className="space-y-4">
                        <div className="flex space-x-4">
                            <input className="w-1/2 p-4 border border-gray-300 rounded-lg" placeholder="Họ tên *"
                                   type="text"/>
                            <input className="w-1/2 p-4 border border-gray-300 rounded-lg" placeholder="Email *"
                                   type="email"/>
                        </div>
                        <div className="flex space-x-4">
                            <input className="w-1/2 p-4 border border-gray-300 rounded-lg" placeholder="Số điện thoại *"
                                   type="text"/>
                            <input className="w-1/2 p-4 border border-gray-300 rounded-lg" placeholder="Chủ đề"
                                   type="text"/>
                        </div>
                        <textarea className="w-full p-3 border border-gray-300 rounded-lg h-52"
                                  placeholder="Nhập nội dung*"></textarea>
                        <button
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300"
                            type="submit">
                            GỬI LIÊN HỆ
                            <i className="fas fa-arrow-right ml-3">
                            </i>
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;
