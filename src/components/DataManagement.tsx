// src/components/DataManagement.tsx
'use client'

import React, { useState } from 'react'
import { createUser, getAllUsersForExport } from '@/app/actions/users'
import {
  exportUsersToExcel,
  exportUsersToCSV,
  exportConsultationsToExcel,
  exportConsultationsToCSV,
  exportSupportPlansToExcel,
  exportSupportPlansToCSV,
  exportFormattedConsultationsToExcel,
  exportMonthlyReport,
} from '@/utils/export'
import { importUsersFromExcel, importUsersFromCSV, ImportResult } from '@/utils/import'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
// ▼▼▼ 【追加】Staffの型定義 ▼▼▼
type Staff = { id: string; name: string | null }

interface DataManagementProps {
  initialUsers: User[]
  initialConsultations: Consultation[]
  initialSupportPlans: SupportPlan[]
  // ▼▼▼ 【追加】staffListプロップ ▼▼▼
  staffList: Staff[]
}

const DataManagement: React.FC<DataManagementProps> = ({
  initialUsers,
  initialConsultations,
  initialSupportPlans,
  // ▼▼▼ 【追加】staffListプロップの受け取り ▼▼▼
  staffList
}) => {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const consultations = initialConsultations
  const supportPlans = initialSupportPlans

  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  
  const [monthlyReportMonth, setMonthlyReportMonth] = useState('')
  const [exportMonth, setExportMonth] = useState('')
  // ▼▼▼ 【追加】選択された担当者を管理するstate ▼▼▼
  const [selectedStaffId, setSelectedStaffId] = useState('')

  // ▼▼▼ 【修正】フィルタリング関数に担当者絞り込み機能を追加 ▼▼▼
  const getFilteredData = <T extends { [key: string]: any }>(
    data: T[],
    dateField: string,
    staffField?: string
  ): T[] => {
    let filteredData = data;

    // 月フィルター
    if (exportMonth) {
      filteredData = filteredData.filter(item => {
        const itemDateValue = item[dateField];
        if (!itemDateValue || typeof itemDateValue !== 'string') return false;
        const itemDate = new Date(itemDateValue)
        const filterDate = new Date(exportMonth + '-01')
        return itemDate.getFullYear() === filterDate.getFullYear() &&
          itemDate.getMonth() === filterDate.getMonth()
      });
    }

    // 【追加】スタッフフィルター
    if (staffField && selectedStaffId) {
      filteredData = filteredData.filter(item => item[staffField] === selectedStaffId);
    }

    return filteredData;
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

  // ▼▼▼ 【修正】整形済みExcelエクスポートのハンドラ ▼▼▼
  const handleExportFormattedConsultations = async () => {
    const filteredConsultations = getFilteredData(consultations, 'consultation_date', 'staff_id');
    if (filteredConsultations.length === 0) {
      alert("エクスポート対象のデータがありません。");
      return;
    }
    const timestamp = new Date().toISOString().slice(0, 10);
    const monthSuffix = exportMonth ? `_${exportMonth}` : '';
    const staffInfo = staffList.find(s => s.id === selectedStaffId);
    const staffSuffix = staffInfo ? `_${staffInfo.name}` : '';
    const filename = `整形済み相談記録${monthSuffix}${staffSuffix}_${timestamp}.xlsx`;

    setLoading(true);
    try {
      await exportFormattedConsultationsToExcel(filteredConsultations, filename);
    } catch (error) {
        console.error("Formatted export failed:", error);
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

  const handleExportMonthlyReport = async () => {
    if (!monthlyReportMonth) {
      alert("年月を選択してください");
      return;
    }

    setLoading(true);
    try {
      const [year, month] = monthlyReportMonth.split("-").map(Number);
      await exportMonthlyReport(year, month);
    } catch (error) {
      console.error("月次報告書のエクスポートに失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

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
      
      setImportResult(result);

      if (result.success && result.data) {
        let successCount = 0;
        let failureCount = 0;
        const failures: string[] = [];
        
        const usersResponse = await getAllUsersForExport();
        if (!usersResponse.success || !usersResponse.data) {
          throw new Error('インポート前の既存ユーザーチェックに失敗しました。');
        }
        const existingUIDs = new Set(usersResponse.data.map(user => user.uid));
        
        for (let i = 0; i < result.data.length; i++) {
          const userDataFromFile = result.data[i];
          try {
            if (!userDataFromFile.uid || !userDataFromFile.name) { throw new Error(`UIDまたは氏名が不足しています`) }
            if (existingUIDs.has(userDataFromFile.uid)) { throw new Error(`UID「${userDataFromFile.uid}」は既に存在します`) }
            
            const processedData: Omit<UserInsert, 'uid'> = {
              name: userDataFromFile.name, 
              birth_date: userDataFromFile.birth_date || null,
              gender: (userDataFromFile.gender as 'male' | 'female' | 'other') || null,
              property_address: userDataFromFile.property_address || null,
              property_name: userDataFromFile.property_name || null,
              room_number: userDataFromFile.room_number || null,
              intermediary: userDataFromFile.intermediary || null,
              deposit: userDataFromFile.deposit && !isNaN(Number(userDataFromFile.deposit)) ? Number(userDataFromFile.deposit) : null,
              key_money: userDataFromFile.key_money && !isNaN(Number(userDataFromFile.key_money)) ? Number(userDataFromFile.key_money) : null,
              rent: userDataFromFile.rent && !isNaN(Number(userDataFromFile.rent)) ? Number(userDataFromFile.rent) : null,
              fire_insurance: userDataFromFile.fire_insurance && !isNaN(Number(userDataFromFile.fire_insurance)) ? Number(userDataFromFile.fire_insurance) : null,
              common_fee: userDataFromFile.common_fee && !isNaN(Number(userDataFromFile.common_fee)) ? Number(userDataFromFile.common_fee) : null,
              landlord_rent: userDataFromFile.landlord_rent && !isNaN(Number(userDataFromFile.landlord_rent)) ? Number(userDataFromFile.landlord_rent) : null,
              landlord_common_fee: userDataFromFile.landlord_common_fee && !isNaN(Number(userDataFromFile.landlord_common_fee)) ? Number(userDataFromFile.landlord_common_fee) : null,
              rent_difference: userDataFromFile.rent_difference && !isNaN(Number(userDataFromFile.rent_difference)) ? Number(userDataFromFile.rent_difference) : null,
              move_in_date: userDataFromFile.move_in_date || null,
              next_renewal_date: userDataFromFile.next_renewal_date || null,
              renewal_count: userDataFromFile.renewal_count && !isNaN(Number(userDataFromFile.renewal_count)) ? Number(userDataFromFile.renewal_count) : null,
              resident_contact: userDataFromFile.resident_contact || null,
              line_available: Boolean(userDataFromFile.line_available),
              emergency_contact: userDataFromFile.emergency_contact || null,
              emergency_contact_name: userDataFromFile.emergency_contact_name || null,
              relationship: userDataFromFile.relationship || null,
              monitoring_system: userDataFromFile.monitoring_system || null,
              support_medical_institution: userDataFromFile.support_medical_institution || null,
              notes: userDataFromFile.notes || null,
              proxy_payment_eligible: Boolean(userDataFromFile.proxy_payment_eligible),
              welfare_recipient: Boolean(userDataFromFile.welfare_recipient),
              posthumous_affairs: Boolean(userDataFromFile.posthumous_affairs)
            };
            
            const createResult = await createUser(processedData, null);
            if (!createResult.success) {
              throw new Error(createResult.error || `データベースへの保存中にエラーが発生しました`);
            }
            
            existingUIDs.add(userDataFromFile.uid);
            successCount++;
          } catch (error) {
            failureCount++;
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            failures.push(`行 ${i + 2} (${userDataFromFile.name || 'Unknown'}): ${errorMessage}`);
          }
        }
        
        const finalUsersResponse = await getAllUsersForExport();
        if (finalUsersResponse.success && finalUsersResponse.data) {
          setUsers(finalUsersResponse.data);
        }
        
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">フィルターをかけてダウンロードする</h2>
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
          {/* ▼▼▼ 【修正】フィルターUI部分 ▼▼▼ */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-grow min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ダウンロードしたい対象月
              </label>
              <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* ▼▼▼ 【追加】担当者フィルタのUI ▼▼▼ */}
            <div className="flex-grow min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                担当スタッフ
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">すべての担当者</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>
            
            {(exportMonth || selectedStaffId) && (
              <div className="text-sm text-gray-600 self-center pb-2">
                <button onClick={() => { setExportMonth(''); setSelectedStaffId(''); }} className="text-blue-600 hover:text-blue-800">
                  フィルターをクリア
                </button>
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
            {/* ▼▼▼ 【修正】フィルターされた件数を表示 ▼▼▼ */}
            <div className="mt-2 text-xs text-gray-500">{getFilteredData(consultations, 'consultation_date', 'staff_id').length}件のデータ</div>
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">期間別相談実績レポート（月次報告書）</h2>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="report-month" className="block text-sm font-medium text-gray-700 mb-1">対象年月</label>
              <input 
                id="report-month"
                type="month" 
                value={monthlyReportMonth} 
                onChange={(e) => setMonthlyReportMonth(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full sm:w-auto">
              <button 
                onClick={handleExportMonthlyReport}
                disabled={loading || !monthlyReportMonth}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '生成中...' : '月次報告書ダウンロード'}
              </button>
            </div>
          </div>
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