export type Position = 'ATTACK' | 'MIDFIELD' | 'DEFENSE';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Player {
  id: string;
  name: string;
  position: Position;
  grade: Grade;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
} 