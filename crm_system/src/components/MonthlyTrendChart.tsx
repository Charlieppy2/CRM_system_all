'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface MonthlyData {
  month: string;
  monthKey: string;
  income: number;
  expense: number;
  net: number;
  recordCount: number;
  incomeChange: number;
  expenseChange: number;
  netChange: number;
}

interface TrendSummary {
  totalIncome: number;
  totalExpense: number;
  totalNet: number;
  totalRecords: number;
  avgIncome: number;
  avgExpense: number;
  avgNet: number;
  maxIncomeMonth: {
    month: string;
    amount: number;
  };
  maxExpenseMonth: {
    month: string;
    amount: number;
  };
}

interface MonthlyTrendData {
  trendData: MonthlyData[];
  summary: TrendSummary;
}

type ChartType = 'line' | 'area' | 'bar';

export default function MonthlyTrendChart() {
  const [data, setData] = useState<MonthlyTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [showNet, setShowNet] = useState(true);
  const [period, setPeriod] = useState(12); // 顯示月份數

  // 獲取月度趨勢數據
  const fetchMonthlyTrend = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/financial-records/monthly-trend');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError('');
      } else {
        setError(result.message || '獲取數據失敗');
      }
    } catch (error) {
      setError('網路錯誤，請重試');
      console.error('獲取月度趨勢失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyTrend();
  }, []);

  // 格式化數字為貨幣
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // 格式化百分比
  const formatPercentage = (value: number) => {
    if (value === 0) return '0%';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // 自定義 Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 渲染圖表
  const renderChart = () => {
    if (!data) return null;

    const chartData = data.trendData.slice(-period);

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              fill="url(#incomeGradient)"
              name="收入"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              fill="url(#expenseGradient)"
              name="支出"
            />
            {showNet && (
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="淨額"
              />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="收入" />
            <Bar dataKey="expense" fill="#ef4444" name="支出" />
          </BarChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="收入"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="支出"
            />
            {showNet && (
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="淨額"
              />
            )}
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">載入月度趨勢...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchMonthlyTrend}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重試
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* 標題和控制項 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <h3 className="text-lg font-semibold text-gray-900">月度趨勢</h3>
          <button
            onClick={fetchMonthlyTrend}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="刷新數據"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* 圖表類型選擇 */}
          <div className="flex rounded-lg border border-gray-300">
            {(['line', 'area', 'bar'] as ChartType[]).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  chartType === type
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${type === 'line' ? 'rounded-l-md' : ''} ${type === 'bar' ? 'rounded-r-md' : ''}`}
              >
                {type === 'line' ? '線圖' : type === 'area' ? '面積圖' : '柱狀圖'}
              </button>
            ))}
          </div>

          {/* 顯示淨額切換 */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showNet}
              onChange={(e) => setShowNet(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">顯示淨額</span>
          </label>

          {/* 期間選擇 */}
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value={6}>近6個月</option>
            <option value={12}>近12個月</option>
          </select>
        </div>
      </div>

      {/* 摘要統計 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-600">總收入</div>
          <div className="text-lg font-semibold text-green-600">
            {formatCurrency(data.summary.totalIncome)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">總支出</div>
          <div className="text-lg font-semibold text-red-600">
            {formatCurrency(data.summary.totalExpense)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">淨額</div>
          <div className={`text-lg font-semibold ${
            data.summary.totalNet >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(data.summary.totalNet)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">平均收入</div>
          <div className="text-lg font-semibold text-blue-600">
            {formatCurrency(data.summary.avgIncome)}
          </div>
        </div>
      </div>

      {/* 圖表 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* 重點數據 */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-sm">
          <span className="text-gray-600">最高收入月份：</span>
          <span className="font-semibold text-green-600 ml-1">
            {data.summary.maxIncomeMonth.month} ({formatCurrency(data.summary.maxIncomeMonth.amount)})
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">最高支出月份：</span>
          <span className="font-semibold text-red-600 ml-1">
            {data.summary.maxExpenseMonth.month} ({formatCurrency(data.summary.maxExpenseMonth.amount)})
          </span>
        </div>
      </div>
    </div>
  );
}