import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FinancialRecord from '@/models/FinancialRecord';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 計算過去12個月的日期範圍
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11); // 過去12個月
    startDate.setDate(1); // 設為月初
    
    // 獲取財務記錄
    const records = await FinancialRecord.find({
      recordDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ recordDate: 1 });

    // 按月份分組數據
    const monthlyData = new Map();
    
    // 初始化過去12個月的數據
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' });
      
      monthlyData.set(monthKey, {
        month: monthName,
        monthKey,
        income: 0,
        expense: 0,
        net: 0,
        recordCount: 0
      });
    }

    // 聚合實際數據
    records.forEach(record => {
      const recordDate = new Date(record.recordDate);
      const monthKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData.has(monthKey)) {
        const monthData = monthlyData.get(monthKey);
        
        if (record.recordType === 'income') {
          monthData.income += record.totalAmount;
        } else {
          monthData.expense += record.totalAmount;
        }
        
        monthData.recordCount++;
        monthData.net = monthData.income - monthData.expense;
      }
    });

    // 轉換為數組並計算趨勢
    const trendData = Array.from(monthlyData.values());
    
    console.log(`月度趨勢數據處理結果：`);
    console.log(`- 找到 ${records.length} 筆財務記錄`);
    console.log(`- 時間範圍：${startDate.toISOString()} 到 ${endDate.toISOString()}`);
    console.log(`- 月度統計：`, trendData.map(item => `${item.month}: 收入${item.income}, 支出${item.expense}, 淨額${item.net}`));
    
    // 計算月度變化百分比
    const trendWithChanges = trendData.map((current, index) => {
      if (index === 0) {
        return {
          ...current,
          incomeChange: 0,
          expenseChange: 0,
          netChange: 0
        };
      }
      
      const previous = trendData[index - 1];
      
      const incomeChange = previous.income === 0 ? 0 : 
        ((current.income - previous.income) / previous.income * 100);
      const expenseChange = previous.expense === 0 ? 0 : 
        ((current.expense - previous.expense) / previous.expense * 100);
      const netChange = previous.net === 0 ? 0 : 
        ((current.net - previous.net) / Math.abs(previous.net) * 100);

      return {
        ...current,
        incomeChange: Math.round(incomeChange * 100) / 100,
        expenseChange: Math.round(expenseChange * 100) / 100,
        netChange: Math.round(netChange * 100) / 100
      };
    });

    // 計算總覽統計
    const totalIncome = trendWithChanges.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = trendWithChanges.reduce((sum, item) => sum + item.expense, 0);
    const totalNet = totalIncome - totalExpense;
    const totalRecords = trendWithChanges.reduce((sum, item) => sum + item.recordCount, 0);
    
    // 計算平均值
    const avgIncome = totalIncome / 12;
    const avgExpense = totalExpense / 12;
    const avgNet = totalNet / 12;

    // 找出最高和最低月份
    const maxIncomeMonth = trendWithChanges.reduce((max, current) => 
      current.income > max.income ? current : max);
    const maxExpenseMonth = trendWithChanges.reduce((max, current) => 
      current.expense > max.expense ? current : max);

    return NextResponse.json({
      success: true,
      data: {
        trendData: trendWithChanges,
        summary: {
          totalIncome,
          totalExpense,
          totalNet,
          totalRecords,
          avgIncome: Math.round(avgIncome * 100) / 100,
          avgExpense: Math.round(avgExpense * 100) / 100,
          avgNet: Math.round(avgNet * 100) / 100,
          maxIncomeMonth: {
            month: maxIncomeMonth.month,
            amount: maxIncomeMonth.income
          },
          maxExpenseMonth: {
            month: maxExpenseMonth.month,
            amount: maxExpenseMonth.expense
          }
        }
      }
    });

  } catch (error) {
    console.error('獲取月度趨勢數據失敗:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '獲取月度趨勢數據失敗',
        error: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
}