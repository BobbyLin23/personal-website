interface TmdbMovie {
  id: number
  title: string
  release_date: string
  overview: string
  poster_path: string | null
  vote_average: number
  genre_ids: number[]
}

export interface TmdbSearchResult {
  id: number
  title: string
  year: string
  overview: string
  posterPath: string | null
  rating: number
  genres: string[]
}

const GENRE_IDS: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
}

export default defineEventHandler(async (event): Promise<{ results: TmdbSearchResult[] }> => {
  const query = getQuery(event).query
  const q = typeof query === 'string' ? query.trim() : ''
  if (!q) return { results: [] }

  const apiKey = useRuntimeConfig().tmdbApiKey as string
  if (!apiKey) {
    throw createError({ statusCode: 503, statusMessage: 'TMDB API key is not configured' })
  }

  const url = new URL('https://api.themoviedb.org/3/search/movie')
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('query', q)
  url.searchParams.set('language', 'en-US')
  url.searchParams.set('page', '1')

  const response = await $fetch<{ results: TmdbMovie[] }>(url.toString())
  const results = (response.results ?? []).slice(0, 8).map((movie) => ({
    id: movie.id,
    title: movie.title,
    year: (movie.release_date || '').split('-')[0] || '',
    overview: movie.overview || '',
    posterPath: movie.poster_path,
    rating: Math.round(movie.vote_average * 10) / 10,
    genres: movie.genre_ids.map((id) => GENRE_IDS[id] ?? '').filter(Boolean),
  }))

  return { results }
})
