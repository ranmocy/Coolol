package me.ranmocy.coolol;

import android.content.Intent;
import android.os.Bundle;
import android.support.design.widget.BottomNavigationView;
import android.support.v4.app.Fragment;
import android.support.v7.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private BottomNavigationView.OnNavigationItemSelectedListener mOnNavigationItemSelectedListener
            = item -> {
        switch (item.getItemId()) {
            case R.id.navigation_home:
                getSupportFragmentManager()
                        .beginTransaction()
                        .replace(R.id.content_container, new LoginFragment())
                        .commitNow();
                return true;
            case R.id.navigation_dashboard:
                getSupportFragmentManager()
                        .beginTransaction()
                        .replace(R.id.content_container, new LoginFragment())
                        .commitNow();
                return true;
            case R.id.navigation_notifications:
                getSupportFragmentManager()
                        .beginTransaction()
                        .replace(R.id.content_container, new LoginFragment())
                        .commitNow();
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
        navigation.setSelectedItemId(R.id.navigation_home);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        Fragment fragment = getSupportFragmentManager().findFragmentById(R.id.content_container);
        if (fragment != null && fragment instanceof LoginFragment) {
            fragment.onActivityResult(requestCode, resultCode, data);
        }
    }
}
