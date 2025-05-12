// server.js - Pinterest風アプリケーションのバックエンドAPI

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // 本番環境では必ず環境変数から取得すること

// ミドルウェア設定
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB接続設定
mongoose.connect('mongodb://localhost:27017/pinterest_clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB制限
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'));
    }
  }
});

// スキーマ定義
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: 'default-profile.png' },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  isPrivate: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const pinSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  sourceUrl: { type: String },
  tags: [{ type: String }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// モデル定義
const User = mongoose.model('User', userSchema);
const Board = mongoose.model('Board', boardSchema);
const Pin = mongoose.model('Pin', pinSchema);

// 認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: '認証が必要です' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'トークンが無効です' });
    req.user = user;
    next();
  });
};

// ユーザー関連のエンドポイント
// 登録
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 既存ユーザーチェック
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'このユーザー名またはメールアドレスは既に使用されています' });
    }
    
    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ユーザー作成
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    
    res.status(201).json({ message: 'ユーザー登録が完了しました' });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    res.status(500).json({ message: '登録処理中にエラーが発生しました' });
  }
});

// ログイン
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    // パスワード検証
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    // JWTトークン生成
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'ログイン処理中にエラーが発生しました' });
  }
});

// ユーザープロフィール取得
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    res.json(user);
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    res.status(500).json({ message: 'ユーザー情報取得中にエラーが発生しました' });
  }
});

// プロフィール更新
app.put('/api/users/profile', authenticateToken, upload.single('profilePic'), async (req, res) => {
  try {
    const { username, bio } = req.body;
    const updateData = { username, bio };
    
    if (req.file) {
      updateData.profilePic = req.file.filename;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    res.status(500).json({ message: 'プロフィール更新中にエラーが発生しました' });
  }
});

// ボード関連のエンドポイント
// ボード作成
app.post('/api/boards', authenticateToken, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, isPrivate } = req.body;
    
    const newBoard = new Board({
      title,
      description,
      isPrivate: isPrivate === 'true',
      user: req.user.id,
      coverImage: req.file ? req.file.filename : null
    });
    
    await newBoard.save();
    res.status(201).json(newBoard);
  } catch (error) {
    console.error('ボード作成エラー:', error);
    res.status(500).json({ message: 'ボード作成中にエラーが発生しました' });
  }
});

// ユーザーのボード一覧取得
app.get('/api/users/:userId/boards', async (req, res) => {
  try {
    const { userId } = req.params;
    let query = { user: userId };
    
    // 認証済みユーザーが自分以外のボードを見る場合は公開ボードのみ表示
    if (!req.user || req.user.id !== userId) {
      query.isPrivate = false;
    }
    
    const boards = await Board.find(query).sort({ createdAt: -1 });
    res.json(boards);
  } catch (error) {
    console.error('ボード取得エラー:', error);
    res.status(500).json({ message: 'ボード取得中にエラーが発生しました' });
  }
});

// ボード詳細取得
app.get('/api/boards/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('user', 'username profilePic');
    
    if (!board) {
      return res.status(404).json({ message: 'ボードが見つかりません' });
    }
    
    // 非公開ボードの場合、所有者のみアクセス可能
    if (board.isPrivate && (!req.user || req.user.id !== board.user._id.toString())) {
      return res.status(403).json({ message: 'このボードへのアクセス権限がありません' });
    }
    
    res.json(board);
  } catch (error) {
    console.error('ボード詳細取得エラー:', error);
    res.status(500).json({ message: 'ボード詳細取得中にエラーが発生しました' });
  }
});

// ボード更新
app.put('/api/boards/:id', authenticateToken, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, isPrivate } = req.body;
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'ボードが見つかりません' });
    }
    
    // ボード所有者のみ更新可能
    if (board.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'このボードを更新する権限がありません' });
    }
    
    const updateData = {
      title,
      description,
      isPrivate: isPrivate === 'true'
    };
    
    if (req.file) {
      updateData.coverImage = req.file.filename;
    }
    
    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedBoard);
  } catch (error) {
    console.error('ボード更新エラー:', error);
    res.status(500).json({ message: 'ボード更新中にエラーが発生しました' });
  }
});

