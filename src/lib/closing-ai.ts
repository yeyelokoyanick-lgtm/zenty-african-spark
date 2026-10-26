// Logique pure de l'assistant d'appel de l'Espace Closing (prompt + parsing).
// Aucun appel réseau ici : ces fonctions sont testables et réutilisables côté serveur.

export type CallOutcome = 'reached' | 'voicemail' | 'no_answer' | 'busy';

export const callOutcomes: { id: CallOutcome; label: string }[] = [
  { id: 'reached', label: 'Client joint' },
  { id: 'voicemail', label: 'Messagerie vocale' },
  { id: 'no_answer', label: 'Pas de réponse' },
  { id: 'busy', label: 'Occupé / raccroché' },
];

export type CallNoteInput = {
  prospectName: string;
  productName: string;
  status: string;
  previousNotes: string;
  outcome: CallOutcome;
  note: string;
  closerName: string;
};

export type ClosingAdvice = {
  nextAction: string;
  suggestedStatus: 'new' | 'contacted' | 'interested' | 'converted' | 'lost';
  reminderDelayDays: number;
  message: string;
};

const validStatuses = ['new', 'contacted', 'interested', 'converted', 'lost'] as const;

export function buildCallPrompt(input: CallNoteInput): string {
  const outcomeLabel = callOutcomes.find((o) => o.id === input.outcome)?.label ?? input.outcome;
  return [
    'Tu es un coach de vente expert du e-commerce africain (vente par WhatsApp, paiement à la livraison).',
    'Un closer vient de terminer un appel avec un prospect. À partir de sa note d’appel, tu dois :',
    '1. Recommander la prochaine action concrète (une phrase impérative).',
    '2. Suggérer le statut du prospect parmi : new, contacted, interested, converted, lost.',
    '3. Suggérer un délai de relance en jours (0 = aujourd’hui, max 14).',
    '4. Rédiger un message de relance WhatsApp personnalisé, chaleureux, en français, max 60 mots,',
    '   avec le prénom du prospect et le produit, sans lien, prêt à envoyer.',
    '',
    'Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, avec exactement ces clés :',
    '{"nextAction": string, "suggestedStatus": string, "reminderDelayDays": number, "message": string}',
    '',
    'Contexte :',
    `- Prospect : ${input.prospectName}`,
    `- Produit : ${input.productName || 'non précisé'}`,
    `- Statut actuel : ${input.status}`,
    `- Issue de l’appel : ${outcomeLabel}`,
    `- Closer : ${input.closerName || 'l’équipe'}`,
    `- Notes précédentes : ${input.previousNotes || 'aucune'}`,
    `- Note d’appel du closer : ${input.note}`,
  ].join('\n');
}

export function parseAdvice(raw: string): ClosingAdvice {
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Réponse IA illisible');
  const parsed = JSON.parse(match[0]) as Record<string, unknown>;
  const status = validStatuses.includes(parsed.suggestedStatus as (typeof validStatuses)[number])
    ? (parsed.suggestedStatus as ClosingAdvice['suggestedStatus'])
    : 'contacted';
  const delay = Number(parsed.reminderDelayDays);
  return {
    nextAction: String(parsed.nextAction ?? '').trim().slice(0, 300),
    suggestedStatus: status,
    reminderDelayDays: Number.isFinite(delay) ? Math.min(14, Math.max(0, Math.round(delay))) : 1,
    message: String(parsed.message ?? '').trim().slice(0, 1000),
  };
}

export function extractResponseText(response: unknown): string {
  const output = (response as { output?: unknown[] })?.output;
  if (!Array.isArray(output)) return '';
  const parts: string[] = [];
  for (const item of output) {
    const content = (item as { content?: unknown[] })?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      const b = block as { type?: string; text?: string };
      if (b.type === 'output_text' && typeof b.text === 'string') parts.push(b.text);
    }
  }
  return parts.join('\n');
}
