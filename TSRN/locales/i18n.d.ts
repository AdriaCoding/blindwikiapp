import 'i18next';
import ca from './ca.json';

// This creates a type that represents all possible paths in the JSON
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: 
    TObj[TKey] extends object
      ? `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
      : `${TKey}`
}[keyof TObj & (string | number)];

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof ca;
    };
  }
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof ca;
    };
  }
  
  // Add this for better t() function typing
  interface TFunction {
    // Add overloads for up to 3 parameters
    (key: RecursiveKeyOf<typeof ca>): string;
    <TDefault>(key: RecursiveKeyOf<typeof ca>, defaultValue: TDefault): TDefault;
    (key: RecursiveKeyOf<typeof ca>, options: object): string;
  }
}