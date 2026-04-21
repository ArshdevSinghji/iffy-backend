const mongoose = require("mongoose");
const User = require("../../../models/user");
require("dotenv").config();

// Coordinates for cities
const COORDINATES = {
  chandigarh: [30.7333, 76.7333],
  bengaluru: [12.9716, 77.5946],
  kolkata: [22.5726, 88.3639],
};

const users = [
  // Chandigarh users (5)
  {
    userID: "user_chandigarh_001",
    geocellID: "chandigarh_001",
    name: "Priya Singh",
    dob: new Date("1998-05-15"),
    gender: "Female",
    orientation: "Straight",
    bio: "Love hiking and coffee",
    location: {
      type: "Point",
      coordinates: COORDINATES.chandigarh,
    },
    prompts: [
      { question: "What's your ideal date?", answer: "Sunset walk" },
      { question: "Your hidden talent?", answer: "Photography" },
    ],
    interests: {
      coreActivities: ["hiking", "photography"],
      mediaConsumption: ["movies", "podcasts"],
      lifestyle: ["fitness", "wellness"],
      datingPreferences: ["honesty", "humor"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_chandigarh_002",
    geocellID: "chandigarh_002",
    name: "Arjun Sharma",
    dob: new Date("1996-11-20"),
    gender: "Male",
    orientation: "Straight",
    bio: "Tech enthusiast and foodie",
    location: {
      type: "Point",
      coordinates: COORDINATES.chandigarh,
    },
    prompts: [{ question: "What's your hidden talent?", answer: "Cooking" }],
    interests: {
      coreActivities: ["coding", "cooking"],
      mediaConsumption: ["tech news"],
      lifestyle: ["travel"],
      datingPreferences: ["intelligent", "ambitious"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_chandigarh_003",
    geocellID: "chandigarh_003",
    name: "Neha Kapoor",
    dob: new Date("1999-03-10"),
    gender: "Female",
    orientation: "Straight",
    bio: "Artist and music lover",
    location: {
      type: "Point",
      coordinates: COORDINATES.chandigarh,
    },
    prompts: [{ question: "Your favorite activity?", answer: "Painting" }],
    interests: {
      coreActivities: ["painting", "music"],
      mediaConsumption: ["art", "music"],
      lifestyle: ["creative"],
      datingPreferences: ["supportive", "creative"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_chandigarh_004",
    geocellID: "chandigarh_004",
    name: "Rahul Verma",
    dob: new Date("1995-07-25"),
    gender: "Male",
    orientation: "Straight",
    bio: "Sports lover and entrepreneur",
    location: {
      type: "Point",
      coordinates: COORDINATES.chandigarh,
    },
    prompts: [{ question: "What drives you?", answer: "Building businesses" }],
    interests: {
      coreActivities: ["sports", "entrepreneurship"],
      mediaConsumption: ["business"],
      lifestyle: ["fitness"],
      datingPreferences: ["ambitious", "independent"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_chandigarh_005",
    geocellID: "chandigarh_005",
    name: "Anjali Gupta",
    dob: new Date("2000-01-08"),
    gender: "Female",
    orientation: "Straight",
    bio: "Book lover and traveler",
    location: {
      type: "Point",
      coordinates: COORDINATES.chandigarh,
    },
    prompts: [
      { question: "Your ideal weekend?", answer: "Reading and travel" },
    ],
    interests: {
      coreActivities: ["reading", "travel"],
      mediaConsumption: ["books", "documentaries"],
      lifestyle: ["adventure"],
      datingPreferences: ["curious", "thoughtful"],
    },
    isActive: true,
    lastActive: new Date(),
  },

  // Bengaluru users (5)
  {
    userID: "user_bengaluru_001",
    geocellID: "bengaluru_001",
    name: "Divya Nair",
    dob: new Date("1997-09-12"),
    gender: "Female",
    orientation: "Straight",
    bio: "Software engineer and yoga enthusiast",
    location: {
      type: "Point",
      coordinates: COORDINATES.bengaluru,
    },
    prompts: [
      { question: "What's your passion?", answer: "Building great products" },
    ],
    interests: {
      coreActivities: ["coding", "yoga"],
      mediaConsumption: ["tech"],
      lifestyle: ["wellness", "fitness"],
      datingPreferences: ["driven", "calm"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_bengaluru_002",
    geocellID: "bengaluru_002",
    name: "Vikram Reddy",
    dob: new Date("1994-06-30"),
    gender: "Male",
    orientation: "Straight",
    bio: "Product manager and startup enthusiast",
    location: {
      type: "Point",
      coordinates: COORDINATES.bengaluru,
    },
    prompts: [
      { question: "Your biggest achievement?", answer: "Product launch" },
    ],
    interests: {
      coreActivities: ["product management", "startups"],
      mediaConsumption: ["business news"],
      lifestyle: ["networking"],
      datingPreferences: ["independent", "ambitious"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_bengaluru_003",
    geocellID: "bengaluru_003",
    name: "Sneha Roy",
    dob: new Date("1999-02-14"),
    gender: "Female",
    orientation: "Straight",
    bio: "UX designer and coffee addict",
    location: {
      type: "Point",
      coordinates: COORDINATES.bengaluru,
    },
    prompts: [{ question: "Your creative outlet?", answer: "UI/UX design" }],
    interests: {
      coreActivities: ["design", "coffee"],
      mediaConsumption: ["design trends"],
      lifestyle: ["creative"],
      datingPreferences: ["creative", "thoughtful"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_bengaluru_004",
    geocellID: "bengaluru_004",
    name: "Karthik Kumar",
    dob: new Date("1996-08-22"),
    gender: "Male",
    orientation: "Straight",
    bio: "Data scientist and cyclist",
    location: {
      type: "Point",
      coordinates: COORDINATES.bengaluru,
    },
    prompts: [
      { question: "What excites you?", answer: "Data-driven insights" },
    ],
    interests: {
      coreActivities: ["data science", "cycling"],
      mediaConsumption: ["ai", "tech"],
      lifestyle: ["fitness", "outdoors"],
      datingPreferences: ["intelligent", "outdoorsy"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_bengaluru_005",
    geocellID: "bengaluru_005",
    name: "Ritika Bansal",
    dob: new Date("1998-12-05"),
    gender: "Female",
    orientation: "Straight",
    bio: "Marketing strategist and foodie",
    location: {
      type: "Point",
      coordinates: COORDINATES.bengaluru,
    },
    prompts: [{ question: "Your passion?", answer: "Food and marketing" }],
    interests: {
      coreActivities: ["marketing", "food"],
      mediaConsumption: ["marketing", "food blogs"],
      lifestyle: ["dining"],
      datingPreferences: ["fun", "adventurous"],
    },
    isActive: true,
    lastActive: new Date(),
  },

  // Kolkata users (5)
  {
    userID: "user_kolkata_001",
    geocellID: "kolkata_001",
    name: "Rishika Das",
    dob: new Date("1997-04-18"),
    gender: "Female",
    orientation: "Straight",
    bio: "Journalist and literature enthusiast",
    location: {
      type: "Point",
      coordinates: COORDINATES.kolkata,
    },
    prompts: [{ question: "Your inspiration?", answer: "Stories and people" }],
    interests: {
      coreActivities: ["journalism", "literature"],
      mediaConsumption: ["news", "books"],
      lifestyle: ["cultural"],
      datingPreferences: ["intellectual", "articulate"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_kolkata_002",
    geocellID: "kolkata_002",
    name: "Aditya Mukherjee",
    dob: new Date("1995-10-11"),
    gender: "Male",
    orientation: "Straight",
    bio: "Classical musician and teacher",
    location: {
      type: "Point",
      coordinates: COORDINATES.kolkata,
    },
    prompts: [{ question: "Your life's work?", answer: "Teaching music" }],
    interests: {
      coreActivities: ["music", "teaching"],
      mediaConsumption: ["classical music"],
      lifestyle: ["cultural", "artistic"],
      datingPreferences: ["cultured", "artistic"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_kolkata_003",
    geocellID: "kolkata_003",
    name: "Priya Chatterjee",
    dob: new Date("1999-07-20"),
    gender: "Female",
    orientation: "Straight",
    bio: "Environmental scientist and activist",
    location: {
      type: "Point",
      coordinates: COORDINATES.kolkata,
    },
    prompts: [
      {
        question: "What matters most?",
        answer: "Environmental sustainability",
      },
    ],
    interests: {
      coreActivities: ["environment", "activism"],
      mediaConsumption: ["documentaries"],
      lifestyle: ["sustainability"],
      datingPreferences: ["conscious", "passionate"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_kolkata_004",
    geocellID: "kolkata_004",
    name: "Sayan Dey",
    dob: new Date("1996-03-27"),
    gender: "Male",
    orientation: "Straight",
    bio: "Film director and cinephile",
    location: {
      type: "Point",
      coordinates: COORDINATES.kolkata,
    },
    prompts: [{ question: "Your dream?", answer: "Making meaningful films" }],
    interests: {
      coreActivities: ["filmmaking", "cinema"],
      mediaConsumption: ["films", "documentaries"],
      lifestyle: ["artistic"],
      datingPreferences: ["creative", "supportive"],
    },
    isActive: true,
    lastActive: new Date(),
  },
  {
    userID: "user_kolkata_005",
    geocellID: "kolkata_005",
    name: "Ananya Bose",
    dob: new Date("2000-09-03"),
    gender: "Female",
    orientation: "Straight",
    bio: "Dancer and performing arts enthusiast",
    location: {
      type: "Point",
      coordinates: COORDINATES.kolkata,
    },
    prompts: [
      { question: "What defines you?", answer: "Dance and expression" },
    ],
    interests: {
      coreActivities: ["dance", "performance"],
      mediaConsumption: ["performing arts"],
      lifestyle: ["artistic", "cultural"],
      datingPreferences: ["expressive", "artistic"],
    },
    isActive: true,
    lastActive: new Date(),
  },
];

(async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONOGODB_URI);
    console.log("Connected to MongoDB");
    await User.deleteMany({});
    await User.insertMany(users);

    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    process.exit(1);
  }
})();
