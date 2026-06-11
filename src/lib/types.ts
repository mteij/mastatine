export interface Tower {
  id: string;
  title: string;
  description: string | null;
  submitter_name: string;
  image_url: string;
  vote_count: number;
  created_at: string;
}

export interface Vote {
  id: string;
  tower_id: string;
  voter_id: string;
  created_at: string;
}
