export const FILE_SYSTEM_QUERY_KEYS = {
  all: () => ["fs"] as const,
  directory: (path: string) => ["fs", path] as const,
} as const;
