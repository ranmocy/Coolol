package me.ranmocy.coolol.database;

import android.content.Context;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

@Database(
    entities = {SessionEntity.class},
    version = 1)
public abstract class CoololDB extends RoomDatabase {

  private static CoololDB instance = null;

  public static CoololDB getInstance(Context context) {
    if (instance == null) {
      synchronized (CoololDB.class) {
        if (instance == null) {
          instance =
              Room.databaseBuilder(
                      context.getApplicationContext(), CoololDB.class, "coolol-database")
                  .build();
        }
      }
    }
    return instance;
  }

  public abstract SessionDao getSessionDao();
}
