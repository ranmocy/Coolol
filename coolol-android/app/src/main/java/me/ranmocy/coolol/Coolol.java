package me.ranmocy.coolol;

import android.app.Application;

import com.twitter.sdk.android.core.Twitter;

public final class Coolol extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        Twitter.initialize(this);
    }
}
