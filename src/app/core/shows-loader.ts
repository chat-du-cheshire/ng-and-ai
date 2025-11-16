import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

import { ShowModel } from './show-model';

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
}
