export interface ListData {
  title: string;
  items: ListItem[];
}

export interface ListItem {
  title: string;
  year: string;
  runtime: string;
  directors?: string[];
  genres: string[];
  metascore: string;
  rating: number;
  rated?: string;
  stars?: string[];
  image?: string;
  itemIdx?: number;
  description: string;
}
