package me.ranmocy.coolol;

import android.support.annotation.NonNull;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class Utils {

  public static final ExecutorService EXECUTORS = Executors.newFixedThreadPool(5);

  @NonNull
  public static <T> T checkNotNull(final T reference) {
    if (reference == null) {
      throw new NullPointerException();
    }
    return reference;
  }
}
