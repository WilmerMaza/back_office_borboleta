import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Observable, of } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Country } from "../interface/country.interface";

@Injectable({
  providedIn: "root",
})
export class CountryService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${environment.URL}/country.json`);
  }
}
