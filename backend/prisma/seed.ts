import { PrismaClient, ProductStatus, VideoType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding data...');

  // 1️⃣ Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
    },
  });

  // 2️⃣ Create product (TEST, chưa đủ dữ liệu)
  const product = await prisma.product.create({
    data: {
      workspaceId: workspace.id,
      status: ProductStatus.TEST,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 ngày trước
    },
  });

  // 3️⃣ Create videos (ĐỦ 5 video để Rule Engine hoạt động)
  await prisma.video.createMany({
    data: [
      {
        productId: product.id,
        views: 1200,
        clicks: 1,
        type: VideoType.SELL,
        format: 'POV',
      },
      {
        productId: product.id,
        views: 800,
        clicks: 0,
        type: VideoType.SELL,
        format: 'REVIEW',
      },
      {
        productId: product.id,
        views: 300,
        clicks: 0,
        type: VideoType.BUILD,
        format: 'SLIDESHOW',
      },
      {
        productId: product.id,
        views: 150,
        clicks: 0,
        type: VideoType.BUILD,
        format: 'TIP',
      },
      {
        productId: product.id,
        views: 90,
        clicks: 0,
        type: VideoType.SELL,
        format: 'POV',
      },
    ],
  });

  console.log('✅ Seed data created successfully');
  console.log({
    workspaceId: workspace.id,
    productId: product.id,
    expectedRuleResult: 'CONTINUE (có click + đủ video)',
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
