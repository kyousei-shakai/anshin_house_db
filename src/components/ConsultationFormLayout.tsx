'use client'

import React, { useState } from 'react'
import Header from './Header'

const sections = [
  { id: 'section-1', title: '1. 基本情報' },
  { id: 'section-2', title: '2. 身体状況・利用サービス' },
  { id: 'section-3', title: '3. 医療・収入' },
  { id: 'section-4', title: '4. 他市区町村への転居' },
  { id: 'section-5', title: '5. ADL/IADL' },
  { id: 'section-6', title: '6. 現在の住まい' },
  { id: 'section-7', title: '7. 相談内容等' },
];

interface ConsultationFormLayoutProps {
  children: React.ReactNode;
  pageHeader: React.ReactNode;
  activeSection?: string; // オプショナル：親からアクティブなセクションIDを受け取る（Server Componentでは不要）
}

const ConsultationFormLayout: React.FC<ConsultationFormLayoutProps> = ({ children, pageHeader, activeSection = '' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // IntersectionObserverのロジックはここから削除

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col lg:flex-row gap-x-12">
                <aside className="lg:w-64 mb-8 lg:mb-0">
                  <nav className="sticky top-24">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">入力セクション</h3>
                    <ul className="space-y-2">
                      {sections.map(section => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              const targetElement = document.getElementById(section.id);
                              if (targetElement) {
                                const headerOffset = 100;
                                const elementPosition = targetElement.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                window.scrollTo({
                                   top: offsetPosition,
                                   behavior: "smooth"
                                });
                              }
                            }}
                            className={`
                              flex items-center px-4 py-2 rounded-md text-base transition-colors duration-200
                              ${activeSection === section.id
                                ? 'bg-blue-600 text-white font-bold shadow-sm'
                                : 'text-gray-700 hover:bg-gray-200 font-medium'
                              }
                            `}
                          >
                            <span className={`w-2 h-2 rounded-full mr-3 ${activeSection === section.id ? 'bg-white' : 'bg-gray-400'}`}></span>
                            {section.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </aside>
                <main className="flex-1 min-w-0">
                  {pageHeader}
                  {children}
                </main>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultationFormLayout;