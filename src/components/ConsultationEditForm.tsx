'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { consultationsApi } from '@/lib/api'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type Consultation = Database['public']['Tables']['consultations']['Row']
type ConsultationUpdate = Partial<Database['public']['Tables']['consultations']['Update']>

// 👇 3. フォームで扱うデータ用の型を定義 (チェックボックスの項目などをまとめる)
interface FormData {
  consultation_date: string
  name: string
  consultation_route_self: boolean
  consultation_route_family: boolean
  consultation_route_care_manager: boolean
  consultation_route_elderly_center: boolean
  consultation_route_disability_center: boolean
  consultation_route_government: boolean
  consultation_route_government_other: string
  consultation_route_other: boolean
  consultation_route_other_text: string
  attribute_elderly: boolean
  attribute_disability: boolean
  attribute_childcare: boolean
  attribute_single_parent: boolean
  attribute_dv: boolean
  attribute_foreigner: boolean
  attribute_poverty: boolean
  attribute_low_income: boolean
  attribute_lgbt: boolean
  attribute_welfare: boolean
  // 他にもフォームで編集する項目があればここに追加
  consultation_content: string
  consultation_result: string
}

interface ConsultationEditFormProps {
  consultationId: string
}

const ConsultationEditForm: React.FC<ConsultationEditFormProps> = ({ consultationId }) => {
  const router = useRouter()
  // consultation stateの型は変更なし
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 👇 4. formData の state を新しい FormData 型で初期化
  const [formData, setFormData] = useState<FormData>({
    consultation_date: '',
    name: '',
    consultation_route_self: false,
    consultation_route_family: false,
    consultation_route_care_manager: false,
    consultation_route_elderly_center: false,
    consultation_route_disability_center: false,
    consultation_route_government: false,
    consultation_route_government_other: '',
    consultation_route_other: false,
    consultation_route_other_text: '',
    attribute_elderly: false,
    attribute_disability: false,
    attribute_childcare: false,
    attribute_single_parent: false,
    attribute_dv: false,
    attribute_foreigner: false,
    attribute_poverty: false,
    attribute_low_income: false,
    attribute_lgbt: false,
    attribute_welfare: false,
    consultation_content: '',
    consultation_result: ''
  })

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await consultationsApi.getById(consultationId)
        if (data) {
          setConsultation(data)
          // 👇 5. DBからのフラットなデータをフォーム用の形式に変換してセット
          setFormData({
            consultation_date: data.consultation_date.split('T')[0], // YYYY-MM-DD形式に
            name: data.name || '',
            consultation_route_self: data.consultation_route_self || false,
            consultation_route_family: data.consultation_route_family || false,
            consultation_route_care_manager: data.consultation_route_care_manager || false,
            consultation_route_elderly_center: data.consultation_route_elderly_center || false,
            consultation_route_disability_center: data.consultation_route_disability_center || false,
            consultation_route_government: data.consultation_route_government || false,
            consultation_route_government_other: data.consultation_route_government_other || '',
            consultation_route_other: data.consultation_route_other || false,
            consultation_route_other_text: data.consultation_route_other_text || '',
            attribute_elderly: data.attribute_elderly || false,
            attribute_disability: data.attribute_disability || false,
            attribute_childcare: data.attribute_childcare || false,
            attribute_single_parent: data.attribute_single_parent || false,
            attribute_dv: data.attribute_dv || false,
            attribute_foreigner: data.attribute_foreigner || false,
            attribute_poverty: data.attribute_poverty || false,
            attribute_low_income: data.attribute_low_income || false,
            attribute_lgbt: data.attribute_lgbt || false,
            attribute_welfare: data.attribute_welfare || false,
            consultation_content: data.consultation_content || '',
            consultation_result: data.consultation_result || ''
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultation()
  }, [consultationId])

  // 👇 6. 入力ハンドラを汎用的に修正
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox' && 'checked' in e.target;

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitLoading(true)
      setError(null)
      
      // 👇 7. フォームのデータをDB保存用のフラットな形式に変換
      const updateData: ConsultationUpdate = { ...formData }
      
      await consultationsApi.update(consultationId, updateData)
      router.push(`/consultations/${consultationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !consultation) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-500 text-sm">
          相談が見つかりません
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">相談編集</h1>
        <p className="text-gray-600 text-sm md:text-base">
          相談内容を編集します。
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                相談日
              </label>
              <input
                type="date"
                name="consultation_date"
                value={formData.consultation_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                相談者名
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="匿名の場合は空欄"
              />
            </div>
          </div>
          
          {/* 👇 8. JSX部分を新しいformDataの構造に合わせて全面的に修正 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              相談ルート
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <label className="flex items-center"><input type="checkbox" name="consultation_route_self" checked={formData.consultation_route_self} onChange={handleChange} className="mr-2" /><span>本人</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_family" checked={formData.consultation_route_family} onChange={handleChange} className="mr-2" /><span>家族</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_care_manager" checked={formData.consultation_route_care_manager} onChange={handleChange} className="mr-2" /><span>ケアマネ</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_elderly_center" checked={formData.consultation_route_elderly_center} onChange={handleChange} className="mr-2" /><span>支援センター（高齢者）</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_disability_center" checked={formData.consultation_route_disability_center} onChange={handleChange} className="mr-2" /><span>支援センター（障害者）</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_government" checked={formData.consultation_route_government} onChange={handleChange} className="mr-2" /><span>行政機関</span></label>
              <label className="flex items-center"><input type="checkbox" name="consultation_route_other" checked={formData.consultation_route_other} onChange={handleChange} className="mr-2" /><span>その他</span></label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              属性
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <label className="flex items-center"><input type="checkbox" name="attribute_elderly" checked={formData.attribute_elderly} onChange={handleChange} className="mr-2" /><span>高齢</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_disability" checked={formData.attribute_disability} onChange={handleChange} className="mr-2" /><span>障がい</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_childcare" checked={formData.attribute_childcare} onChange={handleChange} className="mr-2" /><span>子育て</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_single_parent" checked={formData.attribute_single_parent} onChange={handleChange} className="mr-2" /><span>ひとり親</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_dv" checked={formData.attribute_dv} onChange={handleChange} className="mr-2" /><span>DV</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_foreigner" checked={formData.attribute_foreigner} onChange={handleChange} className="mr-2" /><span>外国人</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_poverty" checked={formData.attribute_poverty} onChange={handleChange} className="mr-2" /><span>生活困窮</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_low_income" checked={formData.attribute_low_income} onChange={handleChange} className="mr-2" /><span>低所得者</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_lgbt" checked={formData.attribute_lgbt} onChange={handleChange} className="mr-2" /><span>LGBT</span></label>
              <label className="flex items-center"><input type="checkbox" name="attribute_welfare" checked={formData.attribute_welfare} onChange={handleChange} className="mr-2" /><span>生保</span></label>
            </div>
          </div>
        </div>

        {/* 相談内容 */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">相談内容</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                相談内容（困りごと、何が大変でどうしたいか、等）
              </label>
              <textarea
                name="consultation_content"
                value={formData.consultation_content}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                相談結果
              </label>
              <textarea
                name="consultation_result"
                value={formData.consultation_result}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm md:text-base"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm md:text-base"
          >
            {submitLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ConsultationEditForm