import React, { useState, useEffect } from 'react';
import { Search, User, PlusCircle, Heart, MessageCircle, Share2, Bookmark, Bell, X } from 'lucide-react';

// Mock data for demonstration
const initialPins = [
  {
    id: 1,
    imageUrl: '/api/placeholder/600/800',
    title: '和風インテリアデザイン',
    description: '伝統的な日本の美学を取り入れたモダンなインテリアデザイン',
    likes: 342,
    comments: 24,
    savedCount: 128,
    creator: {
      name: 'デザイン好き',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['インテリア', 'デザイン', '和風']
  },
  {
    id: 2,
    imageUrl: '/api/placeholder/500/700',
    title: '簡単パスタレシピ',
    description: '15分で作れる！絶品カルボナーラの作り方',
    likes: 567,
    comments: 42,
    savedCount: 324,
    creator: {
      name: 'お料理上手',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['レシピ', 'イタリアン', '簡単料理']
  },
  {
    id: 3,
    imageUrl: '/api/placeholder/400/600',
    title: 'DIY棚の作り方',
    description: '初心者でも作れる！シンプルな木製棚の作り方',
    likes: 289,
    comments: 18,
    savedCount: 201,
    creator: {
      name: 'DIY職人',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['DIY', '家具', '木工']
  },
  {
    id: 4,
    imageUrl: '/api/placeholder/550/750',
    title: '観葉植物の育て方',
    description: '初心者向け！室内で育てやすい観葉植物とそのケア方法',
    likes: 412,
    comments: 31,
    savedCount: 267,
    creator: {
      name: '植物愛好家',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['植物', 'ガーデニング', 'インテリア']
  },
  {
    id: 5,
    imageUrl: '/api/placeholder/450/650',
    title: '週末旅行プラン',
    description: '都会から2時間以内で行ける！リフレッシュできる週末旅行先',
    likes: 501,
    comments: 47,
    savedCount: 382,
    creator: {
      name: '旅行好き',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['旅行', 'リフレッシュ', '週末プラン']
  },
  {
    id: 6,
    imageUrl: '/api/placeholder/480/680',
    title: 'ミニマリストの持ち物',
    description: 'シンプルな暮らしのための必要最低限の持ち物リスト',
    likes: 378,
    comments: 29,
    savedCount: 245,
    creator: {
      name: 'ミニマリスト',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['ミニマリスト', 'シンプルライフ', '断捨離']
  },
];

// Mock categories
const categories = [
  'すべて', 'インテリア', '料理', 'DIY', '旅行', '植物', 'ファッション', 'テクノロジー', 'アート'
];

const App = () => {
  const [pins, setPins] = useState(initialPins);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Filter pins based on search term and category
  const filteredPins = pins.filter(pin => {
    const matchesSearch = pin.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'すべて' || pin.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Handle pin action (like, save, etc.)
  const handlePinAction = (action, pinId) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    // Update pin in state based on action
    setPins(prevPins => prevPins.map(pin => {
      if (pin.id === pinId) {
        switch(action) {
          case 'like':
            return {...pin, likes: pin.likes + 1};
          case 'save':
            return {...pin, savedCount: pin.savedCount + 1};
          default:
            return pin;
        }
      }
      return pin;
    }));
  };

  // Mock login function
  const handleLogin = () => {
    // In a real app, we would validate credentials here
    setIsLoggedIn(true);
    setShowLoginModal(false);
    // Clear form data
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="text-red-600 font-bold text-2xl">ピンボード</div>
          
          {/* Categories */}
          <div className="hidden md:flex space-x-4 overflow-x-auto py-2">
            {categories.map(category => (
              <button 
                key={category}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === category 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder="検索..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} />
            </button>
            {isLoggedIn ? (
              <button className="p-2 rounded-full bg-gray-200">
                <User size={20} />
              </button>
            ) : (
              <button 
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
                onClick={() => setShowLoginModal(true)}
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Mobile Categories (visible on small screens) */}
        <div className="md:hidden overflow-x-auto whitespace-nowrap pb-4">
          {categories.map(category => (
            <button 
              key={category}
              className={`inline-block mr-2 px-3 py-1 rounded-full text-sm font-medium ${
                selectedCategory === category 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Pinterest-style masonry grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPins.map(pin => (
            <div key={pin.id} className="break-inside-avoid mb-4 rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition-shadow duration-300">
              {/* Pin Image */}
              <div className="relative">
                <img 
                  src={pin.imageUrl} 
                  alt={pin.title}
                  className="w-full object-cover"
                />
                {/* Save Button */}
                <button 
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  onClick={() => handlePinAction('save', pin.id)}
                >
                  <Bookmark size={16} />
                </button>
              </div>
              
              {/* Pin Content */}
              <div className="p-3">
                <h3 className="font-bold text-sm">{pin.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{pin.description}</p>
                
                {/* Tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {pin.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Creator */}
                <div className="mt-3 flex items-center">
                  <img 
                    src={pin.creator.avatar} 
                    alt={pin.creator.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-xs font-medium">{pin.creator.name}</span>
                </div>
                
                {/* Actions */}
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <button 
                    className="flex items-center gap-1 hover:text-red-600"
                    onClick={() => handlePinAction('like', pin.id)}
                  >
                    <Heart size={14} /> {pin.likes}
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-600">
                    <MessageCircle size={14} /> {pin.comments}
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-600">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add new pin button - fixed at bottom right */}
          {isLoggedIn && (
            <button className="fixed right-6 bottom-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700">
              <PlusCircle size={24} />
            </button>
          )}
        </div>
      </main>
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">メールアドレス</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="example@email.com"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">パスワード</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="••••••••"
                />
              </div>
              <button 
                onClick={handleLogin}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                ログイン
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない方は <button className="text-red-600 hover:underline">登録する</button>
              </p>
            </div>
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowLoginModal(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
