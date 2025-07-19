// src/utils/date.ts

export const calculateAge = (birthDateString: string | null | undefined): number | null => {
  if (!birthDateString) {
    return null;
  }
  
  // YYYY-MM-DD形式の文字列を正しく解釈するためにDate.parseを使用
  const birthDate = new Date(Date.parse(birthDateString));
  // 不正な日付の場合はnullを返す
  if (isNaN(birthDate.getTime())) {
      return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};