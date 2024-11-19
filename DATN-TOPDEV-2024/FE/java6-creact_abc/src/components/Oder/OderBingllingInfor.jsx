import React from 'react';

const BillingInfo = () => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Thông tin thanh toán</h2>
        <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tên <span className="text-red-500">*</span></label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Họ <span className="text-red-500">*</span></label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tên công ty (tuỳ chọn)</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Quốc gia/Khu vực <span className="text-red-500">*</span></label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option>Việt Nam</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ <span className="text-red-500">*</span></label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Địa chỉ" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Số nhà</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Mã bưu điện (tuỳ chọn)</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ email <span className="text-red-500">*</span></label>
                <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-orange-600 border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-gray-900">Tạo tài khoản mới?</label>
            </div>
        </form>
        <h2 className="text-2xl font-bold mt-8 mb-4">Thông tin bổ sung</h2>
        <div>
            <label className="block text-sm font-medium text-gray-700">Ghi chú đơn hàng (tuỳ chọn)</label>
            <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="4" placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."></textarea>
        </div>
    </div>
);

export default BillingInfo;
