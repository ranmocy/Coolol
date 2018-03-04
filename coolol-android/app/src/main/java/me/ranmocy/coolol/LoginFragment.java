package me.ranmocy.coolol;

import android.arch.lifecycle.ViewModelProviders;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.twitter.sdk.android.core.Callback;
import com.twitter.sdk.android.core.Result;
import com.twitter.sdk.android.core.TwitterException;
import com.twitter.sdk.android.core.TwitterSession;
import com.twitter.sdk.android.core.identity.TwitterAuthClient;

import me.ranmocy.coolol.models.SessionModel;

public final class LoginFragment extends Fragment {

  private final TwitterAuthClient twitterAuthClient = new TwitterAuthClient();

  @Override
  public View onCreateView(
      @NonNull LayoutInflater inflater,
      @Nullable ViewGroup container,
      @Nullable Bundle savedInstanceState) {
    View rootView = inflater.inflate(R.layout.fragment_login, container, false);

    final MainActivity activity = (MainActivity) Utils.checkNotNull(getActivity());
    SessionModel sessionModel = ViewModelProviders.of(activity).get(SessionModel.class);
    sessionModel
        .getSessions()
        .observe(
            this,
            sessionEntities -> {
              if (sessionEntities == null || sessionEntities.isEmpty()) {
                twitterAuthClient.authorize(
                    activity,
                    new Callback<TwitterSession>() {
                      @Override
                      public void success(Result<TwitterSession> result) {
                        CLog.i("login success:%s", result.data);
                        sessionModel
                            .saveSession(result.data)
                            .observe(LoginFragment.this, success -> activity.onLoginSuccess());
                      }

                      @Override
                      public void failure(TwitterException exception) {
                        CLog.e(exception, "login failed:%s", exception.getClass());
                        TextView textView = rootView.findViewById(R.id.login_error_message);
                        textView.setText(exception.getMessage());
                        // TODO: better error message
                      }
                    });
              } else {
                activity.onLoginSuccess();
              }
            });

    return rootView;
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    CLog.i("onActivityResult:%s,%s", requestCode, resultCode);
    if (requestCode == twitterAuthClient.getRequestCode()) {
      twitterAuthClient.onActivityResult(requestCode, resultCode, data);
    }
  }
}
