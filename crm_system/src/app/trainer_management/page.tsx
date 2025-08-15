'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Trainer {
  _id: string;
  username: string;
  email: string;
  role: string;
  memberName?: string;
  phone?: string;
  joinDate?: string;
  status: string;
  specialties?: string[];
  experience?: string;
}

export default function TrainerManagement() {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const result = await response.json();
        // API 返回的數據結構是 { success: true, data: accounts }
        if (result.success && Array.isArray(result.data)) {
          // 只顯示教練角色的用戶
          const trainerData = result.data.filter((account: any) => account.role === 'trainer');
          setTrainers(trainerData);
        } else {
          console.error('Invalid data structure:', result);
          setTrainers([]);
        }
      } else {
        console.error('Failed to fetch trainers:', response.status);
        setTrainers([]);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
      setTrainers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrainers = Array.isArray(trainers) ? trainers.filter(trainer => {
    const matchesSearch = trainer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trainer.memberName && trainer.memberName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         trainer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || trainer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'active': return '活躍';
      case 'inactive': return '非活躍';
      case 'pending': return '待審核';
      default: return '未知';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">請先登入</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">教練管理</h1>
          <p className="text-sm md:text-base text-gray-600">管理系統中的所有教練帳號和專業信息</p>
        </div>

        {/* 搜索和篩選 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索教練姓名、用戶名或郵箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
              />
              <svg
                className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
            >
              <option value="all">所有狀態</option>
              <option value="active">活躍</option>
              <option value="inactive">非活躍</option>
              <option value="pending">待審核</option>
            </select>
            
            <Link
              href="/account_management"
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base font-medium text-center"
            >
              + 新增教練
            </Link>
          </div>
        </div>

        {/* 統計信息 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">總教練數</p>
                <p className="text-xl md:text-2xl font-bold text-orange-600">{trainers.length}</p>
              </div>
              <div className="p-2 md:p-3 bg-orange-100 rounded-full">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活躍教練</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {trainers.filter(t => t.status === 'active').length}
                </p>
              </div>
              <div className="p-2 md:p-3 bg-green-100 rounded-full">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">非活躍</p>
                <p className="text-xl md:text-2xl font-bold text-red-600">
                  {trainers.filter(t => t.status === 'inactive').length}
                </p>
              </div>
              <div className="p-2 md:p-3 bg-red-100 rounded-full">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">待審核</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-600">
                  {trainers.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <div className="p-2 md:p-3 bg-yellow-100 rounded-full">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 教練列表 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              教練列表 ({filteredTrainers.length}人)
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">暫無教練數據</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用戶名
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      姓名
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      郵箱
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      專業領域
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrainers.map((trainer) => (
                    <tr key={trainer._id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                        {trainer.username}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                        {trainer.memberName || '-'}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trainer.email}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trainer.specialties && trainer.specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {trainer.specialties.slice(0, 2).map((specialty, index) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {specialty}
                              </span>
                            ))}
                            {trainer.specialties.length > 2 && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                +{trainer.specialties.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">未設置</span>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trainer.status)}`}>
                          {getStatusDisplayName(trainer.status)}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                        <Link
                          href={`/trainer_management/profile/${trainer._id}`}
                          className="text-orange-600 hover:text-orange-900 font-medium"
                        >
                          查看資料
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 快速操作提示 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            💡 提示：點擊「查看資料」可查看教練的詳細信息和課程安排
          </p>
        </div>
      </div>
    </div>
  );
} 