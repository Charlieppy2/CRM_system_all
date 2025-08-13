const mongoose = require('mongoose');

// 數據庫連接URI
const MONGODB_URI = 'mongodb+srv://hung51607602:Qang86rejdSczeIB@cluster0.ugimcd0.mongodb.net/crm-system?retryWrites=true&w=majority&appName=Cluster0';

// 財務記錄Schema
const FinancialRecordSchema = new mongoose.Schema({
  recordType: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  memberName: String,
  item: String,
  details: String,
  location: String,
  unitPrice: Number,
  quantity: Number,
  totalAmount: Number,
  recordDate: Date,
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date
});

const FinancialRecord = mongoose.model('FinancialRecord', FinancialRecordSchema, 'financial_records');

async function fixFinancialRecordTimes() {
  try {
    console.log('正在連接數據庫...');
    await mongoose.connect(MONGODB_URI);
    console.log('數據庫連接成功');

    // 獲取所有財務記錄
    const records = await FinancialRecord.find({});
    console.log(`找到 ${records.length} 條財務記錄`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const record of records) {
      console.log(`\n處理記錄: ${record.memberName} - ${record.item}`);
      console.log(`原始時間: ${record.recordDate}`);
      
      // 檢查是否需要修復
      if (record.recordDate && record.recordDate.getUTCHours() === 0 && record.recordDate.getUTCMinutes() === 0) {
        // 這是一個只有日期的記錄，需要添加時間
        console.log('檢測到只有日期的記錄，正在修復...');
        
        // 創建香港時區的當前時間（基於記錄的日期）
        const originalDate = new Date(record.recordDate);
        const hkYear = originalDate.getUTCFullYear();
        const hkMonth = originalDate.getUTCMonth();
        const hkDay = originalDate.getUTCDate();
        
        // 設置為香港時間的上午9點（合理的業務時間）
        const fixedDate = new Date(Date.UTC(hkYear, hkMonth, hkDay, 1, 0, 0)); // UTC+8 = 香港時間9點
        
        record.recordDate = fixedDate;
        await record.save();
        
        console.log(`修復後時間: ${fixedDate.toISOString()}`);
        fixedCount++;
      } else if (record.recordDate && record.recordDate.getUTCHours() >= 22) {
        // 這是 UTC 時間的晚上，實際應該是香港時間的早上
        console.log('檢測到 UTC 晚上時間，正在轉換為香港時間...');
        
        const originalDate = new Date(record.recordDate);
        const hkYear = originalDate.getUTCFullYear();
        const hkMonth = originalDate.getUTCMonth();
        const hkDay = originalDate.getUTCDate();
        
        // 將 UTC 22:xx 轉換為香港時間 06:xx
        const utcHours = originalDate.getUTCHours();
        const utcMinutes = originalDate.getUTCMinutes();
        const hkHours = utcHours + 8; // UTC+8
        
        const fixedDate = new Date(Date.UTC(hkYear, hkMonth, hkDay, hkHours, utcMinutes, 0));
        
        record.recordDate = fixedDate;
        await record.save();
        
        console.log(`修復後時間: ${fixedDate.toISOString()}`);
        fixedCount++;
      } else {
        console.log('時間正常，跳過');
        skippedCount++;
      }
    }

    console.log(`\n修復完成！`);
    console.log(`修復記錄數: ${fixedCount}`);
    console.log(`跳過記錄數: ${skippedCount}`);
    console.log(`總記錄數: ${records.length}`);

  } catch (error) {
    console.error('修復財務記錄時間失敗:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('數據庫連接已關閉');
  }
}

// 運行修復腳本
fixFinancialRecordTimes().catch(console.error); 