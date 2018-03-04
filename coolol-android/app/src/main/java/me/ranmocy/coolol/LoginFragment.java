package me.ranmocy.coolol;

import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.twitter.sdk.android.core.Callback;
import com.twitter.sdk.android.core.Result;
import com.twitter.sdk.android.core.TwitterException;
import com.twitter.sdk.android.core.TwitterSession;
import com.twitter.sdk.android.core.identity.TwitterLoginButton;

public final class LoginFragment extends Fragment {

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_login, container, false);

        TwitterLoginButton button = rootView.findViewById(R.id.login_button);
        button.setCallback(new Callback<TwitterSession>() {
            @Override
            public void success(Result<TwitterSession> result) {
                CLog.i("login success:%s", result.data);
            }

            @Override
            public void failure(TwitterException exception) {
                CLog.e(exception, "login failed:%s", exception.getClass());
            }
        });

        return rootView;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        CLog.i("onActivityResult:%s,%s", requestCode, resultCode);

        TwitterLoginButton button = getView().findViewById(R.id.login_button);
        button.onActivityResult(requestCode, resultCode, data);
    }
}
