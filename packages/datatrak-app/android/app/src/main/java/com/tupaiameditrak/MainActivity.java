package com.tupaiameditrak;

import com.facebook.react.ReactActivity;
import com.bugsnag.BugsnagReactNative;
import android.os.Bundle;
import com.microsoft.appcenter.AppCenter;
import com.microsoft.appcenter.push.Push;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "TupaiaMediTrak";
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      BugsnagReactNative.start(this);
      AppCenter.start(getApplication(), "d31a83ce-61c8-497b-a40f-7241149464d1", Push.class);
    }
}
