package me.ranmocy.coolol.database;

import android.arch.persistence.room.Entity;
import android.arch.persistence.room.PrimaryKey;

import com.twitter.sdk.android.core.TwitterAuthToken;
import com.twitter.sdk.android.core.TwitterSession;

@Entity
public final class SessionEntity {

  @PrimaryKey public final long id;
  public final String userName;
  public final String token;
  public final String secret;

  /* Used by Room. */
  SessionEntity(long id, String userName, String token, String secret) {
    this.id = id;
    this.userName = userName;
    this.token = token;
    this.secret = secret;
  }

  public SessionEntity(TwitterSession twitterSession) {
    this.id = twitterSession.getId();
    this.userName = twitterSession.getUserName();
    this.token = twitterSession.getAuthToken().token;
    this.secret = twitterSession.getAuthToken().secret;
  }

  public TwitterSession toTwitterSession() {
    return new TwitterSession(new TwitterAuthToken(token, secret), id, userName);
  }
}
