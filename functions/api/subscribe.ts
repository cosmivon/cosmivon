interface Env {
  WEBHOOK_URL: string;
  WEBHOOK_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const body = await ctx.request.json<{email?: string}>();
    const email = (body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response('Invalid email', {status: 400});
    }
    const res = await fetch(ctx.env.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cosmivon-Secret': ctx.env.WEBHOOK_SECRET,
      },
      body: JSON.stringify({email, source: 'landing'}),
    });
    if (!res.ok) return new Response('Upstream error', {status: 502});
    return new Response(JSON.stringify({ok: true}), {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    });
  } catch (e) {
    return new Response('Bad request', {status: 400});
  }
};
