/**
 * Profile completion for Freelancer users.
 * Matches required/optional fields used in complete-profile.tsx.
 */

export interface ProfileCompletionUser {
  role?: string;
  bio?: string;
  skills?: string[];
  phone?: string;
  hourlyRate?: number;
  currency?: string;
  profileImage?: string | null;
  portfolio?: Array<{ link?: string }> | string | null;
  languages?: unknown[];
}

export interface ProfileCompletionResult {
  percentage: number;
  isComplete: boolean;
}

const REQUIRED_WEIGHT = 70; // 70% for required fields
const OPTIONAL_WEIGHT = 30; // 30% for optional fields

function hasPortfolio(portfolio: ProfileCompletionUser['portfolio']): boolean {
  if (!portfolio) return false;
  if (typeof portfolio === 'string') return portfolio.trim().length > 0;
  if (Array.isArray(portfolio)) {
    const first = portfolio[0];
    if (first && typeof first === 'object' && first.link) return true;
    return portfolio.length > 0;
  }
  return false;
}

/**
 * Compute profile completion percentage and whether the profile is complete.
 * Required: bio, at least one skill, phone, hourlyRate, currency.
 * Optional (for percentage only): profileImage, portfolio, languages.
 */
export function getProfileCompletion(user: ProfileCompletionUser | null): ProfileCompletionResult {
  if (!user) {
    return { percentage: 0, isComplete: false };
  }

  const hasBio = Boolean(user.bio?.trim());
  const hasSkills = Array.isArray(user.skills) && user.skills.length >= 1;
  const hasPhone = Boolean(user.phone?.trim());
  const hasHourlyRate =
    user.hourlyRate !== undefined &&
    user.hourlyRate !== null &&
    !Number.isNaN(Number(user.hourlyRate)) &&
    Number(user.hourlyRate) >= 0;
  const hasCurrency = Boolean(user.currency?.trim());

  const requiredCount = [hasBio, hasSkills, hasPhone, hasHourlyRate, hasCurrency].filter(
    Boolean
  ).length;
  const requiredTotal = 5;
  const requiredScore = (requiredCount / requiredTotal) * REQUIRED_WEIGHT;

  const hasProfileImage = Boolean(user.profileImage?.trim());
  const hasPortfolioLink = hasPortfolio(user.portfolio);
  const hasLanguages = Array.isArray(user.languages) && user.languages.length >= 1;

  const optionalCount = [hasProfileImage, hasPortfolioLink, hasLanguages].filter(Boolean).length;
  const optionalTotal = 3;
  const optionalScore = (optionalCount / optionalTotal) * OPTIONAL_WEIGHT;

  const percentage = Math.round(Math.min(100, Math.max(0, requiredScore + optionalScore)));

  const isComplete =
    hasBio && hasSkills && hasPhone && hasHourlyRate && hasCurrency;

  return { percentage, isComplete };
}
