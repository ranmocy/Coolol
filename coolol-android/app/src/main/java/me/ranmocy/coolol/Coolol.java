package me.ranmocy.coolol;

import android.app.Application;

import com.twitter.sdk.android.core.Twitter;

import androidx.annotation.NonNull;

public final class Coolol extends Application {

  private static Coolol instance;

  @NonNull
  public static Coolol getInstance() {
    return Utils.checkNotNull(instance);
  }

  @Override
  public void onCreate() {
    super.onCreate();
    instance = this;
    Twitter.initialize(this);
  }
}
