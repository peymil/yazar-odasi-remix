import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedWorkData() {
  console.log('Seeding work genres...');

  const genres = [
    'roman',
    'öykü',
    'şiir',
    'tiyatro',
    'senaryo',
    'deneme',
    'anı',
    'biyografi',
    'çocuk kitabı',
    'gezi yazısı',
  ];

  for (const genreName of genres) {
    await prisma.project_genre.upsert({
      where: { genre_name: genreName },
      update: {},
      create: { genre_name: genreName },
    });
  }

  console.log('Seeding work tags...');

  const tags = [
    'edebiyat',
    'roman',
    'hikaye',
    'şiir',
    'deneme',
    'tarih',
    'bilim kurgu',
    'fantastik',
    'polisiye',
    'gerilim',
    'romantik',
    'dram',
    'komedi',
    'macera',
    'psikolojik',
    'distopya',
    'realizm',
    'modernizm',
    'postmodernizm',
    'deneysel',
  ];

  for (const tagName of tags) {
    await prisma.project_tag.upsert({
      where: { tag_name: tagName },
      update: {},
      create: { tag_name: tagName },
    });
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
