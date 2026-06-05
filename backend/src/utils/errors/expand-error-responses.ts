import type { z } from '@/lib/zod';

type ErrorShorthands = {
  '4xx'?: z.ZodTypeAny;
  '5xx'?: z.ZodTypeAny;
};

export function expandErrorResponses<T extends Record<number, z.ZodTypeAny>>(
  successResponses: T,
  errorResponses: ErrorShorthands = {}
): Record<number, z.ZodTypeAny> {
  const { '4xx': error4xx, '5xx': error5xx } = errorResponses;
  const expanded: Record<number, z.ZodTypeAny> = { ...successResponses };

  if (error4xx) {
    expanded[400] = error4xx;
    expanded[401] = error4xx;
    expanded[403] = error4xx;
    expanded[404] = error4xx;
    expanded[409] = error4xx;
  }

  if (error5xx) {
    expanded[500] = error5xx;
  }

  return expanded;
}
