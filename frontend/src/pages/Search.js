import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, User, X } from 'lucide-react';
import { pinAPI } from '../api';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  const categoryParam = queryParams.get('category') || 'すべて';
  
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [pins, setPins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // カテゴリーリスト
  const categories = [
    'すべて', 'インテリア', '料理', 'DIY', '旅行', '植物', 'ファッション', 'テクノロジー', 'アート'
  ];
  
  // 検索クエリが変更されたときにURLを更新
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory !== 'すべて') params.set('category', selectedCategory);
    
    navigate({
      pathname: '/search',
      search: params.toString()
    }, { replace: true });
    
  }, [searchTerm, selectedCategory, navigate]);
  
  // 検索実行
  useEffect(() => {
    const fetchPins = async () => {
      if (!searchQuery && selectedCategory === 'すべて') {
        setPins([]);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const params = {
          page: currentPage,
          limit: 20
        };
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        if (selectedCategory !== 'すべて') {
          params.category = selectedCategory;
        }
        
        const response = await pinAPI.getPins(params);
        setPins(response.data.pins);
        setTotalPages(response.data.pages);
      } catch (err) {
        console.error('検索エラー:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPins();
  }, [searchQuery, selectedCategory, currentPage]);
  
  // 検索フォーム送信ハンドラ
  const handleSubmit = (e) => {
    e.preventDefault();
    queryParams.set('q', searchTerm);
    navigate({
      pathname: '/search',
      search: queryParams.toString()
    });
  };
  
  // カテゴリー選択ハンドラ
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowFilters(false);
  };
  
  // 検索クリアハンドラ
  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('すべて');
    setCurrentPage(1);
    navigate('/search');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">
          {searchQuery ? (
            <>「{searchQuery}」の検索結果</>
          ) : selectedCategory !== 'すべて' ? (
            <>「{selectedCategory}」のピン</>
          ) : (
            <>すべてのピン</>
          )}
        </h1>
        
        {/* 検索フォーム */}
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSubmit} className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <SearchIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
          
          <div className="flex gap-2">
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} className="mr-2" />
              フィルター
            </button>
            
            {(searchQuery || selectedCategory !== 'すべて') && (
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                onClick={handleClearSearch}
              >
                クリア
              </button>
            )}
          </div>
        </div>
        
        {/* カテゴリーフィルター */}
        {showFilters && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-medium mb-2">カテゴリー</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-32">
          <div className="text-xl">読み込み中...</div>
        </div>
      ) : pins.length > 0 ? (
        <>
          {/* 検索結果数 */}
          <p className="text-gray-600 mb-4">
            {pins.length}件の結果が見つかりました
          </p>
          
          {/* ピングリッド */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {pins.map(pin => (
              <div
                key={pin._id}
                className="break-inside-avoid mb-4 rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/pins/${pin._id}`)}
              >
                <div className="relative">
                  <img
                    src={`/uploads/${pin.imageUrl}`}
                    alt={pin.title}
                    className="w-full object-cover"
                    style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm truncate">{pin.title}</h3>
                  {pin.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {pin.description}
                    </p>
                  )}
                  {pin.tags && pin.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {pin.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchTerm(tag);
                            setSelectedCategory('すべて');
                            setCurrentPage(1);
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex items-center">
                    {pin.user.profilePic ? (
                      <img
                        src={`/uploads/${pin.user.profilePic}`}
                        alt={pin.user.username}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        <User size={12} />
                      </div>
                    )}
                    <span className="text-xs">{pin.user.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  前へ
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  次へ
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">
            {searchQuery || selectedCategory !== 'すべて' ? (
              <>検索結果が見つかりませんでした</>
            ) : (
              <>検索キーワードまたはカテゴリーを選択してください</>
            )}
          </div>
          
          {(searchQuery || selectedCategory !== 'すべて') && (
            <div className="text-sm text-gray-600 mb-4">
              別のキーワードを試すか、フィルターを変更してみてください。
            </div>
          )}
          
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            onClick={() => navigate('/')}
          >
            ホームに戻る
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;