// ボード削除
app.delete('/api/boards/:id', authenticateToken, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'ボードが見つかりません' });
    }
    
    // ボード所有者のみ削除可能
    if (board.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'このボードを削除する権限がありません' });
    }
    
    await Board.findByIdAndDelete(req.params.id);
    
    // ボードに関連するピンのボード参照を更新
    await Pin.updateMany(
      { boards: req.params.id },
      { $pull: { boards: req.params.id } }
    );
    
    res.json({ message: 'ボードが削除されました' });
  } catch (error) {
    console.error('ボード削除エラー:', error);
    res.status(500).json({ message: 'ボード削除中にエラーが発生しました' });
  }
});

// ピン関連のエンドポイント
// ピン作成
app.post('/api/pins', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, sourceUrl, tags, boardId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: '画像ファイルは必須です' });
    }
    
    const newPin = new Pin({
      title,
      description,
      imageUrl: req.file.filename,
      sourceUrl,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      user: req.user.id,
      boards: boardId ? [boardId] : []
    });
    
    await newPin.save();
    
    // ボードに追加する場合
    if (boardId) {
      await Board.findByIdAndUpdate(
        boardId,
        { $set: { coverImage: req.file.filename } },
        { new: true }
      );
    }
    
    res.status(201).json(newPin);
  } catch (error) {
    console.error('ピン作成エラー:', error);
    res.status(500).json({ message: 'ピン作成中にエラーが発生しました' });
  }
});

// ピン一覧取得
app.get('/api/pins', async (req, res) => {
  try {
    const { search, category, limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {};
    
    // 検索クエリがある場合
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // カテゴリがある場合
    if (category && category !== 'すべて') {
      query.tags = category;
    }
    
    const pins = await Pin.find(query)
      .populate('user', 'username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Pin.countDocuments(query);
    
    res.json({
      pins,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('ピン取得エラー:', error);
    res.status(500).json({ message: 'ピン取得中にエラーが発生しました' });
  }
});

// ボードのピン一覧取得
app.get('/api/boards/:boardId/pins', async (req, res) => {
  try {
    const { boardId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({ message: 'ボードが見つかりません' });
    }
    
    // 非公開ボードの場合、所有者のみアクセス可能
    if (board.isPrivate && (!req.user || req.user.id !== board.user.toString())) {
      return res.status(403).json({ message: 'このボードへのアクセス権限がありません' });
    }
    
    const pins = await Pin.find({ boards: boardId })
      .populate('user', 'username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Pin.countDocuments({ boards: boardId });
    
    res.json({
      pins,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('ボードのピン取得エラー:', error);
    res.status(500).json({ message: 'ボードのピン取得中にエラーが発生しました' });
  }
});

// ピン詳細取得
app.get('/api/pins/:id', async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id)
      .populate('user', 'username profilePic')
      .populate('boards', 'title')
      .populate('comments.user', 'username profilePic');
    
    if (!pin) {
      return res.status(404).json({ message: 'ピンが見つかりません' });
    }
    
    res.json(pin);
  } catch (error) {
    console.error('ピン詳細取得エラー:', error);
    res.status(500).json({ message: 'ピン詳細取得中にエラーが発生しました' });
  }
});

// ピン更新
app.put('/api/pins/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, sourceUrl, tags, boardIds } = req.body;
    const pin = await Pin.findById(req.params.id);
    
    if (!pin) {
      return res.status(404).json({ message: 'ピンが見つかりません' });
    }
    
    // ピン所有者のみ更新可能
    if (pin.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'このピンを更新する権限がありません' });
    }
    
    const updateData = {
      title,
      description,
      sourceUrl,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      boards: boardIds ? boardIds.split(',') : []
    };
    
    const updatedPin = await Pin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedPin);
  } catch (error) {
    console.error('ピン更新エラー:', error);
    res.status(500).json({ message: 'ピン更新中にエラーが発生しました' });
  }
});

