// Mock data for the PhotoApp prototype
const IMG = {
  sailing: "https://images.unsplash.com/photo-1527431016426-7243a55ce5da?w=900&q=75&auto=format",
  degu: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=900&q=75&auto=format",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=75&auto=format",
  lake: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=75&auto=format",
  mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=75&auto=format",
  city: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=75&auto=format",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=75&auto=format",
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=75&auto=format",
  sunset: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=900&q=75&auto=format",
  notes1: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&q=75&auto=format",
  notes2: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=900&q=75&auto=format",
  bridge: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=900&q=75&auto=format",
};

const NOW = new Date("2026-04-20T14:12:00").getTime();
const DAY = 86400_000;

const mkAsset = (o) => ({
  kind: "photo",
  size: 132000,
  labels: [],
  ocr_excerpt: "",
  uploaded: NOW - o.daysAgo * DAY,
  bucketkey: `s3/photoapp-6b/${Math.random().toString(16).slice(2, 10)}.jpg`,
  ...o,
});

const MOCK_ASSETS = [
  mkAsset({ id: 1042, name: "04sailing.jpg", kind: "photo", thumb: IMG.sailing, daysAgo: 2, size: 132000,
    labels: [["Boat", 97], ["Water", 96], ["Outdoors", 93], ["Sail", 89], ["Sailing", 86], ["Vehicle", 84], ["Transportation", 81], ["Sea", 78], ["Nature", 76], ["Sky", 74], ["Horizon", 72], ["Recreation", 68]] }),
  mkAsset({ id: 1041, name: "lecture-notes-w04.jpg", kind: "document", thumb: IMG.notes1, daysAgo: 2, size: 411000,
    ocr_excerpt: "Week 4 — Cloud-native architectures · 1. Stateless services 2. Managed datastores 3. Observability primitives…",
    ocr_status: "done", ocr_mode: "text", ocr_conf: 87, ocr_words: 312, ocr_lines: 47 }),
  mkAsset({ id: 1040, name: "03degu.jpg", kind: "photo", thumb: IMG.degu, daysAgo: 3, size: 188000,
    labels: [["Rodent", 98], ["Animal", 97], ["Mammal", 96], ["Wildlife", 89], ["Squirrel", 72]] }),
  mkAsset({ id: 1039, name: "beach-day.jpg", kind: "photo", thumb: IMG.beach, daysAgo: 4, size: 241000,
    labels: [["Beach", 99], ["Sea", 97], ["Shore", 94], ["Water", 93], ["Nature", 88], ["Coast", 86], ["Ocean", 82]] }),
  mkAsset({ id: 1038, name: "mtg-whiteboard-04-15.jpg", kind: "document", thumb: IMG.notes2, daysAgo: 5, size: 522000,
    ocr_excerpt: "Group 1 sync — Andrew, Pooja, Emanuele, Li · Next up: photoapp API wrapper · Textract spike by Friday…",
    ocr_status: "done", ocr_mode: "forms", ocr_conf: 74, ocr_words: 184, ocr_lines: 31 }),
  mkAsset({ id: 1037, name: "trail-ridge.jpg", kind: "photo", thumb: IMG.mountain, daysAgo: 6, size: 301000,
    labels: [["Mountain", 98], ["Outdoors", 95], ["Nature", 93], ["Landscape", 90], ["Peak", 86]] }),
  mkAsset({ id: 1036, name: "lake-shore.jpg", kind: "photo", thumb: IMG.lake, daysAgo: 7, size: 219000,
    labels: [["Lake", 98], ["Water", 96], ["Nature", 94], ["Outdoors", 92], ["Reflection", 83]] }),
  mkAsset({ id: 1035, name: "reading-list.pdf", kind: "document", thumb: null, daysAgo: 8, size: 84000,
    ocr_excerpt: "MBAi 460 — Spring 2026 Reading List · Unit 3: Serverless architectures · Unit 4: Object storage patterns · Unit 5: AI/ML as a service…",
    ocr_status: "done", ocr_mode: "text", ocr_conf: 98, ocr_words: 412, ocr_lines: 28 }),
  mkAsset({ id: 1034, name: "city-skyline.jpg", kind: "photo", thumb: IMG.city, daysAgo: 9, size: 412000,
    labels: [["City", 97], ["Architecture", 94], ["Urban", 92], ["Skyline", 90], ["Building", 88]] }),
  mkAsset({ id: 1033, name: "morning-coffee.jpg", kind: "photo", thumb: IMG.coffee, daysAgo: 10, size: 142000,
    labels: [["Cup", 96], ["Coffee", 95], ["Beverage", 94], ["Drink", 91], ["Saucer", 80]] }),
  mkAsset({ id: 1032, name: "forest-walk.jpg", kind: "photo", thumb: IMG.forest, daysAgo: 12, size: 355000,
    labels: [["Forest", 98], ["Tree", 97], ["Nature", 95], ["Outdoors", 93], ["Wilderness", 87]] }),
  mkAsset({ id: 1031, name: "sunset-ridge.jpg", kind: "photo", thumb: IMG.sunset, daysAgo: 14, size: 298000,
    labels: [["Sunset", 99], ["Sky", 97], ["Dusk", 93], ["Horizon", 90], ["Nature", 87]] }),
  mkAsset({ id: 1030, name: "golden-gate.jpg", kind: "photo", thumb: IMG.bridge, daysAgo: 16, size: 384000,
    labels: [["Bridge", 99], ["Architecture", 93], ["City", 88], ["Landmark", 87], ["Fog", 84]] }),
  mkAsset({ id: 1029, name: "receipt-apr-14.jpg", kind: "document", thumb: null, daysAgo: 18, size: 62000,
    ocr_excerpt: "Whole Foods Market · Evanston IL · 2026-04-14 18:32 · TOTAL $47.18 · Tax $3.12…",
    ocr_status: "done", ocr_mode: "forms", ocr_conf: 91, ocr_words: 58, ocr_lines: 22 }),
];

