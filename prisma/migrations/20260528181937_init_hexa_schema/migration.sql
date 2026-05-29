-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "cost" INTEGER NOT NULL,
    "atk" INTEGER NOT NULL,
    "def" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "rarityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_translations" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "card_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_types" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "card_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_type_translations" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "card_type_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rarities" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "rarities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rarity_translations" (
    "id" SERIAL NOT NULL,
    "rarityId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "rarity_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_translations_cardId_language_key" ON "card_translations"("cardId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "card_types_code_key" ON "card_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "card_type_translations_typeId_language_key" ON "card_type_translations"("typeId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "rarities_code_key" ON "rarities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "rarity_translations_rarityId_language_key" ON "rarity_translations"("rarityId", "language");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "card_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "rarities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_translations" ADD CONSTRAINT "card_translations_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_type_translations" ADD CONSTRAINT "card_type_translations_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "card_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rarity_translations" ADD CONSTRAINT "rarity_translations_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "rarities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
