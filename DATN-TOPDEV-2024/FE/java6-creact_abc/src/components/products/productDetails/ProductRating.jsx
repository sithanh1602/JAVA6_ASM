import React, { useEffect, useState } from "react";
import { FaRegThumbsUp, FaStar } from "react-icons/fa";
import RatingService from "../../../services/RatingService";

const ProductRating = ({ productDetailsId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);


  const fetchRating = async () => {
    try {
      const response = await RatingService.getAllReviews();
      const numericId =
        typeof productDetailsId === "string"
          ? parseInt(productDetailsId, 10)
          : productDetailsId;
      const filteredReviews = response.filter(
        (review) =>
          review?.orderDetail?.product_variant_id?.product?.id === numericId
      );
      setReviews(filteredReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchRating();
  }, [productDetailsId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const totalReviews = reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((review) => {
    const rating = review.rating;
    if (ratingCounts.hasOwnProperty(rating)) {
      ratingCounts[rating] += 1;
    }
  });

  const fetchAverageRating = async () => {
    try {
      const response = await RatingService.getAverageRating(productDetailsId);
      setAverageRating(response);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá trung bình:", error);
      setAverageRating(0);
    }
  };
  
  useEffect(() => {
    fetchAverageRating();
  }, [productDetailsId]);
  
  const formatTotalReviews =
    totalReviews >= 1000
      ? `${(totalReviews / 1000).toFixed(1)}K`
      : totalReviews;

  return (
    <div>
      <section className="py-24 relative">
        <div className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto">
          <div className="w-full">
            <h2 className="font-manrope font-bold text-3xl text-black mb-8 text-center">
              Đánh giá của khách hàng
            </h2>
            <section className="py-10 relative">
              <div className="w-full max-w-7xl px-4 md:px-5 lg:px-6 mx-auto">
                <div>
                  <div className="grid grid-cols-12 mb-11">
                    {/* Phần thống kê: Rating breakdown */}
                    <div className="col-span-12 xl:col-span-4 flex flex-col gap-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingCounts[star];
                        const percentage = totalReviews
                          ? (count / totalReviews) * 100
                          : 0;
                        return (
                          <div key={star} className="flex items-center w-full">
                            <p className="font-medium text-lg py-[1px] text-black mr-[2px]">
                              {star}
                            </p>
                            <FaStar className="text-xl" color={"#ffc107"} />
                            <p className="h-2 w-full sm:min-w-[278px] rounded-[30px] bg-gray-200 ml-5 mr-3">
                              <span
                                className="h-full rounded-[30px] bg-indigo-500 flex"
                                style={{ width: `${percentage}%` }}
                              />
                            </p>
                            <p className="font-medium text-lg py-[1px] text-black mr-[2px]">
                              {count}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="col-span-12 max-xl:mt-8 xl:col-span-8 xl:pl-8 w-full min-h-[180px]">
                      <div className="grid grid-cols-12 h-full px-8 max-lg:py-8 rounded-3xl bg-gray-100 w-full max-xl:max-w-3xl max-xl:mx-auto">
                        <div className="col-span-12 md:col-span-12 flex items-center">
                          <div className="flex flex-col sm:flex-row items-center max-lg:justify-center w-full h-full">
                            <div className="sm:pr-10 sm:border-r border-gray-200 flex items-center justify-center flex-col">
                              <h2 className="font-manrope font-bold text-xl mt-3 text-black text-center mb-4">
                                Tổng đánh giá
                              </h2>
                              <div className="flex items-center gap-3 mb-4">
                                <h2 className="font-manrope font-bold text-lg pt-4 text-black text-center mb-4">
                                  {formatTotalReviews} Đánh giá
                                </h2>
                              </div>
                            </div>
                            <div className="sm:pl-10 sm:border-l border-gray-200 flex items-center justify-center flex-col">
                              <h2 className="font-manrope font-bold text-xl mt-3 text-black text-center mb-4">
                                Đánh giá trung bình
                              </h2>
                              <div className="flex items-center gap-3 mb-4">
                                <h2 className="font-manrope font-bold text-lg pt-4 text-black text-center mb-4">
                                {averageRating ? averageRating.toFixed(1) : "0.0"}
                                </h2>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, index) => {
                                    const ratingValue = index + 1;
                                    return (
                                      <button
                                        key={index}
                                        className="bg-transparent border-none outline-none cursor-pointer">
                                        <FaStar
                                          className="text-xl"
                                          color={
                                            ratingValue <= averageRating
                                              ? "#ffc107"
                                              : "#e4e5e9"
                                          }
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-5 pb-8 border-1 rounded-lg border-gray-300 max-xl:max-w-2xl max-xl:mx-auto mb-4">
                        <div className="flex sm:items-center flex-col min-[400px]:flex-row justify-between gap-5 mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                review?.user?.image ||
                                "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                              }
                              alt={`${review?.user?.fullName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <h6 className="font-semibold text-lg leading-8 text-gray-950">
                              {review?.user?.fullName}
                            </h6>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                  <FaStar
                                    key={index}
                                    className="text-lg"
                                    color={
                                      ratingValue <= review.rating
                                        ? "#ffc107"
                                        : "#e4e5e9"
                                    }
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <p className="font-normal text-base leading-8 text-gray-400 max-xl:text-justify">
                          {review.comment}
                        </p>
                        <div className="flex sm:items-center flex-col min-[400px]:flex-row justify-between gap-5 mt-4">
                          <div className="flex items-center gap-3">
                            <p className="font-normal text-base leading-8 text-gray-400">
                              {review.createAt
                                ? formatDate(review.createAt)
                                : "không có ngày tạo"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <FaRegThumbsUp className="text-gray-700 hover:text-blue-500 cursor-pointer text-lg" />
                            <p className="font-normal text-base leading-8 text-gray-600">
                              12
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      Chưa có bất kỳ đánh giá nào về sản phẩm
                    </p>
                  )}
                  {/* End review list */}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductRating;
