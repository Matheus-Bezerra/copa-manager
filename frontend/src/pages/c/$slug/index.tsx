import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/c/$slug/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/c/$slug/standings',
      params: { slug: params.slug },
    });
  },
});
