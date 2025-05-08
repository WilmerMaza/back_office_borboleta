import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../ui/button/button.component';
import { isPlatformBrowser } from '@angular/common';

export interface Language {
  language: string;
  code: string;
  icon: string;
}

@Component({
    selector: 'app-languages',
    imports: [ButtonComponent],
    templateUrl: './languages.component.html',
    styleUrl: './languages.component.scss'
})
export class LanguagesComponent {

  public active: boolean = false;
  public languages: Language[] = [
    {
      language: 'English',
      code: 'en',
      icon: 'us'
    },
    {
      language: 'Français',
      code: 'fr',
      icon: 'fr'
    },
  ]
  
  public selectedLanguage: Language = {
    language: 'English',
    code: 'en',
    icon: 'us'
  }

  constructor(private translate: TranslateService, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)){
      let language = localStorage.getItem("language");
  
      if(language == null){
        localStorage.setItem("language", JSON.stringify(this.selectedLanguage));
        this.translate.use(this.selectedLanguage.code);
      }else{
        this.selectedLanguage = JSON.parse(language);
        this.translate.use(this.selectedLanguage.code);
      }
    }
  }

  selectLanguage(language: Language) {
    this.active = false;
    this.translate.use(language.code);
    this.selectedLanguage = language;
  }

  clickHeaderOnMobile(){
    this.active = !this.active
  }

  hideDropdown(){
    this.active = false;
  }
  
}
