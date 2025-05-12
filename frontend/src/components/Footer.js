import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* サイト情報 */}
          <div>
            <h3 className="text-lg font-bold mb-4">ピンボード</h3>
            <p className="text-gray-600 text-sm mb-4">
              画像やアイデアを発見、保存、共有できるビジュアル発見プラットフォーム
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* サイトマップ */}
          <div>
            <h3 className="text-lg font-bold mb-4">サイトマップ</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-red-600">
                  ホーム
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-red-600">
                  探索する
                </Link>
              </li>
              <li>
                <Link to="/popular" className="text-gray-600 hover:text-red-600">
                  人気
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-red-600">
                  カテゴリー
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 企業情報 */}
          <div>
            <h3 className="text-lg font-bold mb-4">企業情報</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-red-600">
                  会社概要
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-red-600">
                  ブログ
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 hover:text-red-600">
                  採用情報
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-600 hover:text-red-600">
                  プレスリリース
                </Link>
              </li>
            </ul>
          </div>
          
          {/* サポート */}
          <div>
            <h3 className="text-lg font-bold mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-red-600">
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-red-600">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-red-600">
                  利用規約
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-red-600">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} ピンボード. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm flex items-center">
            Made with <Heart size={16} className="text-red-600 mx-1" /> in Japan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;