'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const { isCollapsed, toggleCollapse, isMobile } = useSidebar();
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState(false);
  const [isTrainerManagementOpen, setIsTrainerManagementOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isActivityManagementOpen, setIsActivityManagementOpen] = useState(false);
  const [isFinancialManagementOpen, setIsFinancialManagementOpen] = useState(false);
  
  // 防止快速鼠标移动造成的闪烁
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accountTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 监听路径变化
  useEffect(() => {
    // 当路径变化时，自动展开相关的菜单
    if (pathname.startsWith('/attendance')) {
      setIsAttendanceOpen(true);
    } else {
      setIsAttendanceOpen(false);
    }
    
    if (pathname.startsWith('/member_management')) {
      setIsMemberManagementOpen(true);
    } else {
      setIsMemberManagementOpen(false);
    }
    
    if (pathname.startsWith('/trainer_management')) {
      setIsTrainerManagementOpen(true);
    } else {
      setIsTrainerManagementOpen(false);
    }
    
    if (pathname.startsWith('/account_management')) {
      setIsAccountOpen(true);
    } else {
      setIsAccountOpen(false);
    }
    
    if (pathname.startsWith('/activity_management')) {
      setIsActivityManagementOpen(true);
    } else {
      setIsActivityManagementOpen(false);
    }
    
    if (pathname.startsWith('/financial_management')) {
      setIsFinancialManagementOpen(true);
    } else {
      setIsFinancialManagementOpen(false);
    }
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const isAttendanceActive = () => {
    return pathname.startsWith('/attendance');
  };

  const isAccountActive = () => {
    return pathname.startsWith('/account_management');
  };

  const isMemberManagementActive = () => {
    return pathname.startsWith('/member_management');
  };

  const isTrainerManagementActive = () => {
    return pathname.startsWith('/trainer_management');
  };

  const isActivityManagementActive = () => {
    return pathname.startsWith('/activity_management');
  };

  const isFinancialManagementActive = () => {
    return pathname.startsWith('/financial_management');
  };

  // 检查用户是否有权限访问账号管理
  const hasAccountManagementAccess = () => {
    return user?.role === 'admin';
  };

  // 注销功能
  const handleLogout = async () => {
    await logout();
  };

  // 清理计时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (accountTimeoutRef.current) {
        clearTimeout(accountTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* 侧边导航栏 */}
      <nav 
        className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-50 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobile 
            ? isCollapsed 
              ? '-translate-x-full' 
              : 'translate-x-0' 
            : 'translate-x-0'
        }`}
        style={{ 
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        <div className="flex flex-col h-full">
          {/* 顶部区域 - Logo和折叠按钮 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <Link href="/" className="flex items-center space-x-3">
                <div>
                  <span className="text-lg font-bold text-gray-800">CRM 系統</span>
                  <div className="text-xs text-gray-500">管理系統</div>
                </div>
              </Link>
            )}
            <button
              onClick={toggleCollapse}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg 
                className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* 用户信息和注销按钮区域 */}
          {!isLoading && user && (
            <div className="p-4 border-b border-gray-200">
              {!isCollapsed ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{user.username}</div>
                      <div className="text-xs text-gray-500 capitalize">{
                        user.role === 'admin' ? '管理員' :
                        user.role === 'trainer' ? '教練' :
                        user.role === 'member' ? '會員' :
                        '普通用戶'
                      }</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>注销</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white text-xs font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full p-2 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                    title="注销"
                  >
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 导航菜单 */}
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {/* 首页 */}
              <li>
                <Link
                  href="/"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive('/')
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {!isCollapsed && <span>首頁</span>}
                </Link>
              </li>

              {/* 出席管理 */}
              <li>
                <div>
                  <button
                    onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                      isAttendanceActive()
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      {!isCollapsed && <span>出席管理</span>}
                    </div>
                    {!isCollapsed && (
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isAttendanceOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* 出席管理子菜单 */}
                  {(isAttendanceOpen && !isCollapsed) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      <li>
                        <Link
                          href="/attendance"
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            pathname === '/attendance'
                              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          所有記錄
                        </Link>
                      </li>
                      {user?.role === 'admin' && (
                        <li>
                          <Link
                            href="/attendance/activity_management"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/attendance/activity_management'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            活動管理
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          href="/attendance/check"
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            pathname === '/attendance/check'
                              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          點名記錄
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/attendance/add"
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            pathname === '/attendance/add'
                              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          添加記錄
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/attendance/by_name"
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            pathname === '/attendance/by_name'
                              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          按姓名分類
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/attendance/qr-scan"
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            pathname === '/attendance/qr-scan'
                              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          📱 QR Code 掃描
                        </Link>
                      </li>
                      {user?.role === 'admin' && (
                        <li>
                          <Link
                            href="/attendance/qr-bulk"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/attendance/qr-bulk'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            🖨️ 批量生成 QR Code
                          </Link>
                        </li>
                      )}

                    </ul>
                  )}
                </div>
              </li>

              {/* 会员管理 - 只有管理员可以看到 */}
              {user?.role === 'admin' && (
                <li>
                  <div>
                    <button
                      onClick={() => setIsMemberManagementOpen(!isMemberManagementOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        isMemberManagementActive()
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {!isCollapsed && <span>會員管理</span>}
                      </div>
                      {!isCollapsed && (
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${isMemberManagementOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* 会员管理子菜单 */}
                    {(isMemberManagementOpen && !isCollapsed) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <Link
                            href="/member_management/profile"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname.startsWith('/member_management/profile')
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            會員資料
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              )}

              {/* 教练管理 - 只有管理员可以看到 */}
              {user?.role === 'admin' && (
                <li>
                  <div>
                    <button
                      onClick={() => setIsTrainerManagementOpen(!isTrainerManagementOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        isTrainerManagementActive()
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {!isCollapsed && <span>教練管理</span>}
                      </div>
                      {!isCollapsed && (
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${isTrainerManagementOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* 教练管理子菜单 */}
                    {(isTrainerManagementOpen && !isCollapsed) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <Link
                            href="/trainer_management/profile"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname.startsWith('/trainer_management/profile')
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            教練資料
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              )}

              {/* 活动管理 - 只有教练可以看到 */}
              {user?.role === 'trainer' && (
                <li>
                  <div>
                    <button
                      onClick={() => setIsActivityManagementOpen(!isActivityManagementOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        isActivityManagementActive()
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {!isCollapsed && <span>活動管理</span>}
                      </div>
                      {!isCollapsed && (
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${isActivityManagementOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* 活动管理子菜单 */}
                    {(isActivityManagementOpen && !isCollapsed) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <Link
                            href="/activity_management/my_activity"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/activity_management/my_activity'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            我的活動
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              )}

              {/* 財務管理 - 只有管理员可以看到 */}
              {user?.role === 'admin' && (
                <li>
                  <div>
                    <button
                      onClick={() => setIsFinancialManagementOpen(!isFinancialManagementOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        isFinancialManagementActive()
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        {!isCollapsed && <span>財務管理</span>}
                      </div>
                      {!isCollapsed && (
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${isFinancialManagementOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* 財務管理子菜单 */}
                    {(isFinancialManagementOpen && !isCollapsed) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <Link
                            href="/financial_management"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/financial_management'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            財務總覽
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/financial_management/by_name"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/financial_management/by_name'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            按姓名分類
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/financial_management/report"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/financial_management/report'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            財務報告
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/financial_management/add"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/financial_management/add'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            新增記錄
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              )}

              {/* 账号管理 - 只有管理员可以看到 */}
              {hasAccountManagementAccess() && (
                <li>
                  <div>
                    <button
                      onClick={() => setIsAccountOpen(!isAccountOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        isAccountActive()
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {!isCollapsed && <span>帳號管理</span>}
                      </div>
                      {!isCollapsed && (
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${isAccountOpen ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* 账号管理子菜单 */}
                    {(isAccountOpen && !isCollapsed) && (
                      <ul className="mt-1 ml-8 space-y-1">
                        <li>
                          <Link
                            href="/account_management/admin"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/account_management/admin'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            管理員
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/account_management/trainer"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/account_management/trainer'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            教練
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/account_management/member"
                            className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                              pathname === '/account_management/member'
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            會員
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* 移动端遮罩层 */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleCollapse}
        />
      )}

      {/* 移动端菜单按钮 */}
      {isMobile && (
        <button
          onClick={toggleCollapse}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg border border-gray-200"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
} 