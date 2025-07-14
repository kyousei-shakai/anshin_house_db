import Layout from '@/components/Layout'
import QuickUserAccess from '@/components/QuickUserAccess'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* スマホ用：利用者名簿クイックアクセス */}
        <div className="lg:hidden mb-6">
          <QuickUserAccess />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            居住支援管理システム
          </h1>
          <p className="text-gray-600">
            利用者情報、相談履歴、支援計画を統合管理するシステムです。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 利用者情報カード */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">利用者情報</h2>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                管理
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              利用者の基本情報、物件情報、家賃情報などを管理します。
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">登録利用者数:</span>
                <span className="font-medium">-- 人</span>
              </div>
            </div>
          </div>

          {/* 相談履歴カード */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">相談履歴</h2>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                記録
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              匿名相談から契約後の相談まで、全ての相談記録を管理します。
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">今月の相談件数:</span>
                <span className="font-medium">-- 件</span>
              </div>
            </div>
          </div>

          {/* 支援計画カード */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">支援計画</h2>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                計画
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              利用者の支援計画を作成し、更新履歴を管理します。
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">作成済み計画数:</span>
                <span className="font-medium">-- 件</span>
              </div>
            </div>
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">最近の活動</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">システム開発中です</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
