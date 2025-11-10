import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function DrawerMenu({
  onNavigate,
  onClose,
  active = 'Home',          
  favoritesCount = 0,       
}) {
  const go = (screen) => {
    onNavigate?.(screen);
    onClose?.();
  };

  return (
    <View style={styles.overlay}>
  
      <Pressable style={styles.scrim} onPress={onClose} />

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />


        <MenuItem
          label="Home"
          icon="home-outline"
          active={active === 'Home'}
          onPress={() => go('Home')}
        />


        <MenuItem
          label="Favorites"
          icon="heart-outline"
          active={active === 'Favorites'}
          badge={favoritesCount > 0 ? favoritesCount : undefined}
          onPress={() => go('Favorites')}
        />
      </View>
    </View>
  );
}

function MenuItem({ label, icon, active, badge, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.item, active && styles.itemActive]} activeOpacity={0.85}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={20} color={active ? colors.accent : colors.textPrimary} />
        <Text style={[styles.itemText, active && styles.itemTextActive]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'flex-start',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    marginTop: 70,
    marginHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border || colors.textSecondary + '22',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 4 },
    }),
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border || colors.textSecondary + '22',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 6,
    marginVertical: 4,
    borderRadius: 12,
  },
  itemActive: {
    backgroundColor: colors.accent ? colors.accent + '22' : 'rgba(108,92,231,0.15)',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemText: { marginLeft: 10, fontSize: 16, color: colors.textPrimary, fontWeight: '700' },
  itemTextActive: { color: colors.accent },
  itemRight: { flexDirection: 'row', alignItems: 'center' },

  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    marginRight: 8,
  },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '800' },
});