import { Injectable } from '@angular/core';
import {AuthConnect, AuthResult, OneLoginProvider, ProviderOptions} from "@ionic-enterprise/auth";
import {Platform} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private initializing: Promise<void> | undefined;
  private isNative;
  private authOptions: ProviderOptions;
  private provider = new OneLoginProvider();
  private authResult: AuthResult | null = null;

  constructor(platform: Platform) {
    this.isNative = platform.is('hybrid');
    this.authOptions = {
      audience: 'samen-app-test',
      clientId: 'samen-app-test',
      discoveryUrl: 'https://login.test.spreekuur.nl/auth/realms/Spreekuur/.well-known/openid-configuration',
      logoutUrl: 'nl.topicuszorg.spreekuur://logout',
      redirectUri: 'nl.topicuszorg.spreekuur://profielselectie',
      scope: 'openid'
    };
  }

  private setup(): Promise<void> {
    return AuthConnect.setup({
      platform: this.isNative ? 'capacitor' : 'web',
      logLevel: 'DEBUG',
      ios: {
        webView: 'private',
      },
      web: {
        uiMode: 'popup',
        authFlow: 'implicit',
      },
    });
  }

  private initialize(): Promise<void> {
    if (!this.initializing) {
      this.initializing = new Promise( resolve => {
        this.setup().then(() => resolve());
      });
    }
    return this.initializing;
  }

  public async login(): Promise<void> {
    await this.initialize();
    this.authResult = await AuthConnect.login(this.provider, this.authOptions);
  }

  public async logout(): Promise<void> {
    await this.initialize();
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = null;
    }
  }

}