const MOCK_USER = {
  userid: 7,
  username: "pooja",
  givenname: "Pooja",
  familyname: "Menon",
  roles: ["staff"],
  created: NOW - 62 * DAY,
};

const MOCK_CHAT_USERS = [
  { id: 7, name: "Pooja", online: true, self: true },
  { id: 3, name: "Emanuele", online: true },
  { id: 5, name: "Andrew", online: true },
  { id: 9, name: "Li", online: false },
  { id: 11, name: "Staff TA", online: true, badge: "staff" },
];

const MOCK_MESSAGES = [
  { id: 1, from: 5,  text: "morning — did the Textract spike go anywhere last night?", t: "09:58", state: "delivered" },
  { id: 2, from: 3,  text: "yeah, forms mode is noticeably better on the whiteboard shots. I'll push a branch after standup.", t: "10:01", state: "delivered" },
  { id: 3, from: 7,  text: "nice. does it handle handwriting too?", t: "10:02", state: "delivered", self: true },
  { id: 4, from: 3,  text: "handwriting is ok if contrast is good. wobbly cursive still trips it — ~74% avg conf.", t: "10:03", state: "delivered" },
  { id: 5, from: 5,  text: "perfect for the reading-list PDF at least. who's presenting tomorrow?", t: "10:05", state: "delivered" },
  { id: 6, from: 7,  text: "I can take the UI walkthrough, Andrew you take the API?", t: "10:06", state: "sent", self: true },
  { id: 7, from: 11, text: "heads up — Rekognition rate limit was bumped to 50/min per the AWS console.", t: "10:08", state: "delivered" },
];

const MOCK_USERS_TABLE = [
  { id: 7,  username: "pooja",    given: "Pooja",    family: "Menon",    assets: 14, last: "today 14:02" },
  { id: 3,  username: "emanuele", given: "Emanuele", family: "Rossi",    assets: 9,  last: "today 09:41" },
  { id: 5,  username: "andrew",   given: "Andrew",   family: "Tapple",   assets: 22, last: "yesterday" },
  { id: 9,  username: "li",       given: "Li",       family: "Chen",     assets: 4,  last: "2d ago" },
  { id: 11, username: "staff_ta", given: "Staff",    family: "TA",       assets: 0,  last: "—" },
  { id: 12, username: "nora",     given: "Nora",     family: "Weber",    assets: 18, last: "3d ago" },
  { id: 14, username: "dmitri",   given: "Dmitri",   family: "Volkov",   assets: 7,  last: "4d ago" },
  { id: 16, username: "sasha",    given: "Sasha",    family: "Park",     assets: 11, last: "5d ago" },
];

window.MOCK = { ASSETS: MOCK_ASSETS, USER: MOCK_USER, CHAT_USERS: MOCK_CHAT_USERS, MESSAGES: MOCK_MESSAGES, USERS_TABLE: MOCK_USERS_TABLE, IMG };
