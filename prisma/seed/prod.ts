import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Genre definitions ────────────────────────────────────────────────────────
// slug: language-neutral key stored in DB
// tr: Turkish display name
// en: English display name
const GENRES: { slug: string; tr: string; en: string }[] = [
  { slug: 'fantasy',          tr: 'Fantastik',        en: 'Fantasy' },
  { slug: 'science_fiction',  tr: 'Bilim Kurgu',      en: 'Science Fiction' },
  { slug: 'mystery',          tr: 'Gizem',            en: 'Mystery' },
  { slug: 'thriller',         tr: 'Gerilim',          en: 'Thriller' },
  { slug: 'romance',          tr: 'Romantik',         en: 'Romance' },
  { slug: 'horror',           tr: 'Korku',            en: 'Horror' },
  { slug: 'historical_fiction', tr: 'Tarihi Kurgu',   en: 'Historical Fiction' },
  { slug: 'adventure',        tr: 'Macera',           en: 'Adventure' },
  { slug: 'young_adult',      tr: 'Genç Yetişkin',    en: 'Young Adult' },
  { slug: 'dystopia',         tr: 'Distopya',         en: 'Dystopia' },
  { slug: 'crime_fiction',    tr: 'Suç Kurgusu',      en: 'Crime Fiction' },
  { slug: 'comedy',           tr: 'Komedi',           en: 'Comedy' },
  { slug: 'humor',            tr: 'Mizah',            en: 'Humor' },
  { slug: 'drama',            tr: 'Drama',            en: 'Drama' },
  { slug: 'documentary',      tr: 'Belgesel',         en: 'Documentary' },
  { slug: 'biography',        tr: 'Biyografi',        en: 'Biography' },
  { slug: 'war',              tr: 'Savaş',            en: 'War' },
  { slug: 'family',           tr: 'Aile',             en: 'Family' },
  { slug: 'epic',             tr: 'Epik',             en: 'Epic' },
  { slug: 'rom_com',          tr: 'Romantik Komedi',  en: 'Rom-Com' },
  { slug: 'superhero',        tr: 'Süper Kahraman',   en: 'Superhero' },
];

