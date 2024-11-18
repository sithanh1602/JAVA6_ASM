const Header = () => {
    return (
        <header className="py-8 px-14">
            <div class="container mx-auto py-4 p-8">
                <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <a href="#" class="hover:text-orange-500">Trang chủ</a>
                    <span>&gt;</span>
                    <span class="text-orange-500">Liên hệ</span>
                </div>
                <div class="grid grid-cols-4 gap-4 mt-4">
                    <div class="flex items-center space-x-4 p-4 hover-border">
                        <i class="fas fa-envelope text-orange-500 text-2xl"></i>
                        <div>
                            <h3 class="font-bold">Email</h3>
                            <p>info@thenona.global</p>
                            <p>(+84) 0313-728-397</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 p-4 hover-border">
                        <i class="fas fa-map-marker-alt text-orange-500 text-2xl"></i>
                        <div>
                            <h3 class="font-bold">Địa chỉ</h3>
                            <p>1073/23 Cách Mạng Tháng 8, P.7, Q.Tân Bình, TPHCM</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 p-4 hover-border">
                        <i class="fas fa-phone text-orange-500 text-2xl"></i>
                        <div>
                            <h3 class="font-bold">Số điện thoại</h3>
                            <p>(+84) 0313-728-397</p>
                            <p>(+84) 0313-728-397</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 p-4 hover-border">
                        <i class="fas fa-comments text-orange-500 text-2xl"></i>
                        <div>
                            <h3 class="font-bold">Contact Us</h3>
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
