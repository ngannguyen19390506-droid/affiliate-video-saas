import { PrismaClient, DailyActionType, ProductStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const workspaceId = 'workspace-demo'

  // 1️⃣ UPSERT WORKSPACE (BẮT BUỘC)
  const workspace = await prisma.workspace.upsert({
    where: { id: workspaceId },
    update: {},
    create: {
      id: workspaceId,
      name: 'Workspace Demo',
    },
  })

  // 2️⃣ UPSERT PRODUCT
  const productB = await prisma.product.upsert({
    where: { id: 'product-b' },
    update: {
      status: ProductStatus.TEST,
    },
    create: {
      id: 'product-b',
      workspaceId: workspace.id,
      status: ProductStatus.TEST,
    },
  })

  // 3️⃣ CLEAR VIDEO CŨ
  await prisma.video.deleteMany({
    where: { productId: productB.id },
  })

  // 4️⃣ TẠO VIDEO (để có views / clicks)
  await prisma.video.createMany({
    data: [
      { productId: productB.id, views: 80, clicks: 1 },
      { productId: productB.id, views: 120, clicks: 1 },
    ],
  })

  // 5️⃣ CLEAR DAILY ACTION CŨ (theo ngày)
  await prisma.dailyAction.deleteMany({
    where: {
      workspaceId,
      actionDate: new Date(new Date().toDateString()),
    },
  })

  // 6️⃣ TẠO DAILY ACTION
  await prisma.dailyAction.create({
    data: {
      workspaceId,
      productId: productB.id,
      actionType: DailyActionType.MAKE_MORE_VIDEOS,
      priority: 1,
      reason: 'Views thấp, chưa có chuyển đổi',
      actionDate: new Date(),
    },
  })

  console.log('✅ Seed debug DONE')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
