const INVITE_CODE_PATTERN = /CREW-[A-Z0-9]+/i;

export function extractInviteCodeFromInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const directMatch = trimmed.match(INVITE_CODE_PATTERN);
  if (directMatch) {
    return directMatch[0].toUpperCase();
  }

  try {
    const parsed = new URL(trimmed);
    const params = ["invite", "inviteCode", "code"];

    for (const param of params) {
      const candidate = parsed.searchParams.get(param);
      if (!candidate) {
        continue;
      }

      const nestedMatch = candidate.match(INVITE_CODE_PATTERN);
      if (nestedMatch) {
        return nestedMatch[0].toUpperCase();
      }
    }

    const pathMatch = parsed.pathname.match(INVITE_CODE_PATTERN);
    if (pathMatch) {
      return pathMatch[0].toUpperCase();
    }
  } catch {
    return null;
  }

  return null;
}

export function createTeamInviteLink(baseUrl: string, inviteCode: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedInviteCode = inviteCode.trim().toUpperCase();

  return `${normalizedBaseUrl}/worker/teams?invite=${encodeURIComponent(normalizedInviteCode)}`;
}
