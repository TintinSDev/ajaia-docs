import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@ajaia.com" },
    update: {},
    create: {
      id: "cmtxerbqg0000jkt7jk6kvyx2",
      email: "alice@ajaia.com",
      name: "Alice (Owner)",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@ajaia.com" },
    update: {},
    create: {
      id: "cmtxerbql0001jkt7v3wxezfa",
      email: "bob@ajaia.com",
      name: "Bob (Collaborator)",
    },
  });

  console.log({ alice, bob });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
