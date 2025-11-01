// src/components/Header.tsx (修正後・アクセシビリティ対応)

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet' // ★ SheetHeader, SheetTitleを追加
import { Menu, Database, NotebookPen } from 'lucide-react'

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const dailyLogUrl = process.env.NEXT_PUBLIC_DAILY_LOG_APP_URL || "/";
  const navLinks = [
    { href: "/", label: "ホーム" },
    { href: "/consultations", label: "相談履歴" },
    { href: "/support-plans", label: "支援計画" },
    { href: "/users", label: "利用者名簿" },
    { href: "/data-management", label: "データ管理" },
  ];

  return (
    <div className="mb-8">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center space-x-4">
              <div className="md:hidden">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="ナビゲーションメニューを開く">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    {/* ▼▼▼ ここからが修正箇所 ▼▼▼ */}
                    <SheetHeader>
                      <SheetTitle>メニュー</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <nav className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                           <Button key={link.href} asChild variant="ghost" className="justify-start">
                            <Link href={link.href} onClick={() => setIsSheetOpen(false)}>
                              {link.label}
                            </Link>
                          </Button>
                        ))}
                         <Separator className="my-4" />
                         <Button asChild variant="outline" className="justify-start">
                          <Link href="/consultations/new" onClick={() => setIsSheetOpen(false)}>
                            ＋ 新規相談を登録
                          </Link>
                        </Button>
                      </nav>
                    </div>
                    {/* ▲▲▲ ここまでが修正箇所 ▲▲▲ */}
                  </SheetContent>
                </Sheet>
              </div>
              
              <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-green-600 transition-colors">
                <Database className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                <h1 className="text-lg sm:text-xl">
                  居住支援管理マスター
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button asChild variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                <a href={dailyLogUrl} target="_blank" rel="noopener noreferrer">
                  <NotebookPen className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">活動日報へ</span>
                </a>
              </Button>

              <Separator orientation="vertical" className="h-6 hidden md:block" />

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