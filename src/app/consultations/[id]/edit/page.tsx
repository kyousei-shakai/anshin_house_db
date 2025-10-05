'use client'

// ★ useフックをreactからインポート
import { useState, useRef, useCallback, use } from 'react' 
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ConsultationFormLayout from '@/components/ConsultationFormLayout'
import ConsultationForm from '@/components/ConsultationForm'

// ★★★ propsの型定義を、エラーメッセージの事実に合わせてPromiseに戻す ★★★
interface ConsultationEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ConsultationEditPage({ params }: ConsultationEditPageProps) {
  // ★★★ React.use() を使ってPromiseを解決する ★★★
  const { id } = use(params)

  if (!id) {
    notFound()
  }

  // 以下、ナビゲーション制御のロジックは変更なし
  const [activeSection, setActiveSection] = useState<string>('section-1');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const formRefCallback = useCallback((formElement: HTMLFormElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (formElement === null) {
      return;
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        if (intersectingEntries.length > 0) {
          const topEntry = intersectingEntries.reduce((prev, current) => {
            if (prev.target.compareDocumentPosition(current.target) & Node.DOCUMENT_POSITION_FOLLOWING) {
              return prev;
            }
            return current;
          });
          setActiveSection(topEntry.target.id);
        }
      },
      {
        root: null,
        threshold: [0, 1],
      }
    );
    const sectionElements = Array.from(formElement.querySelectorAll('[id^="section-"]')) as HTMLElement[];
    sectionElements.forEach(el => {
      if(observerRef.current) {
        observerRef.current.observe(el);
      }
    });
  }, []);

  const pageHeader = (
    <div>
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                ホーム
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <Link href="/consultations" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  相談履歴
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <Link href={`/consultations/${id}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  相談詳細
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">編集</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">相談内容の編集</h1>
          <p className="text-gray-600">
            既存の相談内容を修正します。
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ConsultationFormLayout pageHeader={pageHeader} activeSection={activeSection}>
      <ConsultationForm ref={formRefCallback} editMode={true} consultationId={id} />
    </ConsultationFormLayout>
  )
}