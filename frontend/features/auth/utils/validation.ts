export const MIN_AGE = 15;

//vérifie que la date de naissance est renseignée ET correspond à un âge minimum
export function isValidAge(birthDate: string): boolean {
  if (!birthDate) return false;

  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age >= MIN_AGE;
}

//refuse les chiffres dans le nom de ville
const CITY_REGEX = /^[^\d]*$/;
export function isValidCity(city: string): boolean {
  return CITY_REGEX.test(city);
}

//valide un format d'URL basique (optionnel si vide)
const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
export function isValidUrl(url: string): boolean {
  if (!url) return true;
  return URL_REGEX.test(url);
}