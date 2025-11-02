'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Database, NotebookPen, PlusCircle, FilePlus2 } from 'lucide-react'

// ★ 修正点: onMenuClickを受け取るためのPropsの型定義を復活させます
interface HeaderProps {
  onMenuClick?: () => void;
}

type NavLink = {
  href: string;
  label: string;
}

// ★ 修正点: propsとして onMenuClick を受け取るように修正します
const Header = ({ onMenuClick }: HeaderProps): JSX.Element => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  const dailyLogUrl = process.env.NEXT_PUBLIC_DAILY_LOG_APP_URL || "/";
  const navLinks: NavLink[] = [
    { href: "/", label: "ホーム" },
    { href: "/consultations", label: "相談履歴" },
    { href: "/support-plans", label: "支援計画" },
    { href: "/users", label: "利用者さま" },
    { href: "/data-management", label: "データ管理" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  }
  
  const ActionButtons = () => (
    <>
      <Button asChild style={{ backgroundColor: '#1D4ED8', color: 'white' }}>
        <Link href="/consultations/new">
          <PlusCircle className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">新規相談</span>
        </Link>
      </Button>
      <Button asChild style={{ backgroundColor: '#7E22CE', color: 'white' }}>
        <Link href="/support-plans/new">
          <FilePlus2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">支援計画作成</span>
        </Link>
      </Button>
    </>
  );

  return (
    <div className="mb-8">
      <header className="bg-slate-50 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center space-x-4">
              {/* ★ 修正点: モバイル用メニューの表示を、onMenuClickの有無で条件分岐させます */}
              <div className="md:hidden">
                {onMenuClick ? (
                  // onMenuClickが渡された場合（ConsultationFormLayoutなど）
                  <Button variant="ghost" size="icon" aria-label="サイドバーを開く" onClick={onMenuClick}>
                    <Menu className="w-6 h-6" />
                  </Button>
                ) : (
                  // onMenuClickが渡されない場合（通常のページ）
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="ナビゲーションメニューを開く">
                        <Menu className="w-6 h-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px]">
                      <SheetHeader>
                        <SheetTitle>メニュー</SheetTitle>
                      </SheetHeader>
                      <div className="py-4 flex flex-col h-full">
                        <nav className="flex flex-col space-y-2">
                          {navLinks.map((link) => (
                             <Button 
                                key={link.href} 
                                asChild 
                                variant={isActive(link.href) ? "secondary" : "ghost"}
                                className="justify-start text-base py-6"
                             >
                              <Link href={link.href} onClick={() => setIsSheetOpen(false)}>
                                {link.label}
                              </Link>
                            </Button>
                          ))}
                        </nav>
                        <Separator className="my-4" />
                        <div className="space-y-3 mt-auto">
                          <Button asChild style={{ backgroundColor: '#1D4ED8', color: 'white' }} className="w-full justify-center text-base py-6">
                              <Link href="/consultations/new" onClick={() => setIsSheetOpen(false)}>
                                  <PlusCircle className="mr-2 h-5 w-5" /> 新規相談を登録
                              </Link>
                          </Button>
                          <Button asChild style={{ backgroundColor: '#7E22CE', color: 'white' }} className="w-full justify-center text-base py-6">
                              <Link href="/support-plans/new" onClick={() => setIsSheetOpen(false)}>
                                  <FilePlus2 className="mr-2 h-5 w-5" /> 支援計画を作成
                              </Link>
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
              
              <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-green-600 transition-colors">
                <Database className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                <h1 className="text-lg sm:text-xl">
                  居住支援管理マスター
                </h1>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                  <Button 
                    key={link.href} 
                    asChild 
                    variant={isActive(link.href) ? "secondary" : "ghost"}
                    size="sm"
                  >
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <ActionButtons />
              </div>

              <Button asChild variant="outline" size="sm" className="border-gray-300">
                <a href={dailyLogUrl} target="_blank" rel="noopener noreferrer">
                  <NotebookPen className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">活動日報</span>
                </a>
              </Button>
            </div>

          </div>
        </div>
      </header>
    </div>
  )
}

export default Header