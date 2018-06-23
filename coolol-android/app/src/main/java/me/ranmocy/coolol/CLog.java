package me.ranmocy.coolol;

import android.util.Log;

public final class CLog {
  private static final String TAG = "Coolol";

  public static void v(String message, Object... args) {
    Log.v(TAG, String.format(message, args));
  }

  public static void i(String message, Object... args) {
    Log.i(TAG, String.format(message, args));
  }

  public static void e(Throwable t, String message, Object... args) {
    Log.e(TAG, String.format(message, args), t);
  }
}
