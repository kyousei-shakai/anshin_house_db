//src/utils/age-utils.ts
/**
 * 生年月日から年代（〇〇代）を判定するロジック
 * @param year 誕生年
 * @param month 誕生月
 * @param day 誕生日
 * @returns 「70代」「80代以上」などの文字列、判定不能時は空文字
 */
export const getAgeGroupLabel = (
  year: string | number | null,
  month?: string | number | null,
  day?: string | number | null
): string => {
  if (!year) return '';

  const birthYear = Number(year);
  const today = new Date();
  let age = today.getFullYear() - birthYear;

  // 月日が揃っている場合はより正確に計算（誕生日前なら1引く）
  if (month && day) {
    const birthDate = new Date(birthYear, Number(month) - 1, Number(day));
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  if (age < 20) return '20代未満';
  if (age >= 80) return '80代以上';
  return `${Math.floor(age / 10) * 10}代`;
};

/**
 * 手動選択用の年代リスト（一貫性を保つためここで一括管理）
 */
export const AGE_GROUP_OPTIONS = [
  '20代未満', '20代', '30代', '40代', '50代', '60代', '70代', '80代以上'
] as const;

export type AgeGroup = typeof AGE_GROUP_OPTIONS[number];