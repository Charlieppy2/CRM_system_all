import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

interface QRScanRecord {
  activityId: string;
  activityName: string;
  memberId: string;
  memberName: string;
  scanTime: Date;
  scanType: 'scan' | 'manual';
  ipAddress?: string;
  userAgent?: string;
}

// 記錄 QR Code 掃描
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { activityId, activityName, memberId, memberName, scanType = 'scan' } = body;
    
    // 獲取客戶端信息
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const scanRecord: QRScanRecord = {
      activityId,
      activityName,
      memberId,
      memberName,
      scanTime: new Date(),
      scanType,
      ipAddress,
      userAgent
    };
    
    // 這裡可以將掃描記錄保存到數據庫
    // 暫時只返回成功響應
    console.log('QR Code 掃描記錄:', scanRecord);
    
    return NextResponse.json({
      success: true,
      message: '掃描記錄成功',
      data: scanRecord
    });
    
  } catch (error) {
    console.error('QR Code 掃描記錄失敗:', error);
    return NextResponse.json(
      { success: false, message: '掃描記錄失敗' },
      { status: 500 }
    );
  }
}

// 獲取掃描統計
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    
    // 這裡可以從數據庫獲取掃描統計
    // 暫時返回模擬數據
    const mockStats = {
      totalScans: 15,
      todayScans: 3,
      uniqueMembers: 8,
      scanHistory: [
        { memberName: '張三', scanTime: new Date().toISOString(), scanType: 'scan' },
        { memberName: '李四', scanTime: new Date(Date.now() - 3600000).toISOString(), scanType: 'manual' },
        { memberName: '王五', scanTime: new Date(Date.now() - 7200000).toISOString(), scanType: 'scan' }
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: mockStats
    });
    
  } catch (error) {
    console.error('獲取掃描統計失敗:', error);
    return NextResponse.json(
      { success: false, message: '獲取統計失敗' },
      { status: 500 }
    );
  }
} 