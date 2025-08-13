'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FinancialRecord {
  _id: string;
  recordType: 'income' | 'expense';
  memberName: string;
  item: string;
  totalAmount: number;
  recordDate: string;
}

interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
}

interface TopMember {
  memberName: string;
  totalAmount: number;
  recordCount: number;
}

interface PopularItem {
  item: string;
  totalAmount: number;
  recordCount: number;
}

export default function FinancialReport() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FinancialStats>({
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0
  });
  const [topMembers, setTopMembers] = useState<TopMember[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('本月');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredRecords, setFilteredRecords] = useState<FinancialRecord[]>([]);

  // 根據時間週期篩選記錄
  const filterRecordsByPeriod = (records: FinancialRecord[], period: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let startDate: Date;
    let endDate: Date;
    
    switch (period) {
      case '本月':
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
        break;
      case '上月':
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        break;
      case '本季度':
        const quarter = Math.floor(currentMonth / 3);
        startDate = new Date(currentYear, quarter * 3, 1);
        endDate = new Date(currentYear, (quarter + 1) * 3, 0, 23, 59, 59, 999);
        break;
      case '本年':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    }
    
    console.log(`篩選時間週期: ${period}`);
    console.log(`開始日期: ${startDate.toISOString()}`);
    console.log(`結束日期: ${endDate.toISOString()}`);
    
    return records.filter(record => {
      const recordDate = new Date(record.recordDate);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  // 獲取財務報告數據
  const fetchFinancialReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/financial-records');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const allRecords = data.data.records;
          
          // 根據選擇的時間週期篩選記錄
          const filtered = filterRecordsByPeriod(allRecords, selectedPeriod);
          setFilteredRecords(filtered);
          
          console.log(`總記錄數: ${allRecords.length}`);
          console.log(`篩選後記錄數: ${filtered.length}`);
          
          // 計算統計數據
          const totalIncome = filtered
            .filter((record: FinancialRecord) => record.recordType === 'income')
            .reduce((sum: number, record: FinancialRecord) => sum + record.totalAmount, 0);
          
          const totalExpense = filtered
            .filter((record: FinancialRecord) => record.recordType === 'expense')
            .reduce((sum: number, record: FinancialRecord) => sum + record.totalAmount, 0);
          
          setStats({
            totalIncome,
            totalExpense,
            netAmount: totalIncome - totalExpense
          });

          // 計算前5名成員
          const memberStats = filtered.reduce((acc: Record<string, { totalAmount: number; recordCount: number }>, record: FinancialRecord) => {
            if (!acc[record.memberName]) {
              acc[record.memberName] = { totalAmount: 0, recordCount: 0 };
            }
            acc[record.memberName].totalAmount += record.totalAmount;
            acc[record.memberName].recordCount += 1;
            return acc;
          }, {});

          const topMembersList = Object.entries(memberStats)
            .map(([memberName, data]) => ({
              memberName,
              totalAmount: (data as { totalAmount: number; recordCount: number }).totalAmount,
              recordCount: (data as { totalAmount: number; recordCount: number }).recordCount
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 5);

          setTopMembers(topMembersList);

          // 計算熱門項目
          const itemStats = filtered.reduce((acc: Record<string, { totalAmount: number; recordCount: number }>, record: FinancialRecord) => {
            if (!acc[record.item]) {
              acc[record.item] = { totalAmount: 0, recordCount: 0 };
            }
            acc[record.item].totalAmount += record.totalAmount;
            acc[record.item].recordCount += 1;
            return acc;
          }, {});

          const popularItemsList = Object.entries(itemStats)
            .map(([item, data]) => ({
              item,
              totalAmount: (data as { totalAmount: number; recordCount: number }).totalAmount,
              recordCount: (data as { totalAmount: number; recordCount: number }).recordCount
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 5);

          setPopularItems(popularItemsList);
        }
      }
    } catch (error) {
      console.error('獲取財務報告失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialReport();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">無權限訪問</h1>
          <p className="text-gray-600">您沒有權限訪問此頁面</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">財務報告</h1>
        <p className="text-gray-600">查看詳細的財務統計和分析</p>
        
        {/* 時間週期選擇器 */}
        <div className="mt-4 flex items-center space-x-4">
          <label htmlFor="periodSelect" className="text-sm font-medium text-gray-700">
            選擇時間週期:
          </label>
          <select
            id="periodSelect"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="本月">本月</option>
            <option value="上月">上月</option>
            <option value="本季度">本季度</option>
            <option value="本年">本年</option>
          </select>
          
          {/* 顯示篩選結果 */}
          <div className="text-sm text-gray-600">
            找到 {filteredRecords.length} 筆記錄
          </div>
        </div>
      </div>

      {/* 關鍵財務指標 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總收入</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總支出</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">淨額</p>
              <p className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.netAmount)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stats.netAmount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <svg className={`w-6 h-6 ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 月度趨勢 */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">月度趨勢</h3>
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500 text-sm">圖表功能開發中</p>
            </div>
          </div>
        </div>

        {/* 前5名成員 */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">前5名成員</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : topMembers.length === 0 ? (
            <div className="text-center h-48 flex items-center justify-center">
              <p className="text-gray-500">暫無數據</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topMembers.map((member, index) => (
                <div key={member.memberName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.memberName}</p>
                      <p className="text-sm text-gray-500">{member.recordCount} 筆記錄</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(member.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 熱門項目 */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">熱門項目</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : popularItems.length === 0 ? (
            <div className="text-center h-48 flex items-center justify-center">
              <p className="text-gray-500">暫無數據</p>
            </div>
          ) : (
            <div className="space-y-3">
              {popularItems.map((item, index) => (
                <div key={item.item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.item}</p>
                      <p className="text-sm text-gray-500">{item.recordCount} 筆記錄</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 