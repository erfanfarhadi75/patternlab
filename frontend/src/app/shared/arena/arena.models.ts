import { ArenaRelation } from '../../core/models/models';

export interface ArenaPieceDef {
  id: string;
  label: Record<string, string>;
  hint: Record<string, string>;
  distractor?: boolean;
}

export interface ArenaExpectedEdge {
  from: string;
  to: string;
  relation: ArenaRelation;
}

export interface ArenaAnimStep {
  pieceIds: string[];
  message: Record<string, string>;
}

/** Grid slot for Solve-it placement (UML-style rows/cols). */
export interface ArenaSolveSlot {
  col: number;
  row: number;
}

export interface BlockChallenge {
  patternId: string;
  pieces: ArenaPieceDef[];
  requiredPieceIds: string[];
  expectedEdges: ArenaExpectedEdge[];
  relations: ArenaRelation[];
  animation: ArenaAnimStep[];
  brief: Record<string, string>;
  /** Optional neat diagram slots used by Solve it. */
  solveLayout?: Record<string, ArenaSolveSlot>;
}

export interface CodeBlank {
  id: string;
  choices: string[];
  correct: string;
}

export interface CodeChallenge {
  patternId: string;
  title: Record<string, string>;
  brief: Record<string, string>;
  /** Use {{blankId}} placeholders in lines */
  lines: string[];
  blanks: CodeBlank[];
}

export interface RefactorMove {
  id: string;
  label: Record<string, string>;
  correct: boolean;
}

export interface RefactorChallenge {
  patternId: string;
  title: Record<string, string>;
  smell: Record<string, string>;
  moves: RefactorMove[];
  /** Minimum correct moves that must be selected; incorrect selections penalize */
  minCorrect: number;
}

export interface PlacedBlock {
  instanceId: string;
  pieceId: string;
  x: number;
  y: number;
}

export interface CanvasEdge {
  id: string;
  fromInstanceId: string;
  toInstanceId: string;
  relation: ArenaRelation;
}
