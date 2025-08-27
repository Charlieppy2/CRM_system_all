'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useScrollOptimization } from '@/hooks/useScrollOptimization';
import Link from 'next/link';

export default function Home() {
  const { user, isLoading } = useAuth();
  
  // 启用滚动性能优化
  useScrollOptimization();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 歡迎標題 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 px-4">
            歡迎使用 CRM 管理系統
          </h1>
          {!isLoading && user && (
            <div className="mb-4 px-4">
              <p className="text-base md:text-lg text-blue-600 font-medium mb-2">
                欢迎回来，{user.username}！
              </p>
              <p className="text-sm md:text-base text-gray-500">
                您的身份：{user.role === 'admin' ? '系统管理员' : user.role === 'trainer' ? '教练' : user.role === 'member' ? '会员' : '普通用户'}
              </p>
            </div>
          )}
        </div>

        {/* 快速功能導航 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Link 
            href="/attendance"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 hover:bg-blue-50 group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span className="text-blue-600 text-2xl group-hover:scale-110 transition-transform">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">出席管理</h3>
              <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">管理活動出席記錄</p>
              <div className="mt-3 text-blue-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                點擊進入 →
              </div>
            </div>
          </Link>

          <Link 
            href="/financial_management"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 hover:bg-green-50 group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span className="text-green-600 text-2xl group-hover:scale-110 transition-transform">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">財務管理</h3>
              <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors">管理財務記錄和報告</p>
              <div className="mt-3 text-green-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                點擊進入 →
              </div>
            </div>
          </Link>

          <Link 
            href="/member_management/profile"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 hover:bg-purple-50 group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <span className="text-purple-600 text-2xl group-hover:scale-110 transition-transform">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">會員管理</h3>
              <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors">查看和管理會員詳細資料</p>
              <div className="mt-3 text-purple-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                點擊進入 →
              </div>
            </div>
          </Link>
        </div>

        {/* 額外功能導航 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <Link 
            href="/trainer_management/profile"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 hover:bg-orange-50 group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <span className="text-orange-600 text-2xl group-hover:scale-110 transition-transform">🏋️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-orange-700 transition-colors">教練管理</h3>
              <p className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors">查看和管理教練詳細資料</p>
              <div className="mt-3 text-orange-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                點擊進入 →
              </div>
            </div>
          </Link>

          <Link 
            href="/account_management/admin"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 hover:bg-indigo-50 group cursor-pointer"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <span className="text-indigo-600 text-2xl group-hover:scale-110 transition-transform">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-700 transition-colors">帳號管理</h3>
              <p className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">管理系統用戶和權限設置</p>
              <div className="mt-3 text-indigo-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                點擊進入 →
              </div>
            </div>
          </Link>
        </div>

        {/* 系統狀態 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">系統狀態</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-blue-600">✓</div>
              <div className="text-sm text-gray-600">系統運行正常</div>
              <div className="text-xs text-blue-500 mt-1">實時監控</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-green-600">📱</div>
              <div className="text-sm text-gray-600">響應式設計</div>
              <div className="text-xs text-green-500 mt-1">多設備支持</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-purple-600">🔒</div>
              <div className="text-sm text-gray-600">安全認證</div>
              <div className="text-xs text-purple-500 mt-1">JWT 加密</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors cursor-pointer">
              <div className="text-2xl font-bold text-yellow-600">⚡</div>
              <div className="text-sm text-gray-600">快速響應</div>
              <div className="text-xs text-yellow-500 mt-1">優化性能</div>
            </div>
          </div>
        </div>

        {/* 快速操作提示 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 提示：點擊上方功能卡片可直接進入對應管理頁面
          </p>
        </div>
      </div>
    </div>
  );
}
