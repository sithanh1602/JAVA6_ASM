import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import VoucherService from "../../../../services/VoucherService";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const schema = yup.object().shape({
    code: yup
        .string()
        .required('Bắt buộc nhập mã voucher')
        .min(3, 'Mã voucher phải có ít nhất 3 ký tự')
        .matches(/^[A-Za-z0-9]+$/, 'Mã voucher chỉ được chứa chữ cái và số, không có khoảng trắng'),
    discount: yup
        .number()
        .required('Bắt buộc nhập giá trị giảm')
        .typeError('Giá trị giảm phải là số')
        .min(1000, 'Giá trị giảm phải ít nhất 1,000 VNĐ')
        .max(1000000, 'Giá trị giảm không được vượt quá 1,000,000 VNĐ'),
    quantity: yup
        .number()
        .required('Bắt buộc nhập số lượng')
        .typeError('Số lượng phải là số')
        .min(1, 'Số lượng voucher phải ít nhất 1')
        .integer('Số lượng phải là số nguyên'),
    startDate: yup
        .date()
        .required('Bắt buộc chọn ngày bắt đầu')
        .typeError('Vui lòng chọn ngày hợp lệ'),
    endDate: yup
        .date()
        .required('Bắt buộc chọn ngày kết thúc')
        .typeError('Vui lòng chọn ngày hợp lệ')
        .min(
            yup.ref('startDate'),
            'Ngày kết thúc phải sau ngày bắt đầu'
        ),
    status: yup
        .string()
        .required('Bắt buộc chọn trạng thái')
});

const VoucherInput = ({ voucher, onSave }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            code: '',
            discount: 0,
            quantity: 1,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
            status: 'Active'
        }
    });

    useEffect(() => {
        if (voucher) {
            reset({
                id: voucher.id || '',
                code: voucher.code || '',
                discount: voucher.discount || 0,
                quantity: voucher.quantity || 1,
                startDate: voucher.startDate ? new Date(voucher.startDate) : new Date(),
                endDate: voucher.endDate ? new Date(voucher.endDate) : new Date(new Date().setDate(new Date().getDate() + 30)),
                status: voucher.status || 'Active'
            });
        }
    }, [voucher, reset]);

    const onSubmit = async (data) => {
        try {
            if (voucher) {
                // Update existing voucher
                await VoucherService.updateVoucher(voucher.id, data);
                Swal.fire("Thành công", "Cập nhật voucher thành công", "success");
            } else {
                // Create new voucher
                await VoucherService.createVoucher(data);
                Swal.fire("Thành công", "Thêm mới voucher thành công", "success");
            }
            onSave();
        } catch (error) {
            Swal.fire("Lỗi", error.response?.data?.message || "Đã xảy ra lỗi", "error");
        }
    };

    return (
        <div className="h-full bg-white">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Code */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Mã voucher</label>
                    <input
                        {...register("code")}
                        placeholder="Nhập mã voucher"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.code && (
                        <span className="text-red-500 text-sm">{errors.code.message}</span>
                    )}
                </div>

                {/* Discount and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Giá trị giảm (VNĐ)</label>
                        <input
                            {...register("discount")}
                            type="number"
                            placeholder="Nhập giá trị giảm"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.discount && (
                            <span className="text-red-500 text-sm">{errors.discount.message}</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                        <input
                            {...register("quantity")}
                            type="number"
                            placeholder="Nhập số lượng"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.quantity && (
                            <span className="text-red-500 text-sm">{errors.quantity.message}</span>
                        )}
                    </div>
                </div>

                {/* Start Date and End Date */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            )}
                        />
                        {errors.startDate && (
                            <span className="text-red-500 text-sm">{errors.startDate.message}</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    minDate={watch('startDate')}
                                />
                            )}
                        />
                        {errors.endDate && (
                            <span className="text-red-500 text-sm">{errors.endDate.message}</span>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <select
                        {...register("status")}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="hoatdong">Còn hiệu lực</option>
                        <option value="hethoatdong">Hết hiệu lực</option>
                    </select>
                    {errors.status && (
                        <span className="text-red-500 text-sm">{errors.status.message}</span>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        {voucher ? "Cập nhật Voucher" : "Tạo Voucher"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VoucherInput;