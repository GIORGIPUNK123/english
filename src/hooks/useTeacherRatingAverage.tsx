import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';

export const useTeacherRatingAverage = ({
  enabled = true,
  refetchWhenKey,
}: {
  enabled?: boolean;
  refetchWhenKey?: string | number;
}) => {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setAverage(0);
      setCount(0);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const fn = httpsCallable<
          Record<string, never>,
          { average: number; count: number }
        >(functions, 'getTeacherRatingAverage');
        const result = await fn({});
        if (cancelled) return;
        setAverage(result.data?.average ?? 0);
        setCount(result.data?.count ?? 0);
      } catch {
        if (cancelled) return;
        setAverage(0);
        setCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, refetchWhenKey]);

  return { average, count, loading };
};
