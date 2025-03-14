export interface Player {
  id: string;
  name: string;
  position: 'ATTACK' | 'MIDFIELD' | 'DEFENSE';
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
} 