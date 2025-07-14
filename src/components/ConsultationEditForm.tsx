'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { consultationsApi } from '@/lib/api'
import { Consultation } from '@/types/database'

interface ConsultationEditFormProps {
  consultationId: string
}

const ConsultationEditForm: React.FC<ConsultationEditFormProps> = ({ consultationId }) => {
  const router = useRouter()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    consultation_date: '',
    consultation_route: [] as string[],
    attributes: [] as string[],
    name: '',
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
          setFormData({
            consultation_date: data.consultation_date,
            consultation_route: data.consultation_route || [],
            attributes: data.attributes || [],
            name: data.name || '',
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

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((item: string) => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitLoading(true)
      setError(null)
      
      const updateData = {
        consultation_date: formData.consultation_date,
        consultation_route: formData.consultation_route.length > 0 ? formData.consultation_route : undefined,
        attributes: formData.attributes.length > 0 ? formData.attributes : undefined,
        name: formData.name.trim() || undefined,
        consultation_content: formData.consultation_content.trim() || undefined,
        consultation_result: formData.consultation_result.trim() || undefined
      }
      
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
                value={formData.consultation_date}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_date: e.target.value }))}
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
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="匿名の場合は空欄"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              相談ルート
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['本人', '家族', 'ケアマネ', '支援センター（高齢者）', '支援センター（障害者）', '行政機関', 'その他'].map((route) => (
                <label key={route} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.consultation_route.includes(route)}
                    onChange={() => handleCheckboxChange('consultation_route', route)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">{route}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              属性
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['高齢', '障がい', '子育て', 'ひとり親', 'DV', '外国人', '生活困窮', '低所得者', 'LGBT', '生保'].map((attr) => (
                <label key={attr} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.attributes.includes(attr)}
                    onChange={() => handleCheckboxChange('attributes', attr)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">{attr}</span>
                </label>
              ))}
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
                value={formData.consultation_content}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_content: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                相談結果
              </label>
              <textarea
                value={formData.consultation_result}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_result: e.target.value }))}
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