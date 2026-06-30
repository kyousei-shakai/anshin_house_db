// src/components/Header.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  Home,
  MessageSquareText,
  FileHeart,
  Users,
  Settings,
  Database,
  BookOpen,
  Contact,
  ChevronDown
} from 'lucide-react'

// --- 定数・データの定義 ---
const MANUAL_URL = "https://script.google.com/macros/s/AKfycbw1folK-LY9MjwRwMgrzF7HI6n8duOnbLumj1h-0MpxkJZIEemgt8zzy5gLRFZNMs1J-A/exec";

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  activeColorClass: string; 
  iconColorClass: string;
  isExternal?: boolean;
}

// 1. メイン業務リンク（左側に表示）
const MAIN_LINKS: NavLink[] = [
  { href: "/", label: "ホーム", icon: Home, activeColorClass: "bg-sky-100 text-sky-800 ring-1 ring-sky-300", iconColorClass: "text-sky-600" },
  { href: "/consultations", label: "相談履歴", icon: MessageSquareText, activeColorClass: "bg-orange-100 text-orange-800 ring-1 ring-orange-300", iconColorClass: "text-orange-600" },
  { href: "/support-plans", label: "支援計画", icon: FileHeart, activeColorClass: "bg-rose-100 text-rose-800 ring-1 ring-rose-300", iconColorClass: "text-rose-600" },
  { href: "/users", label: "利用者名簿", icon: Users, activeColorClass: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300", iconColorClass: "text-emerald-600" },
];

// 2. 現場の生命線：データ管理（右側に独立表示）
const DATA_LINK: NavLink = { 
  href: "/data-management", label: "データ管理", icon: Database, activeColorClass: "bg-slate-200 text-slate-800 ring-1 ring-slate-400", iconColorClass: "text-slate-600" 
};

// 3. 管理設定サブリンク（ドロップダウン内に集約）
const SETTING_SUB_LINKS: NavLink[] = [
  { href: "/settings/staff", label: "スタッフ管理", icon: Contact, activeColorClass: "bg-blue-100 text-blue-800", iconColorClass: "text-blue-600" },
  { href: "/settings/categories", label: "支援カテゴリ", icon: Settings, activeColorClass: "bg-slate-100 text-slate-800", iconColorClass: "text-slate-600" },
];

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps): JSX.Element => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href.startsWith("http")) return false;
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  }

  // ドロップダウンの外側クリックで閉じる制御
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          
          {/* --- 左側：ロゴ & メインメニュー --- */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              {/* モバイルメニュー（ドロワー） */}
              <div className="xl:hidden">
                {onMenuClick ? (
                  <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-gray-700 h-9 w-9">
                    <Menu className="w-6 h-6" />
                  </Button>
                ) : (
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-700 h-9 w-9">
                        <Menu className="w-6 h-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px]">
                      <SheetHeader className="mb-4 text-left">
                        <SheetTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <Home className="h-5 w-5 text-orange-600" />
                          メニュー
                        </SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-1 overflow-y-auto h-full pb-20">
                        {/* モバイル：全リンクを論理的な区切りと共に縦に並べる */}
                        {MAIN_LINKS.map((link) => (
                          <Link key={link.label} href={link.href} onClick={() => setIsSheetOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive(link.href) ? link.activeColorClass : "text-gray-600 hover:bg-gray-100"}`}>
                            <link.icon className={`h-5 w-5 ${isActive(link.href) ? "" : link.iconColorClass}`} />
                            {link.label}
                          </Link>
                        ))}
                        <Separator className="my-2" />
                        <Link href={DATA_LINK.href} onClick={() => setIsSheetOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive(DATA_LINK.href) ? DATA_LINK.activeColorClass : "text-gray-600 hover:bg-gray-100"}`}>
                          <DATA_LINK.icon className={`h-5 w-5 ${isActive(DATA_LINK.href) ? "" : DATA_LINK.iconColorClass}`} />
                          {DATA_LINK.label}
                        </Link>
                        <Separator className="my-2" />
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">管理・設定</div>
                        {SETTING_SUB_LINKS.map((link) => (
                          <Link key={link.label} href={link.href} onClick={() => setIsSheetOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive(link.href) ? "bg-slate-100 text-slate-900" : "text-gray-600 hover:bg-gray-100"}`}>
                            <link.icon className={`h-5 w-5 ${isActive(link.href) ? "" : link.iconColorClass}`} />
                            {link.label}
                          </Link>
                        ))}
                        {/* 一時的にマニュアルを非表示
                        <Separator className="my-2" />
                        <Link href={MANUAL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-md">
                          <BookOpen className="h-5 w-5 text-indigo-600" />
                          <span>マニュアル</span>
                        </Link>
                        */}
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
              
              {/* ロゴ */}
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0">
                <div className="bg-orange-100 p-1.5 rounded-lg border border-orange-200">
                  <Home className="h-5 w-5 text-orange-600" />
                </div>
                <h1 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight leading-none whitespace-nowrap">居住支援管理</h1>
              </Link>
            </div>

            {/* デスクトップ：メインメニューリンク */}
            <nav className="hidden xl:flex items-center gap-1">
              {MAIN_LINKS.map((link) => (
                <Button key={link.label} asChild variant="ghost" className={`h-9 px-3 text-sm font-medium transition-all ${isActive(link.href) ? link.activeColorClass + " shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                  <Link href={link.href} className="flex items-center gap-2">
                    <link.icon className={`h-4 w-4 ${isActive(link.href) ? "" : link.iconColorClass}`} />
                    {link.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
          
          {/* --- 右側：データ管理、設定、マニュアル --- */}
          <div className="hidden xl:flex items-center gap-2">
            
            {/* ★ 改善：コントラストを強めた境界線（ここが「見える」ようになります） */}
            <div className="h-8 w-px bg-slate-300 mx-4" aria-hidden="true" />

            {/* 1. データ管理 */}
            <Button asChild variant="ghost" className={`h-9 px-3 text-sm font-medium transition-all ${isActive(DATA_LINK.href) ? DATA_LINK.activeColorClass + " shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
              <Link href={DATA_LINK.href} className="flex items-center gap-2">
                <DATA_LINK.icon className={`h-4 w-4 ${isActive(DATA_LINK.href) ? "" : DATA_LINK.iconColorClass}`} />
                {DATA_LINK.label}
              </Link>
            </Button>

            {/* 2. 管理設定 */}
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`h-9 px-3 text-sm font-medium gap-1.5 ${isDropdownOpen ? 'bg-slate-100' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>管理設定</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* ドロップダウンメニュー本体 */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                  {SETTING_SUB_LINKS.map((sub) => (
                    <Link 
                      key={sub.label} 
                      href={sub.href} 
                      onClick={() => setIsDropdownOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm ${isActive(sub.href) ? 'bg-slate-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <sub.icon className={`w-4 h-4 ${isActive(sub.href) ? "text-blue-600" : "text-gray-400"}`} />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 一時的に境界線とマニュアルボタンを非表示
            <div className="h-8 w-px bg-slate-300 mx-4" aria-hidden="true" />

            <Button asChild variant="ghost" className="h-9 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100">
              <Link href={MANUAL_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>マニュアル</span>
              </Link>
            </Button>
            */}
          </div>

          {/* モバイル版の右側余白調整 */}
          <div className="xl:hidden w-9"></div>

        </div>
      </div>
    </header>
  )
}

export default Header