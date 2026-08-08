export type Lang = 'en' | 'fr';

const STORAGE_KEY = 'zadoc_language';

/**
 * Resolves the active language.
 * - If localStorage.zadoc_language exists, use it permanently.
 * - Otherwise derive once from navigator.language (fr-* -> fr, else -> en),
 *   persist it, and use that from now on. Never re-derive on later loads.
 */
export function resolveLanguage(): Lang {
  if (typeof window === 'undefined') return 'en';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'fr') return stored;

  const browserLang = window.navigator.language || 'en';
  const derived: Lang = browserLang.toLowerCase().startsWith('fr') ? 'fr' : 'en';

  window.localStorage.setItem(STORAGE_KEY, derived);
  return derived;
}

export function setLanguage(lang: Lang) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, lang);
}

// ---- String tables -------------------------------------------------------

export interface Strings {
  nav: { getStarted: string };
  hero: { headline: string; subtext: string; cta: string };
  problem: { eyebrow: string; title: string; body: string; stat1: string; stat2: string };
  solution: {
    eyebrow: string;
    title: string;
    step1title: string;
    step1body: string;
    step2title: string;
    step2body: string;
    step3title: string;
    step3body: string;
  };
  why: {
    eyebrow: string;
    title: string;
    card1title: string;
    card1body: string;
    card2title: string;
    card2body: string;
    card3title: string;
    card3body: string;
  };
  social: { eyebrow: string; title: string };
  finalCta: { title: string; subtext: string; cta: string };
  authSheet: {
    login: string;
    createAccount: string;
    phonePlaceholder: string;
    namePlaceholder: string;
    continueLabel: string;
    note: string;
  };
  footer: { tagline: string };
}

export const strings: Record<Lang, Strings> = {
  en: {
    nav: {
      getStarted: 'Get Started',
    },
    hero: {
      headline: 'Know which oil suits your skin.',
      subtext:
        'Take a photo of your face and let Zadoc help you discover oils that fit your skin profile — so you stop wasting money on products that may not be right for you.',
      cta: 'Get Started',
    },
    problem: {
      eyebrow: 'The problem',
      title: 'Most oils are picked by guesswork, not by skin.',
      body:
        'Shelves are full of promising bottles — argan, rosehip, jojoba, marula. Without knowing your actual skin profile, it is nearly impossible to tell which one will help and which one will sit unused in a drawer.',
      stat1: 'Bottles bought on a whim',
      stat2: 'Never finish the bottle',
    },
    solution: {
      eyebrow: 'How it works',
      title: 'Three steps to a clearer picture',
      step1title: 'Take a photo',
      step1body: 'A simple photo of your face — no equipment, no appointment.',
      step2title: 'Zadoc analyzes your skin',
      step2body: 'We build a skin profile: type, condition, and what it needs.',
      step3title: 'Discover suitable oils',
      step3body: 'See which oils fit your profile, and which ones to skip.',
    },
    why: {
      eyebrow: 'Why Zadoc',
      title: 'Built to save you money, not spend it',
      card1title: 'Know your skin profile',
      card1body: 'A clear read on your skin type and condition, from a single photo.',
      card2title: 'Find better-suited oils',
      card2body: 'Recommendations matched to your profile, not a generic routine.',
      card3title: 'Stop wasting money',
      card3body: 'Buy what actually works for your skin — skip what does not.',
    },
    social: {
      eyebrow: 'Hear it from creators',
      title: 'People who tried Zadoc first',
    },
    finalCta: {
      title: 'Ready to know your skin?',
      subtext: 'It takes one photo to get started.',
      cta: 'Get Started',
    },
    authSheet: {
      login: 'Log in',
      createAccount: 'Create account',
      phonePlaceholder: 'Phone number',
      namePlaceholder: 'Full name',
      continueLabel: 'Continue',
      note: 'Authentication is wired in from the Auth piece at merge time.',
    },
    footer: {
      tagline: 'A clearer path to the right skincare oil.',
    },
  },
  fr: {
    nav: {
      getStarted: 'Commencer',
    },
    hero: {
      headline: 'Découvrez l\u2019huile faite pour votre peau.',
      subtext:
        'Prenez une photo de votre visage et laissez Zadoc vous aider à découvrir les huiles adaptées à votre profil de peau — pour arrêter de dépenser dans des produits qui ne vous conviennent peut-être pas.',
      cta: 'Commencer',
    },
    problem: {
      eyebrow: 'Le problème',
      title: 'La plupart des huiles sont choisies au hasard, pas selon la peau.',
      body:
        'Les rayons débordent de flacons prometteurs — argan, rose musquée, jojoba, marula. Sans connaître votre profil de peau réel, il est presque impossible de savoir laquelle aidera vraiment et laquelle restera oubliée dans un tiroir.',
      stat1: 'Flacons achetés sur un coup de tête',
      stat2: 'Jamais terminés',
    },
    solution: {
      eyebrow: 'Comment ça marche',
      title: 'Trois étapes pour y voir clair',
      step1title: 'Prenez une photo',
      step1body: 'Une simple photo de votre visage — sans matériel, sans rendez-vous.',
      step2title: 'Zadoc analyse votre peau',
      step2body: 'Nous établissons un profil : type, état, et besoins.',
      step3title: 'Découvrez les huiles adaptées',
      step3body: 'Voyez quelles huiles conviennent à votre profil, et lesquelles éviter.',
    },
    why: {
      eyebrow: 'Pourquoi Zadoc',
      title: 'Conçu pour vous faire économiser, pas dépenser',
      card1title: 'Connaissez votre profil de peau',
      card1body: 'Une lecture claire de votre type et état de peau, à partir d\u2019une seule photo.',
      card2title: 'Trouvez des huiles mieux adaptées',
      card2body: 'Des recommandations selon votre profil, pas une routine générique.',
      card3title: 'Arrêtez de gaspiller votre argent',
      card3body: 'Achetez ce qui fonctionne vraiment pour votre peau — évitez le reste.',
    },
    social: {
      eyebrow: 'Ce qu\u2019en disent les créateurs',
      title: 'Ils ont testé Zadoc avant vous',
    },
    finalCta: {
      title: 'Prêt·e à connaître votre peau ?',
      subtext: 'Une seule photo suffit pour commencer.',
      cta: 'Commencer',
    },
    authSheet: {
      login: 'Connexion',
      createAccount: 'Créer un compte',
      phonePlaceholder: 'Numéro de téléphone',
      namePlaceholder: 'Nom complet',
      continueLabel: 'Continuer',
      note: 'L\u2019authentification réelle sera intégrée depuis le module Auth.',
    },
    footer: {
      tagline: 'Un chemin plus clair vers la bonne huile.',
    },
  },
};
