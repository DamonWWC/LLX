-- =============================================
-- 林龍香大米商城 - 数据库初始化脚本
-- 基于当前小程序数据生成
-- 创建时间: 2025-10-16
-- =============================================

-- 创建数据库（如果不存在）
-- CREATE DATABASE llxrice;

-- 连接到数据库
-- \c llxrice;

-- =============================================
-- 1. 创建表结构
-- =============================================

-- 商品表
CREATE TABLE IF NOT EXISTS "Products" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Price" DECIMAL(10,2) NOT NULL,
    "Unit" VARCHAR(20) NOT NULL,
    "Weight" DECIMAL(10,2) NOT NULL,
    "Image" TEXT,
    "Quantity" INT DEFAULT 0,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 收货地址表
CREATE TABLE IF NOT EXISTS "Addresses" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(50) NOT NULL,
    "Phone" VARCHAR(20) NOT NULL,
    "Province" VARCHAR(50) NOT NULL,
    "City" VARCHAR(50) NOT NULL,
    "District" VARCHAR(50),
    "Detail" VARCHAR(200) NOT NULL,
    "IsDefault" BOOLEAN DEFAULT FALSE,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE IF NOT EXISTS "Orders" (
    "Id" SERIAL PRIMARY KEY,
    "OrderNo" VARCHAR(50) UNIQUE NOT NULL,
    "AddressId" INT NOT NULL,
    "TotalRicePrice" DECIMAL(10,2) NOT NULL,
    "TotalWeight" DECIMAL(10,2) NOT NULL,
    "ShippingRate" DECIMAL(10,2) NOT NULL,
    "TotalShipping" DECIMAL(10,2) NOT NULL,
    "GrandTotal" DECIMAL(10,2) NOT NULL,
    "Status" VARCHAR(20) NOT NULL DEFAULT '待发货',
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "fk_orders_address" FOREIGN KEY ("AddressId") 
        REFERENCES "Addresses"("Id") ON DELETE RESTRICT
);

-- 订单明细表
CREATE TABLE IF NOT EXISTS "OrderItems" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INT NOT NULL,
    "ProductId" INT NOT NULL,
    "ProductName" VARCHAR(100) NOT NULL,
    "ProductPrice" DECIMAL(10,2) NOT NULL,
    "ProductUnit" VARCHAR(20) NOT NULL,
    "ProductWeight" DECIMAL(10,2) NOT NULL,
    "Quantity" INT NOT NULL,
    "Subtotal" DECIMAL(10,2) NOT NULL,
    
    CONSTRAINT "fk_orderitems_order" FOREIGN KEY ("OrderId") 
        REFERENCES "Orders"("Id") ON DELETE CASCADE,
    CONSTRAINT "fk_orderitems_product" FOREIGN KEY ("ProductId") 
        REFERENCES "Products"("Id") ON DELETE RESTRICT
);

