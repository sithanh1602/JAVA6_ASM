import React, { useState } from "react";
import PCBuildCard from "./PCBuildCard";
import { Spinner, Checkbox, Input, Slider } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";

const PCBuildList = ({ view, builds, onPurposeChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedPurposes, setSelectedPurposes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 20000000]); // Phạm vi giá
  const [filteredBuilds, setFilteredBuilds] = useState(builds);

  // Danh sách các mục đích sử dụng PC
  const purposes = ["Gaming", "Streaming", "Workstation", "Office"];

  // Xử lý tìm kiếm và lọc
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query, selectedPurposes, priceRange);
  };

  // Xử lý thay đổi mục đích sử dụng
  const handlePurposeChange = (e) => {
    const { value, checked } = e.target;

    let newSelectedPurposes;
    if (checked) {
      newSelectedPurposes = [...selectedPurposes, value];
    } else {
      newSelectedPurposes = selectedPurposes.filter(
        (purpose) => purpose !== value
      );
    }

    setSelectedPurposes(newSelectedPurposes);
    applyFilters(searchQuery, newSelectedPurposes, priceRange);

    // Gọi callback để cập nhật filter ở component cha
    if (onPurposeChange) {
      onPurposeChange(
        newSelectedPurposes.length === 1 ? newSelectedPurposes[0] : null
      );
    }
  };

  // Xử lý thay đổi phạm vi giá
  const handlePriceChange = (value) => {
    setPriceRange(value);
    applyFilters(searchQuery, selectedPurposes, value);
  };

  // Áp dụng tất cả các bộ lọc
  const applyFilters = (query, purposes, price) => {
    setIsFiltering(true);

    setTimeout(() => {
      let filtered = builds;

      // Lọc theo tên
      if (query) {
        filtered = filtered.filter((build) =>
          build.buildName.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Lọc theo mục đích sử dụng
      if (purposes.length > 0) {
        filtered = filtered.filter((build) =>
          purposes.includes(build.usagePurpose)
        );
      }

      // Lọc theo giá
      filtered = filtered.filter(
        (build) => build.totalPrice >= price[0] && build.totalPrice <= price[1]
      );

      setFilteredBuilds(filtered);
      setIsFiltering(false);
    }, 300);
  };

  React.useEffect(() => {
    setFilteredBuilds(builds);
  }, [builds]);

  return (
    <div className="w-full">
      <div className="flex mb-6">
        {/* Bộ lọc bên trái */}
        <div className="w-1/4 p-4 border bg-white">

          <h3 className="font-bold mb-2">MỤC ĐÍCH SỬ DỤNG</h3>
          <div className="mb-4">
            {purposes.map((purpose) => (
              <div key={purpose} className="mb-2">
                <label className="flex items-center cursor-pointer">
                  <Checkbox
                    value={purpose}
                    onChange={handlePurposeChange}
                    isSelected={selectedPurposes.includes(purpose)}
                  />
                  <span className="ml-2">{purpose}</span>
                </label>
              </div>
            ))}
          </div>

          <h3 className="font-bold mt-4 mb-2">KHOẢNG GIÁ</h3>
          <Slider
            className="max-w-md"
            maxValue={20000000}
            minValue={0}
            step={1000000}
            value={priceRange}
            onChange={handlePriceChange}
            formatOptions={{ style: "currency", currency: "VND" }}
          />
          <p className="mt-2 text-sm">
            Giá: {priceRange[0].toLocaleString()} -{" "}
            {priceRange[1].toLocaleString()} VND
          </p>
        </div>

        {/* Danh sách cấu hình */}
        <div className="w-3/4 pl-6">
          <div className="search-container mb-4 flex justify-start items-center space-x-4">
            <Input
              type="text"
              placeholder="Tìm kiếm cấu hình PC..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-1/2"
              startContent={<FaSearch size={16} />}
            />
          </div>

          <h2 className="text-sm mb-4">
            <span>Cấu hình PC có sẵn</span>
            <p className="text-gray-500">
              Tổng số cấu hình: {filteredBuilds.length}
            </p>
          </h2>

          <div className="relative min-h-[500px]">
            {isFiltering && (
              <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-50 z-10">
                <Spinner size="lg" color="primary" />
              </div>
            )}

            <div
              className={`grid ${
                view === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "grid-cols-1 gap-4"
              }`}
            >
              {filteredBuilds.length > 0 ? (
                filteredBuilds.map((build, index) => (
                  <PCBuildCard
                    key={build.buildId}
                    build={build}
                    index={index}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">
                    Không tìm thấy cấu hình PC nào phù hợp.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuildList;
