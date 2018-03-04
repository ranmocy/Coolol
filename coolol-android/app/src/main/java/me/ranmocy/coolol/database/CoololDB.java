package me.ranmocy.coolol.database;

import android.arch.persistence.room.Database;
import android.arch.persistence.room.Room;
import android.arch.persistence.room.RoomDatabase;
import android.content.Context;

@Database(entities = {SessionEntity.class}, version = 1)
public abstract class CoololDB extends RoomDatabase {

    private static CoololDB instance = null;

    public static CoololDB getInstance(Context context) {
        if (instance == null) {
            synchronized (CoololDB.class) {
                if (instance == null) {
                    instance = Room
                            .databaseBuilder(context.getApplicationContext(), CoololDB.class, "coolol-database")
                            .build();
                }
            }
        }
        return instance;
    }

    public abstract SessionDao getSessionDao();
}
