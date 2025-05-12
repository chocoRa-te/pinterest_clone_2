import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, User, X, MoreHorizontal, Send } from 'lucide-react';
import { pinAPI, authAPI, boardAPI } from '../api';

const PinDetail = () => {
  const { pinId } = useParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [userBoards, setUserBoards] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  
  // ユーザー認証状態の確認
  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);
  
  // ピン詳細の取得
  useEffect(() => {
    const fetchPinDetail = async () => {
      try {
        setIsLoading(true);
        const response = await pinAPI.getPin(pinId);
        setPin(response.data);
        setError(null);
      } catch (err) {
        console.error('ピン詳細取得エラー:', err);
        setError('ピンの詳細情報を取得できませんでした');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPinDetail();
  }, [pinId]);
  
  // ユーザーのボード一覧取得
  useEffect(() => {
    if (isLoggedIn && showBoardModal) {
      const fetchUserBoards = async () => {
        try {
          const response = await boardAPI.getUserBoards(currentUser.id);
          setUserBoards(response.data);
        } catch (err) {
          console.error('ボード一覧取得エラー:', err);
        }
      };
      
      fetchUserBoards();
    }
  }, [isLoggedIn, showBoardModal, currentUser]);
  
  // いいねの切り替え
  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    try {
      await pinAPI.toggleLike(pinId);
      
      // いいね状態を更新
      setPin(prevPin => {
        const isLiked = prevPin.likes.includes(currentUser.id);
        return {
          ...prevPin,
          likes: isLiked
            ? prevPin.likes.filter(id => id !== currentUser.id)
            : [...prevPin.likes, currentUser.id]
        };
      });
    } catch (err) {
      console.error('いいね処理エラー:', err);
    }
  };
  
  // コメント送信
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (!comment.trim()) return;
    
    try {
      const response = await pinAPI.addComment(pinId, comment);
      
      // コメント一覧を更新
      setPin(prevPin => ({
        ...prevPin,
        comments: [...prevPin.comments, response.data]
      }));
      
      setComment('');
    } catch (err) {
      console.error('コメント追加エラー:', err);
    }
  };
  
  // コメント削除
  const handleDeleteComment = async (commentId) => {
    try {
      await pinAPI.deleteComment(pinId, commentId);
      
      // コメント一覧を更新
      setPin(prevPin => ({
        ...prevPin,
        comments: prevPin.comments.filter(comment => comment._id !== commentId)
      }));
    } catch (err) {
      console.error('コメント削除エラー:', err);
    }
  };
  
  // ボード保存処理
  const handleSaveToBoard = async (boardId) => {
    try {
      await pinAPI.togglePinInBoard(pinId, boardId, 'add');
      setShowBoardModal(false);
      
      // UI更新のフィードバック
      alert('ピンがボードに保存されました');
    } catch (err) {
      console.error('ボード保存エラー:', err);
    }
  };
  
  // ピン削除処理
  const handleDeletePin = async () => {
    if (window.confirm('このピンを削除してもよろしいですか？')) {
      try {
        await pinAPI.deletePin(pinId);
        navigate('/');
      } catch (err) {
        console.error('ピン削除エラー:', err);
      }
    }
  };
  
  // 読み込み中表示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }
  
  // ピンが見つからない場合
  if (!pin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">ピンが見つかりません</div>
      </div>
    );
  }
  
  // いいね済みかチェック
  const isLiked = isLoggedIn && pin.likes.includes(currentUser.id);
  
  // ピン所有者かチェック
  const isOwner = isLoggedIn && pin.user._id === currentUser.id;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* 左側: ピン画像 */}
          <div className="md:w-1/2">
            <img
              src={`/uploads/${pin.imageUrl}`}
              alt={pin.title}
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* 右側: ピン情報 */}
          <div className="md:w-1/2 p-6">
            {/* ヘッダー: アクションボタン */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button
                  className={`p-2 rounded-full ${isLiked ? 'text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={handleToggleLike}
                >
                  <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
                  <Share2 size={20} />
                </button>
              </div>
              
              <div className="relative">
                <button
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                  onClick={() => setShowBoardModal(true)}
                >
                  <Bookmark size={20} />
                  <span className="ml-1">保存</span>
                </button>
                
                {isOwner && (
                  <div className="relative ml-2 inline-block">
                    <button
                      className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                      onClick={() => setShowOptions(!showOptions)}
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    
                    {showOptions && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                        <button
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => navigate(`/pins/${pinId}/edit`)}
                        >
                          編集
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                          onClick={handleDeletePin}
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* ピンのソースURL */}
            {pin.sourceUrl && (
              <a
                href={pin.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:underline mb-4"
              >
                {pin.sourceUrl}
              </a>
            )}
            
            {/* ピンタイトルと説明 */}
            <h1 className="text-2xl font-bold mb-2">{pin.title}</h1>
            <p className="text-gray-700 mb-4">{pin.description}</p>
            
            {/* タグ */}
            {pin.tags && pin.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {pin.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* 作成者情報 */}
            <div className="flex items-center mb-6">
              {pin.user.profilePic ? (
                <img
                  src={`/uploads/${pin.user.profilePic}`}
                  alt={pin.user.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User size={20} />
                </div>
              )}
              <div>
                <div className="font-medium">{pin.user.username}</div>
                <div className="text-sm text-gray-500">
                  {new Date(pin.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* コメントセクション */}
            <div className="border-t pt-4">
              <h2 className="text-lg font-bold mb-4">
                コメント {pin.comments.length > 0 && `(${pin.comments.length})`}
              </h2>
              
              {/* コメント入力 */}
              <form onSubmit={handleSubmitComment} className="flex mb-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="コメントを追加..."
                  className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                  disabled={!isLoggedIn}
                />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-r-lg hover:bg-red-700 disabled:bg-gray-300"
                  disabled={!isLoggedIn || !comment.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
              
              {/* コメント一覧 */}
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {pin.comments.length > 0 ? (
                  pin.comments.map((comment) => (
                    <div key={comment._id} className="flex">
                      {comment.user.profilePic ? (
                        <img
                          src={`/uploads/${comment.user.profilePic}`}
                          alt={comment.user.username}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <User size={16} />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="font-medium text-sm">
                            {comment.user.username}
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                          {(isLoggedIn && (comment.user._id === currentUser.id || pin.user._id === currentUser.id)) && (
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => handleDeleteComment(comment._id)}
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">コメントはまだありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ボード選択モーダル */}
      {showBoardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">保存先のボードを選択</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowBoardModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            {!isLoggedIn ? (
              <div className="text-center py-4">
                <p className="mb-4">保存するにはログインが必要です</p>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  onClick={() => navigate('/login')}
                >
                  ログイン
                </button>
              </div>
            ) : userBoards.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {userBoards.map((board) => (
                  <button
                    key={board._id}
                    className="flex items-center w-full p-3 hover:bg-gray-100 rounded-lg mb-2"
                    onClick={() => handleSaveToBoard(board._id)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mr-3 overflow-hidden">
                      {board.coverImage ? (
                        <img
                          src={`/uploads/${board.coverImage}`}
                          alt={board.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bookmark size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium">{board.title}</h3>
                      <p className="text-sm text-gray-500">
                        {board.description || 'ボードの説明はありません'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">ボードがまだありません</p>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  onClick={() => navigate('/boards/create')}
                >
                  新しいボードを作成
                </button>
              </div>
            )}
            
            {isLoggedIn && userBoards.length > 0 && (
              <button
                className="mt-4 w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200"
                onClick={() => navigate('/boards/create')}
              >
                + 新しいボードを作成
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PinDetail;