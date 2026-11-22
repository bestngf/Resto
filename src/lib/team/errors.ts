import { humanError } from "@/lib/dashboard/errors";
// Les codes « limite_equipe » et « non_autorise » sont documentés par l'agent 1 ; les autres sont des formulations
// probables, reconnues par mots-clés (à confirmer avec l'agent 1, voir DEMANDES).
const MAP: [RegExp, string][] = [
  [/limite_equipe/i, "Votre formule limite le nombre de membres de l'équipe. Retirez un membre ou passez à une formule supérieure."],
  [/dernier_patron|last_owner|last owner/i, "Impossible : il doit toujours rester au moins un patron."],
  [/role_interdit|patron_interdit|forbidden_role/i, "Seul un patron peut attribuer ou modifier le rôle de patron."],
  [/code_invalide|invite_invalide|invalid_code|invalid code/i, "Ce code d'invitation n'existe pas. Vérifie le lien ou demande-en un nouveau à ton patron."],
  [/invitation_desactivee|invite_inactive|invite_disabled|desactiv/i, "Cette invitation est désactivée. Demande à ton patron de la réactiver."],
  [/deja_membre|already_member/i, "Tu fais déjà partie de cette équipe."],
  [/demande_existante|deja_demande|already_requested/i, "Tu as déjà envoyé une demande pour ce restaurant. Elle attend la réponse du patron."],
  [/non_autorise/i, "Vous n'avez pas le droit de faire cette action."],
];
export function teamError(e: unknown): string {
  const msg = String((e as { message?: string })?.message ?? "");
  for (const [re, text] of MAP) if (re.test(msg)) return text;
  return humanError(e);
}
