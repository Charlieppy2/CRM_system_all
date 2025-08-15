import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';

// 獲取單個活動
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const activity = await Activity.findById(params.id);
    
    if (!activity) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: activity
    });
    
  } catch (error) {
    console.error('獲取活動失敗:', error);
    return NextResponse.json(
      { success: false, message: '獲取活動失敗' },
      { status: 500 }
    );
  }
}

// 更新活動
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { addParticipant, removeParticipant, ...updateData } = body;
    
    let updateOperation: any = { ...updateData };
    
    // 處理參與者添加
    if (addParticipant) {
      updateOperation = {
        ...updateOperation,
        $addToSet: { participants: addParticipant }
      };
    }
    
    // 處理參與者移除
    if (removeParticipant) {
      updateOperation = {
        ...updateOperation,
        $pull: { participants: removeParticipant }
      };
    }
    
    const activity = await Activity.findByIdAndUpdate(
      params.id,
      updateOperation,
      { new: true, runValidators: true }
    );
    
    if (!activity) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '活動更新成功',
      data: activity
    });
    
  } catch (error) {
    console.error('更新活動失敗:', error);
    return NextResponse.json(
      { success: false, message: '更新活動失敗' },
      { status: 500 }
    );
  }
}

// 刪除活動
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const activity = await Activity.findByIdAndDelete(params.id);
    
    if (!activity) {
      return NextResponse.json(
        { success: false, message: '活動不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '活動刪除成功'
    });
    
  } catch (error) {
    console.error('刪除活動失敗:', error);
    return NextResponse.json(
      { success: false, message: '刪除活動失敗' },
      { status: 500 }
    );
  }
} 