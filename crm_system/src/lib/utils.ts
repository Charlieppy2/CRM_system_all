/**
 * 工具函數庫
 */

/**
 * 格式化日期時間為香港時區
 * @param dateString 日期字符串或 Date 對象
 * @param options 格式化選項
 * @returns 格式化後的香港時間字符串
 */
export const formatHKTime = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {}
) => {
  const date = new Date(dateString);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Hong_Kong',
    ...options
  };
  
  return date.toLocaleString('zh-TW', defaultOptions);
};

/**
 * 獲取香港時區的當前時間
 * @returns 香港時區的當前時間字符串
 */
export const getCurrentHKTime = () => {
  const now = new Date();
  return now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"});
};

/**
 * 獲取香港時區的當前時間，格式為 datetime-local 輸入框可用
 * @returns 格式化的時間字符串
 */
export const getCurrentHKTimeForInput = () => {
  const now = new Date();
  const hkTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
  return hkTime.toISOString().slice(0, 16);
};

/**
 * 將任意時間轉換為香港時區
 * @param dateString 原始時間字符串
 * @returns 香港時區的時間字符串
 */
export const convertToHKTime = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"});
}; 