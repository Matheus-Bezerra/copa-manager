export const SUPPORT_WHATSAPP_NUMBER = '5511976611929';

export const SUPPORT_WHATSAPP_MESSAGE = 'Olá, preciso de ajuda com o Copa Manager.';

export function getSupportWhatsAppUrl() {
  const params = new URLSearchParams({ text: SUPPORT_WHATSAPP_MESSAGE });
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?${params.toString()}`;
}
