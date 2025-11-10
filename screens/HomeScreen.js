import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import colors from '../theme/colors';
import MovieCard from '../components/MovieCard';
import DrawerMenu from '../components/DrawerMenu';

const API_KEY = '82f823b60a578d4233a3902227a3f1e2';

export default function HomeScreen({ favorites, onToggleFavorite, onSelectMovie, navigateDrawer }) {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState(null);

  const hasMore = page < totalPages;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const fetchGenres = async () => {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
      setGenres(res.data.genres || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMovies = async (reset = false) => {
    try {
      setError(null);
      setLoading(true);

      const pageToLoad = reset ? 1 : page;
      const q = encodeURIComponent(debouncedQuery);
      const url = debouncedQuery
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${q}&page=${pageToLoad}`
        : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${pageToLoad}${
            selectedGenre ? `&with_genres=${selectedGenre}` : ''
          }`;

      const res = await axios.get(url);
      const { results = [], total_pages = 1 } = res.data || {};

      setTotalPages(total_pages);

      setMovies((prev) => {
        const combined = reset ? results : [...prev, ...results];
        const unique = combined.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
        return unique;
      });
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchMovies(true);
  }, [debouncedQuery, selectedGenre]);

  useEffect(() => {
    if (page > 1) fetchMovies();
  }, [page]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setPage(1);
      await fetchMovies(true);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) setPage((prev) => prev + 1);
  };

  const genresWithAll = useMemo(
    () => [{ id: null, name: 'All' }, ...genres],
    [genres]
  );

  const renderHeader = () => (
    <View style={styles.stickyHeader}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={() => setDrawerOpen(!drawerOpen)} hitSlop={10}>
          <Text style={styles.menu}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Discover</Text>

        <View style={styles.favPill}>
          <Text style={styles.favStar}>★</Text>
          <Text style={styles.favCount}>{favorites.length}</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
  
        <TextInput
          placeholder="Search movies..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => {
            setPage(1);
            fetchMovies(true);
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
            <Text style={styles.clear}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={genresWithAll}
        keyExtractor={(item) => String(item.id ?? 'all')}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => {
          const selected = selectedGenre === item.id || (!selectedGenre && item.id === null);
          return (
            <TouchableOpacity
              style={[styles.chip, selected && styles.chipActive]}
              onPress={() => {
                setSelectedGenre(item.id);
              }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {!!error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchMovies(true)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {drawerOpen && (
        <DrawerMenu
          onNavigate={(screen) => {
            navigateDrawer(screen);
            setDrawerOpen(false);
          }}
        />
      )}

      {loading && page === 1 ? (
        <View style={styles.initialLoading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              isFavorite={favorites.some((f) => f.id === item.id)}
              onToggleFavorite={onToggleFavorite}
              onPress={() => onSelectMovie(item)}
            />
          )}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]} 
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}></Text>
              <Text style={styles.emptyTitle}>No movies found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or change the genre.
              </Text>
            </View>
          }
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  stickyHeader: {
    backgroundColor: colors.background,
    paddingTop: 8,
    paddingBottom: 6,
  },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 6,
    justifyContent: 'space-between',
  },
  menu: { fontSize: 24, color: colors.textPrimary },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  favPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  favStar: { color: colors.accent, fontWeight: '800' },
  favCount: { color: colors.textPrimary, fontWeight: '700' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textSecondary + '44',
  },
  searchIcon: { fontSize: 16, color: colors.textSecondary, marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clear: { fontSize: 20, color: colors.textSecondary, paddingHorizontal: 6 },

  chipsRow: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.textSecondary + '44',
  },
  chipActive: {
    backgroundColor: colors.accent + '22',
    borderColor: colors.accent,
  },
  chipText: { color: colors.textPrimary, fontWeight: '600' },
  chipTextActive: { color: colors.accent },

  errorBanner: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ff386020',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ff6b81',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: { color: '#ff6b81', fontWeight: '600' },
  retryText: { color: colors.accent, fontWeight: '700' },

  listContent: { paddingBottom: 24, paddingHorizontal: 10 },

  initialLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyIcon: { fontSize: 42, marginBottom: 8 },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  emptySubtitle: { color: colors.textSecondary, marginTop: 4 },
});