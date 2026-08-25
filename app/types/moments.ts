export interface MoviePayload {
  id: number
  title: string
  year: string
  overview: string
  posterPath: string | null
  rating: number
  genres: string[]
}

export interface LinkPayload {
  url: string
  title: string
  description: string
  image: string | null
  siteName: string | null
}

export interface MomentAuthor {
  id: string
  name: string
  image: string | null
}

export interface Moment {
  id: string
  authorId: string
  author: MomentAuthor
  content: string
  images: string[]
  movie: MoviePayload | null
  link: LinkPayload | null
  createdAt: number
  updatedAt: number
  likeCount: number
  commentCount: number
  likedByMe: boolean
}
