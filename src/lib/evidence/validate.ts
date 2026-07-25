import type {
  Call1Output,
  Call2Output,
  Comment,
  GuardrailFinding,
  Segment,
} from "@/lib/schemas";

export function filterValidEvidenceIds(
  ids: string[],
  comments: Comment[],
): string[] {
  const valid = new Set(comments.map((c) => c.id));
  return [...new Set(ids.filter((id) => valid.has(id)))];
}

export function repairSegments(
  segments: Segment[],
  comments: Comment[],
): { segments: Segment[]; invalidIds: string[]; repaired: boolean } {
  const valid = new Set(comments.map((c) => c.id));
  const invalidIds: string[] = [];
  let repaired = false;

  const next = segments.map((segment) => {
    const kept: string[] = [];
    for (const id of segment.evidenceIds) {
      if (valid.has(id)) {
        kept.push(id);
      } else {
        invalidIds.push(id);
        repaired = true;
      }
    }
    // If model fabricated all IDs, attach first available comments as weak support
    if (kept.length === 0 && comments.length > 0) {
      repaired = true;
      kept.push(comments[0]!.id);
      if (comments[1]) kept.push(comments[1].id);
    }
    return { ...segment, evidenceIds: kept };
  });

  return { segments: next, invalidIds: [...new Set(invalidIds)], repaired };
}

export function repairCall1Evidence(
  output: Call1Output,
  comments: Comment[],
): { output: Call1Output; invalidIds: string[]; repaired: boolean } {
  const { segments, invalidIds, repaired } = repairSegments(
    output.segments,
    comments,
  );

  const guardrails: GuardrailFinding[] = output.guardrails.map((g) => ({
    ...g,
    relatedEvidenceIds: g.relatedEvidenceIds
      ? filterValidEvidenceIds(g.relatedEvidenceIds, comments)
      : undefined,
  }));

  return {
    output: { ...output, segments, guardrails },
    invalidIds,
    repaired,
  };
}

export function repairCall2Evidence(
  output: Call2Output,
  comments: Comment[],
): Call2Output {
  return {
    ...output,
    changeExplanations: output.changeExplanations.map((item) => ({
      ...item,
      evidenceIds: filterValidEvidenceIds(item.evidenceIds, comments),
    })),
  };
}

export function countEvidenceRefs(segments: Segment[]): number {
  return segments.reduce((sum, s) => sum + s.evidenceIds.length, 0);
}

export function allEvidenceValid(
  segments: Segment[],
  comments: Comment[],
): boolean {
  const valid = new Set(comments.map((c) => c.id));
  return segments.every((s) =>
    s.evidenceIds.every((id) => valid.has(id) && s.evidenceIds.length > 0),
  );
}
