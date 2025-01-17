import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ContactService from '../../services/ContactService';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Validation schema using Yup
const validationSchema = yup.object().shape({
    fullName: yup
        .string()
        .required('Họ tên là bắt buộc.')
        .min(2, 'Họ tên phải có ít nhất 2 ký tự.'),
    email: yup
        .string()
        .required('Email là bắt buộc.')
        .email('Email không hợp lệ.'),
    phone: yup
        .string()
        .required('Số điện thoại là bắt buộc.')
        .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ.'),
    subject: yup.string().optional(),
    message: yup
        .string()
        .required('Nội dung là bắt buộc.')
        .min(10, 'Nội dung phải có ít nhất 10 ký tự.')
});

const ContactForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(validationSchema)
    });

    // Handle form submission
    const onSubmit = async (data) => {
        try {
            console.log('Form data:', data); // Check form data
            await ContactService.createContact(data); // Submit form data
            Swal.fire({
                title: 'Thành công!',
                text: 'Gửi liên hệ thành công!',
                icon: 'success',
                confirmButtonText: 'Đóng'
            });
            reset(); // Reset form fields
        } catch (error) {
            console.error('Error:', error); // Log error
            Swal.fire({
                title: 'Lỗi!',
                text: 'Đã xảy ra lỗi khi gửi liên hệ.',
                icon: 'error',
                confirmButtonText: 'Thử lại'
            });
        }
    };

    return (
        <section className="py-0 px-16">
            <div className="p-8 flex space-x-8">
                <div className="w-1/2">
                    <img
                        alt="A person with a thoughtful expression, wearing a blue sweater"
                        className="rounded-lg"
                        height="560px"
                        src="https://mona-smart.monamedia.net/wp-content/uploads/2022/09/img_01.jpg"
                        width="469px"
                    />
                </div>
                <div className="w-2/3">
                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <input
                                    className={`w-full p-4 border rounded-lg ${
                                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Họ tên *"
                                    type="text"
                                    {...register('fullName')}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>
                            <div className="w-1/2">
                                <input
                                    className={`w-full p-4 border rounded-lg ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Email *"
                                    type="email"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <input
                                    className={`w-full p-4 border rounded-lg ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Số điện thoại *"
                                    type="text"
                                    {...register('phone')}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>
                            <div className="w-1/2">
                                <input
                                    className="w-full p-4 border border-gray-300 rounded-lg"
                                    placeholder="Chủ đề"
                                    type="text"
                                    {...register('subject')}
                                />
                            </div>
                        </div>
                        <div>
                            <textarea
                                className={`w-full p-3 border rounded-lg ${
                                    errors.message ? 'border-red-500' : 'border-gray-300'
                                } h-52`}
                                placeholder="Nhập nội dung *"
                                {...register('message')}
                            ></textarea>
                            {errors.message && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.message.message}
                                </p>
                            )}
                        </div>
                        <button
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang gửi...' : 'GỬI LIÊN HỆ'}
                            <i className="fas fa-arrow-right ml-3"></i>
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;
