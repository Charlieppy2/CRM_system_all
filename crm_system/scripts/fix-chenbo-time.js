const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://hung51607602:Qang86rejdSczeIB@cluster0.ugimcd0.mongodb.net/crm-system?retryWrites=true&w=majority&appName=Cluster0';

const FinancialRecordSchema = new mongoose.Schema({
  recordType: { type: String, enum: ['income', 'expense'], required: true },
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

async function fixChenboTime() {
  try {
    console.log('正在連接數據庫...');
    await mongoose.connect(MONGODB_URI);
    console.log('數據庫連接成功');

    // 找到陳伯的記錄
    const chenboRecord = await FinancialRecord.findOne({ memberName: '陳伯' });
    
    if (!chenboRecord) {
      console.log('❌ 找不到陳伯的記錄');
      return;
    }

    console.log('找到陳伯的記錄:');
    console.log(`原始時間: ${chenboRecord.recordDate.toISOString()}`);
    console.log(`香港時間: ${chenboRecord.recordDate.toLocaleString('zh-TW', {timeZone: 'Asia/Hong_Kong'})}`);

    // 你輸入的時間是 15:25（下午3點25分）
    // 需要設置為 2025-08-13 15:25:00 HKT
    const correctDate = new Date('2025-08-13T15:25:00+08:00');
    
    console.log(`\n修正後的時間: ${correctDate.toISOString()}`);
    console.log(`香港時間: ${correctDate.toLocaleString('zh-TW', {timeZone: 'Asia/Hong_Kong'})}`);

    // 更新記錄
    chenboRecord.recordDate = correctDate;
    await chenboRecord.save();

    console.log('\n✅ 陳伯記錄時間修復完成！');

    // 驗證修復結果
    const updatedRecord = await FinancialRecord.findOne({ memberName: '陳伯' });
    console.log(`\n修復後的記錄時間: ${updatedRecord.recordDate.toISOString()}`);
    console.log(`香港時間: ${updatedRecord.recordDate.toLocaleString('zh-TW', {timeZone: 'Asia/Hong_Kong'})}`);

  } catch (error) {
    console.error('❌ 修復陳伯記錄時間失敗:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 數據庫連接已斷開');
  }
}

fixChenboTime().catch(console.error); 