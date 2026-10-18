-- 실패한 마이그레이션 기록 삭제
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20261018_add_background_and_notifications';

-- 만약 테이블이 부분적으로 생성되었다면 정리
DROP TABLE IF EXISTS "PushSubscription" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;

-- backgroundMedia 컬럼이 이미 추가되었는지 확인 후 삭제 (필요시)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'backgroundMedia'
    ) THEN
        ALTER TABLE "User" DROP COLUMN "backgroundMedia";
    END IF;
END $$;
