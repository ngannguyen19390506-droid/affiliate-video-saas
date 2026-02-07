-- ================================
-- RESET WORKSPACE DATA (DEV ONLY)
-- ================================
-- ⚠️ KHÔNG CHẠY TRÊN PROD
-- Thay workspaceId trước khi chạy
-- ================================

-- 1️⃣ Xóa DailyAction
DELETE FROM "DailyAction"
WHERE "productId" IN (
  SELECT id FROM "Product"
  WHERE "workspaceId" = 'workspace-demo'
);

-- 2️⃣ Xóa VideoProject
DELETE FROM "VideoProject"
WHERE "productId" IN (
  SELECT id FROM "Product"
  WHERE "workspaceId" = 'workspace-demo'
);

-- 3️⃣ Xóa Video
DELETE FROM "Video"
WHERE "productId" IN (
  SELECT id FROM "Product"
  WHERE "workspaceId" = 'workspace-demo'
);

-- 4️⃣ Xóa Product
DELETE FROM "Product"
WHERE "workspaceId" = 'workspace-demo';
