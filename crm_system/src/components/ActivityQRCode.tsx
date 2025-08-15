'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Activity } from '@/models/Activity';

interface ActivityQRCodeProps {
  activity: Activity;
  onScan?: (memberId: string) => void;
}

interface QRCodeData {
  activityId: string;
  activityName: string;
  date: string;
  type: 'attendance' | 'info';
  timestamp: number;
}

const ActivityQRCode: React.FC<ActivityQRCodeProps> = ({ activity, onScan }) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [scanCount, setScanCount] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [scanStats, setScanStats] = useState<any>(null);

  useEffect(() => {
    // 生成 QR Code 數據
    const data: QRCodeData = {
      activityId: activity._id,
      activityName: activity.activityName,
      date: activity.startTime ? new Date(activity.startTime).toLocaleDateString('zh-TW') : '',
      type: 'attendance',
      timestamp: Date.now()
    };
    
    setQrCodeData(JSON.stringify(data));
    
    // 獲取掃描統計
    fetchScanStats();
  }, [activity]);

  // 生成打卡用的 QR Code 數據
  const generateAttendanceQR = () => {
    const attendanceData = {
      type: 'attendance',
      activityId: activity._id,
      activityName: activity.activityName,
      date: activity.startTime ? new Date(activity.startTime).toLocaleDateString('zh-TW') : '',
      trainerName: activity.trainerName,
      location: activity.location,
      timestamp: Date.now()
    };
    
    return JSON.stringify(attendanceData);
  };

  const fetchScanStats = async () => {
    try {
      const response = await fetch(`/api/qr-scan?activityId=${activity._id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setScanStats(result.data);
          setScanCount(result.data.totalScans);
        }
      }
    } catch (error) {
      console.error('獲取掃描統計失敗:', error);
    }
  };

  const handleDownloadQR = () => {
    // 創建 QR Code 圖片並下載
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 256;
      canvas.height = 256;
      
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 256, 256);
          ctx.drawImage(img, 0, 0, 256, 256);
          
          const link = document.createElement('a');
          const dateStr = activity.startTime ? new Date(activity.startTime).toLocaleDateString('zh-TW').replace(/\//g, '-') : 'unknown';
          link.download = `activity-${activity.activityName}-${dateStr}.png`;
          link.href = canvas.toDataURL();
          link.click();
        }
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>活動 QR Code - ${activity.name}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { margin: 20px 0; }
              .activity-info { margin: 20px 0; }
              .print-button { display: none; }
              @media print { .print-button { display: none; } }
            </style>
          </head>
          <body>
            <h1>${activity.name}</h1>
            <div class="activity-info">
              <p><strong>日期：</strong>${activity.date}</p>
              <p><strong>教練：</strong>${activity.trainerName || '未指定'}</p>
              <p><strong>地點：</strong>${activity.location || '未指定'}</p>
            </div>
            <div class="qr-container">
              <div style="width: 256px; height: 256px; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <p style="color: #666;">QR Code 將在此處顯示</p>
              </div>
            </div>
            <p>掃描此 QR Code 記錄出席</p>
            <button class="print-button" onclick="window.print()">列印</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {activity.name} - QR Code
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {isExpanded ? '收起' : '展開'}
        </button>
      </div>

      <div className="text-center">
        <div className="bg-gray-50 p-4 rounded-lg inline-block">
          <QRCode
            value={generateAttendanceQR()}
            size={200}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            掃描次數：<span className="font-semibold text-blue-600">{scanCount}</span>
          </p>
          {scanStats && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>今日掃描：{scanStats.todayScans} 次</p>
              <p>參與會員：{scanStats.uniqueMembers} 人</p>
            </div>
          )}
          <p className="text-xs text-gray-500">
            活動：{activity.activityName}
          </p>
          <p className="text-xs text-gray-500">
            日期：{activity.startTime ? new Date(activity.startTime).toLocaleDateString('zh-TW') : '未設定'}
          </p>
        </div>

        <div className="mt-4 space-x-2">
          <button
            onClick={handleDownloadQR}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            下載 QR Code
          </button>
          <button
            onClick={handlePrintQR}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
          >
            列印 QR Code
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">QR Code 信息</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>活動 ID：</strong>{activity._id}</p>
            <p><strong>活動名稱：</strong>{activity.activityName}</p>
            <p><strong>日期：</strong>{activity.startTime ? new Date(activity.startTime).toLocaleDateString('zh-TW') : '未設定'}</p>
            <p><strong>教練：</strong>{activity.trainerName || '未指定'}</p>
            <p><strong>地點：</strong>{activity.location || '未指定'}</p>
            <p><strong>生成時間：</strong>{new Date().toLocaleString('zh-TW')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityQRCode; 