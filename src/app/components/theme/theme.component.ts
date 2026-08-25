import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { map, Observable } from 'rxjs';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ConfirmationModalComponent } from "../../shared/components/ui/modal/confirmation-modal/confirmation-modal.component";
import { Themes, ThemesModel } from '../../shared/interface/theme.interface';
import { GetThemes, UpdateTheme } from '../../shared/store/action/theme.action';
import { ThemeState } from '../../shared/store/state/theme.state';
import { HasPermissionDirective } from '../../shared/directive/has-permission.directive';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-theme',
    imports: [CommonModule, TranslateModule, HasPermissionDirective,
        PageWrapperComponent, ConfirmationModalComponent],
    templateUrl: './theme.component.html',
    styleUrl: './theme.component.scss'
})
export class ThemeComponent {

  public themes: Themes[]
  public selectedTheme: number | null;
  public storageURL = environment.storageURL;

  themes$: Observable<ThemesModel> = inject(Store).select(ThemeState.themes) as Observable<ThemesModel>;

  /** Temas visibles en la vitrina: allowlist en environment o solo el tema activo. */
  themesForVitrine$: Observable<Themes[]> = this.themes$.pipe(
    map((model) => {
      const data = model?.data ?? [];
      const allow = environment.showcaseThemeSlugs;
      if (allow?.length) {
        return data.filter((t) => allow.includes(t.slug));
      }
      return data.filter((t) => Number(t.status) === 1);
    }),
  );

  @ViewChild("confirmationModal") ConfirmationModal: ConfirmationModalComponent;

  constructor(private store: Store, private router: Router) { }

  ngOnInit() {
    this.store.dispatch(new GetThemes())
    this.themes$.subscribe(item => {
      item?.data?.map((data:Themes)=> {
        if(data.status === 1) this.selectedTheme = data.id;
      })
    })
  }

  themeRoute(route: string) {
    this.router.navigateByUrl(`/theme/${route}`)
  }

  activeTheme(theme: any) {
    this.selectedTheme = null;
    this.selectedTheme = theme.data.id!;
    this.store.dispatch(new UpdateTheme(theme.data.id, 1));
  }

}