// ピン削除
app.delete('/api/pins/:id', authenticateToken, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    
    if (!pin) {
      return res.status(404).json({ message: 'ピンが見つかりません' });
    }
    
    // ピン所有者のみ削除可能
    if (pin.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'このピンを削除する権限がありません' });
    }
    
    await Pin.findByIdAndDelete(req.params.id);
    res.json({ message: 'ピンが削除されました' });
  } catch (error) {
    console.error('ピン削除エラー:', error);
    res.status(500).json({ message: 'ピン削除中にエラーが発生しました' });
  }
});

// ピンへのいいね追加/削除
app.post('/api/pins/:id/like', authenticateToken, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    
    if (!pin) {
      return res.status(404).json({ message: 'ピンが見つかりません' });
    }
    
    // いいね済みかチェック
    const isLiked = pin.likes.includes(req.user.id);
    
    if (isLiked) {
      // いいね削除
      await Pin.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: req.user.id } }
      );
      res.json({ message: 'いいねを削除しました' });
    } else {
      // いいね追加
      await Pin.findByIdAndUpdate(
        req.params.id,
        { $push: { likes: req.user.id } }
      );
      res.json({ message: 'いいねしました' });
    }
  } catch (error) {
    console.error('いいね処理エラー:', error);
    res.status(500).json({ message: 'いいね処理中にエラーが発生しました' });
  }
});

// ピンにコメント追加
app.post('/api/pins/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'コメントを入力してください' });
    }
    
    const pin = await Pin.findById(req.params.id);
    
    if (!pin) {
      return res.status(404).json({ message: 'ピンが見つかりません' });
    }
    
    const comment = {
      text,
      user: req.user.id,
      createdAt: new Date()
    };
    
    pin.comments.push(comment);
    await pin.save();
    
    // 新しいコメントのユーザー情報を取得
    const updatedPin = await Pin.findById(req.params.id)
      .populate('comments.user', 'username profilePic');
    
    const newComment = updatedPin.comments[updatedPin.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('コメント追加エラー:', error);
    res.status(500).json({ message: 'コメント追加中にエラーが発生しました' });
  }
});

// コメント削除
app.delete('/api/pins/:pinId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { pinId, commentId } = req.params;
    const pin = await Pin.findById(pinId);
    
    if (!pin) {
      return res.status(404).json({ message: 'ピンが見つかりません' });
    }
    
    const comment = pin.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'コメントが見つかりません' });
    }
    
    // コメント作成者またはピン所有者のみ削除可能
    if (comment.user.toString() !== req.user.id && pin.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'このコメントを削除する権限がありません' });
    }
    
    comment.remove();
    await pin.save();
    
    res.json({ message: 'コメントが削除されました' });
  } catch (error) {
    console.error('コメント削除エラー:', error);
    res.status(500).json({ message: 'コメント削除中にエラーが発生しました' });
  }
});

// ピンのボード追加/削除
app.post('/api/pins/:pinId/boards/:boardId', authenticateToken, async (req, res) => {
  try {
    const { pinId, boardId } = req.params;
    const { action } = req.body; // 'add' または 'remove'
    
    const pin = await Pin.findById(pinId);
    
    if (!pin) {
      return res.status(404).json({ message: 'ピンが見つかりません' });
    }
    
    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({ message: 'ボードが見つかりません' });
    }
    
    // ボード所有者のみ追加/削除可能
    if (board.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'このボードを操作する権限がありません' });
    }
    
    if (action === 'add') {
      // ボードに追加
      if (!pin.boards.includes(boardId)) {
        await Pin.findByIdAndUpdate(
          pinId,
          { $push: { boards: boardId } }
        );
      }
      
      res.json({ message: 'ピンがボードに追加されました' });
    } else if (action === 'remove') {
      // ボードから削除
      await Pin.findByIdAndUpdate(
        pinId,
        { $pull: { boards: boardId } }
      );
      
      res.json({ message: 'ピンがボードから削除されました' });
    } else {
      res.status(400).json({ message: '無効なアクションです' });
    }
  } catch (error) {
    console.error('ボード操作エラー:', error);
    res.status(500).json({ message: 'ボード操作中にエラーが発生しました' });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});