-- 运费配置表
CREATE TABLE IF NOT EXISTS "ShippingRates" (
    "Id" SERIAL PRIMARY KEY,
    "Province" VARCHAR(50) NOT NULL UNIQUE,
    "Rate" DECIMAL(10,2) NOT NULL,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. 创建索引
-- =============================================

-- 商品表索引
CREATE INDEX IF NOT EXISTS "idx_products_name" ON "Products"("Name");

-- 地址表索引
CREATE INDEX IF NOT EXISTS "idx_addresses_default" ON "Addresses"("IsDefault");
CREATE INDEX IF NOT EXISTS "idx_addresses_phone" ON "Addresses"("Phone");

-- 订单表索引
CREATE INDEX IF NOT EXISTS "idx_orders_orderno" ON "Orders"("OrderNo");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "Orders"("Status");
CREATE INDEX IF NOT EXISTS "idx_orders_createdat" ON "Orders"("CreatedAt" DESC);

-- 订单明细表索引
CREATE INDEX IF NOT EXISTS "idx_orderitems_orderid" ON "OrderItems"("OrderId");
CREATE INDEX IF NOT EXISTS "idx_orderitems_productid" ON "OrderItems"("ProductId");

-- =============================================
-- 3. 插入初始数据
-- =============================================

-- 清空现有数据（如果存在）
TRUNCATE TABLE "OrderItems" CASCADE;
TRUNCATE TABLE "Orders" CASCADE;
TRUNCATE TABLE "Addresses" CASCADE;
TRUNCATE TABLE "Products" CASCADE;
TRUNCATE TABLE "ShippingRates" CASCADE;

-- 重置序列
ALTER SEQUENCE "Products_Id_seq" RESTART WITH 1;
ALTER SEQUENCE "Addresses_Id_seq" RESTART WITH 1;
ALTER SEQUENCE "Orders_Id_seq" RESTART WITH 1;
ALTER SEQUENCE "OrderItems_Id_seq" RESTART WITH 1;
ALTER SEQUENCE "ShippingRates_Id_seq" RESTART WITH 1;

-- 插入默认商品数据（基于小程序getDefaultProducts()）
INSERT INTO "Products" ("Name", "Price", "Unit", "Weight", "Image", "Quantity") VALUES
('稻花香', 40.00, '袋', 10.00, 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23FCE4EC"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%23E91E63" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E', 0),
('稻花香', 50.00, '箱', 10.00, 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23FCE4EC"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%23E91E63" text-anchor="middle" dy=".3em"%3E📦%3C/text%3E%3C/svg%3E', 0),
('长粒香', 30.00, '袋', 10.00, 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23E8F5E9"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%234CAF50" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E', 0),
('长粒香', 40.00, '箱', 10.00, 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23E8F5E9"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%234CAF50" text-anchor="middle" dy=".3em"%3E📦%3C/text%3E%3C/svg%3E', 0);

-- 插入运费配置数据（基于小程序shippingConfig.js）
INSERT INTO "ShippingRates" ("Province", "Rate") VALUES
-- 东北地区 - 1.0元/斤
('黑龙江省', 1.0),
('吉林省', 1.0),
('辽宁省', 1.0),

-- 华北地区 - 1.2元/斤
('北京市', 1.2),
('天津市', 1.2),
('河北省', 1.2),
('山西省', 1.2),
('内蒙古自治区', 1.2),
('山东省', 1.2),
('河南省', 1.2),

-- 华东地区 - 1.4元/斤
('上海市', 1.4),
('江苏省', 1.4),
('浙江省', 1.4),
('安徽省', 1.4),
('福建省', 1.4),
('江西省', 1.4),

-- 华中地区 - 1.4元/斤
('湖北省', 1.4),
('湖南省', 1.4),

-- 华南地区 - 1.4元/斤
('广东省', 1.4),
('广西壮族自治区', 1.4),
('海南省', 1.4),

-- 西南地区 - 1.4元/斤
('重庆市', 1.4),
('四川省', 1.4),
('贵州省', 1.4),
('云南省', 1.4),

-- 西北地区 - 1.4元/斤
('陕西省', 1.4),
('甘肃省', 1.4),
('宁夏回族自治区', 1.4),

-- 偏远地区 - 5.4元/斤
('西藏自治区', 5.4),
('青海省', 5.4),
('新疆维吾尔自治区', 5.4),

-- 特别行政区 - 1.4元/斤
('香港特别行政区', 1.4),
('澳门特别行政区', 1.4),
('台湾省', 1.4),

-- 默认运费
('default', 1.4);

-- 插入示例地址数据（可选）
INSERT INTO "Addresses" ("Name", "Phone", "Province", "City", "District", "Detail", "IsDefault") VALUES
('张三', '13800138000', '广东省', '深圳市', '南山区', '科技园南路1号', true),
('李四', '13900139000', '北京市', '北京市', '朝阳区', '建国路88号SOHO现代城', false),
('王五', '13700137000', '上海市', '上海市', '浦东新区', '陆家嘴环路1000号', false);

-- =============================================
-- 4. 创建触发器（自动更新UpdatedAt字段）
-- =============================================

-- 创建更新时间的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建触发器
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON "Products" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at 
    BEFORE UPDATE ON "Addresses" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON "Orders" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shippingrates_updated_at 
    BEFORE UPDATE ON "ShippingRates" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. 创建视图（便于查询）
-- =============================================

-- 订单详情视图
CREATE OR REPLACE VIEW "OrderDetails" AS
SELECT 
    o."Id" as "OrderId",
    o."OrderNo",
    o."Status",
    o."TotalRicePrice",
    o."TotalWeight",
    o."ShippingRate",
    o."TotalShipping",
    o."GrandTotal",
    o."CreatedAt",
    a."Name" as "AddressName",
    a."Phone" as "AddressPhone",
    a."Province" as "AddressProvince",
    a."City" as "AddressCity",
    a."District" as "AddressDistrict",
    a."Detail" as "AddressDetail"
FROM "Orders" o
LEFT JOIN "Addresses" a ON o."AddressId" = a."Id";

-- 商品统计视图
CREATE OR REPLACE VIEW "ProductStats" AS
SELECT 
    p."Id",
    p."Name",
    p."Price",
    p."Unit",
    p."Weight",
    COUNT(oi."Id") as "OrderCount",
    COALESCE(SUM(oi."Quantity"), 0) as "TotalSold",
    COALESCE(SUM(oi."Subtotal"), 0) as "TotalRevenue"
FROM "Products" p
LEFT JOIN "OrderItems" oi ON p."Id" = oi."ProductId"
GROUP BY p."Id", p."Name", p."Price", p."Unit", p."Weight";

-- =============================================
-- 6. 创建存储过程（可选）
-- =============================================

-- 生成订单号存储过程
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_no TEXT;
    counter INT := 0;
BEGIN
    LOOP
        order_no := 'ORD' || EXTRACT(EPOCH FROM NOW())::BIGINT || LPAD(counter::TEXT, 3, '0');
        
        -- 检查订单号是否已存在
        IF NOT EXISTS (SELECT 1 FROM "Orders" WHERE "OrderNo" = order_no) THEN
            RETURN order_no;
        END IF;
        
        counter := counter + 1;
        
        -- 防止无限循环
        IF counter > 999 THEN
            RAISE EXCEPTION 'Unable to generate unique order number';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 计算运费存储过程
CREATE OR REPLACE FUNCTION calculate_shipping_fee(
    p_province TEXT,
    p_weight DECIMAL
)
RETURNS TABLE(
    rate DECIMAL,
    shipping DECIMAL
) AS $$
DECLARE
    shipping_rate DECIMAL;
BEGIN
    -- 获取运费单价
    SELECT "Rate" INTO shipping_rate
    FROM "ShippingRates"
    WHERE "Province" = p_province;
    
    -- 如果没找到，使用默认运费
    IF shipping_rate IS NULL THEN
        SELECT "Rate" INTO shipping_rate
        FROM "ShippingRates"
        WHERE "Province" = 'default';
    END IF;
    
    -- 计算运费
    RETURN QUERY SELECT 
        shipping_rate as rate,
        (p_weight * shipping_rate) as shipping;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. 数据验证和测试
-- =============================================

-- 验证数据插入
SELECT 'Products' as table_name, COUNT(*) as record_count FROM "Products"
UNION ALL
SELECT 'Addresses', COUNT(*) FROM "Addresses"
UNION ALL
SELECT 'ShippingRates', COUNT(*) FROM "ShippingRates"
UNION ALL
SELECT 'Orders', COUNT(*) FROM "Orders"
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM "OrderItems";

-- 测试运费计算
SELECT * FROM calculate_shipping_fee('广东省', 20.0);
SELECT * FROM calculate_shipping_fee('北京市', 15.0);
SELECT * FROM calculate_shipping_fee('西藏自治区', 10.0);

-- 测试订单号生成
SELECT generate_order_number() as new_order_no;

-- =============================================
-- 8. 权限设置（可选）
-- =============================================

-- 创建应用用户（可选）
-- CREATE USER llxrice_app WITH PASSWORD 'your_strong_password';
-- GRANT CONNECT ON DATABASE llxrice TO llxrice_app;
-- GRANT USAGE ON SCHEMA public TO llxrice_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO llxrice_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO llxrice_app;

-- =============================================
-- 初始化完成
-- =============================================

-- 显示初始化结果
SELECT 
    '数据库初始化完成！' as message,
    'Products: ' || (SELECT COUNT(*) FROM "Products") || ' 条记录' as products,
    'Addresses: ' || (SELECT COUNT(*) FROM "Addresses") || ' 条记录' as addresses,
    'ShippingRates: ' || (SELECT COUNT(*) FROM "ShippingRates") || ' 条记录' as shipping_rates;

-- 显示商品列表
SELECT "Id", "Name", "Price", "Unit", "Weight" FROM "Products" ORDER BY "Id";

-- 显示运费配置
SELECT "Province", "Rate" FROM "ShippingRates" ORDER BY "Rate", "Province";
