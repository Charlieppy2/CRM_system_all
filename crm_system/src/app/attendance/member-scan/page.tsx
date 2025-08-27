'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface MemberQRData {
  memberId: string;
  memberName: string;
  memberCode: string;
  type: 'member';
  timestamp: number;
}

const MemberScanPage: React.FC = () => {
  const [scannedData, setScannedData] = useState<MemberQRData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // 檢查用戶是否已登入
    if (!user) {
      router.push('/login?redirect=/attendance/member-scan');
      return;
    }
  }, [user, router]);

  const handleQRCodeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;
    if (input.length > 0) {
      try {
        const data: MemberQRData = JSON.parse(input);
        if (data.type === 'member') {
          setScannedData(data);
          setMessage('✅ 會員QR Code掃描成功！');
          setMessageType('success');
        } else {
          setMessage('❌ 這不是會員QR Code');
          setMessageType('error');
          setScannedData(null);
        }
      } catch (error) {
        setMessage('❌ 無效的QR Code數據');
        setMessageType('error');
        setScannedData(null);
      }
    }
  };

  const handleManualInput = () => {
    // 手動輸入會員信息
    setScannedData({
      memberId: '',
      memberName: '',
      memberCode: '',
      type: 'member',
      timestamp: Date.now()
    });
    setMessage('請手動輸入會員信息');
    setMessageType('info');
  };

  const handleRecordAttendance = async () => {
    if (!scannedData || !user) return;

    setIsProcessing(true);
    setMessage('正在記錄會員出席...');
    setMessageType('info');

    try {
      // 記錄出席
      const attendanceResponse = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scannedData.memberName,
          contactInfo: scannedData.memberCode,
          location: '灣仔', // 默認地點，可以根據需要修改
          activity: '會員掃描打卡',
          status: '出席',
          memberId: scannedData.memberId
        }),
      });

      if (attendanceResponse.ok) {
        setMessage('✅ 會員出席記錄成功！');
        setMessageType('success');
        
        // 3秒後跳轉到出席記錄頁面
        setTimeout(() => {
          router.push('/attendance');
        }, 3000);
      } else {
        const errorData = await attendanceResponse.json();
        setMessage(`❌ 記錄失敗：${errorData.message || '未知錯誤'}`);
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
              📱 會員QR Code掃描
            </h1>
            <p className="text-gray-600">
              掃描會員QR Code快速記錄出席
            </p>
          </div>

          {/* 掃描區域 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                掃描會員QR Code
              </h3>
              <p className="text-sm text-gray-600">
                將手機對準會員QR Code進行掃描
              </p>
            </div>

            {/* QR Code輸入區域 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                掃描結果或手動輸入
              </label>
              <textarea
                value={scannedData ? JSON.stringify(scannedData, null, 2) : ''}
                onChange={handleQRCodeInput}
                placeholder="掃描QR Code後，數據會自動顯示在這裡..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                readOnly={!!scannedData}
              />
            </div>

            {/* 操作按鈕 */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleManualInput}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                手動輸入
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                重置
              </button>
            </div>
          </div>

          {/* 掃描結果顯示 */}
          {scannedData && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                會員信息
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    會員姓名
                  </label>
                  <input
                    type="text"
                    value={scannedData.memberName}
                    onChange={(e) => setScannedData({...scannedData, memberName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    會員編號
                  </label>
                  <input
                    type="text"
                    value={scannedData.memberCode}
                    onChange={(e) => setScannedData({...scannedData, memberCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="text-center space-y-3">
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
            <div className={`p-4 rounded-lg mb-6 ${
              messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              <p className="text-center font-medium">{message}</p>
            </div>
          )}

          {/* 返回按鈕 */}
          <div className="text-center">
            <button
              onClick={() => router.push('/attendance')}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              ← 返回出席管理
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberScanPage; 