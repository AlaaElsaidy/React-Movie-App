import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import colors from '../theme/colors';
import DrawerMenu from '../components/DrawerMenu';

const POSTER_URL = 'https://image.tmdb.org/t/p/w500';
const USE_LOCAL_HEADER = true; 

export default function FavoritesScreen({
  favorites,
  onSelectMovie,
  navigateBack,
  onToggleFavorite, 
  navigateDrawer,   
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new'); 
  const [grid, setGrid] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? favorites.filter((m) => (m.title || '').toLowerCase().includes(q))
      : favorites.slice();

    const byDate = (a, b) => {
      const da = a.release_date ? new Date(a.release_date).getTime() : 0;
      const db = b.release_date ? new Date(b.release_date).getTime() : 0;
      return db - da;
    };

    switch (sort) {
      case 'az':
        return base.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'za':
        return base.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'new':
        return base.sort(byDate);
      case 'old':
        return base.sort((a, b) => -byDate(a, b));
      default:
        return base;
    }
  }, [favorites, query, sort]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const removeSelected = () => {
    if (!onToggleFavorite) return;
    const count = selectedIds.size;
    if (count === 0) return;

    Alert.alert(
      'Remove favorites',
      `Remove ${count} selected?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach((id) => {
              const movie = favorites.find((f) => f.id === id);
              if (movie) onToggleFavorite(movie);
            });
            exitSelectMode();
          },
        },
      ]
    );
  };

  const clearAll = () => {
    if (!onToggleFavorite || favorites.length === 0) return;
    Alert.alert(
      'Clear all favorites',
      'Remove all favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove all',
          style: 'destructive',
          onPress: () => {
            favorites.forEach((m) => onToggleFavorite(m));
            exitSelectMode();
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.controls}>
      {USE_LOCAL_HEADER && (
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setDrawerOpen(!drawerOpen)} hitSlop={10}>
            <Text style={styles.menu}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Favorites</Text>

          <View style={styles.headerRight}>
            {onToggleFavorite && favorites.length > 0 && (
              <TouchableOpacity onPress={() => (selectMode ? exitSelectMode() : setSelectMode(true))}>
                <Text style={[styles.actionText, selectMode && { color: colors.accent }]}>
                  {selectMode ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
            <Text style={styles.clear}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <View style={styles.chips}>
          {[
            { key: 'new', label: 'Newest' },
            { key: 'old', label: 'Oldest' },
            { key: 'az', label: 'A–Z' },
            { key: 'za', label: 'Z–A' },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, sort === opt.key && styles.chipActive]}
              onPress={() => setSort(opt.key)}
            >
              <Text style={[styles.chipText, sort === opt.key && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setGrid((g) => !g)}
          style={styles.viewToggle}
          hitSlop={8}
        >
          <Text style={styles.viewToggleText}>{grid ? 'List' : 'Grid'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.countText}>{filtered.length} items</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const poster = item.poster_path ? POSTER_URL + item.poster_path : null;
    const selected = selectedIds.has(item.id);

    const onPress = () => {
      if (selectMode) toggleSelect(item.id);
      else onSelectMovie(item);
    };

    const onLongPress = () => {
      if (!onToggleFavorite) return;
      if (!selectMode) setSelectMode(true);
      toggleSelect(item.id);
    };

    if (grid) {
      return (
        <TouchableOpacity
          style={styles.gridCard}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.85}
        >
          {poster ? (
            <Image source={{ uri: poster }} style={styles.gridPoster} />
          ) : (
            <View style={[styles.gridPoster, styles.posterPlaceholder]}>
              <Text style={styles.placeholderEmoji}>🎬</Text>
            </View>
          )}

          <View style={styles.gridOverlay}>
            <Text numberOfLines={2} style={styles.gridTitle}>
              {item.title}
            </Text>
            {!!item.release_date && (
              <Text style={styles.gridSub}>{item.release_date.slice(0, 4)}</Text>
            )}
          </View>

          {selectMode && (
            <View style={[styles.check, selected && styles.checkActive]}>
              <Text style={styles.checkMark}>{selected ? '✓' : ''}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.85}
      >
        {poster ? (
          <Image source={{ uri: poster }} style={styles.listPoster} />
        ) : (
          <View style={[styles.listPoster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderEmoji}>🎬</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
          {!!item.release_date && <Text style={styles.date}>{item.release_date}</Text>}
        </View>

        {selectMode && (
          <View style={[styles.listCheck, selected && styles.checkActive]}>
            <Text style={styles.checkMark}>{selected ? '✓' : ''}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {drawerOpen && (
        <DrawerMenu
          active="Favorites"                
          favoritesCount={favorites.length}  
          onNavigate={(screen) => {
            if (navigateDrawer) {
              navigateDrawer(screen);      
            } else if (screen === 'Home') {
              navigateBack?.();            
            }
            setDrawerOpen(false);
          }}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {favorites.length === 0 ? (
        <View style={styles.emptyWrap}>
          {USE_LOCAL_HEADER && (
            <View style={[styles.headerRow, { marginBottom: 12 }]}>
              <TouchableOpacity onPress={() => setDrawerOpen(!drawerOpen)} hitSlop={10}>
                <Text style={styles.menu}>☰</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Favorites</Text>
              <View style={{ width: 44 }} />
            </View>
          )}

          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySub}>Tap the star to save it.</Text>
          <TouchableOpacity onPress={navigateBack} style={styles.browseBtn}>
            <Text style={styles.browseText}>Browse</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={filtered}
            key={grid ? 'grid' : 'list'} 
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={grid ? 2 : 1}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: selectMode ? 96 : 24 },
            ]}
            columnWrapperStyle={grid ? { gap: 10 } : undefined}
            ItemSeparatorComponent={!grid ? () => <View style={{ height: 10 }} /> : null}
          />

          {selectMode && onToggleFavorite && (
            <View style={styles.bottomBar}>
              <TouchableOpacity onPress={removeSelected} style={[styles.dangerBtn, { flex: 1 }]}>
                <Text style={styles.dangerText}>
                  Remove {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearAll} style={styles.secondaryBtn}>
                <Text style={styles.secondaryText}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const CARD_RADIUS = 12;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 10 },

  controls: { paddingTop: 6 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 6,
    justifyContent: 'space-between',
  },
  menu: { fontSize: 24, color: colors.textPrimary },
  back: { fontSize: 22, color: colors.accent, paddingRight: 4 },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  headerRight: { minWidth: 44, alignItems: 'flex-end' },
  actionText: { color: colors.textPrimary, fontWeight: '700' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textSecondary + '44',
  },
  searchIcon: { fontSize: 16, color: colors.textSecondary, marginRight: 6 },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 16 },
  clear: { fontSize: 20, color: colors.textSecondary, paddingHorizontal: 6 },

  filterRow: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textSecondary + '44',
  },
  chipActive: { backgroundColor: colors.accent + '22', borderColor: colors.accent },
  chipText: { color: colors.textPrimary, fontWeight: '600' },
  chipTextActive: { color: colors.accent },

  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textSecondary + '44',
  },
  viewToggleText: { color: colors.textPrimary, fontWeight: '700' },

  countText: {
    marginTop: 2,
    marginBottom: 8,
    color: colors.textSecondary,
    fontSize: 13,
  },

  gridCard: {
    flex: 1,
    marginBottom: 10,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    height: 240,
    position: 'relative',
  },
  gridPoster: { width: '100%', height: '100%' },
  gridOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  gridTitle: { color: 'white', fontWeight: '700', fontSize: 14 },
  gridSub: { color: 'white', opacity: 0.9, marginTop: 2, fontSize: 12 },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { backgroundColor: colors.accent },
  checkMark: { color: 'white', fontSize: 14, fontWeight: '800' },

  listCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    alignItems: 'center',
    minHeight: 112,
  },
  listPoster: { width: 90, height: 120, borderTopLeftRadius: CARD_RADIUS, borderBottomLeftRadius: CARD_RADIUS },
  info: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  titleText: { fontWeight: '700', fontSize: 16, color: colors.textPrimary },
  date: { color: colors.textSecondary, marginTop: 4 },

  listCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  posterPlaceholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 22, opacity: 0.8 },

  content: { paddingTop: 8 },

  bottomBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 12,
    flexDirection: 'row',
    gap: 10,
  },
  dangerBtn: {
    backgroundColor: '#ff5c5c',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerText: { color: 'white', fontWeight: '800' },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textSecondary + '44',
  },
  secondaryText: { color: colors.textPrimary, fontWeight: '700' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  emptySub: { marginTop: 6, color: colors.textSecondary },
  browseBtn: {
    marginTop: 16,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  browseText: { color: 'white', fontWeight: '800' },
});