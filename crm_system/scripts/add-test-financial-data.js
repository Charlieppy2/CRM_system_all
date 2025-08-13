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

async function addTestFinancialData() {
  try {
    console.log('正在連接數據庫...');
    await mongoose.connect(MONGODB_URI);
    console.log('數據庫連接成功');

    // 獲取當前日期
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // 上個月的日期範圍
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);

    console.log(`當前時間: ${now.toLocaleString('zh-TW')}`);
    console.log(`上個月開始: ${lastMonthStart.toLocaleString('zh-TW')}`);
    console.log(`上個月結束: ${lastMonthEnd.toLocaleString('zh-TW')}`);

    // 檢查是否已有上個月的數據
    const existingLastMonthRecords = await FinancialRecord.find({
      recordDate: {
        $gte: lastMonthStart,
        $lte: lastMonthEnd
      }
    });

    if (existingLastMonthRecords.length > 0) {
      console.log(`發現 ${existingLastMonthRecords.length} 筆上個月的記錄，跳過創建`);
      console.log('上個月的記錄:');
      existingLastMonthRecords.forEach(record => {
        console.log(`- ${record.memberName}: ${record.item} (${record.recordDate.toLocaleDateString('zh-TW')})`);
      });
      return;
    }

    // 創建上個月的測試數據
    const testRecords = [
      {
        recordType: 'income',
        memberName: '張三',
        item: '課程費用',
        details: '上個月課程',
        location: '灣仔',
        unitPrice: 150,
        quantity: 1,
        totalAmount: 150,
        recordDate: new Date(currentYear, currentMonth - 1, 15, 10, 0, 0), // 上個月15號
        createdBy: new mongoose.Types.ObjectId('000000000000000000000000'), // 虛擬ID
        createdAt: new Date(currentYear, currentMonth - 1, 15, 10, 0, 0),
        updatedAt: new Date(currentYear, currentMonth - 1, 15, 10, 0, 0)
      },
      {
        recordType: 'income',
        memberName: '李四',
        item: '器材購買',
        details: '上個月器材',
        location: '石門',
        unitPrice: 80,
        quantity: 2,
        totalAmount: 160,
        recordDate: new Date(currentYear, currentMonth - 1, 20, 14, 30, 0), // 上個月20號
        createdBy: new mongoose.Types.ObjectId('000000000000000000000000'),
        createdAt: new Date(currentYear, currentMonth - 1, 20, 14, 30, 0),
        updatedAt: new Date(currentYear, currentMonth - 1, 20, 14, 30, 0)
      },
      {
        recordType: 'expense',
        memberName: '王五',
        item: '器材維護',
        details: '上個月維護費',
        location: '黃大仙',
        unitPrice: 200,
        quantity: 1,
        totalAmount: 200,
        recordDate: new Date(currentYear, currentMonth - 1, 25, 16, 0, 0), // 上個月25號
        createdBy: new mongoose.Types.ObjectId('000000000000000000000000'),
        createdAt: new Date(currentYear, currentMonth - 1, 25, 16, 0, 0),
        updatedAt: new Date(currentYear, currentMonth - 1, 25, 16, 0, 0)
      },
      {
        recordType: 'income',
        memberName: '趙六',
        item: '課程費用',
        details: '上個月進階課程',
        location: '灣仔',
        unitPrice: 300,
        quantity: 1,
        totalAmount: 300,
        recordDate: new Date(currentYear, currentMonth - 1, 28, 9, 0, 0), // 上個月28號
        createdBy: new mongoose.Types.ObjectId('000000000000000000000000'),
        createdAt: new Date(currentYear, currentMonth - 1, 28, 9, 0, 0),
        updatedAt: new Date(currentYear, currentMonth - 1, 28, 9, 0, 0)
      }
    ];

    console.log('正在創建上個月的測試財務記錄...');
    
    for (const recordData of testRecords) {
      const newRecord = new FinancialRecord(recordData);
      await newRecord.save();
      console.log(`✅ 創建記錄: ${recordData.memberName} - ${recordData.item} (${recordData.recordDate.toLocaleDateString('zh-TW')})`);
    }

    console.log('\n🎉 上個月的測試財務記錄創建完成！');
    console.log(`創建記錄數: ${testRecords.length}`);

    // 驗證創建的記錄
    const allRecords = await FinancialRecord.find().sort({ recordDate: -1 });
    console.log(`\n📊 數據庫總記錄數: ${allRecords.length}`);
    
    console.log('\n📅 按日期排序的記錄:');
    allRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.memberName}: ${record.item} - ${record.recordDate.toLocaleDateString('zh-TW')} ${record.recordDate.toLocaleTimeString('zh-TW')}`);
    });

  } catch (error) {
    console.error('❌ 創建測試財務記錄失敗:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 數據庫連接已斷開');
  }
}

addTestFinancialData().catch(console.error); 