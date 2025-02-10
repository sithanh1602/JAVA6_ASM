import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import getAllProductVariants from '../../services/ProductVariantService';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProductVariantCard from "./Variants/VariantsProductCard";

const ProductList = ({ currentPage, productsPerPage, view, sortOption }) => {
    const [variants, setVariants] = useState([]);
    const [filteredVariants, setFilteredVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    useEffect(() => {
        const fetchVariants = async () => {
            try {
                const fetchedVariants = await getAllProductVariants();

                // Sắp xếp theo giá nếu có lựa chọn sortOption
                const sortedVariants = [...fetchedVariants].sort((a, b) => {
                    if (sortOption === 'priceAsc') return a.price - b.price;
                    if (sortOption === 'priceDesc') return b.price - a.price;
                    return 0;
                });

                setVariants(sortedVariants);
                setFilteredVariants(sortedVariants);
                setLoading(false);
            } catch (err) {
                setError('Error fetching product variants');
                setLoading(false);
            }
        };

        fetchVariants();
    }, [sortOption]);

    useEffect(() => {
        const filtered = variants.filter(variant => {
            const variantName = variant.name || ""; // Gán giá trị mặc định nếu name là null hoặc undefined
            return variantName.toLowerCase().includes(searchQuery.toLowerCase());
        });
        setFilteredVariants(filtered);
    }, [searchQuery, variants]);


    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const indexOfLastVariant = currentPage * productsPerPage;
    const indexOfFirstVariant = indexOfLastVariant - productsPerPage;
    const currentVariants = filteredVariants.slice(indexOfFirstVariant, indexOfLastVariant);

    return (
        <div>
            <div className="search-filter-container mb-4 flex justify-start items-center space-x-4" data-aos="fade-down">
                <input
                    type="text"
                    placeholder="Tìm kiếm biến thể sản phẩm..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="border-2 border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none p-2 w-full sm:w-1/3 transition duration-200"
                />
            </div>

            <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-5' : 'grid-cols-1'} sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`}>
                {variants.length > 0 ? (
                    variants.map((variant) => <ProductCard key={variant.idVariants} variant={variant} />)
                ) : (
                    <p>Không có sản phẩm nào.</p>
                )}
            </div>
        </div>
    );
};

export default ProductList;
