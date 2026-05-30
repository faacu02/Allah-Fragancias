-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");
CREATE INDEX IF NOT EXISTS "Product_collection_idx" ON "Product"("collection");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
