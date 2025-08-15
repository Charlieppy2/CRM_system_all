'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Member {
  _id: string;
  username: string;
  memberName: string;
  phone: string;
  email: string;
  role: string;
  quota: number;
  isActive: boolean;
  locations: string[];
  createdAt: string;
  lastLogin?: string;
}

interface AttendanceRecord {
  _id: string;
  name: string;
  contactInfo: string;
  location: string;
  activity: string;
  status: string;
  createdAt: string;
}

export default function MemberDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [error, setError] = useState('');
  const [newQuota, setNewQuota] = useState('');
  const [isUpdatingQuota, setIsUpdatingQuota] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails();
    }
  }, [memberId]);

  // 獲取會員詳細信息
  const fetchMemberDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/accounts/${memberId}`);
      const result = await response.json();
      
      if (result.success) {
        setMember(result.data);
        setNewQuota(result.data.quota?.toString() || '0');
        fetchMemberAttendance(result.data);
      } else {
        setError('獲取會員信息失敗');
      }
    } catch (error) {
      setError('網絡錯誤，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取會員出席記錄
  const fetchMemberAttendance = async (memberData: Member) => {
    try {
      setIsLoadingRecords(true);
      const response = await fetch(`/api/attendance/by-member?name=${encodeURIComponent(memberData.memberName)}&contact=${encodeURIComponent(memberData.phone)}`);
      const result = await response.json();
      
      if (result.success) {
        setAttendanceRecords(result.data);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      setAttendanceRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // 更新配額
  const handleUpdateQuota = async () => {
    if (!member) return;
    
    const quotaValue = parseInt(newQuota);
    if (isNaN(quotaValue) || quotaValue < 0) {
      setError('請輸入有效的配額數值');
      return;
    }

    try {
      setIsUpdatingQuota(true);
      const response = await fetch(`/api/accounts/${memberId}/quota`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quota: quotaValue }),
      });

      const result = await response.json();
      if (result.success) {
        setMember(prev => prev ? { ...prev, quota: quotaValue } : null);
        setSuccessMessage('配額更新成功！');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message || '更新配額失敗');
      }
    } catch (error) {
      setError('網絡錯誤，請重試');
    } finally {
      setIsUpdatingQuota(false);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Hong_Kong'
      });
    } catch (error) {
      return dateString;
    }
  };

  // 獲取角色顯示名稱
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return '管理員';
      case 'trainer': return '教練';
      case 'member': return '會員';
      default: return '用戶';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/member_management"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            返回會員管理
          </Link>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">會員不存在</p>
          <Link
            href="/member_management"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            返回會員管理
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 頁面標題和返回按鈕 */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">會員資料</h1>
            <p className="text-sm md:text-base text-gray-600">查看和管理會員詳細信息</p>
          </div>
          <Link
            href="/member_management"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            ← 返回會員管理
          </Link>
        </div>

        {/* 成功/錯誤消息 */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 會員基本信息 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用戶名</label>
              <p className="text-gray-900">{member.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <p className="text-gray-900">{member.memberName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
              <p className="text-gray-900">{member.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">郵箱</label>
              <p className="text-gray-900">{member.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                member.role === 'admin' ? 'bg-red-100 text-red-800' :
                member.role === 'trainer' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getRoleDisplayName(member.role)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {member.isActive ? '活躍' : '非活躍'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">註冊時間</label>
              <p className="text-gray-900">{formatDate(member.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地區權限</label>
              <div className="flex flex-wrap gap-1">
                {member.locations && member.locations.length > 0 ? (
                  member.locations.map((location, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {location}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">無地區限制</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 配額管理 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">配額管理</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">當前配額</label>
              <p className="text-2xl font-bold text-blue-600">{member.quota || 0}</p>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">新配額</label>
              <input
                type="number"
                value={newQuota}
                onChange={(e) => setNewQuota(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="輸入新配額"
                min="0"
              />
            </div>
            <button
              onClick={handleUpdateQuota}
              disabled={isUpdatingQuota}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
            >
              {isUpdatingQuota ? '更新中...' : '更新配額'}
            </button>
          </div>
        </div>

        {/* 出席記錄 */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">出席記錄</h2>
          {isLoadingRecords ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">載入出席記錄中...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">暫無出席記錄</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      活動
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      地點
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時間
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.activity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.location}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status === 'present' ? '出席' : 
                           record.status === 'absent' ? '缺席' : 
                           record.status === 'late' ? '遲到' : record.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 