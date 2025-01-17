const Header = () => {
    return (
        <header className="py-8 px-14">
            <div className="container mx-auto py-4 p-8">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <a href="#" class="hover:text-orange-500">Trang chủ</a>
                    <span>&gt;</span>
                    <span className="text-orange-500">Liên hệ</span>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center space-x-4 p-4 hover-border">
                        <i className="fas fa-envelope text-orange-500 text-2xl"></i>
                        <div>
                            <h3 className="font-bold">Email</h3>
                            <p>info@fivestar.team</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 hover-border">
                        <i className="fas fa-map-marker-alt text-orange-500 text-2xl"></i>
                        <div>
                            <h3 className="font-bold">Địa chỉ</h3>
                            <p>306h/2 KDC Hang Bang, KV5, An Khanh, Ninh Kieu, Can Tho</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 hover-border">
                        <i className="fas fa-phone text-orange-500 text-2xl"></i>
                        <div>
                            <h3 className="font-bold">Số điện thoại</h3>
                            <p>(+84) 0313-728-397</p>
                            <p>(+84) 0313-728-397</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 hover-border">
                        <i className="fas fa-comments text-orange-500 text-2xl"></i>
                        <div>
                            <h3 className="font-bold">Liên hệ</h3>
                            <p>radios.info@gmail.com</p>
                            <p>radios.support@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
</header>
)
    ;
};

export default Header;
