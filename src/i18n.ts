import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Get locale from localStorage or use default 'ko'
  const locale = 'ko';

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
