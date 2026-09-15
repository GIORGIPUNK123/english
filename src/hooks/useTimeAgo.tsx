import { useEffect, useState } from 'react';

export const formatTimeAgo = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return `${Math.floor(diff)} seconds ago`;
  if (diff < 120) return '1 minute ago';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 7200) return '1 hour ago';
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return '1 day ago';
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 1209600) return '1 week ago';
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
  if (diff < 5184000) return '1 month ago';
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
  if (diff < 63072000) return '1 year ago';
  return `${Math.floor(diff / 31536000)} years ago`;
};

/** Returns a relative time string that refreshes about once a minute. */
export const useTimeAgo = (timestamp: number): string => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [timestamp]);

  return formatTimeAgo(timestamp);
};
