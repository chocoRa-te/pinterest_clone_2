// src/api.js - バックエンドAPIとの通信を管理

import axios from 'axios';

// APIクライアントのインスタンス作成
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// リクエストインターセプター - 認証トークンの付与
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター - エラーハンドリング
api.interceptors.response.use(
  response => response,
  error => {
    // 401エラー（認証切れ）の場合はログアウト処理
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認証関連API
export const authAPI = {
  // ユーザー登録
  register: (userData) => {
    return api.post('/users/register', userData);
  },
  
  // ログイン
  login: (credentials) => {
    return api.post('/users/login', credentials);
  },
  
  // ログアウト（クライアント側の処理のみ）
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
  
  // 現在のユーザー情報取得
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// ユーザー関連API
export const userAPI = {
  // プロフィール取得
  getProfile: (userId) => {
    return api.get(`/users/${userId}`);
  },
  
  // プロフィール更新
  updateProfile: (userData) => {
    const formData = new FormData();
    
    Object.keys(userData).forEach(key => {
      if (key === 'profilePic' && userData[key] instanceof File) {
        formData.append(key, userData[key]);
      } else if (userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });
    
    return api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// ボード関連API
export const boardAPI = {
  // ボード作成
  createBoard: (boardData) => {
    const formData = new FormData();
    
    Object.keys(boardData).forEach(key => {
      if (key === 'coverImage' && boardData[key] instanceof File) {
        formData.append(key, boardData[key]);
      } else if (boardData[key] !== undefined) {
        formData.append(key, boardData[key]);
      }
    });
    
    return api.post('/boards', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // ユーザーのボード一覧取得
  getUserBoards: (userId) => {
    return api.get(`/users/${userId}/boards`);
  },
  
  // ボード詳細取得
  getBoard: (boardId) => {
    return api.get(`/boards/${boardId}`);
  },
  
  // ボード更新
  updateBoard: (boardId, boardData) => {
    const formData = new FormData();
    
    Object.keys(boardData).forEach(key => {
      if (key === 'coverImage' && boardData[key] instanceof File) {
        formData.append(key, boardData[key]);
      } else if (boardData[key] !== undefined) {
        formData.append(key, boardData[key]);
      }
    });
    
    return api.put(`/boards/${boardId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // ボード削除
  deleteBoard: (boardId) => {
    return api.delete(`/boards/${boardId}`);
  },
  
  // ボードのピン一覧取得
  getBoardPins: (boardId, page = 1, limit = 20) => {
    return api.get(`/boards/${boardId}/pins`, {
      params: { page, limit }
    });
  }
};

// ピン関連API
export const pinAPI = {
  // ピン作成
  createPin: (pinData) => {
    const formData = new FormData();
    
    Object.keys(pinData).forEach(key => {
      if (key === 'image' && pinData[key] instanceof File) {
        formData.append(key, pinData[key]);
      } else if (key === 'tags' && Array.isArray(pinData[key])) {
        formData.append(key, pinData[key].join(','));
      } else if (pinData[key] !== undefined) {
        formData.append(key, pinData[key]);
      }
    });
    
    return api.post('/pins', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // ピン一覧取得
  getPins: (params = {}) => {
    return api.get('/pins', { params });
  },
  
  // ピン詳細取得
  getPin: (pinId) => {
    return api.get(`/pins/${pinId}`);
  },
  
  // ピン更新
  updatePin: (pinId, pinData) => {
    return api.put(`/pins/${pinId}`, pinData);
  },
  
  // ピン削除
  deletePin: (pinId) => {
    return api.delete(`/pins/${pinId}`);
  },
  
  // いいね追加/削除
  toggleLike: (pinId) => {
    return api.post(`/pins/${pinId}/like`);
  },
  
  // コメント追加
  addComment: (pinId, text) => {
    return api.post(`/pins/${pinId}/comments`, { text });
  },
  
  // コメント削除
  deleteComment: (pinId, commentId) => {
    return api.delete(`/pins/${pinId}/comments/${commentId}`);
  },
  
  // ピンをボードに追加/削除
  togglePinInBoard: (pinId, boardId, action) => {
    return api.post(`/pins/${pinId}/boards/${boardId}`, { action });
  }
};