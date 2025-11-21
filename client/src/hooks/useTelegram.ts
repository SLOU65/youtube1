import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            is_bot: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
          };
          auth_date: number;
          hash: string;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
        isClosingConfirmationEnabled: boolean;
        headerColor: string;
        backgroundColor: string;
        bottomBarColor: string;
        setData: (data: Record<string, string>, replace?: boolean) => void;
        getData: () => string;
        requestWriteAccess: () => void;
        requestContactAccess: () => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (text: string) => void) => void;
        shareToStory: (media_url: string, params?: { text?: string; widget_link?: { url: string; name?: string } }, callback?: (shared: boolean) => void) => void;
        shareUrl: (url: string, text?: string) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        invokeCustomMethod: (method: string, params?: Record<string, any>, callback?: (result: any) => void) => void;
        onEvent: (eventType: string, callback: (...args: any[]) => void) => void;
        offEvent: (eventType: string, callback: (...args: any[]) => void) => void;
        sendData: (data: string) => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        SecondaryButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        CloudStorage: {
          getItem: (key: string, callback?: (error: string | null, value: string | null) => void) => void;
          setItem: (key: string, value: string, callback?: (error: string | null) => void) => void;
          removeItem: (key: string, callback?: (error: string | null) => void) => void;
          getKeys: (callback?: (error: string | null, keys: string[]) => void) => void;
        };
        BiometricManager: {
          isAvailable: boolean;
          isBiometricIdAvailable: boolean;
          biometricType: 'finger' | 'face' | 'unknown';
          isAccessRequested: boolean;
          isAccessGranted: boolean;
          isBiometricTokenSaved: boolean;
          requestAccess: (params: { reason?: string }, callback?: (success: boolean) => void) => void;
          authenticate: (params: { reason?: string }, callback?: (success: boolean) => void) => void;
          updateBiometricToken: (params: { token: string }, callback?: (success: boolean) => void) => void;
          openSettings: () => void;
        };
      };
    };
  }
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
}

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram && 'WebApp' in window.Telegram) {
        const tg = window.Telegram.WebApp as any;
        
        // Ready the app
        tg.ready();
        
        // Expand the app to full height
        tg.expand();
        
        // Get user data
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }
        
        // Set color scheme
        setColorScheme(tg.colorScheme);
        
        // Listen for theme changes
        const handleThemeChange = () => {
          setColorScheme(tg.colorScheme);
        };
        
        tg.onEvent('themeChanged', handleThemeChange);
        
        setWebApp(tg);
        setIsReady(true);
        
        return () => {
          tg.offEvent('themeChanged', handleThemeChange);
        };
      } else {
        // Fallback for development/testing
        setIsReady(true);
      }
    };

    initTelegram();
  }, []);

  const isTelegramApp = !!webApp;

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    if (webApp) {
      webApp.showConfirm(message, callback);
    } else {
      callback(confirm(message));
    }
  };

  const openLink = (url: string) => {
    if (webApp) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const setMainButtonText = (text: string) => {
    if (webApp) {
      webApp.MainButton.setText(text);
    }
  };

  const showMainButton = () => {
    if (webApp) {
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (webApp) {
      webApp.MainButton.hide();
    }
  };

  const onMainButtonClick = (callback: () => void) => {
    if (webApp) {
      webApp.MainButton.onClick(callback);
    }
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(type);
    }
  };

  return {
    webApp: webApp as any,
    user,
    isReady,
    isTelegramApp,
    colorScheme,
    showAlert,
    showConfirm,
    openLink,
    setMainButtonText,
    showMainButton,
    hideMainButton,
    onMainButtonClick,
    hapticFeedback,
  };
};
