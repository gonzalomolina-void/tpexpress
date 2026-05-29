import 'dotenv/config';
import prisma from '../src/prisma/prismaClient.js';
import fs from 'fs/promises';

async function main() {
  console.log('🧹 Limpiando la base de datos...');

  // Limpieza en orden inverso de claves foráneas
  await prisma.cardTranslation.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.cardTypeTranslation.deleteMany({});
  await prisma.cardType.deleteMany({});
  await prisma.rarityTranslation.deleteMany({});
  await prisma.rarity.deleteMany({});

  console.log('✅ Base de datos limpia.');

  console.log('🌱 Creando tipos de cartas...');
  const cardTypes = [
    {
      code: 'creature',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Criatura' },
            { language: 'en', name: 'Creature' },
          ],
        },
      },
    },
    {
      code: 'spell',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Hechizo' },
            { language: 'en', name: 'Spell' },
          ],
        },
      },
    },
    {
      code: 'artifact',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Artefacto' },
            { language: 'en', name: 'Artifact' },
          ],
        },
      },
    },
  ];

  for (const type of cardTypes) {
    await prisma.cardType.create({ data: type });
  }
  console.log('✅ Tipos de cartas creados.');

  console.log('🌱 Creando rarezas...');
  const rarities = [
    {
      code: 'poor',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Pobre' },
            { language: 'en', name: 'Poor' },
          ],
        },
      },
    },
    {
      code: 'common',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Común' },
            { language: 'en', name: 'Common' },
          ],
        },
      },
    },
    {
      code: 'uncommon',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Poco Común' },
            { language: 'en', name: 'Uncommon' },
          ],
        },
      },
    },
    {
      code: 'rare',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Raro' },
            { language: 'en', name: 'Rare' },
          ],
        },
      },
    },
    {
      code: 'epic',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Épico' },
            { language: 'en', name: 'Epic' },
          ],
        },
      },
    },
    {
      code: 'legendary',
      translations: {
        createMany: {
          data: [
            { language: 'es', name: 'Legendario' },
            { language: 'en', name: 'Legendary' },
          ],
        },
      },
    },
  ];

  for (const rarity of rarities) {
    await prisma.rarity.create({ data: rarity });
  }
  console.log('✅ Rarezas creadas.');

  console.log('🌱 Leyendo y cargando cartas desde characters.json...');
  
  // Leer el archivo JSON de forma dinámica
  const charactersRaw = await fs.readFile(
    new URL('../docs/characters.json', import.meta.url),
    'utf-8'
  );
  const characters = JSON.parse(charactersRaw);

  console.log(`📦 Se encontraron ${characters.length} cartas en el archivo. Insertando secuencialmente...`);

  // Insertar secuencialmente para garantizar el orden de inserción y las IDs consecutivas (1 a 100)
  for (const char of characters) {
    const typeCode = char.typeEn.toLowerCase();
    const rarityCode = char.rarityEn.toLowerCase();

    await prisma.card.create({
      data: {
        cost: char.cost,
        atk: char.atk,
        def: char.def,
        image: char.media.image, // Extraído de media.image
        type: { connect: { code: typeCode } },
        rarity: { connect: { code: rarityCode } },
        translations: {
          createMany: {
            data: [
              { language: 'es', name: char.nameEs, description: char.descriptionEs },
              { language: 'en', name: char.nameEn, description: char.descriptionEn }
            ]
          }
        }
      }
    });
  }

  console.log(`✅ Se insertaron exitosamente las ${characters.length} cartas en el mismo orden del JSON.`);
  console.log('🌱 Proceso de semillado completado con éxito.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el semillado:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
