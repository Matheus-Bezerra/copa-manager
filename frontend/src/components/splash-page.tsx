import { Loader2Icon } from 'lucide-react';

export function SplashPage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img src="/static/logo.png" alt="Copa Manager" className="size-12 opacity-80" />
        <Loader2Icon className="text-link size-6 animate-spin" />
      </div>
    </div>
  );
}
