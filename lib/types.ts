export interface Comment {
  id: string;
  username: string;
  text: string;
  createdAt: number;
}

export interface Post {
  id: string;
  text: string;
  imageDataUrl?: string;
  createdAt: number;
  likeCount: number;
  comments: Comment[];
}
