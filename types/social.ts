export type Like = {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
};

export type IncomingLike = {
  like_id: string;
  liker_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  created_at: string;
};

export type Match = {
  match_id: string;
  matched_at: string;
  other_user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  age: number | null;
  gender: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  unread_count: number;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export type LikeStatus = {
  i_liked: boolean;
  they_liked: boolean;
  is_matched: boolean;
  match_id: string | null;
};

export type CreateLikeResult = {
  like_id: string | null;
  is_mutual: boolean;
  match_id: string | null;
};
