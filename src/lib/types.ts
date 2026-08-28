export interface Tower {
  id: string;
  title: string;
  description: string | null;
  submitter_name: string;
  image_url: string;
  height: number | null;
  vote_count: number;
  created_at: string;
}

export interface Vote {
  id: string;
  tower_id: string;
  voter_id: string;
  created_at: string;
}

export interface MastSlide {
  id: string;
  title: string;
  image_url: string;
  submitter_name: string;
  vote_count: number;
  monthly_votes: number;
  description: string | null;
  height: number | null;
  created_at: string;
}
