import React, { useEffect, useState } from 'react'; 
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts'; 
import DashService from '../../../services/DashService'; 
 
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF']; 
 
const CustomTooltip = ({ active, payload }) => { 
  if (active && payload && payload.length) { 
    const data = payload[0].payload; 
    return ( 
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: 8, borderRadius: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '0.8rem' }}> 
        <div style={{ display: 'flex', alignItems: 'center' }}> 
          <img  
            src={data.imageUrl || "/api/placeholder/28/28"}  
            alt={data.productName} 
            style={{ width: 28, height: 28, marginRight: 8, objectFit: 'cover', borderRadius: 3 }}  
          /> 
          <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{data.productName}</h5> 
        </div> 
        <div style={{ marginTop: 5, fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Đã bán:</span>
            <span style={{ fontWeight: 500 }}>{data.totalQuantitySold}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tỷ lệ:</span>
            <span style={{ fontWeight: 500, color: data.fill }}>{(data.percent * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div> 
    ); 
  } 
  return null; 
}; 
 
export default function EnhancedTopProductsChart() { 
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
 
  useEffect(() => { 
    const loadData = async () => { 
      try { 
        setLoading(true); 
        const products = await DashService.fetchTopProducts();
        
        // Tính toán phần trăm cho mỗi sản phẩm
        const total = products.reduce((acc, product) => acc + product.totalQuantitySold, 0);
        const productsWithPercent = products.map(product => ({
          ...product,
          percent: total > 0 ? product.totalQuantitySold / total : 0
        }));
        
        setData(productsWithPercent); 
        setError(null); 
      } catch (err) { 
        setError('Không thể tải dữ liệu'); 
        console.error(err); 
      } finally { 
        setLoading(false); 
      } 
    }; 
    loadData(); 
  }, []);
 
  if (loading) return <div className="text-center py-2" style={{ fontSize: '0.8rem' }}>Đang tải...</div>; 
  if (error) return <div className="text-center py-2 text-danger" style={{ fontSize: '0.8rem' }}>Lỗi: {error}</div>; 
  if (data.length === 0) return <div className="text-center py-2" style={{ fontSize: '0.8rem' }}>Không có dữ liệu</div>; 
 
  return ( 
    <div className="chart-container" style={{ maxWidth: 550 }}> 
      <div className="py-1 px-2 d-flex justify-content-between align-items-center">
        <h6 className="m-0 font-weight-bold text-primary" style={{ fontSize: '0.85rem' }}>Top {data.length} sản phẩm bán chạy</h6>
      </div>
      
      <div className="card-body p-2">
        <div className="d-flex flex-column">
          {/* Chart - nhỏ gọn */}
          <div style={{ height: 150, position: 'relative' }}> 
            <ResponsiveContainer width="100%" height="100%"> 
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}> 
                <Pie 
                  data={data} 
                  dataKey="totalQuantitySold" 
                  nameKey="productName" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={50} 
                  innerRadius={25} 
                  fill="#8884d8"
                  paddingAngle={2}
                > 
                  {data.map((entry, index) => ( 
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    /> 
                  ))} 
                </Pie> 
                <Tooltip content={<CustomTooltip />} />
                
                {/* Thêm đường kẻ dẫn đơn giản */}
                <svg>
                  <circle cx="50%" cy="50%" r="60" fill="none" stroke="#eee" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="25%" y1="50%" x2="75%" y2="50%" stroke="#eee" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="50%" y1="25%" x2="50%" y2="75%" stroke="#eee" strokeWidth="0.5" strokeDasharray="2 2" />
                </svg>
              </PieChart> 
            </ResponsiveContainer>
          </div>

          {/* Product list - nhỏ gọn */}
          <div style={{ maxHeight: 120, overflowY: 'auto', marginTop: 5, fontSize: '0.7rem' }}>
            {data.map((item, index) => ( 
              <div  
                key={index}  
                style={{  
                  display: 'flex',  
                  alignItems: 'center',  
                  marginBottom: 3,  
                  padding: '2px 4px',  
                  borderRadius: 2,
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'transparent'
                }} 
              > 
                <div style={{ 
                  width: 8, 
                  height: 8, 
                  backgroundColor: COLORS[index % COLORS.length],
                  marginRight: 4,
                  borderRadius: '50%',
                  flexShrink: 0
                }} />
                <img  
                  src={item.imageUrl || "/api/placeholder/16/16"}  
                  alt={item.productName} 
                  style={{  
                    width: 16,  
                    height: 16,  
                    objectFit: 'cover',  
                    marginRight: 4,  
                    borderRadius: 2,
                    flexShrink: 0
                  }} 
                />
                <div style={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  flexGrow: 1,
                }}>
                  {item.productName}
                </div>
                <div style={{ 
                  marginLeft: 'auto', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  <span style={{ fontWeight: 500 }}>Đã bán: {item.totalQuantitySold}</span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    color: '#666',
                    backgroundColor: COLORS[index % COLORS.length] + '15',
                    padding: '0 3px',
                    borderRadius: 8
                  }}>
                    {(item.percent * 100).toFixed(0)}%
                  </span>
                </div>
              </div> 
            ))}
          </div>
        </div>
      </div>
    </div> 
  ); 
}