async function main() {
  // Upsert genres by slug
  for (const g of GENRES) {
    const genre = await prisma.project_genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: { slug: g.slug },
    });
    for (const [language, genre_name] of [['tr', g.tr], ['en', g.en]] as const) {
      await prisma.genre_translation.upsert({
        where: { genre_id_language: { genre_id: genre.id, language } },
        update: { genre_name },
        create: { genre_id: genre.id, language, genre_name },
      });
    }
  }

  // Tags: slug = tag_name itself (already URL-safe slugs)
  // Turkish translations for common tags; slug = tag_name for the rest
  const TAG_TRANSLATIONS: Record<string, { tr: string; en: string }> = {
    'abuse':                  { tr: 'İstismar',           en: 'Abuse' },
    'academia':               { tr: 'Akademi',            en: 'Academia' },
    'action':                 { tr: 'Aksiyon',            en: 'Action' },
    'activism':               { tr: 'Aktivizm',           en: 'Activism' },
    'adaptations':            { tr: 'Uyarlamalar',        en: 'Adaptations' },
    'adolescence':            { tr: 'Ergenlik',           en: 'Adolescence' },
    'adoption':               { tr: 'Evlat Edinme',       en: 'Adoption' },
    'adventure':              { tr: 'Macera',             en: 'Adventure' },
    'aliens':                 { tr: 'Uzaylılar',          en: 'Aliens' },
    'alternate_history':      { tr: 'Alternatif Tarih',   en: 'Alternate History' },
    'alternate_universe':     { tr: 'Alternatif Evren',   en: 'Alternate Universe' },
    'animals':                { tr: 'Hayvanlar',          en: 'Animals' },
    'anthropology':           { tr: 'Antropoloji',        en: 'Anthropology' },
    'apocalyptic':            { tr: 'Kıyamet',            en: 'Apocalyptic' },
    'architecture':           { tr: 'Mimarlık',           en: 'Architecture' },
    'art':                    { tr: 'Sanat',              en: 'Art' },
    'artificial_intelligence':{ tr: 'Yapay Zeka',         en: 'Artificial Intelligence' },
    'autobiography':          { tr: 'Otobiyografi',       en: 'Autobiography' },
    'biography':              { tr: 'Biyografi',          en: 'Biography' },
    'business':               { tr: 'İş Dünyası',         en: 'Business' },
    'chick_lit':              { tr: 'Kadın Kurgusu',      en: 'Chick-Lit' },
    'childrens':              { tr: 'Çocuk',              en: "Children's" },
    'cities':                 { tr: 'Şehirler',           en: 'Cities' },
    'climate_change':         { tr: 'İklim Değişikliği',  en: 'Climate Change' },
    'coding':                 { tr: 'Kodlama',            en: 'Coding' },
    'comedy':                 { tr: 'Komedi',             en: 'Comedy' },
    'comic_book':             { tr: 'Çizgi Roman',        en: 'Comic Book' },
    'crime':                  { tr: 'Suç',                en: 'Crime' },
    'cultural_heritage':      { tr: 'Kültürel Miras',     en: 'Cultural Heritage' },
    'cyberpunk':              { tr: 'Siber Punk',         en: 'Cyberpunk' },
    'dark_fantasy':           { tr: 'Karanlık Fantezi',   en: 'Dark Fantasy' },
    'death':                  { tr: 'Ölüm',               en: 'Death' },
    'demons':                 { tr: 'Şeytanlar',          en: 'Demons' },
    'design':                 { tr: 'Tasarım',            en: 'Design' },
    'detective':              { tr: 'Dedektif',           en: 'Detective' },
    'diary':                  { tr: 'Günlük',             en: 'Diary' },
    'dinosaurs':              { tr: 'Dinozorlar',         en: 'Dinosaurs' },
    'disease':                { tr: 'Hastalık',           en: 'Disease' },
    'divorce':                { tr: 'Boşanma',            en: 'Divorce' },
    'dogs':                   { tr: 'Köpekler',           en: 'Dogs' },
    'dragons':                { tr: 'Ejderhalar',         en: 'Dragons' },
    'drama':                  { tr: 'Drama',              en: 'Drama' },
    'dystopia':               { tr: 'Distopya',           en: 'Dystopia' },
    'ecology':                { tr: 'Ekoloji',            en: 'Ecology' },
    'economics':              { tr: 'Ekonomi',            en: 'Economics' },
    'education':              { tr: 'Eğitim',             en: 'Education' },
    'emotion':                { tr: 'Duygu',              en: 'Emotion' },
    'environment':            { tr: 'Çevre',              en: 'Environment' },
    'espionage':              { tr: 'Casusluk',           en: 'Espionage' },
    'european_history':       { tr: 'Avrupa Tarihi',      en: 'European History' },
    'fairy_tales':            { tr: 'Peri Masalları',     en: 'Fairy Tales' },
    'faith':                  { tr: 'İnanç',              en: 'Faith' },
    'family':                 { tr: 'Aile',               en: 'Family' },
    'fantasy':                { tr: 'Fantastik',          en: 'Fantasy' },
    'fashion':                { tr: 'Moda',               en: 'Fashion' },
    'feminism':               { tr: 'Feminizm',           en: 'Feminism' },
    'fiction':                { tr: 'Kurgu',              en: 'Fiction' },
    'film':                   { tr: 'Film',               en: 'Film' },
    'folklore':               { tr: 'Folklor',            en: 'Folklore' },
    'food':                   { tr: 'Yemek',              en: 'Food' },
    'futurism':               { tr: 'Fütürizm',           en: 'Futurism' },
    'games':                  { tr: 'Oyunlar',            en: 'Games' },
    'gastronomy':             { tr: 'Gastronomi',         en: 'Gastronomy' },
    'gender':                 { tr: 'Cinsiyet',           en: 'Gender' },
    'ghosts':                 { tr: 'Hayaletler',         en: 'Ghosts' },
    'global_warming':         { tr: 'Küresel Isınma',     en: 'Global Warming' },
    'gothic':                 { tr: 'Gotik',              en: 'Gothic' },
    'greek_mythology':        { tr: 'Yunan Mitolojisi',   en: 'Greek Mythology' },
    'health':                 { tr: 'Sağlık',             en: 'Health' },
    'history':                { tr: 'Tarih',              en: 'History' },
    'holocaust':              { tr: 'Holokost',           en: 'Holocaust' },
    'horror':                 { tr: 'Korku',              en: 'Horror' },
    'humor':                  { tr: 'Mizah',              en: 'Humor' },
    'illness':                { tr: 'Hastalık',           en: 'Illness' },
    'journalism':             { tr: 'Gazetecilik',        en: 'Journalism' },
    'language':               { tr: 'Dil',                en: 'Language' },
    'lgbt':                   { tr: 'LGBTİ+',             en: 'LGBT' },
    'love':                   { tr: 'Aşk',                en: 'Love' },
    'magic':                  { tr: 'Büyü',               en: 'Magic' },
    'magical_realism':        { tr: 'Büyülü Gerçekçilik', en: 'Magical Realism' },
    'medical':                { tr: 'Tıbbi',              en: 'Medical' },
    'medieval':               { tr: 'Ortaçağ',            en: 'Medieval' },
    'memoir':                 { tr: 'Anı',                en: 'Memoir' },
    'mental_illness':         { tr: 'Ruh Sağlığı',        en: 'Mental Illness' },
    'monsters':               { tr: 'Canavarlar',         en: 'Monsters' },
    'murder':                 { tr: 'Cinayet',            en: 'Murder' },
    'music':                  { tr: 'Müzik',              en: 'Music' },
    'musicals':               { tr: 'Müzikal',            en: 'Musicals' },
    'mystery':                { tr: 'Gizem',              en: 'Mystery' },
    'mythology':              { tr: 'Mitoloji',           en: 'Mythology' },
    'nature':                 { tr: 'Doğa',               en: 'Nature' },
    'near_future':            { tr: 'Yakın Gelecek',      en: 'Near Future' },
    'noir':                   { tr: 'Kara Film',          en: 'Noir' },
    'non_fiction':            { tr: 'Kurmaca Dışı',       en: 'Non-Fiction' },
    'occult':                 { tr: 'Okültizm',           en: 'Occult' },
    'paranormal':             { tr: 'Paranormal',         en: 'Paranormal' },
    'philosophy':             { tr: 'Felsefe',            en: 'Philosophy' },
    'pirates':                { tr: 'Korsanlar',          en: 'Pirates' },
    'poetry':                 { tr: 'Şiir',               en: 'Poetry' },
    'police':                 { tr: 'Polis',              en: 'Police' },
    'politics':               { tr: 'Politika',           en: 'Politics' },
    'pop_culture':            { tr: 'Popüler Kültür',     en: 'Pop Culture' },
    'popular_science':        { tr: 'Popüler Bilim',      en: 'Popular Science' },
    'post_apocalyptic':       { tr: 'Kıyamet Sonrası',    en: 'Post-Apocalyptic' },
    'psychological_thriller': { tr: 'Psikolojik Gerilim', en: 'Psychological Thriller' },
    'psychology':             { tr: 'Psikoloji',          en: 'Psychology' },
    'race':                   { tr: 'Irk',                en: 'Race' },
    'relationships':          { tr: 'İlişkiler',          en: 'Relationships' },
    'religion':               { tr: 'Din',                en: 'Religion' },
    'school':                 { tr: 'Okul',               en: 'School' },
    'science':                { tr: 'Bilim',              en: 'Science' },
    'science_fiction':        { tr: 'Bilim Kurgu',        en: 'Science Fiction' },
    'sexuality':              { tr: 'Cinsellik',          en: 'Sexuality' },
    'short_stories':          { tr: 'Kısa Hikayeler',     en: 'Short Stories' },
    'social_issues':          { tr: 'Toplumsal Sorunlar', en: 'Social Issues' },
    'social_justice':         { tr: 'Sosyal Adalet',      en: 'Social Justice' },
    'society':                { tr: 'Toplum',             en: 'Society' },
    'soldiers':               { tr: 'Askerler',           en: 'Soldiers' },
    'space':                  { tr: 'Uzay',               en: 'Space' },
    'supernatural':           { tr: 'Doğaüstü',           en: 'Supernatural' },
    'technology':             { tr: 'Teknoloji',          en: 'Technology' },
    'terrorism':              { tr: 'Terorizm',           en: 'Terrorism' },
    'thriller':               { tr: 'Gerilim',            en: 'Thriller' },
    'time_travel':            { tr: 'Zaman Yolculuğu',    en: 'Time Travel' },
    'tragedy':                { tr: 'Trajedi',            en: 'Tragedy' },
    'travel':                 { tr: 'Seyahat',            en: 'Travel' },
    'utopia':                 { tr: 'Ütopya',             en: 'Utopia' },
    'vampires':               { tr: 'Vampirler',          en: 'Vampires' },
    'virtual_reality':        { tr: 'Sanal Gerçeklik',    en: 'Virtual Reality' },
    'visual_art':             { tr: 'Görsel Sanat',       en: 'Visual Art' },
    'werewolves':             { tr: 'Kurt Adamlar',       en: 'Werewolves' },
    'witchcraft':             { tr: 'Büyücülük',          en: 'Witchcraft' },
    'witches':                { tr: 'Cadılar',            en: 'Witches' },
    'wizards':                { tr: 'Büyücüler',          en: 'Wizards' },
    'womens':                 { tr: 'Kadın',              en: "Women's" },
    'womens_rights':          { tr: 'Kadın Hakları',      en: "Women's Rights" },
    'world_history':          { tr: 'Dünya Tarihi',       en: 'World History' },
    'world_war_i':            { tr: '1. Dünya Savaşı',    en: 'World War I' },
    'world_war_ii':           { tr: '2. Dünya Savaşı',    en: 'World War II' },
    'young_adult':            { tr: 'Genç Yetişkin',      en: 'Young Adult' },
    'zombies':                { tr: 'Zombiler',           en: 'Zombies' },
    'turkey':                 { tr: 'Türkiye',            en: 'Turkey' },
    'turkey_history':         { tr: 'Türkiye Tarihi',     en: 'Turkey History' },
  };

  const TAG_NAMES = [
    'abuse', 'academia', 'accounting', 'action', 'activism', 'adaptations', 'adolescence',
    'adoption', 'adult', 'adventure', 'agriculture', 'alcohol', 'algebra', 'aliens',
    'alternate_history', 'alternate_universe', 'america', 'animals', 'anthropology',
    'antiquities', 'antisemitism', 'apocalyptic', 'architecture', 'art', 'art_history',
    'artificial_intelligence', 'asia', 'astrology', 'astronomy', 'atheism', 'autobiography',
    'belief', 'biography', 'business', 'cars', 'cartoon', 'cats', 'chemistry', 'chess',
    'chick_lit', 'childrens', 'cities', 'classical_music', 'climate_change', 'climbing',
    'coding', 'college', 'comedy', 'comic_book', 'comics', 'communication', 'computers',
    'conflict_of_interest', 'conspiracy_theories', 'construction', 'counter_culture',
    'counting', 'crafts', 'crime', 'criticism', 'cuisine', 'culinary', 'cultural',
    'cultural_heritage', 'cyberpunk', 'dark_fantasy', 'death', 'deception', 'demons',
    'design', 'detective', 'diary', 'dictionaries', 'dinosaurs', 'disease', 'distrust',
    'divorce', 'dogs', 'dragons', 'drama', 'drawing', 'dystopia', 'ecology', 'economics',
    'education', 'emotion', 'engineering', 'environment', 'erotica', 'espionage', 'ethnic',
    'ethnography', 'european_history', 'evolution', 'fairy_tales', 'faith', 'family',
    'fantasy', 'fashion', 'feminism', 'fiction', 'film', 'finance', 'folk_tales', 'folklore',
    'food', 'football', 'futurism', 'games', 'gastronomy', 'gender', 'geography', 'geology',
    'geometry', 'ghosts', 'global_warming', 'god', 'gothic', 'greek_mythology', 'health',
    'hierarchy', 'history', 'holocaust', 'horror', 'humor', 'illness', 'journalism', 'labor',
    'language', 'lgbt', 'linguistics', 'love', 'magic', 'magical_realism', 'management',
    'medical', 'medieval', 'memoir', 'mental_illness', 'mermaids', 'money', 'monsters',
    'murder', 'music', 'musicals', 'mystery', 'mysticism', 'mythology', 'nature', 'near_future',
    'noir', 'non_fiction', 'occult', 'oral_history', 'paranormal', 'parenting', 'philosophy',
    'photography', 'pirates', 'plants', 'poetry', 'police', 'politics', 'polygamy', 'pop_culture',
    'popular_science', 'pornography', 'post_apocalyptic', 'prehistory', 'princesses',
    'prostitution', 'psychiatry', 'psychoanalysis', 'psychological_thriller', 'psychology',
    'punk', 'race', 'relationships', 'religion', 'school', 'science', 'science_fiction',
    'scripture', 'sexuality', 'short_stories', 'social', 'social_change', 'social_issues',
    'social_justice', 'social_media', 'social_movements', 'society', 'sociology', 'soldiers',
    'space', 'students', 'supernatural', 'teachers', 'teaching', 'technology', 'teen',
    'terrorism', 'thriller', 'time_travel', 'tragedy', 'travel', 'utopia', 'vampires', 'vegan',
    'vegetarian', 'virtual_reality', 'visual_art', 'werewolves', 'witchcraft', 'witches',
    'wizards', 'wolves', 'womens', 'womens_rights', 'womens_studies', 'world_history',
    'world_war_i', 'world_war_ii', 'young_adult', 'zombies', 'turkey', 'turkey_history',
  ];

  for (const slug of TAG_NAMES) {
    const tag = await prisma.project_tag.upsert({
      where: { slug },
      update: {},
      create: { slug },
    });
    const translations = TAG_TRANSLATIONS[slug];
    if (translations) {
      for (const [language, tag_name] of [['tr', translations.tr], ['en', translations.en]] as const) {
        await prisma.tag_translation.upsert({
          where: { tag_id_language: { tag_id: tag.id, language } },
          update: { tag_name },
          create: { tag_id: tag.id, language, tag_name },
        });
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

