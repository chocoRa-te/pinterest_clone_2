# Pinterestクローン

Pinterest風のウェブアプリケーションです。ユーザーは画像をアップロードし、コレクション（ボード）に整理したり、他のユーザーのコンテンツを検索・保存することができます。

## 機能

- ユーザー認証（登録、ログイン、プロフィール編集）
- 画像のアップロード・閲覧
- ピンの作成と管理
- ボード（コレクション）の作成と管理
- いいね、コメント、保存機能
- タグ付けとカテゴリ別閲覧
- 検索機能

## 技術スタック

### バックエンド
- Node.js
- Express.js
- MongoDB（Mongoose）
- JWT認証
- Multer（ファイルアップロード）

### フロントエンド
- React
- React Router
- Axios
- TailwindCSS
- Lucide React（アイコン）

### インフラ
- Docker
- Docker Compose

## セットアップ

### 前提条件
- Docker と Docker Compose がインストールされていること
- Node.js 14以上がインストールされていること

### インストール手順

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/pinterest-clone.git
cd pinterest-clone
```

2. バックエンドの依存関係をインストール
```bash
cd backend
npm install
```

3. フロントエンドの依存関係をインストール
```bash
cd ../frontend
npm install
```

4. プロジェクトルートディレクトリで、Dockerコンテナを起動
```bash
docker-compose up -d
```

5. アプリケーションにアクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:5000

## プロジェクト構造

```
pinterest-clone/
├── backend/              # バックエンドAPI
│   ├── uploads/          # アップロードされたファイルの保存先
│   ├── package.json
│   ├── server.js         # メインサーバーファイル
│   └── Dockerfile
│
├── frontend/             # Reactフロントエンド
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reactコンポーネント
│   │   ├── pages/        # ページコンポーネント
│   │   ├── api.js        # APIクライアント
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml    # Dockerコンポーズ設定
└── README.md             # プロジェクト説明
```

## APIエンドポイント

### 認証
- `POST /api/users/register` - ユーザー登録
- `POST /api/users/login` - ログイン

### ユーザー
- `GET /api/users/:id` - ユーザー情報取得
- `PUT /api/users/profile` - プロフィール更新

### ボード
- `POST /api/boards` - ボード作成
- `GET /api/users/:userId/boards` - ユーザーのボード一覧取得
- `GET /api/boards/:id` - ボード詳細取得
- `PUT /api/boards/:id` - ボード更新
- `DELETE /api/boards/:id` - ボード削除

### ピン
- `POST /api/pins` - ピン作成
- `GET /api/pins` - ピン一覧取得
- `GET /api/boards/:boardId/pins` - ボードのピン一覧取得
- `GET /api/pins/:id` - ピン詳細取得
- `PUT /api/pins/:id` - ピン更新
- `DELETE /api/pins/:id` - ピン削除
- `POST /api/pins/:id/like` - いいね追加/削除
- `POST /api/pins/:id/comments` - コメント追加
- `DELETE /api/pins/:pinId/comments/:commentId` - コメント削除

## 開発

### バックエンド開発
```bash
cd backend
npm run dev
```

### フロントエンド開発
```bash
cd frontend
npm start
```

## ライセンス

MITライセンス

## 参考リソース

- [Express.js ドキュメント](https://expressjs.com/)
- [MongoDB ドキュメント](https://docs.mongodb.com/)
- [React ドキュメント](https://reactjs.org/docs/getting-started.html)
- [TailwindCSS ドキュメント](https://tailwindcss.com/docs)