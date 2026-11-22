import JoinFlow from "./_components/JoinFlow";

type SP = Promise<{ invite?: string; code?: string }>;

export default async function Page({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  // « invite » est le paramètre officiel. « code » est accepté s'il ressemble à un code d'invitation court
  // (au retour du lien magique, Supabase ajoute son propre ?code= beaucoup plus long : il est ignoré).
  const raw = sp.invite ?? (sp.code && sp.code.length <= 24 ? sp.code : "");
  const invite = /^[A-Za-z0-9_-]{4,64}$/.test(raw) ? raw : "";
  return <JoinFlow invite={invite} />;
}
