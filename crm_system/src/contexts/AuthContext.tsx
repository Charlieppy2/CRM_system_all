'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  _id?: string; // 為了向後兼容
  username: string;
  name?: string; // 添加name屬性
  role: 'admin' | 'user' | 'trainer' | 'member';
  locations?: string[];
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 需要保护的路由列表
const PROTECTED_ROUTES = [
  '/',
  '/attendance',
  '/account_management',
  '/admin',
  '/financial_management',
];

// 公开路由列表
const PUBLIC_ROUTES = [
  '/login',
  '/unauthorized',
];

    // 檢查路徑是否需要認證
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

// 檢查用戶是否有權限訪問特定路徑
function hasRouteAccess(pathname: string, userRole: string): boolean {
      // 管理員可以訪問所有頁面
  if (userRole === 'admin') {
    return true;
  }
  
      // 教練只能訪問首頁和出席管理
  if (userRole === 'trainer') {
    if (pathname === '/' || pathname.startsWith('/attendance')) {
      return true;
    }
          // 不能訪問帳號管理
    if (pathname.startsWith('/account_management')) {
      return false;
    }
          return true; // 其他頁面暫時允許訪問
  }
  
      // 普通用戶和會員暫時按原來的邏輯
  if (userRole === 'user' || userRole === 'member') {
          return true; // 暫時允許訪問所有頁面
  }
  
  return false;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

      // 檢查認證狀態
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          return;
        }
      }
      setUser(null);
    } catch (error) {
      console.error('認證檢查失敗:', error);
      setUser(null);
    }
  };

      // 登入
  const login = (userData: User) => {
    setUser(userData);
  };

      // 登出
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
              console.error('登出失敗:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

      // 初始化認證檢查
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  // 路由保护逻辑
  useEffect(() => {
          if (isLoading) return; // 等待認證檢查完成

    const isProtected = isProtectedRoute(pathname);
    const isPublic = isPublicRoute(pathname);

    if (isProtected && !user) {
      // 需要認證但用戶未登入，重定向到登入頁
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (pathname === '/login' && user) {
              // 已登入用戶訪問登入頁，重定向到主頁
      router.push('/');
    } else if (user && isProtected && !hasRouteAccess(pathname, user.role)) {
              // 用戶已登入但沒有權限訪問該頁面，重定向到無權限頁面
              console.warn(`用戶 ${user.username} (${user.role}) 嘗試訪問無權限頁面: ${pathname}`);
      router.push('/unauthorized');
    }
  }, [user, pathname, isLoading, router]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 