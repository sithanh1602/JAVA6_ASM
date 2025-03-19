import React, { useState, useEffect } from "react";
import Breadcrumb from "../components/products/Breadcrumb";
import PCBuildList from "../components/buildPC/PCBuildList";
import PaginationComponent from "../components/products/Pagination";
import BuildPCService from "../services/BuildPcService";

const PCBuildsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [buildsPerPage] = useState(9);
  const [view, setView] = useState("grid");
  const [sortOption, setSortOption] = useState("default");
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [pcBuilds, setPcBuilds] = useState([]);
  const [totalBuilds, setTotalBuilds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPCBuilds = async () => {
      try {
        setLoading(true);
        const response = await BuildPCService.getAllBuildPC();
        setPcBuilds(response.data);
        setTotalBuilds(response.data.length);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách cấu hình PC:", error);
        setError("Không thể tải danh sách cấu hình PC, vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    fetchPCBuilds();
  }, []);

  const indexOfLastBuild = currentPage * buildsPerPage;
  const indexOfFirstBuild = indexOfLastBuild - buildsPerPage;
  const displayRange = `Hiển thị ${indexOfFirstBuild + 1}–${Math.min(
    indexOfLastBuild,
    totalBuilds
  )} của ${totalBuilds} cấu hình PC`;

  const handlePurposeFilterChange = (purpose) => {
    setSelectedPurpose(purpose);
    setCurrentPage(1);
  };

  const handleViewChange = (view) => {
    setView(view);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Lọc cấu hình theo mục đích sử dụng
  const filteredBuilds = selectedPurpose
    ? pcBuilds.filter((build) => build.usagePurpose === selectedPurpose)
    : pcBuilds;

  // Sắp xếp các cấu hình
  const sortedBuilds = [...filteredBuilds].sort((a, b) => {
    switch (sortOption) {
      case "priceAsc":
        return a.totalPrice - b.totalPrice;
      case "priceDesc":
        return b.totalPrice - a.totalPrice;
      case "newest":
        return new Date(b.createdDate) - new Date(a.createdDate);
      default:
        return 0;
    }
  });

  // Lấy các cấu hình cho trang hiện tại
  const currentBuilds = sortedBuilds.slice(indexOfFirstBuild, indexOfLastBuild);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
      <Breadcrumb pageName="Máy tính có sẵn" />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{displayRange}</span>
          <button
            className={`p-2 border rounded ${
              view === "grid" ? "bg-gray-300" : ""
            }`}
            onClick={() => handleViewChange("grid")}
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            className={`p-2 border rounded ${
              view === "list" ? "bg-gray-300" : ""
            }`}
            onClick={() => handleViewChange("list")}
          >
            <i className="fas fa-list"></i>
          </button>
          <select
            className="p-2 border rounded"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="default">Thứ tự mặc định</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
            <option value="newest">Mới nhất</option>
          </select>
        </div>
      </div>
      <div className="flex">
        <PCBuildList
          currentPage={currentPage}
          buildsPerPage={buildsPerPage}
          view={view}
          sortOption={sortOption}
          selectedPurpose={selectedPurpose}
          builds={currentBuilds}
          onPurposeChange={handlePurposeFilterChange}
        />
      </div>
      <PaginationComponent
        productsPerPage={buildsPerPage}
        totalProducts={totalBuilds}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};

export default PCBuildsPage;
