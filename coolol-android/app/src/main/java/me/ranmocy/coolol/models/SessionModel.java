package me.ranmocy.coolol.models;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Transformations;
import androidx.lifecycle.ViewModel;
import com.twitter.sdk.android.core.TwitterSession;
import java.util.ArrayList;
import java.util.List;
import me.ranmocy.coolol.Coolol;
import me.ranmocy.coolol.Utils;
import me.ranmocy.coolol.database.CoololDB;
import me.ranmocy.coolol.database.SessionEntity;

public final class SessionModel extends ViewModel {

  private LiveData<List<TwitterSession>> sessions;

  public LiveData<List<TwitterSession>> getSessions() {
    if (sessions == null) {
      LiveData<List<SessionEntity>> entities =
          CoololDB.getInstance(Coolol.getInstance()).getSessionDao().getSessions();
      sessions =
          Transformations.map(
              entities,
              list -> {
                List<TwitterSession> result = new ArrayList<>(list.size());
                for (SessionEntity entity : list) {
                  result.add(entity.toTwitterSession());
                }
                return result;
              });
    }
    return sessions;
  }

  public LiveData<Boolean> saveSession(TwitterSession session) {
    final MutableLiveData<Boolean> saveSessionData = new MutableLiveData<>();
    Utils.EXECUTORS.execute(
        () -> {
          long result =
              CoololDB.getInstance(Coolol.getInstance())
                  .getSessionDao()
                  .saveSessionEntity(new SessionEntity(session));
          saveSessionData.setValue(result > 0);
        });
    return saveSessionData;
  }
}
