const EMAIL_RE = /^[a-z0-9._+-]+@khi\.iba\.edu\.pk$/i;
const NICK_RE = /^[a-z0-9 ]+$/i;

/** Only exactly @khi.iba.edu.pk (case-insensitive, no subdomains). */
export function isValidUniEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function emailError(email: string): string | null {
  const e = email.trim();
  if (!e) return 'Enter your university email.';
  if (!isValidUniEmail(e)) return 'Use your IBA email. It must end with @khi.iba.edu.pk.';
  return null;
}

/** 3 to 16 letters, numbers or spaces, and not only digits. */
export function nicknameError(nickname: string, taken: string[] = []): string | null {
  const n = nickname.trim();
  if (n.length < 3 || n.length > 16) return 'Your nickname must be 3 to 16 characters.';
  if (!NICK_RE.test(n)) return 'Use only letters, numbers and spaces.';
  if (!/[a-z]/i.test(n)) return 'Add at least one letter. Numbers only is not allowed.';
  if (taken.some((t) => t.toLowerCase() === n.toLowerCase())) return 'Someone already uses this nickname. Try another.';
  return null;
}
