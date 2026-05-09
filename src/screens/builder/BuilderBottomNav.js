import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/AuthStore";

const COLORS = {
  navy: "#1A7A7A",
  white: "#FFFFFF",
  bg: "#FFFFFF",
  gold: "#ffffff",
  sub: "#ffffff",
};

const tabs = [
  { key: "BuilderDashboard",       label: "Home",     icon: "home-outline",          activeIcon: "home",          route: "BuilderDashboard",       unlocked: true  },
  { key: "BuilderProjectSetup",    label: "Projects", icon: "business-outline",      activeIcon: "business",      route: "BuilderProjectSetup",    unlocked: false },
  { key: "BuilderUnitBooking",     label: "Bookings", icon: "document-text-outline", activeIcon: "document-text", route: "BuilderUnitBooking",     unlocked: false },
  { key: "BuilderPaymentSchedule", label: "Payments", icon: "card-outline",          activeIcon: "card",          route: "BuilderPaymentSchedule", unlocked: false },
  { key: "BuilderProfile",         label: "Profile",  icon: "person-outline",        activeIcon: "person",        route: "BuilderProfile",         unlocked: true  },
];

export default function BuilderBottomNav({ navigation, activeRoute }) {
  const verificationStatus = useAuthStore(s => {
    try {
      const live = s.registeredUsers && s.user
        ? s.registeredUsers.find(u => u.id === s.user.id) : null;
      return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
    } catch { return 'not_submitted'; }
  });
  const isVerified = verificationStatus === 'approved';

  return (
    <View style={styles.wrapper}>
      <View style={styles.nav}>
        {tabs.map((tab) => {
          const active = activeRoute === tab.key;
          const locked = !isVerified && !tab.unlocked;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.item}
              activeOpacity={0.85}
              onPress={() => {
                if (locked) {
                  Alert.alert(
                    '🔒 Verification Required',
                    'Please complete verification from Profile to unlock all features.',
                    [
                      { text: 'Go to Profile', onPress: () => navigation.navigate('BuilderProfile') },
                      { text: 'OK', style: 'cancel' },
                    ]
                  );
                  return;
                }
                if (!active) navigation.navigate(tab.route);
              }}
            >
              <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                <Ionicons
                  name={active ? tab.activeIcon : tab.icon}
                  size={21}
                  color={active ? COLORS.navy : locked ? 'rgba(255,255,255,0.35)' : COLORS.sub}
                />
                {locked && (
                  <Text style={{ position: 'absolute', top: -4, right: -4, fontSize: 9 }}>🔒</Text>
                )}
              </View>
              <Text style={[styles.label, active && styles.labelActive, locked && { opacity: 0.4 }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 22 : 12,
  },
  nav: {
    backgroundColor: COLORS.navy,
    borderRadius: 26,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBox: {
    width: 36,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconBoxActive: {
    backgroundColor: COLORS.gold,
  },
  label: {
    color: COLORS.sub,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  labelActive: {
    color: COLORS.white,
  },
});
