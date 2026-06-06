import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

export interface InvitationEmailProps {
  championshipName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
}

function formatRole(role: string): string {
  const roleLabels: Record<string, string> = {
    ADMINISTRATOR: 'Administrador',
    ORGANIZER: 'Organizador',
  };

  return roleLabels[role] ?? role;
}

function formatExpirationDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export function InvitationEmail({
  championshipName,
  role,
  inviteUrl,
  expiresAt,
}: InvitationEmailProps) {
  return (
    <Html>
      <Preview>Convite para participar do campeonato {championshipName} — Copa Manager</Preview>

      <Tailwind>
        <Head />

        <Body className="bg-gray-100 py-10 px-5 font-sans">
          <Container className="mx-auto max-w-lg rounded-2xl bg-white px-8 py-8">
            <Section className="rounded-3xl bg-[#16a34a] py-6 text-center">
              <Text className="m-0 text-2xl font-bold tracking-wide text-white">Copa Manager</Text>
            </Section>

            <Container className="mt-8 space-y-4 text-center">
              <Text className="m-0 text-xl text-gray-800">
                Você foi convidado para o campeonato{' '}
                <span className="font-bold">{championshipName}</span>
              </Text>

              <Text className="m-0 text-base text-gray-600">
                Papel atribuído: <span className="font-semibold">{formatRole(role)}</span>
              </Text>

              <Text className="m-0 text-base text-gray-600">
                Clique no botão abaixo para aceitar o convite. Você precisará estar logado com o
                e-mail que recebeu este convite.
              </Text>

              <Section className="my-6">
                <Button
                  href={inviteUrl}
                  className="rounded-lg bg-[#16a34a] px-6 py-3 text-base font-semibold text-white no-underline"
                >
                  Aceitar convite
                </Button>
              </Section>

              <Text className="m-0 text-sm text-gray-500">
                Este convite expira em {formatExpirationDate(expiresAt)}.
              </Text>

              <Text className="m-0 text-sm text-gray-500">
                Se você não esperava este convite, ignore este e-mail.
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

export default InvitationEmail;
