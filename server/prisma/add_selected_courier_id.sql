-- Migration: Add selectedCourierId to Order table
-- Run this on the production database before deploying the new server code.
-- Safe: adds a nullable column, no data loss.

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "selectedCourierId" INTEGER;
