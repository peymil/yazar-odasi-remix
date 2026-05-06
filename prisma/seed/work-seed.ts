import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WORK_GENRES: { name: string; slug: string; tr: string; en: string }[] = [
  { name: 'roman',        slug: 'roman',        tr: 'Roman',        en: 'Novel' },
  { name: 'öykü',         slug: 'oyku',         tr: 'Öykü',         en: 'Short Story' },
  { name: 'şiir',         slug: 'siir',         tr: 'Şiir',         en: 'Poetry' },
  { name: 'tiyatro',      slug: 'tiyatro',      tr: 'Tiyatro',      en: 'Theatre' },
  { name: 'senaryo',      slug: 'senaryo',      tr: 'Senaryo',      en: 'Screenplay' },
  { name: 'deneme',       slug: 'deneme',       tr: 'Deneme',       en: 'Essay' },
  { name: 'anı',          slug: 'ani',          tr: 'Anı',          en: 'Memoir' },
  { name: 'biyografi',    slug: 'biyografi',    tr: 'Biyografi',    en: 'Biography' },
  { name: 'çocuk kitabı', slug: 'cocuk_kitabi', tr: 'Çocuk Kitabı', en: "Children's Book" },
  { name: 'gezi yazısı',  slug: 'gezi_yazisi',  tr: 'Gezi Yazısı',  en: 'Travel Writing' },
];

const WORK_TAGS: { name: string; slug: string; tr: string; en: string }[] = [
  { name: 'edebiyat',      slug: 'edebiyat',      tr: 'Edebiyat',      en: 'Literature' },
  { name: 'roman',         slug: 'roman_tag',     tr: 'Roman',         en: 'Novel' },
  { name: 'hikaye',        slug: 'hikaye',        tr: 'Hikaye',        en: 'Story' },
  { name: 'şiir',          slug: 'siir_tag',      tr: 'Şiir',          en: 'Poetry' },
  { name: 'deneme',        slug: 'deneme_tag',    tr: 'Deneme',        en: 'Essay' },
  { name: 'tarih',         slug: 'tarih',         tr: 'Tarih',         en: 'History' },
  { name: 'bilim kurgu',   slug: 'bilim_kurgu',   tr: 'Bilim Kurgu',   en: 'Science Fiction' },
  { name: 'fantastik',     slug: 'fantastik',     tr: 'Fantastik',     en: 'Fantasy' },
  { name: 'polisiye',      slug: 'polisiye',      tr: 'Polisiye',      en: 'Detective' },
  { name: 'gerilim',       slug: 'gerilim',       tr: 'Gerilim',       en: 'Thriller' },
  { name: 'romantik',      slug: 'romantik',      tr: 'Romantik',      en: 'Romance' },
  { name: 'dram',          slug: 'dram',          tr: 'Dram',          en: 'Drama' },
  { name: 'komedi',        slug: 'komedi',        tr: 'Komedi',        en: 'Comedy' },
  { name: 'macera',        slug: 'macera',        tr: 'Macera',        en: 'Adventure' },
  { name: 'psikolojik',    slug: 'psikolojik',    tr: 'Psikolojik',    en: 'Psychological' },
  { name: 'distopya',      slug: 'distopya',      tr: 'Distopya',      en: 'Dystopia' },
  { name: 'realizm',       slug: 'realizm',       tr: 'Realizm',       en: 'Realism' },
  { name: 'modernizm',     slug: 'modernizm',     tr: 'Modernizm',     en: 'Modernism' },
  { name: 'postmodernizm', slug: 'postmodernizm', tr: 'Postmodernizm', en: 'Postmodernism' },
  { name: 'deneysel',      slug: 'deneysel',      tr: 'Deneysel',      en: 'Experimental' },
];

async function seedWorkData() {
  console.log('Seeding work genres...');
  for (const g of WORK_GENRES) {
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

  console.log('Seeding work tags...');
  for (const t of WORK_TAGS) {
    const tag = await prisma.project_tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: { slug: t.slug },
    });
    for (const [language, tag_name] of [['tr', t.tr], ['en', t.en]] as const) {
      await prisma.tag_translation.upsert({
        where: { tag_id_language: { tag_id: tag.id, language } },
        update: { tag_name },
        create: { tag_id: tag.id, language, tag_name },
      });
    }
  }

  console.log('Work data seeding completed!');
}

seedWorkData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

