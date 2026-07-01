export const CATEGORY_SLUGS = {
  'Biker Shorts': 'biker-shorts',
  'Cycling Shorts': 'cycling-shorts',
  'Yoga Pants': 'yoga-pants',
  'High Waisted Leggings': 'high-waisted-leggings',
  'High Waisted Shorts': 'high-waisted-shorts',
  'Gym Shorts': 'gym-shorts',
  'Gym Leggings': 'gym-leggings',
  'Booty Shorts': 'booty-shorts',
  'Booty Leggings': 'booty-leggings',
  'Plus Size Leggings': 'plus-size-leggings',
  'Plus Size Shorts': 'plus-size-shorts',
  'Workout Shorts': 'workout-shorts',
  'Workout Leggings': 'workout-leggings',
  'Pack': 'pack',
  'Leather Leggings': 'leather-leggings',
  'Fashion Leggings': 'fashion-leggings',
  'Cropped Leggings': 'cropped-leggings',
  'Waist Trainer': 'waist-trainer',
  'Shapewear': 'shapewear',
  'Thigh Shorts': 'thigh-shorts',
  'Flare Leggings': 'flare-leggings',
  'Capri Leggings': 'capri-leggings',
};

export const SLUG_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([category, slug]) => [slug, category])
);
