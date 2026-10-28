import { useCallback, useEffect, useState } from 'react';

type Resource<T> = { status: 'loading' } | { status: 'ready'; data: T } | { status: 'error' };
/** Ignore late responses after a filter/ID changes or the screen unmounts. */
export function useAsyncResource<T>(load: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const [record, setRecord] = useState<{ owner: typeof load; attempt: number; result: Resource<T> }>(() => ({ owner: load, attempt: 0, result: { status: 'loading' } }));
  useEffect(() => {
    let current = true;
    Promise.resolve().then(load).then(data => {
      if (current) setRecord({ owner: load, attempt, result: { status: 'ready', data } });
    }).catch(() => {
      if (current) setRecord({ owner: load, attempt, result: { status: 'error' } });
    });
    return () => { current = false; };
  }, [load, attempt]);
  const retry = useCallback(() => setAttempt(value => value + 1), []);
  const result: Resource<T> = record.owner === load && record.attempt === attempt ? record.result : { status: 'loading' };
  return { result, retry };
}
