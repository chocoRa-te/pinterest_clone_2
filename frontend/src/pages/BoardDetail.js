import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, PlusCircle, Lock, MoreHorizontal, Grid, Edit, Trash2 } from 'lucide-react';
import { boardAPI, pinAPI, authAPI } from '../api';

const BoardDetail = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  
  const [board, setBoard] = useState(null);
  const [pins, setPins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // 認証状態の確認
  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
    }
  }, []);
  
  // ボード詳細の取得
  useEffect(() => {
    const fetchBoardDetail = async () => {
      try {
        setIsLoading(true);
        const response = await boardAPI.getBoard(boardId);
        setBoard(response.data);
        setError(null);
      } catch (err) {
        console.error('ボード詳細取得エラー:', err);
        if (err.response && err.response.status === 403) {
          setError('このボードへのアクセス権限がありません');
        } else if (err.response && err.response.status === 404) {
          setError('ボードが見つかりません');
        } else {
          setError('ボード情報の取得に失敗しました');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBoardDetail();
  }, [boardId]);
  
  // ボードのピン一覧取得
  useEffect(() => {
    if (board) {
      const fetchBoardPins = async () => {
        try {
          setIsLoading(true);
          const response = await boardAPI.getBoardPins(boardId, currentPage);
          setPins(response.data.pins);
          setTotalPages(response.data.pages);
        } catch (err) {
          console.error('ボードのピン取得エラー:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchBoardPins();
    }
  }, [boardId, currentPage, board]);
  
  // ボード削除処理
  const handleDeleteBoard = async () => {
    if (window.confirm('このボードを削除してもよろしいですか？ボード内のピンは保持されます。')) {
      try {
        await boardAPI.deleteBoard(boardId);
        navigate('/profile');
      } catch (err) {
        console.error('ボード削除エラー:', err);
        alert('ボードの削除に失敗しました');
      }
    }
  };
  
  // ページ読み込み中の表示
  if (isLoading && !board) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          onClick={() => navigate(-1)}
        >
          戻る
        </button>
      </div>
    );
  }
  
  // ボードが見つからない場合
  if (!board) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">ボードが見つかりません</div>
      </div>
    );
  }
  
  // ボード所有者かどうかチェック
  const isOwner = isLoggedIn && currentUser && board.user._id === currentUser.id;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ボードヘッダー */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            {/* ユーザー情報 */}
            <div className="flex items-center mr-4">
              {board.user.profilePic ? (
                <img
                  src={`/uploads/${board.user.profilePic}`}
                  alt={board.user.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User size={20} />
                </div>
              )}
              <div>
                <div className="font-medium">{board.user.username}</div>
                <div className="text-sm text-gray-500">
                  {new Date(board.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {/* 非公開ボードアイコン */}
            {board.isPrivate && (
              <div className="flex items-center text-gray-600 ml-2">
                <Lock size={16} className="mr-1" />
                <span className="text-sm">非公開</span>
              </div>
            )}
          </div>
          
          {/* アクションボタン */}
          {isOwner && (
            <div className="relative">
              <button
                className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"
                onClick={() => setShowOptions(!showOptions)}
              >
                <MoreHorizontal size={20} />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => navigate(`/boards/${board._id}/edit`)}
                  >
                    <Edit size={16} className="mr-2" />
                    ボードを編集
                  </button>
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    onClick={handleDeleteBoard}
                  >
                    <Trash2 size={16} className="mr-2" />
                    ボードを削除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* ボード情報 */}
        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-2">{board.title}</h1>
          {board.description && (
            <p className="text-gray-700 mb-4">{board.description}</p>
          )}
          
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">
              <span className="font-medium">{pins.length}</span> ピン
            </span>
            
            {isOwner && (
              <button
                className="ml-auto flex items-center text-sm bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700"
                onClick={() => navigate('/pins/create', { state: { boardId: board._id } })}
              >
                <PlusCircle size={16} className="mr-1" />
                ピンを追加
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* ピン一覧 */}
      {pins.length > 0 ? (
        <div>
          {/* レイアウト切り替えボタン (将来の機能) */}
          <div className="flex justify-end mb-4">
            <button className="p-2 bg-gray-100 rounded-md hover:bg-gray-200">
              <Grid size={20} />
            </button>
          </div>
          
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
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">まだピンがありません</div>
          
          {isOwner ? (
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              onClick={() => navigate('/pins/create', { state: { boardId: board._id } })}
            >
              最初のピンを追加
            </button>
          ) : (
            <p className="text-gray-600">
              このボードの所有者がまだピンを追加していません
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BoardDetail;