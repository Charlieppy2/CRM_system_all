'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface QRCodeData {
  activityId: string;
  activityName: string;
  date: string;
  type: 'attendance' | 'info';
  timestamp: number;
}

const QRScanPage: React.FC = () => {
  const [scannedData, setScannedData] = useState<QRCodeData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // 檢查用戶是否已登入
    if (!user) {
      router.push('/login?redirect=/attendance/qr-scan');
      return;
    }
  }, [user, router]);

  const handleQRCodeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    if (input.length > 0) {
      try {
        const data: QRCodeData = JSON.parse(input);
        setScannedData(data);
        setMessage('QR Code 解析成功！');
        setMessageType('success');
      } catch (error) {
        setMessage('無效的 QR Code 數據');
        setMessageType('error');
        setScannedData(null);
      }
    }
  };

  const handleManualInput = () => {
    // 手動輸入活動信息
    setScannedData({
      activityId: '',
      activityName: '',
      date: '',
      type: 'attendance',
      timestamp: Date.now()
    });
    setMessage('請手動輸入活動信息');
    setMessageType('info');
  };

  const handleRecordAttendance = async () => {
    if (!scannedData || !user) return;

    setIsProcessing(true);
    setMessage('正在打卡記錄出席...');
    setMessageType('info');

    try {
      // 首先記錄出席
      const attendanceResponse = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId: scannedData.activityId,
          memberId: user._id,
          memberName: user.name,
          attendanceDate: scannedData.date,
          attendanceTime: new Date().toLocaleTimeString('zh-TW'),
          status: 'present',
          notes: `QR Code 掃描打卡 - ${new Date().toLocaleString('zh-TW')}`
        }),
      });

      if (attendanceResponse.ok) {
        // 然後更新活動參與者列表
        const activityResponse = await fetch(`/api/activities/${scannedData.activityId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addParticipant: user.name
          }),
        });

        if (activityResponse.ok) {
          setMessage('✅ 打卡成功！已記錄出席並更新活動參與者');
          setMessageType('success');
          
          // 記錄掃描統計
          await fetch('/api/qr-scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              activityId: scannedData.activityId,
              activityName: scannedData.activityName,
              memberId: user._id,
              memberName: user.name,
              scanType: 'scan'
            }),
          });

          // 3秒後跳轉到出席記錄頁面
          setTimeout(() => {
            router.push('/attendance');
          }, 3000);
        } else {
          setMessage('⚠️ 出席記錄成功，但更新活動參與者失敗');
          setMessageType('error');
        }
      } else {
        const errorData = await attendanceResponse.json();
        setMessage(`❌ 打卡失敗：${errorData.message || '未知錯誤'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ 網絡錯誤，請稍後重試');
      setMessageType('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScannedData(null);
    setMessage('');
    setMessageType('info');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">正在載入...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📱 QR Code 活動打卡
            </h1>
            <p className="text-gray-600">
              掃描活動 QR Code 即可快速打卡記錄出席
            </p>
          </div>

          {/* 用戶信息 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">當前用戶</h2>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-600">角色：{user.role}</p>
              </div>
            </div>
          </div>

          {/* QR Code 輸入區域 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              掃描 QR Code
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code 數據
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="請將 QR Code 掃描結果貼入此處，或手動輸入活動信息..."
                  onChange={handleQRCodeInput}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleManualInput}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  手動輸入
                </button>
                <button
                  onClick={handleReset}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  重置
                </button>
              </div>
            </div>
          </div>

          {/* 掃描結果顯示 */}
          {scannedData && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                活動信息
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活動名稱
                  </label>
                  <input
                    type="text"
                    value={scannedData.activityName}
                    onChange={(e) => setScannedData({...scannedData, activityName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活動日期
                  </label>
                  <input
                    type="date"
                    value={scannedData.date}
                    onChange={(e) => setScannedData({...scannedData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleRecordAttendance}
                  disabled={isProcessing}
                  className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '記錄中...' : '記錄出席'}
                </button>
              </div>
            </div>
          )}

          {/* 消息顯示 */}
          {message && (
            <div className={`rounded-lg p-4 mb-6 ${
              messageType === 'success' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
              messageType === 'error' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
              'bg-blue-100 text-blue-800 border-2 border-blue-300'
            }`}>
              <div className="text-center">
                {messageType === 'success' && (
                  <div className="mb-2">
                    <span className="text-2xl">🎉</span>
                  </div>
                )}
                <p className="font-medium text-lg">{message}</p>
                {messageType === 'success' && (
                  <p className="text-sm mt-2 opacity-80">
                    正在跳轉到出席記錄頁面...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 使用說明 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              🎯 打卡流程
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>1. 📱 使用手機掃描活動 QR Code</p>
              <p>2. 📋 將掃描結果複製到上方輸入框</p>
              <p>3. ✅ 確認活動信息無誤</p>
              <p>4. 🎯 點擊「打卡記錄出席」按鈕</p>
              <p>5. 🎉 系統自動記錄出席並更新活動參與者</p>
              <p>6. 📊 可在出席記錄頁面查看打卡歷史</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanPage; 