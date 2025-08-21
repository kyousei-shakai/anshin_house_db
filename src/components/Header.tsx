'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Menu, Database, NotebookPen } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  // 環境変数から活動日報アプリのURLを取得。なければルートパスにフォールバック。
  const dailyLogUrl = process.env.NEXT_PUBLIC_DAILY_LOG_APP_URL || "/";

  // ナビゲーションリンクのデータを配列として定義（保守性向上のため）
  const navLinks = [
    { href: "/", label: "ホーム" },
    { href: "/consultations", label: "相談履歴" },
    { href: "/consultations/new", label: "新規相談" },
    { href: "/support-plans", label: "支援計画" },
    { href: "/users", label: "利用者名簿" },
    { href: "/data-management", label: "データ管理" },
  ];

  return (
    // レイアウトの一貫性のためにdivでラップし、下に余白を追加
    <div className="mb-8">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        {/* 全体のコンテナ。レスポンシブな余白と最大幅を設定 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Left Section: Logo & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onMenuClick} // 既存の重要な機能はそのまま維持
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="ナビゲーションメニューを開く"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-green-600 transition-colors">
                {/* テーマカラー(緑)をブランドロゴに適用 */}
                <Database className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                <h1 className="text-lg sm:text-xl">
                  居住支援管理マスター
                </h1>
              </Link>
            </div>
            
            {/* Right Section: Actions & Desktop Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* 活動日報へのリンクボタン (架け橋) */}
              <Button asChild variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                <a href={dailyLogUrl} target="_blank" rel="noopener noreferrer">
                  <NotebookPen className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">活動日報へ</span>
                </a>
              </Button>

              {/* 視覚的な区切り線 (スマホでは非表示) */}
              <Separator orientation="vertical" className="h-6 hidden sm:block" />

              {/* デスクトップ用ナビゲーション */}
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => (
                   <Button key={link.href} asChild variant="ghost" size="sm">
                    <Link href={link.href}>
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Header