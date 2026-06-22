// src/components/Header.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  PlusCircle, 
  FilePlus2,
  Home,
  MessageSquareText,
  FileHeart,
  Users,
  Settings,
  Database,
  BookOpen
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

const NAV_LINKS: NavLink[] = [
  { 
    href: "/", 
    label: "ホーム", 
    icon: Home,
    activeColorClass: "bg-sky-100 text-sky-800 ring-1 ring-sky-300",
    iconColorClass: "text-sky-600"
  },
  { 
    href: "/consultations", 
    label: "相談履歴", 
    icon: MessageSquareText,
    activeColorClass: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
    iconColorClass: "text-orange-600"
  },
  { 
    href: "/support-plans", 
    label: "支援計画", 
    icon: FileHeart,
    activeColorClass: "bg-rose-100 text-rose-800 ring-1 ring-rose-300",
    iconColorClass: "text-rose-600"
  },
  { 
    href: "/users", 
    label: "利用者名簿", 
    icon: Users,
    activeColorClass: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    iconColorClass: "text-emerald-600"
  },
  { 
    href: "/settings/categories", 
    label: "支援カテゴリ", 
    icon: Settings,
    activeColorClass: "bg-slate-200 text-slate-800 ring-1 ring-slate-400",
    iconColorClass: "text-slate-600"
  },
  { 
    href: "/data-management", 
    label: "データ管理", 
    icon: Database,
    activeColorClass: "bg-slate-200 text-slate-800 ring-1 ring-slate-400",
    iconColorClass: "text-slate-600"
  },
  { 
    href: MANUAL_URL, 
    label: "マニュアル", 
    icon: BookOpen,
    activeColorClass: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300",
    iconColorClass: "text-indigo-600",
    isExternal: true
  },
];

// ★ 修正：エラー解消のため onMenuClick プロパティを復活
interface HeaderProps {
  onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps): JSX.Element => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href.startsWith("http")) return false;
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  }
  
  const ActionButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "space-y-3" : "flex items-center gap-2"}>
      <Button asChild size={isMobile ? "default" : "sm"} className={`bg-blue-700 hover:bg-blue-800 text-white shadow-sm font-bold h-9 ${isMobile ? "w-full justify-start py-5 text-base" : ""}`}>
        <Link href="/consultations/new" onClick={() => isMobile && setIsSheetOpen(false)}>
          <PlusCircle className={`h-4 w-4 ${isMobile ? "mr-2 h-5 w-5" : "xl:mr-1.5"}`} />
          <span className={isMobile ? "" : "hidden xl:inline text-sm"}>新規相談</span>
        </Link>
      </Button>
      <Button asChild size={isMobile ? "default" : "sm"} className={`bg-purple-700 hover:bg-purple-800 text-white shadow-sm font-bold h-9 ${isMobile ? "w-full justify-start py-5 text-base" : ""}`}>
        <Link href="/support-plans/new" onClick={() => isMobile && setIsSheetOpen(false)}>
          <FilePlus2 className={`h-4 w-4 ${isMobile ? "mr-2 h-5 w-5" : "xl:mr-1.5"}`} />
          <span className={isMobile ? "" : "hidden xl:inline text-sm"}>支援計画</span>
        </Link>
      </Button>
    </div>
  );

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          
          <div className="flex items-center gap-3">
            {/* モバイルメニュー切り替えを xl に引き上げ */}
            <div className="xl:hidden">
              {/* ★ 修正：ConsultationFormLayout 等との互換性を確保 */}
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
                    <SheetHeader className="mb-4">
                      <SheetTitle className="text-left text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Home className="h-5 w-5 text-orange-600" />
                        メニュー
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col h-full">
                      <nav className="flex flex-col space-y-2">
                        {NAV_LINKS.map((link) => {
                           const active = isActive(link.href);
                           return (
                             <Link 
                                key={link.label}
                                href={link.href} 
                                target={link.isExternal ? "_blank" : undefined}
                                rel={link.isExternal ? "noopener noreferrer" : undefined}
                                onClick={() => setIsSheetOpen(false)}
                                className={`
                                  flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-all duration-200
                                  ${active 
                                    ? link.activeColorClass 
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                  }
                                `}
                             >
                               <link.icon className={`h-5 w-5 ${active ? "" : link.iconColorClass}`} />
                               {link.label}
                             </Link>
                           )
                        })}
                      </nav>
                      <Separator className="my-4" />
                      <ActionButtons isMobile={true} />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
            
            {/* ロゴエリア：flex-shrink-0 と whitespace-nowrap を維持 */}
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0">
              <div className="bg-orange-100 p-1.5 rounded-lg border border-orange-200">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-gray-800 tracking-tight leading-none whitespace-nowrap">
                居住支援管理
              </h1>
            </Link>
          </div>
          
          {/* デスクトップナビゲーション：xl 以上 */}
          <nav className="hidden xl:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Button 
                  key={link.label}
                  asChild 
                  variant="ghost"
                  className={`
                    h-9 px-3 text-sm font-medium transition-all duration-200
                    ${active 
                      ? link.activeColorClass + " shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                <Link 
                  href={link.href} 
                  target={link.isExternal ? "_blank" : undefined}
                  rel={link.isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2"
                >
                  <link.icon className={`h-4 w-4 ${active ? "" : link.iconColorClass}`} />
                  {link.label}
                </Link>
              </Button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-2">
              <ActionButtons />
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header