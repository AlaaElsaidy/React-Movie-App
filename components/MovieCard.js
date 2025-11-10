import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const POSTER_URL = 'https://image.tmdb.org/t/p/w500';

export default function MovieCard({ movie, onToggleFavorite, isFavorite, onPress }) {
  if (!movie) return null;

  const posterUri = movie.poster_path ? POSTER_URL + movie.poster_path : null;
  const year = movie.release_date ? String(movie.release_date).slice(0, 4) : null;
  const rating =
    typeof movie.vote_average === 'number'
      ? movie.vote_average.toFixed(1)
      : movie.vote_average
      ? Number(movie.vote_average).toFixed(1)
      : null;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.textSecondary + '22' }}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.98 },
      ]}
    >
      <View style={styles.posterWrap}>
        {posterUri ? (
          <Image source={{ uri: posterUri }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderEmoji}>🎬</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => onToggleFavorite(movie)}
          style={[styles.favoriteBtn, isFavorite && styles.favoriteBtnActive]}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? '#fff' : '#fff'}
          />
        </TouchableOpacity>

        {rating && (
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={12} color={colors.accent} />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>

        <View style={styles.metaRow}>
          {!!year && <Text style={styles.meta}>{year}</Text>}
          {!!movie.original_language && <View style={styles.dot} />}
          {!!movie.original_language && (
            <Text style={styles.meta}>{String(movie.original_language).toUpperCase()}</Text>
          )}
          {!!movie.vote_count && <View style={styles.dot} />}
          {!!movie.vote_count && <Text style={styles.meta}>{movie.vote_count} votes</Text>}
        </View>

        {!!movie.overview && (
          <Text style={styles.blurb} numberOfLines={2}>
            {movie.overview}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const POSTER_W = 110;
const POSTER_H = 160;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textSecondary + '22',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 2 },
    }),
  },

  posterWrap: {
    width: POSTER_W,
    height: POSTER_H,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  poster: {
    width: POSTER_W,
    height: POSTER_H,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 22, opacity: 0.8 },

  favoriteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  favoriteBtnActive: {
    backgroundColor: colors.accent,
  },

  ratingPill: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: { color: 'white', fontWeight: '800', fontSize: 12 },

  info: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    opacity: 0.6,
  },
  blurb: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});