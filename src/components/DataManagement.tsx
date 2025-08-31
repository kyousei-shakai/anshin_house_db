// src/components/DataManagement.tsx

'use client'

import React, { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { usersApi, consultationsApi, supportPlansApi } from '@/lib/api'
import {
  exportUsersToExcel,
  exportUsersToCSV,
  exportConsultationsToExcel,
  exportConsultationsToCSV,
  exportSupportPlansToExcel,
  exportSupportPlansToCSV,
  exportConsultationReport,
  exportFormattedConsultationsToExcel
} from '@/utils/export'
import { importUsersFromExcel, importUsersFromCSV, ImportResult } from '@/utils/import'
import { Database } from '@/types/database'

type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

const DataManagement: React.FC = () => {
  const { users, refreshUsers } = useUsers()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [supportPlans, setSupportPlans] = useState<SupportPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [reportStartDate, setReportStartDate] = useState('')
  const [reportEndDate, setReportEndDate] = useState('')
  const [exportMonth, setExportMonth] = useState('')

  const fetchAllData = async () => {
    setLoading(true)
    try {
      console.log('データ取得を開始します...')
      const consultationsData = await consultationsApi.getAll()
      setConsultations(consultationsData)
      const supportPlansData = await supportPlansApi.getAll()
      setSupportPlans(supportPlansData)
      console.log('データ取得完了')
    } catch (error) {
      console.error('データ取得エラー:', error)
      if (error instanceof Error) {
        console.error('エラーメッセージ:', error.message)
      }
      setConsultations([])
      setSupportPlans([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAllData()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFilteredData = (data: any[], dateField: string) => {
    if (!exportMonth) return data
    return data.filter(item => {
      const itemDateValue = item[dateField];
      if (!itemDateValue) return false;
      const itemDate = new Date(itemDateValue)
      const filterDate = new Date(exportMonth + '-01')
      return itemDate.getFullYear() === filterDate.getFullYear() &&
        itemDate.getMonth() === filterDate.getMonth()
    })
  }

  const handleExportUsers = (format: 'excel' | 'csv') => {
    const filteredUsers = getFilteredData(users, 'created_at')
    const timestamp = new Date().toISOString().slice(0, 10)
    const monthSuffix = exportMonth ? `_${exportMonth}` : ''
    const filename = `users${monthSuffix}_${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`
    if (format === 'excel') {
      exportUsersToExcel(filteredUsers, filename)
    } else {
      exportUsersToCSV(filteredUsers, filename)
    }
  }

  const handleExportConsultations = (format: 'excel' | 'csv') => {
    const filteredConsultations = getFilteredData(consultations, 'consultation_date')
    const timestamp = new Date().toISOString().slice(0, 10)
    const monthSuffix = exportMonth ? `_${exportMonth}` : ''
    const filename = `consultations${monthSuffix}_${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`

    if (format === 'excel') {
      exportConsultationsToExcel(filteredConsultations, filename)
    } else {
      exportConsultationsToCSV(filteredConsultations, filename)
    }
  }

  const handleExportFormattedConsultations = async () => {
    const filteredConsultations = getFilteredData(consultations, 'consultation_date');
    const timestamp = new Date().toISOString().slice(0, 10);
    const monthSuffix = exportMonth ? `_${exportMonth}` : '';
    const filename = `整形済み相談記録${monthSuffix}_${timestamp}.xlsx`;

    setLoading(true);
    try {
      await exportFormattedConsultationsToExcel(filteredConsultations, filename);
    } catch (error) {
        console.error("Formatted export failed:", error);
        alert("整形済みExcelのエクスポートに失敗しました。");
    } finally {
        setLoading(false);
    }
  };

  const handleExportSupportPlans = (format: 'excel' | 'csv') => {
    const filteredSupportPlans = getFilteredData(supportPlans, 'creation_date')
    const timestamp = new Date().toISOString().slice(0, 10)
    const monthSuffix = exportMonth ? `_${exportMonth}` : ''
    const filename = `support_plans${monthSuffix}_${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`
    if (format === 'excel') {
      exportSupportPlansToExcel(filteredSupportPlans, filename)
    } else {
      exportSupportPlansToCSV(filteredSupportPlans, filename)
    }
  }

  const handleExportReport = () => {
    if (!reportStartDate || !reportEndDate) {
      alert('期間を選択してください')
      return
    }
    const filename = `consultation_report_${reportStartDate}_${reportEndDate}.xlsx`
    exportConsultationReport(consultations, reportStartDate, reportEndDate, filename)
  }

  const handleImport = async (file: File) => {
    setLoading(true)
    setImportResult(null)
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      let result: ImportResult;
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        result = await importUsersFromExcel(file)
      } else if (fileExtension === 'csv') {
        result = await importUsersFromCSV(file)
      } else {
        result = { success: false, errors: ['サポートされていないファイル形式です。Excel(.xlsx)またはCSV(.csv)ファイルを選択してください。'] }
      }
      setImportResult(result)
      if (result.success && result.data) {
        let successCount = 0;
        let failureCount = 0;
        const failures: string[] = [];
        const existingUsers = await usersApi.getAll();
        const existingUIDs = new Set(existingUsers.map(user => user.uid));
        for (let i = 0; i < result.data.length; i++) {
          const userData = result.data[i];
          try {
            if (!userData.uid || !userData.name) { throw new Error(`UIDまたは氏名が不足しています`) }
            if (existingUIDs.has(userData.uid)) { throw new Error(`UID「${userData.uid}」は既に存在します`) }
            const processedData: UserInsert = {
              uid: userData.uid, name: userData.name, birth_date: userData.birth_date || undefined,
              gender: userData.gender || undefined, property_address: userData.property_address || undefined,
              property_name: userData.property_name || undefined, room_number: userData.room_number || undefined,
              intermediary: userData.intermediary || undefined, deposit: userData.deposit && !isNaN(Number(userData.deposit)) ? Number(userData.deposit) : null,
              key_money: userData.key_money && !isNaN(Number(userData.key_money)) ? Number(userData.key_money) : null,
              rent: userData.rent && !isNaN(Number(userData.rent)) ? Number(userData.rent) : null,
              fire_insurance: userData.fire_insurance && !isNaN(Number(userData.fire_insurance)) ? Number(userData.fire_insurance) : null,
              common_fee: userData.common_fee && !isNaN(Number(userData.common_fee)) ? Number(userData.common_fee) : null,
              landlord_rent: userData.landlord_rent && !isNaN(Number(userData.landlord_rent)) ? Number(userData.landlord_rent) : null,
              landlord_common_fee: userData.landlord_common_fee && !isNaN(Number(userData.landlord_common_fee)) ? Number(userData.landlord_common_fee) : null,
              rent_difference: userData.rent_difference && !isNaN(Number(userData.rent_difference)) ? Number(userData.rent_difference) : null,
              move_in_date: userData.move_in_date || undefined, next_renewal_date: userData.next_renewal_date || undefined,
              renewal_count: userData.renewal_count && !isNaN(Number(userData.renewal_count)) ? Number(userData.renewal_count) : null,
              resident_contact: userData.resident_contact || undefined, line_available: Boolean(userData.line_available),
              emergency_contact: userData.emergency_contact || undefined, emergency_contact_name: userData.emergency_contact_name || undefined,
              relationship: userData.relationship || undefined, monitoring_system: userData.monitoring_system || undefined,
              support_medical_institution: userData.support_medical_institution || undefined, notes: userData.notes || undefined,
              proxy_payment_eligible: Boolean(userData.proxy_payment_eligible), welfare_recipient: Boolean(userData.welfare_recipient),
              posthumous_affairs: Boolean(userData.posthumous_affairs)
            };
            Object.keys(processedData).forEach(key => {
              const K = key as keyof UserInsert;
              if (processedData[K] === '') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (processedData as any)[K] = null;
              }
            });
            await usersApi.create(processedData);
            existingUIDs.add(userData.uid);
            successCount++;
          } catch (error) {
            failureCount++;
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            failures.push(`行 ${i + 2} (${userData.name || 'Unknown'}): ${errorMessage}`);
          }
        }
        refreshUsers();
        let message = `インポート完了:\n成功: ${successCount}件\n失敗: ${failureCount}件`;
        if (failures.length > 0) {
          message += '\n\n失敗した項目:\n' + failures.slice(0, 5).join('\n');
          if (failures.length > 5) { message += `\n... 他${failures.length - 5}件`; }
        }
        alert(message);
      }
    } catch (error) {
      setImportResult({ success: false, errors: [error instanceof Error ? error.message : '不明なエラーが発生しました'] })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">データエクスポート</h2>
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                エクスポート対象月（指定しない場合は全期間）
              </label>
              <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {exportMonth && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">フィルタ適用中:</span> {new Date(exportMonth + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                <button onClick={() => setExportMonth('')} className="ml-2 text-blue-600 hover:text-blue-800">クリア</button>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">利用者データ</h3>
            <p className="text-sm text-gray-600 mb-4">登録されている利用者の情報をエクスポートします。</p>
            <div className="space-y-2">
              <button onClick={() => handleExportUsers('excel')} className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">DB形式でダウンロード（Excel）</button>
            </div>
            <div className="mt-2 text-xs text-gray-500">{exportMonth ? getFilteredData(users, 'created_at').length : users.length}件のデータ</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">相談データ</h3>
            <p className="text-sm text-gray-600 mb-4">相談履歴のデータをエクスポートします。</p>
            <div className="space-y-2">
              <button onClick={handleExportFormattedConsultations} disabled={loading} className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:opacity-50">
                {loading ? '処理中...' : '整形済みExcelでダウンロード'}
              </button>
              <button onClick={() => handleExportConsultations('excel')} className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">DB形式でダウンロード（Excel）</button>
            </div>
            <div className="mt-2 text-xs text-gray-500">{exportMonth ? getFilteredData(consultations, 'consultation_date').length : consultations.length}件のデータ</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">支援計画データ</h3>
            <p className="text-sm text-gray-600 mb-4">支援計画のデータをエクスポートします。</p>
            <div className="space-y-2">
              <button onClick={() => handleExportSupportPlans('excel')} className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">DB形式でダウンロード（Excel）</button>
            </div>
            <div className="mt-2 text-xs text-gray-500">{exportMonth ? getFilteredData(supportPlans, 'creation_date').length : supportPlans.length}件のデータ</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">期間別相談実績レポート</h2>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
              <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
              <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <button onClick={handleExportReport} className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">レポート生成</button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">指定した期間の相談実績を統計情報付きでエクスポートします。</div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">利用者データインポート</h2>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">ファイル選択</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleImport(file) } }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="text-sm text-gray-600 mb-4">
            <p className="mb-2"><strong>対応ファイル形式:</strong> Excel(.xlsx, .xls), CSV(.csv)</p>
            <p className="mb-2"><strong>必須項目:</strong> UID, 氏名</p>
            <p><strong>必須ヘッダー:</strong> UID、氏名、生年月日、性別、物件住所、物件名、部屋番号、仲介、敷金、礼金、家賃、火災保険、共益費、大家家賃、大家共益費、家賃差額、入居日、次回更新年月日、更新回数、入居者連絡先、LINE、緊急連絡先、緊急連絡先氏名、続柄、見守りシステム、支援機関/医療機関、備考、代理納付該当、生活保護受給者、死後事務委任</p>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">処理中...</span>
            </div>
          )}
          {importResult && (
            <div className={`mt-4 p-4 rounded-md ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`text-sm ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {importResult.success ? (
                  <div>
                    <p className="font-medium">インポート成功</p>
                    <p>{importResult.data?.length}件のデータを正常に取り込みました。</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">インポート失敗</p>
                    <ul className="mt-2 list-disc list-inside">
                      {importResult.errors?.map((error, index) => (<li key={index}>{error}</li>))}
                    </ul>
                  </div>
                )}
                {importResult.warnings && importResult.warnings.length > 0 && (
                  <div className="mt-2 text-yellow-700">
                    <p className="font-medium">警告:</p>
                    <ul className="mt-1 list-disc list-inside">
                      {importResult.warnings.map((warning, index) => (<li key={index}>{warning}</li>))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DataManagement