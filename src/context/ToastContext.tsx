import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, Dimensions, Easing, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ===================== TYPES ===================== //

type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastConfig = {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;       // ms, 0 = manual dismiss only
  onDismiss?: () => void;
  onPress?: () => void;    // Acción al tocar el toast
  icon?: string;           // Icono personalizado opcional
};

type ConfirmConfig = {
  type?: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  destructive?: boolean;
  singleButton?: boolean;  // For acknowledgment-only (no cancel)
};

type ToastContextType = {
  show: (config: ToastConfig) => void;
  confirm: (config: ConfirmConfig) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warn: (title: string, message?: string) => void;
};

// ===================== THEME ===================== //

const THEME = {
  success: { bg: '#f0faf0', accent: '#40c057', icon: 'checkmark-circle', iconBg: '#e6f7e6' },
  error:   { bg: '#fef0ec', accent: '#e8590c', icon: 'alert-circle',     iconBg: '#fde8e0' },
  warning: { bg: '#fff9e6', accent: '#f59f00', icon: 'warning',          iconBg: '#fff3cd' },
  info:    { bg: '#e8f4fd', accent: '#339af0', icon: 'information-circle', iconBg: '#d0ebff' },
};

const CONFIRM_THEME = {
  warning: { accent: '#f59f00', icon: 'warning',       iconBg: '#fff3cd' },
  danger:  { accent: '#e8590c', icon: 'alert-circle',  iconBg: '#fde8e0' },
  info:    { accent: '#339af0', icon: 'help-circle',   iconBg: '#d0ebff' },
};

// ===================== CONTEXT ===================== //

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// ===================== TOAST COMPONENT ===================== //

const ToastView: React.FC<{
  toast: ToastConfig;
  onDismiss: () => void;
  insetTop: number;
}> = ({ toast, onDismiss, insetTop }) => {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const theme = THEME[toast.type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    const dur = toast.duration ?? 3500;
    if (dur > 0) {
      const timer = setTimeout(() => dismiss(), dur);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 250, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      toast.onDismiss?.();
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { top: insetTop + 10, opacity, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
          if (toast.onPress) {
            toast.onPress();
            dismiss();
          }
        }}
        style={[styles.toastCard, { backgroundColor: theme.bg, borderLeftColor: theme.accent }]}
      >
        <View style={[styles.toastIconCircle, { backgroundColor: theme.iconBg }]}>
          <Icon name={toast.icon || theme.icon} size={22} color={theme.accent} />
        </View>
        <View style={styles.toastContent}>
          <Text style={[styles.toastTitle, { color: theme.accent }]}>{toast.title}</Text>
          {toast.message ? <Text style={styles.toastMessage}>{toast.message}</Text> : null}
        </View>
        <TouchableOpacity onPress={dismiss} style={styles.toastClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="close" size={18} color="#adb5bd" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ===================== CONFIRM DIALOG ===================== //

const ConfirmView: React.FC<{
  config: ConfirmConfig;
  onClose: () => void;
}> = ({ config, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const theme = CONFIRM_THEME[config.type || 'warning'];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleCancel = () => {
    animateOut(() => {
      config.onCancel?.();
      onClose();
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await config.onConfirm();
    } catch (e) {
      console.error('Confirm action error:', e);
    }
    setLoading(false);
    animateOut(onClose);
  };

  const animateOut = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(cb);
  };

  return (
    <Modal transparent visible animationType="none">
      <Animated.View style={[styles.confirmOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.confirmBackdrop}
          activeOpacity={1}
          onPress={config.singleButton ? undefined : handleCancel}
        />
        <Animated.View style={[styles.confirmCard, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
          {/* Icon */}
          <View style={[styles.confirmIconCircle, { backgroundColor: theme.iconBg }]}>
            <Icon name={theme.icon} size={40} color={theme.accent} />
          </View>

          {/* Text */}
          <Text style={styles.confirmTitle}>{config.title}</Text>
          <Text style={styles.confirmMessage}>{config.message}</Text>

          {/* Buttons */}
          <View style={styles.confirmButtons}>
            {!config.singleButton && (
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.confirmCancelText}>{config.cancelText || 'Cancelar'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.confirmActionBtn,
                config.singleButton && styles.confirmActionBtnFull,
                config.destructive && styles.confirmDestructiveBtn,
                !config.destructive && { backgroundColor: '#B96A4A' },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmActionText}>
                  {config.confirmText || (config.singleButton ? 'Entendido' : 'Confirmar')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ===================== PROVIDER ===================== //

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastConfig & { id: number })[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const idRef = useRef(0);
  const insets = useSafeAreaInsets();

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => (t as any).id !== id));
  }, []);

  const show = useCallback((config: ToastConfig) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev.slice(-2), { ...config, id }]); // max 3 toasts
  }, []);

  const confirm = useCallback((config: ConfirmConfig) => {
    setConfirmConfig(config);
  }, []);

  // Shorthand helpers
  const success = useCallback((title: string, message?: string) => {
    show({ type: 'success', title, message });
  }, [show]);

  const error = useCallback((title: string, message?: string) => {
    show({ type: 'error', title, message, duration: 4500 });
  }, [show]);

  const info = useCallback((title: string, message?: string) => {
    show({ type: 'info', title, message });
  }, [show]);

  const warn = useCallback((title: string, message?: string) => {
    show({ type: 'warning', title, message, duration: 4500 });
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, confirm, success, error, info, warn }}>
      {children}

      {/* Toasts Layer */}
      {toasts.map((t, i) => (
        <ToastView
          key={(t as any).id}
          toast={t}
          onDismiss={() => removeToast((t as any).id)}
          insetTop={insets.top + i * 90}
        />
      ))}

      {/* Confirm Dialog */}
      {confirmConfig && (
        <ConfirmView
          config={confirmConfig}
          onClose={() => setConfirmConfig(null)}
        />
      )}
    </ToastContext.Provider>
  );
};

// ===================== STYLES ===================== //

const styles = StyleSheet.create({
  // Toast
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  toastIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  toastMessage: {
    fontSize: 13,
    color: '#495057',
    marginTop: 2,
    lineHeight: 18,
  },
  toastClose: {
    padding: 4,
    marginLeft: 8,
  },

  // Confirm Dialog
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    width: SCREEN_WIDTH - 60,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  confirmIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D2D2D',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 25,
  },
  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6c757d',
  },
  confirmActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#B96A4A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  confirmActionBtnFull: {
    flex: 1,
  },
  confirmDestructiveBtn: {
    backgroundColor: '#e8590c',
    shadowColor: '#e8590c',
  },
  confirmActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
