package me.ranmocy.coolol;

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.BottomNavigationView;
import android.support.v4.app.Fragment;
import android.support.v7.app.AppCompatActivity;
import android.view.View;

public class MainActivity extends AppCompatActivity {

  private BottomNavigationView.OnNavigationItemSelectedListener mOnNavigationItemSelectedListener =
      item -> {
        switch (item.getItemId()) {
          case R.id.navigation_home:
            return true;
          case R.id.navigation_dashboard:
            return true;
          case R.id.navigation_notifications:
            return true;
        }
        return false;
      };

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    BottomNavigationView navigation = findViewById(R.id.navigation);
    navigation.setOnNavigationItemSelectedListener(mOnNavigationItemSelectedListener);

    if (savedInstanceState == null) {
      navigation.setVisibility(View.GONE);
      getSupportFragmentManager()
          .beginTransaction()
          .replace(R.id.content_container, new LoginFragment())
          // no back stack
          .commitNow();
    }
  }

  @Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);

    Fragment fragment = getSupportFragmentManager().findFragmentById(R.id.content_container);
    if (fragment != null && fragment instanceof LoginFragment) {
      fragment.onActivityResult(requestCode, resultCode, data);
    }
  }

  public void onLoginSuccess() {
    BottomNavigationView navigation = findViewById(R.id.navigation);
    navigation.setVisibility(View.VISIBLE);
    navigation.setSelectedItemId(R.id.navigation_home);
  }
}
