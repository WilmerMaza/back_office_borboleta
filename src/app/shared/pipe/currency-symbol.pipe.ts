import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SettingState } from '../store/state/setting.state';

@Pipe({
  name: 'currencySymbol',
  standalone: true,
})
export class CurrencySymbolPipe implements PipeTransform {
  private store = inject(Store);
  private currencyPipe = inject(CurrencyPipe);
  private translate = inject(TranslateService);

  transform(
    value: number | string | null | undefined,
    position: 'before_price' | 'after_price' | string = 'before_price'
  ): string {
    if (value === null || value === undefined || value === '') {
      return this.translate.instant('invalid_amount');
    }
    const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
    if (Number.isNaN(num)) {
      return this.translate.instant('invalid_amount');
    }

    const setting = this.store.selectSnapshot(SettingState.setting);
    const symbol = setting?.general?.default_currency?.symbol ?? '$';
    const symbolPosition = setting?.general?.default_currency?.symbol_position ?? position;

    // Los importes del API (productos, pedidos, etc.) ya vienen en la moneda por defecto.
    // No multiplicar por exchange_rate aquí: duplica conversión y escala mal los montos
    // si el tipo de cambio no es exactamente 1 (p. ej. muestra 9.000 en vez de 90.000).
    let formattedValue = this.currencyPipe.transform(num.toFixed(2), symbol);
    formattedValue = formattedValue?.replace(symbol, '') ?? '';

    if (symbolPosition === 'before_price') {
      return `${symbol}${formattedValue}`;
    } else {
      return `${formattedValue}${symbol}`;
    }
  }
}
