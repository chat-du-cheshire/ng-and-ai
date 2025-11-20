import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { ShowModel } from '../shared/show-model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShowsLoader {
  #http = inject(HttpClient);

  loadAll() {
    return this.#http.get<ShowModel[]>(`${environment.BACKEND_URL}/shows`);
  }

  loadById(id: string) {
    return this.#http.get<ShowModel>(`${environment.BACKEND_URL}/shows/${id}`);
  }

  add(show: Omit<ShowModel, 'id'>) {
    return this.#http.post(`${environment.BACKEND_URL}/shows`, show);
  }

  loadGenres() {
    return this.loadAll().pipe(
      map((shows) =>
        shows.reduce<Record<string, number>>((result, show) => {
          for (const genre of show.genres) {
            result[genre] = (result[genre] ?? 0) + 1;
          }
          return result;
        }, {}),
      ),
    );
  }
}
