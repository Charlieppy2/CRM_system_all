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

async function fixFinancialRecordTimesV2() {
  try {
    console.log('正在連接數據庫...');
    await mongoose.connect(MONGODB_URI);
    console.log('數據庫連接成功');

    // 獲取所有財務記錄
    const records = await FinancialRecord.find({});
    console.log(`找到 ${records.length} 條財務記錄`);

    let fixedCount = 0;

    for (const record of records) {
      console.log(`\n處理記錄: ${record.memberName} - ${record.item}`);
      console.log(`原始時間: ${record.recordDate.toISOString()}`);
      
      // 獲取原始 UTC 時間的組件
      const utcYear = record.recordDate.getUTCFullYear();
      const utcMonth = record.recordDate.getUTCMonth();
      const utcDay = record.recordDate.getUTCDate();
      const utcHours = record.recordDate.getUTCHours();
      const utcMinutes = record.recordDate.getUTCMinutes();
      
      // 轉換為香港時間（UTC+8）
      let hkYear = utcYear;
      let hkMonth = utcMonth;
      let hkDay = utcDay;
      let hkHours = utcHours + 8; // UTC+8
      let hkMinutes = utcMinutes;
      
      // 處理跨日的情況
      if (hkHours >= 24) {
        hkHours -= 24;
        hkDay += 1;
        
        // 處理跨月的情況
        const daysInMonth = new Date(hkYear, hkMonth + 1, 0).getDate();
        if (hkDay > daysInMonth) {
          hkDay = 1;
          hkMonth += 1;
          
          // 處理跨年的情況
          if (hkMonth >= 12) {
            hkMonth = 0;
            hkYear += 1;
          }
        }
      }
      
      // 創建新的香港時間
      const hkDate = new Date(Date.UTC(hkYear, hkMonth, hkDay, hkHours, hkMinutes, 0));
      
      // 更新記錄
      record.recordDate = hkDate;
      await record.save();
      
      console.log(`修復後時間: ${hkDate.toISOString()}`);
      console.log(`香港時間: ${hkDate.toLocaleString('zh-TW', {timeZone: 'Asia/Hong_Kong'})}`);
      fixedCount++;
    }

    console.log(`\n修復完成！`);
    console.log(`修復記錄數: ${fixedCount}`);
    console.log(`總記錄數: ${records.length}`);

  } catch (error) {
    console.error('修復財務記錄時間失敗:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('數據庫連接已關閉');
  }
}

// 運行修復腳本
fixFinancialRecordTimesV2().catch(console.error); 