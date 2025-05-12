import React, { useState } from 'react';
import { Search, User, PlusCircle, Heart, MessageCircle, Share2, Bookmark, Bell, LogOut, Menu, X, ArrowLeft } from 'lucide-react';

// モックデータ
const INITIAL_PINS = [
  {
    id: 1,
    imageUrl: '/api/placeholder/300/400',
    title: '和風インテリアデザイン',
    description: '伝統的な日本の美学を取り入れたモダンなインテリア',
    likes: 342,
    comments: 24,
    creator: {
      name: 'デザイン好き',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['インテリア', 'デザイン', '和風']
  },
  {
    id: 2,
    imageUrl: '/api/placeholder/300/350',
    title: '簡単パスタレシピ',
    description: '15分で作れる！絶品カルボナーラ',
    likes: 567,
    comments: 42,
    creator: {
      name: 'お料理上手',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['レシピ', 'イタリアン', '料理']
  },
  {
    id: 3,
    imageUrl: '/api/placeholder/300/450',
    title: 'DIY棚の作り方',
    description: '初心者でも作れる木製棚',
    likes: 289,
    comments: 18,
    creator: {
      name: 'DIY職人',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['DIY', '家具', '木工']
  },
  {
    id: 4,
    imageUrl: '/api/placeholder/300/380',
    title: '観葉植物の育て方',
    description: '室内で育てやすい観葉植物',
    likes: 412,
    comments: 31,
    creator: {
      name: '植物愛好家',
      avatar: '/api/placeholder/40/40'
    },
    tags: ['植物', 'ガーデニング', 'インテリア']
  }
];

const CATEGORIES = ['すべて', 'インテリア', '料理', 'DIY', '旅行', '植物'];

const PinterestApp = () => {
  // 基本状態
  const [currentScene, setCurrentScene] = useState('login'); // login画面からスタート
  const [pins] = useState(INITIAL_PINS);
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // ログイン用状態
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // 新規登録用状態
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  // ピンをフィルタリング
  const filteredPins = pins.filter(pin => {
    const matchesSearch = 
      searchTerm === '' || 
      pin.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'すべて' || 
      pin.tags.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // ログイン処理
  const handleLogin = () => {
    if (!email || !password) {
      setLoginError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    // 簡易的なログイン処理
    setCurrentUser({
      name: 'ゲストユーザー',
      email: email
    });
    
    // フォームをリセット
    setEmail('');
    setPassword('');
    setLoginError('');
    
    // ホームに戻る
    setCurrentScene('home');
  };

  // 新規登録処理
  const handleSignup = () => {
    if (!username || !signupEmail || !signupPassword) {
      setSignupError('すべての項目を入力してください');
      return;
    }
    
    // 簡易的な登録処理
    setCurrentUser({
      name: username,
      email: signupEmail
    });
    
    // フォームをリセット
    setUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupError('');
    
    // ホームに戻る
    setCurrentScene('home');
  };

  // ログアウト処理
  const handleLogout = () => {
    setCurrentUser(null);
    // ログアウト時はログイン画面に戻る
    setCurrentScene('login');
  };

  // ホームページコンポーネント
  const HomePage = () => (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* ロゴ */}
            <div className="text-red-600 font-bold text-2xl">ピンボード</div>
            
            {/* 検索バー */}
            <div className="relative flex-1 max-w-md mx-4">
              <input
                type="text"
                placeholder="検索..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            {/* ユーザーアクション */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} />
                  </button>
                  <div className="relative">
                    <button className="p-2 rounded-full bg-gray-200">
                      <User size={20} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:underline"
                      onClick={handleLogout}
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700"
                    onClick={() => setCurrentScene('login')}
                  >
                    ログイン
                  </button>
                  <button
                    className="hidden md:block px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100"
                    onClick={() => setCurrentScene('signup')}
                  >
                    登録
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* カテゴリー */}
          <div className="flex space-x-2 overflow-x-auto py-2">
            {CATEGORIES.map(category => (
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
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPins.map(pin => (
            <div 
              key={pin.id} 
              className="rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition-shadow duration-300"
            >
              {/* ピン画像 */}
              <div className="relative">
                <img 
                  src={pin.imageUrl} 
                  alt={pin.title}
                  className="w-full h-48 object-cover"
                />
                <button 
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  onClick={() => !currentUser && setCurrentScene('login')}
                >
                  <Bookmark size={16} />
                </button>
              </div>
              
              {/* ピン情報 */}
              <div className="p-3">
                <h3 className="font-bold text-sm">{pin.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{pin.description}</p>
                
                {/* タグ */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {pin.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* クリエイター */}
                <div className="mt-3 flex items-center">
                  <img 
                    src={pin.creator.avatar} 
                    alt={pin.creator.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-xs font-medium">{pin.creator.name}</span>
                </div>
                
                {/* アクション */}
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <button 
                    className="flex items-center gap-1 hover:text-red-600"
                    onClick={() => !currentUser && setCurrentScene('login')}
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
        </div>
        
        {/* 新規ピン作成ボタン */}
        {currentUser && (
          <button className="fixed right-6 bottom-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700">
            <PlusCircle size={24} />
          </button>
        )}
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-red-600">ピンボード</div>
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Pinterest風アプリ
            </div>
          </div>
        </div>
      </footer>
    </>
  );

  // ログインページコンポーネント
  const LoginPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* ヘッダー */}
        <div className="flex items-center mb-6 justify-center">
          <h1 className="text-2xl font-bold text-center">ログイン</h1>
        </div>

        {/* ロゴ */}
        <div className="text-center mb-6">
          <div className="inline-block text-red-600 font-bold text-3xl">
            ピンボード
          </div>
          <p className="text-gray-600 mt-2">
            アイデアを発見、保存、実現するための場所
          </p>
        </div>

        {/* エラーメッセージ */}
        {loginError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {loginError}
          </div>
        )}

        {/* フォーム */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              ログイン
            </button>
          </div>
          
          {/* ゲストとして閲覧ボタン */}
          <div>
            <button
              onClick={() => setCurrentScene('home')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ゲストとして閲覧
            </button>
          </div>
        </div>

        {/* 新規登録リンク */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は
            <button
              onClick={() => setCurrentScene('signup')}
              className="font-medium text-red-600 hover:text-red-500 ml-1"
            >
              新規登録
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // 新規登録ページコンポーネント
  const SignupPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => setCurrentScene('login')}
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-center flex-1">新規登録</h1>
        </div>

        {/* ロゴ */}
        <div className="text-center mb-6">
          <div className="inline-block text-red-600 font-bold text-3xl">
            ピンボード
          </div>
          <p className="text-gray-600 mt-2">
            新しいアイデアを見つけて保存しましょう
          </p>
        </div>

        {/* エラーメッセージ */}
        {signupError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {signupError}
          </div>
        )}

        {/* フォーム */}
        <div className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="ユーザー名"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              onClick={handleSignup}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              アカウント作成
            </button>
          </div>
        </div>

        {/* ログインリンク */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちですか？
            <button
              onClick={() => setCurrentScene('login')}
              className="font-medium text-red-600 hover:text-red-500 ml-1"
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // 現在のシーンに応じたコンポーネントをレンダリング
  const renderScene = () => {
    switch (currentScene) {
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {renderScene()}
    </div>
  );
};

export default PinterestApp;
