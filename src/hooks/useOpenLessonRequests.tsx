import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase-config';
import { LessonT } from '../types';
import {
  discoverableLessonToLessonT,
  DiscoverableLessonDto,
} from '../utils/discoverableLessonUtils';

export const useOpenLessonRequests = ({
  enabled = true,
  refetchWhenKey,
}: {
  enabled?: boolean;
  refetchWhenKey?: string;
}) => {
  const [lessons, setLessons] = useState<LessonT[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLessons([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchOpenLessonRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const listOpenLessonRequests = httpsCallable<
          Record<string, never>,
          { lessons: DiscoverableLessonDto[] }
        >(functions, 'listOpenLessonRequests');

        const result = await listOpenLessonRequests({});
        if (cancelled) return;

        const dtos = result.data?.lessons || [];
        setLessons(dtos.map(discoverableLessonToLessonT));
      } catch {
        if (cancelled) return;
        setLessons([]);
        setError('Failed to load open lesson requests.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOpenLessonRequests();

    return () => {
      cancelled = true;
    };
  }, [enabled, refetchWhenKey]);

  return { lessons, loading, error };
};
