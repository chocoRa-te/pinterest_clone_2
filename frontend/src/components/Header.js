import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Bell, Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
import { authAPI } from '../api';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 画面サイズによるメニュー表示の調整
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 検索処理
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };
  
  // ログアウト処理
  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
    setIsProfileMenuOpen(false);
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* ロゴ */}
          <Link to="/" className="text-red-600 font-bold text-2xl flex-shrink-0">
            ピンボード
          </Link>
          
          {/* 検索バー (デスクトップ) */}
          <div className="hidden md:block flex-grow max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <button
                type="submit"
                className="absolute right-3 top-2 bg-red-600 text-white p-1 rounded-full"
              >
                <Search size={16} />
              </button>
            </form>
          </div>
          
          {/* ナビゲーション (デスクトップ) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/pins/create"
                  className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
                >
                  作成
                </Link>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Bell size={20} />
                </button>
                <div className="relative">
                  <button
                    className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    {user.profilePic ? (
                      <img
                        src={`/uploads/${user.profilePic}`}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={18} />
                      </div>
                    )}
                    <ChevronDown size={16} />
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20">
                      <div className="py-2 border-b">
                        <p className="px-4 text-sm font-medium">{user.username}</p>
                        <p className="px-4 text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User size={16} className="mr-2" />
                          プロフィール
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings size={16} className="mr-2" />
                          設定
                        </Link>
                      </div>
                      <div className="py-1 border-t">
                        <button
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          ログアウト
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  ログイン
                </Link>
                <Link
                  to="/signup"
                  className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
                >
                  登録
                </Link>
              </>
            )}
          </div>
          
          {/* モバイルメニューボタン */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* 検索バー (モバイル) */}
        <div className="md:hidden mt-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <button
              type="submit"
              className="absolute right-3 top-2 bg-red-600 text-white p-1 rounded-full"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
        
        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-white rounded-lg shadow-lg">
            <div className="py-2">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center">
                      {user.profilePic ? (
                        <img
                          src={`/uploads/${user.profilePic}`}
                          alt={user.username}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <User size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    プロフィール
                  </Link>
                  <Link
                    to="/pins/create"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ピンを作成
                  </Link>
                  <Link
                    to="/boards/create"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ボードを作成
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    設定
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登録
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;