import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import HomeScreen from '../React-Movie-App/screens/HomeScreen';
import FavoritesScreen from '../React-Movie-App/screens/FavoritesScreen';
import DetailsScreen from '../React-Movie-App/screens/DetailsScreen';
import colors from '../React-Movie-App/theme/colors';

const SCREENS = {
  HOME: 'Home',
  FAVORITES: 'Favorites',
  DETAILS: 'Details',
};

const palette = {
  background: colors?.background ?? '#0b0b0f',
  card: colors?.card ?? '#15161a',
  primary: colors?.primary ?? '#6C5CE7',
  text: colors?.text ?? '#ffffff',
  muted: colors?.muted ?? '#9aa0a6',
  border: colors?.border ?? 'rgba(255,255,255,0.08)',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [lastTab, setLastTab] = useState(SCREENS.HOME);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const isFavorite = (movie) => !!favorites.find((f) => f?.id === movie?.id);

  const handleToggleFavorite = (movie) => {
    if (!movie) return;
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === movie.id);
      if (exists) return prev.filter((f) => f.id !== movie.id);
      return [...prev, movie];
    });
  };

  const navigate = (screen, movie = null) => {
    setSelectedMovie(movie);
    if (screen === SCREENS.HOME || screen === SCREENS.FAVORITES) {
      setLastTab(screen);
    }
    setCurrentScreen(screen);
  };

  const headerTitle = useMemo(() => {
    switch (currentScreen) {
      case SCREENS.HOME:
        return '';
      case SCREENS.FAVORITES:
        return '';
      case SCREENS.DETAILS:
        return '';
      default:
        return '';
    }
  }, [currentScreen, selectedMovie]);

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.HOME:
        return (
          <HomeScreen
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectMovie={(movie) => navigate(SCREENS.DETAILS, movie)}
            navigateDrawer={(screen) => navigate(screen)}
          />
        );
      case SCREENS.FAVORITES:
        return (
          <FavoritesScreen
            favorites={favorites}
            onSelectMovie={(movie) => navigate(SCREENS.DETAILS, movie)}
            navigateBack={() => navigate(lastTab)}
            navigateDrawer={(screen) => navigate(screen)} 
          />
        );
      case SCREENS.DETAILS:
        return (
          <DetailsScreen
            movie={selectedMovie}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            navigateBack={() => navigate(lastTab)}
          />
        );
      default:
        return null;
    }
  };

  const showBack = currentScreen === SCREENS.DETAILS;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { borderBottomColor: palette.border, backgroundColor: palette.background }]}>
        <View style={styles.headerSide}>
          {showBack ? (
            <Pressable onPress={() => navigate(lastTab)} style={styles.headerIcon} hitSlop={10}>
              <Text style={[styles.headerIconText, { color: palette.text }]}>←</Text>
            </Pressable>
          ) : (
            <View style={styles.headerIconPlaceholder} />
          )}
        </View>

        {headerTitle ? (
          <Text numberOfLines={1} style={[styles.headerTitle, { color: palette.text }]}>
            {headerTitle}
          </Text>
        ) : (
          <View style={styles.headerTitle} />
        )}

        <View style={styles.headerSide}>
          {currentScreen === SCREENS.DETAILS ? (
            <Pressable
              onPress={() => handleToggleFavorite(selectedMovie)}
              style={styles.headerIcon}
              hitSlop={10}
            >
              <Text
                style={[
                  styles.headerIconText,
                  { color: isFavorite(selectedMovie) ? palette.primary : palette.muted },
                ]}
              >
                {isFavorite(selectedMovie) ? '★' : '☆'}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.headerRightGroup}>
              <Text style={[styles.counter, { color: palette.muted }]}>{favorites.length} ★</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {currentScreen !== SCREENS.DETAILS && (
        <TabBar
          active={currentScreen}
          onChange={(screen) => navigate(screen)}
          favoritesCount={favorites.length}
        />
      )}
    </SafeAreaView>
  );
}

function TabBar({ active, onChange, favoritesCount }) {
  return (
    <View style={[styles.tabBar, { backgroundColor: palette.card, borderTopColor: palette.border }]}>
      <TabItem
        label="Home"
        isActive={active === SCREENS.HOME}
        onPress={() => onChange(SCREENS.HOME)}
      />
      <TabItem
        label="Favorites"
        isActive={active === SCREENS.FAVORITES}
        onPress={() => onChange(SCREENS.FAVORITES)}
        badgeCount={favoritesCount}
      />
    </View>
  );
}

function TabItem({ label, icon, isActive, onPress, badgeCount }) {
  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <View style={[styles.tabPill, isActive && { backgroundColor: palette.primary + '22' }]}>
        {/* icon اختياري */}
        {icon ? (
          <Text style={[styles.tabIcon, { color: isActive ? palette.primary : palette.muted }]}>{icon}</Text>
        ) : null}
        <Text style={[styles.tabLabel, { color: isActive ? palette.primary : palette.muted }]}>{label}</Text>
        {!!badgeCount && (
          <View style={[styles.badge, { backgroundColor: palette.primary }]}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    padding: 8,
    borderRadius: 24,
  },
  headerIconPlaceholder: { width: 24, height: 24 },
  headerIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  counter: { fontSize: 13, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabPill: {
    minWidth: 120,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 14, fontWeight: '700' },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
});