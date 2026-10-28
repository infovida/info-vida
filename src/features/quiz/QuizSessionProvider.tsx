import { createContext, useContext, useReducer, useRef, type PropsWithChildren } from 'react';

import type { QuizCategory, QuizQuestion } from '../../domain/quiz';
import { createDemoQuizSession, reduceQuizSession, type DemoQuizSession, type QuizSessionAction } from '../../domain/quizSession';

type Action = { type: 'start'; session: DemoQuizSession } | { type: 'discard'; id: string } | { type: 'update'; id: string; action: QuizSessionAction };
function reducer(state: Record<string, DemoQuizSession>, action: Action) {
  if (action.type === 'start') {
    // Keep only a small in-memory history. No attempt is written to a device/account.
    return Object.fromEntries([...Object.entries(state), [action.session.id, action.session]].slice(-20));
  }
  if (action.type === 'discard') return Object.fromEntries(Object.entries(state).filter(([id]) => id !== action.id));
  const session = state[action.id];
  return session ? { ...state, [action.id]: reduceQuizSession(session, action.action) } : state;
}
const Context = createContext<{
  sessions: Record<string, DemoQuizSession>;
  start: (category: QuizCategory, questions: readonly QuizQuestion[], mode: 'category' | 'random') => string;
  update: (id: string, action: QuizSessionAction) => void; discard: (id: string) => void;
} | null>(null);
export function QuizSessionProvider({ children }: PropsWithChildren) {
  const [sessions, dispatch] = useReducer(reducer, {});
  const counter = useRef(0);
  return <Context.Provider value={{ sessions,
    start: (category, questions, mode) => {
      const id = `demo-${Date.now().toString(36)}-${++counter.current}`;
      const session = createDemoQuizSession(id, category, questions, mode);
      dispatch({ type: 'start', session }); return id;
    },
    update: (id, action) => dispatch({ type: 'update', id, action }),
    discard: id => dispatch({ type: 'discard', id }),
  }}>{children}</Context.Provider>;
}
export function useQuizSessions() {
  const value = useContext(Context);
  if (!value) throw new Error('QuizSessionProvider ausente');
  return value;
}
