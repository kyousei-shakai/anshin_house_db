'use client'

import React from 'react' // 不要なフックを削除
import Link from 'next/link'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  // ▼▼▼▼▼▼▼▼▼▼ 検索関連のロジックをすべて削除 ▼▼▼▼▼▼▼▼▼▼
  // const { users } = useUsers()
  // const router = useRouter()
  // const [searchTerm, setSearchTerm] = useState('')
  // const [showSearchResults, setShowSearchResults] = useState(false)
  // const searchRef = useRef<HTMLDivElement>(null)
  // const filteredUsers = ...
  // const handleUserClick = ...
  // const useEffect = ...
  // ▲▲▲▲▲▲▲▲▲▲ ここまで削除 ▲▲▲▲▲▲▲▲▲▲


  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3 md:space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">
            居住支援管理
          </h1>
          
          <nav className="hidden md:flex space-x-2 lg:space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              ホーム
            </Link>
            <Link href="/consultations" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              相談履歴
            </Link>
            <Link href="/consultations/new" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              新規相談
            </Link>
            <Link href="/support-plans" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              支援計画
            </Link>
            <Link href="/data-management" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              データ管理
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          

          <Link 
            href="/users"
            className="hidden md:block text-gray-600 hover:text-gray-900 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
          >
            利用者名簿
          </Link>

        </div>
      </div>
    </header>
  )
}

export default Header