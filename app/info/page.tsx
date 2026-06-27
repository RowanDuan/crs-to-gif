import { cookies, headers } from 'next/headers';

export default async function Info() {
  const h = await headers();
  const lang = h.get('accept-language');
  const token = (await cookies()).get('auth_token')?.value;

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">请求头与 Cookie</h1>
      <pre>{JSON.stringify({ lang, hasToken: !!token }, null, 2)}</pre>
    </main>
  );
}
