// src/components/AnalyticsDashboard.tsx
'use client'

import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
// ▼▼▼▼▼▼▼▼▼▼ Chart をインポート ▼▼▼▼▼▼▼▼▼▼
import { Doughnut, Bar, Chart } from 'react-chartjs-2';
import { subMonths, format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { Consultation, User } from '@/types/custom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

interface AnalyticsDashboardProps {
  consultations: Consultation[];
  users: User[];
}

type Period = 'thisMonth' | 'lastMonth' | '3months' | '6months';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ consultations, users }) => {
  const [period, setPeriod] = useState<Period>('3months');

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (period) {
      case 'thisMonth':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'lastMonth':
        const lastMonthDate = subMonths(now, 1);
        startDate = startOfMonth(lastMonthDate);
        endDate = endOfMonth(lastMonthDate);
        break;
      case '3months':
        startDate = startOfDay(subMonths(now, 3));
        break;
      case '6months':
        startDate = startOfDay(subMonths(now, 6));
        break;
      default:
        startDate = startOfDay(subMonths(now, 3));
    }
    
    const filteredConsultations = consultations.filter(c => {
      if (!c.consultation_date) return false;
      const cDate = new Date(c.consultation_date);
      return cDate >= startDate && cDate <= endDate;
    });

    const filteredUsers = users.filter(u => {
      if (!u.created_at) return false;
      const uDate = new Date(u.created_at);
      return uDate >= startDate && uDate <= endDate;
    });

    return { consultations: filteredConsultations, users: filteredUsers };
  }, [consultations, users, period]);

  const routeAnalysis = useMemo(() => {
    const getTopSubItems = (items: (string | null)[]) => {
      const counts: { [key: string]: number } = {};
      items.forEach(item => {
        if (item) {
          counts[item] = (counts[item] || 0) + 1;
        }
      });
      return Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));
    };

    const governmentConsultations = filteredData.consultations.filter(c => c.consultation_route_government);
    const otherConsultations = filteredData.consultations.filter(c => c.consultation_route_other);

    const data = {
      '本人': { count: filteredData.consultations.filter(c => c.consultation_route_self).length, color: '#4F46E5', subItems: [] },
      '家族': { count: filteredData.consultations.filter(c => c.consultation_route_family).length, color: '#7C3AED', subItems: [] },
      'ケアマネ': { count: filteredData.consultations.filter(c => c.consultation_route_care_manager).length, color: '#EC4899', subItems: [] },
      '支援センター(高齢者)': { count: filteredData.consultations.filter(c => c.consultation_route_elderly_center).length, color: '#F59E0B', subItems: [] },
      '支援センター(障害者)': { count: filteredData.consultations.filter(c => c.consultation_route_disability_center).length, color: '#10B981', subItems: [] },
      '行政機関': { count: governmentConsultations.length, color: '#3B82F6', subItems: getTopSubItems(governmentConsultations.map(c => c.consultation_route_government_other)) },
      'その他': { count: otherConsultations.length, color: '#6B7280', subItems: getTopSubItems(otherConsultations.map(c => c.consultation_route_other_text)) },
    };

    const chartData = {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data).map(d => d.count),
        backgroundColor: Object.values(data).map(d => d.color),
        hoverOffset: 4,
      }],
    };

    return { chartData, legendData: data };
  }, [filteredData.consultations]);

  const attributeChartData = useMemo(() => {
    const attributes = {
      '高齢': filteredData.consultations.filter(c => c.attribute_elderly).length,
      '障がい': filteredData.consultations.filter(c => c.attribute_disability).length,
      '生活困窮': filteredData.consultations.filter(c => c.attribute_poverty).length,
      'ひとり親': filteredData.consultations.filter(c => c.attribute_single_parent).length,
      '子育て': filteredData.consultations.filter(c => c.attribute_childcare).length,
      'DV': filteredData.consultations.filter(c => c.attribute_dv).length,
      '外国人': filteredData.consultations.filter(c => c.attribute_foreigner).length,
      '低所得者': filteredData.consultations.filter(c => c.attribute_low_income).length,
      'LGBT': filteredData.consultations.filter(c => c.attribute_lgbt).length,
      '生保': filteredData.consultations.filter(c => c.attribute_welfare).length,
    };
    return {
      labels: Object.keys(attributes),
      datasets: [{
        label: '相談件数',
        data: Object.values(attributes),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }],
    };
  }, [filteredData.consultations]);

  const monthlyChartData = useMemo(() => {
    const monthCount = period === 'thisMonth' || period === 'lastMonth' ? 1 : (period === '3months' ? 3 : 6);
    const labels = Array.from({ length: monthCount }, (_, i) => {
        const date = period === 'lastMonth' ? subMonths(new Date(), monthCount - i) : subMonths(new Date(), monthCount - 1 - i);
        return format(date, 'yyyy/MM');
    });

    const consultationCounts: { [key: string]: number } = {};
    const userCounts: { [key: string]: number } = {};

    labels.forEach(label => {
      consultationCounts[label] = 0;
      userCounts[label] = 0;
    });

    filteredData.consultations.forEach(c => {
      const month = format(new Date(c.consultation_date!), 'yyyy/MM');
      if (consultationCounts[month] !== undefined) consultationCounts[month]++;
    });

    filteredData.users.forEach(u => {
      const month = format(new Date(u.created_at!), 'yyyy/MM');
      if (userCounts[month] !== undefined) userCounts[month]++;
    });

    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: '相談件数',
          data: labels.map(l => consultationCounts[l]),
          backgroundColor: 'rgba(165, 180, 252, 0.5)',
          borderColor: 'rgba(165, 180, 252, 1)',
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: '新規利用者数',
          data: labels.map(l => userCounts[l]),
          borderColor: '#4F46E5',
          backgroundColor: '#4F46E5',
          tension: 0.1,
          yAxisID: 'y1',
        },
      ],
    };
  }, [filteredData, period]);
  
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">データ分析ダッシュボード</h2>
          <div>
            <label htmlFor="period-select" className="sr-only">表示期間</label>
            <select
                id="period-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            >
                <option value="thisMonth">今月</option>
                <option value="lastMonth">先月</option>
                <option value="3months">過去3ヶ月</option>
                <option value="6months">過去6ヶ月</option>
            </select>
          </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">相談ルート分析</h3>
          <div className="flex-grow flex items-center justify-center min-h-0" style={{ height: '150px' }}>
            <Doughnut 
              data={routeAnalysis.chartData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { 
                  legend: { 
                    display: false
                  } 
                } 
              }} 
            />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap justify-start gap-x-4 gap-y-2">
              {Object.entries(routeAnalysis.legendData).map(([label, { count, color, subItems }]) => (
                <div key={label} className="relative group">
                  <div className="flex items-center text-sm">
                    <span className="inline-block w-3 h-3 mr-2 shrink-0" style={{ backgroundColor: color }}></span>
                    <span className="text-gray-700">{label}</span>
                    <span className="font-semibold text-gray-600 ml-1">({count})</span>
                    {subItems.length > 0 && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  {subItems.length > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      <ul className="space-y-1">
                        {subItems.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="truncate pr-2">{item.name}</span>
                            <span>{item.count}件</span>
                          </li>
                        ))}
                      </ul>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-gray-800 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
           <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">相談者属性分析 (複数回答可)</h3>
           <div className="h-64">
             <Bar data={attributeChartData} options={{ maintainAspectRatio: false, indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }} />
           </div>
        </div>
        <div className="lg:col-span-5 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">月別推移</h3>
            <div className="h-80">
                {/* ▼▼▼▼▼▼▼▼▼▼ ここを <Bar> から <Chart> に変更 ▼▼▼▼▼▼▼▼▼▼ */}
                <Chart type='bar' data={monthlyChartData} options={{ maintainAspectRatio: false, responsive: true, scales: { y: { type: 'linear', display: true, position: 'left', title: { display: true, text: '相談件数' } }, y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '新規利用者数' } } } }} />
                {/* ▲▲▲▲▲▲▲▲▲▲ 変更ここまで ▲▲▲▲▲▲▲▲▲▲ */}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;