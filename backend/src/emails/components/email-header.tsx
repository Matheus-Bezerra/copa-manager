import { Img, Section } from '@react-email/components';
import { EMAIL_LOGO_FULL_CID } from '@/emails/email-inline-assets';

export function EmailHeader() {
  return (
    <Section className="text-center">
      <Img
        src={`cid:${EMAIL_LOGO_FULL_CID}`}
        alt="Copa Manager — Organize. Compita. Celebre."
        width={140}
        style={{
          display: 'block',
          margin: '0 auto',
          maxWidth: '140px',
          height: 'auto',
        }}
      />
    </Section>
  );
}
