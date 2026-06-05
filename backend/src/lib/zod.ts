import { z, config } from 'zod';

config({
  customError: (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        if (issue.input === undefined) {
          return 'Campo obrigatório';
        }
        return `Tipo inválido. Esperado ${issue.expected}`;
      case 'invalid_format':
        if (issue.format === 'email') {
          return 'E-mail inválido';
        }
        break;
      case 'too_small':
        if (issue.origin === 'string') {
          return `Deve conter no mínimo ${issue.minimum} caractere(s)`;
        }
        break;
    }

    return undefined;
  },
});

export { z };
