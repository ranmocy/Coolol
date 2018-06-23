package me.ranmocy.coolol.database;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import java.util.List;

@Dao
public abstract class SessionDao {

  @Query("SELECT * FROM SessionEntity")
  public abstract LiveData<List<SessionEntity>> getSessions();

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  public abstract long saveSessionEntity(SessionEntity entity);
}
