export type UserStatus = "green" | "yellow" | "red";

export type Gender =
  | "male"
  | "female"
  | "non-binary"
  | "other"
  | "prefer-not-to-say";

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  status: UserStatus;
  age: number | null;
  gender: Gender | null;
  created_at: string;
  updated_at: string;
};

export type Interest = {
  id: string;
  name: string;
  created_at: string;
};

export type ProfileInterest = {
  id: string;
  profile_id: string;
  interest_id: string;
  created_at: string;
};
