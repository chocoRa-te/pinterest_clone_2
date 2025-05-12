FROM node:16-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションファイルをコピー
COPY . .

# アップロードディレクトリの作成
RUN mkdir -p uploads

# ポートの公開
EXPOSE 5000

# アプリケーションの起動
CMD ["npm", "start"]