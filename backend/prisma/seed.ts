import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Test Workspace',
    },
  });

  // 2. Create product
  const product = await prisma.product.create({
    data: {
      workspaceId: workspace.id,
      status: ProductStatus.TEST,
      createdAt: new Date('2025-12-24'),
    },
  });

  // 3. Create videos
  await prisma.video.createMany({
    data: [
      {
        productId: product.id,
        views: 120,
        clicks: 1,
      },
      {
        productId: product.id,
        views: 80,
        clicks: 1,
      },
    ],
  });

  console.log('✅ Seed data created');
  console.log({
    workspaceId: workspace.id,
    productId: product.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
