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

export interface ProblemItem {
  title: string;
  stat: string;
  statLabel: string;
}

export interface Strings {
  nav: { getStarted: string };
  hero: { headlinePrefix: string; headlineHighlight: string; subtext: string; cta: string };
  showcase: { question: string };
  problem: {
    eyebrow: string;
    title: string;
    items: ProblemItem[];
  };
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
  why: { eyebrow: string; title: string; bullets: string[] };
   
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
      headlinePrefix: 'Know which',
      headlineHighlight: 'oil suits your skin.',
      subtext: 'Stop wasting money on products that may not be right for you.',
      cta: 'Get Started',
    },
    showcase: {
      question: 'What oil really fits your skin type?',
    },
    problem: {
      eyebrow: 'The problem',
      title: 'Why most people never find the right oil',
      items: [
        {
          title: 'Most oils are picked by guesswork, not by skin.',
          stat: '70%',
          statLabel: 'of bottles are bought on a whim',
        },
        {
          title: "Most people copy an influencer's routine instead of their own skin.",
          stat: '6 in 10',
          statLabel: 'follow a trend, not their skin type',
        },
        {
          title: 'A single dermatologist visit can cost more than months of skincare.',
          stat: '25,000 FCFA+',
          statLabel: 'average consultation fee',
        },
        {
          title: "Booking a dermatologist can take weeks you don't have.",
          stat: '2–4 wks',
          statLabel: 'average appointment wait',
        },
        {
          title: 'Skin changes with weather, stress and age — generic advice does not.',
          stat: 'Always',
          statLabel: 'changing, rarely reassessed',
        },
      ],
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
      bullets: [
        'Get an answer in minutes, not weeks.',
        'One profile for every member of the family.',
        'A fraction of the cost of a dermatology visit.',
        'Less energy spent guessing, less stress.',
      ],
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
      headlinePrefix: 'Découvrez',
      headlineHighlight: 'l\u2019huile faite pour votre peau.',
      subtext: 'Arrêtez de dépenser dans des produits qui ne vous conviennent peut-être pas.',
      cta: 'Commencer',
    },
    showcase: {
      question: 'Quelle huile correspond vraiment à votre type de peau ?',
    },
    problem: {
      eyebrow: 'Le problème',
      title: 'Pourquoi la bonne huile reste introuvable',
      items: [
        {
          title: 'La plupart des huiles sont choisies au hasard, pas selon la peau.',
          stat: '70%',
          statLabel: 'des flacons achetés sur un coup de tête',
        },
        {
          title: "Beaucoup copient la routine d\u2019un influenceur plutôt que d\u2019écouter leur peau.",
          stat: '6 sur 10',
          statLabel: 'suivent une tendance, pas leur type de peau',
        },
        {
          title: 'Une seule visite chez le dermatologue peut coûter plus cher que des mois de soins.',
          stat: '25 000 FCFA+',
          statLabel: 'frais de consultation moyen',
        },
        {
          title: 'Prendre rendez-vous chez le dermatologue peut prendre des semaines.',
          stat: '2 à 4 sem.',
          statLabel: 'délai d\u2019attente moyen',
        },
        {
          title: 'La peau change avec la météo, le stress et l\u2019âge — pas les conseils génériques.',
          stat: 'Toujours',
          statLabel: 'en changement, rarement réévaluée',
        },
      ],
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
      bullets: [
        'Une réponse en quelques minutes, pas en semaines.',
        'Un profil pour chaque membre de la famille.',
        'Une fraction du coût d\u2019une visite chez le dermatologue.',
        'Moins d\u2019énergie à deviner, moins de stress.',
      ],
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