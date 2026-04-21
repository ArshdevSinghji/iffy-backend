const Gender = Object.freeze({
  MALE: "male",
  FEMALE: "female",
  NON_BINARY: "non-binary",
  OTHER: "other",
});

const Orientation = Object.freeze({
  STRAIGHT: "Straight",
  GAY: "Gay",
  LESBIAN: "Lesbian",
  BISEXUAL: "Bisexual",
  ASEXUAL: "Asexual",
  OTHER: "Other",
});

const CoreActivities = Object.freeze({
  HIKING: "Hiking",
  PAINTING: "Painting",
  URBAN_EXPLORATION: "Urban Exploration",
  GAMING: "Gaming",
  PHOTOGRAPHY: "Photography",
  WOODWORKING: "Woodworking",
  CHESS: "Chess",
  COOKING: "Cooking",
  GARDENING: "Gardening",
  ASTROPHOTOGRAPHY: "Astrophotography",
  VINTAGE_HUNTING: "Vintage Hunting",
  TRAVEL: "Travel",
});

const DatingPreferences = Object.freeze({
  WIT: "Wit",
  VULNERABILITY: "Vulnerability",
  DEEP_TALKS: "Deep Talks",
  SINCERITY: "Sincerity",
  KINDNESS: "Kindness",
  AMBITION: "Ambition",
  SPONTANEITY: "Spontaneity",
  PLAYFULNESS: "Playfulness",
});

const Lifestyle = Object.freeze({
  EARLY_BIRD: "Early Bird",
  NIGHT_OWL: "Night Owl",
  CAT_PARENT: "Cat Parent",
  DOG_PARENT: "Dog Parent",
  SOCIAL_BUTTERFLY: "Social Butterfly",
  HOMEBODY: "Homebody",
  FITNESS_ENTHUSIAST: "Fitness Enthusiast",
  FOODIE: "Foodie",
  CAFE_HOPPER: "Cafe Hopper",
  BOOKWORM: "Bookworm",
  MINIMALIST: "Minimalist",
});

const MediaConsumption = Object.freeze({
  SCI_FI: "Sci-Fi",
  CLASSIC_JAZZ: "Classic Jazz",
  INDIE_CINEMA: "Indie Cinema",
  PODCASTS: "Podcasts",
  POETRY: "Poetry",
  VINYL: "Vinyl",
  ANIME: "Anime",
  DOCUMENTARIES: "Documentaries",
  HORROR: "Horror",
});

module.exports = {
  Gender,
  Orientation,
  CoreActivities,
  DatingPreferences,
  Lifestyle,
  MediaConsumption,
};
