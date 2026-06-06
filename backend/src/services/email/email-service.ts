export interface SendPasswordResetEmailInput {
  to: string;
  name: string;
  code: string;
}

export interface EmailService {
  sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void>;
}
