'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ActivityQRCode from '@/components/ActivityQRCode';

interface Activity {
  _id: string;
  activityName: string;
  startTime: string;
  trainerName: string;
  location: string;
  isActive: boolean;
}

export default function QRBulkPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [showQRs, setShowQRs] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
    
    fetchActivities();
  }, [user, router]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/activities');
      const result = await response.json();
      
      if (result.success) {
        setActivities(result.data);
      } else {
        console.error('獲取活動列表失敗');
      }
    } catch (error) {
      console.error('網絡錯誤:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedActivities.length === activities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(activities.map(activity => activity._id));
    }
  };

  const handleSelectActivity = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleGenerateQRs = () => {
    if (selectedActivities.length === 0) {
      alert('請選擇至少一個活動');
      return;
    }
    setShowQRs(true);
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const selectedActivitiesData = activities.filter(activity => 
        selectedActivities.includes(activity._id)
      );
      
      printWindow.document.write(`
        <html>
          <head>
            <title>活動 QR Code 批量列印</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .qr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
              .qr-item { border: 1px solid #ccc; padding: 15px; text-align: center; page-break-inside: avoid; }
              .activity-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .activity-info { font-size: 12px; color: #666; margin-bottom: 15px; }
              .qr-placeholder { width: 200px; height: 200px; border: 2px dashed #ccc; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            <h1 class="no-print">活動 QR Code 批量列印</h1>
            <div class="qr-grid">
              ${selectedActivitiesData.map(activity => `
                <div class="qr-item">
                                   <div class="activity-title">${activity.activityName}</div>
                 <div class="activity-info">
                   日期：${new Date(activity.startTime).toLocaleDateString('zh-TW')}<br>
                   教練：${activity.trainerName}<br>
                   地點：${activity.location}
                 </div>
                  <div class="qr-placeholder">
                    QR Code 將在此處顯示
                  </div>
                  <p style="font-size: 12px; margin-top: 10px;">掃描此 QR Code 記錄出席</p>
                </div>
              `).join('')}
            </div>
            <div class="no-print" style="margin-top: 20px;">
              <button onclick="window.print()">列印</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              批量生成活動 QR Code
            </h1>
            <p className="text-gray-600">
              選擇多個活動，批量生成和列印 QR Code
            </p>
          </div>

          {/* 活動選擇區域 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                選擇活動 ({selectedActivities.length}/{activities.length})
              </h2>
              <div className="space-x-3">
                <button
                  onClick={handleSelectAll}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                >
                  {selectedActivities.length === activities.length ? '取消全選' : '全選'}
                </button>
                <button
                  onClick={handleGenerateQRs}
                  disabled={selectedActivities.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  生成 QR Code
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedActivities.includes(activity._id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectActivity(activity._id)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity._id)}
                        onChange={() => handleSelectActivity(activity._id)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{activity.activityName}</h3>
                        <p className="text-sm text-gray-600">日期：{new Date(activity.startTime).toLocaleDateString('zh-TW')}</p>
                        <p className="text-sm text-gray-600">教練：{activity.trainerName}</p>
                        <p className="text-sm text-gray-600">地點：{activity.location}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                          activity.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {activity.isActive ? '活躍' : '停用'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Code 顯示區域 */}
          {showQRs && selectedActivities.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  活動 QR Code ({selectedActivities.length} 個)
                </h2>
                <button
                  onClick={handlePrintAll}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  批量列印
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities
                  .filter(activity => selectedActivities.includes(activity._id))
                  .map((activity) => (
                    <ActivityQRCode key={activity._id} activity={activity as any} />
                  ))}
              </div>
            </div>
          )}

          {/* 使用說明 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              使用說明
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1. 從上方列表中選擇需要生成 QR Code 的活動</p>
              <p>2. 點擊「生成 QR Code」按鈕顯示所有選中活動的 QR Code</p>
              <p>3. 可以單獨下載或列印每個活動的 QR Code</p>
              <p>4. 使用「批量列印」功能可以一次性列印所有選中的 QR Code</p>
              <p>5. 列印時建議使用 A4 紙張，每個 QR Code 會自動分頁</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 