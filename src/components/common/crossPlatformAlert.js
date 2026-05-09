import React, { useState } from 'react';
import { Alert, Platform, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const T = {
  teal:     '#1A7A7A',
  tealDark: '#0D6E6E',
  tealSoft: '#E8F5F5',
  tealMid:  '#D0EEEE',
  text:     '#1A2E2E',
  muted:    '#5A8A8A',
  white:    '#FFFFFF',
};

let _setDialog = null;
function closeDialog() { _setDialog && _setDialog(null); }

export function AlertProvider() {
  const [dialog, setDialog] = useState(null);
  _setDialog = setDialog;
  if (Platform.OS !== 'web' || !dialog) return null;
  const { title, message, buttons } = dialog;
  return (
    <Modal transparent visible animationType="fade" onRequestClose={closeDialog}>
      <View style={s.overlay}>
        <View style={s.box}>
          <View style={s.bar} />
          <Text style={s.title}>{title}</Text>
          {!!message && <Text style={s.msg}>{message}</Text>}
          <View style={s.row}>
            {buttons.map((btn, i) => {
              const isCancel = btn.style === 'cancel';
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.8}
                  style={[s.btn, isCancel ? s.btnCancel : s.btnConfirm]}
                  onPress={() => { closeDialog(); btn.onPress && btn.onPress(); }}
                >
                  <Text style={[s.btnTxt, isCancel ? s.txtCancel : s.txtConfirm]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function show(opts) {
  if (!_setDialog) return;
  _setDialog(opts);
}

export function confirmAlert(title, message, onConfirm, opts = {}) {
  const { confirmLabel = 'OK', onCancel } = opts;
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: confirmLabel, onPress: onConfirm },
    ]);
    return;
  }
  show({
    title, message,
    buttons: [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: confirmLabel, onPress: onConfirm },
    ],
  });
}

export function infoAlert(title, message, onClose) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, [{ text: 'OK', onPress: onClose }]);
    return;
  }
  show({ title, message, buttons: [{ text: 'OK', onPress: onClose }] });
}

const s = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(10,30,30,0.55)', alignItems: 'center', justifyContent: 'center', padding: 40 },
  box:       { backgroundColor: T.white, borderRadius: 20, width: '100%', maxWidth: 320, overflow: 'hidden', shadowColor: T.tealDark, shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 20, borderWidth: 1, borderColor: T.tealMid },
  bar:       { height: 5, backgroundColor: T.teal },
  title:     { fontSize: 17, fontWeight: '800', color: T.text, textAlign: 'center', paddingTop: 20, paddingHorizontal: 24, letterSpacing: 0.2 },
  msg:       { fontSize: 14, color: T.muted, textAlign: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4, lineHeight: 21 },
  row:       { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 20 },
  btn:       { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { backgroundColor: T.tealSoft, borderWidth: 1, borderColor: T.tealMid },
  btnConfirm:{ backgroundColor: T.teal },
  btnTxt:    { fontSize: 15, fontWeight: '700' },
  txtCancel: { color: T.teal },
  txtConfirm:{ color: T.white },
});