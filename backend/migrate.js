const db = require('./db');

async function migrate() {
    try {
        console.log('🚀 Starting migration...');
        
        // Add target_role to notifications
        try {
            await db.query(`
                ALTER TABLE notifications 
                ADD COLUMN target_role ENUM('admin', 'student', 'faculty', 'all') DEFAULT NULL;
            `);
            console.log('✅ Column target_role added.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️ Column target_role already exists.');
            } else {
                throw e;
            }
        }
        
        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
