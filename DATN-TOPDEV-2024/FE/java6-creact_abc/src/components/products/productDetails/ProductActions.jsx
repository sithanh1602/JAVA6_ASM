import React from 'react';

const ProductActions = ({ activeTab, setActiveTab }) => {
    const renderContent = () => {
        switch (activeTab) {
            case 'description':
                return <p>Product description content goes here.</p>;
            case 'additionalInfo':
                return <p>Additional information content goes here.</p>;
            case 'reviews':
                return <p>Customer reviews content goes here.</p>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center mt-10">
            <div className="flex space-x-4 mb-4">
                <button
                    className={`px-6 py-2 ${activeTab === 'description' ? 'bg-orange-500 text-white' : 'border'}`}
                    onClick={() => setActiveTab('description')}
                >
                    MÔ TẢ
                </button>
                <button
                    className={`px-6 py-2 ${activeTab === 'additionalInfo' ? 'bg-orange-500 text-white' : 'border'}`}
                    onClick={() => setActiveTab('additionalInfo')}
                >
                    THÔNG TIN BỔ SUNG
                </button>
                <button
                    className={`px-6 py-2 ${activeTab === 'reviews' ? 'bg-orange-500 text-white' : 'border'}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    ĐÁNH GIÁ (1)
                </button>
            </div>
            <div className="border p-4 w-full max-w-6xl">
                {renderContent()}
            </div>
        </div>
    );
};

export default ProductActions;
