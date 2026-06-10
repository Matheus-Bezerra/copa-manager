import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { EmailHeader } from '@/emails/components/email-header';

export interface PasswordResetEmailProps {
  userName: string;
  code: string;
  expiresInMinutes: number;
}

export function PasswordResetEmail({ userName, code, expiresInMinutes }: PasswordResetEmailProps) {
  return (
    <Html>
      <Preview>Seu código de redefinição de senha — Copa Manager</Preview>

      <Tailwind>
        <Head />

        <Body className="bg-gray-100 py-10 px-5 font-sans">
          <Container className="mx-auto max-w-lg rounded-2xl bg-white px-8 py-8">
            <EmailHeader />

            <Container className="mt-8 space-y-4 text-center">
              <Text className="m-0 text-xl text-gray-800">
                Olá, <span className="font-bold">{userName}</span>!
              </Text>

              <Text className="m-0 text-base text-gray-600">
                Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:
              </Text>

              <Section className="my-6 rounded-xl bg-gray-50 py-6">
                <Text className="m-0 text-4xl font-bold tracking-[0.3em] text-[#16a34a]">{code}</Text>
              </Section>

              <Text className="m-0 text-sm text-gray-500">
                Este código expira em {expiresInMinutes} minutos.
              </Text>

              <Text className="m-0 text-sm text-gray-500">
                Se você não solicitou esta alteração, ignore este e-mail.
              </Text>
            </Container>

            <Section className="mt-8 border-t border-gray-200 pt-6">
              <Text className="m-0 text-left text-sm text-gray-600">
                Atenciosamente,
                <br />
                Equipe <span className="font-bold">Copa Manager</span>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PasswordResetEmail;
