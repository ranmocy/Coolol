package me.ranmocy.coolol.database;

import android.arch.lifecycle.LiveData;
import android.arch.persistence.room.Dao;
import android.arch.persistence.room.Insert;
import android.arch.persistence.room.OnConflictStrategy;
import android.arch.persistence.room.Query;

import java.util.List;

@Dao
public abstract class SessionDao {

  @Query("SELECT * FROM SessionEntity")
  public abstract LiveData<List<SessionEntity>> getSessions();

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  public abstract long saveSessionEntity(SessionEntity entity);
}
