import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import ProductService from '../../services/ProductService';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ProductList = ({ currentPage, productsPerPage, view, sortOption }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [priceRange, setPriceRange] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await ProductService.getAllProducts();

                // Lọc sản phẩm chỉ lấy những sản phẩm có trạng thái là "Available"
                const availableProducts = fetchedProducts.filter(product => product.status === 'Available');

                // Sắp xếp sản phẩm dựa trên sortOption
                const sortedProducts = [...availableProducts].sort((a, b) => {
                    if (sortOption === 'priceAsc') return a.price - b.price;
                    if (sortOption === 'priceDesc') return b.price - a.price;
                    return 0;
                });

                setProducts(sortedProducts);
                setFilteredProducts(sortedProducts);
                setLoading(false);
            } catch (err) {
                setError('Error fetching products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sortOption]);

    useEffect(() => {
        // Lọc sản phẩm theo từ khóa tìm kiếm và giá
        const filtered = products.filter(product => {
            const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriceRange = priceRange
                ? product.price >= priceRange[0] && product.price <= priceRange[1]
                : true;
            return matchesSearchQuery && matchesPriceRange;
        });
        setFilteredProducts(filtered);
    }, [searchQuery, products, priceRange]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handlePriceChange = (event) => {
        const value = event.target.value;
        if (value === "") {
            setPriceRange(null);
        } else {
            const newRange = value.split(',').map(Number);
            setPriceRange(newRange);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    return (
        <div>
            <div className="search-filter-container mb-4 flex justify-start items-center space-x-4" data-aos="fade-down">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="border-2 border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none p-2 w-full sm:w-1/3 transition duration-200"
                />

                <select
                    id="priceRange"
                    className="border-2 border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none p-2"
                    onChange={handlePriceChange}
                >
                    <option value="">Chọn phạm vi giá</option>
                    <option value="0,100000">Dưới 100.000</option>
                    <option value="100000,500000">100.000 - 500.000</option>
                    <option value="500000,1000000">500.000 - 1.000.000</option>
                    <option value="1000000,3000000">1.000.000 - 3.000.000</option>
                    <option value="3000000,6000000">3.000.000 - 6.000.000</option>
                    <option value="6000000,99999999">Trên 6.000.000</option>
                </select>
            </div>

            <div
                className={`grid gap-4 ${view === 'grid' ? 'grid-cols-5' : 'grid-cols-1'} sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`}
            >
                {currentProducts.map((product, index) => (
                    <div key={product.id} data-aos="fade-up">
                        <ProductCard product={product} index={index} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;
