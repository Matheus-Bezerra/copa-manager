import { z } from '@/lib/zod';
import { validateLowercase } from '@/utils/validators/validate-lowercase';
import { validateNumeric } from '@/utils/validators/validate-numeric';
import { validateSpecialChar } from '@/utils/validators/validate-special-char';
import { validateUppercase } from '@/utils/validators/validate-uppercase';

export const passwordSchema = z
  .string()
  .min(6, { error: 'A senha deve ter no mínimo 6 caracteres' })
  .refine(validateUppercase, {
    error: 'A senha deve conter ao menos uma letra maiúscula',
  })
  .refine(validateLowercase, {
    error: 'A senha deve conter ao menos uma letra minúscula',
  })
  .refine(validateNumeric, {
    error: 'A senha deve conter ao menos um número',
  })
  .refine(validateSpecialChar, {
    error: 'A senha deve conter ao menos um símbolo',
  });
