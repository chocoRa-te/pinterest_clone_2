import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Lock, Unlock } from 'lucide-react';
import { boardAPI, authAPI } from '../api';

const BoardCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 認証状態の確認
  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
    } else {
      // 未ログインの場合はログインページにリダイレクト
      navigate('/login');
    }
  }, [navigate]);
  
  // 画像プレビュー処理
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // ファイルサイズチェック (5MB以下)
    if (file.size > 5 * 1024 * 1024) {
      setError('画像サイズは5MB以下にしてください');
      return;
    }
    
    // 画像タイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('JPEG, PNG, GIF形式の画像のみアップロードできます');
      return;
    }
    
    setCoverImage(file);
    
    // 画像プレビュー生成
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setError('');
  };
  
  // フォーム送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // バリデーション
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const boardData = {
        title,
        description,
        isPrivate: isPrivate.toString(),
        coverImage: coverImage || undefined
      };
      
      const response = await boardAPI.createBoard(boardData);
      
      // 成功したら詳細ページに遷移
      navigate(`/boards/${response.data._id}`);
    } catch (err) {
      console.error('ボード作成エラー:', err);
      setError('ボードの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">新しいボードを作成</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              ボード名 (必須)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="ボードの名前を入力"
              maxLength={100}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              説明
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="ボードの説明を入力"
              rows={3}
              maxLength={500}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              カバー画像
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center h-48 flex flex-col items-center justify-center ${
                imagePreview ? 'border-gray-300' : 'border-gray-400 hover:border-red-500'
              }`}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="プレビュー"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                    onClick={() => {
                      setCoverImage(null);
                      setImagePreview(null);
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">
                    クリックして画像をアップロード<br />
                    または画像をドラッグ＆ドロップ
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              最大ファイルサイズ: 5MB、対応形式: JPEG, PNG, GIF
            </p>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 flex items-center">
                {isPrivate ? (
                  <Lock size={16} className="text-gray-600 mr-1" />
                ) : (
                  <Unlock size={16} className="text-gray-600 mr-1" />
                )}
                <span className="text-gray-700">
                  {isPrivate ? '非公開ボード' : '公開ボード'}
                </span>
              </span>
            </label>
            <p className="mt-1 text-xs text-gray-500 ml-6">
              {isPrivate
                ? '非公開ボードはあなただけが見ることができます'
                : '公開ボードは誰でも見ることができます'}
            </p>
          </div>
          
          <div className="flex justify-end mt-8">
            <button
              type="button"
              className="px-4 py-2 mr-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              onClick={() => navigate(-1)}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? '作成中...' : 'ボードを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoardCreate;