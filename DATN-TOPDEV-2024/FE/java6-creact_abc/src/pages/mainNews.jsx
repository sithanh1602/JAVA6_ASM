import React from "react";

// import Header from "../components/news/header";
import FirstSection from "../components/news/FirstSection";
import BlogSection from "../components/news/BlogSection";

const NewsPage = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* <Header/> */}
      <FirstSection />
      <BlogSection />
    </div>
  );
};

export default NewsPage;
