import type { Influencer } from '@/types/zadoc';

// MOCK — replaced with real Supabase query at merge time.
export const mockInfluencers: Influencer[] = [
  {
    id: 'inf-1',
    name: 'Amara Okoye',
    image_url:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=faces',
    bio: 'My combination skin finally makes sense.',
    active: true,
    display_order: 1,
    videos: [
      {
        platform: 'tiktok',
        video_url: 'https://www.tiktok.com/@example/video/1',
        thumbnail_url:
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=600&fit=crop',
      },
    ],
  },
  {
    id: 'inf-2',
    name: 'Lina Fontaine',
    image_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces',
    bio: 'Stopped guessing, started seeing results.',
    active: true,
    display_order: 2,
    videos: [
      {
        platform: 'instagram',
        video_url: 'https://www.instagram.com/reel/example2',
        thumbnail_url:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop',
      },
    ],
  },
  {
    id: 'inf-3',
    name: 'Tendai Moyo',
    image_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    bio: 'Three bottles I actually finish now.',
    active: true,
    display_order: 3,
    videos: [
      {
        platform: 'tiktok',
        video_url: 'https://www.tiktok.com/@example/video/3',
        thumbnail_url:
          'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=600&fit=crop',
      },
    ],
  },
  {
    id: 'inf-4',
    name: 'Chloé Bernard',
    image_url:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
    bio: '',
    active: true,
    display_order: 4,
    videos: [
      {
        platform: 'youtube',
        video_url: 'https://www.youtube.com/watch?v=example4',
        thumbnail_url:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop',
      },
    ],
  },
  {
    id: 'inf-5',
    name: 'Kwame Asante',
    image_url:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
    bio: 'Sensitive skin, straight answers.',
    active: true,
    display_order: 5,
    videos: [
      {
        platform: 'instagram',
        video_url: 'https://www.instagram.com/reel/example5',
        thumbnail_url:
          'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=600&fit=crop',
      },
    ],
  },
];
