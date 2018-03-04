package me.ranmocy.coolol.database;

import android.arch.persistence.room.Dao;
import android.arch.persistence.room.Insert;
import android.arch.persistence.room.OnConflictStrategy;
import android.arch.persistence.room.Query;

@Dao
public abstract class SessionDao {

    @Query("SELECT * FROM SessionEntity LIMIT 1")
    public abstract SessionEntity getSessionEntity();

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    public abstract void saveSessionEntity(SessionEntity entity);
}
