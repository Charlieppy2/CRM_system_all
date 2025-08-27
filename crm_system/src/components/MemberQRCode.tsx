'use client';

import React from 'react';
import QRCode from 'react-qr-code';

interface Member {
  _id: string;
  username: string;
  name: string;
  memberCode?: string;
}

interface MemberQRCodeProps {
  member: Member;
}

interface MemberQRData {
  memberId: string;
  memberName: string;
  memberCode: string;
  type: 'member';
  timestamp: number;
}

const MemberQRCode: React.FC<MemberQRCodeProps> = ({ member }) => {
  // 生成會員QR Code數據
  const generateMemberQR = () => {
    const memberData: MemberQRData = {
      memberId: member._id,
      memberName: member.name || member.username,
      memberCode: member.memberCode || member.username,
      type: 'member',
      timestamp: Date.now()
    };
    
    return JSON.stringify(memberData);
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
          link.download = `member-${member.name || member.username}-${member.memberCode || member.username}.png`;
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
            <title>會員 QR Code - ${member.name || member.username}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { margin: 20px 0; }
              .member-info { margin: 20px 0; }
              .print-button { display: none; }
              @media print { .print-button { display: none; } }
            </style>
          </head>
          <body>
            <h1>會員 QR Code</h1>
            <div class="member-info">
              <p><strong>姓名：</strong>${member.name || member.username}</p>
              <p><strong>編號：</strong>${member.memberCode || member.username}</p>
              <p><strong>生成時間：</strong>${new Date().toLocaleString('zh-TW')}</p>
            </div>
            <div class="qr-container">
              <div style="width: 256px; height: 256px; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <p style="color: #666;">QR Code 將在此處顯示</p>
              </div>
            </div>
            <p>掃描此 QR Code 記錄會員出席</p>
            <button class="print-button" onclick="window.print()">列印</button>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          {member.name || member.username} - 會員QR Code
        </h3>
      </div>

      <div className="text-center">
        <div className="bg-gray-50 p-4 rounded-lg inline-block">
          <QRCode
            value={generateMemberQR()}
            size={200}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-xs text-gray-500">
            姓名：{member.name || member.username}
          </p>
          <p className="text-xs text-gray-500">
            編號：{member.memberCode || member.username}
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
    </div>
  );
};

export default MemberQRCode; 