-- infra/mysql-init/01-init.sql
-- Inicializa bancos e usuários por microsserviço (dev)
-- Executado automaticamente apenas na 1ª inicialização do volume do MySQL.

-- ==== CATALOG ====
CREATE DATABASE IF NOT EXISTS catalog
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'catalog'@'%' IDENTIFIED WITH mysql_native_password BY 'catalog';
GRANT ALL PRIVILEGES ON catalog.* TO 'catalog'@'%';

-- Shadow DB (para prisma migrate dev)
CREATE DATABASE IF NOT EXISTS catalog_shadow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ==== ORDERS ====
CREATE DATABASE IF NOT EXISTS orders
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'orders'@'%' IDENTIFIED WITH mysql_native_password BY 'orders';
GRANT ALL PRIVILEGES ON orders.* TO 'orders'@'%';

-- Shadow DB (para prisma migrate dev)
CREATE DATABASE IF NOT EXISTS orders_shadow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ==== (Reservas — se desejar futuramente) ====
CREATE DATABASE IF NOT EXISTS inventory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'inventory'@'%' IDENTIFIED WITH mysql_native_password BY 'inventory';
GRANT ALL PRIVILEGES ON inventory.* TO 'inventory'@'%';

-- ==== (Pagamentos — se desejar futuramente) ====
CREATE DATABASE IF NOT EXISTS payments
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'payments'@'%' IDENTIFIED WITH mysql_native_password BY 'payments';
GRANT ALL PRIVILEGES ON payments.* TO 'payments'@'%';

-- ==== (Envio — se desejar futuramente) ====
CREATE DATABASE IF NOT EXISTS shipping
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'shipping'@'%' IDENTIFIED WITH mysql_native_password BY 'shipping';
GRANT ALL PRIVILEGES ON shipping.* TO 'shipping'@'%';

FLUSH PRIVILEGES;
