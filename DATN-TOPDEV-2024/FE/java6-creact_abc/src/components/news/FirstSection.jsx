import React from 'react';

const FirstSection = () => {
  return (
    <section className="pt-4 pb-10 bg-gray-100">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ảnh đầu tiên chiếm 1/2 màn hình */}
        <div className="relative col-span-1 lg:col-span-1 group overflow-hidden">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAHAe0g1f5ng-92MI1s6prc0NW9ZnRPDlHuQ&s"
            alt="Post"
            className="w-full h-64 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-105 group-hover:origin-center"
          />
          <div className="absolute bottom-0 p-4 bg-gradient-to-t from-black text-white w-full">
            <span className="bg-orange-500 text-base px-2 py-1">Technology</span>
            <h3 className="mt-2 font-semibold text-4xl">Say hello to real handmade office furniture!</h3>
            <small>24 July, 2017 - by Amanda</small>
          </div>
        </div>

        {/* Container cho 2 ảnh nhỏ, mỗi ảnh chiếm 1/4 màn hình */}
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-4">
          <div className="relative group overflow-hidden">
            <img
              src="https://miro.medium.com/v2/resize:fit:1156/1*VzexncB2H2chkgC87wcnAA.jpeg"
              alt="Post"
              className="w-full h-64 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-105 group-hover:origin-center"
            />
            <div className="absolute bottom-0 p-4 bg-gradient-to-t from-black text-white w-full">
              <span className="bg-orange-500 text-base px-2 py-1">Gadgets</span>
              <h4 className="mt-2 font-semibold text-2xl">Do not make mistakes when choosing web hosting</h4>
              <small>03 July, 2017 - by Jessica</small>
            </div>
          </div>
          <div className="relative group overflow-hidden">
            <img
              src="https://www.macquarie.com/au/en/insights/technology-and-services/_jcr_content/imageMeta.coreimg.jpeg/1694473502508/technology-hero-desktop.jpeg"
              alt="Post"
              className="w-full h-64 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-105 group-hover:origin-center"
            />
            <div className="absolute bottom-0 p-4 bg-gradient-to-t from-black text-white w-full">
              <span className="bg-orange-500 text-base px-2 py-1">Technology</span>
              <h4 className="mt-2 font-semibold text-2xl">The most reliable Galaxy Note 8 images leaked</h4>
              <small>01 July, 2017 - by Jessica</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FirstSection;
