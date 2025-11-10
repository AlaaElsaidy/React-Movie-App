import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Share,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const POSTER_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/w780';
const PROFILE_URL = 'https://image.tmdb.org/t/p/w185';
const API_KEY = '82f823b60a578d4233a3902227a3f1e2';

const USE_INLINE_HEADER = true;

export default function DetailsScreen({ movie, favorites, onToggleFavorite, navigateBack }) {
  if (!movie) return null;

  const [details, setDetails] = useState(movie);
  const [videos, setVideos] = useState([]);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewExpanded, setOverviewExpanded] = useState(false);

  const isFavorite = favorites.some((f) => f.id === movie.id);

  useEffect(() => {
    let mounted = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&append_to_response=videos,credits`
        );
        if (!mounted) return;
        setDetails(res.data || movie);
        setVideos(res.data?.videos?.results || []);
        setCast((res.data?.credits?.cast || []).slice(0, 12));
      } catch (e) {
        console.error(e);
        if (mounted) setError('Failed to load details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      mounted = false;
    };
  }, [movie?.id]);

  const backdrop = details.backdrop_path || details.poster_path;
  const poster = details.poster_path ? POSTER_URL + details.poster_path : null;
  const backdropUri = backdrop ? BACKDROP_URL + backdrop : null;

  const year = details.release_date ? String(details.release_date).slice(0, 4) : '—';
  const rating = details.vote_average ? details.vote_average.toFixed(1) : '—';
  const runtimeText = useMemo(() => formatRuntime(details.runtime), [details.runtime]);

  const trailer = useMemo(() => {
    const yt = (videos || []).filter((v) => v.site === 'YouTube');
    return (
      yt.find((v) => v.type === 'Trailer') ||
      yt.find((v) => v.type === 'Teaser') ||
      yt[0]
    );
  }, [videos]);

  const onShare = async () => {
    try {
      const url = `https://www.themoviedb.org/movie/${movie.id}`;
      await Share.share({
        message: `${details.title}${year ? ` (${year})` : ''}\n${url}`,
      });
    } catch {}
  };

  const openTrailer = () => {
    if (!trailer?.key) return;
    Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
  };

  const openHomepage = () => {
    if (details.homepage) Linking.openURL(details.homepage);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {backdropUri ? (
            <Image source={{ uri: backdropUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
            </View>
          )}

          <View style={styles.heroShadeTop} />
          <View style={styles.heroShadeBottom} />

          {USE_INLINE_HEADER && (
            <View style={styles.heroBar}>
              <TouchableOpacity onPress={navigateBack} style={styles.iconBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={onShare} style={styles.iconBtn} hitSlop={8}>
                  <Ionicons name="share-outline" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onToggleFavorite(details)}
                  style={styles.iconBtn}
                  hitSlop={8}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={isFavorite ? colors.accent : '#fff'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{details.title}</Text>
          {!!details.tagline && <Text style={styles.tagline}>"{details.tagline}"</Text>}

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={styles.metaText}>{rating}</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.metaDim}>{year}</Text>
            {!!runtimeText && <View style={styles.dot} />}
            {!!runtimeText && <Text style={styles.metaDim}>{runtimeText}</Text>}
            {details.original_language && <View style={styles.dot} />}
            {details.original_language && (
              <Text style={styles.metaDim}>{details.original_language.toUpperCase()}</Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {trailer?.key && (
              <TouchableOpacity style={styles.cta} onPress={openTrailer} activeOpacity={0.9}>
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.ctaText}>Watch Trailer</Text>
              </TouchableOpacity>
            )}
            {details.homepage ? (
              <TouchableOpacity
                style={[styles.cta, styles.ctaGhost]}
                onPress={openHomepage}
                activeOpacity={0.9}
              >
                <Ionicons name="open-outline" size={16} color={colors.accent} />
                <Text style={[styles.ctaText, { color: colors.accent }]}>Website</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.cta, styles.ctaGhost]}
                onPress={() => Linking.openURL(`https://www.themoviedb.org/movie/${movie.id}`)}
                activeOpacity={0.9}
              >
                <Ionicons name="open-outline" size={16} color={colors.accent} />
                <Text style={[styles.ctaText, { color: colors.accent }]}>TMDb</Text>
              </TouchableOpacity>
            )}
          </View>

          {!!(details.genres && details.genres.length) && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              <View style={styles.chipsRow}>
                {details.genres.map((g) => (
                  <View key={g.id} style={styles.chip}>
                    <Text style={styles.chipText}>{g.name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>Overview</Text>
          <Text
            style={styles.overview}
            numberOfLines={overviewExpanded ? undefined : 5}
          >
            {details.overview || 'No overview available.'}
          </Text>
          {details.overview && details.overview.length > 220 && (
            <TouchableOpacity onPress={() => setOverviewExpanded((v) => !v)}>
              <Text style={styles.readMore}>{overviewExpanded ? 'Show less' : 'Read more'}</Text>
            </TouchableOpacity>
          )}

          {!!cast.length && (
            <>
              <Text style={styles.sectionTitle}>Top Cast</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castRow}
              >
                {cast.map((c) => (
                  <View key={c.cast_id || `${c.id}-${c.credit_id}`} style={styles.castItem}>
                    {c.profile_path ? (
                      <Image
                        source={{ uri: PROFILE_URL + c.profile_path }}
                        style={styles.castAvatar}
                      />
                    ) : (
                      <View style={[styles.castAvatar, styles.castPlaceholder]}>
                        <Text style={styles.castInitials}>{initials(c.name)}</Text>
                      </View>
                    )}
                    <Text numberOfLines={1} style={styles.castName}>
                      {c.name}
                    </Text>
                    {!!c.character && (
                      <Text numberOfLines={1} style={styles.castRole}>
                        {c.character}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <View style={styles.factsGrid}>
            {details.status && (
              <FactItem label="Status" value={details.status} />
            )}
            {details.budget ? (
              <FactItem label="Budget" value={formatCurrency(details.budget)} />
            ) : null}
            {details.revenue ? (
              <FactItem label="Revenue" value={formatCurrency(details.revenue)} />
            ) : null}
            {details.popularity ? (
              <FactItem label="Popularity" value={Math.round(details.popularity)} />
            ) : null}
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => { /* retry by re-mounting effect */ }}>
                <Text style={styles.retryText}>Pull to retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
    </View>
  );
}

function FactItem({ label, value }) {
  return (
    <View style={styles.factItem}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={1}>
        {String(value)}
      </Text>
    </View>
  );
}

function formatRuntime(mins) {
  if (!mins || isNaN(mins)) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function formatCurrency(v) {
  try {
    if (!v) return '$0';
    return '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } catch {
    return `$${v}`;
  }
}

function initials(name = '') {
  const parts = name.trim().split(' ').slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join('');
}

const HERO_HEIGHT = 420;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, },

  hero: {
  
    height: HERO_HEIGHT,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 42, opacity: 0.85 },

  heroShadeTop: {
    position: 'absolute',
    top: 0,
    left: 0, right: 0,
    height: 140,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroShadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  heroBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  content: { paddingHorizontal: 14, paddingTop: 12 },

  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  tagline: { marginTop: 4, color: colors.textSecondary, fontStyle: 'italic' },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textSecondary + '44',
  },
  metaText: { color: colors.textPrimary, fontWeight: '700', fontSize: 13 },
  metaDim: { color: colors.textSecondary, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaText: { color: 'white', fontWeight: '800' },
  ctaGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
  },

  chipsRow: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.textSecondary + '44',
  },
  chipText: { color: colors.textPrimary, fontWeight: '600' },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontWeight: '800',
    fontSize: 16,
    color: colors.textPrimary,
  },
  overview: { color: colors.textSecondary, lineHeight: 20, fontSize: 14 },
  readMore: { marginTop: 6, color: colors.accent, fontWeight: '700' },

  castRow: { paddingVertical: 6 },
  castItem: { width: 88, marginRight: 10, alignItems: 'center' },
  castAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
  },
  castPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  castInitials: { color: colors.textSecondary, fontWeight: '800' },
  castName: { color: colors.textPrimary, fontWeight: '700', marginTop: 6, fontSize: 12 },
  castRole: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },

  factsGrid: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textSecondary + '33',
    rowGap: 10,
  },
  factItem: { marginBottom: 6 },
  factLabel: { color: colors.textSecondary, fontSize: 12, marginBottom: 2 },
  factValue: { color: colors.textPrimary, fontWeight: '700' },

  errorBanner: {
    marginTop: 12,
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

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background + 'AA',
  },
});