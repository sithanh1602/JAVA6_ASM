import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard'; // Ensure the path is correct based on your folder structure
import ProductService from '../../services/ProductService';

const ProductList = ({ currentPage, productsPerPage, view, sortOption }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetchedProducts = await ProductService.getAllProducts(); // Assume this fetches all products
                // Sort products based on sortOption
                const sortedProducts = [...fetchedProducts].sort((a, b) => {
                    if (sortOption === 'priceAsc') return a.price - b.price;
                    if (sortOption === 'priceDesc') return b.price - a.price;
                    return 0; // default sorting
                });
                setProducts(sortedProducts);
                setLoading(false);
            } catch (err) {
                setError('Error fetching products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sortOption]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Calculate the current products to display based on the current page
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    return (
        <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {currentProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
            ))}
        </div>
    );
};

export default ProductList;
